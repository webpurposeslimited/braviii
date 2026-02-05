import { decrypt } from '../encryption';

interface ApolloSearchParams {
  query?: string;
  personTitles?: string[];
  personLocations?: string[];
  organizationDomains?: string[];
  organizationLocations?: string[];
  organizationNumEmployeesRanges?: string[];
  page?: number;
  perPage?: number;
}

interface ApolloLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  linkedinUrl?: string;
  organization?: {
    id: string;
    name: string;
    domain: string;
    industry: string;
    employeeCount: number;
    linkedinUrl?: string;
  };
  city?: string;
  state?: string;
  country?: string;
}

interface ApolloSearchResponse {
  people: ApolloLead[];
  pagination: {
    page: number;
    perPage: number;
    totalEntries: number;
    totalPages: number;
  };
}

export class ApolloClient {
  private apiKey: string;
  private baseUrl = 'https://api.apollo.io/v1';

  constructor(encryptedApiKey: string) {
    this.apiKey = decrypt(encryptedApiKey);
  }

  async searchPeople(params: ApolloSearchParams): Promise<ApolloSearchResponse> {
    const response = await fetch(`${this.baseUrl}/mixed_people/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': this.apiKey,
      },
      body: JSON.stringify({
        q_keywords: params.query,
        person_titles: params.personTitles,
        person_locations: params.personLocations,
        organization_domains: params.organizationDomains,
        organization_locations: params.organizationLocations,
        organization_num_employees_ranges: params.organizationNumEmployeesRanges,
        page: params.page || 1,
        per_page: params.perPage || 25,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Apollo API request failed');
    }

    const data = await response.json();

    return {
      people: data.people.map((person: Record<string, unknown>) => ({
        id: person.id,
        firstName: person.first_name,
        lastName: person.last_name,
        email: person.email,
        title: person.title,
        linkedinUrl: person.linkedin_url,
        organization: person.organization
          ? {
              id: (person.organization as Record<string, unknown>).id,
              name: (person.organization as Record<string, unknown>).name,
              domain: (person.organization as Record<string, unknown>).primary_domain,
              industry: (person.organization as Record<string, unknown>).industry,
              employeeCount: (person.organization as Record<string, unknown>).estimated_num_employees,
              linkedinUrl: (person.organization as Record<string, unknown>).linkedin_url,
            }
          : undefined,
        city: person.city,
        state: person.state,
        country: person.country,
      })),
      pagination: {
        page: data.pagination.page,
        perPage: data.pagination.per_page,
        totalEntries: data.pagination.total_entries,
        totalPages: data.pagination.total_pages,
      },
    };
  }

  async enrichPerson(email: string): Promise<ApolloLead | null> {
    const response = await fetch(`${this.baseUrl}/people/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': this.apiKey,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || 'Apollo API request failed');
    }

    const data = await response.json();
    const person = data.person;

    if (!person) return null;

    return {
      id: person.id,
      firstName: person.first_name,
      lastName: person.last_name,
      email: person.email,
      title: person.title,
      linkedinUrl: person.linkedin_url,
      organization: person.organization
        ? {
            id: person.organization.id,
            name: person.organization.name,
            domain: person.organization.primary_domain,
            industry: person.organization.industry,
            employeeCount: person.organization.estimated_num_employees,
            linkedinUrl: person.organization.linkedin_url,
          }
        : undefined,
      city: person.city,
      state: person.state,
      country: person.country,
    };
  }

  async enrichOrganization(domain: string): Promise<ApolloLead['organization'] | null> {
    const response = await fetch(`${this.baseUrl}/organizations/enrich`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || 'Apollo API request failed');
    }

    const data = await response.json();
    const org = data.organization;

    if (!org) return null;

    return {
      id: org.id,
      name: org.name,
      domain: org.primary_domain,
      industry: org.industry,
      employeeCount: org.estimated_num_employees,
      linkedinUrl: org.linkedin_url,
    };
  }
}

export async function createApolloClient(workspaceId: string): Promise<ApolloClient | null> {
  const { prisma } = await import('../prisma');
  
  const integration = await prisma.integration.findFirst({
    where: {
      workspaceId,
      type: 'APOLLO',
      isActive: true,
    },
  });

  if (!integration?.encryptedCredentials) {
    return null;
  }

  const credentials = JSON.parse(integration.encryptedCredentials);
  return new ApolloClient(credentials.apiKey);
}
