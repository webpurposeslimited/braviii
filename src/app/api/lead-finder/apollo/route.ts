import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const searchSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  page: z.number().optional().default(1),
  perPage: z.number().optional().default(25),
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
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const validation = searchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 });
    }

    const { title, company, location, page, perPage } = validation.data;

    // Try to get Apollo API key from Integration table or SystemSetting
    let apolloApiKey: string | null = null;

    const integration = await prisma.integration.findFirst({
      where: { workspaceId, type: 'APOLLO', status: 'ACTIVE' },
    });

    if (integration?.credentials) {
      try {
        const creds = JSON.parse(integration.credentials);
        apolloApiKey = creds.apiKey;
      } catch {}
    }

    if (!apolloApiKey) {
      // Fallback: check SystemSetting
      try {
        const setting = await (prisma as any).systemSetting?.findUnique?.({
          where: { key: 'apollo_api_key' },
        });
        if (setting?.value) apolloApiKey = setting.value;
      } catch {}
    }

    if (!apolloApiKey) {
      return NextResponse.json(
        { error: 'Apollo API key not configured. Please set it in Admin Settings or workspace integrations.' },
        { status: 503 }
      );
    }

    const apolloBody: Record<string, unknown> = {
      page,
      per_page: perPage,
    };
    if (title) apolloBody.person_titles = [title];
    if (company) apolloBody.organization_domains = [company];
    if (location) apolloBody.person_locations = [location];

    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apolloApiKey,
      },
      body: JSON.stringify(apolloBody),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as any).message || `Apollo API error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const leads = (data.people || []).map((p: any) => ({
      name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      email: p.email || null,
      phone: p.phone_number || null,
      company: p.organization?.name || null,
      title: p.title || null,
      location: [p.city, p.state, p.country].filter(Boolean).join(', ') || null,
      source: 'apollo',
    }));

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: data.pagination ? {
        page: data.pagination.page,
        total: data.pagination.total_entries,
      } : undefined,
    });
  } catch (error) {
    console.error('Apollo search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Apollo search failed' },
      { status: 500 }
    );
  }
}
