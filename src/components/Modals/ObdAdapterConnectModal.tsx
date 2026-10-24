import React, { useState } from 'react';
import { sounds } from '../../services/soundEffects';
import {
  Wifi,
  Bluetooth,
  Radio,
  X,
  Check,
  ChevronRight,
  Sparkles,
  Info,
  ShieldCheck,
  Smartphone,
  Cpu,
  Zap,
  HelpCircle,
  Car,
  Activity,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export type ObdAdapterType = 'wifi' | 'bluetooth' | 'cloud_4g';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnectSuccess: (adapterType: ObdAdapterType, startTesting?: boolean) => void;
  vehicleIp?: string;
  vehiclePort?: number;
  initialType?: ObdAdapterType;
  vehicleBrand?: string;
  vehicleModel?: string;
}

export const ObdAdapterConnectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConnectSuccess,
  vehicleIp = '192.168.0.10',
  vehiclePort = 35000,
  initialType = 'wifi',
  vehicleBrand = 'BMW',
  vehicleModel = '330i'
}) => {
  const [selectedType, setSelectedType] = useState<ObdAdapterType>(() => {
    try {
      const saved = localStorage.getItem('autohub_obd_adapter_type') as ObdAdapterType;
      if (saved && ['wifi', 'bluetooth', 'cloud_4g'].includes(saved)) {
        return saved;
      }
    } catch {}
    return initialType;
  });

  // Phases: 'idle' (selection) -> 'connecting' (animation) -> 'connected' (ready to test)
  const [connectionPhase, setConnectionPhase] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [connectStep, setConnectStep] = useState<number>(0);
  const [showPortHint, setShowPortHint] = useState(false);

  // Custom fields
  const [ipAddress, setIpAddress] = useState(vehicleIp);
  const [portNumber, setPortNumber] = useState(vehiclePort.toString());
  const [imeiNumber, setImeiNumber] = useState('864920049182341');

  if (!isOpen) return null;

  const handleSelectType = (type: ObdAdapterType) => {
    if (connectionPhase !== 'idle') return;
    sounds.playClick();
    setSelectedType(type);
    try {
      localStorage.setItem('autohub_obd_adapter_type', type);
    } catch {}
  };

  // 1. Click "დაკავშირება" -> runs connection animation
  const handleStartConnection = async () => {
    sounds.playScanSweep();
    setConnectionPhase('connecting');
    setConnectStep(1); // Connecting to device

    await new Promise(r => setTimeout(r, 700));
    setConnectStep(2); // CAN-Bus Protocol & Baudrate

    await new Promise(r => setTimeout(r, 750));
    setConnectStep(3); // Querying ECU & Sensors

    await new Promise(r => setTimeout(r, 600));
    sounds.playSuccess();
    setConnectionPhase('connected');
  };

  // 2. Click "ტესტირების დაწყება" -> closes modal & starts diagnostics immediately!
  const handleStartTesting = () => {
    sounds.playSuccess();
    onConnectSuccess(selectedType, true);
    onClose();
    setConnectionPhase('idle');
  };

  const handleClose = () => {
    sounds.playClick();
    onClose();
    setConnectionPhase('idle');
  };

  const adapterOptions = [
    {
      id: 'wifi' as const,
      title: 'Wi-Fi ადაპტერი',
      subtitle: 'ELM327 Wi-Fi / vLinker / UniCarScan',
      badge: 'რეკომენდებული',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Wifi,
      speedText: 'მაღალი სიჩქარე (50 PID/წმ)'
    },
    {
      id: 'bluetooth' as const,
      title: 'Bluetooth ადაპტერი',
      subtitle: 'ELM327 BT / Carista / OBDLink CX / vLinker MC+',
      badge: 'BLE 4.0 / 5.0',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Bluetooth,
      speedText: 'დაბალი ენერგომოხმარება'
    },
    {
      id: 'cloud_4g' as const,
      title: '4G / GPS Cloud',
      subtitle: '4G LTE Dongle / Teltonika / GPS ტრეკერი',
      badge: 'დისტანციური 24/7',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Radio,
      speedText: 'ონლაინ მონიტორინგი'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl neu-card p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto border border-white/80 bg-[#ECEAE5]">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-gold shadow-sm shrink-0">
              <Zap className="w-6 h-6 text-navy" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-navy tracking-tight">
                  OBD-II ადაპტერთან დაკავშირება
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/15 text-navy border border-gold/30">
                  {connectionPhase === 'connected' ? 'LIVE' : connectionPhase === 'connecting' ? 'SYNC' : 'SETUP'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {connectionPhase === 'connected'
                  ? 'კავშირი წარმატებით დამყარდა! დაიწყეთ მანქანის დიაგნოსტიკა'
                  : connectionPhase === 'connecting'
                  ? 'მიმდინარეობს ECU ბორტ-კომპიუტერთან სინქრონიზაცია...'
                  : 'აირჩიეთ ადაპტერის ტიპი და დააჭირეთ დაკავშირებას'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy transition-all shrink-0 hover:scale-105"
            title="დახურვა"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Adapter Selection (When idle or connecting) */}
        {connectionPhase !== 'connected' && (
          <div>
            <label className="text-xs font-black text-navy uppercase tracking-wider block mb-2">
              1. აირჩიეთ ადაპტერის ტიპი:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {adapterOptions.map((opt) => {
                const isSelected = selectedType === opt.id;
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectType(opt.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white shadow-md border-gold ring-2 ring-gold/40'
                        : 'neu-btn text-slate-700 hover:text-navy'
                    } ${connectionPhase === 'connecting' ? 'pointer-events-none opacity-80' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-gold text-navy font-bold' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}
                      >
                        {opt.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-navy">{opt.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                        {opt.subtitle}
                      </p>
                      <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                        ● {opt.speedText}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold text-navy flex items-center justify-center">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Step-by-Step Instructions (When idle) */}
        {connectionPhase === 'idle' && (
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h4 className="text-xs font-black text-navy flex items-center gap-1.5 uppercase tracking-wide">
                <span>2. დამაკავშირებელი ინსტრუქცია</span>
                <span className="text-gold font-mono font-bold">
                  ({selectedType === 'wifi' ? 'Wi-Fi' : selectedType === 'bluetooth' ? 'Bluetooth' : '4G Cloud'})
                </span>
              </h4>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowPortHint(!showPortHint);
                }}
                className="text-[11px] font-bold text-navy hover:text-gold flex items-center gap-1 transition-colors"
              >
                <HelpCircle size={13} className="text-gold" />
                <span>სად არის OBD პორტი?</span>
              </button>
            </div>

            {/* Collapsible Port Location Hint */}
            {showPortHint && (
              <div className="p-3 mb-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 animate-fade-in flex items-start gap-2.5">
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
            {selectedType === 'wifi' && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-navy text-gold font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-navy">შეაერთეთ ადაპტერი მანქანაში:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ჩასვით Wi-Fi ადაპტერი OBD-II პორტში (საჭის ქვეშ მარცხნივ). ინდიკატორი აინთება.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-navy text-gold font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-navy">ჩართეთ მანქანის აალება (Ignition ON):</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      გადაატრიალეთ გასაღები 2-ე პოზიციაზე (ისე რომ პანელი აინთოს) ან დაქოქეთ ავტომობილი.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-navy text-gold font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-navy">დაუკავშირდით ადაპტერის Wi-Fi ქსელს:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      გახსენით ტელეფონის Wi-Fi, აირჩიეთ <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-navy">WiFi_OBDII</code> ან <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-navy">vLinker-WiFi</code>. პაროლი: <span className="font-mono font-bold text-gold">12345678</span> (ან პაროლის გარეშე).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bluetooth Steps */}
            {selectedType === 'bluetooth' && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-navy">ჩასვით Bluetooth OBD ადაპტერი:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      შეაერთეთ Bluetooth ადაპტერი OBD პორტში (საჭის ქვეშ).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-navy">ჩართეთ აალება (Ignition ON):</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ჩართეთ მანქანის ელექტროენერგია გასაღებით ან Start/Stop ღილაკით.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-navy">Bluetooth დაწყვილება (Pairing):</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ტელეფონში მოძებნეთ <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-navy">OBDII</code> ან <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-navy">OBDLink CX</code> (პინი: <span className="font-mono font-bold">1234</span> ან <span className="font-mono font-bold">0000</span>).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4G Steps */}
            {selectedType === 'cloud_4g' && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-navy">აქტიური SIM ბარათი:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ჩადეთ აქტიური 4G/LTE SIM ბარათი ინტერნეტის პაკეტით მოწყობილობაში.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-navy">შეაერთეთ OBD-II პორტში:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      მოწყობილობა იღებს 12V კვებას. დაელოდეთ LED ინდიკატორების განათებას.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. HIGH-TECH CONNECTION ANIMATION (When connecting) */}
        {connectionPhase === 'connecting' && (
          <div className="p-6 rounded-3xl bg-white border border-gold/40 shadow-xl space-y-5 animate-fade-in text-center">
            
            {/* Visual Wave Simulation: Phone -> Signal Waves -> OBD Adapter -> Car */}
            <div className="relative py-4 flex items-center justify-around">
              {/* Phone Node */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-navy text-gold flex items-center justify-center shadow-lg relative">
                  <Smartphone className="w-7 h-7" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-1 -right-1 animate-ping"></span>
                </div>
                <span className="text-[11px] font-bold text-navy mt-1.5 font-mono">AutoHub AI</span>
              </div>

              {/* Animated Signal Waves Stream */}
              <div className="flex-1 max-w-[200px] flex items-center justify-center relative px-2">
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-gold via-amber-400 to-emerald-500 w-1/2 rounded-full animate-pulse mx-auto"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center animate-ping">
                    <Activity className="w-4 h-4 text-gold animate-spin" />
                  </div>
                </div>
              </div>

              {/* Car ECU Node */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gold text-navy flex items-center justify-center shadow-lg relative">
                  <Car className="w-7 h-7" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-1 -right-1 animate-pulse"></span>
                </div>
                <span className="text-[11px] font-bold text-navy mt-1.5 font-mono">{vehicleBrand} {vehicleModel}</span>
              </div>
            </div>

            {/* Handshake Progress Steps with Live Status */}
            <div className="space-y-2 text-left text-xs font-mono max-w-md mx-auto">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                connectStep >= 1 ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span className="flex items-center gap-2">
                  <Zap size={14} className={connectStep >= 1 ? 'text-emerald-600' : 'text-slate-400'} />
                  <span>1. {selectedType === 'wifi' ? 'Wi-Fi სიგნალის დაკავშირება' : selectedType === 'bluetooth' ? 'Bluetooth BLE დაწყვილება' : '4G Cloud პინგი'}</span>
                </span>
                {connectStep >= 1 ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Activity size={13} className="animate-spin text-gold" />}
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                connectStep >= 2 ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span className="flex items-center gap-2">
                  <Cpu size={14} className={connectStep >= 2 ? 'text-emerald-600' : 'text-slate-400'} />
                  <span>2. CAN-Bus პროტოკოლის ამოცნობა (ISO 15765-4)</span>
                </span>
                {connectStep >= 2 ? <CheckCircle2 size={15} className="text-emerald-600" /> : connectStep === 1 ? <Activity size={13} className="animate-spin text-gold" /> : <span>...</span>}
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                connectStep >= 3 ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={14} className={connectStep >= 3 ? 'text-emerald-600' : 'text-slate-400'} />
                  <span>3. ECU ბორტ-კომპიუტერის სინქრონიზაცია & VIN</span>
                </span>
                {connectStep >= 3 ? <CheckCircle2 size={15} className="text-emerald-600" /> : connectStep === 2 ? <Activity size={13} className="animate-spin text-gold" /> : <span>...</span>}
              </div>
            </div>

            <p className="text-xs text-slate-500 font-mono">
              მონაცემები იკითხება რეალურ დროში... გთხოვთ არ გათიშოთ აალება
            </p>
          </div>
        )}

        {/* 4. CONNECTED SUCCESS STATE (When connected) */}
        {connectionPhase === 'connected' && (
          <div className="p-6 rounded-3xl bg-white border-2 border-emerald-400 shadow-xl space-y-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-2">
                ● OBD-II LIVE CONNECTED
              </span>
              <h3 className="text-lg font-black text-navy">
                ადაპტერი წარმატებით დაუკავშირდა!
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                {vehicleBrand} {vehicleModel} • ECU რეაგირებს ნორმალურად • CAN 11/500
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-navy flex items-center justify-between font-mono">
              <span>კავშირის ტიპი: <strong>{selectedType.toUpperCase()}</strong></span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ტელემეტრია აქტიურია
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200/80">
          {connectionPhase === 'idle' ? (
            /* PHASE 1: Big Tactile Stitch Connect Button */
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleClose}
                className="btn-stitch-soft w-full sm:w-auto px-6 py-3.5 text-xs font-bold"
              >
                <span>მოგვიანებით / დემო რეჟიმი</span>
              </button>

              <button
                onClick={handleStartConnection}
                className="btn-stitch-primary w-full sm:flex-1 py-4 px-8 text-sm font-black"
              >
                <Zap className="w-5 h-5 text-navy fill-navy" />
                <span>დაკავშირება</span>
                <ArrowRight size={17} />
              </button>
            </div>
          ) : connectionPhase === 'connected' ? (
            /* PHASE 3: ONLY "Start Testing" Button as requested by user */
            <div className="w-full">
              <button
                onClick={handleStartTesting}
                className="btn-stitch-primary w-full py-4.5 px-8 text-base font-black tracking-wide"
              >
                <Sparkles className="w-6 h-6 text-navy" />
                <span>🚀 ტესტირების დაწყება</span>
                <ArrowRight size={20} />
              </button>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};

export default ObdAdapterConnectModal;
