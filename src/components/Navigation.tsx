import React from 'react';
import { sounds } from '../services/soundEffects';
import {
  LayoutGrid,
  Activity,
  ShieldAlert,
  Wrench,
  ParkingSquare,
  Navigation as NavigationIcon
} from 'lucide-react';

export type TabType = 'home' | 'obd' | 'fines' | 'parking' | 'ai' | 'service' | 'map' | 'garage' | 'settings';

interface Props {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  dtcCount: number;
  finesCount: number;
  lang?: 'ge' | 'en';
}

export const Navigation: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  dtcCount,
  finesCount,
  lang = 'ge'
}) => {
  const isGe = lang === 'ge';

  const tabs = [
    {
      id: 'home' as TabType,
      label: isGe ? 'მთავარი' : 'Dashboard',
      icon: LayoutGrid,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'obd' as TabType,
      label: isGe ? 'დიაგნოსტიკა' : 'Diagnostics',
      icon: Activity,
      badge: dtcCount > 0 ? `${dtcCount}` : null,
      badgeColor: 'bg-rose-500 text-white font-black'
    },
    {
      id: 'fines' as TabType,
      label: isGe ? 'ჯარიმები' : 'Traffic Fines',
      icon: ShieldAlert,
      badge: finesCount > 0 ? `${finesCount}` : null,
      badgeColor: 'bg-[#FC8181] text-white font-black'
    },
    {
      id: 'parking' as TabType,
      label: isGe ? 'პარკინგი' : 'Parking',
      icon: ParkingSquare,
      badge: 'LIVE',
      badgeColor: 'bg-[#2563EB] text-white font-black'
    },
    {
      id: 'map' as TabType,
      label: isGe ? 'რუკა' : 'Live Map',
      icon: NavigationIcon,
      badge: 'LIVE',
      badgeColor: 'bg-[#06B6D4] text-white font-black'
    },
    {
      id: 'service' as TabType,
      label: isGe ? 'სერვისი' : 'Service Log',
      icon: Wrench,
      badge: null,
      badgeColor: ''
    }
  ];

  return (
    <nav
      data-tour="navigation-menu"
      className="w-full transition-colors border-t border-white/60 bg-[#ECEAE5]/90"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start md:justify-center gap-1.5 sm:gap-2.5 md:gap-4 lg:gap-5 py-2 sm:py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
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
                className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-white text-navy shadow-xs border border-slate-200/80 font-black'
                    : 'text-slate-600 hover:text-navy hover:bg-white/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors shrink-0 ${
                    isActive ? 'text-gold' : 'text-slate-500'
                  }`}
                />
                <span className="whitespace-nowrap">{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-mono font-black ${tab.badgeColor} shadow-xs ml-0.5 shrink-0`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
