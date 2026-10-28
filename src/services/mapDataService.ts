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

const LAYER_DEFAULTS: Record<string, string> = {
  cameras: 'კამერა / რადარი',
  parking: 'პარკინგი',
  fuel: 'ბენზინგასამართი',
  charging: 'დამტენი',
  services: 'ავტოსერვისი',
  'car-wash': 'ავტოსამრეცხაო',
  parts: 'ავტონაწილები',
  showrooms: 'ავტოსალონი',
  'official-parking': 'საპარკინგე ლოტი'
};

const asText = (v: any): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

function normalizeStaticFeature(feature: any, layer: string, meta: any): MapFeature {
  const p = feature.properties || {};
  const speed = p.maxspeed && /^\d+(\.\d+)?$/.test(p.maxspeed) ? Number(p.maxspeed) : null;
  return {
    ...feature,
    properties: {
      ...p,
      layer,
      name: asText(p['name:ka']) || asText(p.name) || asText(p.brand) || LAYER_DEFAULTS[layer] || 'ობიექტი',
      address: asText(p.address) || [p['addr:street'], p['addr:housenumber']].filter(Boolean).join(' ') || null,
      phone: asText(p['contact:phone']) || asText(p.phone) || null,
      website: asText(p['contact:website']) || asText(p.website) || null,
      opening_hours: asText(p.opening_hours) || null,
      speed_limit_kmh: speed,
      camera_kind:
        layer === 'cameras'
          ? p.enforcement === 'traffic_signals'
            ? 'traffic_signals'
            : p.enforcement === 'average_speed'
            ? 'average_speed'
            : 'speed_camera'
          : null,
      source_data_at: meta?.source_data_at || null,
      live: false
    }
  };
}

function featureCoordinates(feature: MapFeature): number[][] {
  const g = feature.geometry;
  if (!g) return [];
  if (g.type === 'Point' && Array.isArray(g.coordinates)) return [g.coordinates];
  if (g.type === 'Polygon' && Array.isArray(g.coordinates) && g.coordinates[0]) return g.coordinates[0];
  return [];
}

function inBox(feature: MapFeature, box: [number, number, number, number]): boolean {
  const coords = featureCoordinates(feature);
  if (!coords.length) return false;
  const xs = coords.map(c => c[0]);
  const ys = coords.map(c => c[1]);
  return (
    Math.max(...xs) >= box[0] &&
    Math.min(...xs) <= box[2] &&
    Math.max(...ys) >= box[1] &&
    Math.min(...ys) <= box[3]
  );
}

function featureCenter(feature: MapFeature): [number, number] | null {
  const coords = featureCoordinates(feature);
  if (!coords.length) return null;
  const lng = coords.reduce((s, p) => s + p[0], 0) / coords.length;
  const lat = coords.reduce((s, p) => s + p[1], 0) / coords.length;
  return [lng, lat];
}

