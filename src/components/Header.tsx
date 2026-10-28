import React, { useState } from 'react';
import { VehicleProfile } from '../types';
import { sounds } from '../services/soundEffects';
import { VEHICLE_PRESETS } from '../constants/vehicles';
import { TabType } from './Navigation';
import { GeorgianLicensePlate } from './ui/GeorgianLicensePlate';
import {
  Car,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  HelpCircle
} from 'lucide-react';

interface Props {
  vehicle?: VehicleProfile | null;
  allVehicles?: VehicleProfile[];
  onChangeVehicle: (preset: VehicleProfile) => void;
  onDeleteVehicle?: (id: string) => void;
  isSoundEnabled?: boolean;
  onToggleSound?: () => void;
  onNavigateHome: () => void;
  onOpenAddVehicle?: () => void;
  onOpenBookingModal?: () => void;
  dtcCount?: number;
  finesCount?: number;
  onSelectTab?: (tab: TabType) => void;
  lang?: 'ge' | 'en';
  onToggleLang?: () => void;
  onSelectLang?: (lang: 'ge' | 'en') => void;
  isObdConnected?: boolean;
  onOpenObdModal?: () => void;
  accountMode?: 'owner' | 'visitor';
  onToggleAccountMode?: () => void;
  onOpenTour?: () => void;
}

