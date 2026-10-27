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
  ChevronDown,
  Bluetooth,
  Settings,
  Bot,
  MapPin,
  Info,
  HelpCircle,
  ShoppingBag,
  Smartphone,
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
  const [sequenceBusy, setSequenceBusy] = useState(false);
  const [scanOutcome, setScanOutcome] = useState<'success' | 'error' | null>(null);
  const [internalConnected, setInternalConnected] = useState(false);
  const isConnected = propIsConnected !== undefined ? propIsConnected : internalConnected;
  const setIsConnected = (val: boolean) => {
    setInternalConnected(val);
    onConnectionChange?.(val);
  };
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string>('დღეს, 16:42');
  const [hasScanned, setHasScanned] = useState<boolean>(() => dtcCodes.length > 0);

  // Embedded Adapter Instructions State (Matches ObdAdapterConnectModal)
  const [selectedInstructionType, setSelectedInstructionType] = useState<string>(adapterType || 'cloud_4g');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [showPortHint, setShowPortHint] = useState<boolean>(false);

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
    if (isScanning || sequenceBusy) return;
    if (!isConnected) {
      sounds.playAlert();
      if (onOpenAdapterModal) {
        onOpenAdapterModal();
      }
      return;
    }
    sounds.playScanSweep();
    setScanOutcome(null);
    setIsScanning(true);

    try {
      const res = await n8nService.scanObd("43 01 33 00 00", vehicle.id);
      if (res && Array.isArray(res.parsed_codes)) {
        onUpdateDtcCodes(res.parsed_codes);
        setScanOutcome('success');
        sounds.playSuccess();
        setHasScanned(true);
      } else {
        setScanOutcome('error');
      }
    } catch (e) {
      setScanOutcome('error');
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
      {/* Unified Card — OBD-II ადაპტერთან დაკავშირება (ზუსტი სტილი და ფერები ObdAdapterConnectModal-იდან) */}
      <div className="p-5 sm:p-6 lg:p-7 rounded-3xl neu-card shadow-neu-card border border-white/80 bg-[#ECEAE5] text-navy space-y-5 transition-all">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-sm shrink-0 bg-white border border-white">
              <Zap className="w-6 h-6 text-navy fill-navy" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-navy tracking-tight">
                  OBD-II ადაპტერთან დაკავშირება
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/15 text-navy border border-gold/30">
                  {isConnected ? 'LIVE' : isHandshaking ? 'SYNC' : 'SETUP'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isConnected
                  ? 'კავშირი წარმატებით დამყარდა! დაიწყეთ მანქანის დიაგნოსტიკა'
                  : isHandshaking
                  ? 'მიმდინარეობს ECU ბორტ-კომპიუტერთან სინქრონიზაცია...'
                  : 'აირჩიეთ ადაპტერის ტიპი და დააჭირეთ დაკავშირებას'}
              </p>
            </div>
          </div>

          {/* Right Header Status Actions (NO instructions or settings buttons) */}
          <div className="flex items-center gap-2 shrink-0">
            {isConnected && (
              <>
                <button
                  type="button"
                  onClick={startEcuHandshakeAndDiscovery}
                  disabled={isHandshaking || isScanning || sequenceBusy}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 shadow-2xs"
                  title="OBD ECU-დან ავტომობილის მონაცემების ამოკითხვა"
                >
                  <Sparkles size={13} className="text-gold" />
                  <span>ECU</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleConnection}
                  disabled={isHandshaking || isScanning || sequenceBusy}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                  title="კავშირის გათიშვა"
                >
                  <span>გათიშვა</span>
                </button>
              </>
            )}

            {isConnected && dtcCodes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenClearModal();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>ჩეკის ჩაქრობა ({dtcCodes.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* High-Tech Connection Animation during Handshake */}
        {isHandshaking && (
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gold/40 shadow-xl space-y-4 animate-fade-in text-center">
            <div className="relative py-3 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-navy text-gold flex items-center justify-center shadow-md relative">
                  <Smartphone className="w-6 h-6" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-1 -right-1 animate-ping"></span>
                </div>
                <span className="text-[10px] font-bold text-navy mt-1 font-mono">AutoHub AI</span>
              </div>

              <div className="flex-1 max-w-[180px] flex items-center justify-center relative px-2">
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-gold via-amber-400 to-emerald-500 w-1/2 rounded-full animate-pulse mx-auto"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center animate-ping">
                    <Zap className="w-3.5 h-3.5 text-gold" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-gold text-navy flex items-center justify-center shadow-md relative">
                  <Car className="w-6 h-6" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-1 -right-1 animate-pulse"></span>
                </div>
                <span className="text-[10px] font-bold text-navy mt-1 font-mono">{vehicle.brand} {vehicle.model}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-950 font-bold flex items-center justify-center gap-2">
              <RefreshCw size={13} className="animate-spin text-gold" />
              <span>
                {selectedInstructionType === 'wifi'
                  ? 'Wi-Fi ELM327 სინქრონიზაცია...'
                  : selectedInstructionType === 'bluetooth'
                  ? 'Bluetooth BLE დაწყვილება...'
                  : '4G LTE-M Cloud დაკავშირება...'}
              </span>
            </div>
          </div>
        )}

        {/* 1. აირჩიეთ ადაპტერის ტიპი: (4 ფანჯარა: 4G, Wi-Fi, Bluetooth და მეოთხე - დაკავშირება) */}
        <div>
          <label className="text-xs font-black text-navy uppercase tracking-wider block mb-2.5">
            1. აირჩიეთ ადაპტერის ტიპი:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: 4G / GPS Cloud */}
            <div
              onClick={() => {
                sounds.playClick();
                if (isInstructionsOpen && selectedInstructionType === 'cloud_4g') {
                  setIsInstructionsOpen(false);
                } else {
                  setSelectedInstructionType('cloud_4g');
                  setIsInstructionsOpen(true);
                }
              }}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                isInstructionsOpen && selectedInstructionType === 'cloud_4g'
                  ? 'bg-white shadow-md border-gold ring-2 ring-gold/40'
                  : 'neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white'
              } ${isHandshaking ? 'pointer-events-none opacity-80' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isInstructionsOpen && selectedInstructionType === 'cloud_4g' ? 'bg-gold text-navy font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Radio className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-950 border-amber-300 font-black ring-1 ring-amber-400/40">
                    ★ რეკომენდებული
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">4G / GPS Cloud</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    4G LTE Dongle / Teltonika / GPS ტრეკერი
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● 24/7 ონლაინ მონიტორინგი & GPS
                  </span>
                </div>

                {isInstructionsOpen && selectedInstructionType === 'cloud_4g' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold text-navy flex items-center justify-center shadow-xs">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                )}
              </div>

              <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-sans font-bold transition-colors ${
                isInstructionsOpen && selectedInstructionType === 'cloud_4g'
                  ? 'border-gold/30 text-navy'
                  : 'border-slate-100 text-slate-500 group-hover:text-navy'
              }`}>
                <span>ინსტრუქცია</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${
                  isInstructionsOpen && selectedInstructionType === 'cloud_4g' ? 'rotate-180 text-navy' : ''
                }`} />
              </div>
            </div>

            {/* Card 2: Wi-Fi ადაპტერი */}
            <div
              onClick={() => {
                sounds.playClick();
                if (isInstructionsOpen && selectedInstructionType === 'wifi') {
                  setIsInstructionsOpen(false);
                } else {
                  setSelectedInstructionType('wifi');
                  setIsInstructionsOpen(true);
                }
              }}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                isInstructionsOpen && selectedInstructionType === 'wifi'
                  ? 'bg-white shadow-md border-gold ring-2 ring-gold/40'
                  : 'neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white'
              } ${isHandshaking ? 'pointer-events-none opacity-80' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isInstructionsOpen && selectedInstructionType === 'wifi' ? 'bg-gold text-navy font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Wifi className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">
                    სწრაფი (50 PID)
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">Wi-Fi ადაპტერი</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    ELM327 Wi-Fi / vLinker / UniCarScan
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● მაღალი სიჩქარე (50 PID/წმ)
                  </span>
                </div>

                {isInstructionsOpen && selectedInstructionType === 'wifi' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold text-navy flex items-center justify-center shadow-xs">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                )}
              </div>

              <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-sans font-bold transition-colors ${
                isInstructionsOpen && selectedInstructionType === 'wifi'
                  ? 'border-gold/30 text-navy'
                  : 'border-slate-100 text-slate-500 group-hover:text-navy'
              }`}>
                <span>ინსტრუქცია</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${
                  isInstructionsOpen && selectedInstructionType === 'wifi' ? 'rotate-180 text-navy' : ''
                }`} />
              </div>
            </div>

            {/* Card 3: Bluetooth ადაპტერი */}
            <div
              onClick={() => {
                sounds.playClick();
                if (isInstructionsOpen && selectedInstructionType === 'bluetooth') {
                  setIsInstructionsOpen(false);
                } else {
                  setSelectedInstructionType('bluetooth');
                  setIsInstructionsOpen(true);
                }
              }}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                isInstructionsOpen && selectedInstructionType === 'bluetooth'
                  ? 'bg-white shadow-md border-gold ring-2 ring-gold/40'
                  : 'neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white'
              } ${isHandshaking ? 'pointer-events-none opacity-80' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isInstructionsOpen && selectedInstructionType === 'bluetooth' ? 'bg-gold text-navy font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Bluetooth className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                    BLE 4.0 / 5.0
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">Bluetooth ადაპტერი</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    ELM327 BT / Carista / OBDLink CX / vLinker MC+
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● დაბალი ენერგომოხმარება
                  </span>
                </div>

                {isInstructionsOpen && selectedInstructionType === 'bluetooth' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold text-navy flex items-center justify-center shadow-xs">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                )}
              </div>

              <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-sans font-bold transition-colors ${
                isInstructionsOpen && selectedInstructionType === 'bluetooth'
                  ? 'border-gold/30 text-navy'
                  : 'border-slate-100 text-slate-500 group-hover:text-navy'
              }`}>
                <span>ინსტრუქცია</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${
                  isInstructionsOpen && selectedInstructionType === 'bluetooth' ? 'rotate-180 text-navy' : ''
                }`} />
              </div>
            </div>

            {/* Card 4: დაკავშირება (ცალკე მეოთხე ფანჯარა - მშვიდი და დახვეწილი სტილი) */}
            <div
              onClick={() => {
                sounds.playClick();
                if (!isConnected) {
                  startEcuHandshakeAndDiscovery();
                } else {
                  handleOneTouchScan();
                }
              }}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between group active:scale-[0.98] ${
                isConnected
                  ? 'bg-white shadow-md border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white hover:border-gold/70'
              } ${isHandshaking ? 'pointer-events-none opacity-80' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-navy group-hover:bg-gold/25'
                    }`}
                  >
                    {!isConnected ? (
                      <Zap className={`w-5 h-5 text-gold fill-gold ${isHandshaking ? 'animate-pulse' : ''}`} />
                    ) : (
                      <RefreshCw className={`w-5 h-5 text-emerald-600 ${isScanning ? 'animate-spin' : ''}`} />
                    )}
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-900 border-amber-200 font-black'
                  }`}>
                    {!isConnected ? '⚡ დაკავშირება' : '🟢 LIVE ECU'}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">
                    {!isConnected
                      ? (isHandshaking ? 'მიერთება...' : 'დაკავშირება')
                      : ((isScanning || sequenceBusy) ? 'სკანირება...' : hasScanned ? 'ხელახალი სკანირება' : 'სკანირება')}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {!isConnected ? 'ECU სინქრონიზაცია' : 'ECU მზადაა • დააჭირეთ'}
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● {!isConnected ? 'დააჭირეთ დაკავშირებას' : 'აქტიური ტელემეტრია'}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-sans font-bold text-slate-500 group-hover:text-navy transition-colors">
                <span>{!isConnected ? 'მიერთება' : 'სკანირება'}</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform text-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. დამაკავშირებელი ინსტრუქცია (ჩამოიშლება მხოლოდ დაჭერისას) */}
        {isInstructionsOpen && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-black text-navy flex items-center gap-1.5 uppercase tracking-wide">
                <span>2. დამაკავშირებელი ინსტრუქცია</span>
                <span className="text-gold font-mono font-bold">
                  ({selectedInstructionType === 'wifi' ? 'Wi-Fi' : selectedInstructionType === 'bluetooth' ? 'Bluetooth' : '4G CLOUD'})
                </span>
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setShowPortHint(!showPortHint);
                  }}
                  className="text-[11px] font-bold text-navy hover:text-gold flex items-center gap-1 transition-colors"
                >
                  <HelpCircle size={13} className="text-gold" />
                  <span>სად არის OBD პორტი?</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsInstructionsOpen(false);
                  }}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-navy transition-all"
                  title="დახურვა"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Collapsible Port Location Hint */}
            {showPortHint && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 animate-fade-in flex items-start gap-2.5">
                <Info size={16} className="text-gold shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>სად მდებარეობს OBD-II პორტი?</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    უმეტეს ავტომობილში (95%) პორტი მდებარეობს მძღოლის მხარეს, საჭის ქვემოთ, მუხლების დონეზე ან დაცვის პლასტმასის საფარის ქვეშ.
                  </p>
                </div>
              </div>
            )}

            {/* Wi-Fi Steps */}
            {selectedInstructionType === 'wifi' && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-navy font-bold">შეაერთეთ ადაპტერი მანქანაში:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ჩასვით Wi-Fi ადაპტერი OBD-II პორტში (საჭის ქვეშ მარცხნივ). ინდიკატორი აინთება.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-navy font-bold">ჩართეთ მანქანის აალება (Ignition ON):</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      გადაატრიალეთ გასაღები 2-ე პოზიციაზე (ისე რომ პანელი აინთოს) ან დაქოქეთ ავტომობილი.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-navy font-bold">დაუკავშირდით ადაპტერის Wi-Fi ქსელს:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      გახსენით ტელეფონის Wi-Fi, აირჩიეთ <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-navy">WiFi_OBDII</code> ან <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-navy">vLinker-WiFi</code>. პაროლი: <span className="font-mono font-bold text-gold">12345678</span> (ან პაროლის გარეშე).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bluetooth Steps */}
            {selectedInstructionType === 'bluetooth' && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-navy font-bold">ჩასვით Bluetooth OBD ადაპტერი:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      შეაერთეთ Bluetooth ადაპტერი OBD პორტში (საჭის ქვეშ).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-navy font-bold">ჩართეთ აალება (Ignition ON):</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ჩართეთ მანქანის ელექტროენერგია გასაღებით ან Start/Stop ღილაკით.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-navy font-bold">Bluetooth დაწყვილება (Pairing):</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ტელეფონში მოძებნეთ <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-navy">OBDII</code> ან <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-navy">OBDLink CX</code> (პინი: <span className="font-mono font-bold">1234</span> ან <span className="font-mono font-bold">0000</span>).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4G Steps */}
            {selectedInstructionType === 'cloud_4g' && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-navy font-bold">აქტიური SIM ბარათი:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ჩადეთ აქტიური 4G/LTE SIM ბარათი ინტერნეტის პაკეტით მოწყობილობაში.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-navy font-bold">შეაერთეთ OBD-II პორტში:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      მოწყობილობა იღებს 12V კვებას. დაელოდეთ LED ინდიკატორების განათებას.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Action Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {onOpenAdapterModal && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenAdapterModal();
              }}
              className="btn-stitch-soft w-full sm:w-auto px-6 py-3.5 text-xs font-bold flex items-center justify-center gap-2 group transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
              <span>ადაპტერის შეკვეთა</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              if (!isConnected) {
                startEcuHandshakeAndDiscovery();
              } else {
                handleOneTouchScan();
              }
            }}
            disabled={isHandshaking || isScanning || sequenceBusy}
            className="btn-stitch-navy w-full sm:flex-1 py-3.5 sm:py-4 px-8 text-sm sm:text-base font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Zap className="w-5 h-5 text-gold fill-gold" />
            <span>
              {isConnected
                ? ((isScanning || sequenceBusy) ? 'სკანირება...' : hasScanned ? 'ხელახალი სკანირება' : 'სკანირების დაწყება')
                : (isHandshaking ? 'მიერთება მიმდინარეობს...' : 'დაკავშირება')}
            </span>
            <ArrowRight size={17} className="text-gold" />
          </button>
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
          onStartScan={handleOneTouchScan}
          isScanning={isScanning}
          scanOutcome={scanOutcome}
          onSequenceBusyChange={setSequenceBusy}
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
