import React, { useState, useRef, useEffect } from 'react';
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
  HelpCircle,
  User,
  Sparkles,
  RefreshCw,
  FileText,
  Crown
} from 'lucide-react';
import { renderDriverAvatar } from './Fines/driverAvatars';

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
  onOpenUserAccountModal?: () => void;
  onOpenVehicleAccountModal?: () => void;
  onNewUserAccount?: () => void;
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
  onOpenUserAccountModal,
  onOpenVehicleAccountModal,
  onNewUserAccount,
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const vehicleTriggerRef = useRef<HTMLDivElement>(null);
  const mobileVehicleTriggerRef = useRef<HTMLDivElement>(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const vehicleList = allVehicles && allVehicles.length > 0 ? allVehicles : VEHICLE_PRESETS;
  const isGe = lang === 'ge';
  const hasSelectedVehicle = Boolean(vehicle && vehicle.id && vehicle.brand);

  useEffect(() => {
    if (!dropdownOpen && !langDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !vehicleTriggerRef.current?.contains(target) &&
        !mobileVehicleTriggerRef.current?.contains(target)
      ) {
        setDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [dropdownOpen, langDropdownOpen]);

  const languages = [
    { code: 'ge' as const, flag: '🇬🇪', label: 'ქართული', title: 'GE' },
    { code: 'en' as const, flag: '🇬🇧', label: 'English', title: 'EN' }
  ];

  const renderGarageDropdown = () => (
    <div
      ref={dropdownRef}
      className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-88 md:w-96 rounded-3xl neu-card p-3 shadow-2xl z-[100] animate-fade-in border border-slate-200 bg-white"
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION 1: USER ACCOUNT & PROFILE (მომხმარებლის ექაუნთი) */}
      {/* ---------------------------------------------------- */}
      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 mb-2.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
          <span>{isGe ? '👤 მომხმარებლის პროფილი' : '👤 User Profile'}</span>
          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-1 ${
            accountMode === 'owner' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
          }`}>
            {accountMode === 'owner' ? <Crown size={10} className="text-gold" /> : <User size={10} className="text-blue-700" />}
            <span>{accountMode === 'owner' ? (isGe ? 'მფლობელი' : 'Owner') : (isGe ? 'ვიზიტორი' : 'Guest')}</span>
          </span>
        </div>

        {/* User preview banner */}
        <div className="flex items-center gap-2.5 py-1">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-300 shadow-xs shrink-0 bg-slate-900">
            {renderDriverAvatar(vehicle?.driver_photo_url, 'w-full h-full')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-navy truncate">
              {vehicle?.driver_name ? (
                vehicle.driver_name
              ) : (
                <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[11px] font-black inline-flex items-center gap-1">
                  ⚠️ {isGe ? 'შეუვსებელი პროფილი' : 'Incomplete Profile'}
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
              {vehicle?.driver_personal_number ? `ID: ${vehicle.driver_personal_number}` : (isGe ? 'პირადი ნომერი შეუვსებელია' : 'Personal ID missing')}
            </div>
          </div>
        </div>

        {/* User Account Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-slate-200/70">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setDropdownOpen(false);
              onOpenUserAccountModal?.();
            }}
            className="w-full py-1.5 px-2 rounded-xl bg-white hover:bg-slate-100 text-navy text-[11px] font-bold flex items-center justify-center gap-1.5 border border-slate-200 shadow-xs transition-all"
            title={isGe ? 'პროფილის ნახვა და შევსება' : 'View & Fill Profile'}
          >
            <User size={13} className="text-gold shrink-0" />
            <span className="truncate">{isGe ? 'პროფილი / შევსება' : 'Profile / Edit'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setDropdownOpen(false);
              onNewUserAccount?.();
            }}
            className="w-full py-1.5 px-2 rounded-xl bg-gold/15 hover:bg-gold/25 text-navy text-[11px] font-bold flex items-center justify-center gap-1.5 border border-gold/40 shadow-xs transition-all"
            title={isGe ? 'ახალი ექაუნთის რეგისტრაცია / შექმნა' : 'Create New Account'}
          >
            <Sparkles size={12} className="text-gold shrink-0" />
            <span className="truncate">{isGe ? '✨ ახალი ექაუნთი' : '✨ New Account'}</span>
          </button>
        </div>

        {onToggleAccountMode && (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleAccountMode();
            }}
            className="w-full mt-1.5 py-1 px-2 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
          >
            <RefreshCw size={10} />
            <span className="truncate">
              {accountMode === 'owner'
                ? (isGe ? '👤 ვიზიტორის რეჟიმზე გადართვა (სუფთა პროფილი)' : 'Switch to Guest Mode')
                : (isGe ? '👑 მფლობელის რეჟიმზე გადართვა (Mercedes + BMW)' : 'Switch to Owner Mode')}
            </span>
          </button>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 2: VEHICLE ACCOUNT & FLEET (მანქანის ექაუნთი)   */}
      {/* ---------------------------------------------------- */}
      <div className="px-1 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-100 flex items-center justify-between">
        <span>{isGe ? '🚗 მანქანის ექაუნთი & ავტოპარკი' : '🚗 Vehicle Account & Fleet'}</span>
        <span className="font-bold text-gold">
          {vehicleList.length} {isGe ? 'ავტომობილი' : 'Vehicles'}
        </span>
      </div>

      {/* Vehicle Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5 my-2">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setDropdownOpen(false);
            onOpenVehicleAccountModal?.();
          }}
          className="w-full py-2 px-2 rounded-xl bg-navy text-gold hover:bg-slate-800 text-[11px] font-black flex items-center justify-center gap-1.5 transition-all shadow-xs border border-gold/40"
          title={isGe ? 'მანქანის ექაუნთი & ტექ-პასპორტი' : 'Vehicle Account & Registration'}
        >
          <FileText size={13} className="text-gold shrink-0" />
          <span className="truncate">{isGe ? 'მანქანის ექაუნთი' : 'Vehicle Account'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSuccess();
            onSelectTab?.('garage');
            setDropdownOpen(false);
          }}
          className="w-full py-2 px-2 rounded-xl bg-white text-navy hover:bg-slate-100 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs border border-slate-200"
          title={isGe ? 'ჩემი გარაჟი & პროფილის ნახვა' : 'My Garage & Fleet'}
        >
          <Car size={13} className="text-gold shrink-0" />
          <span className="truncate">{isGe ? 'ჩემი გარაჟი' : 'My Garage'}</span>
        </button>
      </div>

      {/* List of Vehicles */}
      <div className="max-h-44 overflow-y-auto no-scrollbar space-y-1">
        {vehicleList.map((preset) => (
          <div
            key={preset.id}
            className={`w-full p-2 rounded-2xl transition-all flex items-center justify-between ${
              preset.id === vehicle?.id
                ? 'bg-gold/15 text-navy font-bold border border-gold/30 shadow-xs'
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
              <div className="text-xs font-bold text-navy truncate flex items-center gap-1.5">
                <span>{preset.brand} {preset.model}</span>
                {preset.id === vehicle?.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
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
      </div>

      {onOpenAddVehicle && (
        <div className="pt-2 border-t border-slate-100 mt-2">
          <button
            onClick={() => {
              sounds.playClick();
              setDropdownOpen(false);
              onOpenAddVehicle();
            }}
            className="w-full py-2 px-3 rounded-2xl bg-gold/15 hover:bg-gold/25 text-navy text-xs font-black flex items-center justify-center gap-2 transition-all border border-gold/30"
          >
            <Plus size={14} className="text-gold stroke-[3]" />
            <span>{isGe ? '+ ახალი მანქანის დამატება' : '+ Add New Vehicle'}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className="w-full max-w-full overflow-visible border-b border-slate-300/80 transition-colors relative z-40 bg-[#ECEAE5]">
      {/* ROW 1: Brand & Top Action Controls */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-0 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-4 w-full">
        
        {/* 1. Left: Brand & Subtitle with CarMe Circular Logo */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 shrink-0"
          onClick={onNavigateHome}
        >
          {/* CarMe 3D Emblem Badge */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md border-2 border-amber-400 group-hover:scale-105 transition-transform shrink-0 p-0.5">
            <img
              src="/carme-circle-badge.png?v=4"
              alt="CarMe.ge Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                CarMe
              </h1>
              {/* Owner / Account Mode Pill directly inside CarMe Logo */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                  if (onOpenUserAccountModal) {
                    onOpenUserAccountModal();
                  } else if (onToggleAccountMode) {
                    onToggleAccountMode();
                  }
                }}
                className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black flex items-center gap-1 border-2 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 ${
                  accountMode === 'owner'
                    ? 'bg-amber-100 text-amber-950 border-amber-500 hover:bg-amber-200'
                    : 'bg-blue-100 text-blue-950 border-blue-400 hover:bg-blue-200'
                }`}
                title={
                  isGe
                    ? 'მომხმარებლის პროფილი • დააჭირეთ სანახავად და შესავსებად'
                    : 'User Account • Click to view and fill profile'
                }
              >
                <span>{accountMode === 'owner' ? '👑' : '👤'}</span>
                <span>{accountMode === 'owner' ? 'Owner' : 'Guest'}</span>
                {!vehicle?.driver_name && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" title={isGe ? 'შეავსეთ პროფილი' : 'Fill Profile'} />
                )}
              </button>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium hidden min-[600px]:block truncate">
              {isGe
                ? 'AutoHub • OBD-II ტელემეტრია & AI მექანიკოსი'
                : 'AutoHub • OBD-II Telemetry & AI Mechanic'}
            </p>
          </div>
        </div>

        {/* 2. Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          
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
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black transition-all select-none cursor-pointer shadow-xs border-2 ${
              isObdConnected
                ? 'bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-[0_0_16px_rgba(16,185,129,0.5)] hover:shadow-[0_0_24px_rgba(16,185,129,0.7)]'
                : 'bg-white text-slate-800 border-slate-300 hover:border-amber-400 hover:text-amber-600'
            }`}
            title={
              isObdConnected
                ? (isGe ? 'OBD-II აქტიურია და დაკავშირებულია' : 'OBD-II Active & Connected')
                : (isGe ? 'OBD-II გათიშულია — დააჭირეთ დასაკავშირებლად' : 'OBD-II Disconnected — Click to connect')
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isObdConnected ? 'bg-white animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="font-mono tracking-tight font-black text-[10px] sm:text-xs">
              {isObdConnected ? 'LIVE' : 'OFF'}
            </span>
          </button>

          {/* 2. Desktop Vehicle Pill (only shown on md: and up) */}
          {hasSelectedVehicle && vehicle ? (
            <div ref={vehicleTriggerRef} data-tour="header-vehicle" className="relative hidden md:block">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setDropdownOpen((prev) => !prev);
                }}
                className={`btn-stitch-soft px-3.5 sm:px-4 py-2 text-navy text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  dropdownOpen ? 'ring-2 ring-gold/60 bg-white shadow-md' : ''
                }`}
                title={isGe ? 'მანქანები / გარაჟი' : 'Vehicles / Garage'}
                aria-expanded={dropdownOpen}
              >
                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold shrink-0" />
                <span className="font-bold text-navy truncate">
                  {vehicle.brand}
                </span>
                {vehicle.plate_number && (
                  <GeorgianLicensePlate plate={vehicle.plate_number} size="sm" variant="white" />
                )}
                <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-gold' : ''}`} />
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
              className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-full bg-white text-slate-800 hover:text-amber-600 hover:border-amber-400 font-bold border-2 border-slate-300 flex items-center justify-center sm:gap-1.5 transition-all shadow-xs"
              title={isGe ? 'საიტის გიდი • ინტერაქტიული ტური' : 'Site Tour Guide'}
            >
              <HelpCircle size={14} className="text-amber-500" />
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
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-slate-900 border-2 border-slate-300 hover:border-amber-400 p-0 flex items-center justify-center text-sm sm:text-base shadow-xs"
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
      <div className="md:hidden px-2.5 pb-2.5 pt-1 max-w-7xl mx-auto w-full">
        {hasSelectedVehicle && vehicle ? (
          <div ref={mobileVehicleTriggerRef} data-tour="header-vehicle-mobile" className="relative w-full">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setDropdownOpen((prev) => !prev);
              }}
              className={`w-full px-3.5 py-2 rounded-2xl bg-white text-slate-900 text-xs font-black flex items-center justify-between shadow-xs border-2 border-slate-300 active:scale-[0.99] transition-all cursor-pointer ${
                dropdownOpen ? 'ring-2 ring-gold border-amber-400 bg-white' : ''
              }`}
              title={isGe ? 'მანქანები / გარაჟი' : 'Vehicles / Garage'}
              aria-expanded={dropdownOpen}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Car className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-extrabold text-slate-900 truncate">
                  {vehicle.brand} {vehicle.model}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {vehicle.plate_number && (
                  <GeorgianLicensePlate plate={vehicle.plate_number} size="xs" variant="white" />
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-amber-500' : ''}`} />
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
            className="w-full py-2 px-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm border border-amber-600"
            title={isGe ? 'ახალი ავტომობილის დამატება' : 'Add New Vehicle'}
          >
            <Plus className="w-4 h-4 text-slate-950 shrink-0 stroke-[3]" />
            <span className="font-black">{isGe ? '+ მანქანის დამატება' : '+ Add Vehicle'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
