import React, { useEffect, useRef, useState } from 'react';
import { DELINEATED_PARKING_ZONES, DelineatedParkingZone } from '../../constants/parkingZones';
import { isPointInPolygon } from '../../services/parkingStopDetector';
import { DeviceTelemetryReading } from '../../types/telemetry';
import { getPreferredLocation } from '../../services/locationService';
import { leafletLoader } from '../../services/leafletLoader';
import { sounds } from '../../services/soundEffects';
import {
  MapPin,
  Smartphone,
  Radio,
  Search,
  CheckCircle2,
  Clock,
  X,
  AlertTriangle,
  Info,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

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

export default function ParkingLocationPicker({
  city,
  initialLot,
  plate,
  obdReading,
  vehicleId,
  onClose,
  onConfirm
}: {
  obdReading?: DeviceTelemetryReading;
  vehicleId?: string;
  city: 'tbilisi' | 'batumi' | 'kutaisi';
  initialLot?: DelineatedParkingZone;
  plate: string;
  onClose: () => void;
  onConfirm: (lot: DelineatedParkingZone, minutes: number) => void;
}) {
  const [fix, setFix] = useState<Fix>();
  const [source, setSource] = useState<'phone' | 'obd'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState<{ lot: DelineatedParkingZone; distance: number }[]>([]);
  const [selected, setSelected] = useState<DelineatedParkingZone | undefined>(initialLot);
  const [code, setCode] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [confirmed, setConfirmed] = useState(false);
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>();
  const requestId = useRef(0);

  const locate = async (preferred?: 'phone' | 'obd') => {
    const id = ++requestId.current;
    setBusy(true);
    setError('');
    if (!initialLot) setSelected(undefined);
    setFix(undefined);
    setCandidates([]);
    setConfirmed(false);

    if (!navigator.geolocation && !obdReading) {
      setBusy(false);
      setError('მდებარეობა მიუწვდომელია. აირჩიეთ ლოტი კოდით.');
      return;
    }

    const applyFix = (next: Fix, timestamp: number, origin: 'phone' | 'obd') => {
      if (id !== requestId.current) return;
      setBusy(false);
      const age = Date.now() - timestamp;
      if (
        !Number.isFinite(timestamp) ||
        age < -5000 ||
        age > 30000 ||
        !Number.isFinite(next.lat) ||
        Math.abs(next.lat) > 90 ||
        !Number.isFinite(next.lng) ||
        Math.abs(next.lng) > 180 ||
        !Number.isFinite(next.accuracy) ||
        next.accuracy < 0 ||
        next.accuracy > 50
      ) {
        setError('GPS მონაცემი ძველია ან საკმარისად ზუსტი არ არის. განაახლეთ მდებარეობა ან შეიყვანეთ ლოტის კოდი.');
        return;
      }
      setSource(origin);
      setFix(next);
      const nearby = DELINEATED_PARKING_ZONES.filter(
        l => l.city === city && l.verificationStatus === 'verified_official'
      )
        .map(lot => ({ lot, distance: distanceToLot(next, lot) }))
        .filter(item => item.distance <= Math.max(25, next.accuracy))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
      setCandidates(nearby);
      if (!nearby.length) {
        setError('ამ მდებარეობასთან ოფიციალური ლოტი ვერ მოიძებნა. გადაამოწმეთ ადგილზე არსებული ნიშანი და კოდი.');
      }
      if (!initialLot && nearby.length === 1) {
        setSelected(nearby[0].lot);
      }
    };

    try {
      const selectedLoc = await getPreferredLocation(
        vehicleId,
        preferred === 'phone' ? 'device' : preferred === 'obd' ? 'obd' : 'auto',
        50
      );
      applyFix(
        { lat: selectedLoc.lat, lng: selectedLoc.lng, accuracy: selectedLoc.accuracy },
        selectedLoc.timestamp,
        selectedLoc.source === 'obd' ? 'obd' : 'phone'
      );
    } catch (err) {
      if (id !== requestId.current) return;
      setBusy(false);
      setError(err instanceof Error ? err.message : 'მდებარეობა ვერ განისაზღვრა.');
    }
  };

  useEffect(() => {
    locate();
    return () => {
      requestId.current++;
    };
  }, [vehicleId]);

  useEffect(() => {
    let disposed = false;
    leafletLoader
      .load()
      .then(L => {
        if (disposed || !mapElement.current) return;
        mapRef.current?.remove();
        const center = selected?.center || (fix ? [fix.lat, fix.lng] : [41.712, 44.785]);
        const map = L.map(mapElement.current, {
          center,
          zoom: 18,
          preferCanvas: true,
          scrollWheelZoom: false
        });
        mapRef.current = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        if (fix) {
          L.circle([fix.lat, fix.lng], {
            radius: fix.accuracy,
            color: '#0284c7',
            fillOpacity: 0.1
          }).addTo(map);
          L.circleMarker([fix.lat, fix.lng], {
            radius: 7,
            color: '#fff',
            fillColor: '#0284c7',
            fillOpacity: 1
          })
            .addTo(map)
            .bindTooltip(source === 'obd' ? 'თქვენი მანქანა • 4G OBD' : 'თქვენი ტელეფონი');
        }

        const lots = new Map(candidates.map(item => [item.lot.id, item.lot]));
        if (selected) lots.set(selected.id, selected);
        lots.forEach(lot =>
          L.polygon(lot.polygon, {
            color: lot.id === selected?.id ? '#d97706' : '#3b82f6',
            weight: 3,
            fillOpacity: 0.25
          })
            .addTo(map)
            .bindTooltip(lot.lotCode)
            .on('click', () => {
              sounds.playClick();
              setSelected(lot);
              setConfirmed(false);
            })
        );
        if (selected) {
          map.fitBounds(L.latLngBounds(selected.polygon).pad(0.8), { maxZoom: 19 });
        }
      })
      .catch(() => {
        /* Codes and confirmation remain available if map tiles fail. */
      });
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = undefined;
    };
  }, [fix, selected, candidates, source]);

  const findCode = () => {
    sounds.playClick();
    const formatted = code.replace('#', '').trim().toUpperCase();
    const lot = DELINEATED_PARKING_ZONES.find(
      l => l.city === city && l.lotCode === formatted
    );
    if (!lot) {
      setError('ეს კოდი რეესტრში ვერ მოიძებნა. გადაამოწმეთ ადგილზე მითითებული სრული კოდი.');
      sounds.playAlert();
      return;
    }
    requestId.current++;
    setBusy(false);
    setSelected(lot);
    setConfirmed(false);
    setError('');
    sounds.playSuccess();
  };

  return (
    <div
      className="fixed inset-0 z-[9995] bg-navy/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="პარკირების ლოტის დადასტურება"
    >
      <div className="bg-[#ECEAE5] rounded-3xl neu-card shadow-2xl border border-white/80 w-full max-w-xl max-h-[92vh] overflow-y-auto text-navy p-5 sm:p-7 space-y-4">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-sm shrink-0 bg-white border border-white">
              <MapPin className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-navy tracking-tight">
                  რომელ ლოტზე აჩერებთ?
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">ავტომობილი:</span>
                <span className="px-2 py-0.5 rounded-md bg-white text-navy font-mono text-[11px] font-black border border-slate-300 shadow-2xs">
                  🇬🇪 GE {plate}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="დახურვა"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full neu-circle flex items-center justify-center text-slate-500 hover:text-navy hover:bg-white transition-all cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* GPS Source Selector & Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 border border-slate-300/40">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                locate('phone');
              }}
              disabled={busy}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                source === 'phone' && !busy
                  ? 'bg-navy text-gold shadow-xs'
                  : 'text-slate-600 hover:text-navy hover:bg-white/60'
              }`}
            >
              <Smartphone size={13} />
              <span>ტელეფონის GPS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                locate('obd');
              }}
              disabled={busy}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                source === 'obd' && !busy
                  ? 'bg-navy text-gold shadow-xs'
                  : 'text-slate-600 hover:text-navy hover:bg-white/60'
              }`}
            >
              <Radio size={13} />
              <span>მანქანის 4G OBD</span>
            </button>
          </div>

          {busy ? (
            <span className="text-[11px] font-bold text-navy flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-xl border border-slate-200">
              <RefreshCw size={12} className="animate-spin text-gold" />
              მდებარეობა მოწმდება…
            </span>
          ) : fix ? (
            <span className="text-[11px] font-mono font-bold text-slate-600 flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-xl border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              სიზუსტე: ±{Math.round(fix.accuracy)} მ
            </span>
          ) : null}
        </div>

        {/* Alert / Warning Banner */}
        {error && (
          <div
            role="status"
            className="p-3 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs animate-fade-in"
          >
            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {city !== 'tbilisi' && (
          <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-2">
            <Info size={14} className="text-slate-500 shrink-0" />
            <span>ამ ქალაქის ოფიციალური კონტურები დამუშავების პროცესშია. ლოტის კოდი ადგილზე გადაამოწმეთ.</span>
          </div>
        )}

        {/* Map Viewport */}
        <div className="relative rounded-2xl overflow-hidden border border-white shadow-inner bg-slate-100 h-48 sm:h-52">
          <div ref={mapElement} className="w-full h-full" />
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              locate(source);
            }}
            disabled={busy}
            className="absolute top-2.5 right-2.5 z-[1000] p-2 rounded-xl bg-white/95 hover:bg-white text-navy hover:text-gold shadow-md border border-slate-200 transition-all cursor-pointer"
            title="მდებარეობის განახლება"
          >
            <RefreshCw size={13} className={busy ? 'animate-spin text-gold' : ''} />
          </button>
        </div>

        {/* Candidate Lots (if multiple nearby) */}
        {candidates.length > 1 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              რამდენიმე ლოტია ახლოს ({candidates.length}) — აირჩიეთ ნიშნის მიხედვით:
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {candidates.map(({ lot, distance }) => (
                <button
                  key={lot.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelected(lot);
                    setConfirmed(false);
                  }}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selected?.id === lot.id
                      ? 'bg-white border-gold ring-2 ring-gold/40 shadow-sm'
                      : 'neu-btn bg-white/70 hover:bg-white border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-navy text-gold font-mono font-black text-xs">
                        {lot.lotCode}
                      </span>
                      <span className="font-bold text-xs text-navy">{lot.address_ge}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                      {distance === 0 ? '📍 თქვენი მდებარეობა ზონაშია' : `ზონამდე: ~${Math.round(distance)} მ`}
                    </span>
                  </div>
                  {selected?.id === lot.id && <CheckCircle2 size={17} className="text-gold shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search by Lot Code */}
        <form
          onSubmit={e => {
            e.preventDefault();
            findCode();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="ლოტის სრული კოდი"
              placeholder="ლოტის კოდი, მაგ. A2371"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-navy placeholder:text-slate-400 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-gold/50 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="btn-stitch-navy px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-sm hover:shadow cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Search size={13} className="text-gold" />
            <span>მოძებნა</span>
          </button>
        </form>

        {/* Selected Lot Details Card */}
        {selected && (
          <div className="p-3.5 rounded-2xl bg-white border border-gold/40 shadow-sm space-y-2.5 animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gold/15 text-navy flex items-center justify-center font-black shrink-0">
                  <MapPin size={17} className="text-gold" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-black text-navy font-mono">
                      ლოტი {selected.lotCode}
                    </strong>
                    {selected.hourly_rate_gel !== null && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {selected.hourly_rate_gel.toFixed(2)} ₾/სთ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selected.address_ge}</p>
                </div>
              </div>
            </div>

            {fix && distanceToLot(fix, selected) > Math.max(25, fix.accuracy) && (
              <p className="text-amber-800 text-xs bg-amber-50 p-2 rounded-xl border border-amber-200/80">
                ⚠️ არჩეული ლოტი GPS მდებარეობასთან ახლოს არ არის. გადაამოწმეთ ნიშანი ადგილზე.
              </p>
            )}

            {/* Checkbox confirmation */}
            <label className="flex items-center gap-2.5 pt-1.5 border-t border-slate-100 text-xs font-bold text-navy cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => {
                  sounds.playClick();
                  setConfirmed(e.target.checked);
                }}
                className="w-4 h-4 rounded text-gold accent-gold cursor-pointer"
              />
              <span>ვადასტურებ: მანქანა ნამდვილად დგას ლოტზე {selected.lotCode}</span>
            </label>
          </div>
        )}

        {/* Reminder Duration Selector */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/70 border border-slate-200/80">
          <span className="text-xs font-bold text-navy flex items-center gap-1.5">
            <Clock size={14} className="text-gold" />
            <span>შეხსენების პერიოდი:</span>
          </span>
          <div className="flex items-center gap-1">
            {[15, 30, 60, 120].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMinutes(n);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  minutes === n
                    ? 'bg-navy text-gold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {n >= 60 ? `${n / 60} სთ` : `${n} წთ`}
              </button>
            ))}
          </div>
        </div>

        {/* Footnote information */}
        <p className="text-[11px] text-slate-500 leading-relaxed">
          CarMe ჩართავს შეხსენებას. გადახდა და ოფიციალური გააქტიურება სრულდება მუნიციპალურ სერვისში — გადაამოწმეთ იგივე ლოტის კოდი და ავტომობილის ნომერი.
        </p>

        {/* Official Tbilisi link */}
        {selected && city === 'tbilisi' && (
          <a
            href="https://parking.tbilisi.gov.ge/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-navy/80 hover:text-navy font-bold underline transition-colors"
          >
            <span>ოფიციალური პარკირების სერვისის გახსნა (parking.tbilisi.gov.ge)</span>
            <ExternalLink size={12} className="text-gold" />
          </a>
        )}

        {/* Action Button */}
        <button
          type="button"
          disabled={!selected || !confirmed || busy}
          onClick={() => {
            if (selected && confirmed) {
              sounds.playSuccess();
              onConfirm(selected, minutes);
            }
          }}
          className={`btn-stitch-navy w-full py-3.5 sm:py-4 px-6 text-sm font-black rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all ${
            !selected || !confirmed || busy
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:shadow-lg active:scale-95 cursor-pointer'
          }`}
        >
          <CheckCircle2 size={16} className={selected && confirmed ? 'text-gold' : 'text-slate-400'} />
          <span>
            {selected
              ? confirmed
                ? `${selected.lotCode} — შეხსენების ჩართვა`
                : 'დაადასტურეთ ლოტი ზემოთ'
              : 'ჯერ აირჩიეთ ლოტი'}
          </span>
        </button>
      </div>
    </div>
  );
}
