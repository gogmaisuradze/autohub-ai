import React, { useEffect, useRef, useState } from 'react';
import { DELINEATED_PARKING_ZONES, DelineatedParkingZone } from '../../constants/parkingZones';
import { isPointInPolygon } from '../../services/parkingStopDetector';
import { DeviceTelemetryReading } from '../../types/telemetry';
import { leafletLoader } from '../../services/leafletLoader';

type Fix = { lat: number; lng: number; accuracy: number };
export function distanceToLot(fix: Fix, lot: DelineatedParkingZone): number {
  if (isPointInPolygon([fix.lat, fix.lng], lot.polygon)) return 0;
  const scaleY = 111320, scaleX = scaleY * Math.cos(fix.lat * Math.PI / 180);
  let best = Infinity;
  for (let i = 0; i < lot.polygon.length - 1; i++) {
    const a = lot.polygon[i], b = lot.polygon[i + 1];
    const ax = (a[1] - fix.lng) * scaleX, ay = (a[0] - fix.lat) * scaleY;
    const dx = (b[1] - a[1]) * scaleX, dy = (b[0] - a[0]) * scaleY;
    const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return best;
}

export default function ParkingLocationPicker({ city, initialLot, plate, obdReading, onClose, onConfirm }: {
  obdReading?: DeviceTelemetryReading;
  city: 'tbilisi' | 'batumi' | 'kutaisi'; initialLot?: DelineatedParkingZone; plate: string;
  onClose: () => void; onConfirm: (lot: DelineatedParkingZone, minutes: number) => void;
}) {
  const [fix, setFix] = useState<Fix>();
  const [source, setSource] = useState<'phone' | 'obd'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState<{lot: DelineatedParkingZone; distance: number}[]>([]);
  const [selected, setSelected] = useState<DelineatedParkingZone>(initialLot);
  const [code, setCode] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [confirmed, setConfirmed] = useState(false);
  const mapElement = useRef<HTMLDivElement>(null), mapRef = useRef<any>();
  const requestId = useRef(0);
  const locate = (preferred?: 'phone' | 'obd') => {
    const id = ++requestId.current;
    setBusy(true); setError(''); if (!initialLot) setSelected(undefined); setFix(undefined); setCandidates([]); setConfirmed(false);
    if (!navigator.geolocation && !obdReading) {setBusy(false); setError('მდებარეობა მიუწვდომელია. აირჩიეთ ლოტი კოდით.'); return;}
    const applyFix = (next: Fix, timestamp: number, origin: 'phone' | 'obd') => {
      if (id !== requestId.current) return;
      setBusy(false);
      const age = Date.now() - timestamp;
      if (!Number.isFinite(timestamp) || age < -5000 || age > 30000 || !Number.isFinite(next.lat) || Math.abs(next.lat) > 90 || !Number.isFinite(next.lng) || Math.abs(next.lng) > 180 || !Number.isFinite(next.accuracy) || next.accuracy < 0 || next.accuracy > 50) {
        setError('GPS მონაცემი ძველია ან საკმარისად ზუსტი არ არის. განაახლეთ მდებარეობა ან შეიყვანეთ ლოტის კოდი.'); return;
      }
      setSource(origin); setFix(next);
      const nearby = DELINEATED_PARKING_ZONES.filter(l => l.city === city && l.verificationStatus === 'verified_official')
        .map(lot => ({lot, distance: distanceToLot(next, lot)}))
        .filter(item => item.distance <= Math.max(25, next.accuracy)).sort((a,b) => a.distance - b.distance).slice(0, 10);
      setCandidates(nearby);
      if (!nearby.length) setError('ამ მდებარეობასთან ოფიციალური ლოტი ვერ მოიძებნა. გადაამოწმეთ ადგილზე არსებული ნიშანი და კოდი.');
      if (!initialLot && nearby.length === 1) setSelected(nearby[0].lot);
    };
    if (preferred !== 'phone' && obdReading && obdReading.latitude !== null && obdReading.longitude !== null && obdReading.accuracyMeters !== null) {
      applyFix({lat:obdReading.latitude,lng:obdReading.longitude,accuracy:obdReading.accuracyMeters}, Date.parse(obdReading.recordedAt), 'obd');
      return;
    }
    if (preferred === 'obd') {setBusy(false);setError('მანქანის ახალი GPS მონაცემი ჯერ არ მოსულა. გამოიყენეთ ტელეფონის მდებარეობა.');return;}
    if (!navigator.geolocation) {setBusy(false);setError('ტელეფონის GPS მიუწვდომელია. აირჩიეთ მანქანის GPS ან მოძებნეთ კოდით.');return;}
    navigator.geolocation.getCurrentPosition(position => {
      applyFix({lat:position.coords.latitude,lng:position.coords.longitude,accuracy:position.coords.accuracy},position.timestamp,'phone');
    }, err => {
      if (id !== requestId.current) return;
      setBusy(false); setError(err.code === 1 ? 'მდებარეობის ნებართვა გამორთულია. შეგიძლიათ ლოტი კოდით მოძებნოთ.' : 'მდებარეობა ვერ განისაზღვრა. სცადეთ ხელახლა ან მოძებნეთ კოდით.');
    }, {enableHighAccuracy: true, timeout: 15000, maximumAge: 0});
  };
  useEffect(() => {locate(); return () => {requestId.current++;};}, []);
  useEffect(() => {
    let disposed = false;
    leafletLoader.load().then(L => {
      if (disposed || !mapElement.current) return;
      mapRef.current?.remove();
      const center = selected?.center || (fix ? [fix.lat, fix.lng] : [41.712,44.785]);
      const map = L.map(mapElement.current, {center, zoom: 18, preferCanvas: true});
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'© OpenStreetMap contributors'}).addTo(map);
      if (fix) {
        L.circle([fix.lat,fix.lng], {radius:fix.accuracy,color:'#0284c7',fillOpacity:0.1}).addTo(map);
        L.circleMarker([fix.lat,fix.lng], {radius:7,color:'#fff',fillColor:'#0284c7',fillOpacity:1}).addTo(map).bindTooltip(source === 'obd' ? 'თქვენი მანქანა • 4G OBD' : 'თქვენი ტელეფონი');
      }
      const lots = new Map(candidates.map(item => [item.lot.id,item.lot]));
      if (selected) lots.set(selected.id,selected);
      lots.forEach(lot => L.polygon(lot.polygon, {color: lot.id === selected?.id ? '#d97706' : '#3b82f6',weight:3,fillOpacity:0.25})
        .addTo(map).bindTooltip(lot.lotCode).on('click',() => {setSelected(lot);setConfirmed(false);}));
      if (selected) map.fitBounds(L.latLngBounds(selected.polygon).pad(0.8), {maxZoom:19});
    }).catch(() => { /* Codes and confirmation remain available if map tiles fail. */ });
    return () => {disposed=true;mapRef.current?.remove();mapRef.current=undefined;};
  }, [fix,selected,candidates,source]);
  const findCode = () => {
    const lot = DELINEATED_PARKING_ZONES.find(l => l.city === city && l.lotCode === code.replace('#','').trim().toUpperCase());
    if (!lot) {setError('ეს კოდი რეესტრში ვერ მოიძებნა. გადაამოწმეთ ადგილზე მითითებული სრული კოდი.');return;}
    requestId.current++; setBusy(false); setSelected(lot);setConfirmed(false);setError('');
  };
  return <div className="fixed inset-0 z-[9995] bg-slate-950/70 flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label="პარკირების ლოტის დადასტურება">
    <div className="bg-white rounded-3xl p-5 w-full max-w-xl max-h-[92vh] overflow-y-auto text-navy shadow-2xl">
      <div className="flex justify-between gap-3"><h2 className="font-black text-lg">რომელ ლოტზე აჩერებთ?</h2><button aria-label="დახურვა" onClick={onClose}>✕</button></div>
      {city !== 'tbilisi' && <p className="text-sm text-amber-800 my-2">ამ ქალაქის ზუსტი ოფიციალური კონტურები ჯერ არ გვაქვს. ლოტის კოდი ადგილზე გადაამოწმეთ.</p>}
      <p className="text-sm my-2">ავტომობილი: <strong>{plate}</strong></p>
      <button className="text-sm text-blue-700 underline" onClick={() => locate('phone')} disabled={busy}>{busy ? 'მდებარეობა მოწმდება…' : 'ტელეფონის GPS-ით შემოწმება'}</button>
      <button className="text-sm text-blue-700 underline ml-3" onClick={() => locate('obd')} disabled={busy}>მანქანის 4G OBD GPS</button>
      {fix && <p className="text-xs mt-1">{source === 'obd' ? 'მანქანის GPS (4G OBD)' : 'ტელეფონის GPS'} • სიზუსტე: ±{Math.round(fix.accuracy)} მ • ლურჯი წერტილი — {source === 'obd' ? 'მანქანა' : 'ტელეფონი'}</p>}
      {error && <p role="status" className="text-sm text-amber-800 bg-amber-50 p-2 rounded-xl my-2">{error}</p>}
      <div ref={mapElement} className="h-48 rounded-xl overflow-hidden my-3 bg-slate-100" />
      {candidates.length > 1 && <p className="text-sm mb-2">რამდენიმე ლოტია ახლოს — აირჩიეთ ადგილზე არსებული ნიშნის მიხედვით.</p>}
      <div className="space-y-2">{candidates.map(({lot,distance}) => <button key={lot.id} onClick={() => {setSelected(lot);setConfirmed(false);}} className={`w-full text-left p-3 border rounded-xl ${selected?.id === lot.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}><strong>{lot.lotCode}</strong> · {lot.address_ge}<span className="block text-xs">{distance === 0 ? 'თქვენი მდებარეობა კონტურშია' : `კონტურამდე დაახლოებით ${Math.round(distance)} მ`}</span></button>)}</div>
      <form className="flex gap-2 my-3" onSubmit={e => {e.preventDefault();findCode();}}><input aria-label="ლოტის სრული კოდი" placeholder="ლოტის კოდი, მაგ. A2371" value={code} onChange={e => setCode(e.target.value)} className="border rounded-xl p-2 min-w-0 flex-1"/><button className="border rounded-xl px-3">მოძებნა</button></form>
      {selected && <div className="p-3 rounded-xl bg-slate-50 border"><strong className="text-lg">ლოტი {selected.lotCode}</strong><p>{selected.address_ge}</p>{fix && distanceToLot(fix,selected) > Math.max(25,fix.accuracy) && <p className="text-amber-800 text-sm mt-2">არჩეული ლოტი GPS მდებარეობასთან ახლოს არ არის. გადაამოწმეთ კოდი.</p>}<label className="flex gap-2 mt-3 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/>ვადასტურებ: მანქანა დგას ლოტზე {selected.lotCode}</label></div>}
      <label className="flex items-center justify-between gap-2 text-sm my-3">შეხსენების პერიოდი<select value={minutes} onChange={e => setMinutes(Number(e.target.value))} className="border rounded-lg p-2">{[15,30,60,120].map(n => <option key={n} value={n}>{n} წუთი</option>)}</select></label>
      <p className="text-sm text-slate-600 my-3">AutoHub ჩართავს შეხსენებას. გადახდა და ოფიციალური გააქტიურება სრულდება მუნიციპალურ სერვისში — გადაამოწმეთ იგივე ლოტის კოდი და ავტომობილის ნომერი.</p>
      {selected && city === 'tbilisi' && <a href="https://parking.tbilisi.gov.ge/" target="_blank" rel="noreferrer" className="block text-center text-blue-700 underline mb-3">ოფიციალური პარკირების სერვისის გახსნა</a>}
      <button disabled={!selected || !confirmed || busy} onClick={() => {if(selected && confirmed) onConfirm(selected,minutes);}} className="w-full rounded-xl bg-navy text-white font-bold p-3 disabled:opacity-40">{selected ? `${selected.lotCode} — შეხსენების ჩართვა` : 'ჯერ აირჩიეთ ლოტი'}</button>
    </div>
  </div>;
}
