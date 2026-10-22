import React from 'react';
import { VehicleProfile } from '../types';
import { sounds } from '../services/soundEffects';
import { VEHICLE_PRESETS } from '../constants/vehicles';
import {
  Car,
  Volume2,
  VolumeX,
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  allVehicles?: VehicleProfile[];
  onChangeVehicle: (preset: VehicleProfile) => void;
  onDeleteVehicle?: (id: string) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onNavigateHome: () => void;
  onOpenAddVehicle?: () => void;
}

export const Header: React.FC<Props> = ({
  vehicle,
  allVehicles,
  onChangeVehicle,
  onDeleteVehicle,
  isSoundEnabled,
  onToggleSound,
  onNavigateHome,
  onOpenAddVehicle
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const vehicleList = (allVehicles && allVehicles.length > 0) ? allVehicles : VEHICLE_PRESETS;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#EDF1F7]/90 backdrop-blur-xl border-b border-white/60 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Georgian Title with V1 Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group min-w-0" onClick={onNavigateHome}>
          {/* V1 Geometric Badge */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl neu-surface flex items-center justify-center font-black text-navy text-base sm:text-lg shadow-sm border border-white group-hover:scale-105 transition-transform shrink-0">
            <span className="font-mono text-gold font-black">V1</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-tight text-navy uppercase font-sans group-hover:text-slate-800 transition-colors truncate">
                ავტო-ჰაბი
                <span className="hidden min-[480px]:inline"> სივრცე</span>
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/15 text-gold border border-gold/30 shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block truncate">
              OBD-II ტესტირება • საპატრულო ჯარიმები • AI მექანიკოსი
            </p>
          </div>
        </div>

        {/* Vehicle Selector & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative">
            <button
              onClick={() => {
                sounds.playClick();
                setDropdownOpen(!dropdownOpen);
              }}
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl neu-btn text-navy text-xs font-bold flex items-center gap-1.5 sm:gap-2.5 transition-all shadow-sm active:scale-95"
            >
              <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold shrink-0" />
              <span className="hidden md:inline font-bold">
                {vehicle.brand} {vehicle.model}
              </span>
              <span className="hidden min-[420px]:inline md:hidden font-bold">{vehicle.brand}</span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-navy font-mono text-[10px] sm:text-[11px] font-bold border border-slate-200">
                {vehicle.plate_number}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-72 rounded-3xl neu-card p-2 shadow-2xl z-50 animate-fade-in border border-slate-200">
                <div className="px-3 py-2 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>გარაჟი / მანქანის შეცვლა</span>
                  <span className="font-bold text-gold">{vehicleList.length} ავტომობილი</span>
                </div>
                {vehicleList.map((preset) => (
                  <div
                    key={preset.id}
                    className={`w-full p-2.5 rounded-2xl transition-all flex items-center justify-between my-1 ${
                      preset.id === vehicle.id
                        ? 'bg-gold/15 text-navy font-bold border border-gold/30'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      onClick={() => {
                        sounds.playSuccess();
                        onChangeVehicle(preset);
                        setDropdownOpen(false);
                      }}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="text-xs font-bold text-navy">
                        {preset.brand} {preset.model}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {preset.engine}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-navy border border-slate-200">
                        {preset.plate_number}
                      </span>
                      {onDeleteVehicle && vehicleList.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playClick();
                            if (window.confirm(`ნამდვილად გსურთ ${preset.brand} ${preset.model}-ის წაშლა გარაჟიდან?`)) {
                              onDeleteVehicle(preset.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="მანქანის წაშლა"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {onOpenAddVehicle && (
                  <div className="pt-2 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setDropdownOpen(false);
                        onOpenAddVehicle();
                      }}
                      className="w-full py-2.5 px-3 rounded-2xl bg-gold/15 hover:bg-gold/25 text-navy text-xs font-black flex items-center justify-center gap-2 transition-all border border-gold/30"
                    >
                      <Plus size={14} className="text-gold" />
                      <span>+ ახალი მანქანის დამატება</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sound Toggle Circular Neumorphic Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleSound();
            }}
            className="w-10 h-10 rounded-full neu-circle flex items-center justify-center text-navy hover:text-gold transition-all"
            title={isSoundEnabled ? 'ხმის გათიშვა' : 'ხმის ჩართვა'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-gold" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
