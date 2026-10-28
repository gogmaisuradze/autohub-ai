/**
 * AutoHub Standalone Map Client
 * UI-independent client for the AutoHub Geographic POI and Layers Backend.
 */

export interface MapLayerItem {
  id: string;
  label: string;
  count: number;
  source?: string;
  source_data_at?: string;
  generated_at?: string;
  license?: string | null;
  attribution: string;
}

export interface MapLayersResponse {
  version: string;
  source_data_at: string;
  layers: MapLayerItem[];
}

export interface MapFeatureProperties {
  layer: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  opening_hours?: string | null;
  speed_limit_kmh?: number | null;
  camera_kind?: 'speed_camera' | 'traffic_signals' | 'average_speed' | null;
  code?: string | null;
  source_data_at?: string | null;
  live: boolean;
  distance_m?: number;
  brand?: string;
  [key: string]: any;
}

export interface MapFeature {
  type: 'Feature';
  id?: string | number;
  geometry: {
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
  properties: MapFeatureProperties;
}

export interface MapPoiResponse {
  type: 'FeatureCollection';
  features: MapFeature[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    next_offset: number | null;
    sources: Array<{ layer: string; attribution: string; [key: string]: any }>;
    warnings?: string[];
  };
}

export interface MapPoiOptions {
  layers: string[];
  bbox?: [number, number, number, number]; // [west, south, east, north]
  lat?: number;
  lng?: number;
  radius_m?: number;
  q?: string;
  limit?: number;
  offset?: number;
}

export class AutoHubMapClient {
  constructor(private baseUrl: string = '') {}

  private async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const base = this.baseUrl ? this.baseUrl.replace(/\/$/, '') : '';
    const url = `${base}${path}`;
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`AutoHub Map API ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async health(signal?: AbortSignal): Promise<{ status: string; layers: number }> {
    return this.get('/health', signal);
  }

  async layers(signal?: AbortSignal): Promise<MapLayersResponse> {
    return this.get('/api/v1/layers', signal);
  }

  async pois(options: MapPoiOptions, signal?: AbortSignal): Promise<MapPoiResponse> {
    const params = new URLSearchParams({ layers: options.layers.join(',') });
    if (options.bbox) {
      params.set('bbox', options.bbox.join(','));
    }
    if (options.lat !== undefined && options.lng !== undefined) {
      params.set('lat', String(options.lat));
      params.set('lng', String(options.lng));
    }
    if (options.radius_m !== undefined) {
      params.set('radius_m', String(options.radius_m));
    }
    if (options.q && options.q.trim()) {
      params.set('q', options.q.trim());
    }
    if (options.limit !== undefined) {
      params.set('limit', String(options.limit));
    }
    if (options.offset !== undefined) {
      params.set('offset', String(options.offset));
    }
    return this.get(`/api/v1/pois?${params.toString()}`, signal);
  }
}

// In development, the Vite proxy handles /api/v1 and /health forwarding to http://127.0.0.1:8787.
// In production or remote setups, VITE_MAP_API_URL can specify the standalone backend URL.
const defaultApiUrl = (import.meta as any).env?.VITE_MAP_API_URL || '';
export const mapApiClient = new AutoHubMapClient(defaultApiUrl);
