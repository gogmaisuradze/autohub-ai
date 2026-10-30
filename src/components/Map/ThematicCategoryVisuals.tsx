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
 * Authentic, grounded (დაჯდარი), refined (დახვეწილი) official traffic road signs (საგზაო ნიშნები).
 * Follows Vienna Convention / Georgian standard road signage aesthetics:
 * - High-precision vector geometry
 * - Authentic highway sign colors (Vienna Blue #1D4ED8, Traffic Red #DC2626, Traffic Amber #F59E0B, Service Green #047857)
 * - Corner mounting rivets
 * - Authentic inner white border margin
 * - Clear, elegant road typography (sans-serif, bold, high-contrast)
 * - No neon glows, no laser arcs — pure official road signage.
 */
export const ThematicCategoryVisual: React.FC<VisualProps> = ({
  categoryKey,
  isSelected = false
}) => {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center p-2.5 sm:p-3 select-none overflow-hidden transition-colors duration-300 ${
        isSelected
          ? 'bg-gradient-to-b from-[#162238] to-[#0D1525]'
          : 'bg-gradient-to-b from-[#243044] to-[#172232]'
      }`}
    >
      {/* Subtle road asphalt / metallic signplate sheen */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.08),transparent_75%)] pointer-events-none" />

      {(() => {
        switch (categoryKey) {
          case 'radar':
            // Official Speed Camera / Radar Sign (Vienna 5.27 & 3.24)
            return (
              <svg className="w-full h-full max-w-[260px] max-h-[145px] drop-shadow-md" viewBox="0 0 260 145">
                {/* Main Blue Highway Signplate */}
                <rect x="10" y="8" width="240" height="129" rx="14" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="3" />
                <rect x="14" y="12" width="232" height="121" rx="11" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />

                {/* Corner Mounting Rivets */}
                <circle cx="22" cy="20" r="2.5" fill="#CBD5E1" />
                <circle cx="238" cy="20" r="2.5" fill="#CBD5E1" />
                <circle cx="22" cy="125" r="2.5" fill="#CBD5E1" />
                <circle cx="238" cy="125" r="2.5" fill="#CBD5E1" />

                {/* Speed Limit Disc 80 km/h (Left) */}
                <circle cx="68" cy="72" r="38" fill="#FFFFFF" stroke="#DC2626" strokeWidth="8" />
                <text x="68" y="82" fill="#0F172A" fontSize="30" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">80</text>

                {/* Official Speed Camera Pictogram (Right) */}
                <g fill="#FFFFFF" transform="translate(132, 34)">
                  {/* Camera Body */}
                  <rect x="10" y="18" width="60" height="42" rx="6" />
                  {/* Camera Top Flash / Sensor */}
                  <polygon points="26,18 36,8 54,8 60,18" />
                  <circle cx="50" cy="13" r="2.5" fill="#1D4ED8" />
                  {/* Lens */}
                  <circle cx="40" cy="39" r="14" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="3" />
                  <circle cx="40" cy="39" r="6" fill="#FFFFFF" />
                  {/* Radar Wave emissions */}
                  <path d="M76 28 A 18 18 0 0 1 76 50" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  <path d="M84 22 A 28 28 0 0 1 84 56" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7" />
                </g>

                {/* Official Road Label */}
                <text x="172" y="116" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="1">
                  რადარი • 5.27
                </text>
              </svg>
            );

          case 'traffic_jam':
            // Official Warning Sign 1.34 (საცობი / ტრანსპორტის შეფერხება)
            return (
              <svg className="w-full h-full max-w-[260px] max-h-[145px] drop-shadow-md" viewBox="0 0 260 145">
                {/* Triangular Warning Signplate */}
                <g transform="translate(70, 6)">
                  {/* Outer Red Triangle */}
                  <polygon points="60,4 120,118 0,118" fill="#DC2626" stroke="#991B1B" strokeWidth="2" strokeLinejoin="round" />
                  {/* Inner White Plate */}
                  <polygon points="60,18 108,110 12,110" fill="#FFFFFF" />

                  {/* 3 Queued Vehicles in Solid Black (Standard Vienna Convention) */}
                  <g fill="#0F172A">
                    {/* Bottom Car */}
                    <rect x="36" y="85" width="48" height="14" rx="3" />
                    <circle cx="48" cy="100" r="3.5" />
                    <circle cx="72" cy="100" r="3.5" />
                    <path d="M43,85 L49,74 L71,74 L77,85 Z" />

                    {/* Middle Car */}
                    <rect x="42" y="60" width="36" height="11" rx="2" />
                    <path d="M48,60 L52,52 L68,52 L72,60 Z" />

                    {/* Top Car */}
                    <rect x="47" y="42" width="26" height="8" rx="1.5" />
                    <path d="M51,42 L54,36 L66,36 L69,42 Z" />
                  </g>
                </g>

                {/* Official Road Sub-plate */}
                <rect x="55" y="124" width="150" height="18" rx="4" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="130" y="137" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.8">
                  საცობი • JAM (1.34)
                </text>
              </svg>
            );

          case 'fuel':
            // Official Blue Highway Service Sign 7.1 (ავტოგასამართი სადგური)
            return (
              <svg className="w-full h-full max-w-[260px] max-h-[145px] drop-shadow-md" viewBox="0 0 260 145">
                {/* Main Blue Plate */}
                <rect x="15" y="8" width="230" height="129" rx="14" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="3" />
                <rect x="19" y="12" width="222" height="121" rx="11" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />

                {/* Corner Rivets */}
                <circle cx="26" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="26" cy="126" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="126" r="2.5" fill="#CBD5E1" />

                {/* Left: Classic Gas Pump Dispenser Icon */}
                <g fill="#FFFFFF" transform="translate(36, 24)">
                  <rect x="10" y="14" width="40" height="66" rx="4" />
                  <rect x="16" y="22" width="28" height="20" rx="2" fill="#1D4ED8" />
                  <text x="30" y="36" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">95</text>
                  <rect x="14" y="80" width="32" height="5" rx="1" />
                  {/* Hose & Nozzle */}
                  <path d="M50 26 C 62 26, 68 40, 68 60 L 68 76 L 63 76 L 63 56 C 63 44, 58 36, 50 36" fill="#FFFFFF" />
                  <rect x="61" y="44" width="10" height="14" rx="2" fill="#FFFFFF" />
                  <path d="M66 44 L 66 34 L 60 30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>

                {/* Right: Road Identification & Brand badges */}
                <g transform="translate(132, 38)">
                  <rect x="0" y="0" width="98" height="26" rx="6" fill="#FFFFFF" />
                  <text x="49" y="18" fill="#1D4ED8" fontSize="13" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    GULF • WISSOL
                  </text>

                  <rect x="0" y="32" width="98" height="22" rx="5" fill="#FFFFFF" fillOpacity="0.15" stroke="#FFFFFF" strokeWidth="1" />
                  <text x="49" y="47" fill="#FFFFFF" fontSize="10" fontWeight="800" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    SOCAR • ROMP.
                  </text>

                  <text x="49" y="76" fill="#FDE047" fontSize="11" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.8">
                    ავტოგასამართი 7.1
                  </text>
                </g>
              </svg>
            );

          case 'charging':
            // Official Green Highway Service Sign: Electric Vehicle Charging
            return (
              <svg className="w-full h-full max-w-[260px] max-h-[145px] drop-shadow-md" viewBox="0 0 260 145">
                {/* Main Green Plate */}
                <rect x="15" y="8" width="230" height="129" rx="14" fill="#047857" stroke="#FFFFFF" strokeWidth="3" />
                <rect x="19" y="12" width="222" height="121" rx="11" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />

                {/* Corner Rivets */}
                <circle cx="26" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="26" cy="126" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="126" r="2.5" fill="#CBD5E1" />

                {/* EV Car & Charging Plug Symbol */}
                <g fill="#FFFFFF" transform="translate(34, 28)">
                  {/* Car Profile */}
                  <path d="M10 50 L 16 36 L 44 36 L 56 50 L 72 50 C 75 50, 78 53, 78 57 L 78 68 L 74 68 C 74 64, 70 60, 65 60 C 60 60, 56 64, 56 68 L 26 68 C 26 64, 22 60, 17 60 C 12 60, 8 64, 8 68 L 4 68 C 2 68, 0 66, 0 63 L 0 54 C 0 52, 2 50, 4 50 Z" />
                  <circle cx="17" cy="68" r="7" fill="#047857" stroke="#FFFFFF" strokeWidth="3" />
                  <circle cx="65" cy="68" r="7" fill="#047857" stroke="#FFFFFF" strokeWidth="3" />
                  <circle cx="24" cy="43" r="4" fill="#047857" />
                  <circle cx="42" cy="43" r="4" fill="#047857" />

                  {/* Charging Plug with Lightning */}
                  <rect x="86" y="24" width="24" height="38" rx="4" />
                  <line x1="92" y1="14" x2="92" y2="24" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                  <line x1="104" y1="14" x2="104" y2="24" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                  <path d="M98 62 L 98 76 L 76 76" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                  {/* Lightning icon inside charger */}
                  <polygon points="98,30 94,42 99,42 97,54 104,40 99,40" fill="#047857" />
                </g>

                {/* Right Labels */}
                <g transform="translate(150, 42)">
                  <rect x="0" y="0" width="84" height="24" rx="5" fill="#FFFFFF" />
                  <text x="42" y="17" fill="#047857" fontSize="12" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    EV FAST
                  </text>

                  <text x="42" y="44" fill="#A7F3D0" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    CCS2 • 150 kW
                  </text>

                  <text x="42" y="68" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.8">
                    დამტენი სადგური
                  </text>
                </g>
              </svg>
            );

          case 'service':
            // Official Blue Highway Service Sign 7.4 (ტექნიკური მომსახურება)
            return (
              <svg className="w-full h-full max-w-[260px] max-h-[145px] drop-shadow-md" viewBox="0 0 260 145">
                <rect x="15" y="8" width="230" height="129" rx="14" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="3" />
                <rect x="19" y="12" width="222" height="121" rx="11" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />

                <circle cx="26" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="26" cy="126" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="126" r="2.5" fill="#CBD5E1" />

                {/* Crossed Wrench & Hammer Sign Pictogram */}
                <g fill="#FFFFFF" transform="translate(42, 22)">
                  <circle cx="45" cy="45" r="38" fill="#FFFFFF" fillOpacity="0.12" />
                  {/* Wrench */}
                  <g transform="rotate(45, 45, 45)">
                    <rect x="41" y="10" width="8" height="70" rx="3" />
                    <circle cx="45" cy="16" r="14" fill="#FFFFFF" />
                    <polygon points="45,4 49,18 41,18" fill="#1D4ED8" />
                    <circle cx="45" cy="16" r="7" fill="#1D4ED8" />
                  </g>
                  {/* Hammer */}
                  <g transform="rotate(-45, 45, 45)">
                    <rect x="41" y="12" width="8" height="68" rx="2" />
                    <rect x="31" y="12" width="28" height="14" rx="3" fill="#FFFFFF" />
                  </g>
                </g>

                {/* Right Labels */}
                <g transform="translate(142, 40)">
                  <rect x="0" y="0" width="94" height="24" rx="5" fill="#FFFFFF" />
                  <text x="47" y="17" fill="#1D4ED8" fontSize="12" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    SERVICE 7.4
                  </text>

                  <text x="47" y="44" fill="#BFDBFE" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    ვულკანიზაცია
                  </text>

                  <text x="47" y="68" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.8">
                    დიაგნოსტიკა • სავალი
                  </text>
                </g>
              </svg>
            );

          case 'car_wash':
            // Official Blue Highway Service Sign 7.3 (ავტომობილების რეცხვა)
            return (
              <svg className="w-full h-full max-w-[260px] max-h-[145px] drop-shadow-md" viewBox="0 0 260 145">
                <rect x="15" y="8" width="230" height="129" rx="14" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="3" />
                <rect x="19" y="12" width="222" height="121" rx="11" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />

                <circle cx="26" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="26" cy="126" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="126" r="2.5" fill="#CBD5E1" />

                {/* Car Silhouette with Overhead Shower Spray */}
                <g fill="#FFFFFF" transform="translate(36, 26)">
                  {/* Overhead Showerhead */}
                  <rect x="26" y="8" width="36" height="7" rx="2" />
                  <line x1="44" y1="2" x2="44" y2="8" stroke="#FFFFFF" strokeWidth="3" />
                  {/* Water Droplet Rays */}
                  <circle cx="32" cy="22" r="2" />
                  <circle cx="44" cy="22" r="2" />
                  <circle cx="56" cy="22" r="2" />
                  <circle cx="26" cy="30" r="1.8" />
                  <circle cx="38" cy="30" r="1.8" />
                  <circle cx="50" cy="30" r="1.8" />
                  <circle cx="62" cy="30" r="1.8" />

                  {/* Car Profile */}
                  <path d="M12 56 L 22 42 L 56 42 L 68 56 L 80 56 C 83 56, 86 59, 86 63 L 86 74 L 80 74 C 80 70, 76 66, 71 66 C 66 66, 62 70, 62 74 L 30 74 C 30 70, 26 66, 21 66 C 16 66, 12 70, 12 74 L 6 74 C 3 74, 1 72, 1 69 L 1 60 C 1 58, 3 56, 6 56 Z" />
                  <circle cx="21" cy="74" r="6" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="3" />
                  <circle cx="71" cy="74" r="6" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="3" />
                </g>

                {/* Right Labels */}
                <g transform="translate(142, 40)">
                  <rect x="0" y="0" width="94" height="24" rx="5" fill="#FFFFFF" />
                  <text x="47" y="17" fill="#1D4ED8" fontSize="12" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    WASH 7.3
                  </text>

                  <text x="47" y="44" fill="#BAE6FD" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    თვითმომსახურება
                  </text>

                  <text x="47" y="68" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.8">
                    ტურბო-ქაფი • 902
                  </text>
                </g>
              </svg>
            );

          case 'parts':
            // Official Blue Service Sign: Spare Parts & Component Store
            return (
              <svg className="w-full h-full max-w-[260px] max-h-[145px] drop-shadow-md" viewBox="0 0 260 145">
                <rect x="15" y="8" width="230" height="129" rx="14" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="3" />
                <rect x="19" y="12" width="222" height="121" rx="11" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />

                <circle cx="26" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="26" cy="126" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="126" r="2.5" fill="#CBD5E1" />

                {/* Precision Mechanical Gear & Piston Pictogram */}
                <g fill="#FFFFFF" transform="translate(42, 25)">
                  {/* Outer gear ring */}
                  <circle cx="44" cy="44" r="32" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeDasharray="14 9" />
                  <circle cx="44" cy="44" r="22" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="4" />
                  <circle cx="44" cy="44" r="8" fill="#FFFFFF" />
                  {/* Offset mini gear */}
                  <circle cx="70" cy="62" r="14" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="8 5" />
                  <circle cx="70" cy="62" r="5" fill="#FFFFFF" />
                </g>

                {/* Right Labels */}
                <g transform="translate(142, 40)">
                  <rect x="0" y="0" width="94" height="24" rx="5" fill="#FFFFFF" />
                  <text x="47" y="17" fill="#1D4ED8" fontSize="12" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    OEM PARTS
                  </text>

                  <text x="47" y="44" fill="#E9D5FF" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    ორიგინალი ნაწილები
                  </text>

                  <text x="47" y="68" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.8">
                    ზეთები • დეტალები
                  </text>
                </g>
              </svg>
            );

          case 'road_repair':
            // Official Warning Sign 1.25 (საგზაო სამუშაოები)
            return (
              <svg className="w-full h-full max-w-[260px] max-h-[145px] drop-shadow-md" viewBox="0 0 260 145">
                <g transform="translate(70, 6)">
                  {/* Outer Red Triangle */}
                  <polygon points="60,4 120,118 0,118" fill="#DC2626" stroke="#991B1B" strokeWidth="2" strokeLinejoin="round" />
                  {/* Inner Traffic Amber/Yellow Plate */}
                  <polygon points="60,18 108,110 12,110" fill="#F59E0B" />

                  {/* Vienna Convention Worker with Shovel in Solid Black */}
                  <g fill="#0F172A">
                    <circle cx="68" cy="42" r="5.5" />
                    <path d="M64,50 L56,66 L47,66 L47,70 L58,70 L66,56 L72,64 L65,86 L70,86 L76,68 L80,82 L85,82 L79,62 L71,50 Z" />
                    {/* Shovel Handle & Blade */}
                    <line x1="47" y1="70" x2="38" y2="88" stroke="#0F172A" strokeWidth="3" />
                    <polygon points="34,86 42,86 38,94" />
                    {/* Soil pile */}
                    <path d="M26,94 Q 38,82 50,94 Z" />
                  </g>
                </g>

                {/* Sub-plate */}
                <rect x="45" y="124" width="170" height="18" rx="4" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="130" y="137" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.8">
                  სამუშაოები • WORKS (1.25)
                </text>
              </svg>
            );

          case 'hazard':
            // Official Warning Sign 1.33 (სხვა საგზაო საფრთხეები)
            return (
              <svg className="w-full h-full max-w-[260px] max-h-[145px] drop-shadow-md" viewBox="0 0 260 145">
                <g transform="translate(70, 6)">
                  {/* Outer Red Triangle */}
                  <polygon points="60,4 120,118 0,118" fill="#DC2626" stroke="#991B1B" strokeWidth="2" strokeLinejoin="round" />
                  {/* Inner Yellow Plate */}
                  <polygon points="60,18 108,110 12,110" fill="#F59E0B" />

                  {/* Standard Exclamation Point '!' in Solid Black */}
                  <g fill="#0F172A">
                    <rect x="55" y="38" width="10" height="38" rx="5" />
                    <circle cx="60" cy="90" r="6" />
                  </g>
                </g>

                {/* Sub-plate */}
                <rect x="45" y="124" width="170" height="18" rx="4" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="130" y="137" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.8">
                  საფრთხე • CAUTION (1.33)
                </text>
              </svg>
            );

          case 'showroom':
            // Official Blue Highway Information Sign: Dealership & Showrooms
            return (
              <svg className="w-full h-full max-w-[260px] max-h-[145px] drop-shadow-md" viewBox="0 0 260 145">
                <rect x="15" y="8" width="230" height="129" rx="14" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="3" />
                <rect x="19" y="12" width="222" height="121" rx="11" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />

                <circle cx="26" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="19" r="2.5" fill="#CBD5E1" />
                <circle cx="26" cy="126" r="2.5" fill="#CBD5E1" />
                <circle cx="234" cy="126" r="2.5" fill="#CBD5E1" />

                {/* Dealership Pavilion Architecture & Luxury Car Emblem */}
                <g fill="#FFFFFF" transform="translate(38, 25)">
                  {/* Pavilion Roof & Columns */}
                  <polygon points="10,24 45,8 80,24" />
                  <rect x="14" y="24" width="62" height="4" />
                  <rect x="18" y="28" width="8" height="42" />
                  <rect x="36" y="28" width="8" height="42" />
                  <rect x="54" y="28" width="8" height="42" />
                  <rect x="68" y="28" width="8" height="42" />
                  <rect x="12" y="70" width="70" height="6" rx="1" />

                  {/* Center Star / Quality Crest */}
                  <circle cx="45" cy="50" r="10" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2.5" />
                  <polygon points="45,43 47,48 52,48 48,51 50,56 45,53 40,56 42,51 38,48 43,48" fill="#FBBF24" />
                </g>

                {/* Right Labels */}
                <g transform="translate(142, 40)">
                  <rect x="0" y="0" width="94" height="24" rx="5" fill="#FFFFFF" />
                  <text x="47" y="17" fill="#1D4ED8" fontSize="12" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    DEALERSHIP
                  </text>

                  <text x="47" y="44" fill="#FEF08A" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif" textAnchor="middle">
                    ოფიციალური სალონი
                  </text>

                  <text x="47" y="68" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.8">
                    ავტოსალონები • 122
                  </text>
                </g>
              </svg>
            );

          default:
            return null;
        }
      })()}
    </div>
  );
};
