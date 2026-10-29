import { mapApiClient, MapFeature, MapLayerItem, MapFeatureProperties } from './autohubMapClient';
import { MapPointType, MapReport } from '../types';
import { getGeorgiaRegionName } from './cameraService';

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
  'all': ['cameras', 'fuel', 'charging', 'services', 'car-wash', 'parts', 'showrooms'],
  'radar': ['cameras'],
  'fuel': ['fuel'],
  'charging': ['charging'],
  'service': ['services'],
  'car_wash': ['car-wash'],
  'parts': ['parts'],
  'showroom': ['showrooms'],
  'parking': [],
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
  
  let computedName = asText(p['name:ka']) || asText(p.name) || asText(p['brand:ka']) || asText(p.brand) || asText(p['operator:ka']) || asText(p.operator);
  if (!computedName) {
    if (layer === 'cameras') {
      computedName = p.enforcement === 'traffic_signals'
        ? 'შუქნიშნის კამერა'
        : p.enforcement === 'average_speed'
        ? 'საშუალო სიჩქარის რადარი'
        : speed ? `სიჩქარის რადარი · ${speed} კმ/სთ` : 'სიჩქარის რადარი';
    } else if (layer === 'fuel') {
      computedName = p.brand ? `${p.brand} • ავტოგასამართი` : 'ავტოგასამართი სადგური';
    } else if (layer === 'charging') {
      computedName = p.brand ? `${p.brand} • EV დამტენი` : 'ელექტრო-დამტენი სადგური';
    } else if (layer === 'services') {
      computedName = p.brand ? `${p.brand} • ავტოსერვისი` : 'ავტოსერვისი & ვულკანიზაცია';
    } else if (layer === 'car-wash') {
      computedName = p.brand ? `${p.brand} • სამრეცხაო` : 'ავტოსამრეცხაო';
    } else if (layer === 'parts') {
      computedName = p.brand ? `${p.brand} • ნაწილები` : 'ავტონაწილების მაღაზია';
    } else if (layer === 'parking' || layer === 'official-parking') {
      computedName = p.code ? `საპარკინგე ლოტი #${p.code}` : 'მუნიციპალური პარკინგი';
    } else if (layer === 'showrooms') {
      computedName = p.brand ? `${p.brand} • ავტოსალონი` : 'ავტოსალონი';
    } else {
      computedName = LAYER_DEFAULTS[layer] || 'საგზაო ობიექტი';
    }
  }

  const street = [p['addr:street'], p['addr:housenumber']].filter(Boolean).join(' ');
  const city = p['addr:city'] || '';
  const streetAddr = street ? (city ? `${city}, ${street}` : street) : null;

  return {
    ...feature,
    properties: {
      ...p,
      layer,
      name: computedName,
      address: asText(p.address) || streetAddr || null,
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

  const p = (feature.properties || {}) as any;
  const layer = p.layer || 'cameras';
  const pointType = LAYER_TO_POINT_TYPE[layer] || 'radar';
  const idStr = String(feature.id || `${layer}-${coords.lat.toFixed(5)}-${coords.lng.toFixed(5)}`);

  const speedKmh = p.speed_limit_kmh ? Number(p.speed_limit_kmh) : (p.maxspeed ? parseInt(String(p.maxspeed), 10) : null);
  const region = getGeorgiaRegionName(coords.lat, coords.lng);
  
  const rawBrand = p['brand:ka'] || p.brand || p['operator:ka'] || p.operator || '';
  const rawName = p['name:ka'] || p.name || p['name:en'] || '';
  
  let title = p.name || rawName;
  if (!title || title === 'ობიექტი') {
    if (pointType === 'radar') {
      title = p.camera_kind === 'traffic_signals'
        ? 'შუქნიშნის კამერა'
        : p.camera_kind === 'average_speed'
        ? 'საშუალო სიჩქარის რადარი (A ⇢ B)'
        : speedKmh ? `სიჩქარის რადარი · ${speedKmh} კმ/სთ` : 'სიჩქარის რადარი';
    } else if (pointType === 'fuel') {
      title = rawBrand ? `${rawBrand} • ავტოგასამართი` : 'ავტოგასამართი სადგური';
    } else if (pointType === 'charging') {
      title = rawBrand ? `${rawBrand} • EV დამტენი` : 'ელექტრო-დამტენი სადგური';
    } else if (pointType === 'service') {
      title = rawBrand ? `${rawBrand} • ავტოსერვისი` : 'ავტოსერვისი & ვულკანიზაცია';
    } else if (pointType === 'car_wash') {
      title = rawBrand ? `${rawBrand} • სამრეცხაო` : 'ავტოსამრეცხაო';
    } else if (pointType === 'parts') {
      title = rawBrand ? `${rawBrand} • ავტონაწილები` : 'ავტონაწილების მაღაზია';
    } else if (pointType === 'parking') {
      title = p.code ? `საპარკინგე ლოტი #${p.code}` : 'მუნიციპალური პარკინგი';
    } else if (pointType === 'showroom') {
      title = rawBrand ? `${rawBrand} • ავტოსალონი` : 'ავტოსალონი';
    } else {
      title = 'საგზაო ობიექტი';
    }
  }

  const street = [p['addr:street'], p['addr:housenumber']].filter(Boolean).join(' ');
  const city = p['addr:city'] || '';
  const formattedAddress = p.address || (street ? (city ? `${city}, ${street}` : `${region}, ${street}`) : `${region} • საგზაო მონაკვეთი (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);

  let desc = p.description || p.code || '';
  if (!desc || desc === 'OSM-ის საზოგადოებრივი მონაცემი') {
    if (pointType === 'radar') {
      desc = p.camera_kind === 'traffic_signals'
        ? 'შუქნიშნის წითელზე გავლისა და ზოლის კონტროლის კამერა.'
        : p.camera_kind === 'average_speed'
        ? `სექციური სიჩქარის კონტროლის რადარი.${speedKmh ? ` ზღვრული სიჩქარე: ${speedKmh} კმ/სთ.` : ''}`
        : `სტაციონარული სიჩქარის რადარი.${speedKmh ? ` მაქსიმალური დაშვებული სიჩქარე: ${speedKmh} კმ/სთ.` : ''}`;
    } else if (pointType === 'fuel') {
      desc = rawBrand ? `${rawBrand}-ის ავტოგასამართი სადგური.` : 'ავტოგასამართი სადგური.';
    } else if (pointType === 'charging') {
      desc = 'ელექტრომობილის სწრაფი დამტენი სადგური.';
    } else if (pointType === 'service') {
      desc = 'ავტოსერვისი, სავალი ნაწილი, ზეთის შეცვლა და საბურავები.';
    } else if (pointType === 'car_wash') {
      desc = 'ავტომობილის რეცხვა და მოვლა.';
    } else if (pointType === 'parking') {
      desc = p.code ? `მუნიციპალური საპარკინგე ზონა #${p.code}. 15 წთ უფასო.` : 'ავტოსადგომი.';
    }
  }

  return {
    id: idStr,
    type: pointType,
    title,
    description: desc,
    lat: coords.lat,
    lng: coords.lng,
    timestamp: p.source_data_at ? new Date(p.source_data_at).getTime() : Date.now(),
    confirmations: 1,
    active: true,
    brand: p.brand || rawBrand || undefined,
    phone: p.phone || p['contact:phone'] || undefined,
    address: formattedAddress,
    website: p.website || p['contact:website'] || undefined,
    opening_hours: p.opening_hours || undefined,
    speedLimit: speedKmh ? `${speedKmh} კმ/სთ` : undefined,
    speed_limit_kmh: speedKmh,
    cameraKind: p.camera_kind === 'traffic_signals'
      ? 'შუქნიშნის კამერა'
      : p.camera_kind === 'average_speed'
      ? 'საშუალო სიჩქარის რადარი (A ⇢ B)'
      : speedKmh ? `სიჩქარის რადარი · ${speedKmh} კმ/სთ` : 'სიჩქარის რადარი',
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

      // Filter by bbox with fallback if bbox is zero or uninitialized
      if (params.bbox && !isNaN(params.bbox[0]) && params.bbox[0] !== params.bbox[2]) {
        const box = params.bbox;
        const inBoxFeatures = matched.filter(f => inBox(f, box));
        if (inBoxFeatures.length > 0) {
          matched = inBoxFeatures;
        }
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
