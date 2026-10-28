import { MapReport } from '../types';

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
    const kind = props.enforcement === 'traffic_signals' ? 'შუქნიშნის კონტროლის კამერა' : props.enforcement === 'average_speed' ? 'საშუალო სიჩქარის კონტროლის კამერა' : 'სიჩქარის რადარი';
    reports.push({id: `osm-camera-${props.osm_id}`, type:'radar', title:kind,
      description: typeof props['name:ka'] === 'string' ? props['name:ka'] : typeof props.name === 'string' ? props.name : 'OSM-ის საზოგადოებრივი მონაცემი',
      lat:coords[1], lng:coords[0], timestamp:Date.parse(snapshotAt), confirmations:0, active:true,
      cameraSource:'OpenStreetMap', cameraUpdatedAt:snapshotAt, cameraKind:kind, osmId:props.osm_id,
      speedLimit:typeof props.maxspeed === 'string' ? props.maxspeed : undefined});
  }
  return {reports, updatedAt:snapshotAt};
}
