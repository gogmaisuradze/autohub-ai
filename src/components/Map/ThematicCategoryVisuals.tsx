import React from 'react';
import { MapCategoryKey } from './MapCategoriesCoverflow';

interface VisualProps {
  categoryKey: MapCategoryKey;
  isSelected?: boolean;
  isFiltered?: boolean;
  countText?: string;
  badge?: string;
}

/**
 * Authentic Live Traffic Map Category Visuals:
 * Exactly mirrors what is drawn on the live map in AutoHub (LiveTrafficMap.tsx):
 * - Real vector street map canvas (streets, avenues, river, block buildings)
 * - Specific Tbilisi street/avenue names for each category
 * - Live traffic conditions (e.g. red congested flow for traffic jam, detour for road repair)
 * - The EXACT category marker pin from the live map:
 *   - Floating pill badge above the pin (with live details and pricing/speeds)
 *   - Circular category pin with official color and white border
 *   - Category SVG pictogram identical to the map markers
 *   - Bottom pointer arrow pointing to the road coordinate
 *   - GPS radar pulse ripple on the map surface
 */
export const ThematicCategoryVisual: React.FC<VisualProps> = ({
  categoryKey,
  isSelected = false
}) => {
  // Street names corresponding to real locations in Tbilisi
  const streetName = (() => {
    switch (categoryKey) {
      case 'radar': return 'აღმაშენებლის ხეივანი';
      case 'traffic_jam': return 'ჭავჭავაძის გამზირი';
      case 'road_repair': return 'ვაჟა-ფშაველას გამზ.';
      case 'hazard': return 'გმირთა მოედანი';
      case 'fuel': return 'კახეთის გზატკეცილი';
      case 'charging': return 'აღმაშენებლის გამზ.';
      case 'service': return 'ბელიაშვილის ქუჩა';
      case 'car_wash': return 'წერეთლის გამზირი';
      case 'parts': return 'ელიავას ბაზრობა';
      case 'showroom': return 'დიღმის მასივი';
      default: return 'თბილისის ცენტრი';
    }
  })();

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center p-2 select-none overflow-hidden transition-colors duration-300 ${
        isSelected
          ? 'bg-[#131D2E]'
          : 'bg-[#F1F4F8]'
      }`}
    >
      {/* ======================================================== */}
      {/* 1. Realistic Vector Street Map Background               */}
      {/* ======================================================== */}
      <svg
        className="absolute inset-0 w-full h-full opacity-65 pointer-events-none"
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid slice"
      >
        {isSelected ? (
          // Dark Map Canvas (CartoDB / Slate style for active card)
          <g>
            <rect width="320" height="200" fill="#152136" />
            {/* City Blocks */}
            <rect x="25" y="15" width="60" height="38" rx="4" fill="#1E2C42" />
            <rect x="110" y="15" width="70" height="38" rx="4" fill="#1E2C42" />
            <rect x="220" y="15" width="75" height="38" rx="4" fill="#1E2C42" />
            <rect x="25" y="140" width="75" height="42" rx="4" fill="#1E2C42" />
            <rect x="230" y="140" width="65" height="42" rx="4" fill="#1E2C42" />

            {/* Mtkvari River Curve */}
            <path d="M-10 165 Q 90 145 180 175 T 340 155" fill="none" stroke="#1E3A5F" strokeWidth="22" opacity="0.7" />
            <path d="M-10 165 Q 90 145 180 175 T 340 155" fill="none" stroke="#2563EB" strokeWidth="16" opacity="0.3" />

            {/* Secondary Roads */}
            <path d="M20 -10 L110 210" stroke="#22334F" strokeWidth="7" />
            <path d="M190 -10 L250 210" stroke="#22334F" strokeWidth="7" />
            <path d="M-10 75 L330 65" stroke="#22334F" strokeWidth="7" />
            <path d="M-10 135 L330 140" stroke="#22334F" strokeWidth="7" />

            {/* Category-specific Road Highlight */}
            {categoryKey === 'traffic_jam' ? (
              // Congested Red Traffic Corridor
              <g>
                <path d="M-10 100 Q 160 85 330 115" stroke="#7F1D1D" strokeWidth="14" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#EF4444" strokeWidth="6" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#FCA5A5" strokeWidth="2" strokeDasharray="6 8" />
              </g>
            ) : categoryKey === 'road_repair' ? (
              // Construction Work Zone
              <g>
                <path d="M-10 100 Q 160 85 330 115" stroke="#334B6E" strokeWidth="12" />
                <path d="M100 95 L220 105" stroke="#F59E0B" strokeWidth="10" strokeDasharray="10 8" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6" />
              </g>
            ) : categoryKey === 'radar' ? (
              // Speed Radar Scanning Zone
              <g>
                <path d="M-10 100 Q 160 85 330 115" stroke="#334B6E" strokeWidth="12" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#38BDF8" strokeWidth="3" strokeDasharray="8 6" opacity="0.9" />
                <polygon points="160,100 120,60 200,60" fill="#38BDF8" opacity="0.12" />
              </g>
            ) : (
              // Standard Primary Highway Avenue
              <g>
                <path d="M-10 100 Q 160 85 330 115" stroke="#334B6E" strokeWidth="12" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.85" />
              </g>
            )}

            {/* Bridge Over River */}
            <rect x="150" y="88" width="28" height="14" rx="2" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
          </g>
        ) : (
          // Clean Light Map Canvas (OpenStreetMap / Google Maps style)
          <g>
            <rect width="320" height="200" fill="#EBF0F5" />
            {/* City Blocks */}
            <rect x="25" y="15" width="60" height="38" rx="4" fill="#DDE4EC" />
            <rect x="110" y="15" width="70" height="38" rx="4" fill="#DDE4EC" />
            <rect x="220" y="15" width="75" height="38" rx="4" fill="#DDE4EC" />
            <rect x="25" y="140" width="75" height="42" rx="4" fill="#DDE4EC" />
            <rect x="230" y="140" width="65" height="42" rx="4" fill="#DDE4EC" />

            {/* Mtkvari River Curve */}
            <path d="M-10 165 Q 90 145 180 175 T 340 155" fill="none" stroke="#BAE6FD" strokeWidth="22" />
            <path d="M-10 165 Q 90 145 180 175 T 340 155" fill="none" stroke="#7DD3FC" strokeWidth="16" />

            {/* Secondary Roads */}
            <path d="M20 -10 L110 210" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M190 -10 L250 210" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M-10 75 L330 65" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M-10 135 L330 140" stroke="#FFFFFF" strokeWidth="8" />

            {/* Category-specific Road Highlight */}
            {categoryKey === 'traffic_jam' ? (
              // Congested Red Traffic Corridor
              <g>
                <path d="M-10 100 Q 160 85 330 115" stroke="#FCA5A5" strokeWidth="14" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#EF4444" strokeWidth="8" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="6 6" />
              </g>
            ) : categoryKey === 'road_repair' ? (
              // Construction Work Zone
              <g>
                <path d="M-10 100 Q 160 85 330 115" stroke="#FFFFFF" strokeWidth="14" />
                <path d="M100 95 L220 105" stroke="#F97316" strokeWidth="10" strokeDasharray="10 8" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#64748B" strokeWidth="1.8" strokeDasharray="6 5" />
              </g>
            ) : categoryKey === 'radar' ? (
              // Speed Radar Scanning Zone
              <g>
                <path d="M-10 100 Q 160 85 330 115" stroke="#FFFFFF" strokeWidth="14" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#0284C7" strokeWidth="4" strokeDasharray="6 5" />
                <polygon points="160,100 120,60 200,60" fill="#0284C7" opacity="0.1" />
              </g>
            ) : (
              // Standard Primary Highway Avenue
              <g>
                <path d="M-10 100 Q 160 85 330 115" stroke="#FFFFFF" strokeWidth="14" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#FED7AA" strokeWidth="10" />
                <path d="M-10 100 Q 160 85 330 115" stroke="#FB923C" strokeWidth="1.8" strokeDasharray="6 5" />
              </g>
            )}

            {/* Bridge Over River */}
            <rect x="150" y="88" width="28" height="14" rx="2" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
          </g>
        )}

        {/* Compass Rose in Corner */}
        <g transform="translate(294, 26)">
          <circle r="12" fill={isSelected ? "#1E2C42" : "#FFFFFF"} stroke={isSelected ? "#334B6E" : "#CBD5E1"} strokeWidth="1.5" />
          <polygon points="0,-9 3,-1 0,0 -3,-1" fill="#EF4444" />
          <polygon points="0,9 3,1 0,0 -3,1" fill={isSelected ? "#94A3B8" : "#64748B"} />
          <text x="0" y="-11" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#EF4444">N</text>
        </g>
      </svg>

      {/* Street Name Badge in Top-Right */}
      <div className="absolute top-2 right-2 z-20 pointer-events-none">
        <span
          className={`px-2 py-0.5 rounded-md text-[9px] font-sans font-bold shadow-2xs border ${
            isSelected
              ? 'bg-slate-900/90 text-slate-200 border-slate-700/80'
              : 'bg-white/95 text-slate-700 border-slate-300/80'
          }`}
        >
          {streetName}
        </span>
      </div>

      {/* ======================================================== */}
      {/* 2. GPS Route Corridor Ripple below Pin                  */}
      {/* ======================================================== */}
      <div className="absolute top-[68%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-16 h-8 rounded-full bg-slate-900/25 blur-sm" />
        <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${isSelected ? 'bg-amber-400' : 'bg-blue-500'}`} />
      </div>

      {/* ======================================================== */}
      {/* 3. The EXACT AutoHub Live Road Map Marker Component     */}
      {/* ======================================================== */}
      <div className="relative z-10 flex flex-col items-center drop-shadow-xl transform -translate-y-1.5 transition-transform group-hover:scale-105">
        {(() => {
          switch (categoryKey) {
            case 'radar':
              return (
                <div className="relative flex flex-col items-center">
                  {/* Floating Pill Badge */}
                  <div className="px-3 py-1 rounded-full bg-white text-[#1A73E8] font-bold text-xs shadow-md border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[11px] font-mono font-black text-slate-900">80 კმ/სთ</span>
                    <span className="text-[10px] text-slate-500">• რადარი</span>
                  </div>

                  {/* Circular Map Pin */}
                  <div className="relative w-12 h-12 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#1A73E8]/30 z-10">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Pin Pointer Arrow */}
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1A73E8] -mt-[1px]" />
                </div>
              );

            case 'traffic_jam':
              return (
                <div className="relative flex flex-col items-center">
                  <div className="px-3 py-1 rounded-full bg-[#D93025] text-white font-mono font-black text-xs shadow-md border border-white -mb-1.5 z-20 whitespace-nowrap flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>+18 წთ საცობი (Live)</span>
                  </div>

                  <div className="relative w-12 h-12 rounded-full bg-[#D93025] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#D93025]/30 z-10">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>

                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#D93025] -mt-[1px]" />
                </div>
              );

            case 'road_repair':
              return (
                <div className="relative flex flex-col items-center">
                  <div className="px-3 py-1 rounded-full bg-[#E37400] text-white font-mono font-black text-xs shadow-md border border-white -mb-1.5 z-20 whitespace-nowrap flex items-center gap-1">
                    <span>🚧</span>
                    <span>ქუჩის რემონტი</span>
                  </div>

                  <div className="relative w-12 h-12 rounded-full bg-[#E37400] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#E37400]/30 z-10">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>

                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#E37400] -mt-[1px]" />
                </div>
              );

            case 'hazard':
              return (
                <div className="relative flex flex-col items-center">
                  <div className="px-3 py-1 rounded-full bg-[#EA4335] text-white font-bold text-xs shadow-md border border-white -mb-1.5 z-20 whitespace-nowrap flex items-center gap-1">
                    <span>⚠️</span>
                    <span>საგზაო საფრთხე</span>
                  </div>

                  <div className="relative w-12 h-12 rounded-full bg-[#EA4335] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#EA4335]/30 z-10">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>

                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#EA4335] -mt-[1px]" />
                </div>
              );

            case 'fuel':
              return (
                <div className="relative flex flex-col items-center">
                  <div className="px-3 py-1 rounded-full bg-white text-[#202124] font-bold text-xs font-mono shadow-md border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap flex items-center gap-1.5">
                    <span className="text-emerald-600 font-black">2.89₾</span>
                    <span className="text-[10px] text-slate-500">• Gulf / Wissol</span>
                  </div>

                  <div className="relative w-12 h-12 rounded-full bg-[#1E8E3E] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#1E8E3E]/30 z-10">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9h2a2 2 0 012 2v7a2 2 0 01-2 2h-2" />
                    </svg>
                  </div>

                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1E8E3E] -mt-[1px]" />
                </div>
              );

            case 'charging':
              return (
                <div className="relative flex flex-col items-center">
                  <div className="px-3 py-1 rounded-full bg-white text-[#007B83] font-bold text-xs font-mono shadow-md border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap flex items-center gap-1.5">
                    <span>⚡</span>
                    <span className="font-black">EV Fast</span>
                    <span className="text-[10px] text-slate-500">150 kW</span>
                  </div>

                  <div className="relative w-12 h-12 rounded-full bg-[#007B83] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#007B83]/30 z-10">
                    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>

                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#007B83] -mt-[1px]" />
                </div>
              );

            case 'service':
              return (
                <div className="relative flex flex-col items-center">
                  <div className="px-3 py-1 rounded-full bg-white text-[#1967D2] font-bold text-xs shadow-md border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap flex items-center gap-1.5">
                    <span>🔧</span>
                    <span className="font-black text-slate-900">სერვისი</span>
                    <span className="text-[10px] text-slate-500">• 24/7 ვულკანიზაცია</span>
                  </div>

                  <div className="relative w-12 h-12 rounded-full bg-[#1967D2] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#1967D2]/30 z-10">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>

                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1967D2] -mt-[1px]" />
                </div>
              );

            case 'car_wash':
              return (
                <div className="relative flex flex-col items-center">
                  <div className="px-3 py-1 rounded-full bg-white text-[#129EAF] font-bold text-xs shadow-md border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap flex items-center gap-1.5">
                    <span>🧼</span>
                    <span className="font-black text-slate-900">სამრეცხაო</span>
                    <span className="text-[10px] text-slate-500">• ტურბო-ქაფი</span>
                  </div>

                  <div className="relative w-12 h-12 rounded-full bg-[#129EAF] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#129EAF]/30 z-10">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
                    </svg>
                  </div>

                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#129EAF] -mt-[1px]" />
                </div>
              );

            case 'parts':
              return (
                <div className="relative flex flex-col items-center">
                  <div className="px-3 py-1 rounded-full bg-white text-[#7B1FA2] font-bold text-xs shadow-md border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap flex items-center gap-1.5">
                    <span>🔩</span>
                    <span className="font-black text-slate-900">ნაწილები</span>
                    <span className="text-[10px] text-slate-500">• ორიგინალი</span>
                  </div>

                  <div className="relative w-12 h-12 rounded-full bg-[#7B1FA2] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#7B1FA2]/30 z-10">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>

                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#7B1FA2] -mt-[1px]" />
                </div>
              );

            case 'showroom':
              return (
                <div className="relative flex flex-col items-center">
                  <div className="px-3 py-1 rounded-full bg-white text-[#202124] font-bold text-xs shadow-md border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap flex items-center gap-1.5">
                    <span>👑</span>
                    <span className="font-black text-slate-900">ავტოსალონი</span>
                    <span className="text-[10px] text-amber-600 font-bold">• დილერი</span>
                  </div>

                  <div className="relative w-12 h-12 rounded-full bg-[#202124] text-[#D97706] flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#202124]/30 z-10">
                    <svg className="w-6 h-6 text-[#D97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>

                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#202124] -mt-[1px]" />
                </div>
              );

            default:
              return null;
          }
        })()}
      </div>

      {/* Top Map Indicator Tag */}
      <div className="absolute top-2 left-2 z-20 pointer-events-none">
        <span
          className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border shadow-2xs ${
            isSelected
              ? 'bg-slate-900/90 text-amber-300 border-amber-400/30'
              : 'bg-white/95 text-slate-700 border-slate-300/80'
          }`}
        >
          📍 LIVE MAP ობიექტი
        </span>
      </div>
    </div>
  );
};

