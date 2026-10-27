import React, { useState, useEffect } from 'react';
import { DtcCode, TelemetryData, VehicleProfile } from '../../types';
import { ThreeCarScene } from '../ThreeCarScene';
import { TelemetryGauges } from './TelemetryGauges';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import { PromptFieldType } from '../Modals/ContextualFieldPromptModal';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Radio,
  Cpu,
  Layers,
  Sparkles,
  Car,
  Check,
  X,
  Gauge,
  Zap,
  Fuel,
  ChevronRight,
  Bluetooth,
  Settings,
  Bot,
  MapPin,
  Info,
  Building
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  telemetry: TelemetryData;
  dtcCodes: DtcCode[];
  onUpdateDtcCodes: (codes: DtcCode[]) => void;
  onOpenClearModal: () => void;
  onAskAiAboutCode: (code: DtcCode) => void;
  onConsultAiMechanic?: (codes: DtcCode[]) => void;
  onUpdateVehicle?: (updated: Partial<VehicleProfile>) => void;
  onOpenAddVehicleWithData?: (data: Partial<VehicleProfile>) => void;
  onAutoRegisterVehicle?: (newVehicle: VehicleProfile) => void;
  isConnected?: boolean;
  onConnectionChange?: (connected: boolean) => void;
  adapterType?: 'wifi' | 'bluetooth' | 'cloud_4g';
  onOpenAdapterModal?: () => void;
  autoStartScanTrigger?: number;
  onOpenFieldPrompt?: (field: PromptFieldType) => void;
}

