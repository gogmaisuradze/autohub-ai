import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
  Truck,
  CreditCard,
  Banknote,
  MapPin,
  Phone,
  User,
  Package
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

const ADAPTER_PRICING: Record<ObdAdapterType, { name: string; modelCode: string; price: number; badge: string; desc: string }> = {
  cloud_4g: {
    name: 'AutoHub 4G LTE Cloud + GPS Tracker',
    modelCode: '4G LTE GPS Telematics',
    price: 119,
    badge: '★ რეკომენდებული • 24/7 Cloud',
    desc: 'დისტანციური მონიტორინგი ნებისმიერი წერტილიდან, SIM ბარათით, ცოცხალი GPS და სიგნალიზაცია'
  },
  wifi: {
    name: 'AutoHub Wi-Fi ELM327 Pro (vLinker)',
    modelCode: 'vLinker FD+ Wi-Fi',
    price: 49,
    badge: 'სწრაფი Wi-Fi',
    desc: 'iOS & Android თავსებადი, 50 PID/წმ, შეცდომების ჩაქრობა და ცოცხალი სენსორები'
  },
  bluetooth: {
    name: 'AutoHub Bluetooth 5.0 BLE (vLinker MC+)',
    modelCode: 'BLE 5.0 Low Energy',
    price: 69,
    badge: 'ულტრა-დაბალი ენერგომოხმარება',
    desc: 'მუდმივად ჩასმული მანქანაში, BatterySaver™ ძილის რეჟიმი, არ სვამს აკუმულატორს'
  }
};

