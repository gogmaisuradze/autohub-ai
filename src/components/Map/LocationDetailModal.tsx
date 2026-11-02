import React, { useState, useEffect } from 'react';
import { MapReport } from '../../types';
import { sounds } from '../../services/soundEffects';
import { getCompanyBrandData } from './LiveTrafficMap';
import { getGeorgiaRegionName } from '../../services/cameraService';
import {
  X,
  MapPin,
  Phone,
  Globe,
  Clock,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Zap,
  Fuel,
  Wrench,
  AlertTriangle,
  Car,
  Share2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  report: MapReport | null;
  onClose: () => void;
  userCoords?: { lat: number; lng: number } | null;
  onSelectAlternativeRoute?: (routeId: string) => void;
  lang?: 'ge' | 'en';
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const LocationDetailModal: React.FC<Props> = ({
  isOpen,
  report,
  onClose,
  userCoords,
  onSelectAlternativeRoute,
  lang = 'ge'
}) => {
  const isGe = lang === 'ge';
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const brandData = getCompanyBrandData(report);
  const regionName = getGeorgiaRegionName(report.lat, report.lng);
  const displayAddress =
    report.address ||
    `${regionName} • საგზაო მონაკვეთი (${report.lat.toFixed(4)}, ${report.lng.toFixed(4)})`;

  const coordsString = `${report.lat.toFixed(6)}, ${report.lng.toFixed(6)}`;

  const distanceKm =
    userCoords && userCoords.lat && userCoords.lng
      ? calculateDistanceKm(userCoords.lat, userCoords.lng, report.lat, report.lng)
      : null;

  const handleCopyCoords = () => {
    sounds.playClick();
    navigator.clipboard?.writeText(coordsString);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const wazeUrl = `https://waze.com/ul?ll=${report.lat},${report.lng}&navigate=yes`;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1250] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/75 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto animate-scale-up text-navy max-h-[90vh] flex flex-col"
      >
        {/* ======================================================== */}
        {/* 1. TOP HEADER RIBBON                                     */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white px-5 py-4 border-b border-gold/40 flex items-center justify-between gap-3 shadow-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-white/20 bg-white"
              dangerouslySetInnerHTML={{ __html: brandData.logoSvg }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${brandData.categoryBadgeClass}`}>
                  {brandData.categoryLabel}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase">LIVE</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight truncate mt-0.5">
                {brandData.brandName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            title={isGe ? 'დახურვა (ESC)' : 'Close (ESC)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. BODY CONTENT (SCROLLABLE)                             */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 no-scrollbar">
          
          {/* Address & GPS Coordinates Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-gold shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-navy leading-snug">
                  {displayAddress}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {regionName}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">GPS:</span>
                <span className="font-mono font-bold text-navy text-[11px] bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                  {coordsString}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCoords}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 transition-all"
                  title={isGe ? 'კოორდინატების კოპირება' : 'Copy GPS coordinates'}
                >
                  {copiedCoords ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  <span>{copiedCoords ? (isGe ? 'დაკოპირდა!' : 'Copied!') : (isGe ? 'კოპირება' : 'Copy')}</span>
                </button>
              </div>

              {distanceKm !== null && (
                <div className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  📍 {distanceKm} {isGe ? 'კმ თქვენგან' : 'km away'}
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* CATEGORY SPECIFIC BLOCKS                                 */}
          {/* ======================================================== */}

          {/* 1. RADAR / SPEED CAMERA DETAILS */}
          {report.type === 'radar' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-amber-600 shrink-0" />
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                    {isGe ? 'საპატრულო სიჩქარის კონტროლის რადარი' : 'Speed Enforcement Radar'}
                  </span>
                </div>
                {report.speed_limit_kmh && (
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white font-mono font-black text-xs shadow-xs">
                    ⚡ {report.speed_limit_kmh} კმ/სთ
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                  <span className="text-[10px] text-slate-400 block font-mono">კამერის ტიპი:</span>
                  <span className="font-bold text-navy">{report.cameraKind || 'სტაციონარული სიჩქარის რადარი'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                  <span className="text-[10px] text-slate-400 block font-mono">მონაცემთა წყარო:</span>
                  <span className="font-bold text-navy">{report.cameraSource || 'OpenStreetMap / Police.ge'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200/60 text-[11px] text-slate-600 flex items-start gap-2">
                <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {isGe
                    ? 'საპატრულო პოლიციის ვიდეოკამერის ჯარიმის დაფიქსირებისას მოქმედებს -20%-იანი ფასდაკლება 10 კალენდარული დღის განმავლობაში.'
                    : 'A 20% discount applies if paid within 10 calendar days under Georgian legislation.'}
                </span>
              </div>
            </div>
          )}

          {/* 2. FUEL PRICES TABLE (FUEL STATIONS) */}
          {report.type === 'fuel' && report.fuel_prices && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-navy">
                  <Fuel size={16} className="text-amber-600" />
                  <span>{isGe ? 'საწვავის მიმდინარე ფასები (1 ლიტრი)' : 'Current Fuel Prices (1L)'}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  {isGe ? 'ცოცხალი ტარიფი' : 'Live Tariff'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                {report.fuel_prices.super_98 && (
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">Super 98:</span>
                    <span className="font-black text-emerald-700 text-sm">{report.fuel_prices.super_98.toFixed(2)} ₾</span>
                  </div>
                )}
                {report.fuel_prices.premium_95 && (
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">Premium 95:</span>
                    <span className="font-black text-emerald-700 text-sm">{report.fuel_prices.premium_95.toFixed(2)} ₾</span>
                  </div>
                )}
                {report.fuel_prices.regular_92 && (
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">Euro Regular:</span>
                    <span className="font-black text-emerald-700 text-sm">{report.fuel_prices.regular_92.toFixed(2)} ₾</span>
                  </div>
                )}
                {report.fuel_prices.diesel && (
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">Euro Diesel:</span>
                    <span className="font-black text-emerald-700 text-sm">{report.fuel_prices.diesel.toFixed(2)} ₾</span>
                  </div>
                )}
                {report.fuel_prices.lpg && (
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">LPG / გაზი:</span>
                    <span className="font-black text-blue-700 text-sm">{report.fuel_prices.lpg.toFixed(2)} ₾</span>
                  </div>
                )}
                {report.fuel_prices.ev_kwh && (
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">EV დამტენი:</span>
                    <span className="font-black text-amber-600 text-sm">{report.fuel_prices.ev_kwh.toFixed(2)} ₾/კვტ</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. EV CHARGING STATION DETAILS */}
          {report.type === 'charging' && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-950">
                  <Zap size={16} className="text-emerald-600" />
                  <span>{isGe ? 'ელექტრომობილის სწრაფი დამტენი (EV Station)' : 'EV Charging Station'}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs">
                  ⚡ 50 - 150 kW
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-xl bg-white border border-emerald-200">
                  <span className="text-[10px] text-slate-400 block">კონექტორები:</span>
                  <span className="font-bold text-navy">Type 2, CCS 2, CHAdeMO</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-emerald-200">
                  <span className="text-[10px] text-slate-400 block">ტარიფი:</span>
                  <span className="font-bold text-emerald-700 font-mono">0.65 ₾ / კვტ.სთ</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. AUTO SERVICE & PTI INSPECTION */}
          {report.type === 'service' && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-blue-950">
                  <Wrench size={16} className="text-blue-600" />
                  <span>{isGe ? 'სერვის-ცენტრი & დიაგნოსტიკა' : 'Auto Service & Repairs'}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-mono font-bold text-xs">
                  ★ 4.9 / 5.0
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {report.description || 'ძრავის შეკეთება, სავალი ნაწილი, ზეთის შეცვლა, ელექტროობა, კომპიუტერული დიაგნოსტიკა და PTI ტექ-დათვალიერება.'}
              </p>
            </div>
          )}

          {/* 5. ROAD REPAIR / HAZARD / TRAFFIC JAM */}
          {(report.type === 'hazard' || report.type === 'road_repair' || report.delay_minutes) && (
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-rose-950">
                  <AlertTriangle size={16} className="text-rose-600" />
                  <span>{isGe ? 'საგზაო შეფერხება & გაფრთხილება' : 'Traffic Delay & Warning'}</span>
                </div>
                {report.delay_minutes && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold text-xs animate-pulse">
                    ⏱️ +{report.delay_minutes} წუთი
                  </span>
                )}
              </div>
              {report.road_repair_kind && (
                <div className="text-xs font-bold text-amber-900">
                  🚧 {report.road_repair_kind}
                </div>
              )}
              {report.description && (
                <p className="text-xs text-slate-700">{report.description}</p>
              )}

              {report.alternativeRouteId && onSelectAlternativeRoute && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playSuccess();
                    onSelectAlternativeRoute(report.alternativeRouteId!);
                    onClose();
                  }}
                  className="w-full mt-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Zap size={14} className="fill-white" />
                  <span>⚡ ალტერნატიული მოკლე გზის არჩევა (დაზოგვა!)</span>
                </button>
              )}
            </div>
          )}

          {/* Contact, Working Hours & Phone Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {report.opening_hours && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs">
                <Clock size={16} className="text-slate-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-mono">სამუშაო საათები:</span>
                  <span className="font-bold text-navy truncate block">
                    {report.opening_hours.includes('24') ? '🕒 24/7 (ღიაა ყოველთვის)' : report.opening_hours}
                  </span>
                </div>
              </div>
            )}

            {brandData.phone && (
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Phone size={16} className="text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-emerald-800 block font-mono">ტელეფონი:</span>
                    <span className="font-mono font-bold text-emerald-950 truncate block">
                      {brandData.phone}
                    </span>
                  </div>
                </div>
                <a
                  href={`tel:${brandData.phone.replace(/[^0-9+*]/g, '')}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all shrink-0 flex items-center gap-1"
                >
                  <Phone size={12} />
                  <span>დარეკვა</span>
                </a>
              </div>
            )}

            {brandData.website && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2 sm:col-span-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Globe size={16} className="text-blue-600 shrink-0" />
                  <span className="font-bold text-navy truncate">{brandData.website}</span>
                </div>
                <a
                  href={brandData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 flex items-center gap-1 shrink-0"
                >
                  <span>ვებსაიტი</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. FOOTER NAVIGATION ACTIONS                             */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <a
              href={wazeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#1A73E8] font-black text-xs flex items-center justify-center gap-1.5 border border-slate-200 shadow-xs transition-all"
            >
              <Navigation size={14} className="text-[#1A73E8]" />
              <span>Waze ნავიგაცია ↗</span>
            </a>

            <a
              href={gmapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-3.5 rounded-2xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <ExternalLink size={14} />
              <span>Google Maps ↗</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:text-navy hover:bg-slate-200/60 transition-colors"
          >
            {isGe ? 'დახურვა' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailModal;
