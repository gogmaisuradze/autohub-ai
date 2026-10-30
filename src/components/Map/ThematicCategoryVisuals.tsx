import React from 'react';
import { MapCategoryKey } from './MapCategoriesCoverflow';

interface VisualProps {
  categoryKey: MapCategoryKey;
  isSelected?: boolean;
  isFiltered?: boolean;
  countText?: string;
  badge?: string;
}

export const ThematicCategoryVisual: React.FC<VisualProps> = ({
  categoryKey,
  isSelected = false,
  isFiltered = false
}) => {
  return (
    <div className="relative w-full h-full bg-[#182235] flex items-center justify-center p-3 select-none">
      {/* Subtle Matte Background Texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

      {/* Road Sign Plates */}
      {(() => {
        switch (categoryKey) {
          case 'radar':
            // Official Radar / Speed Camera Sign (White disc with red border 80 km/h + Blue Camera Plate)
            return (
              <div className="flex items-center justify-center gap-3">
                {/* Standard White Disc Speed Limit Sign */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 sm:border-[5px] border-[#DC2626] flex items-center justify-center shadow-md shrink-0">
                  <span className="text-xl sm:text-2xl font-black text-slate-950 font-sans tracking-tight">
                    80
                  </span>
                </div>

                {/* Standard Blue Camera Plate (საგზაო ნიშანი 5.27/7.14) */}
                <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl bg-[#1E40AF] border-2 border-white p-1.5 flex flex-col items-center justify-center shadow-md shrink-0">
                  {/* Camera pictogram */}
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm8 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                  </svg>
                  <span className="text-[8px] sm:text-[9px] font-bold text-white tracking-widest mt-0.5 uppercase">
                    RADAR
                  </span>
                </div>
              </div>
            );

          case 'traffic_jam':
            // Official Road Warning Sign: Congestion / Traffic Jam (საგზაო ნიშანი 1.34)
            return (
              <div className="flex flex-col items-center justify-center">
                <svg className="w-24 h-22 sm:w-28 sm:h-24 drop-shadow-md" viewBox="0 0 100 86">
                  {/* Outer Red Triangle */}
                  <polygon points="50,4 96,82 4,82" fill="#DC2626" />
                  {/* Inner Yellow / White Triangle */}
                  <polygon points="50,14 88,76 12,76" fill="#FFFFFF" />
                  {/* 3 Queued Cars Pictogram in Solid Black */}
                  <g fill="#0F172A">
                    {/* Car 1 */}
                    <rect x="35" y="60" width="30" height="9" rx="2" />
                    <circle cx="42" cy="70" r="2.5" fill="#0F172A" />
                    <circle cx="58" cy="70" r="2.5" fill="#0F172A" />
                    <path d="M40,60 L44,53 L56,53 L60,60 Z" />
                    {/* Car 2 (higher) */}
                    <rect x="39" y="44" width="22" height="7" rx="1.5" />
                    <path d="M43,44 L46,39 L54,39 L57,44 Z" />
                    {/* Car 3 (lead) */}
                    <rect x="42" y="32" width="16" height="5" rx="1" />
                  </g>
                </svg>
                <span className="mt-1 px-2.5 py-0.5 rounded-md bg-white/10 text-slate-200 text-[10px] font-bold tracking-wide uppercase">
                  საცობი • TRAFFIC
                </span>
              </div>
            );

          case 'fuel':
            // Official Blue Highway Service Sign: Gas Station (ნიშანი 7.1)
            return (
              <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl bg-[#1E40AF] border-2 border-white p-2 flex flex-col items-center justify-between shadow-md">
                <div className="w-full flex justify-between items-center px-1">
                  <span className="text-[8px] font-mono font-bold text-white/80">7.1</span>
                  <span className="text-[8px] font-bold text-amber-300">GULF • WISSOL</span>
                </div>
                {/* Standard fuel pump pictogram */}
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.5 5.5v12a1.5 1.5 0 0 1-3 0v-6.5a1 1 0 0 0-1-1H14V4h-1v6H6a2 2 0 0 0-2 2v8h10v-5h1.5a2.5 2.5 0 0 0 2.5-2.5V8.83a3 3 0 0 0 1-2.33 3 3 0 0 0-3-3zM7 6h5v3H7V6z" />
                </svg>
                <span className="text-[9px] font-bold text-white tracking-wider uppercase">
                  ავტოგასამართი
                </span>
              </div>
            );

          case 'charging':
            // Official Highway Service Sign: EV Charging Station
            return (
              <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl bg-[#047857] border-2 border-white p-2 flex flex-col items-center justify-between shadow-md">
                <div className="w-full flex justify-between items-center px-1">
                  <span className="text-[8px] font-mono font-bold text-white/80">EV</span>
                  <span className="text-[8px] font-bold text-emerald-200">DC / AC</span>
                </div>
                {/* Electric vehicle + plug pictogram */}
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
                    <circle cx="7.5" cy="14.5" r="1.5" />
                    <circle cx="16.5" cy="14.5" r="1.5" />
                  </svg>
                  <span className="text-xl font-bold text-amber-300">⚡</span>
                </div>
                <span className="text-[9px] font-bold text-white tracking-wider uppercase">
                  EV დამტენი
                </span>
              </div>
            );

          case 'service':
            // Official Blue Highway Service Sign: Auto Repair Workshop (ნიშანი 7.4)
            return (
              <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl bg-[#1E40AF] border-2 border-white p-2 flex flex-col items-center justify-between shadow-md">
                <div className="w-full flex justify-between items-center px-1">
                  <span className="text-[8px] font-mono font-bold text-white/80">7.4</span>
                  <span className="text-[8px] font-bold text-white/80">SERVICE</span>
                </div>
                {/* Crossed wrench and hammer pictogram */}
                <svg className="w-8 h-8 sm:w-9 sm:h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
                <span className="text-[9px] font-bold text-white tracking-wider uppercase">
                  ავტოსერვისი
                </span>
              </div>
            );

          case 'car_wash':
            // Official Blue Highway Service Sign: Car Wash (ნიშანი 7.3)
            return (
              <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl bg-[#1E40AF] border-2 border-white p-2 flex flex-col items-center justify-between shadow-md">
                <div className="w-full flex justify-between items-center px-1">
                  <span className="text-[8px] font-mono font-bold text-white/80">7.3</span>
                  <span className="text-[8px] font-bold text-sky-200">WASH</span>
                </div>
                {/* Car wash shower pictogram */}
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 9.01C18.72 8.42 18.16 8 17.5 8h-11c-.66 0-1.21.42-1.42 1.01L3 15v6c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-6l-2.08-5.99zM6.85 10h10.29l1.08 3.11H5.77L6.85 10zM19 19H5v-3.66l.12-.34h13.77l.11.34V19z" />
                  <circle cx="12" cy="3" r="1.5" />
                  <circle cx="8" cy="5" r="1" />
                  <circle cx="16" cy="5" r="1" />
                </svg>
                <span className="text-[9px] font-bold text-white tracking-wider uppercase">
                  ავტოსამრეცხაო
                </span>
              </div>
            );

          case 'parts':
            // Official Blue Service Sign: Spare Parts & Store
            return (
              <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl bg-[#1E40AF] border-2 border-white p-2 flex flex-col items-center justify-between shadow-md">
                <div className="w-full flex justify-between items-center px-1">
                  <span className="text-[8px] font-mono font-bold text-white/80">PARTS</span>
                  <span className="text-[8px] font-bold text-amber-300">OEM</span>
                </div>
                {/* Gear / Mechanical part pictogram */}
                <svg className="w-8 h-8 sm:w-9 sm:h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span className="text-[9px] font-bold text-white tracking-wider uppercase">
                  ავტონაწილები
                </span>
              </div>
            );

          case 'road_repair':
            // Official Road Warning Sign: Road Works (საგზაო ნიშანი 1.25)
            return (
              <div className="flex flex-col items-center justify-center">
                <svg className="w-24 h-22 sm:w-28 sm:h-24 drop-shadow-md" viewBox="0 0 100 86">
                  {/* Outer Red Triangle */}
                  <polygon points="50,4 96,82 4,82" fill="#DC2626" />
                  {/* Inner Yellow Triangle (Road works warning sign) */}
                  <polygon points="50,14 88,76 12,76" fill="#FBBF24" />
                  {/* Worker with shovel pictogram */}
                  <g fill="#0F172A">
                    <circle cx="56" cy="36" r="4.5" />
                    <path d="M52,43 L45,55 L38,55 L38,58 L47,58 L54,47 L58,54 L52,70 L56,70 L61,56 L64,68 L68,68 L64,52 L57,43 Z" />
                    <line x1="38" y1="58" x2="33" y2="72" stroke="#0F172A" strokeWidth="2.5" />
                    <polygon points="30,70 36,70 33,75" />
                  </g>
                </svg>
                <span className="mt-1 px-2.5 py-0.5 rounded-md bg-white/10 text-slate-200 text-[10px] font-bold tracking-wide uppercase">
                  რემონტი • ROAD WORKS
                </span>
              </div>
            );

          case 'hazard':
            // Official Road Warning Sign: Other Hazards / Caution (საგზაო ნიშანი 1.33)
            return (
              <div className="flex flex-col items-center justify-center">
                <svg className="w-24 h-22 sm:w-28 sm:h-24 drop-shadow-md" viewBox="0 0 100 86">
                  {/* Outer Red Triangle */}
                  <polygon points="50,4 96,82 4,82" fill="#DC2626" />
                  {/* Inner Yellow Triangle */}
                  <polygon points="50,14 88,76 12,76" fill="#FBBF24" />
                  {/* Exclamation point pictogram */}
                  <g fill="#0F172A">
                    <rect x="47" y="32" width="6" height="24" rx="3" />
                    <circle cx="50" cy="65" r="4" />
                  </g>
                </svg>
                <span className="mt-1 px-2.5 py-0.5 rounded-md bg-white/10 text-slate-200 text-[10px] font-bold tracking-wide uppercase">
                  საფრთხე • CAUTION
                </span>
              </div>
            );

          case 'showroom':
            // Official Blue Highway Information Sign: Dealership / Showroom
            return (
              <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl bg-[#1E40AF] border-2 border-white p-2 flex flex-col items-center justify-between shadow-md">
                <div className="w-full flex justify-between items-center px-1">
                  <span className="text-[8px] font-mono font-bold text-white/80">DEALER</span>
                  <span className="text-[8px] font-bold text-amber-300">AUTO</span>
                </div>
                {/* Official Dealership Building & Car silhouette */}
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                </svg>
                <span className="text-[9px] font-bold text-white tracking-wider uppercase">
                  ავტოსალონი
                </span>
              </div>
            );

          default:
            return null;
        }
      })()}
    </div>
  );
};