function distanceMeters(a: [number, number], b: [number, number]): number {
  const rad = (x: number) => (x * Math.PI) / 180;
  const dlat = rad(b[1] - a[1]);
  const dlon = rad(b[0] - a[0]);
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dlon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// In-memory cache for static GeoJSON layers (client-side fallback for GitHub Pages / static hosting)
const staticLayerCache = new Map<string, MapFeature[]>();
let staticManifestCache: any = null;
let isBackendLive: boolean | null = null;

async function loadStaticLayer(layer: string, signal?: AbortSignal): Promise<MapFeature[]> {
  if (staticLayerCache.has(layer)) {
    return staticLayerCache.get(layer)!;
  }

  const baseUrl = import.meta.env.BASE_URL || '/';

  try {
    if (layer === 'official-parking') {
      const res = await fetch(`${baseUrl}data/autohub/tbilisi-parking.json`, { signal });
      if (!res.ok) return [];
      const registry = await res.json();
      const officialMeta = {
        source: registry.source,
        source_data_at: registry.retrievedAt,
        attribution: 'თბილისის მუნიციპალური პარკინგის მონაცემები'
      };
      const features: MapFeature[] = (registry.places || []).map((place: any) =>
        normalizeStaticFeature(
          {
            type: 'Feature',
            id: `municipal/${place.id}`,
            geometry: {
              type: 'Polygon',
              coordinates: [place.polygon.map(([lat, lon]: [number, number]) => [lon, lat])]
            },
            properties: {
              name: place.code,
              code: place.code,
              address: place.address,
              source: registry.source,
              tariff: null,
              payment_connected: false
            }
          },
          'official-parking',
          officialMeta
        )
      );
      staticLayerCache.set(layer, features);
      return features;
    } else {
      const res = await fetch(`${baseUrl}data/autohub/${layer}.geojson`, { signal });
      if (!res.ok) return [];
      const data = await res.json();
      const meta = {
        source: data.source,
        source_data_at: data.source_data_at,
        license: data.license,
        attribution: '© OpenStreetMap contributors'
      };
      const features: MapFeature[] = (data.features || []).map((f: any) =>
        normalizeStaticFeature(f, layer, meta)
      );
      staticLayerCache.set(layer, features);
      return features;
    }
  } catch (err) {
    console.warn(`Failed to load static layer ${layer}:`, err);
    return [];
  }
}

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
   * Checks if the standalone backend or static data is available and healthy.
   */
  async checkHealth(signal?: AbortSignal): Promise<boolean> {
    if (isBackendLive === true) return true;

    // 1. Try dynamic backend server first
    try {
      const res = await mapApiClient.health(signal);
      if (res?.status === 'ok') {
        isBackendLive = true;
        return true;
      }
    } catch {}

    // 2. Check static GeoJSON data files (for GitHub Pages / static hosting)
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const res = await fetch(`${baseUrl}data/autohub/manifest.json`, { signal });
      if (res.ok) {
        isBackendLive = false;
        return true;
      }
    } catch {}

    return false;
  },

  /**
   * Returns whether the map is currently using the live standalone server or static GeoJSON mode.
   */
  isStaticMode(): boolean {
    return isBackendLive === false;
  },

  /**
   * Fetches layer summary catalog (counts, dates, attributions).
   */
  async getLayersCatalog(signal?: AbortSignal): Promise<MapLayerItem[]> {
    if (isBackendLive !== false) {
      try {
        const res = await mapApiClient.layers(signal);
        if (res?.layers) {
          isBackendLive = true;
          return res.layers;
        }
      } catch {
        isBackendLive = false;
      }
    }

    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      if (!staticManifestCache) {
        const res = await fetch(`${baseUrl}data/autohub/manifest.json`, { signal });
        staticManifestCache = await res.json();
      }
      const manifest = staticManifestCache;
      const labels: Record<string, string> = {
        cameras: 'კამერები და რადარები',
        parking: 'პარკინგები (OSM)',
        fuel: 'ბენზინგასამართები',
        charging: 'ელექტროდამტენები',
        services: 'ავტოსერვისები და საბურავები',
        'car-wash': 'ავტოსამრეცხაოები',
        parts: 'ავტონაწილები',
        showrooms: 'ავტოსალონები',
        'official-parking': 'თბილისის ოფიციალური ლოტები'
      };
      const items: MapLayerItem[] = Object.keys(manifest.layers || {}).map((layerKey) => ({
        id: layerKey,
        label: labels[layerKey] || layerKey,
        count: manifest.layers[layerKey]?.count || 0,
        source: manifest.source,
        source_data_at: manifest.source_data_at,
        generated_at: manifest.generated_at,
        license: manifest.license,
        attribution: '© OpenStreetMap contributors'
      }));
      items.push({
        id: 'official-parking',
        label: labels['official-parking'],
        count: 2200,
        source: 'https://api.municipal.gov.ge/parking/places',
        source_data_at: '2026-10-28',
        attribution: 'თბილისის მუნიციპალური პარკინგის მონაცემები'
      });
      return items;
    } catch {
      return [];
    }
  },

  /**
   * Fetches POIs for the given filter, viewport bbox, or location.
   * Seamlessly falls back to static GeoJSON when standalone server is not reachable.
   */
  async fetchPois(params: FetchPoisParams): Promise<MapReport[]> {
    const filter = params.filterType || 'all';
    const layers = POINT_TYPE_TO_LAYERS[filter] || POINT_TYPE_TO_LAYERS['all'];
    if (!layers.length) return [];

    // 1. Try dynamic backend server if live or not yet tested
    if (isBackendLive !== false) {
      try {
        const res = await mapApiClient.pois({
          layers,
          bbox: params.bbox,
          lat: params.lat,
          lng: params.lng,
          radius_m: params.radius_m,
          q: params.q,
          limit: params.limit || 350
        }, params.signal);

        if (res?.features) {
          isBackendLive = true;
          const reports: MapReport[] = [];
          for (const feat of res.features) {
            const item = convertFeatureToMapReport(feat);
            if (item) reports.push(item);
          }
          return reports;
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') throw e;
        isBackendLive = false;
      }
    }

    // 2. Static Client-Side Fallback (for GitHub Pages and offline mode)
    try {
      const allFeatures: MapFeature[] = [];
      for (const layer of layers) {
        const layerFeats = await loadStaticLayer(layer, params.signal);
        allFeatures.push(...layerFeats);
      }

      const search = (params.q || '').trim().toLowerCase();
      let matched = allFeatures;

      // Filter by bbox
      if (params.bbox) {
        const box = params.bbox;
        matched = matched.filter(f => inBox(f, box));
      }

      // Filter by search query
      if (search) {
        matched = matched.filter(f => {
          const p = (f.properties || {}) as Record<string, any>;
          return [p.name, p.address, p.code, p.brand].some(
            v => typeof v === 'string' && v.toLowerCase().includes(search)
          );
        });
      }

      // Filter and sort by distance if lat/lng provided
      if (params.lat !== undefined && params.lng !== undefined) {
        const centerPoint: [number, number] = [params.lng, params.lat];
        const radius = params.radius_m || 50000;
        matched = matched
          .map(f => {
            const c = featureCenter(f);
            const dist = c ? distanceMeters(centerPoint, c) : Infinity;
            return { feature: f, dist };
          })
          .filter(item => item.dist <= radius)
          .sort((a, b) => a.dist - b.dist)
          .map(item => item.feature);
      }

      // Convert to MapReport schema and limit
      const limit = params.limit || 350;
      const reports: MapReport[] = [];
      for (let i = 0; i < matched.length && reports.length < limit; i++) {
        const rep = convertFeatureToMapReport(matched[i]);
        if (rep) reports.push(rep);
      }

      return reports;
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
      console.warn('Static map data loading error:', e);
      return [];
    }
  }
};