export const Header: React.FC<Props> = ({
  vehicle,
  allVehicles,
  onChangeVehicle,
  onDeleteVehicle,
  onNavigateHome,
  onOpenAddVehicle,
  onSelectTab,
  lang = 'ge',
  onToggleLang,
  onSelectLang,
  isObdConnected = false,
  onOpenObdModal,
  accountMode = 'owner',
  onToggleAccountMode,
  onOpenTour
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const vehicleList = allVehicles && allVehicles.length > 0 ? allVehicles : VEHICLE_PRESETS;
  const isGe = lang === 'ge';
  const hasSelectedVehicle = Boolean(vehicle && vehicle.id && vehicle.brand);

  const languages = [
    { code: 'ge' as const, flag: '🇬🇪', label: 'ქართული', title: 'GE' },
    { code: 'en' as const, flag: '🇬🇧', label: 'English', title: 'EN' }
  ];

  const renderGarageDropdown = () => (
    <div className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-72 rounded-3xl neu-card p-2 shadow-2xl z-50 animate-fade-in border border-slate-200 bg-white">
      <div className="px-3 py-2 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-100 flex items-center justify-between">
        <span>{isGe ? 'გარაჟი / მანქანის შეცვლა' : 'Garage / Change Car'}</span>
        <span className="font-bold text-gold">
          {vehicleList.length} {isGe ? 'ავტომობილი' : 'Vehicles'}
        </span>
      </div>
      {vehicleList.map((preset) => (
        <div
          key={preset.id}
          className={`w-full p-2.5 rounded-2xl transition-all flex items-center justify-between my-1 ${
            preset.id === vehicle?.id
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
            className="flex-1 cursor-pointer min-w-0"
          >
            <div className="text-xs font-bold text-navy truncate">
              {preset.brand} {preset.model}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
              {preset.engine}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <GeorgianLicensePlate plate={preset.plate_number} size="xs" variant="white" />
            {onDeleteVehicle && vehicleList.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                  if (window.confirm(isGe ? `ნამდვილად გსურთ ${preset.brand} ${preset.model}-ის წაშლა?` : `Delete ${preset.brand} ${preset.model}?`)) {
                    onDeleteVehicle(preset.id);
                  }
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                title={isGe ? 'მანქანის წაშლა' : 'Delete Vehicle'}
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
            <span>{isGe ? '+ ახალი მანქანის დამატება' : '+ Add New Vehicle'}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className="w-full border-b border-white/60 transition-colors">
      {/* ROW 1: Brand & Top Action Controls */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-0 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* 1. Left: Brand & Subtitle with V1 Circular Logo */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 shrink-0"
          onClick={onNavigateHome}
        >
          {/* V1 Circular Geometric Badge */}
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white neu-circle flex items-center justify-center font-black text-gold text-sm sm:text-lg shadow-sm border border-white group-hover:scale-105 transition-transform shrink-0">
            <span className="font-mono text-gold font-black">V1</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg font-black tracking-tight text-navy">
                {isGe ? 'ავტო-ჰაბი AI' : 'AutoHub AI'}
              </h1>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold border border-gold text-gold shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden min-[600px]:block truncate">
              {isGe
                ? 'ავტო-ჰაბი სივრცე • OBD-II ტელემეტრია & AI მექანიკოსი'
                : 'AutoHub Space • OBD-II Telemetry & AI Mechanic'}
            </p>
          </div>
        </div>

        {/* 2. Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          
          {/* 0. Account Mode Switcher */}
          {onToggleAccountMode && (
            <button
              onClick={() => {
                sounds.playClick();
                onToggleAccountMode();
              }}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1 sm:gap-1.5 border transition-all ${
                accountMode === 'owner'
                  ? 'bg-amber-50/90 text-amber-950 border-amber-300 shadow-xs hover:bg-amber-100'
                  : 'bg-blue-50/90 text-blue-950 border-blue-300 shadow-xs hover:bg-blue-100'
              }`}
              title={
                accountMode === 'owner'
                  ? 'ჩემი ექაუნთი (2 მანქანა: Mercedes + BMW) • დააჭირეთ სტუმრის რეჟიმზე გადასართავად'
                  : 'სტუმრის ექაუნთი (1 მანქანა) • დააჭირეთ ჩემს ექაუნთზე დასაბრუნებლად'
              }
            >
              <span className="text-xs sm:text-sm">{accountMode === 'owner' ? '👑' : '👤'}</span>
              <span className="hidden lg:inline">
                {accountMode === 'owner' ? 'ჩემი ექაუნთი' : 'სტუმრის ექაუნთი'}
              </span>
              <span className={`text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-md ${
                accountMode === 'owner' ? 'bg-amber-200/80 text-amber-950 font-bold' : 'bg-blue-200/80 text-blue-950 font-bold'
              }`}>
                <span className="sm:hidden">{accountMode === 'owner' ? 'Owner' : 'Guest'}</span>
                <span className="hidden sm:inline">{accountMode === 'owner' ? 'Owner (2)' : 'Visitor (1)'}</span>
              </span>
            </button>
          )}

          {/* 1. OBD-II Status Indicator */}
          <button
            data-tour="obd-status"
            onClick={() => {
              sounds.playClick();
              if (onOpenObdModal) {
                onOpenObdModal();
              } else {
                onSelectTab?.('obd');
              }
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs transition-all select-none cursor-pointer ${
              isObdConnected
                ? 'bg-emerald-500/20 text-emerald-950 border border-emerald-400 font-extrabold shadow-[0_0_16px_rgba(16,185,129,0.5)] hover:shadow-[0_0_24px_rgba(16,185,129,0.7)]'
                : 'btn-stitch-soft text-slate-500 font-bold hover:text-amber-600'
            }`}
            title={
              isObdConnected
                ? (isGe ? 'OBD-II აქტიურია და დაკავშირებულია' : 'OBD-II Active & Connected')
                : (isGe ? 'OBD-II გათიშულია — დააჭირეთ დასაკავშირებლად' : 'OBD-II Disconnected — Click to connect')
            }
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                isObdConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span className="font-mono tracking-tight font-black text-[10px] sm:text-xs">
              {isObdConnected ? 'LIVE' : 'OFF'}
            </span>
          </button>

          {/* 2. Desktop Vehicle Pill (only shown on md: and up) */}
          {hasSelectedVehicle && vehicle ? (
            <div data-tour="header-vehicle" className="relative hidden md:block">
              <button
                onClick={() => {
                  sounds.playClick();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="btn-stitch-soft px-3.5 sm:px-4 py-2 text-navy text-xs font-bold flex items-center gap-2"
                title={isGe ? 'მანქანები / გარაჟი' : 'Vehicles / Garage'}
              >
                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold shrink-0" />
                <span className="font-bold text-navy truncate">
                  {vehicle.brand}
                </span>
                {vehicle.plate_number && (
                  <GeorgianLicensePlate plate={vehicle.plate_number} size="sm" variant="white" />
                )}
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
              {dropdownOpen && renderGarageDropdown()}
            </div>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAddVehicle?.();
              }}
              className="btn-stitch-primary hidden md:flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-black shrink-0"
              title={isGe ? 'ახალი ავტომობილის დამატება' : 'Add New Vehicle'}
            >
              <Plus className="w-4 h-4 text-navy shrink-0 stroke-[3]" />
              <span className="font-black tracking-tight">
                {isGe ? '+ მანქანის დამატება' : '+ Add Vehicle'}
              </span>
            </button>
          )}

          {/* 3. Interactive Tour Guide Trigger Button */}
          {onOpenTour && (
            <button
              onClick={() => {
                sounds.playSuccess();
                onOpenTour();
              }}
              className="btn-stitch-soft w-7 h-7 sm:w-auto sm:px-3 sm:py-1.5 rounded-full text-xs font-bold text-navy hover:text-gold flex items-center justify-center sm:gap-1.5 transition-all shadow-xs"
              title={isGe ? 'საიტის გიდი • ინტერაქტიული ტური' : 'Site Tour Guide'}
            >
              <HelpCircle size={14} className="text-gold" />
              <span className="hidden md:inline font-bold">{isGe ? 'გიდი' : 'Tour'}</span>
            </button>
          )}

          {/* 4. Language Flag Switcher */}
          <div
            className="relative"
            onMouseEnter={() => setLangDropdownOpen(true)}
            onMouseLeave={() => setLangDropdownOpen(false)}
          >
            <button
              onClick={() => {
                sounds.playClick();
                setLangDropdownOpen(!langDropdownOpen);
              }}
              className="btn-stitch-soft w-7 h-7 sm:w-9 sm:h-9 rounded-full p-0 flex items-center justify-center text-sm sm:text-lg"
              title={isGe ? 'ენის შეცვლა (ქართული)' : 'Change Language (English)'}
            >
              <span className="select-none leading-none">
                {lang === 'ge' ? '🇬🇪' : '🇬🇧'}
              </span>
            </button>

            {langDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 p-1.5 rounded-2xl neu-card shadow-2xl bg-white border border-slate-200 z-50 animate-fade-in min-w-[145px]"
                onClick={() => setLangDropdownOpen(false)}
              >
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-100 mb-1">
                  {isGe ? 'აირჩიეთ ენა' : 'Select Language'}
                </div>
                {languages.map((l) => {
                  const isSelected = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        sounds.playSuccess();
                        if (onSelectLang) {
                          onSelectLang(l.code);
                        } else if (onToggleLang && l.code !== lang) {
                          onToggleLang();
                        }
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors my-0.5 ${
                        isSelected
                          ? 'bg-gold/15 text-navy border border-gold/30 font-black'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl select-none leading-none">{l.flag}</span>
                        <span>{l.label}</span>
                      </div>
                      {isSelected && <Check size={13} className="text-gold" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: Mobile Vehicle Selector Bar (Lifts the vehicle pill above navigation on mobile) */}
      <div className="md:hidden px-2.5 pb-2 pt-0.5 max-w-7xl mx-auto">
        {hasSelectedVehicle && vehicle ? (
          <div data-tour="header-vehicle-mobile" className="relative w-full">
            <button
              onClick={() => {
                sounds.playClick();
                setDropdownOpen(!dropdownOpen);
              }}
              className="btn-stitch-soft w-full px-3 py-1.5 rounded-2xl text-navy text-xs font-bold flex items-center justify-between shadow-xs border border-white/80 active:scale-[0.99] transition-all"
              title={isGe ? 'მანქანები / გარაჟი' : 'Vehicles / Garage'}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Car className="w-4 h-4 text-gold shrink-0" />
                <span className="font-extrabold text-navy truncate">
                  {vehicle.brand} {vehicle.model}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {vehicle.plate_number && (
                  <GeorgianLicensePlate plate={vehicle.plate_number} size="xs" variant="white" />
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </button>
            {dropdownOpen && renderGarageDropdown()}
          </div>
        ) : (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAddVehicle?.();
            }}
            className="btn-stitch-primary w-full py-1.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs"
            title={isGe ? 'ახალი ავტომობილის დამატება' : 'Add New Vehicle'}
          >
            <Plus className="w-3.5 h-3.5 text-navy shrink-0 stroke-[3]" />
            <span className="font-black">{isGe ? '+ მანქანის დამატება' : '+ Add Vehicle'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
