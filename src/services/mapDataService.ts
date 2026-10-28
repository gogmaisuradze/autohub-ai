import { mapApiClient, MapFeature, MapLayerItem, MapFeatureProperties } from './autohubMapClient';
import { MapPointType, MapReport } from '../types';

export const LAYER_TO_POINT_TYPE: Record<string, MapPointType> = {
  'cameras': 'radar',
  'fuel': 'fuel',
  'charging': 'charging',
  'services': 'service',
  'car-wash': 'car_wash',
  'parts': 'parts',
  'showrooms': 'showroom',
  'parking': 'parking',
  'official-parking': 'parking'
};

export const POINT_TYPE_TO_LAYERS: Record<string, string[]> = {
  'all': ['cameras', 'fuel', 'charging', 'services', 'car-wash', 'parts', 'showrooms', 'parking', 'official-parking'],
  'radar': ['cameras'],
  'fuel': ['fuel'],
  'charging': ['charging'],
  'service': ['services'],
  'car_wash': ['car-wash'],
  'parts': ['parts'],
  'showroom': ['showrooms'],
  'parking': ['parking', 'official-parking'],
  'patrol': [], // Community only (n8n)
  'hazard': []  // Community only (n8n)
};

/**
 * Extracts representative center coordinates [lat, lng] from Point or Polygon geometry.
 */
export function getFeatureCoordinates(feature: MapFeature): { lat: number; lng: number } | null {
  const g = feature.geometry;
  if (!g) return null;

  if (g.type === 'Point' && Array.isArray(g.coordinates) && g.coordinates.length >= 2) {
    const [lng, lat] = g.coordinates;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  if (g.type === 'Polygon' && Array.isArray(g.coordinates) && g.coordinates[0]?.length) {
    const ring = g.coordinates[0];
    let sumLng = 0;
    let sumLat = 0;
    for (const [lng, lat] of ring) {
      sumLng += lng;
      sumLat += lat;
    }
    return {
      lat: sumLat / ring.length,
      lng: sumLng / ring.length
    };
  }

  return null;
}

/**
 * Converts a backend GeoJSON feature to the application's MapReport schema.
 */
export function convertFeatureToMapReport(feature: MapFeature): MapReport | null {
  const coords = getFeatureCoordinates(feature);
  if (!coords) return null;

  const p = (feature.properties || {}) as Partial<MapFeatureProperties>;
  const layer = p.layer || 'cameras';
  const pointType = LAYER_TO_POINT_TYPE[layer] || 'radar';
  const idStr = String(feature.id || `${layer}-${coords.lat.toFixed(5)}-${coords.lng.toFixed(5)}`);

  return {
    id: idStr,
    type: pointType,
    title: p.name || 'ობიექტი',
    description: p.address || p.code || undefined,
    lat: coords.lat,
    lng: coords.lng,
    timestamp: p.source_data_at ? new Date(p.source_data_at).getTime() : Date.now(),
    confirmations: 1,
    active: true,
    brand: p.brand || undefined,
    phone: p.phone || undefined,
    address: p.address || undefined,
    website: p.website || undefined,
    opening_hours: p.opening_hours || undefined,
    speedLimit: p.speed_limit_kmh ? `${p.speed_limit_kmh} კმ/სთ` : undefined,
    speed_limit_kmh: p.speed_limit_kmh ?? null,
    cameraKind: p.camera_kind === 'traffic_signals'
      ? 'შუქნიშნის კამერა'
      : p.camera_kind === 'average_speed'
      ? 'საშუალო სიჩქარის რადარი'
      : p.camera_kind === 'speed_camera'
      ? 'სიჩქარის რადარი'
      : undefined,
    camera_kind: p.camera_kind ?? null,
    code: p.code || undefined,
    layer,
    cameraSource: p.source || 'OpenStreetMap',
    cameraUpdatedAt: p.source_data_at || undefined,
    osmId: typeof feature.id === 'string' && feature.id.startsWith('node/')
      ? parseInt(feature.id.replace('node/', ''), 10)
      : undefined
  };
}

export interface FetchPoisParams {
  filterType?: MapPointType | 'all';
  bbox?: [number, number, number, number]; // [west, south, east, north]
  lat?: number;
  lng?: number;
  radius_m?: number;
  q?: string;
  limit?: number;
  signal?: AbortSignal;
}

export const mapDataService = {
  /**
   * Checks if the standalone backend is running and healthy.
   */
  async checkHealth(signal?: AbortSignal): Promise<boolean> {
    try {
      const res = await mapApiClient.health(signal);
      return res?.status === 'ok';
    } catch {
      return false;
    }
  },

  /**
   * Fetches layer summary catalog (counts, dates, attributions).
   */
  async getLayersCatalog(signal?: AbortSignal): Promise<MapLayerItem[]> {
    try {
      const res = await mapApiClient.layers(signal);
      return res.layers || [];
    } catch (e) {
      console.warn('Map API layers catalog unavailable:', e);
      return [];
    }
  },

  /**
   * Fetches POIs for the given filter, viewport bbox, or location.
   */
  async fetchPois(params: FetchPoisParams): Promise<MapReport[]> {
    const filter = params.filterType || 'all';
    const layers = POINT_TYPE_TO_LAYERS[filter] || POINT_TYPE_TO_LAYERS['all'];
    if (!layers.length) return [];

    try {
      const res = await mapApiClient.pois({
        layers,
        bbox: params.bbox,
        lat: params.lat,
        lng: params.lng,
        radius_m: params.radius_m,
        q: params.q,
        limit: params.limit || 250
      }, params.signal);

      if (!res?.features) return [];

      const reports: MapReport[] = [];
      for (const feat of res.features) {
        const item = convertFeatureToMapReport(feat);
        if (item) reports.push(item);
      }
      return reports;
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
      console.warn('Map API pois request failed:', e);
      return [];
    }
  }
};
