import React, { useState } from 'react';
import { VehicleProfile, ServiceItem, ServiceBookingItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import { GeorgianLicensePlate } from '../ui/GeorgianLicensePlate';
import { decodeVin } from '../../services/vinServiceEngine';
import { ServiceOfferComparisonModal } from '../Modals/ServiceOfferComparisonModal';
import { PromptFieldType } from '../Modals/ContextualFieldPromptModal';
import {
  Car,
  Plus,
  CheckCircle2,
  AlertCircle,
  Zap,
  Gauge,
  Fuel,
  Shield,
  Wifi,
  Sparkles,
  ArrowRight,
  Trash2,
  History,
  Cpu,
  Droplets,
  CircleDot,
  ChevronDown,
  ChevronUp,
  Scale,
  Bot,
  Edit3,
  FileText
} from 'lucide-react';

export const DRIVER_LICENSE_NOTEBOOK_URL = 'https://notebook.google.com/notebook/8435d2c1-fa29-44d0-8d3f-da422e03b3f0/artifact/528eecb6-fcf3-484c-9615-670ae0a800b7';

interface Props {
  vehicle: VehicleProfile;
  onUpdateVehicle: (updated: VehicleProfile) => void;
  onOpenAddModal: () => void;
  onDeleteVehicle?: (id: string) => void;
  onOpenFieldPrompt: (field: PromptFieldType) => void;
  allVehicles: VehicleProfile[];
  onSelectVehicle: (v: VehicleProfile) => void;
  isSoundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenVinHistory?: () => void;
  onResetToVinSpecs?: () => void;
  services?: ServiceItem[];
  onAddBooking?: (booking: ServiceBookingItem) => void;
  onNavigateToAiClarification?: (initialPrompt?: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const GarageModule: React.FC<Props> = ({
  vehicle,
  onUpdateVehicle: _onUpdateVehicle,
  onOpenAddModal,
  onDeleteVehicle,
  onOpenFieldPrompt,
  allVehicles,
  onSelectVehicle,
  onOpenVinHistory,
  onResetToVinSpecs,
  services = [],
  onAddBooking,
  onNavigateToAiClarification,
}) => {
  // Collapsible accordion states (all collapsed by default as requested: "ყველაფერი შეკეცე")
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
  const [isVinExpanded, setIsVinExpanded] = useState(false);
  const [isVehiclesExpanded, setIsVehiclesExpanded] = useState(false);

  // Comparison modal state
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonService, setComparisonService] = useState<ServiceItem | null>(null);

  // Factory requirements decoded from VIN
  const decodedVin = decodeVin(vehicle.vin, vehicle);

  // Real vehicle data completeness calculation (no fake or invented fields!)
  const checkFields = [
    { key: 'brand', label: 'მარკა', filled: Boolean(vehicle.brand && vehicle.brand.trim()), prompt: 'brand' as PromptFieldType },
    { key: 'model', label: 'მოდელი', filled: Boolean(vehicle.model && vehicle.model.trim()), prompt: 'model' as PromptFieldType },
    { key: 'year', label: 'წელი', filled: Boolean(vehicle.year && vehicle.year > 1950), prompt: 'year' as PromptFieldType },
    { key: 'plate_number', label: 'სახელმწიფო ნომერი', filled: Boolean(vehicle.plate_number && vehicle.plate_number !== 'GE-000-XX'), prompt: 'plate_number' as PromptFieldType },
    { key: 'vin', label: 'VIN კოდი', filled: Boolean(vehicle.vin && vehicle.vin.trim().length >= 10), prompt: 'vin' as PromptFieldType },
    { key: 'engine', label: 'ძრავა', filled: Boolean(vehicle.engine && vehicle.engine.trim()), prompt: 'engine' as PromptFieldType },
    { key: 'mileage_km', label: 'გარბენი', filled: Boolean(vehicle.mileage_km && vehicle.mileage_km > 0), prompt: 'mileage_km' as PromptFieldType },
    { key: 'fuel_type', label: 'საწვავის ტიპი', filled: Boolean(vehicle.fuel_type), prompt: 'fuel_type' as PromptFieldType },
    { key: 'tech_passport', label: 'ტექ-პასპორტი', filled: Boolean(vehicle.tech_passport && vehicle.tech_passport.trim()), prompt: 'tech_passport' as PromptFieldType },
  ];

  const filledCount = checkFields.filter(f => f.filled).length;
  const totalCount = checkFields.length;
  const progressPercent = Math.round((filledCount / totalCount) * 100);
  const missingFields = checkFields.filter(f => !f.filled);

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-2 sm:px-4">

      {/* 1. ACTIVE VEHICLE HERO & REAL DATA COMPLETENESS PROGRESS */}
      <div className="p-5 sm:p-6 rounded-3xl neu-card shadow-neu-card border border-white relative overflow-hidden bg-white/95">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400">
                აქტიური ავტომობილი
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-navy tracking-tight truncate">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {vehicle.year} წელი • {vehicle.engine || 'ძრავა დაუზუსტებელია'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GeorgianLicensePlate plate={vehicle.plate_number} size="md" />
          </div>
        </div>

        {/* Real Vehicle Data Progress Bar */}
        <div className="p-4 rounded-2xl neu-surface border border-white">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs sm:text-sm font-black text-navy flex items-center gap-1.5">
              <Sparkles size={16} className="text-gold" />
              <span>მანქანის მონაცემების შევსების პროგრესი</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500">
                {filledCount} / {totalCount} ველი
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                progressPercent === 100
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-gold/20 text-gold border border-gold/40'
              }`}>
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden relative shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                progressPercent === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-amber-500 via-gold to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Contextual missing fields chips (One-touch edit/fill) */}
          {missingFields.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-500 mr-1">
                შესავსებია:
              </span>
              {missingFields.map(field => (
                <button
                  key={field.key}
                  onClick={() => {
                    sounds.playClick();
                    onOpenFieldPrompt(field.prompt);
                  }}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all flex items-center gap-1 shadow-xs hover:scale-105 active:scale-95"
                  title={`${field.label}-ს შევსება`}
                >
                  <Plus size={11} className="text-amber-700" />
                  <span>{field.label}</span>
                </button>
              ))}

              {onNavigateToAiClarification && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onNavigateToAiClarification(
                      `გამარჯობა AI მექანიკოსო, ჩემი მანქანის (${vehicle.brand} ${vehicle.model}) პროფილში აკლია შემდეგი მონაცემები: ${missingFields.map(m => m.label).join(', ')}. დამეხმარეთ მონაცემების დაზუსტებასა და ქარხნული პარამეტრების შევსებაში.`
                    );
                  }}
                  className="px-3 py-1 rounded-xl text-[11px] font-black bg-navy text-gold hover:bg-slate-800 transition-all flex items-center gap-1 shadow-xs ml-auto"
                >
                  <Bot size={12} className="text-gold" />
                  <span>AI დაზუსტება</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-2 pt-2 border-t border-slate-200/60">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>ყველა ძირითადი მონაცემი წარმატებით შევსებულია!</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. ACCORDION: CORE SPECS & DETAILS (შეკეცილი / Collapsible) */}
      <div className="rounded-3xl neu-card shadow-neu-card border border-white overflow-hidden bg-white/95">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setIsSpecsExpanded(!isSpecsExpanded);
          }}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-sm shrink-0">
              <Gauge className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-navy tracking-tight">
                  მანქანის დეტალური მონაცემები & პარამეტრები
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {checkFields.filter(f => f.filled).length}/{checkFields.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ძრავა, გარბენი, საწვავი, VIN შასი, ტექ-პასპორტი და OBD
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            {isSpecsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {isSpecsExpanded && (
          <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Engine */}
              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400 font-bold">ძრავა</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onOpenFieldPrompt('engine');
                    }}
                    className="text-[10px] font-bold text-navy hover:text-gold flex items-center gap-0.5"
                  >
                    <Edit3 size={10} />
                    <span>შეცვლა</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 font-black text-xs text-navy font-mono truncate">
                  <Cpu size={14} className="text-gold shrink-0" />
                  <span className="truncate">{vehicle.engine || 'დაუზუსტებელი'}</span>
                </div>
              </div>

              {/* Mileage */}
              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400 font-bold">მიმდინარე გარბენი</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onOpenFieldPrompt('mileage_km');
                    }}
                    className="text-[10px] font-bold text-navy hover:text-gold flex items-center gap-0.5"
                  >
                    <Edit3 size={10} />
                    <span>შეცვლა</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 font-black text-xs text-navy font-mono">
                  <Gauge size={14} className="text-gold shrink-0" />
                  <span>{vehicle.mileage_km ? `${vehicle.mileage_km.toLocaleString()} კმ` : 'დაუზუსტებელი'}</span>
                </div>
              </div>

              {/* Fuel Type */}
              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400 font-bold">საწვავის ტიპი</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onOpenFieldPrompt('fuel_type');
                    }}
                    className="text-[10px] font-bold text-navy hover:text-gold flex items-center gap-0.5"
                  >
                    <Edit3 size={10} />
                    <span>შეცვლა</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 font-black text-xs text-navy capitalize">
                  <Fuel size={14} className="text-gold shrink-0" />
                  <span>{vehicle.fuel_type || 'არჩეული არ არის'}</span>
                </div>
              </div>

              {/* VIN */}
              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400 font-bold">VIN შასი</span>
                  <div className="flex items-center gap-1">
                    {onOpenVinHistory && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onOpenVinHistory();
                        }}
                        className="text-[10px] font-bold text-navy hover:text-gold flex items-center gap-0.5"
                        title="VIN ისტორია"
                      >
                        <History size={10} className="text-gold" />
                        <span>ისტორია ↗</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onOpenFieldPrompt('vin');
                      }}
                      className="text-[10px] font-bold text-navy hover:text-gold flex items-center gap-0.5 ml-1"
                    >
                      <Edit3 size={10} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-navy font-mono truncate">
                  <Shield size={14} className="text-gold shrink-0" />
                  <span className="truncate">{vehicle.vin || 'არ არის მითითებული'}</span>
                </div>
              </div>

              {/* Tech Passport */}
              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400 font-bold">ტექ-პასპორტი</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onOpenFieldPrompt('tech_passport');
                    }}
                    className="text-[10px] font-bold text-navy hover:text-gold flex items-center gap-0.5"
                  >
                    <Edit3 size={10} />
                    <span>შეცვლა</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-navy font-mono truncate">
                  <FileText size={14} className="text-gold shrink-0" />
                  <span className="truncate">{vehicle.tech_passport || 'არ არის მითითებული'}</span>
                </div>
              </div>

              {/* OBD Adapter */}
              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400 font-bold">OBD დიაგნოსტიკა</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                    WiFi 4G
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 font-mono">
                  <Wifi size={14} className="text-emerald-500 shrink-0" />
                  <span>{vehicle.obd_ip}:{vehicle.obd_port}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. ACCORDION: VIN FACTORY REQUIREMENTS & OEM SPECS (შეკეცილი / Collapsible) */}
      <div className="rounded-3xl neu-card shadow-neu-card border border-white overflow-hidden bg-white/95">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setIsVinExpanded(!isVinExpanded);
          }}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-sm shrink-0">
              <Cpu className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-navy tracking-tight">
                  ქარხნული VIN დეკოდერი & OEM რეგლამენტი
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-navy text-gold">
                  {decodedVin.vin || 'VIN'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {decodedVin.brand} {decodedVin.model} • {decodedVin.year} წელი • {decodedVin.country} • {decodedVin.engine_desc}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            {isVinExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {isVinExpanded && (
          <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4 animate-fade-in">
            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  const urgent = services && services.length > 0
                    ? (services.find(s => s.health_percentage <= 45) || services[0])
                    : null;
                  setComparisonService(urgent);
                  setIsComparisonModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
              >
                <Scale size={13} className="text-white" />
                <span>შედარება & ვარიანტები</span>
              </button>

              {onOpenVinHistory && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenVinHistory();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-black bg-navy text-gold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
                >
                  <History size={13} className="text-gold" />
                  <span>VIN ისტორია & აუქციონი ↗</span>
                </button>
              )}

              {onResetToVinSpecs && (
                <button
                  onClick={() => {
                    if (window.confirm(`${vehicle.brand} ${vehicle.model}-სთვის (${vehicle.vin}) ქარხნული სერვის-რეგლამენტის თავიდან აწყობა?`)) {
                      sounds.playClearChime();
                      onResetToVinSpecs();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-gold text-navy border border-amber-200 hover:border-gold transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
                >
                  <Sparkles size={13} className="text-amber-600" />
                  <span>რეგლამენტის სინქრონიზაცია</span>
                </button>
              )}
            </div>

            {/* Core Factory Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Oil Spec */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Droplets size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                    ძრავის ზეთის მოთხოვნა
                  </span>
                  <h5 className="text-xs font-black text-navy truncate" title={decodedVin.factory_specs.oil_spec}>
                    {decodedVin.factory_specs.oil_spec}
                  </h5>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {decodedVin.factory_specs.oil_viscosity} {decodedVin.factory_specs.oil_capacity_liters > 0 ? `• ${decodedVin.factory_specs.oil_capacity_liters}L` : ''}
                  </div>
                </div>
              </div>

              {/* Transmission Spec */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CircleDot size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                    კოლოფის სითხე
                  </span>
                  <h5 className="text-xs font-black text-navy truncate" title={decodedVin.transmission_desc}>
                    {decodedVin.transmission_desc}
                  </h5>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate" title={decodedVin.factory_specs.transmission_fluid}>
                    {decodedVin.factory_specs.transmission_fluid}
                  </div>
                </div>
              </div>

              {/* Coolant Spec */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Gauge size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                    ანტიფრიზი
                  </span>
                  <h5 className="text-xs font-black text-navy truncate" title={decodedVin.factory_specs.coolant_spec}>
                    {decodedVin.factory_specs.coolant_spec}
                  </h5>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    ფერით: {decodedVin.factory_specs.coolant_color}
                  </div>
                </div>
              </div>

              {/* Spark Plugs & Brakes Spec */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                    სანთლები & მუხრუჭი
                  </span>
                  <h5 className="text-xs font-black text-navy truncate" title={decodedVin.factory_specs.spark_plug_spec}>
                    {decodedVin.factory_specs.spark_plug_spec}
                  </h5>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate" title={decodedVin.factory_specs.brake_spec}>
                    {decodedVin.factory_specs.brake_spec}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. ACCORDION: SAVED VEHICLES IN GARAGE (შეკეცილი / Collapsible) */}
      <div className="rounded-3xl neu-card shadow-neu-card border border-white overflow-hidden bg-white/95">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setIsVehiclesExpanded(!isVehiclesExpanded);
          }}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-sm shrink-0">
              <Car className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-navy tracking-tight">
                  ჩემი ავტოპარკი / შენახული მანქანები
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/20 text-gold border border-gold/40">
                  {allVehicles.length} ავტომობილი
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ავტომობილის გადართვა, ახლის დამატება ან წაშლა
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            {isVehiclesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {isVehiclesExpanded && (
          <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {allVehicles.map(v => {
                const isSelected = v.id === vehicle.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      sounds.playClick();
                      onSelectVehicle(v);
                    }}
                    className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'neu-card border-gold ring-2 ring-gold/40 shadow-gold-soft'
                        : 'neu-surface border-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl neu-circle flex items-center justify-center text-navy">
                        <Car size={16} className={isSelected ? 'text-gold' : 'text-navy'} />
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
                            className="w-6 h-6 rounded-lg neu-btn flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="მანქანის წაშლა"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <h5 className="font-black text-sm text-navy">{v.brand} {v.model}</h5>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{v.engine || `${v.year} წელი`}</p>
                    
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                      <GeorgianLicensePlate plate={v.plate_number} size="xs" />
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
                className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-gold hover:bg-gold/5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[120px]"
              >
                <div className="w-9 h-9 rounded-xl neu-circle flex items-center justify-center text-gold group-hover:scale-110 transition-transform mb-2">
                  <Plus size={18} className="text-navy" />
                </div>
                <span className="font-black text-xs text-navy group-hover:text-gold transition-colors">
                  + მანქანის დამატება
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  ახალი ავტომობილის პროფილი
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service Offer Comparison Modal */}
      <ServiceOfferComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        service={comparisonService}
        vehicle={vehicle}
        onAcceptOffer={(booking) => {
          if (onAddBooking) {
            onAddBooking(booking);
          }
        }}
      />

    </div>
  );
};

export default GarageModule;
