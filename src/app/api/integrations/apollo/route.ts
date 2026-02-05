import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { z } from 'zod';

const searchPeopleSchema = z.object({
  query: z.string().optional(),
  personTitles: z.array(z.string()).optional(),
  personLocations: z.array(z.string()).optional(),
  organizationDomains: z.array(z.string()).optional(),
  organizationLocations: z.array(z.string()).optional(),
  organizationNumEmployeesRanges: z.array(z.string()).optional(),
  page: z.number().optional().default(1),
  perPage: z.number().optional().default(25),
});

const enrichPersonSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organizationName: z.string().optional(),
  domain: z.string().optional(),
});

const connectSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
});

async function getApolloCredentials(workspaceId: string): Promise<string | null> {
  const integration = await prisma.integration.findUnique({
    where: {
      workspaceId_type: { workspaceId, type: 'APOLLO' },
    },
  });

  if (!integration?.credentials) {
    return null;
  }

  try {
    return decrypt(integration.credentials);
  } catch {
    return null;
  }
}

async function apolloRequest(
  endpoint: string,
  apiKey: string,
  method: 'GET' | 'POST' = 'POST',
  body?: Record<string, unknown>
) {
  const url = `https://api.apollo.io/v1/${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      ...body,
      api_key: apiKey,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Apollo API error: ${response.status}`);
  }

  return response.json();
}

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
    const { action, ...params } = body;

    switch (action) {
      case 'connect': {
        const validation = connectSchema.safeParse(params);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Validation failed', details: validation.error.flatten() },
            { status: 400 }
          );
        }

        const { apiKey } = validation.data;

        // Verify API key works
        try {
          await apolloRequest('auth/health', apiKey, 'GET');
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid Apollo API key' },
            { status: 400 }
          );
        }

        // Store encrypted credentials
        const encryptedKey = encrypt(apiKey);

        await prisma.integration.upsert({
          where: {
            workspaceId_type: { workspaceId, type: 'APOLLO' },
          },
          update: {
            credentials: encryptedKey,
            status: 'ACTIVE',
            lastSyncAt: new Date(),
          },
          create: {
            workspaceId,
            type: 'APOLLO',
            name: 'Apollo.io',
            credentials: encryptedKey,
            status: 'ACTIVE',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Apollo integration connected successfully',
        });
      }

      case 'disconnect': {
        await prisma.integration.update({
          where: {
            workspaceId_type: { workspaceId, type: 'APOLLO' },
          },
          data: {
            status: 'INACTIVE',
            credentials: null,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Apollo integration disconnected',
        });
      }

      case 'search_people': {
        const apiKey = await getApolloCredentials(workspaceId);
        if (!apiKey) {
          return NextResponse.json(
            { error: 'Apollo integration not connected' },
            { status: 400 }
          );
        }

        const validation = searchPeopleSchema.safeParse(params);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Validation failed', details: validation.error.flatten() },
            { status: 400 }
          );
        }

        const { 
          query, 
          personTitles, 
          personLocations, 
          organizationDomains,
          organizationLocations,
          organizationNumEmployeesRanges,
          page, 
          perPage 
        } = validation.data;

        const searchParams: Record<string, unknown> = {
          page,
          per_page: perPage,
        };

        if (query) searchParams.q_keywords = query;
        if (personTitles?.length) searchParams.person_titles = personTitles;
        if (personLocations?.length) searchParams.person_locations = personLocations;
        if (organizationDomains?.length) searchParams.q_organization_domains = organizationDomains;
        if (organizationLocations?.length) searchParams.organization_locations = organizationLocations;
        if (organizationNumEmployeesRanges?.length) {
          searchParams.organization_num_employees_ranges = organizationNumEmployeesRanges;
        }

        const result = await apolloRequest('mixed_people/search', apiKey, 'POST', searchParams);

        return NextResponse.json({
          success: true,
          data: {
            people: result.people || [],
            pagination: {
              page: result.page,
              perPage: result.per_page,
              totalEntries: result.pagination?.total_entries || 0,
              totalPages: result.pagination?.total_pages || 0,
            },
          },
        });
      }

      case 'enrich_person': {
        const apiKey = await getApolloCredentials(workspaceId);
        if (!apiKey) {
          return NextResponse.json(
            { error: 'Apollo integration not connected' },
            { status: 400 }
          );
        }

        const validation = enrichPersonSchema.safeParse(params);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Validation failed', details: validation.error.flatten() },
            { status: 400 }
          );
        }

        const { email, firstName, lastName, organizationName, domain } = validation.data;

        const enrichParams: Record<string, unknown> = {};
        if (email) enrichParams.email = email;
        if (firstName) enrichParams.first_name = firstName;
        if (lastName) enrichParams.last_name = lastName;
        if (organizationName) enrichParams.organization_name = organizationName;
        if (domain) enrichParams.domain = domain;

        const result = await apolloRequest('people/match', apiKey, 'POST', enrichParams);

        if (!result.person) {
          return NextResponse.json({
            success: true,
            data: null,
            message: 'No matching person found',
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            person: {
              id: result.person.id,
              firstName: result.person.first_name,
              lastName: result.person.last_name,
              name: result.person.name,
              email: result.person.email,
              linkedinUrl: result.person.linkedin_url,
              title: result.person.title,
              city: result.person.city,
              state: result.person.state,
              country: result.person.country,
              organization: result.person.organization ? {
                id: result.person.organization.id,
                name: result.person.organization.name,
                domain: result.person.organization.primary_domain,
                industry: result.person.organization.industry,
                estimatedNumEmployees: result.person.organization.estimated_num_employees,
              } : null,
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Apollo API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const integration = await prisma.integration.findUnique({
      where: {
        workspaceId_type: { workspaceId, type: 'APOLLO' },
      },
      select: {
        id: true,
        status: true,
        lastSyncAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        connected: integration?.status === 'ACTIVE',
        lastSyncAt: integration?.lastSyncAt,
        createdAt: integration?.createdAt,
      },
    });
  } catch (error) {
    console.error('Apollo status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
