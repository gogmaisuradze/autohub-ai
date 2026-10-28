import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {createMapServer} from '../src/server.mjs';
let server,base;
before(async()=>{server=await createMapServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;});
after(()=>new Promise(resolve=>server.close(resolve)));
const get=path=>fetch(base+path);
test('catalog contains extracted counts and official source separately',async()=>{
 const r=await get('/api/v1/layers');assert.equal(r.status,200);const data=await r.json();assert.equal(data.layers.length,9);assert.equal(data.layers.find(l=>l.id==='cameras').count,260);assert.equal(data.layers.find(l=>l.id==='official-parking').count,2200);
});
test('bounding-box filtering, pagination, OSM metadata and numeric camera limits',async()=>{
 const r=await get('/api/v1/pois?layers=cameras&bbox=40,40,47,44&limit=2');const d=await r.json();assert.equal(d.features.length,2);assert.ok(d.meta.total>2);assert.equal(d.meta.next_offset,2);
 for(const f of d.features){const [lng,lat]=f.geometry.coordinates;assert.ok(lng>=40&&lng<=47&&lat>=40&&lat<=44);assert.equal(f.properties.live,false);assert.ok(f.properties.source_data_at);}
 const next=await (await get('/api/v1/pois?layers=cameras&bbox=40,40,47,44&limit=2&offset=2')).json();assert.notEqual(next.features[0].id,d.features[0].id);
});
test('nearby results respect radius and are ordered by distance',async()=>{
 const d=await (await get('/api/v1/pois?layers=fuel,charging&lat=41.7151&lng=44.8271&radius_m=5000')).json();assert.ok(d.features.length>0);
 const distances=d.features.map(f=>f.properties.distance_m);assert.ok(distances.every(n=>n<=5000));assert.deepEqual(distances,[...distances].sort((a,b)=>a-b));
});
test('official parking uses GeoJSON lng/lat and no invented tariff',async()=>{
 const d=await (await get('/api/v1/pois?layers=official-parking&bbox=44,41,45,42&q=A1043')).json();assert.equal(d.features.length,1);const f=d.features[0];assert.equal(f.properties.code,'A1043');assert.equal(f.properties.tariff,null);assert.equal(f.properties.payment_connected,false);assert.ok(f.geometry.coordinates[0][0][0]>44);assert.ok(f.geometry.coordinates[0][0][1]<42);
});
test('invalid requests and unsupported methods fail explicitly',async()=>{
 for(const path of ['/api/v1/pois','/api/v1/pois?layers=secrets&bbox=40,40,47,44','/api/v1/pois?bbox=,,,','/api/v1/pois?bbox=45,42,44,41','/api/v1/pois?lat=41','/api/v1/pois?lat=91&lng=44','/api/v1/pois?lat=41&lng=44&limit=1.5'])assert.equal((await get(path)).status,400,path);
 assert.equal((await fetch(base+'/api/v1/pois',{method:'POST'})).status,405);assert.equal((await get('/data/../../package.json')).status,404);
});
test('cache validation and CORS only for configured origins',async()=>{
 const r=await get('/api/v1/layers');const etag=r.headers.get('etag');assert.ok(etag);assert.equal((await fetch(base+'/api/v1/layers',{headers:{'If-None-Match':etag}})).status,304);
 const allowed=await fetch(base+'/health',{headers:{Origin:'http://localhost:5173'}});assert.equal(allowed.headers.get('access-control-allow-origin'),'http://localhost:5173');
 const blocked=await fetch(base+'/health',{headers:{Origin:'https://unknown.example'}});assert.equal(blocked.headers.get('access-control-allow-origin'),null);
 assert.equal((await fetch(base+'/health',{method:'HEAD'})).status,200);
});
