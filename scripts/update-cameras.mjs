import { mkdir, writeFile, rename, readFile } from 'node:fs/promises';
export const query = `[out:json][timeout:90];area["ISO3166-1"="GE"]["boundary"="administrative"]["admin_level"="2"]->.ge;(node["highway"="speed_camera"](area.ge);node["enforcement"~"^(maxspeed|average_speed|traffic_signals)$"](area.ge);relation["type"="enforcement"]["enforcement"~"^(maxspeed|average_speed|traffic_signals)$"](area.ge););out body;>;out skel qt;`;
export function convert(data) {
  if (!Array.isArray(data.elements) || data.remark) throw Error(data.remark || 'Invalid Overpass response');
  const nodes = new Map(data.elements.filter(e => e.type === 'node').map(e => [e.id, e]));
  const cameras = new Map();
  const add = (node, tags = {}) => {
    if (!Number.isFinite(node?.lat) || !Number.isFinite(node?.lon)) return;
    const props = {...node.tags, ...tags};
    cameras.set(node.id, {type:'Feature', id:`node/${node.id}`, geometry:{type:'Point', coordinates:[node.lon,node.lat]}, properties:{...props, osm_id:node.id, source:'OpenStreetMap', osm_url:`https://www.openstreetmap.org/node/${node.id}`}});
  };
  for (const e of data.elements) if(e.type === 'node' && (e.tags?.highway === 'speed_camera' || /^(maxspeed|average_speed|traffic_signals)$/.test(e.tags?.enforcement))) add(e);
  for (const e of data.elements) if(e.type === 'relation') for(const member of e.members || []) if(member.type === 'node' && member.role === 'device') add(nodes.get(member.ref), e.tags);
  return {type:'FeatureCollection', updated_at:new Date().toISOString(), source:'OpenStreetMap / Overpass API', license:'ODbL-1.0', features:[...cameras.values()]};
}
async function main() {
  if (process.argv[2]) {
    const geo = convert(JSON.parse(await readFile(process.argv[2], 'utf8')));
    if (!geo.features.length) throw Error('No supported camera points in imported Overpass JSON');
    const directory = new URL('../public/data/', import.meta.url);
    await mkdir(directory, {recursive:true});
    await writeFile(new URL('cameras.geojson.tmp',directory), JSON.stringify(geo));
    await rename(new URL('cameras.geojson.tmp',directory), new URL('cameras.geojson',directory));
    console.log(`Imported ${geo.features.length} cameras`); return;
  }
  let lastError;
  for(const endpoint of ['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']) {
    try {
      const res=await fetch(`${endpoint}?${new URLSearchParams({data:query})}`,{signal:AbortSignal.timeout(55000)});
      if(!res.ok) throw Error(`Overpass HTTP ${res.status}`);
      const geo=convert(await res.json());
      if(!geo.features.length) throw Error('Empty result: previous snapshot preserved');
      const directory=new URL('../public/data/',import.meta.url);
      await mkdir(directory,{recursive:true});
      const file=new URL('cameras.geojson',directory);
      await writeFile(new URL('cameras.geojson.tmp',directory),JSON.stringify(geo));
      await rename(new URL('cameras.geojson.tmp',directory),file);
      console.log(`Saved ${geo.features.length} cameras at ${geo.updated_at}`);return;
    } catch(error) {lastError=error; console.error(error.message);}
  }
  throw lastError;
}
if(process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) await main();
