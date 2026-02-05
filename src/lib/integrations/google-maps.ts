interface GoogleMapsSearchParams {
  query: string;
  location?: {
    lat: number;
    lng: number;
  };
  radius?: number;
  type?: string;
  pageToken?: string;
}

interface GoogleMapsPlace {
  placeId: string;
  name: string;
  address: string;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
  openingHours?: {
    openNow: boolean;
    weekdayText: string[];
  };
}

interface GoogleMapsSearchResponse {
  places: GoogleMapsPlace[];
  nextPageToken?: string;
}

export class GoogleMapsClient {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchPlaces(params: GoogleMapsSearchParams): Promise<GoogleMapsSearchResponse> {
    const searchParams = new URLSearchParams({
      query: params.query,
      key: this.apiKey,
    });

    if (params.location) {
      searchParams.append('location', `${params.location.lat},${params.location.lng}`);
    }

    if (params.radius) {
      searchParams.append('radius', params.radius.toString());
    }

    if (params.type) {
      searchParams.append('type', params.type);
    }

    if (params.pageToken) {
      searchParams.append('pagetoken', params.pageToken);
    }

    const response = await fetch(
      `${this.baseUrl}/textsearch/json?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Google Maps API request failed');
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(data.error_message || `Google Maps API error: ${data.status}`);
    }

    const places = await Promise.all(
      (data.results || []).map(async (place: Record<string, unknown>) => {
        const details = await this.getPlaceDetails(place.place_id as string);
        return details;
      })
    );

    return {
      places: places.filter((p): p is GoogleMapsPlace => p !== null),
      nextPageToken: data.next_page_token,
    };
  }

  async getPlaceDetails(placeId: string): Promise<GoogleMapsPlace | null> {
    const searchParams = new URLSearchParams({
      place_id: placeId,
      fields: 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types,geometry,opening_hours',
      key: this.apiKey,
    });

    const response = await fetch(
      `${this.baseUrl}/details/json?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Google Maps API request failed');
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      if (data.status === 'NOT_FOUND') {
        return null;
      }
      throw new Error(data.error_message || `Google Maps API error: ${data.status}`);
    }

    const place = data.result;

    return {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phoneNumber: place.formatted_phone_number,
      website: place.website,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      types: place.types || [],
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      openingHours: place.opening_hours
        ? {
            openNow: place.opening_hours.open_now,
            weekdayText: place.opening_hours.weekday_text || [],
          }
        : undefined,
    };
  }

  async geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    const searchParams = new URLSearchParams({
      address,
      key: this.apiKey,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Google Maps Geocoding API request failed');
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      if (data.status === 'ZERO_RESULTS') {
        return null;
      }
      throw new Error(data.error_message || `Geocoding API error: ${data.status}`);
    }

    const location = data.results[0]?.geometry?.location;

    if (!location) {
      return null;
    }

    return {
      lat: location.lat,
      lng: location.lng,
    };
  }
}

export function createGoogleMapsClient(): GoogleMapsClient | null {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new GoogleMapsClient(apiKey);
}

export function placeToLead(place: GoogleMapsPlace) {
  const domain = place.website
    ? new URL(place.website).hostname.replace('www.', '')
    : null;

  return {
    companyName: place.name,
    companyDomain: domain,
    companyAddress: place.address,
    companyPhone: place.phoneNumber,
    companyWebsite: place.website,
    source: 'google_maps',
    sourceId: place.placeId,
    customFields: {
      googleRating: place.rating,
      googleReviewCount: place.userRatingsTotal,
      googleTypes: place.types,
      googleLocation: place.location,
    },
  };
}