export const ObdAdapterConnectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConnectSuccess,
  vehicleIp = '192.168.0.10',
  vehiclePort = 35000,
  initialType = 'cloud_4g',
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

  // Phases: 'idle' (selection) -> 'connecting' (animation) -> 'connected' (ready to test) -> 'ordering' (order form) -> 'order_success'
  const [connectionPhase, setConnectionPhase] = useState<'idle' | 'connecting' | 'connected' | 'ordering' | 'order_success'>('idle');
  const [connectStep, setConnectStep] = useState<number>(0);
  const [showPortHint, setShowPortHint] = useState(false);

  // Ordering state
  const [orderModel, setOrderModel] = useState<ObdAdapterType>('cloud_4g');
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('+995 599 12 34 56');
  const [orderCity, setOrderCity] = useState('თბილისი');
  const [orderAddress, setOrderAddress] = useState('ჭავჭავაძის გამზ. #34, ბინა 12');
  const [orderPayment, setOrderPayment] = useState<'cod' | 'card' | 'bog_tbc'>('cod');
  const [orderId, setOrderId] = useState('');
  const [orderError, setOrderError] = useState('');

  // Custom fields
  const [ipAddress, setIpAddress] = useState(vehicleIp);
  const [portNumber, setPortNumber] = useState(vehiclePort.toString());
  const [imeiNumber, setImeiNumber] = useState('864920049182341');

  // Allow closing via Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

    await new Promise(r => setTimeout(r, 800));
    setConnectStep(2); // CAN-Bus Protocol & Baudrate

    await new Promise(r => setTimeout(r, 850));
    setConnectStep(3); // Querying ECU & Sensors

    await new Promise(r => setTimeout(r, 800));
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

  const handleOrderSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderPhone.trim() || !orderAddress.trim()) {
      sounds.playWarning?.();
      setOrderError('გთხოვთ მიუთითოთ ტელეფონის ნომერი და მიტანის მისამართი');
      return;
    }
    setOrderError('');
    const newId = `OBD-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderId(newId);
    sounds.playSuccess();
    setConnectionPhase('order_success');

    try {
      const existing = JSON.parse(localStorage.getItem('autohub_obd_orders') || '[]');
      existing.unshift({
        id: newId,
        adapterType: orderModel,
        modelName: ADAPTER_PRICING[orderModel].name,
        vehicle: `${vehicleBrand} ${vehicleModel}`,
        name: orderName,
        phone: orderPhone,
        city: orderCity,
        address: orderAddress,
        payment: orderPayment,
        date: new Date().toISOString(),
        price: ADAPTER_PRICING[orderModel].price
      });
      localStorage.setItem('autohub_obd_orders', JSON.stringify(existing));
    } catch {}
  };

  const adapterOptions = [
    {
      id: 'cloud_4g' as const,
      title: '4G / GPS Cloud',
      subtitle: '4G LTE Dongle / Teltonika / GPS ტრეკერი',
      badge: '★ რეკომენდებული',
      badgeColor: 'bg-amber-100 text-amber-950 border-amber-300 font-black ring-1 ring-amber-400/40',
      icon: Radio,
      speedText: '24/7 ონლაინ მონიტორინგი & GPS'
    },
    {
      id: 'wifi' as const,
      title: 'Wi-Fi ადაპტერი',
      subtitle: 'ELM327 Wi-Fi / vLinker / UniCarScan',
      badge: 'სწრაფი (50 PID)',
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
    }
  ];

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy/60 backdrop-blur-md animate-fade-in overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl neu-card p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto border border-white/80 bg-[#ECEAE5] cursor-default"
      >
        
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-gold shadow-sm shrink-0">
              {connectionPhase === 'ordering' ? (
                <ShoppingBag className="w-6 h-6 text-gold" />
              ) : connectionPhase === 'order_success' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <Zap className="w-6 h-6 text-navy" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-navy tracking-tight">
                  {connectionPhase === 'ordering'
                    ? 'OBD-II ადაპტერის შეკვეთა'
                    : connectionPhase === 'order_success'
                    ? 'შეკვეთა მიღებულია!'
                    : 'OBD-II ადაპტერთან დაკავშირება'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/15 text-navy border border-gold/30">
                  {connectionPhase === 'ordering'
                    ? 'EXPRESS 1-2 სთ'
                    : connectionPhase === 'order_success'
                    ? 'დადასტურებულია'
                    : connectionPhase === 'connected'
                    ? 'LIVE'
                    : connectionPhase === 'connecting'
                    ? 'SYNC'
                    : 'SETUP'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {connectionPhase === 'ordering'
                  ? 'ორიგინალი OBD-II დიაგნოსტიკური ადაპტერები 1-წლიანი გარანტიით'
                  : connectionPhase === 'order_success'
                  ? 'ჩვენი კურიერი დაგიკავშირდებათ მითითებულ ნომერზე 15 წუთში'
                  : connectionPhase === 'connected'
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
        {(connectionPhase === 'idle' || connectionPhase === 'connecting') && (
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
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-5 animate-fade-in text-center relative overflow-hidden">
            {/* Top gold laser line */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />

            {/* Visual Stream Handshake: Phone <—— Minimalist Telemetry Stream ——> Car */}
            <div className="relative pt-2 pb-3 px-2 flex items-center justify-between gap-3 sm:gap-6">
              
              {/* Phone Node (AutoHub AI) */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-navy text-gold flex items-center justify-center shadow-lg relative border border-gold/30">
                  <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-1 -right-1 shadow-xs animate-pulse" />
                </div>
                <span className="text-[11px] font-black text-navy mt-1.5 font-mono tracking-tight">AutoHub AI</span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Live App</span>
              </div>

              {/* Minimalist Telemetry Wave & Data Packet Stream */}
              <div className="flex-1 flex flex-col items-center justify-center relative min-w-[130px] sm:min-w-[180px]">
                {/* Central Protocol Chip Badge */}
                <div className="mb-2 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 shadow-2xs flex items-center gap-1.5">
                  {selectedType === 'wifi' ? (
                    <Wifi size={11} className="text-gold" />
                  ) : selectedType === 'bluetooth' ? (
                    <Bluetooth size={11} className="text-gold" />
                  ) : (
                    <Radio size={11} className="text-gold" />
                  )}
                  <span className="text-[10px] font-mono font-bold text-navy uppercase tracking-wider">
                    {selectedType === 'wifi' ? 'Wi-Fi 50 PID' : selectedType === 'bluetooth' ? 'BLE 5.0' : '4G LTE Cloud'}
                  </span>
                </div>

                {/* Stream Track Line with Moving Laser & Packets */}
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50">
                  {/* Glowing Laser Beam */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-gold to-emerald-400 opacity-90"
                  />
                </div>

                {/* Bidirectional Telemetry Packets */}
                <div className="relative w-full h-2 overflow-hidden pointer-events-none mt-1">
                  <motion.div
                    animate={{ x: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(252,163,17,0.9)]"
                  />
                  <motion.div
                    animate={{ x: ['100%', '0%'], opacity: [0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0.7, ease: 'linear' }}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]"
                  />
                </div>

                <span className="text-[9px] font-mono text-slate-400 tracking-wider">
                  CAN-BUS 11-BIT • 500 KBPS
                </span>
              </div>

              {/* Car ECU Node */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-navy text-gold flex items-center justify-center shadow-lg relative border border-gold/30">
                  <Car className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-1 -right-1 shadow-xs animate-pulse" />
                </div>
                <span className="text-[11px] font-black text-navy mt-1.5 font-mono tracking-tight truncate max-w-[110px] sm:max-w-[140px]">
                  {vehicleBrand} {vehicleModel}
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">OBD-II ECU</span>
              </div>

            </div>

            {/* Handshake Progress Steps with Live Status */}
            <div className="space-y-2 text-left text-xs font-mono max-w-lg mx-auto">
              
              {/* Step 1 */}
              <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                connectStep > 1
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                  : connectStep === 1
                  ? 'bg-amber-50/80 border-2 border-gold text-navy font-bold shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    connectStep > 1
                      ? 'bg-emerald-500 text-white'
                      : connectStep === 1
                      ? 'bg-gold text-navy'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {connectStep > 1 ? <Check size={11} className="stroke-[3]" /> : '1'}
                  </div>
                  <span className="truncate">
                    {selectedType === 'wifi' ? 'Wi-Fi სიგნალის დაკავშირება (192.168.0.10)' : selectedType === 'bluetooth' ? 'Bluetooth BLE 5.0 დაწყვილება' : '4G Cloud LTE პინგი (Gateway)'}
                  </span>
                </div>

                <div className="shrink-0 ml-2">
                  {connectStep > 1 ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      დაკავშირდა • OK
                    </span>
                  ) : connectStep === 1 ? (
                    <span className="px-2 py-0.5 rounded-md bg-gold/20 text-navy text-[10px] font-black border border-gold/50 flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                      <span>პინგი...</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">მოლოდინი</span>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                connectStep > 2
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                  : connectStep === 2
                  ? 'bg-amber-50/80 border-2 border-gold text-navy font-bold shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    connectStep > 2
                      ? 'bg-emerald-500 text-white'
                      : connectStep === 2
                      ? 'bg-gold text-navy'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {connectStep > 2 ? <Check size={11} className="stroke-[3]" /> : '2'}
                  </div>
                  <span className="truncate">
                    CAN-Bus პროტოკოლის ამოცნობა (ISO 15765-4)
                  </span>
                </div>

                <div className="shrink-0 ml-2">
                  {connectStep > 2 ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      ISO 11/500 • OK
                    </span>
                  ) : connectStep === 2 ? (
                    <span className="px-2 py-0.5 rounded-md bg-gold/20 text-navy text-[10px] font-black border border-gold/50 flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                      <span>სკანირება...</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">მოლოდინი</span>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                connectStep >= 3
                  ? 'bg-amber-50/80 border-2 border-gold text-navy font-bold shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    connectStep >= 3
                      ? 'bg-gold text-navy'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {connectStep >= 3 ? <Zap size={11} className="fill-navy" /> : '3'}
                  </div>
                  <span className="truncate">
                    ECU ბორტ-კომპიუტერის სინქრონიზაცია & VIN
                  </span>
                </div>

                <div className="shrink-0 ml-2">
                  {connectStep >= 3 ? (
                    <span className="px-2 py-0.5 rounded-md bg-gold/20 text-navy text-[10px] font-black border border-gold/50 flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                      <span>სინქრონიზაცია...</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">მოლოდინი</span>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Progress Bar & Info */}
            <div className="max-w-lg mx-auto pt-1 space-y-2">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-gold via-amber-400 to-emerald-500 transition-all duration-500 ease-out rounded-full"
                  style={{
                    width: connectStep === 1 ? '35%' : connectStep === 2 ? '70%' : connectStep >= 3 ? '100%' : '15%'
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                <span>რეალურ დროში ტელემეტრია...</span>
                <span className="text-navy font-bold">გთხოვთ არ გათიშოთ აალება</span>
              </div>
            </div>

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

        {/* 5. ORDER ADAPTER VIEW (When user clicks "ადაპტერის შეკვეთა") */}
        {connectionPhase === 'ordering' && (
          <div className="space-y-4 animate-fade-in">
            {/* Top Info Bar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setConnectionPhase('idle');
                }}
                className="text-xs font-bold text-navy hover:text-gold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>უკან დაკავშირებაზე</span>
              </button>
              <span className="text-[11px] font-mono text-slate-500">
                ავტომობილი: <strong className="text-navy">{vehicleBrand} {vehicleModel}</strong>
              </span>
            </div>

            {/* 1. Model cards */}
            <div>
              <label className="text-xs font-black text-navy uppercase tracking-wider block mb-2">
                1. აირჩიეთ ადაპტერის მოდელი:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(['cloud_4g', 'wifi', 'bluetooth'] as ObdAdapterType[]).map((typeKey) => {
                  const info = ADAPTER_PRICING[typeKey];
                  const isSel = orderModel === typeKey;
                  const Icon = typeKey === 'wifi' ? Wifi : typeKey === 'bluetooth' ? Bluetooth : Radio;
                  return (
                    <div
                      key={typeKey}
                      onClick={() => {
                        sounds.playClick();
                        setOrderModel(typeKey);
                      }}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                        isSel
                          ? 'bg-white shadow-md border-gold ring-2 ring-gold/40'
                          : 'neu-btn text-slate-700 hover:text-navy'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isSel ? 'bg-gold text-navy font-bold' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black font-mono text-navy block">
                              {info.price} ₾
                            </span>
                            <span className="text-[9px] font-bold text-emerald-700">უფასო მიტანა</span>
                          </div>
                        </div>

                        <h4 className="text-xs font-black text-navy">{info.name}</h4>
                        <p className="text-[10px] text-slate-500 font-medium line-clamp-2 mt-1">
                          {info.desc}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-slate-400">{info.modelCode}</span>
                        <span className="text-gold font-bold">{info.badge}</span>
                      </div>

                      {isSel && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gold text-navy flex items-center justify-center">
                          <Check size={11} className="stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Delivery details */}
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black text-navy flex items-center gap-1.5 uppercase tracking-wide">
                  <Truck size={14} className="text-gold" />
                  <span>2. მიწოდების მონაცემები</span>
                </h4>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  ● ექსპრეს კურიერი თბილისში
                </span>
              </div>

              {orderError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold animate-fade-in">
                  ⚠️ {orderError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    მომხმარებლის სახელი & გვარი
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="თქვენი სახელი"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-navy focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    ტელეფონის ნომერი *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={orderPhone}
                      onChange={(e) => setOrderPhone(e.target.value)}
                      placeholder="+995 5XX XX XX XX"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-navy focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">ქალაქი</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {['თბილისი', 'ბათუმი', 'ქუთაისი', 'რუსთავი'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setOrderCity(city);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                        orderCity === city
                          ? 'bg-navy text-gold border-navy shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-gold'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    placeholder="მიტანის მისამართი (ქუჩა, ბინა, სადარბაზო...)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-navy focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">გადახდის მეთოდი</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setOrderPayment('cod');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      orderPayment === 'cod'
                        ? 'bg-amber-50 border-gold ring-1 ring-gold text-navy font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Banknote size={14} className="text-gold shrink-0" />
                      <span className="truncate">კურიერთან</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5 truncate">ნაღდი ან ბარათით</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setOrderPayment('card');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      orderPayment === 'card'
                        ? 'bg-amber-50 border-gold ring-1 ring-gold text-navy font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <CreditCard size={14} className="text-gold shrink-0" />
                      <span className="truncate">ბარათით</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5 truncate">Apple / Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setOrderPayment('bog_tbc');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      orderPayment === 'bog_tbc'
                        ? 'bg-amber-50 border-gold ring-1 ring-gold text-navy font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Zap size={14} className="text-gold shrink-0" />
                      <span className="truncate">TBC / BoG</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5 truncate">ინტერნეტ-ბანკინგი</span>
                  </button>
                </div>
              </div>

              {/* Warranty and Config Notice */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600">
                  🛡️ კონფიგურაცია: <strong>{vehicleBrand} {vehicleModel}</strong>-ის ECU-ზე
                </span>
                <span className="text-emerald-700 font-bold">1 წელი გარანტია</span>
              </div>
            </div>
          </div>
        )}

        {/* 6. ORDER SUCCESS STATE */}
        {connectionPhase === 'order_success' && (
          <div className="p-6 rounded-3xl bg-white border-2 border-emerald-400 shadow-xl space-y-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-2">
                ● შეკვეთა #{orderId} გაფორმებულია
              </span>
              <h3 className="text-lg font-black text-navy">
                ადაპტერის შეკვეთა წარმატებით მიღებულია!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                კურიერი დაგიკავშირდებათ ნომერზე: <strong className="text-navy">{orderPhone}</strong> (15-20 წუთში).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">მოდელი:</span>
                <strong className="text-navy">{ADAPTER_PRICING[orderModel].name}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">ავტომობილი:</span>
                <strong className="text-navy">{vehicleBrand} {vehicleModel}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">მისამართი:</span>
                <strong className="text-navy">{orderCity}, {orderAddress}</strong>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-500">გადასახდელი:</span>
                <strong className="text-emerald-700 text-sm font-black">{ADAPTER_PRICING[orderModel].price} ₾ (მიწოდება უფასო)</strong>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200/80">
          {connectionPhase === 'idle' ? (
            /* PHASE 1: Big Tactile Stitch Connect Button & Order Adapter Button */
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  setConnectionPhase('ordering');
                }}
                className="btn-stitch-soft w-full sm:w-auto px-6 py-3.5 text-xs font-bold flex items-center justify-center gap-2 hover:border-gold hover:text-navy group transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
                <span>ადაპტერის შეკვეთა</span>
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
          ) : connectionPhase === 'ordering' ? (
            /* ORDERING FOOTER */
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  setConnectionPhase('idle');
                }}
                className="btn-stitch-soft w-full sm:w-auto px-6 py-3.5 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={15} />
                <span>უკან</span>
              </button>

              <button
                onClick={handleOrderSubmit}
                className="btn-stitch-primary w-full sm:flex-1 py-4 px-8 text-sm font-black flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5 text-navy fill-navy" />
                <span>შეკვეთის გაფორმება • {ADAPTER_PRICING[orderModel].price} ₾</span>
                <ArrowRight size={17} />
              </button>
            </div>
          ) : connectionPhase === 'order_success' ? (
            /* ORDER SUCCESS FOOTER */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  setConnectionPhase('idle');
                }}
                className="btn-stitch-soft w-full sm:w-auto px-6 py-3.5 text-xs font-bold"
              >
                <span>დაკავშირებაზე დაბრუნება</span>
              </button>

              <button
                onClick={handleClose}
                className="btn-stitch-primary w-full sm:flex-1 py-4 px-8 text-sm font-black flex items-center justify-center gap-2"
              >
                <Check size={18} />
                <span>დასრულება & დახურვა</span>
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
