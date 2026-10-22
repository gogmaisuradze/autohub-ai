import React from 'react';
import { sounds } from '../services/soundEffects';
import {
  LayoutGrid,
  Activity,
  ShieldAlert,
  Bot,
  Wrench,
  MoreHorizontal,
  ParkingSquare,
  Sparkles
} from 'lucide-react';

export type TabType = 'home' | 'obd' | 'fines' | 'parking' | 'ai' | 'service' | 'garage' | 'settings';

interface Props {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  dtcCount: number;
  finesCount: number;
}

export const Navigation: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  dtcCount,
  finesCount
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label_ge: 'მთავარი',
      short_ge: 'ჰაბი',
      icon: LayoutGrid,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'obd' as TabType,
      label_ge: 'ტესტირება',
      short_ge: 'ტესტირება',
      icon: Activity,
      badge: dtcCount > 0 ? `${dtcCount}` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'fines' as TabType,
      label_ge: 'ჯარიმები',
      short_ge: 'ჯარიმები',
      icon: ShieldAlert,
      badge: finesCount > 0 ? `${finesCount}` : null,
      badgeColor: 'bg-gold text-navy font-bold'
    },
    {
      id: 'parking' as TabType,
      label_ge: 'პარკინგი',
      short_ge: 'პარკინგი',
      icon: ParkingSquare,
      badge: 'LIVE',
      badgeColor: 'bg-blue-600 text-white font-bold'
    },
    {
      id: 'service' as TabType,
      label_ge: 'სერვისი',
      short_ge: 'სერვისი',
      icon: Wrench,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'garage' as TabType,
      label_ge: 'მეტი',
      short_ge: 'მეტი',
      icon: MoreHorizontal,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500 text-white font-bold'
    },
    {
      id: 'ai' as TabType,
      label_ge: 'AI მექანიკოსი',
      short_ge: 'AI',
      icon: Bot,
      badge: 'PRO',
      badgeColor: 'bg-navy text-white'
    }
  ];

  // Mobile Primary 5 Quick Dock Tabs (Thumb reachable)
  const mobileDockTabs = [
    { id: 'home' as TabType, label: 'ჰაბი', icon: LayoutGrid, badge: null },
    { id: 'obd' as TabType, label: 'OBD', icon: Activity, badge: dtcCount > 0 ? dtcCount : null },
    { id: 'fines' as TabType, label: 'ჯარიმები', icon: ShieldAlert, badge: finesCount > 0 ? finesCount : null },
    { id: 'service' as TabType, label: 'სერვისი', icon: Wrench, badge: null },
    { id: 'ai' as TabType, label: 'AI ბოტი', icon: Bot, isSpecial: true }
  ];

  return (
    <>
      {/* 1. TOP HORIZONTAL PILL NAV (Optimized with touch-scroll on mobile, pills on desktop) */}
      <nav className="w-full bg-[#EDF1F7]/95 backdrop-blur-md border-b border-white/60 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-start gap-1.5 sm:gap-2 md:gap-3 py-2 sm:py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectTab(tab.id);
                  }}
                  className={`relative px-3 sm:px-3.5 md:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 active:scale-95 ${
                    isActive
                      ? 'neu-btn-active bg-white text-navy shadow-sm border border-gold/40 font-extrabold'
                      : 'neu-btn text-slate-600 hover:text-navy border border-white/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-gold' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{tab.label_ge}</span>
                  <span className="sm:hidden">{tab.short_ge}</span>

                  {tab.badge && (
                    <span className={`px-1.5 sm:px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-mono font-bold ${tab.badgeColor} shadow-sm`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 2. MOBILE BOTTOM DOCK BAR (Native iOS/Android App feel, Thumb Reachable) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#EDF1F7]/95 backdrop-blur-xl border-t border-white/90 px-2 py-1.5 shadow-[0_-6px_25px_rgba(20,33,61,0.12)] flex items-center justify-around">
        {mobileDockTabs.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                onSelectTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'bg-white text-navy shadow-xs border border-gold/40'
                  : 'text-slate-500 hover:text-navy'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 ${isActive ? (item.isSpecial ? 'text-gold' : 'text-navy') : 'text-slate-400'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 min-w-3.5 rounded-full text-[9px] font-mono font-black bg-rose-500 text-white text-center shadow-xs">
                    {item.badge}
                  </span>
                )}
                {item.isSpecial && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-gold animate-ping"></span>
                )}
              </div>
              <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-navy font-black' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