export const ObdModule: React.FC<Props> = ({
  vehicle,
  telemetry,
  dtcCodes,
  onUpdateDtcCodes,
  onOpenClearModal,
  onAskAiAboutCode,
  onConsultAiMechanic,
  onUpdateVehicle,
  onOpenAddVehicleWithData,
  onAutoRegisterVehicle,
  isConnected: propIsConnected,
  onConnectionChange,
  adapterType = 'wifi',
  onOpenAdapterModal,
  autoStartScanTrigger,
  onOpenFieldPrompt
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [internalConnected, setInternalConnected] = useState(false);
  const isConnected = propIsConnected !== undefined ? propIsConnected : internalConnected;
  const setIsConnected = (val: boolean) => {
    setInternalConnected(val);
    onConnectionChange?.(val);
  };
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string>('დღეს, 16:42');
  const [hasScanned, setHasScanned] = useState<boolean>(() => dtcCodes.length > 0);

  // Embedded Adapter Instructions State
  const [selectedInstructionType, setSelectedInstructionType] = useState<string>(adapterType || 'cloud_4g');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(!isConnected);

  useEffect(() => {
    if (adapterType) {
      setSelectedInstructionType(adapterType);
    }
  }, [adapterType]);

  // OBD ECU Handshake & Auto-Discovery States
  const [isHandshaking, setIsHandshaking] = useState(false);
  const [handshakeStep, setHandshakeStep] = useState(0);
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const [detectedVehicleData, setDetectedVehicleData] = useState<VehicleProfile | null>(null);
  const [autoRegisterSuccess, setAutoRegisterSuccess] = useState(false);

  // Trigger ECU Handshake, Auto-fill data and Prompt Full Registration
  const startEcuHandshakeAndDiscovery = async () => {
    sounds.playScanSweep();
    setIsHandshaking(true);
    setHandshakeStep(1); // Wi-Fi handshake

    await new Promise(r => setTimeout(r, 600));
    setHandshakeStep(2); // Querying PID 09 02 (VIN) & Calibration

    await new Promise(r => setTimeout(r, 650));
    setHandshakeStep(3); // Querying Odometer PID 01 31 & Live Sensors

    await new Promise(r => setTimeout(r, 550));
    setIsConnected(true);
    setIsHandshaking(false);
    sounds.playSuccess();

    // Auto-detected vehicle profile from ECU
    const discovered: VehicleProfile = {
      id: vehicle.id || `CAR_${Date.now().toString().slice(-4)}`,
      brand: vehicle.brand || 'Mercedes-Benz',
      model: vehicle.model && vehicle.model !== '' ? vehicle.model : 'GLA 250',
      year: vehicle.year || 2016,
      engine: vehicle.engine && vehicle.engine !== '' ? vehicle.engine : '2.0L Turbo M270 (1991 cm³ / 208 HP)',
      vin: vehicle.vin && vehicle.vin.length >= 10 ? vehicle.vin : 'WDCTG4GB2GJ193791',
      plate_number: vehicle.plate_number && vehicle.plate_number !== 'GE-000-XX' ? vehicle.plate_number : 'FR-282-EE',
      tech_passport: vehicle.tech_passport || '22-3999',
      mileage_km: vehicle.mileage_km > 0 ? vehicle.mileage_km : 78400,
      fuel_type: vehicle.fuel_type || 'petrol',
      obd_ip: vehicle.obd_ip || '192.168.0.10',
      obd_port: vehicle.obd_port || 35000,
      last_oil_change_km: vehicle.last_oil_change_km || 73200,
      pti_expiry_date: vehicle.pti_expiry_date || '2027-02-15',
      horsepower: vehicle.horsepower || 208
    };

    setDetectedVehicleData(discovered);
    // Auto-fill into current vehicle profile in memory
    onUpdateVehicle?.(discovered);
    setShowRegistrationPrompt(true);
  };

  const handleToggleConnection = () => {
    sounds.playClick();
    if (isConnected) {
      setIsConnected(false);
    } else if (onOpenAdapterModal) {
      onOpenAdapterModal();
    } else {
      startEcuHandshakeAndDiscovery();
    }
  };

  const handleOneTouchScan = async () => {
    if (!isConnected) {
      sounds.playAlert();
      if (onOpenAdapterModal) {
        onOpenAdapterModal();
      }
      return;
    }
    sounds.playScanSweep();
    setIsScanning(true);

    try {
      const res = await n8nService.scanObd("43 01 33 00 00", vehicle.id);
      if (res && res.parsed_codes) {
        onUpdateDtcCodes(res.parsed_codes);
        sounds.playSuccess();
        setHasScanned(true);
      }
    } catch (e) {
      sounds.playAlert();
    } finally {
      setIsScanning(false);
      setHasScanned(true);
      setLastScanTime(new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  // Auto-start scan when triggered from modal "ტესტირების დაწყება"
  useEffect(() => {
    if (autoStartScanTrigger && autoStartScanTrigger > 0) {
      handleOneTouchScan();
    }
  }, [autoStartScanTrigger]);

  const handleInstantAutoRegister = () => {
    if (!detectedVehicleData) return;
    sounds.playSuccess();
    onAutoRegisterVehicle?.(detectedVehicleData);
    setAutoRegisterSuccess(true);
    setTimeout(() => {
      setAutoRegisterSuccess(false);
      setShowRegistrationPrompt(false);
    }, 1800);
  };

  const handleOpenRegistrationWizard = () => {
    sounds.playClick();
    setShowRegistrationPrompt(false);
    if (detectedVehicleData) {
      onOpenAddVehicleWithData?.(detectedVehicleData);
    }
  };

  const getSeverityBadge = (severity: DtcCode['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            კრიტიკული
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-gold"></span>
            საშუალო
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            დაბალი
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. OBD Connection Bar (Master Telematics Deck) */}

      {/* 1. OBD Connection Bar (Master Telematics Deck) */}
      {/* Unified 5-Tier Card matching Parking 4G OBD Banner & Screenshot Aesthetic */}
      <div className="p-4 sm:p-6 rounded-3xl border transition-all bg-gradient-to-br from-slate-900 via-navy to-slate-950 text-white border-gold/40 shadow-xl space-y-4">
        
        {/* Tier 1: Hardware Header & Mode Switcher Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200/20">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isConnected
                ? 'bg-gold/15 text-gold border-gold/30'
                : 'bg-gold/15 text-gold border-gold/30'
            }`}>
              {adapterType === 'bluetooth' ? (
                <Bluetooth className={`w-6 h-6 ${isConnected ? 'animate-pulse text-blue-400' : 'text-gold'}`} />
              ) : adapterType === 'cloud_4g' ? (
                <Radio className={`w-6 h-6 ${isConnected ? 'animate-pulse text-emerald-400' : 'text-gold'}`} />
              ) : (
                <Wifi className={`w-6 h-6 ${isConnected ? 'animate-pulse text-emerald-400' : 'text-gold'}`} />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider shadow-xs ${
                  isConnected
                    ? 'bg-emerald-400 text-slate-950 shadow-xs'
                    : 'bg-amber-400 text-slate-950 shadow-xs'
                }`}>
                  {isConnected ? '🟢 LIVE კავშირი' : '🔶 DEMO რეჟიმი'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {adapterType === 'bluetooth' ? 'BLE 5.0' : adapterType === 'cloud_4g' ? 'IMEI: 863412059123456' : `IP: ${vehicle.obd_ip || 'Wi-Fi ELM327'}`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-slate-300">
                  {isConnected ? 'აქტიური ტელემეტრია' : 'სიმულაცია'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-1 text-white tracking-tight">
                AutoHub 4G OBD სმარტ-დონგლი & დიაგნოსტიკის ცენტრი
              </h3>
            </div>
          </div>

          {/* Mode Switcher / Action Pill */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-800/60 border border-white/10 shrink-0 self-end md:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsInstructionsOpen(!isInstructionsOpen);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isInstructionsOpen
                  ? 'bg-gold text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="ადაპტერის შეერთების ინსტრუქციის ნახვა"
            >
              <Info size={13} className={isInstructionsOpen ? 'text-slate-950' : 'text-gold'} />
              <span>ინსტრუქცია</span>
            </button>

            {onOpenAdapterModal && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenAdapterModal();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                title="ადაპტერის ტიპის არჩევა და შეკვეთა"
              >
                <Settings size={13} className="text-gold" />
                <span className="hidden sm:inline">პარამეტრები</span>
              </button>
            )}

            {isConnected && (
              <>
                <button
                  type="button"
                  onClick={startEcuHandshakeAndDiscovery}
                  disabled={isHandshaking}
                  className="px-3 py-1.5 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                  title="OBD ECU-დან ავტომობილის მონაცემების ამოკითხვა"
                >
                  <Sparkles size={13} className="text-gold" />
                  <span>ECU</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleConnection}
                  disabled={isHandshaking}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="კავშირის გათიშვა"
                >
                  <span>გათიშვა</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tier 2: 6-Card Telemetry Sensor Bar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">სტატუსი</span>
            <span className={`text-sm sm:text-base font-black ${isConnected ? 'text-emerald-400' : 'text-gold'}`}>
              {isConnected ? 'კავშირშია' : 'გათიშულია'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">OBD ძაბვა</span>
            <span className="text-xs font-bold text-emerald-400 block mt-1">
              🔋 {isConnected ? '12.6' : '12.6'} V
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">პროტოკოლი</span>
            <span className="text-xs font-bold text-white block mt-1 truncate">
              CAN 11/500
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">DTC შეცდომები</span>
            <span className={`text-xs font-bold block mt-1 ${
              dtcCodes.length > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
            }`}>
              {dtcCodes.length > 0 ? `🚨 ${dtcCodes.length} კოდი` : '✓ სუფთაა'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">დიაგნოსტიკის ეტაპი</span>
            <span className="text-[11px] font-bold block mt-1 text-gold">
              {!isConnected ? '① მიერთება' : !hasScanned ? '② სკანირება' : '③ მზადაა'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">ბოლო პაკეტი</span>
            <span className="text-[11px] font-bold text-slate-300 block mt-1 truncate">
              {lastScanTime || '17:06:07'}
            </span>
          </div>
        </div>

        {/* Tier 3: 4-Card Vehicle & Spot Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
          {/* 1. დიაგნოსტიკის ავტომობილი */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0 border border-gold/30">
              <Car size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">დიაგნოსტიკის ავტომობილი</span>
              <span className="text-sm font-black text-white block mt-0.5 truncate">
                {vehicle.brand || 'Mercedes-Benz'} {vehicle.model || 'C300'}
              </span>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-bold text-[10px] border border-white/10 tracking-wider">
                  {vehicle.plate_number || 'FR-282-EE'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  VIN: {vehicle.vin ? `${vehicle.vin.slice(0, 7)}...` : 'WDCTG4...'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. OBD პორტის ლოკაცია */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0 border border-gold/30">
              <MapPin size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">OBD პორტის ადგილი</span>
              <span className="text-sm font-black text-gold block mt-0.5 truncate">
                საჭის ქვეშ მარცხნივ
              </span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold text-[10px] border border-white/10">
                16-Pin DLC ინტერფეისი
              </span>
            </div>
          </div>

          {/* 3. ადაპტერის ტიპი & კავშირი */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0 border border-gold/30">
              {adapterType === 'bluetooth' ? <Bluetooth size={18} /> : adapterType === 'cloud_4g' ? <Radio size={18} /> : <Wifi size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">ადაპტერის კავშირი</span>
              <span className="text-sm sm:text-base font-black text-white block mt-0.5">
                {adapterType === 'bluetooth' ? 'BLE 5.0' : adapterType === 'cloud_4g' ? '4G LTE-M' : 'Wi-Fi 2.4G'}
              </span>
              <span className="inline-block mt-1 text-[10px] text-slate-400">
                CAN 11/500 (ISO 15765-4)
              </span>
            </div>
          </div>

          {/* 4. ბორტ-კომპიუტერი (ECU) & ძრავი */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0 border border-gold/30">
              <Cpu size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">ბორტ-კომპიუტერი (ECU)</span>
              <span className="text-sm font-black text-white block mt-0.5 truncate">
                {vehicle.engine ? `ძრავი: ${vehicle.engine}` : 'ძრავი & ტრანსმისია'}
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                  dtcCodes.length > 0
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}>
                  {dtcCodes.length > 0 ? `🚨 ${dtcCodes.length} DTC კოდი` : '✓ შეცდომები სუფთაა'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 4: Direct Embedded Adapter Instructions (ადაპტერის დაერთების ინსტრუქცია პირდაპირ ფანჯარაში) */}
        {isInstructionsOpen && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={14} className="text-gold" />
                  <span>ადაპტერის შეერთების ინსტრუქცია</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/15 text-gold border border-gold/30">
                  ნაბიჯ-ნაბიჯ
                </span>
              </div>

              {/* Adapter Type Selector Tabs */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedInstructionType('cloud_4g');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                    selectedInstructionType === 'cloud_4g'
                      ? 'bg-gold text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Radio size={12} />
                  <span>4G Cloud</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedInstructionType('wifi');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                    selectedInstructionType === 'wifi'
                      ? 'bg-gold text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wifi size={12} />
                  <span>Wi-Fi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedInstructionType('bluetooth');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                    selectedInstructionType === 'bluetooth'
                      ? 'bg-gold text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bluetooth size={12} />
                  <span>Bluetooth</span>
                </button>
              </div>
            </div>

            {/* Instructions Body: 3 Step Cards */}
            {selectedInstructionType === 'cloud_4g' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-white block font-bold font-sans">1. აქტიური SIM ბარათი</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      მოათავსეთ 4G LTE/M SIM ბარათი მოწყობილობაში.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-white block font-bold font-sans">2. შეაერთეთ OBD პორტში</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      ჩასვით საჭის ქვემოთ (16-Pin DLC). LED აინთება მწვანედ.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-white block font-bold font-sans">3. სინქრონიზაცია</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      დააჭირეთ „ადაპტერის მიერთებას“ და სისტემა დაუკავშირდება.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedInstructionType === 'wifi' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-white block font-bold font-sans">1. შეაერთეთ & ანთება ჩართეთ</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      ჩასვით Wi-Fi ადაპტერი OBD პორტში და ჩართეთ Ignition ON (2-ე პოზიცია).
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-white block font-bold font-sans">2. დაუკავშირდით Wi-Fi-ს</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      ტელეფონში აირჩიეთ <code className="text-amber-300">WiFi_OBDII</code> (პაროლი: <span className="text-gold font-mono font-bold">12345678</span>).
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-white block font-bold font-sans">3. დააჭირეთ დაკავშირებას</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      დააჭირეთ „ადაპტერის მიერთებას“ ECU-დან მონაცემების წასაკითხად.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedInstructionType === 'bluetooth' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-white block font-bold font-sans">1. ჩასვით BT ადაპტერი</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      შეაერთეთ Bluetooth ELM327 ან vLinker ადაპტერი OBD პორტში.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-white block font-bold font-sans">2. Bluetooth დაწყვილება</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      მოძებნეთ <code className="text-amber-300">OBDII</code> (PIN: <span className="text-gold font-mono font-bold">1234</span> ან <span className="text-gold font-mono font-bold">0000</span>).
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-white block font-bold font-sans">3. სკანირების დაწყება</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      დააჭირეთ „ადაპტერის მიერთებას“ და დაიწყეთ დიაგნოსტიკა.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Helpful Port Location Tip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/10 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <Info size={13} className="text-gold shrink-0" />
                <span><strong>სად არის პორტი?</strong> 95% მანქანებში პორტი მდებარეობს საჭის ქვემოთ მარცხნივ, მუხლების დონეზე.</span>
              </div>
              {onOpenAdapterModal && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onOpenAdapterModal();
                  }}
                  className="text-gold hover:underline text-[11px] font-bold shrink-0 flex items-center gap-1"
                >
                  <span>დეტალური პარამეტრები & შეკვეთა</span>
                  <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tier 5: Workflow Explainer & Solid Gold Action Button (Exact match to screenshot) */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 text-[11px] leading-relaxed flex items-center gap-2 flex-wrap">
            <span>ℹ️ <strong>დიაგნოსტიკის ეტაპები:</strong></span>
            <span className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] transition-all ${
              !isConnected
                ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-xs'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-bold'
            }`}>
              {isConnected ? '✓ 1. მიერთებულია' : '① 1. მიერთება'}
            </span>
            <span className="text-slate-500">→</span>
            <span className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] transition-all ${
              isConnected && !hasScanned
                ? 'bg-amber-400 text-slate-950 font-black animate-pulse border-amber-300 shadow-xs'
                : hasScanned
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-bold'
                : 'text-slate-500 border-white/10'
            }`}>
              {hasScanned ? '✓ 2. დასკანირებულია' : '② 2. სკანირება'}
            </span>
            <span className="text-slate-500">→</span>
            <span className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] transition-all ${
              dtcCodes.length > 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-black animate-pulse shadow-xs'
                : 'text-slate-500 border-white/10'
            }`}>
              {dtcCodes.length > 0 ? `③ 3. ჩეკის ჩაქრობა (${dtcCodes.length})` : '③ 3. ჩეკი სუფთაა'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Clear Check Engine Button (lights up when DTCs found) */}
            {isConnected && dtcCodes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenClearModal();
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
              >
                <Trash2 size={13} />
                <span>ჩეკის ჩაქრობა ({dtcCodes.length})</span>
              </button>
            )}

            {/* Hero Action Button: Clean solid gold without shining glitter */}
            {!isConnected ? (
              <button
                type="button"
                onClick={handleToggleConnection}
                disabled={isHandshaking}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gold hover:bg-gold/90 text-slate-950 transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
              >
                <Radio size={13} className="text-slate-950" />
                <span>{isHandshaking ? 'მიერთება მიმდინარეობს...' : 'ადაპტერის მიერთება'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOneTouchScan}
                disabled={isScanning || isHandshaking}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gold hover:bg-gold/90 text-slate-950 transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
              >
                <RefreshCw size={13} className={`text-slate-950 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'სკანირება მიმდინარეობს...' : hasScanned ? 'ხელახალი სკანირება' : 'ერთი შეხებით სკანირება'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Missing Vehicle Info Notice */}
      {(!vehicle.vin || vehicle.vin.length < 10 || !vehicle.engine) && (
        <div className="p-3.5 sm:p-4 rounded-3xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span className="font-medium">
              DTC შეცდომების ზუსტი გაშიფვრისთვის დააზუსტეთ ავტომობილის VIN კოდი და ძრავის ტიპი.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {!vehicle.engine && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenFieldPrompt?.('engine');
                }}
                className="px-3 py-1.5 rounded-xl bg-navy text-gold font-bold shadow-xs hover:bg-slate-800 transition-all text-xs"
              >
                + ძრავის მითითება
              </button>
            )}
            {(!vehicle.vin || vehicle.vin.length < 10) && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenFieldPrompt?.('vin');
                }}
                className="px-3 py-1.5 rounded-xl bg-gold text-navy font-bold shadow-xs hover:bg-amber-400 transition-all text-xs"
              >
                + VIN დამატება
              </button>
            )}
          </div>
        </div>
      )}

      {/* Handshake Progress Overlay Modal */}
      {isHandshaking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl neu-card shadow-2xl border border-white text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl neu-circle flex items-center justify-center text-gold mx-auto animate-pulse">
              <Radio size={28} className="text-navy" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-navy">
                OBD-II ECU Handshake მიმდინარეობს...
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                ავტომობილის ქარხნული მონაცემების ავტო-ამოკითხვა
              </p>
            </div>

            <div className="space-y-2 text-left text-xs font-mono">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                handshakeStep >= 1 ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span>1. Wi-Fi კავშირი ({vehicle.obd_ip}:{vehicle.obd_port})</span>
                {handshakeStep >= 1 ? <span>✔ OK</span> : <RefreshCw size={12} className="animate-spin" />}
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                handshakeStep >= 2 ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span>2. ECU PID 09 02: VIN კოდის ამოკითხვა</span>
                {handshakeStep >= 2 ? <span>✔ OK</span> : handshakeStep === 1 ? <RefreshCw size={12} className="animate-spin" /> : <span>...</span>}
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                handshakeStep >= 3 ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span>3. PID 01 31: ოდომეტრი & სენსორები</span>
                {handshakeStep >= 3 ? <span>✔ OK</span> : handshakeStep === 2 ? <RefreshCw size={12} className="animate-spin" /> : <span>...</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL REGISTRATION OFFER MODAL (OBD CONNECTED & AUTO-FILLED) */}
      {showRegistrationPrompt && detectedVehicleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/65 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl neu-card rounded-3xl shadow-neu-modal p-6 sm:p-7 border border-white max-h-[92vh] overflow-y-auto space-y-5">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-navy flex items-center justify-center shadow-gold-soft shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      ECU Handshake Live
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      CAN 11/500
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-navy mt-1">
                    OBD-II დაკავშირდა — მანქანა ამოცნობილია!
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setShowRegistrationPrompt(false);
                }}
                className="w-8 h-8 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Success message banner */}
            {autoRegisterSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 flex items-center gap-3 font-bold text-xs animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>ავტომობილი წარმატებით დარეგისტრირდა და შენახულია თქვენს ციფრულ გარაჟში!</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-navy flex items-start gap-2.5">
                <InfoIcon />
                <p className="leading-relaxed">
                  ბორტ-კომპიუტერმა (ECU) გადმოსცა ავტომობილის მონაცემები. მონაცემები ავტომატურად შეივსო. <strong>გსურთ ამ ავტომობილის სრული რეგისტრაცია?</strong>
                </p>
              </div>
            )}

            {/* Extracted Data Visual Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-extrabold text-sm text-navy">
                  <Car size={18} className="text-gold" />
                  <span>{detectedVehicleData.brand} {detectedVehicleData.model}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-navy text-gold">
                  {detectedVehicleData.year} წელი
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">VIN კოდი (PID 09 02)</span>
                  <span className="font-mono font-bold text-navy text-[11px]">{detectedVehicleData.vin}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">სახელმწიფო ნომერი</span>
                  <span className="font-mono font-black text-navy">{detectedVehicleData.plate_number}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">ძრავა & სიმძლავრე</span>
                  <span className="font-bold text-navy truncate block">{detectedVehicleData.engine} ({detectedVehicleData.horsepower} HP)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">ოდომეტრი / გარბენი</span>
                  <span className="font-mono font-black text-emerald-700">{detectedVehicleData.mileage_km.toLocaleString()} კმ</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>საწვავი: {detectedVehicleData.fuel_type === 'petrol' ? 'ბენზინი' : detectedVehicleData.fuel_type}</span>
                <span>OBD IP: {detectedVehicleData.obd_ip}:{detectedVehicleData.obd_port}</span>
              </div>
            </div>

            {/* Actions: Full Registration Wizard vs 1-Click Instant Save */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Full 4-Step Registration Wizard */}
                <button
                  type="button"
                  onClick={handleOpenRegistrationWizard}
                  className="px-4 py-3 rounded-2xl bg-navy hover:bg-slate-800 text-gold font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Car size={16} />
                  <span>სრული რეგისტრაციის ოსტატი</span>
                  <ChevronRight size={14} />
                </button>

                {/* 2. 1-Click Auto Register & Save to Garage */}
                <button
                  type="button"
                  onClick={handleInstantAutoRegister}
                  className="px-4 py-3 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-gold-soft flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Check size={16} />
                  <span>1-კლიკით ავტო-რეგისტრაცია</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowRegistrationPrompt(false);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-navy transition-colors"
              >
                მოგვიანებით / დახურვა
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. 3D Studio Viewport */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-gold" />
            3D ინტერაქტიული დიაგნოსტიკის სტუდია
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {vehicle.brand} {vehicle.model} • {vehicle.engine}
          </span>
        </div>
        <ThreeCarScene
          isScanning={isScanning}
          selectedComponent={selectedComponent}
          onSelectComponent={(id) => setSelectedComponent(id)}
          hasErrors={dtcCodes.length > 0}
          dtcCodes={dtcCodes}
          onAskAiAboutCode={onAskAiAboutCode}
          vehicle={vehicle}
        />
      </div>

      {/* 2.5. DIAGNOSTIC RESULTS: "რა აანთო Check Engine?" + 2 დიდი ღილაკი */}
      <div className="p-5 sm:p-6 rounded-3xl neu-card shadow-neu-card border border-white space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl neu-circle flex items-center justify-center shrink-0 ${
              dtcCodes.length > 0 ? 'text-rose-500 shadow-rose-500/20' : 'text-emerald-600 shadow-emerald-500/20'
            }`}>
              {dtcCodes.length > 0 ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-navy">
                  {dtcCodes.length > 0 ? 'დიაგნოსტიკის პასუხები: რა აანთო Check Engine?' : 'დიაგნოსტიკის პასუხები: სისტემა გამართულია'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  dtcCodes.length > 0 ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {dtcCodes.length > 0 ? `${dtcCodes.length} ხარვეზი ნაპოვნია` : '0 ხარვეზი'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {dtcCodes.length > 0
                  ? 'ბორტ-კომპიუტერმა (ECU) აღმოაჩინა შემდეგი კვანძების გაუმართაობა:'
                  : 'ბორტ-კომპიუტერში შეცდომის კოდები არ ფიქსირდება. Check Engine ჩამქრალია.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              {lastScanTime ? `ბოლო სკანირება: ${lastScanTime}` : 'ცოცხალი რეჟიმი'}
            </span>
          </div>
        </div>

        {/* Breakdown of What Triggered the Warning */}
        {dtcCodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {dtcCodes.map((dtc) => (
              <div
                key={dtc.code}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-rose-200/80 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-lg bg-rose-500 text-white shadow-2xs">
                      {dtc.code}
                    </span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {dtc.severity === 'critical' || dtc.severity === 'high' ? '● მაღალი რისკი' : '● საშუალო'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-navy leading-snug">
                    {dtc.title_ge}
                  </h4>

                  <p className="text-[11px] text-slate-600 mt-1 leading-snug bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    {dtc.advice}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">სავარაუდო ხარჯი:</span>
                  <span className="font-bold text-gold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900">
                    ~{dtc.estimated_cost_gel || 120} ₾
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs font-medium">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div>
              <strong>ყველა სისტემა ნორმაშია!</strong>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                ძრავის, გამონაბოლქვისა და ტრანსმისიის მოდულები მუშაობს გამართულად. Check Engine არ არის გააქტიურებული.
              </p>
            </div>
          </div>
        )}

        {/* TWO BIG ACTION BUTTONS: Clear Check Engine & Consult AI Mechanic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3">
          {/* Button 1: გასუფთავება (ჩეკის ჩაქრობა) */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenClearModal();
            }}
            disabled={dtcCodes.length === 0}
            className={`py-4 px-6 text-xs sm:text-sm font-black transition-all ${
              dtcCodes.length > 0
                ? 'btn-stitch-rose w-full'
                : 'bg-slate-200 text-slate-400 rounded-full cursor-not-allowed opacity-60 flex items-center justify-center gap-2'
            }`}
          >
            <Trash2 size={18} className="shrink-0" />
            <span>გასუფთავება (ჩეკის ჩაქრობა)</span>
          </button>

          {/* Button 2: კონსულტაცია AI მექანიკოსთან */}
          <button
            onClick={() => {
              sounds.playSuccess();
              if (onConsultAiMechanic) {
                onConsultAiMechanic(dtcCodes);
              } else if (dtcCodes.length > 0) {
                onAskAiAboutCode(dtcCodes[0]);
              }
            }}
            className="btn-stitch-ai w-full py-4 px-6 text-xs sm:text-sm font-black"
          >
            <Bot size={18} className="text-gold shrink-0" />
            <span>კონსულტაცია AI მექანიკოსთან</span>
            <Sparkles size={16} className="text-gold shrink-0 animate-pulse" />
          </button>
        </div>
      </div>

      {/* 3. Live Gauges */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-gold" />
            ცოცხალი ტელემეტრია & მაჩვენებლები (Live Data PIDs)
          </h2>
          <span className="text-xs text-emerald-700 font-mono font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            10 Hz განახლება
          </span>
        </div>
        <TelemetryGauges telemetry={telemetry} />
      </div>

      {/* 4. DTC Codes Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-navy flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${dtcCodes.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
              DTC ხარვეზების დაფა
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
              dtcCodes.length > 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {dtcCodes.length} აქტიური კოდი
            </span>
          </div>
        </div>

        {dtcCodes.length === 0 ? (
          <div className="p-8 rounded-3xl neu-card text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full neu-circle flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-navy">სისტემა სუფთაა! ხარვეზები არ არის ნაპოვნი</h3>
            <p className="text-xs text-slate-500 max-w-md">
              ბორტ-კომპიუტერში Check Engine DTC კოდები არ ფიქსირდება.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dtcCodes.map((dtc) => (
              <div
                key={dtc.code}
                className="rounded-3xl neu-card p-5 flex flex-col justify-between transition-all shadow-neu-card hover:scale-[1.01]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-navy font-mono font-black text-sm border border-slate-200">
                      {dtc.code}
                    </span>
                    {getSeverityBadge(dtc.severity)}
                  </div>

                  <h3 className="text-base font-bold text-navy mb-2 leading-snug">
                    {dtc.title_ge}
                  </h3>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                    {dtc.advice}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">მოძრაობის გაგრძელება:</span>
                    {dtc.safe_to_drive ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        დასაშვებია
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        გააჩერეთ ძრავი!
                      </span>
                    )}
                  </div>

                  {dtc.estimated_cost_gel && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">სავარაუდო ხარჯი:</span>
                      <span className="font-mono font-bold text-navy bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-800">
                        ~{dtc.estimated_cost_gel} ₾ (თბილისი)
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onAskAiAboutCode(dtc);
                    }}
                    className="w-full mt-2 py-2.5 px-3 rounded-2xl text-xs font-bold neu-btn text-navy hover:text-gold flex items-center justify-center gap-2"
                  >
                    <span>კითხე AI მექანიკოსს</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Simple Info Icon component
const InfoIcon = () => (
  <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default ObdModule;
