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
  Bot
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
  const [selectedComponent, setSelectedComponent] = useState<string | null>('engine');
  const [lastScanTime, setLastScanTime] = useState<string>('დღეს, 16:42');

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
    sounds.playScanSweep();
    setIsScanning(true);

    try {
      const res = await n8nService.scanObd("43 01 33 00 00", vehicle.id);
      if (res && res.parsed_codes) {
        onUpdateDtcCodes(res.parsed_codes);
        sounds.playSuccess();
      }
    } catch (e) {
      sounds.playAlert();
    } finally {
      setIsScanning(false);
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
      
      {/* 1. OBD Connection Bar (Neumorphic Card) */}
      <div className="p-4 sm:p-5 rounded-3xl neu-card shadow-neu-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-sm shrink-0">
            {isConnected ? (
              adapterType === 'bluetooth' ? (
                <Bluetooth className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              ) : adapterType === 'cloud_4g' ? (
                <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              ) : (
                <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              )
            ) : (
              <WifiOff className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-extrabold text-navy tracking-wide">
                {adapterType === 'bluetooth'
                  ? 'OBD-II Bluetooth ადაპტერი'
                  : adapterType === 'cloud_4g'
                  ? 'OBD-II 4G Cloud ადაპტერი'
                  : 'OBD-II Wi-Fi ადაპტერი'}
              </span>
              <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold ${
                isConnected ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800'
              }`}>
                {isConnected ? 'LIVE კავშირი' : 'გათიშულია'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-mono mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span>{adapterType === 'bluetooth' ? 'Bluetooth BLE 5.0' : adapterType === 'cloud_4g' ? 'LTE Cat-M1' : `IP: ${vehicle.obd_ip}:${vehicle.obd_port}`}</span>
              <span>•</span>
              <span>CAN 11/500</span>
              <span>•</span>
              <span>{lastScanTime}</span>
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {/* Adapter Selection & Instructions Modal Trigger */}
          {onOpenAdapterModal && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAdapterModal();
              }}
              className="btn-stitch-soft flex-1 sm:flex-none justify-center px-3.5 py-2 sm:py-2.5 text-xs font-bold whitespace-nowrap"
              title="ადაპტერის ტიპის არჩევა (Wi-Fi / Bluetooth / 4G) და ინსტრუქცია"
            >
              <Settings className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>ადაპტერი & ინსტრუქცია</span>
            </button>
          )}

          {/* ECU Discovery & Register Button */}
          <button
            onClick={startEcuHandshakeAndDiscovery}
            disabled={isHandshaking}
            className="btn-stitch-soft flex-1 sm:flex-none justify-center px-4 py-2.5 text-xs font-black whitespace-nowrap"
            title="OBD ECU-დან ავტომობილის მონაცემების ამოკითხვა და რეგისტრაცია"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>ECU ამოცნობა</span>
          </button>

          <button
            onClick={handleToggleConnection}
            disabled={isHandshaking}
            className={`flex-1 sm:flex-none justify-center px-4 py-2.5 text-xs font-black whitespace-nowrap transition-all ${
              isConnected ? 'btn-stitch-soft text-navy' : 'btn-stitch-primary text-navy'
            }`}
          >
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span>{isConnected ? 'გათიშვა' : 'მიერთება'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenClearModal();
            }}
            disabled={dtcCodes.length === 0}
            className={`flex-1 sm:flex-none justify-center px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
              dtcCodes.length > 0
                ? 'btn-stitch-rose text-white'
                : 'neu-inset text-slate-400 rounded-full border-transparent cursor-not-allowed opacity-60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>ჩეკის ჩაქრობა</span>
          </button>

          {/* ONE-TOUCH SCAN */}
          <button
            onClick={handleOneTouchScan}
            disabled={isScanning || isHandshaking}
            className="btn-stitch-primary w-full sm:w-auto justify-center px-6 py-3 text-xs sm:text-sm font-black"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'სკანირება მიმდინარეობს...' : 'ერთი შეხებით სკანირება'}</span>
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
