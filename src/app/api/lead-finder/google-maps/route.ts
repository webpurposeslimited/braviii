import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createGoogleMapsClient, placeToLead } from '@/lib/integrations/google-maps';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  location: z.string().optional(),
  radius: z.number().min(1000).max(50000).optional().default(10000),
  type: z.string().optional(),
  saveToWorkspace: z.boolean().optional().default(false),
  listId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = request.headers.get('x-workspace-id');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: session.user.id },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const validation = searchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { query, location, radius, type, saveToWorkspace, listId } = validation.data;

    const client = createGoogleMapsClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Google Maps API not configured. Please add GOOGLE_MAPS_API_KEY to environment variables.' },
        { status: 503 }
      );
    }

    // Geocode location if provided
    let locationCoords: { lat: number; lng: number } | undefined;
    if (location) {
      const coords = await client.geocode(location);
      if (coords) {
        locationCoords = coords;
      }
    }

    // Search for places
    const searchResult = await client.searchPlaces({
      query,
      location: locationCoords,
      radius,
      type,
    });

    const leads = searchResult.places.map(placeToLead);

    // Save to workspace if requested
    let savedCount = 0;
    if (saveToWorkspace && leads.length > 0) {
      for (const lead of leads) {
        try {
          // Check if company already exists
          let company = await prisma.company.findFirst({
            where: {
              workspaceId,
              OR: [
                { domain: lead.companyDomain || undefined },
                { name: lead.companyName },
              ],
            },
          });

          if (!company) {
            company = await prisma.company.create({
              data: {
                workspaceId,
                name: lead.companyName,
                domain: lead.companyDomain,
                website: lead.companyWebsite,
                location: lead.companyAddress,
                customData: lead.customFields,
              },
            });
          }

          // Create a lead entry for the company
          const existingLead = await prisma.lead.findFirst({
            where: {
              workspaceId,
              companyId: company.id,
              source: 'google_maps',
              sourceId: lead.sourceId,
            },
          });

          if (!existingLead) {
            const newLead = await prisma.lead.create({
              data: {
                workspaceId,
                companyId: company.id,
                source: lead.source,
                sourceId: lead.sourceId,
                phone: lead.companyPhone,
                location: lead.companyAddress,
                customData: lead.customFields,
                status: 'NEW',
              },
            });

            // Add to list if specified
            if (listId) {
              await prisma.listMember.create({
                data: {
                  listId,
                  leadId: newLead.id,
                },
              });
            }

            savedCount++;
          }
        } catch (error) {
          console.error('Error saving lead:', error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        places: searchResult.places,
        leads,
        totalFound: leads.length,
        savedCount,
        nextPageToken: searchResult.nextPageToken,
      },
    });
  } catch (error) {
    console.error('Google Maps search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
