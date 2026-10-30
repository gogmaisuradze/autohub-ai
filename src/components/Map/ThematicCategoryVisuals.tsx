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
  isFiltered = false,
  countText,
  badge
}) => {
  switch (categoryKey) {
    case 'radar':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#0e1726] via-[#141e33] to-[#0a101d] overflow-hidden flex items-center justify-center">
          {/* Ambient Radar Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.18),transparent_70%)]" />
          
          {/* Concentric Radar Grid Rings */}
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 400 250">
            <defs>
              <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="200" cy="125" r="105" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="200" cy="125" r="75" fill="none" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="200" cy="125" r="45" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="4 2" />
            <circle cx="200" cy="125" r="20" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="200" y1="20" x2="200" y2="230" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="2 4" />
            <line x1="95" y1="125" x2="305" y2="125" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="2 4" />
            {/* 45 Deg Crosshairs */}
            <line x1="125" y1="50" x2="275" y2="200" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="125" y1="200" x2="275" y2="50" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.4" />
          </svg>

          {/* Central Camera HUD & Laser Sensor */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Camera Lens Housing */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1e293b] border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center">
              {/* Outer Lens Ring */}
              <div className="w-14 h-14 rounded-full border border-amber-400/60 bg-slate-950 flex items-center justify-center relative">
                {/* Aperture Iris */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/40 via-amber-300/20 to-blue-500/20 border border-amber-400/80 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping opacity-75" />
                  <div className="w-3 h-3 rounded-full bg-amber-300 absolute" />
                </div>
              </div>
              {/* Top Sensor Notch */}
              <div className="absolute -top-1.5 w-6 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            </div>

            {/* Speed Limit Tag */}
            <div className="mt-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white border-2 border-red-600 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-md">
                60
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                RADAR • 300m SCAN
              </span>
            </div>
          </div>
        </div>
      );

    case 'traffic_jam':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#1a0a10] via-[#240e17] to-[#0e0609] overflow-hidden flex items-center justify-center">
          {/* Ambient Red Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(239,68,68,0.25),transparent_70%)]" />

          {/* Perspective Congested Highway Graphic */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
            {/* Highway Horizon Lines */}
            <polygon points="120,250 280,250 215,80 185,80" fill="rgba(30,12,18,0.85)" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="200" y1="250" x2="200" y2="80" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="10 8" strokeOpacity="0.6" />
            <line x1="160" y1="250" x2="192" y2="80" stroke="#f43f5e" strokeWidth="0.8" strokeDasharray="6 6" strokeOpacity="0.3" />
            <line x1="240" y1="250" x2="208" y2="80" stroke="#f43f5e" strokeWidth="0.8" strokeDasharray="6 6" strokeOpacity="0.3" />

            {/* Glowing Red Taillights in Traffic Rows */}
            {/* Lane 1 */}
            <ellipse cx="170" cy="210" rx="14" ry="4" fill="#ef4444" opacity="0.9" />
            <ellipse cx="170" cy="210" rx="22" ry="6" fill="#ef4444" opacity="0.3" />
            <ellipse cx="180" cy="165" rx="10" ry="3" fill="#ef4444" opacity="0.85" />
            <ellipse cx="188" cy="130" rx="7" ry="2" fill="#ef4444" opacity="0.75" />

            {/* Lane 2 */}
            <ellipse cx="230" cy="210" rx="14" ry="4" fill="#ef4444" opacity="0.9" />
            <ellipse cx="230" cy="210" rx="22" ry="6" fill="#ef4444" opacity="0.3" />
            <ellipse cx="220" cy="165" rx="10" ry="3" fill="#ef4444" opacity="0.85" />
            <ellipse cx="212" cy="130" rx="7" ry="2" fill="#ef4444" opacity="0.75" />

            {/* Traffic Congestion Alert Badge */}
            <circle cx="200" cy="65" r="16" fill="#ef4444" opacity="0.2" />
          </svg>

          {/* Central Congestion Warning HUD */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-950 to-slate-900 border-2 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.4)] flex items-center justify-center">
              <span className="text-2xl">🚗</span>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-sm">
                !
              </div>
            </div>
            <div className="mt-2 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-400/40 text-rose-300 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>LIVE TRAFFIC JAM</span>
            </div>
          </div>
        </div>
      );

    case 'fuel':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#071913] via-[#0d271f] to-[#04100c] overflow-hidden flex items-center justify-center">
          {/* Ambient Emerald Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)]" />

          {/* High Tech Fuel Pump & Price Display SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 250">
            {/* Grid Lines */}
            <line x1="40" y1="200" x2="360" y2="200" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="200" cy="125" r="90" fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="4 4" />
          </svg>

          {/* Central Fuel Dispenser Nozzle & Digital Price Board */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-950 to-emerald-950/80 border-2 border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center p-2">
              <div className="w-full h-full rounded-xl bg-slate-900 border border-emerald-500/40 flex flex-col items-center justify-center">
                <span className="text-2xl">⛽</span>
                <span className="text-[9px] font-mono font-black text-emerald-400 tracking-wider">
                  95 · 3.12₾
                </span>
              </div>
            </div>

            {/* Fuel Brand Strip */}
            <div className="mt-2 flex items-center gap-1.5 bg-emerald-500/15 px-2.5 py-0.5 rounded-md border border-emerald-400/30 text-emerald-300 font-mono text-[10px] font-black">
              <span>GULF</span>
              <span>•</span>
              <span>WISSOL</span>
              <span>•</span>
              <span>SOCAR</span>
            </div>
          </div>
        </div>
      );

    case 'charging':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#061720] via-[#0c2433] to-[#040e14] overflow-hidden flex items-center justify-center">
          {/* Ambient Cyan Lightning Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.22),transparent_70%)]" />

          {/* Circuit Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 400 250">
            <path d="M60,125 L140,125 L160,80 L240,80 L260,125 L340,125" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="140" cy="125" r="4" fill="#06b6d4" />
            <circle cx="260" cy="125" r="4" fill="#06b6d4" />
          </svg>

          {/* Central Fast Charging Plug */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-950 to-cyan-950/80 border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center p-2">
              <div className="w-full h-full rounded-xl bg-slate-900 border border-cyan-400/40 flex flex-col items-center justify-center">
                <span className="text-2xl animate-pulse">⚡</span>
                <span className="text-[9px] font-mono font-black text-cyan-300 tracking-wider">
                  150 kW DC
                </span>
              </div>
            </div>

            <div className="mt-2 bg-cyan-500/15 px-2.5 py-0.5 rounded-md border border-cyan-400/30 text-cyan-300 font-mono text-[10px] font-black uppercase tracking-wider">
              CCS2 · CHAdeMO · TYPE 2
            </div>
          </div>
        </div>
      );

    case 'service':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#0c0e24] via-[#141638] to-[#070817] overflow-hidden flex items-center justify-center">
          {/* Ambient Indigo Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.22),transparent_70%)]" />

          {/* Brake Rotor & Oscilloscope Wireframe */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 250">
            <circle cx="200" cy="125" r="85" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="5 3" />
            <circle cx="200" cy="125" r="55" fill="none" stroke="#6366f1" strokeWidth="0.8" />
            {/* Ventilated holes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, idx) => (
              <circle key={idx} cx={200 + 70 * Math.cos(ang * Math.PI / 180)} cy={125 + 70 * Math.sin(ang * Math.PI / 180)} r="3" fill="#6366f1" />
            ))}
          </svg>

          {/* Central Mechanical Wrench & Rotor */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950/80 border-2 border-indigo-400/80 shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center p-2">
              <div className="w-full h-full rounded-xl bg-slate-900 border border-indigo-400/40 flex flex-col items-center justify-center">
                <span className="text-2xl">🔧</span>
                <span className="text-[9px] font-mono font-black text-indigo-300 tracking-wider">
                  OBD · სავალი
                </span>
              </div>
            </div>

            <div className="mt-2 bg-indigo-500/15 px-2.5 py-0.5 rounded-md border border-indigo-400/30 text-indigo-300 font-mono text-[10px] font-black uppercase tracking-wider">
              24/7 ვულკანიზაცია · სერვისი
            </div>
          </div>
        </div>
      );

    case 'car_wash':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#061826] via-[#0a2336] to-[#040e17] overflow-hidden flex items-center justify-center">
          {/* Ambient Sky Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.22),transparent_70%)]" />

          {/* Water Droplet & Spray Arcs */}
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 400 250">
            <circle cx="150" cy="90" r="10" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="260" cy="100" r="14" fill="none" stroke="#0ea5e9" strokeWidth="1" />
            <circle cx="240" cy="170" r="8" fill="none" stroke="#0ea5e9" strokeWidth="1" />
            <circle cx="130" cy="160" r="12" fill="none" stroke="#0ea5e9" strokeWidth="1" />
          </svg>

          {/* Central Wash Foam Spray */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-950 to-sky-950/80 border-2 border-sky-400/80 shadow-[0_0_30px_rgba(14,165,233,0.4)] flex items-center justify-center p-2">
              <div className="w-full h-full rounded-xl bg-slate-900 border border-sky-400/40 flex flex-col items-center justify-center">
                <span className="text-2xl">💧</span>
                <span className="text-[9px] font-mono font-black text-sky-300 tracking-wider">
                  TURBO FOAM
                </span>
              </div>
            </div>

            <div className="mt-2 bg-sky-500/15 px-2.5 py-0.5 rounded-md border border-sky-400/30 text-sky-300 font-mono text-[10px] font-black uppercase tracking-wider">
              თვითმომსახურება · ქიმწმენდა
            </div>
          </div>
        </div>
      );

    case 'parts':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#160824] via-[#220d36] to-[#0c0414] overflow-hidden flex items-center justify-center">
          {/* Ambient Purple Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.22),transparent_70%)]" />

          {/* Interlocking Gears Silhouette */}
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 400 250">
            <circle cx="160" cy="125" r="45" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="8 4" />
            <circle cx="240" cy="125" r="35" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 3" />
          </svg>

          {/* Central Gear & Piston */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-950 to-purple-950/80 border-2 border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center p-2">
              <div className="w-full h-full rounded-xl bg-slate-900 border border-purple-400/40 flex flex-col items-center justify-center">
                <span className="text-2xl">⚙️</span>
                <span className="text-[9px] font-mono font-black text-purple-300 tracking-wider">
                  OEM PARTS
                </span>
              </div>
            </div>

            <div className="mt-2 bg-purple-500/15 px-2.5 py-0.5 rounded-md border border-purple-400/30 text-purple-300 font-mono text-[10px] font-black uppercase tracking-wider">
              ნაწილები · ზეთები · დეტალები
            </div>
          </div>
        </div>
      );

    case 'road_repair':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#1f1004] via-[#2c1808] to-[#120902] overflow-hidden flex items-center justify-center">
          {/* Ambient Orange Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.22),transparent_70%)]" />

          {/* Diagonal Hazard Stripes Overlay */}
          <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#f97316,#f97316_10px,#000_10px,#000_20px)]" />

          {/* Central Traffic Cone & Barrier */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-950 to-orange-950/80 border-2 border-orange-400/80 shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center justify-center p-2">
              <div className="w-full h-full rounded-xl bg-slate-900 border border-orange-400/40 flex flex-col items-center justify-center">
                <span className="text-2xl">🚧</span>
                <span className="text-[9px] font-mono font-black text-orange-300 tracking-wider">
                  DETOUR / რემონტი
                </span>
              </div>
            </div>

            <div className="mt-2 bg-orange-500/15 px-2.5 py-0.5 rounded-md border border-orange-400/30 text-orange-300 font-mono text-[10px] font-black uppercase tracking-wider">
              საგზაო სამუშაოები & შეზღუდვა
            </div>
          </div>
        </div>
      );

    case 'hazard':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#24060b] via-[#330a11] to-[#140306] overflow-hidden flex items-center justify-center">
          {/* Ambient Danger Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.25),transparent_70%)]" />

          {/* Caution Ripples */}
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 400 250">
            <polygon points="200,40 280,180 120,180" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 2" />
          </svg>

          {/* Central Hazard Triangle */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-950 to-rose-950/80 border-2 border-rose-500/80 shadow-[0_0_30px_rgba(225,29,72,0.4)] flex items-center justify-center p-2">
              <div className="w-full h-full rounded-xl bg-slate-900 border border-rose-500/40 flex flex-col items-center justify-center">
                <span className="text-2xl animate-bounce">⚠️</span>
                <span className="text-[9px] font-mono font-black text-rose-300 tracking-wider">
                  HAZARD ALERT
                </span>
              </div>
            </div>

            <div className="mt-2 bg-rose-500/15 px-2.5 py-0.5 rounded-md border border-rose-400/30 text-rose-300 font-mono text-[10px] font-black uppercase tracking-wider">
              მოყინვა · ნისლი · შემთხვევები
            </div>
          </div>
        </div>
      );

    case 'showroom':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#1f1604] via-[#2c2008] to-[#120d02] overflow-hidden flex items-center justify-center">
          {/* Ambient Champagne Gold Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,119,6,0.22),transparent_70%)]" />

          {/* Spotlights and Pavilion Architecture */}
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 400 250">
            {/* Spotlights from Top Corners */}
            <polygon points="40,0 120,0 240,250 160,250" fill="url(#goldLightL)" opacity="0.3" />
            <polygon points="360,0 280,0 160,250 240,250" fill="url(#goldLightR)" opacity="0.3" />
            <defs>
              <linearGradient id="goldLightL" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="goldLightR" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Luxury Dealership Crest */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-950 to-amber-950/80 border-2 border-amber-400/80 shadow-[0_0_30px_rgba(217,119,6,0.4)] flex items-center justify-center p-2">
              <div className="w-full h-full rounded-xl bg-slate-900 border border-amber-400/40 flex flex-col items-center justify-center">
                <span className="text-2xl">🏢</span>
                <span className="text-[9px] font-mono font-black text-amber-300 tracking-wider">
                  OFFICIAL DEALER
                </span>
              </div>
            </div>

            <div className="mt-2 bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-400/30 text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider">
              პრემიუმ ავტოსალონები · 122 ცენტრი
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
