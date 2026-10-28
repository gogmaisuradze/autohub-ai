import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';

const names=['cameras','parking','fuel','charging','services','car-wash','parts','showrooms','official-parking'];
const labels=['კამერები და რადარები','პარკინგები (OSM)','ბენზინგასამართები','ელექტროდამტენები','ავტოსერვისები და საბურავები','ავტოსამრეცხაოები','ავტონაწილები','ავტოსალონები','თბილისის ოფიციალური ლოტები'];
const defaults={cameras:'კამერა / რადარი',parking:'პარკინგი',fuel:'ბენზინგასამართი',charging:'დამტენი',services:'ავტოსერვისი','car-wash':'ავტოსამრეცხაო',parts:'ავტონაწილები',showrooms:'ავტოსალონი','official-parking':'საპარკინგე ლოტი'};
const asText=v=>typeof v==='string'&&v.trim()?v.trim():null;
export function normalize(feature,layer,meta){
 const p=feature.properties||{};
 const speed=p.maxspeed && /^\d+(\.\d+)?$/.test(p.maxspeed)?Number(p.maxspeed):null;
 return {...feature,properties:{...p,layer,name:asText(p['name:ka'])||asText(p.name)||asText(p.brand)||defaults[layer],
   address:asText(p.address)||[p['addr:street'],p['addr:housenumber']].filter(Boolean).join(' ')||null,
   phone:asText(p['contact:phone'])||asText(p.phone),website:asText(p['contact:website'])||asText(p.website),
   opening_hours:asText(p.opening_hours),speed_limit_kmh:speed,
   camera_kind:layer==='cameras'?(p.enforcement==='traffic_signals'?'traffic_signals':p.enforcement==='average_speed'?'average_speed':'speed_camera'):null,
   source_data_at:meta.source_data_at||null,live:false}};
}
function coordinates(feature){const g=feature.geometry;return g.type==='Point'?[g.coordinates]:g.type==='Polygon'?g.coordinates[0]:[];}
function inBox(feature,box){const coords=coordinates(feature);if(!coords.length)return false;const xs=coords.map(c=>c[0]),ys=coords.map(c=>c[1]);return Math.max(...xs)>=box[0]&&Math.min(...xs)<=box[2]&&Math.max(...ys)>=box[1]&&Math.min(...ys)<=box[3];}
function center(feature){const c=coordinates(feature);return [c.reduce((s,p)=>s+p[0],0)/c.length,c.reduce((s,p)=>s+p[1],0)/c.length];}
function distance(a,b){const rad=x=>x*Math.PI/180;const dlat=rad(b[1]-a[1]),dlon=rad(b[0]-a[0]);const h=Math.sin(dlat/2)**2+Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dlon/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
function bad(message){throw Object.assign(new Error(message),{status:400});}
function number(value,fallback,min,max,name){if(value===null)return fallback;if(!value.trim())bad(`Invalid ${name}`);const n=Number(value);if(!Number.isFinite(n)||n<min||n>max)bad(`Invalid ${name}`);return n;}
export async function createMapServer({dataDir=fileURLToPath(new URL('../data/',import.meta.url)),allowedOrigins=['http://localhost:5173','http://127.0.0.1:5173']}={}){
 const manifest=JSON.parse(await readFile(resolve(dataDir,'manifest.json'),'utf8'));
 const layers=new Map();
 for(const name of names.filter(n=>n!=='official-parking')){
  const data=JSON.parse(await readFile(resolve(dataDir,`${name}.geojson`),'utf8'));
  if(data.type!=='FeatureCollection'||!Array.isArray(data.features))throw Error(`Invalid layer ${name}`);
  layers.set(name,{meta:{source:data.source,source_data_at:data.source_data_at,generated_at:data.updated_at,license:data.license,attribution:'© OpenStreetMap contributors'},features:data.features.map(f=>normalize(f,name,data))});
 }
 const registry=JSON.parse(await readFile(resolve(dataDir,'tbilisi-parking.json'),'utf8'));
 const officialMeta={source:registry.source,source_data_at:registry.retrievedAt,attribution:'თბილისის მუნიციპალური პარკინგის მონაცემები',license:null};
 layers.set('official-parking',{meta:officialMeta,features:registry.places.map(p=>normalize({type:'Feature',id:`municipal/${p.id}`,geometry:{type:'Polygon',coordinates:[p.polygon.map(([lat,lon])=>[lon,lat])]},properties:{name:p.code,code:p.code,address:p.address,source:registry.source,tariff:null,payment_connected:false}},'official-parking',officialMeta))});
 const catalog=names.map((id,index)=>({id,label:labels[index],count:layers.get(id).features.length,...layers.get(id).meta}));
 const server=http.createServer((req,res)=>{
  const origin=req.headers.origin;
  res.setHeader('Vary','Origin, Accept-Encoding');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(origin&&(allowedOrigins.includes('*')||allowedOrigins.includes(origin))){res.setHeader('Access-Control-Allow-Origin',allowedOrigins.includes('*')?'*':origin);res.setHeader('Access-Control-Expose-Headers','ETag');}
  const send=(status,body,cache=false)=>{
   const raw=Buffer.from(JSON.stringify(body));const etag=`"${createHash('sha256').update(raw).digest('hex')}"`;
   res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control',cache?'public, max-age=300':'no-store');
   if(cache){res.setHeader('ETag',etag);if(req.headers['if-none-match']===etag){res.writeHead(304);res.end();return;}}
   let bytes=raw;if(/\bgzip\b/.test(req.headers['accept-encoding']||'')){bytes=gzipSync(raw);res.setHeader('Content-Encoding','gzip');}
   res.writeHead(status,{'Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);
  };
  if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, HEAD, OPTIONS');res.setHeader('Access-Control-Allow-Headers','If-None-Match');res.writeHead(204);res.end();return;}
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD, OPTIONS');send(405,{error:'method_not_allowed'});return;}
  try{
   const url=new URL(req.url,'http://localhost');const q=url.searchParams;
   if(url.pathname==='/health'){send(200,{status:'ok',layers:layers.size});return;}
   if(url.pathname==='/api/v1/layers'){send(200,{version:'1',source_data_at:manifest.source_data_at,layers:catalog},true);return;}
   if(url.pathname!=='/api/v1/pois'){send(404,{error:'not_found'});return;}
   const selected=(q.get('layers')||'cameras').split(',');
   if(selected.some(n=>!layers.has(n)))bad('Unknown layer');
   const limit=number(q.get('limit'),200,1,1000,'limit'),offset=number(q.get('offset'),0,0,100000,'offset');
   if(!Number.isInteger(limit)||!Number.isInteger(offset))bad('limit and offset must be integers');
   let box=null;
   if(q.has('bbox')){box=q.get('bbox').split(',').map(x=>x.trim()?Number(x):NaN);if(box.length!==4||box.some(n=>!Number.isFinite(n))||box[0]<-180||box[2]>180||box[1]<-90||box[3]>90||box[0]>box[2]||box[1]>box[3])bad('bbox must be west,south,east,north');}
   const hasNear=q.has('lat')||q.has('lng')||q.has('radius_m');let near=null,radius=null;
   if(hasNear){if(!q.has('lat')||!q.has('lng'))bad('lat and lng required');near=[number(q.get('lng'),0,-180,180,'lng'),number(q.get('lat'),0,-90,90,'lat')];radius=number(q.get('radius_m'),3000,1,100000,'radius_m');}
   if(!box&&!near)bad('Provide bbox or lat/lng');
   const search=(q.get('q')||'').trim().toLocaleLowerCase();if(search.length>200)bad('Search too long');
   let features=[...new Set(selected)].flatMap(n=>layers.get(n).features).filter(f=>!box||inBox(f,box));
   if(search)features=features.filter(f=>[f.properties.name,f.properties.address,f.properties.code,f.properties.brand].some(v=>typeof v==='string'&&v.toLocaleLowerCase().includes(search)));
   if(near)features=features.map(f=>({...f,properties:{...f.properties,distance_m:Math.round(distance(near,center(f)))}})).filter(f=>f.properties.distance_m<=radius).sort((a,b)=>a.properties.distance_m-b.properties.distance_m);
   send(200,{type:'FeatureCollection',features:features.slice(offset,offset+limit),meta:{total:features.length,limit,offset,next_offset:offset+limit<features.length?offset+limit:null,sources:[...new Set(selected)].map(n=>({layer:n,...layers.get(n).meta})),warnings:['OSM coverage may be incomplete; these are not live availability or price data.','Official parking tariffs and payment are not connected.','OSM area POIs use representative positions, not verified entrances.']}},true);
  }catch(error){send(error.status||500,{error:error.status?'invalid_request':'internal_error',message:error.status?error.message:'Request failed'});}
 });
 server.requestTimeout=15000;server.headersTimeout=10000;
 return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=await createMapServer({dataDir:process.env.DATA_DIR||undefined,allowedOrigins:(process.env.ALLOWED_ORIGINS||'http://localhost:5173,http://127.0.0.1:5173').split(',').map(s=>s.trim())});
 const port=Number(process.env.PORT||8787);server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`AutoHub map API listening on ${port}`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
}
