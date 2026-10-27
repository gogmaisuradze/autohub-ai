import React, { useState } from 'react';
import { ServiceItem, VehicleProfile, ServiceCategory, ServiceVariantKey, ServiceBookingItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import ThematicServiceModal from './ThematicServiceModal';
import { ServiceOfferComparisonModal } from '../Modals/ServiceOfferComparisonModal';
import {
  SERVICE_CATEGORIES,
  SERVICE_VARIANTS,
  normalizeCategory,
  getVariantDefinition
} from '../../constants/serviceCatalog';
import {
  Wrench,
  Droplets,
  Disc,
  Filter,
  CircleDot,
  FileCheck,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  BellRing,
  Sparkles,
  ShieldCheck,
  Compass,
  Zap,
  BatteryCharging,
  Wind,
  Gauge,
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calculator,
  Bot,
  Cpu,
  History,
  Scale,
  Car,
  ShieldAlert,
  Check,
  ArrowRight,
  X,
  EyeOff,
  Eye,
  Power,
  RotateCcw
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  services: ServiceItem[];
  onAddService: (newService: ServiceItem) => void;
  onUpdateService: (updated: ServiceItem) => void;
  onDeleteService?: (id: string) => void;
  onOpenFieldPrompt?: (field: 'mileage_km') => void;
  bookings?: ServiceBookingItem[];
  onOpenBookingModal?: (serviceType?: ServiceBookingItem['service_type'], title?: string) => void;
  onNavigateToAiClarification?: (booking: ServiceBookingItem) => void;
  onResetToVinSpecs?: () => void;
  onOpenVinHistory?: () => void;
  onAddBooking?: (booking: ServiceBookingItem) => void;
  onAskAiAboutService?: (service: ServiceItem) => void;
}

export const ServiceLogModule: React.FC<Props> = ({
  vehicle,
  services,
  onAddService,
  onUpdateService,
  onDeleteService,
  onOpenFieldPrompt,
  bookings = [],
  onOpenBookingModal,
  onNavigateToAiClarification,
  onResetToVinSpecs,
  onOpenVinHistory,
  onAddBooking,
  onAskAiAboutService
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [modalCategory, setModalCategory] = useState<ServiceCategory | undefined>(undefined);
  const [modalVariantKey, setModalVariantKey] = useState<ServiceVariantKey | undefined>(undefined);

  // Comparison & Offers Modal State
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonService, setComparisonService] = useState<ServiceItem | null>(null);

  // Active Category filter ('all' or one of the 6 canonical categories)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | ServiceCategory>('all');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedServiceDeckCard, setSelectedServiceDeckCard] = useState<'profile' | 'catalog' | null>(null);

  // Toggle ready-made answers / preset thematic details
  const [showPresetAnswers, setShowPresetAnswers] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('autohub_show_service_presets');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [expandedCardDetails, setExpandedCardDetails] = useState<Record<string, boolean>>({});

  // Filter mode: 'active' or 'disabled' (to see turned-off windows)
  const [showOnlyDisabled, setShowOnlyDisabled] = useState(false);

  // Per-card hidden details (allows hiding/closing details on individual cards)
  const [hiddenCardDetails, setHiddenCardDetails] = useState<Record<string, boolean>>({});

  // Dismissed warning badges per card
  const [dismissedWarnings, setDismissedWarnings] = useState<Record<string, boolean>>({});

  // Toast feedback when a window is turned off
  const [toastMessage, setToastMessage] = useState<{ text: string; restoredItem?: ServiceItem } | null>(null);

  const toggleHideCardDetails = (id: string) => {
    sounds.playClick();
    setHiddenCardDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleDisable = (item: ServiceItem) => {
    sounds.playClick();
    const willDisable = !item.is_disabled;
    const updated: ServiceItem = { ...item, is_disabled: willDisable };
    onUpdateService(updated);

    if (willDisable) {
      setToastMessage({
        text: `ფანჯარა "${item.title_ge}" გაითიშა`,
        restoredItem: item
      });
      setTimeout(() => {
        setToastMessage(prev => prev?.restoredItem?.id === item.id ? null : prev);
      }, 4500);
    } else {
      sounds.playSuccess();
      setToastMessage({
        text: `ფანჯარა "${item.title_ge}" ჩაირთო`
      });
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }
  };

  const handleEnableAllServices = () => {
    sounds.playSuccess();
    services.forEach(s => {
      if (s.is_disabled) {
        onUpdateService({ ...s, is_disabled: false });
      }
    });
    setShowOnlyDisabled(false);
  };

  const toggleCardDetails = (id: string) => {
    sounds.playClick();
    setExpandedCardDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to render category icon
  const getCategoryIcon = (cat: ServiceCategory | string) => {
    const norm = normalizeCategory(cat);
    switch (norm) {
      case 'chassis':
        return <CircleDot className="w-5 h-5 text-blue-500" />;
      case 'fluids':
        return <Droplets className="w-5 h-5 text-amber-500" />;
      case 'filters':
        return <Filter className="w-5 h-5 text-emerald-500" />;
      case 'engine':
        return <Gauge className="w-5 h-5 text-rose-500" />;
      case 'electrical':
        return <Zap className="w-5 h-5 text-indigo-500" />;
      case 'legal':
        return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      default:
        return <Wrench className="w-5 h-5 text-navy" />;
    }
  };

  const handleOpenAddModal = (cat?: ServiceCategory, vKey?: ServiceVariantKey) => {
    sounds.playClick();
    setEditingService(null);
    setModalCategory(cat);
    setModalVariantKey(vKey);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ServiceItem) => {
    sounds.playClick();
    setEditingService(item);
    setModalCategory(normalizeCategory(item.category));
    setModalVariantKey(item.variant_key);
    setIsModalOpen(true);
  };

  const handleOpenComparison = (item: ServiceItem) => {
    sounds.playClick();
    setComparisonService(item);
    setIsComparisonModalOpen(true);
  };

  const handleSaveService = (service: ServiceItem) => {
    if (editingService) {
      onUpdateService(service);
    } else {
      onAddService(service);
    }
  };

  const handleQuickServiced = (item: ServiceItem) => {
    sounds.playClearChime();

    // Reset date to today and mileage to current
    const todayStr = new Date().toISOString().split('T')[0];
    let newExpiryDate = item.pti_expiry_date || item.insurance_expiry_date || item.parking_permit_expiry;

    const norm = normalizeCategory(item.category);
    if (norm === 'legal') {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      newExpiryDate = nextYear.toISOString().split('T')[0];
    }

    onUpdateService({
      ...item,
      current_km: vehicle.mileage_km,
      last_service_km: vehicle.mileage_km,
      last_service_date: todayStr,
      remaining_km: item.interval_km,
      remaining_days: norm === 'legal' ? 365 : Math.round(item.interval_km / 35),
      health_percentage: 100,
      pti_expiry_date: item.variant_key === 'pti' || item.category === 'pti' ? newExpiryDate : item.pti_expiry_date,
      insurance_expiry_date: item.variant_key === 'insurance' ? newExpiryDate : item.insurance_expiry_date,
      parking_permit_expiry: item.variant_key === 'parking_permit' ? newExpiryDate : item.parking_permit_expiry
    });
  };

  // Find PTI service to display alert if expiration is near
  const ptiService = services.find(
    s => s.category === 'pti' || s.variant_key === 'pti' || s.title_ge.toLowerCase().includes('ტექ')
  );
  const ptiDaysLeft = ptiService ? ptiService.remaining_days : null;
  const isPtiUrgent = ptiDaysLeft !== null && ptiDaysLeft <= 30;

  // Count active and disabled services
  const disabledCount = services.filter(s => !!s.is_disabled).length;
  const activeCount = services.filter(s => !s.is_disabled).length;

  // Filtered services
  const filteredServices = services.filter(item => {
    if (showOnlyDisabled) {
      if (!item.is_disabled) return false;
    } else {
      if (item.is_disabled) return false;
    }
    if (activeCategoryFilter === 'all') return true;
    return normalizeCategory(item.category) === activeCategoryFilter;
  });

  // Calculate counts per category
  const categoryCounts = SERVICE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = services.filter(s => {
      if (showOnlyDisabled) {
        if (!s.is_disabled) return false;
      } else {
        if (s.is_disabled) return false;
      }
      return normalizeCategory(s.category) === cat.id;
    }).length;
    return acc;
  }, {} as Record<ServiceCategory, number>);

  return (
    <div className="space-y-6">
      
      {/* ======================================================== */}
      {/* 0. SMART SERVICE DECK (ანალოგიური ნეომორფული სტილი)      */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 lg:p-7 rounded-3xl neu-card shadow-neu-card border border-white/80 bg-[#ECEAE5] text-navy space-y-5 transition-all">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-sm shrink-0 bg-white border border-white">
              <Wrench className="w-6 h-6 text-navy" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-navy tracking-tight">
                  AutoHub ციფრული სერვის-წიგნაკი
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  23+ კომპონენტი
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ● 6 კატეგორია
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ავტომობილის გეგმიური მომსახურება, ქარხნული OEM ინტერვალები და კალენდარი
              </p>
            </div>
          </div>

          {/* Quick Mileage Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-mono">
              <Gauge size={14} className="text-gold" />
              <span className="text-slate-600 font-medium">გარბენი:</span>
              <strong className="text-navy font-black">{vehicle.mileage_km.toLocaleString()} კმ</strong>
              {onOpenFieldPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onOpenFieldPrompt('mileage_km');
                  }}
                  className="text-gold hover:text-navy transition-colors ml-1"
                  title="გარბენის განახლება"
                >
                  <Edit3 size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 1. 4 Interactive Cards Grid */}
        <div>
          <label className="text-xs font-black text-navy uppercase tracking-wider block mb-2.5">
            სერვისის მართვა & რესურსები:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Card 1: მანქანის პროფილი */}
            <div
              onClick={() => {
                sounds.playClick();
                setSelectedServiceDeckCard(selectedServiceDeckCard === 'profile' ? null : 'profile');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                selectedServiceDeckCard === 'profile'
                  ? 'bg-white shadow-md border-gold ring-2 ring-gold/40'
                  : 'neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      selectedServiceDeckCard === 'profile' ? 'bg-gold text-navy font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Car className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-950 border-amber-300 font-black">
                    {vehicle.plate_number || 'FR-282-EE'}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">მანქანის პროფილი</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {vehicle.brand || 'Mercedes-Benz'} {vehicle.model || 'C300'} {vehicle.year ? `• ${vehicle.year}` : ''}
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● გარბენი: {vehicle.mileage_km.toLocaleString()} კმ
                  </span>
                </div>

                {selectedServiceDeckCard === 'profile' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold text-navy flex items-center justify-center shadow-xs">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                )}
              </div>

              <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-sans font-bold transition-colors ${
                selectedServiceDeckCard === 'profile'
                  ? 'border-gold/30 text-navy'
                  : 'border-slate-100 text-slate-500 group-hover:text-navy'
              }`}>
                <span>პროფილის დეტალები</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${
                  selectedServiceDeckCard === 'profile' ? 'rotate-180 text-navy' : ''
                }`} />
              </div>
            </div>

            {/* Card 2: სერვისის შექმნა */}
            <div
              onClick={() => {
                sounds.playClick();
                handleOpenAddModal();
              }}
              className="neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white hover:border-gold/70 p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all relative flex flex-col justify-between group active:scale-[0.98]"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 text-navy group-hover:bg-gold/20 transition-colors">
                    <Plus className="w-5 h-5 text-gold stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200 font-bold">
                    + ახალი
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">სერვისის შექმნა</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    ზეთი, ხუნდები, ფილტრი, PTI
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● {services.length} რეგისტრირებული
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-sans font-bold text-slate-500 group-hover:text-navy transition-colors">
                <span>სერვისის დამატება</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform text-gold" />
              </div>
            </div>

            {/* Card 3: კატალოგი */}
            <div
              onClick={() => {
                sounds.playClick();
                setIsCatalogOpen(!isCatalogOpen);
                setSelectedServiceDeckCard(selectedServiceDeckCard === 'catalog' ? null : 'catalog');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                isCatalogOpen || selectedServiceDeckCard === 'catalog'
                  ? 'bg-white shadow-md border-gold ring-2 ring-gold/40'
                  : 'neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isCatalogOpen || selectedServiceDeckCard === 'catalog' ? 'bg-gold text-navy font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                    23+ ქარხნული
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">სერვის კატალოგი</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    6 ძირითადი კატეგორია
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● OEM ინტერვალები
                  </span>
                </div>

                {(isCatalogOpen || selectedServiceDeckCard === 'catalog') && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold text-navy flex items-center justify-center shadow-xs">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                )}
              </div>

              <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-sans font-bold transition-colors ${
                isCatalogOpen || selectedServiceDeckCard === 'catalog'
                  ? 'border-gold/30 text-navy'
                  : 'border-slate-100 text-slate-500 group-hover:text-navy'
              }`}>
                <span>კატალოგის გაშლა</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${
                  isCatalogOpen ? 'rotate-180 text-navy' : ''
                }`} />
              </div>
            </div>

            {/* Card 4: ჩაწერა */}
            <div
              onClick={() => {
                sounds.playClick();
                if (onOpenBookingModal) {
                  onOpenBookingModal();
                }
              }}
              className="neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white hover:border-gold/70 p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all relative flex flex-col justify-between group active:scale-[0.98]"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 text-navy group-hover:bg-gold/20 transition-colors">
                    <Calendar className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-900 border-amber-200 font-black">
                    📅 ონლაინ
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">სერვისზე ჩაწერა</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    ავტო-ექიმთან ვიზიტი & კალენდარი
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● {bookings.length > 0 ? `${bookings.length} აქტიური ჯავშანი` : 'კალენდარში ჩაწერა'}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-sans font-bold text-slate-500 group-hover:text-navy transition-colors">
                <span>ჩაწერა</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform text-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Expandable Profile Drawer (when Card 1 is clicked) */}
        {selectedServiceDeckCard === 'profile' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-black text-navy flex items-center gap-1.5 uppercase tracking-wide">
                <span>ავტომობილის პროფილი & სპეციფიკაცია</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedServiceDeckCard(null);
                }}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-navy transition-all"
                title="დახურვა"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-bold">მოდელი & წელი:</span>
                <strong className="text-navy font-bold">{vehicle.brand} {vehicle.model}</strong>
                <span className="text-[11px] text-slate-500 block font-mono">{vehicle.year || '2016'} წ.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-bold">სახ. ნომერი & VIN:</span>
                <strong className="text-navy font-bold font-mono">{vehicle.plate_number || 'FR-282-EE'}</strong>
                <span className="text-[11px] text-slate-500 block font-mono truncate">{vehicle.vin || 'VIN მითითებული არ არის'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-bold">ძრავი & საწვავი:</span>
                <strong className="text-navy font-bold">{vehicle.engine || '2.0L Turbo'}</strong>
                <span className="text-[11px] text-slate-500 block font-medium">{vehicle.fuel_type || 'ბენზინი'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-bold">მიმდინარე გარბენი:</span>
                <strong className="text-navy font-bold font-mono">{vehicle.mileage_km.toLocaleString()} კმ</strong>
                {onOpenFieldPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onOpenFieldPrompt('mileage_km');
                    }}
                    className="text-[11px] text-gold font-bold hover:underline block mt-0.5"
                  >
                    შეცვლა ✎
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 justify-end">
              {onOpenVinHistory && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onOpenVinHistory();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <History size={13} className="text-gold" />
                  <span>VIN ისტორია & Carfax</span>
                </button>
              )}
              {onResetToVinSpecs && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onResetToVinSpecs();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles size={13} className="text-gold" />
                  <span>ქარხნული OEM ინტერვალების განახლება</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. Action Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsCatalogOpen(!isCatalogOpen);
            }}
            className="btn-stitch-soft w-full sm:w-auto px-6 py-3.5 text-xs font-bold flex items-center justify-center gap-2 group transition-all"
          >
            <Layers className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
            <span>{isCatalogOpen ? 'კატალოგის დახურვა' : 'სრული კატალოგის ნახვა (23+)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              handleOpenAddModal();
            }}
            className="btn-stitch-navy w-full sm:flex-1 py-3.5 sm:py-4 px-8 text-sm sm:text-base font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 text-gold stroke-[2.5]" />
            <span>+ ახალი სერვისის შექმნა</span>
            <ArrowRight size={17} className="text-gold" />
          </button>
        </div>
      </div>

      {/* Missing Mileage Notice */}
      {(!vehicle.mileage_km || vehicle.mileage_km === 0) && (
        <div className="p-4 rounded-3xl neu-card border border-amber-300 bg-amber-50/80 text-amber-900 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Gauge size={18} className="text-amber-600 shrink-0" />
            <span className="text-xs font-bold">
              მიმდინარე გარბენი მითითებული არ არის (0 კმ). სერვის-რესურსის ზუსტად გამოსათვლელად გთხოვთ მიუთითოთ გარბენი.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFieldPrompt?.('mileage_km')}
              className="px-3.5 py-1.5 rounded-xl bg-navy text-gold text-xs font-black hover:bg-slate-800 transition-all shadow-xs"
            >
              + გარბენის შევსება
            </button>
          </div>
        </div>
      )}

      {/* 2. Expandable Full Component & Service Catalog (23+ Variants) */}
      {isCatalogOpen && (
        <div className="p-5 rounded-3xl neu-card shadow-neu-card border border-white space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-extrabold text-navy flex items-center gap-2">
                <Sparkles size={16} className="text-gold" />
                სერვის-წიგნაკის ყველა შესაძლო კომპონენტი და სერვისი (სწრაფი დამატება)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                დააჭირეთ სასურველ კომპონენტს წინასწარ გამზადებული პარამეტრებით დასამატებლად
              </p>
            </div>
            <button
              onClick={() => setIsCatalogOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-navy px-2 py-1 rounded-lg"
            >
              დახურვა ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICE_CATEGORIES.map(cat => {
              const variants = SERVICE_VARIANTS.filter(v => v.categoryId === cat.id);
              return (
                <div key={cat.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cat.badgeBg} ${cat.color}`}>
                      {getCategoryIcon(cat.id)}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-navy leading-tight">{cat.name_ge}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{cat.name_en}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {variants.map(v => (
                      <div
                        key={v.key}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/60 hover:border-amber-300 transition-all flex items-center justify-between gap-2 group"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-navy truncate group-hover:text-amber-900">
                            {v.title_ge}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            ინტერვალი: {v.defaultIntervalKm.toLocaleString()} კმ • ~{v.defaultCostGel} ₾
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenAddModal(cat.id, v.key)}
                          className="px-2.5 py-1 rounded-lg bg-navy text-gold hover:bg-slate-800 text-[11px] font-bold shrink-0 transition-all shadow-xs"
                          title="ამ კომპონენტის დამატება"
                        >
                          + დამატება
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PTI Expiry Banner (Georgia 1-year rule alert) */}
      {ptiService && isPtiUrgent && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-400/60 flex items-center justify-between gap-3 text-xs animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-navy flex items-center justify-center shrink-0">
              <BellRing size={18} />
            </div>
            <div>
              <div className="font-extrabold text-navy flex items-center gap-1.5">
                <span>ტექ-დათვალიერების (PTI) შეხსენება:</span>
                <span className="text-amber-900 font-mono font-black">
                  დარჩა {ptiDaysLeft} დღე!
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                მოქმედების ვადა იწურება: <strong className="font-mono">{ptiService.pti_expiry_date || ptiService.last_service_date}</strong>. საქართველოში ტექ-დათვალიერება წელიწადში ერთხელ არის სავალდებულო.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenBookingModal && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenBookingModal('pti_inspection', 'Greenway Georgia ტექ-დათვალიერება PTI');
                }}
                className="px-3 py-1.5 rounded-xl bg-gold text-navy font-black text-xs hover:bg-amber-400 transition-all flex items-center gap-1 shadow-gold-soft"
              >
                <Calendar size={13} />
                <span>PTI-ზე ჩაწერა</span>
              </button>
            )}

            <button
              onClick={() => handleOpenEditModal(ptiService)}
              className="px-3 py-1.5 rounded-xl bg-navy text-gold font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              მონაცემები
            </button>
          </div>
        </div>
      )}

      {/* Active Bookings & Smart Service Passes */}
      {bookings && bookings.length > 0 && (
        <div className="p-5 rounded-3xl neu-card shadow-neu-card border border-white space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-navy text-gold flex items-center justify-center shadow-xs">
                <Calendar size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-navy">
                  ჩაწერილი ვიზიტები & ციფრული საგზურები (Smart Service Passes)
                </h3>
                <p className="text-[10px] text-slate-400">
                  ავტო-ექიმთან და სერვისცენტრებში დაჯავშნილი ვიზიტები
                </p>
              </div>
            </div>

            {onOpenBookingModal && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenBookingModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-navy flex items-center gap-1 shadow-xs"
              >
                <Plus size={13} className="text-gold" />
                <span>ახალი ჯავშანი</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {bookings.map(bk => (
              <div
                key={bk.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-gold/60 transition-all flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      bk.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}>
                      {bk.status === 'confirmed' ? '✓ დადასტურებული საგზური' : '⏳ AI დაზუსტებაში'}
                    </span>
                    {bk.voucher_code && (
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        #{bk.voucher_code}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-extrabold text-navy mt-1 truncate">
                    {bk.provider_name}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} className="text-slate-400" />
                    <span className="font-mono font-bold text-navy">{bk.booking_date} {bk.booking_time}</span>
                    <span>•</span>
                    <span className="truncate">{bk.title_ge}</span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {onNavigateToAiClarification && (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onNavigateToAiClarification(bk);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-navy text-gold hover:bg-slate-800 text-[11px] font-black transition-all flex items-center gap-1 shadow-xs"
                      title="AI ოსტატთან დაზუსტება"
                    >
                      <Bot size={13} />
                      <span>AI დაზუსტება</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Category Filter Chips & Pre-made Answers Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full sm:max-w-[70%] scrollbar-none">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveCategoryFilter('all');
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeCategoryFilter === 'all'
                ? 'bg-navy text-gold shadow-sm scale-105'
                : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
            }`}
          >
            <span>ყველა სერვისი</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeCategoryFilter === 'all' ? 'bg-gold text-navy font-black' : 'bg-slate-100 text-slate-600'
            }`}>
              {showOnlyDisabled ? disabledCount : activeCount}
            </span>
          </button>

          {SERVICE_CATEGORIES.map(cat => {
            const isSelected = activeCategoryFilter === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveCategoryFilter(cat.id);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-navy text-gold shadow-sm scale-105'
                    : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
                }`}
              >
                <span className="truncate max-w-[150px]">{cat.name_ge}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-gold text-navy font-black' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Ready-made answers toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              const nextVal = !showPresetAnswers;
              setShowPresetAnswers(nextVal);
              try {
                localStorage.setItem('autohub_show_service_presets', String(nextVal));
              } catch {}
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border shadow-2xs ${
              showPresetAnswers
                ? 'bg-white hover:bg-slate-50 text-navy border-slate-200/90'
                : 'bg-navy text-gold border-navy shadow-sm font-black'
            }`}
            title={showPresetAnswers ? 'მზა პასუხების & დეტალების გამორთვა' : 'მზა პასუხების & დეტალების ჩართვა'}
          >
            <Sparkles size={13} className={showPresetAnswers ? 'text-gold' : 'text-slate-400'} />
            <span>მზა პასუხები:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black border ${
              showPresetAnswers
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-gold text-navy border-gold'
            }`}>
              {showPresetAnswers ? 'ჩართულია' : 'გამორთულია'}
            </span>
          </button>

          {/* Turned-off Windows filter button */}
          {disabledCount > 0 && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowOnlyDisabled(!showOnlyDisabled);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border shadow-2xs ${
                showOnlyDisabled
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm font-black'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
              }`}
              title={showOnlyDisabled ? 'აქტიურ სერვისებზე დაბრუნება' : 'გათიშული ფანჯრების ნახვა და ჩართვა'}
            >
              <EyeOff size={13} className={showOnlyDisabled ? 'text-white' : 'text-rose-500'} />
              <span>გათიშული:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black border ${
                showOnlyDisabled
                  ? 'bg-white text-rose-700 border-white'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}>
                {disabledCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Disabled services notification banner */}
      {showOnlyDisabled && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-950 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <EyeOff size={16} className="text-rose-600 shrink-0" />
            <span>
              <strong>გათიშული ფანჯრები ({disabledCount})</strong> — სერვისის დასაბრუნებლად დააწკაპუნეთ <strong>„ჩართვა“</strong>-ს.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnableAllServices}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
            >
              <Check size={12} />
              <span>ყველას ჩართვა</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowOnlyDisabled(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-navy font-bold text-xs border border-slate-200 shadow-xs transition-all"
            >
              ← აქტიურებზე დაბრუნება
            </button>
          </div>
        </div>
      )}

      {!showOnlyDisabled && disabledCount > 0 && (
        <div className="px-4 py-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 flex items-center justify-between text-xs text-amber-900 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <EyeOff size={14} className="text-amber-700 shrink-0" />
            <span>
              <strong>{disabledCount}</strong> სერვისის ფანჯარა გათიშულია
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowOnlyDisabled(true);
            }}
            className="text-xs font-bold text-navy hover:text-gold underline transition-colors"
          >
            გათიშულების ნახვა ({disabledCount})
          </button>
        </div>
      )}

      {/* 4. Service Cards Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-10 rounded-3xl neu-card shadow-neu-card text-center space-y-3 border border-white">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-gold flex items-center justify-center mx-auto">
            <Wrench size={24} />
          </div>
          <h3 className="text-sm font-extrabold text-navy">
            ამ კატეგორიაში ჩანაწერი ჯერ არ არის
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            დაამატეთ ახალი ჩანაწერი ზედა ღილაკიდან ან აირჩიეთ მზა ვარიანტი კატალოგიდან.
          </p>
          <button
            onClick={() => handleOpenAddModal(activeCategoryFilter === 'all' ? undefined : activeCategoryFilter)}
            className="px-4 py-2 rounded-xl bg-gold hover:bg-amber-400 text-navy text-xs font-black shadow-gold-soft transition-all"
          >
            + სერვისის შექმნა
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((item) => {
            const isCritical = item.health_percentage <= 20;
            const isWarning = item.health_percentage <= 45 && !isCritical;
            const normCat = normalizeCategory(item.category);
            const variantDef = getVariantDefinition(item.variant_key);
            const isDetailsHidden = !!hiddenCardDetails[item.id];
            const shouldShowDetails = !isDetailsHidden && (showPresetAnswers || !!expandedCardDetails[item.id]);

            return (
              <div
                key={item.id}
                className={`rounded-3xl neu-card shadow-neu-card p-5 flex flex-col justify-between transition-all border relative overflow-hidden group ${
                  item.is_disabled
                    ? 'bg-slate-50/80 border-slate-300/80 opacity-75'
                    : 'border-white hover:border-slate-200'
                }`}
              >
                <div>
                  {/* Header: Icon, Title, Status Badge & Close/Turn Off Button */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl neu-circle flex items-center justify-center shrink-0 shadow-sm">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-extrabold text-navy leading-tight truncate">
                            {item.title_ge}
                          </h3>
                          {item.is_disabled && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              გათიშულია
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-gold" />
                          ბოლო: {item.last_service_date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        item.is_disabled
                          ? 'bg-slate-200 text-slate-600 border border-slate-300'
                          : isCritical
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      }`}>
                        {item.health_percentage}%
                      </span>

                      {/* Turn Off / Dismiss Window Button (ფანჯრის გათიშვა) */}
                      {item.is_disabled ? (
                        <button
                          type="button"
                          onClick={() => handleToggleDisable(item)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1 shadow-xs transition-all hover:scale-105 active:scale-95"
                          title="სერვისის ჩართვა"
                        >
                          <Check size={12} />
                          <span>ჩართვა</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleDisable(item)}
                          className="w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 group/close"
                          title="ფანჯრის გათიშვა / დამალვა"
                        >
                          <X size={13} className="group-hover/close:rotate-90 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Urgent / Warning Service Comparison CTA */}
                  {(isCritical || isWarning) && shouldShowDetails && !dismissedWarnings[item.id] && (
                    <div className={`my-2 p-2.5 rounded-2xl flex items-center justify-between gap-2 border text-xs animate-fade-in ${
                      isCritical 
                        ? 'bg-rose-50/90 border-rose-200 text-rose-900' 
                        : 'bg-amber-50/90 border-amber-200 text-amber-900'
                    }`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="shrink-0 text-sm">{isCritical ? '🚨' : '⚠️'}</span>
                        <div className="min-w-0">
                          <p className="font-extrabold text-[11px] truncate leading-tight">
                            {isCritical ? 'კრიტიკული რესურსი! საჭიროებს შეცვლას' : 'რესურსი იწურება! რეკომენდებულია შეცვლა'}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            შეადარეთ ეკონომიური, ოპტიმალური და პრემიუმ ვარიანტები
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenComparison(item)}
                          className="shrink-0 px-2.5 py-1.5 rounded-xl bg-navy text-gold text-[10px] font-black hover:bg-slate-800 transition-all shadow-xs flex items-center gap-1 hover:scale-105 active:scale-95"
                        >
                          <Scale size={11} />
                          <span>შედარება</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setDismissedWarnings(prev => ({ ...prev, [item.id]: true }));
                          }}
                          className="w-5 h-5 rounded-md hover:bg-black/10 text-slate-400 hover:text-navy flex items-center justify-center transition-colors"
                          title="გაფრთხილების გათიშვა"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DEDICATED THEMATIC DETAILS BADGES & METRICS (მზა პასუხები) */}
                  {shouldShowDetails ? (
                    <>

                  {/* 1. CHASSIS (Tires, Alignment, Brakes, Shocks, Arms) */}
                  {normCat === 'chassis' && (
                    <div className="my-2.5 p-2.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 space-y-1.5 text-xs">
                      {/* Tires */}
                      {(item.variant_key === 'tires' || item.category === 'tires' || item.tire_size) && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">საბურავები:</span>
                            <span className="font-mono font-black text-blue-900 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                              {item.tire_size || '225/45 R18'} • {item.tire_season === 'winter' ? '❄️ ზამთარი' : item.tire_season === 'all_season' ? '🍂 M+S' : '☀️ ზაფხული'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>{item.tire_brand || 'Michelin'}</span>
                            <span className="font-bold text-navy font-mono">
                              პროტექტორი: {item.tread_depth_mm || 7.0} მმ {item.tire_pressure_bar ? `• ${item.tire_pressure_bar} Bar` : ''}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Alignment */}
                      {item.variant_key === 'wheel_alignment' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">გეომეტრია:</span>
                            <span className="font-mono font-black text-blue-900 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                              3D რაზვალი & ბალანსი
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>ღერძი: {item.alignment_axle === 'front' ? 'წინა ღერძი' : '4-ვე თვალი'}</span>
                            <span className="text-emerald-700 font-bold">✔ ლაზერული სტენდი</span>
                          </div>
                        </>
                      )}

                      {/* Brake Pads & Discs */}
                      {(item.variant_key === 'brake_pads' || item.variant_key === 'brake_discs' || item.category === 'brakes') && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">ხუნდები / დისკები:</span>
                            <span className="font-mono font-black text-rose-900 bg-white px-2 py-0.5 rounded-lg border border-rose-200">
                              {item.brake_brand || 'Brembo'} ({item.brake_position === 'rear' ? 'უკანა' : item.brake_position === 'both' ? 'ორივე' : 'წინა'})
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>ცვეთა: <strong>{item.brake_wear_pct ? `${item.brake_wear_pct}%` : 'კარგი'}</strong></span>
                            {item.brake_disc_thickness_mm && (
                              <span className="font-mono font-bold text-navy">{item.brake_disc_thickness_mm} მმ</span>
                            )}
                          </div>
                        </>
                      )}

                      {/* Shocks & Arms */}
                      {item.variant_key === 'shocks_mounts' && (
                        <div className="flex items-center justify-between text-[11px] text-slate-700">
                          <span>ამორტიზატორები: <strong>{item.shocks_brand || 'Bilstein'}</strong></span>
                          <span className="text-emerald-700 font-bold">✔ უდეფექტო</span>
                        </div>
                      )}

                      {item.variant_key === 'suspension_arms' && (
                        <div className="text-[11px] text-slate-700">
                          <span>სავალი ნაწილი: <strong>გიტარები, შარავოები & ვტულკები OK</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. FLUIDS (Engine Oil, ATF, Coolant, DOT 4, Steering, Differential) */}
                  {normCat === 'fluids' && (
                    <div className="my-2.5 p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-1.5 text-xs">
                      {/* Engine Oil */}
                      {(item.variant_key === 'engine_oil' || item.category === 'oil' || item.oil_viscosity) && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">ზეთი & ბრენდი:</span>
                            <span className="font-mono font-black text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                              {item.oil_brand || 'Motul'} {item.oil_viscosity || '5W-30'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>მოცულობა: <strong className="font-mono text-navy">{item.oil_liters || 5.2} ლ</strong></span>
                            <span className="font-bold text-emerald-700">
                              {item.oil_filter_replaced !== false ? '✔ ფილტრი შეცვლილია' : 'ფილტრი შესაცვლელია'}
                            </span>
                          </div>
                        </>
                      )}

                      {/* ATF */}
                      {item.variant_key === 'transmission_fluid' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">კოლოფის ATF:</span>
                            <span className="font-mono font-black text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                              {item.transmission_fluid_brand || 'ZF Lifeguard 8'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>მეთოდი: <strong>{item.transmission_fluid_type === 'partial' ? 'ნაწილობრივი' : 'სრული შეცვლა'}</strong></span>
                            <span className="text-emerald-700 font-bold">✔ პადდონი შეცვლილია</span>
                          </div>
                        </>
                      )}

                      {/* Coolant */}
                      {item.variant_key === 'coolant' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">ანტიფრიზი:</span>
                            <span className="font-mono font-black text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                              {item.coolant_freezing_point_c || -35}°C • {item.coolant_spec || 'G12+'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            <span>გაყინვის წერტილი ნორმაშია</span>
                          </div>
                        </>
                      )}

                      {/* Brake Fluid */}
                      {item.variant_key === 'brake_fluid' && (
                        <div className="flex items-center justify-between text-[11px] text-slate-700">
                          <span>სამუხრუჭე სითხე: <strong>{item.brake_fluid_dot || 'DOT 4'}</strong></span>
                          <span className="font-mono text-emerald-700 font-bold">ტენიანობა: {item.brake_fluid_moisture_pct || 0.6}%</span>
                        </div>
                      )}

                      {/* Differential / AWD */}
                      {item.variant_key === 'differential_oil' && (
                        <div className="flex items-center justify-between text-[11px] text-slate-700">
                          <span>ხიდები / AWD: <strong>{item.differential_spec || '75W-90 GL-5'}</strong></span>
                          <span className="text-amber-900 font-bold">4MATIC / AWD</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. FILTERS (Air, Cabin, Fuel) */}
                  {normCat === 'filters' && (
                    <div className="my-2.5 p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-bold text-[11px]">ფილტრები:</span>
                        <span className="font-mono font-black text-emerald-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                          {item.filter_brand || 'MANN-Filter'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 text-[10px] text-slate-600">
                        {item.filter_air !== false && <span className="bg-white px-1.5 py-0.5 rounded font-bold border border-slate-200">ჰაერის ფილტრი</span>}
                        {item.filter_cabin !== false && <span className="bg-white px-1.5 py-0.5 rounded font-bold border border-slate-200">სალონის {item.filter_cabin_type === 'carbon' ? '(ნახშირის)' : ''}</span>}
                        {item.filter_fuel && <span className="bg-white px-1.5 py-0.5 rounded font-bold border border-slate-200">საწვავის</span>}
                      </div>
                    </div>
                  )}

                  {/* 4. ENGINE (Spark plugs, Coils, Timing belt/chain, Throttle) */}
                  {normCat === 'engine' && (
                    <div className="my-2.5 p-2.5 rounded-2xl bg-rose-50/70 border border-rose-200/60 space-y-1.5 text-xs">
                      {item.variant_key === 'spark_plugs' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">სვეჩები:</span>
                            <span className="font-mono font-black text-rose-900 bg-white px-2 py-0.5 rounded-lg border border-rose-200">
                              {item.spark_plug_brand || 'NGK Laser Iridium'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>ტიპი: <strong>{item.spark_plug_type === 'iridium' ? 'ირიდიუმი' : 'პლატინა'}</strong></span>
                            <span className="font-bold text-navy font-mono">{item.spark_plug_count || 4} ცალი</span>
                          </div>
                        </>
                      )}

                      {item.variant_key === 'timing_belt_chain' && (
                        <div className="flex items-center justify-between text-[11px] text-slate-700">
                          <span>ძრავის კბილანა ღვედი / ცეპი</span>
                          <span className="text-emerald-700 font-bold">✔ პომპა შეცვლილია</span>
                        </div>
                      )}

                      {item.variant_key === 'throttle_cleaning' && (
                        <div className="flex items-center justify-between text-[11px] text-slate-700">
                          <span>დროსელი & კოლექტორი</span>
                          <span className="text-emerald-700 font-bold">✔ ადაპტაცია OK</span>
                        </div>
                      )}

                      {item.variant_key === 'serpentine_belt' && (
                        <div className="text-[11px] text-slate-700">
                          <span>დამხმარე ღვედი & დამჭიმები შეცვლილია</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. ELECTRICAL & AC (Battery, Freon, Alternator) */}
                  {normCat === 'electrical' && (
                    <div className="my-2.5 p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/60 space-y-1.5 text-xs">
                      {item.variant_key === 'battery' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">აკუმულატორი:</span>
                            <span className="font-mono font-black text-indigo-900 bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
                              {item.battery_capacity_ah || 80} Ah • {item.battery_voltage || 12.6}V
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>{item.battery_brand || 'Varta AGM'}</span>
                            <span className="font-mono text-slate-500">წელი: {item.battery_mfg_date || '2025'}</span>
                          </div>
                        </>
                      )}

                      {item.variant_key === 'ac_system' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">კონდიციონერი:</span>
                            <span className="font-mono font-black text-indigo-900 bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
                              {item.ac_freon_grams || 550} გრ ({item.ac_freon_type || 'R134a'})
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>PAG 46 ზეთი შემოწმებულია</span>
                            <span className="text-emerald-700 font-bold">✔ წნევა OK</span>
                          </div>
                        </>
                      )}

                      {item.variant_key === 'alternator_starter' && (
                        <div className="flex items-center justify-between text-[11px] text-slate-700">
                          <span>გენერატორი: {item.alternator_voltage_output || 14.2}V</span>
                          <span className="text-emerald-700 font-bold">✔ დატვირთვის ტესტი OK</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 6. LEGAL (PTI, Insurance, Parking, License) */}
                  {normCat === 'legal' && (
                    <div className="my-2.5 p-2.5 rounded-2xl bg-teal-50/70 border border-teal-200/60 space-y-1.5 text-xs">
                      {/* PTI */}
                      {(item.variant_key === 'pti' || item.category === 'pti' || item.pti_expiry_date) && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">PTI ვადა:</span>
                            <span className="font-mono font-black text-teal-900 bg-white px-2 py-0.5 rounded-lg border border-teal-200">
                              {item.pti_expiry_date || '1 წელი'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span className="truncate max-w-[170px]">{item.pti_center || 'Greenway დიღომი'}</span>
                            <span className="flex items-center gap-1 font-bold text-gold text-[10px]">
                              <BellRing size={11} />
                              {item.pti_reminder_days || 30} დღით ადრე
                            </span>
                          </div>
                        </>
                      )}

                      {/* Insurance */}
                      {item.variant_key === 'insurance' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-[11px]">დაზღვევა:</span>
                            <span className="font-mono font-black text-teal-900 bg-white px-2 py-0.5 rounded-lg border border-teal-200">
                              {item.insurance_company || 'ალდაგი (კასკო)'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>პოლისი: {item.insurance_policy_number || 'POL-2026'}</span>
                            <span className="font-mono text-teal-800 font-bold">{item.insurance_expiry_date}</span>
                          </div>
                        </>
                      )}

                      {/* Parking */}
                      {item.variant_key === 'parking_permit' && (
                        <div className="flex items-center justify-between text-[11px] text-slate-700">
                          <span>{item.parking_permit_zone || 'თბილისის პარკირება'}</span>
                          <span className="font-mono text-teal-800 font-bold">ვადა: {item.parking_permit_expiry}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => toggleHideCardDetails(item.id)}
                      className="text-[10px] text-slate-400 hover:text-rose-600 font-bold transition-colors flex items-center gap-1"
                      title="ამ ფანჯრის დეტალების გათიშვა"
                    >
                      <span>დეტალების გათიშვა</span>
                      <X size={11} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="my-2.5 p-2 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px] font-medium text-slate-400 truncate max-w-[200px]">
                    {item.notes || 'დეტალები გათიშულია'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isDetailsHidden) {
                        toggleHideCardDetails(item.id);
                      } else {
                        toggleCardDetails(item.id);
                      }
                    }}
                    className="text-[11px] font-bold text-navy hover:text-gold flex items-center gap-1 transition-colors"
                  >
                    <span>+ დეტალების ჩართვა</span>
                  </button>
                </div>
              )}

                  {/* Resource Slider / Progress Bar */}
                  <div className="my-3 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500">დარჩენილი რესურსი:</span>
                      <span className="text-navy font-bold">{item.remaining_km.toLocaleString()} კმ</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 neu-inset">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-gold'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(item.health_percentage, 5)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>ინტერვალი: {item.interval_km.toLocaleString()} კმ</span>
                      <span>
                        {item.part_cost_gel || item.labor_cost_gel
                          ? `${item.part_cost_gel || 0}₾ ნაწ. + ${item.labor_cost_gel || 0}₾ ხელ. = ${item.cost_gel || 0} ₾`
                          : item.cost_gel ? `${item.cost_gel} ₾` : ''}
                      </span>
                    </div>
                  </div>

                  {(item.custom_brand || item.custom_part_number || item.is_custom_built) && (
                    <div className="my-1.5 px-2.5 py-1 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[10px] font-bold text-amber-900 flex items-center justify-between">
                      <span>🛠️ {item.custom_brand || 'ინდივიდუალური აწყობა'}</span>
                      {item.custom_part_number && <span className="font-mono text-slate-500">#{item.custom_part_number}</span>}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/60 mb-2 truncate">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Actions: Edit/Builder, Delete & Quick Serviced Reset */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span className="truncate">~{item.remaining_days} დღე</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Compare Offers & Variants Button */}
                    <button
                      onClick={() => handleOpenComparison(item)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50/80 hover:bg-gold text-navy border border-amber-200 hover:border-gold transition-all flex items-center gap-1 shadow-xs"
                      title="ფასებისა და ვარიანტების შედარება (ეკონომი, ოპტიმალური, პრემიუმ OEM)"
                    >
                      <Scale size={13} className="text-amber-700" />
                      <span>შედარება</span>
                    </button>

                    {/* Fill / Edit Thematic Data Button */}
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-navy border border-slate-200 transition-all flex items-center gap-1 shadow-sm"
                      title="სერვისის ინდივიდუალური აწყობა & კალკულატორი"
                    >
                      <Calculator size={13} className="text-gold" />
                      <span>✎ აწყობა / კალკულატორი</span>
                    </button>

                    {/* Ask AI to Clarify & Advise on Service */}
                    {onAskAiAboutService && (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onAskAiAboutService(item);
                        }}
                        className="p-1.5 rounded-xl text-xs font-bold neu-btn text-navy hover:text-gold transition-all"
                        title="AI მექანიკოსთან სერვისის დეტალების დაზუსტება"
                      >
                        <Bot className="w-4 h-4 text-gold" />
                      </button>
                    )}

                    {/* Delete Service Button */}
                    {onDeleteService && (
                      <button
                        onClick={() => {
                          sounds.playAlert();
                          if (window.confirm(`ნამდვილად გსურთ სერვისის "${item.title_ge}" წაშლა?`)) {
                            onDeleteService(item.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-xs font-bold neu-btn text-slate-400 hover:text-rose-600 transition-all"
                        title="სერვისის წაშლა"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Mark Serviced Today */}
                    <button
                      onClick={() => handleQuickServiced(item)}
                      className="p-1.5 rounded-xl text-xs font-bold neu-btn text-emerald-700 hover:text-emerald-800 transition-all"
                      title="დღეს შეცვლილად მონიშვნა (100%-მდე განახლება)"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Thematic Service Fill / Edit Modal */}
      <ThematicServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        serviceToEdit={editingService}
        currentVehicleMileage={vehicle.mileage_km}
        initialCategory={modalCategory}
        initialVariantKey={modalVariantKey}
        vehicle={vehicle}
      />

      {/* Service Offer & Quality Comparison Modal */}
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

      {/* Toast Notification for Turned-off Windows */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-gold/40 flex items-center gap-3 animate-fade-in backdrop-blur-md">
          <EyeOff size={16} className="text-gold shrink-0" />
          <span className="text-xs font-bold">{toastMessage.text}</span>
          {toastMessage.restoredItem && (
            <button
              type="button"
              onClick={() => {
                handleToggleDisable(toastMessage.restoredItem!);
                setToastMessage(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-gold text-slate-950 text-xs font-black hover:bg-amber-300 transition-colors shadow-xs"
            >
              გაუქმება
            </button>
          )}
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 ml-1"
          >
            <X size={13} />
          </button>
        </div>
      )}

    </div>
  );
};

export default ServiceLogModule;
