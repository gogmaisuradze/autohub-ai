import React, { useState } from 'react';
import { VehicleProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import LiveTrafficMap from '../Map/LiveTrafficMap';
import {
  Car,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Zap,
  Gauge,
  Calendar,
  Fuel,
  Shield,
  Wifi,
  Sparkles,
  ArrowRight,
  Trash2,
  Navigation,
  Building2,
  MapPin,
  Layers
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  onUpdateVehicle: (updated: VehicleProfile) => void;
  onOpenAddModal: () => void;
  onDeleteVehicle?: (id: string) => void;
  onOpenFieldPrompt: (field: 'plate_number' | 'mileage_km' | 'engine' | 'vin') => void;
  allVehicles: VehicleProfile[];
  onSelectVehicle: (v: VehicleProfile) => void;
  initialSubTab?: 'profile' | 'map';
}

export const GarageModule: React.FC<Props> = ({
  vehicle,
  onUpdateVehicle,
  onOpenAddModal,
  onDeleteVehicle,
  onOpenFieldPrompt,
  allVehicles,
  onSelectVehicle,
  initialSubTab = 'profile'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'map'>(initialSubTab);

  // Calculate completeness score
  const checkFields = [
    { key: 'plate_number', label: 'სახელმწიფო ნომერი', filled: Boolean(vehicle.plate_number && vehicle.plate_number !== 'GE-000-XX'), weight: 25, prompt: 'plate_number' as const },
    { key: 'engine', label: 'ძრავის სპეციფიკაცია', filled: Boolean(vehicle.engine), weight: 25, prompt: 'engine' as const },
    { key: 'mileage_km', label: 'მიმდინარე გარბენი', filled: Boolean(vehicle.mileage_km > 0), weight: 25, prompt: 'mileage_km' as const },
    { key: 'vin', label: 'VIN კოდი', filled: Boolean(vehicle.vin && vehicle.vin.length >= 10), weight: 25, prompt: 'vin' as const }
  ];

  const completeness = checkFields.reduce((acc, f) => acc + (f.filled ? f.weight : 0), 0);
  const missingFields = checkFields.filter(f => !f.filled);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Header Bar with Sub-Tab Navigation */}
      <div className="p-5 rounded-3xl neu-card shadow-neu-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-gold shadow-sm">
            <Car className="w-6 h-6 text-navy" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-navy tracking-tight">
                მეტი — ჩემი გარაჟი & Waze რუკა
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-gold/15 text-gold border border-gold/30">
                {allVehicles.length} ავტომობილი
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ავტომობილის მონაცემები, Waze ცოცხალი რუკა, ბენზინის ფასები და ავტო სალონები
            </p>
          </div>
        </div>

        {/* Subtab Switcher Pills */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-200/60 border border-white">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('profile');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'profile'
                ? 'bg-navy text-gold shadow-sm'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <Car size={15} />
            <span>ჩემი გარაჟი</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('map');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'map'
                ? 'bg-navy text-gold shadow-sm'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <Navigation size={15} />
            <span>Waze რუკა & ფასები</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        </div>

        {/* Add New Vehicle Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenAddModal();
          }}
          className="px-5 py-2.5 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-gold-soft flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={16} />
          <span>+ ახალი მანქანის დამატება</span>
        </button>
      </div>

      {/* 2. TAB: LIVE TRAFFIC MAP (Waze, Radars, Patrol, Fuel, Showrooms) */}
      {activeSubTab === 'map' && (
        <div className="animate-fade-in">
          <LiveTrafficMap vehicle={vehicle} />
        </div>
      )}

      {/* 3. TAB: VEHICLE PROFILE & GARAGE */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">

          {/* Quick Teaser for Interactive Map */}
          <div
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('map');
            }}
            className="p-4 rounded-3xl neu-card shadow-neu-card border border-white flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:border-gold/60 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl neu-circle flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
                <Navigation className="w-5 h-5 text-navy" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-navy group-hover:text-gold transition-colors">
                    Waze ცოცხალი რუკა, ბენზინის ფასები & ავტო სალონები
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    Live თბილისი
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  პატრულის ჩასაფრებები, რადარები, Wissol/Gulf ფასები და Porsche/Tegeta სალონები
                </p>
              </div>
            </div>

            <button className="px-4 py-2 rounded-xl bg-navy text-gold font-bold text-xs flex items-center gap-2 shadow-sm group-hover:bg-slate-800 transition-colors">
              <span>რუკის გახსნა</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Active Vehicle Hero Showcase Card */}
          <div className="p-6 rounded-3xl neu-card shadow-neu-card border border-white relative overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    აქტიური ავტომობილი
                  </span>
                </div>
                <h3 className="text-2xl font-black text-navy tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {vehicle.year} წელი • {vehicle.engine || 'ძრავა დაუზუსტებელია'}
                </p>
              </div>

              {/* Georgian License Plate Mockup */}
              <div className="px-4 py-2 rounded-2xl bg-white text-navy font-black font-mono shadow-sm border border-slate-200 flex items-center gap-3 tracking-widest text-sm">
                <div className="flex flex-col items-center justify-center pr-2 border-r border-slate-200 text-[10px] font-bold text-blue-700">
                  <span>🇬🇪</span>
                  <span>GE</span>
                </div>
                <span>{vehicle.plate_number}</span>
              </div>
            </div>

            {/* Profile Completeness Meter */}
            <div className="p-4 rounded-2xl neu-surface border border-white mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                  <Sparkles size={14} className="text-gold" />
                  <span>AI პროფილის სისრულე: <strong className="text-gold font-mono">{completeness}%</strong></span>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {missingFields.length === 0 ? 'ყველა მონაცემი შევსებულია' : `დარჩენილია ${missingFields.length} პარამეტრი`}
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completeness === 100 ? 'bg-emerald-500' : 'bg-gold'
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>

              {/* Contextual missing fields chips (One-touch fill!) */}
              {missingFields.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-500">
                    სწრაფი შევსება:
                  </span>
                  {missingFields.map(field => (
                    <button
                      key={field.key}
                      onClick={() => {
                        sounds.playClick();
                        onOpenFieldPrompt(field.prompt);
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>+ {field.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <span className="text-[11px] text-slate-400 font-bold block mb-1">საწვავის ტიპი</span>
                <div className="flex items-center gap-1.5 font-bold text-xs text-navy">
                  <Fuel size={14} className="text-gold" />
                  <span className="capitalize">{vehicle.fuel_type}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <span className="text-[11px] text-slate-400 font-bold block mb-1">გარბენი</span>
                <div className="flex items-center gap-1.5 font-black text-xs text-navy font-mono">
                  <Gauge size={14} className="text-gold" />
                  <span>{vehicle.mileage_km.toLocaleString()} კმ</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <span className="text-[11px] text-slate-400 font-bold block mb-1">VIN შასი</span>
                <div className="flex items-center gap-1.5 font-bold text-xs text-navy font-mono truncate">
                  <Shield size={14} className="text-gold shrink-0" />
                  <span className="truncate">{vehicle.vin || 'არ არის მითითებული'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <span className="text-[11px] text-slate-400 font-bold block mb-1">OBD ადაპტერი</span>
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 font-mono">
                  <Wifi size={14} className="text-emerald-500" />
                  <span>{vehicle.obd_ip}:{vehicle.obd_port}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Vehicles / Presets */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-navy uppercase tracking-wider px-1">
              შენახული მანქანები გარაჟში ({allVehicles.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {allVehicles.map(v => {
                const isSelected = v.id === vehicle.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      sounds.playClick();
                      onSelectVehicle(v);
                    }}
                    className={`p-4 rounded-3xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'neu-card border-gold ring-2 ring-gold/40 shadow-gold-soft'
                        : 'neu-surface border-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl neu-circle flex items-center justify-center text-navy">
                        <Car size={18} className={isSelected ? 'text-gold' : 'text-navy'} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold text-navy">
                            აქტიური
                          </span>
                        )}
                        {onDeleteVehicle && allVehicles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              if (window.confirm(`ნამდვილად გსურთ ${v.brand} ${v.model} (${v.plate_number})-ის წაშლა გარაჟიდან?`)) {
                                onDeleteVehicle(v.id);
                              }
                            }}
                            className="w-7 h-7 rounded-lg neu-btn flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="მანქანის წაშლა გარაჟიდან"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <h5 className="font-black text-sm text-navy">{v.brand} {v.model}</h5>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{v.engine}</p>
                    
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 font-bold">{v.plate_number}</span>
                      <span className="text-navy font-bold">{v.year} წ.</span>
                    </div>
                  </div>
                );
              })}

              {/* + Add New Vehicle Tile */}
              <div
                onClick={() => {
                  sounds.playClick();
                  onOpenAddModal();
                }}
                className="p-5 rounded-3xl border-2 border-dashed border-slate-300 hover:border-gold hover:bg-gold/5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[140px]"
              >
                <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-gold group-hover:scale-110 transition-transform mb-2">
                  <Plus size={20} className="text-navy" />
                </div>
                <span className="font-black text-xs text-navy group-hover:text-gold transition-colors">
                  + მანქანის დამატება
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  პროფილის შევსება
                </span>
              </div>
            </div>
          </div>

          {/* Background Automated Pipeline Banner */}
          <div className="p-4 rounded-3xl neu-surface border border-white/80 flex items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span><strong>ავტომატიზაცია:</strong> n8n Backend დაკავშირებულია ფონურ რეჟიმში. მონაცემები იგზავნება ავტომატურად.</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400">Webhook Pipeline Live</span>
          </div>

        </div>
      )}

    </div>
  );
};

export default GarageModule;
