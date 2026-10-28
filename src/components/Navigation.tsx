import React from 'react';
import { sounds } from '../services/soundEffects';
import {
  LayoutGrid,
  Activity,
  ShieldAlert,
  Wrench,
  ParkingSquare,
  MoreHorizontal,
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
      shortLabel: isGe ? 'მთავარი' : 'Home',
      icon: LayoutGrid,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'obd' as TabType,
      label: isGe ? 'დიაგნოსტიკა' : 'Diagnostics',
      shortLabel: 'OBD',
      icon: Activity,
      badge: dtcCount > 0 ? `${dtcCount}` : null,
      badgeColor: 'bg-rose-500 text-white font-black'
    },
    {
      id: 'fines' as TabType,
      label: isGe ? 'ჯარიმები' : 'Traffic Fines',
      shortLabel: isGe ? 'ჯარიმები' : 'Fines',
      icon: ShieldAlert,
      badge: finesCount > 0 ? `${finesCount}` : null,
      badgeColor: 'bg-gold text-white font-black'
    },
    {
      id: 'parking' as TabType,
      label: isGe ? 'პარკინგი' : 'Parking',
      shortLabel: isGe ? 'პარკინგი' : 'Parking',
      icon: ParkingSquare,
      badge: 'LIVE',
      badgeColor: 'bg-blue-600 text-white font-black'
    },
    {
      id: 'map' as TabType,
      label: isGe ? 'რუკა' : 'Live Map',
      shortLabel: isGe ? 'რუკა' : 'Map',
      icon: NavigationIcon,
      badge: 'LIVE',
      badgeColor: 'bg-cyan-500 text-white font-black'
    },
    {
      id: 'service' as TabType,
      label: isGe ? 'სერვისი' : 'Service Log',
      shortLabel: isGe ? 'სერვისი' : 'Service',
      icon: Wrench,
      badge: null,
      badgeColor: ''
    }
  ];

  return (
    <nav data-tour="navigation-menu" className="w-full transition-colors border-t border-white/60">
      <div className="max-w-7xl mx-auto px-1.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-6 gap-1 py-1.5 md:flex md:flex-wrap md:items-center md:justify-center md:gap-4 lg:gap-5 md:py-2.5">
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
                className={`relative flex flex-col md:flex-row items-center justify-center py-1 md:py-2 px-1 md:px-4 rounded-xl md:rounded-2xl text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-150 shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-white text-navy shadow-xs border border-slate-200/80 font-black'
                    : 'text-slate-600 hover:text-navy hover:bg-white/40'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-4 h-4 md:w-4 md:h-4 transition-colors ${
                      isActive ? 'text-gold' : 'text-slate-500'
                    }`}
                  />
                  {tab.badge && (
                    <span
                      className={`absolute -top-1.5 -right-2 md:static md:ml-1.5 px-1 py-0.2 min-w-3.5 rounded-full text-[9px] font-mono font-black ${tab.badgeColor} shadow-xs text-center`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="truncate mt-0.5 md:mt-0 md:ml-2">
                  <span className="md:hidden">{tab.shortLabel}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
