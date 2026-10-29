import { MapReport } from '../types';

export function getGeorgiaRegionName(lat: number, lng: number): string {
  // Tbilisi & surrounding
  if (lat >= 41.62 && lat <= 41.85 && lng >= 44.66 && lng <= 44.98) return 'თბილისი';
  // Batumi & Adjara coast
  if (lat >= 41.55 && lat <= 41.72 && lng >= 41.55 && lng <= 41.75) return 'ბათუმი';
  // Kutaisi
  if (lat >= 42.18 && lat <= 42.33 && lng >= 42.60 && lng <= 42.78) return 'ქუთაისი';
  // Rustavi
  if (lat >= 41.48 && lat <= 41.62 && lng >= 44.93 && lng <= 45.08) return 'რუსთავი';
  // Gori
  if (lat >= 41.92 && lat <= 42.06 && lng >= 44.04 && lng <= 44.18) return 'გორი';
  // Mtskheta
  if (lat >= 41.80 && lat <= 41.90 && lng >= 44.66 && lng <= 44.78) return 'მცხეთა';
  // Telavi / Kakheti
  if (lat >= 41.86 && lat <= 41.96 && lng >= 45.42 && lng <= 45.54) return 'თელავი';
  // Khashuri
  if (lat >= 41.95 && lat <= 42.05 && lng >= 43.54 && lng <= 43.66) return 'ხაშური';
  // Kobuleti
  if (lat >= 41.75 && lat <= 41.88 && lng >= 41.72 && lng <= 41.83) return 'ქობულეთი';
  // Poti
  if (lat >= 42.09 && lat <= 42.21 && lng >= 41.62 && lng <= 41.75) return 'ფოთი';
  // Zugdidi
  if (lat >= 42.46 && lat <= 42.57 && lng >= 41.82 && lng <= 41.94) return 'ზუგდიდი';
  // Samtredia
  if (lat >= 42.11 && lat <= 42.21 && lng >= 42.28 && lng <= 42.40) return 'სამტრედია';
  // Zestafoni
  if (lat >= 42.06 && lat <= 42.15 && lng >= 42.99 && lng <= 43.10) return 'ზესტაფონი';
  // Borjomi
  if (lat >= 41.78 && lat <= 41.89 && lng >= 43.32 && lng <= 43.45) return 'ბორჯომი';
  // Regional corridors
  if (lat >= 41.95 && lat <= 42.15 && lng >= 43.0 && lng <= 44.5) return 'შიდა ქართლი • E60 ავტომაგისტრალი';
  if (lng < 42.5) return 'დასავლეთ საქართველო';
  if (lng > 45.0) return 'კახეთის რეგიონი';
  return 'საქართველო';
}

export async function loadCameras(): Promise<{reports: MapReport[]; updatedAt: string}> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/cameras.geojson`, {cache: 'no-cache', signal: AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error('კამერების მონაცემები ჯერ მიუწვდომელია');
  const data = await response.json();
  if (data.type !== 'FeatureCollection' || !Array.isArray(data.features) || !Number.isFinite(Date.parse(data.updated_at))) throw new Error('კამერების ფაილი არასწორია');
  const snapshotAt = data.source_data_at && Number.isFinite(Date.parse(data.source_data_at)) ? data.source_data_at : data.updated_at;
  const seen = new Set<number>();
  const reports: MapReport[] = [];
  for (const feature of data.features) {
    const props = feature.properties || {};
    const coords = feature.geometry?.coordinates;
    if (feature.geometry?.type !== 'Point' || !Array.isArray(coords) || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1]) || Math.abs(coords[0]) > 180 || Math.abs(coords[1]) > 90) continue;
    if (!Number.isSafeInteger(props.osm_id) || props.osm_id <= 0 || seen.has(props.osm_id)) continue;
    if (props.highway !== 'speed_camera' && !['maxspeed', 'average_speed', 'traffic_signals'].includes(props.enforcement)) continue;
    seen.add(props.osm_id);

    const speedKmh = props.maxspeed ? parseInt(String(props.maxspeed), 10) : null;
    const isSpeedValid = typeof speedKmh === 'number' && Number.isFinite(speedKmh) && speedKmh > 0;
    const speedLimitNum = isSpeedValid ? speedKmh : null;

    let kind = 'სიჩქარის რადარი';
    let cameraKind = 'speed_camera';
    if (props.enforcement === 'traffic_signals') {
      kind = 'შუქნიშნის კამერა';
      cameraKind = 'traffic_signals';
    } else if (props.enforcement === 'average_speed') {
      kind = 'საშუალო სიჩქარის რადარი (A ⇢ B)';
      cameraKind = 'average_speed';
    } else if (speedLimitNum) {
      kind = `სიჩქარის რადარი · ${speedLimitNum} კმ/სთ`;
    }

    const region = getGeorgiaRegionName(coords[1], coords[0]);
    const street = props['addr:street'] || props['name:ka'] || props.name || '';
    const address = street
      ? `${region}, ${street}`
      : (speedLimitNum && speedLimitNum >= 90
          ? `${region} • ცენტრალური ჩქაროსნული ავტომაგისტრალი`
          : `${region} • საგზაო მონაკვეთი (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`);

    const desc = props.enforcement === 'traffic_signals'
      ? 'შუქნიშნის წითელზე გავლისა და ზოლის დამრღვევი ვიდეოკონტროლის კამერა.'
      : props.enforcement === 'average_speed'
      ? `სექციური სიჩქარის კონტროლის რადარი.${speedLimitNum ? ` ზღვრული სიჩქარე: ${speedLimitNum} კმ/სთ.` : ''}`
      : `სტაციონარული სიჩქარის რადარი.${speedLimitNum ? ` მაქსიმალური დაშვებული სიჩქარე: ${speedLimitNum} კმ/სთ.` : ''} აკონტროლებს მოძრაობის სიჩქარეს.`;

    reports.push({
      id: `osm-camera-${props.osm_id}`,
      type: 'radar',
      title: kind,
      description: desc,
      address,
      lat: coords[1],
      lng: coords[0],
      timestamp: Date.parse(snapshotAt),
      confirmations: 0,
      active: true,
      cameraSource: 'OpenStreetMap',
      cameraUpdatedAt: snapshotAt,
      cameraKind: kind,
      camera_kind: cameraKind,
      osmId: props.osm_id,
      speed_limit_kmh: speedLimitNum,
      speedLimit: speedLimitNum ? `${speedLimitNum} კმ/სთ` : undefined
    });
  }
  return {reports, updatedAt: snapshotAt};
}
