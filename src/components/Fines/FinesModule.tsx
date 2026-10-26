import React, { useState } from 'react';
import { FineItem, FinePaymentReceipt, VehicleProfile } from '../../types';
import { GeorgianLicensePlate } from '../ui/GeorgianLicensePlate';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import { PromptFieldType } from '../Modals/ContextualFieldPromptModal';
import {
  Clock,
  Camera,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  CreditCard,
  Car,
  BellRing,
  Shield,
  ShieldAlert,
  ParkingSquare,
  ChevronRight,
  Award,
  AlertTriangle,
  FileText,
  Search,
  Check,
  X,
  Printer,
  ShieldCheck,
  Info,
  UserCheck,
  Lock,
  ArrowRight,
  Bot,
  User,
  Upload,
  Sparkles,
  Fingerprint,
  Edit3
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  fines: FineItem[];
  onUpdateFines: (fines: FineItem[]) => void;
  onUpdateVehicle: (updated: Partial<VehicleProfile>) => void;
  onNavigateToParking?: () => void;
  onOpenFieldPrompt?: (field: PromptFieldType) => void;
  onNavigateToAiClarification?: (initialPrompt?: string) => void;
}

export const FinesModule: React.FC<Props> = ({
  vehicle,
  fines,
  onUpdateFines,
  onUpdateVehicle,
  onNavigateToParking,
  onOpenFieldPrompt,
  onNavigateToAiClarification
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [plateInput, setPlateInput] = useState(vehicle.plate_number || 'FR-282-EE');
  const [techPassportInput, setTechPassportInput] = useState(vehicle.tech_passport || '22-3999');
  const [isEditingDocs, setIsEditingDocs] = useState(false);

  // Driver license points & personal info
  const driverPoints = vehicle.driver_license_points ?? 100;
  const driverPersonalNumber = vehicle.driver_personal_number || '';
  const driverName = vehicle.driver_name || '';
  const [isEditingDriverInfo, setIsEditingDriverInfo] = useState(false);
  const [personalNumberInput, setPersonalNumberInput] = useState(vehicle.driver_personal_number || '');
  const [driverNameInput, setDriverNameInput] = useState(vehicle.driver_name || '');
  const [showPointsGuide, setShowPointsGuide] = useState(false);

  // Direct Ticket Search & Pay State
  const [ticketSearchInput, setTicketSearchInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Payment Checkout Modal State
  const [selectedFineForPayment, setSelectedFineForPayment] = useState<FineItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'tbc' | 'bog'>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('4127 •••• •••• 8842');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [cardHolder, setCardHolder] = useState(driverName);

  // Official Receipt Modal State
  const [receiptFine, setReceiptFine] = useState<FineItem | null>(null);

  // Driver Photo Upload Ref & Handler
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  const handleTriggerPhotoUpload = () => {
    sounds.playClick();
    photoInputRef.current?.click();
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sounds.playSuccess();
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateVehicle({ driver_photo_url: reader.result });
        setAutoSyncNotice('მძღოლის ფოტო წარმატებით აიტვირთა!');
        setTimeout(() => setAutoSyncNotice(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Allow closing payment / receipt modals with Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedFineForPayment && !isProcessingPayment) {
          setSelectedFineForPayment(null);
        } else if (receiptFine) {
          setReceiptFine(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFineForPayment, isProcessingPayment, receiptFine]);

  // Auto-sync status and last updated time
  const [lastAutoSyncedTime, setLastAutoSyncedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
  });
  const [autoSyncNotice, setAutoSyncNotice] = useState<string | null>(null);

  const runAutoFinesSync = async (plate: string, tech: string, personalId?: string, playSound = false) => {
    if (!plate || !tech) return;
    setIsRefreshing(true);
    setAutoSyncNotice('მონაცემები შეიცვალა — ჯარიმები მოწმდება police.ge-ზე...');
    try {
      const res = await n8nService.checkFines(plate, tech);
      if (res && Array.isArray(res.fines)) {
        onUpdateFines(res.fines);
        if (playSound) sounds.playSuccess();
        const nowTime = new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
        setLastAutoSyncedTime(nowTime);
        if (res.fines.length === 0) {
          setAutoSyncNotice(`ჯარიმები არ ფიქსირდება — სისტემა სუფთაა (${nowTime})`);
          onUpdateVehicle({ driver_license_points: 100 });
        } else {
          setAutoSyncNotice(`ჯარიმები განახლდა: ${res.fines.length} ჯარიმა (${nowTime})`);
          const totalDeducted = res.fines
            .filter(f => f.status === 'pending' && f.points_status === 'deducted')
            .reduce((acc, f) => acc + (f.points_deducted || 0), 0);
          onUpdateVehicle({ driver_license_points: Math.max(0, 100 - totalDeducted) });
        }
        setTimeout(() => setAutoSyncNotice(null), 4000);
      }
    } catch {
      setAutoSyncNotice(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-sync when vehicle document details change
  React.useEffect(() => {
    if (vehicle.plate_number && vehicle.tech_passport) {
      setPlateInput(vehicle.plate_number);
      setTechPassportInput(vehicle.tech_passport);
      runAutoFinesSync(vehicle.plate_number, vehicle.tech_passport, vehicle.driver_personal_number, false);
    }
  }, [vehicle.plate_number, vehicle.tech_passport]);

  // Auto-sync when personal driver info changes
  React.useEffect(() => {
    if (vehicle.driver_personal_number) {
      setPersonalNumberInput(vehicle.driver_personal_number);
      if (vehicle.driver_name) setDriverNameInput(vehicle.driver_name);
    }
  }, [vehicle.driver_personal_number, vehicle.driver_name]);

  const handleRefreshFines = async () => {
    sounds.playClick();
    if (!vehicle.plate_number || !vehicle.tech_passport || !vehicle.driver_personal_number) {
      sounds.playAlert();
      setAutoSyncNotice('police.ge ბაზაში შემოწმებისთვის საჭიროა სახელმწიფო ნომერი, ტექ-პასპორტი და პირადი ნომერი.');
      if (!vehicle.plate_number || !vehicle.tech_passport) {
        setIsEditingDocs(true);
      }
      if (!vehicle.driver_personal_number) {
        setIsEditingDriverInfo(true);
      }
      return;
    }
    await runAutoFinesSync(vehicle.plate_number, vehicle.tech_passport, vehicle.driver_personal_number, true);
  };

  const handleSaveDocs = async () => {
    sounds.playClick();
    const upPlate = plateInput.toUpperCase();
    const upTech = techPassportInput.toUpperCase();
    onUpdateVehicle({
      plate_number: upPlate,
      tech_passport: upTech
    });
    setIsEditingDocs(false);
    // Automatically query and update fines immediately
    await runAutoFinesSync(upPlate, upTech, vehicle.driver_personal_number, true);
  };

  const handleSaveDriverInfo = async () => {
    sounds.playClick();
    onUpdateVehicle({
      driver_personal_number: personalNumberInput,
      driver_name: driverNameInput
    });
    setIsEditingDriverInfo(false);
    // Automatically query and update fines immediately
    await runAutoFinesSync(vehicle.plate_number, vehicle.tech_passport, personalNumberInput, true);
  };

  // Open Checkout for specific fine
  const handleOpenPayment = (fine: FineItem) => {
    sounds.playClick();
    setSelectedFineForPayment(fine);
  };

  // Process Ticket Payment
  const handleExecutePayment = () => {
    if (!selectedFineForPayment) return;
    sounds.playClick();
    setIsProcessingPayment(true);

    const now = new Date();
    const formattedDate = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}`;
    const randomTxn = `TXN-GEO-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomAuth = `AUTH-${Math.floor(10000 + Math.random() * 90000)}`;

    const paymentAmount = selectedFineForPayment.discount_expires_days > 0
      ? selectedFineForPayment.discounted_amount_gel
      : selectedFineForPayment.amount_gel;

    const receiptData: FinePaymentReceipt = {
      txn_id: randomTxn,
      ticket_number: selectedFineForPayment.ticket_number || selectedFineForPayment.id,
      amount_paid: paymentAmount,
      payment_date: formattedDate,
      payment_method: paymentMethod === 'applepay' ? 'Apple Pay' : paymentMethod === 'tbc' ? 'TBC Pay' : paymentMethod === 'bog' ? 'BOG Express' : 'Visa Debit (•••• 8842)',
      auth_code: randomAuth,
      card_last4: '8842',
      payer_name: driverName
    };

    setTimeout(() => {
      // If points were deducted for this violation, reflect it in the driver's license balance
      if (selectedFineForPayment.points_deducted && selectedFineForPayment.points_deducted > 0) {
        const newBalance = Math.max(0, driverPoints - selectedFineForPayment.points_deducted);
        onUpdateVehicle({ driver_license_points: newBalance });
      }

      // Update fine in state to paid with receipt
      const updatedList = fines.map(f => {
        if (f.id === selectedFineForPayment.id) {
          return {
            ...f,
            status: 'paid' as const,
            payment_receipt: receiptData
          };
        }
        return f;
      });

      onUpdateFines(updatedList);
      setIsProcessingPayment(false);
      sounds.playSuccess();

      // Show receipt modal
      const paidFineWithReceipt = updatedList.find(f => f.id === selectedFineForPayment.id);
      setSelectedFineForPayment(null);
      if (paidFineWithReceipt) {
        setReceiptFine(paidFineWithReceipt);
      }
    }, 1300);
  };

  // Search by Ticket Number
  const handleSearchAndPayTicket = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError(null);
    sounds.playClick();

    const query = ticketSearchInput.trim().toUpperCase();
    if (!query) {
      setSearchError('გთხოვთ შეიყვანოთ ქვითრის ან ოქმის ნომერი');
      return;
    }

    const found = fines.find(f =>
      f.id.toUpperCase().includes(query) ||
      (f.ticket_number && f.ticket_number.toUpperCase().includes(query))
    );

    if (found) {
      if (found.status === 'paid') {
        setReceiptFine(found);
      } else {
        setSelectedFineForPayment(found);
      }
      setTicketSearchInput('');
    } else {
      // Simulate finding a patrol fine from national police.ge database
      const newCustomFine: FineItem = {
        id: `PT-${query}`,
        ticket_number: `ოქმი #${query}`,
        amount_gel: 50,
        discounted_amount_gel: 40,
        discount_expires_days: 14,
        date: new Date().toISOString().slice(0, 10),
        location: 'თბილისი, საპატრულო ეკიპაჟის ქვითარი',
        violation_type: 'საგზაო ნიშნის მოთხოვნის შეუსრულებლობა (ადგილზე გამოწერილი)',
        plate_number: vehicle.plate_number,
        status: 'pending',
        points_deducted: 5,
        points_status: 'deducted',
        article_law_ge: 'ასკ მუხლი 125, ნაწილი 1',
        points_explanation_ge: 'საგზაო ნიშნის შეუსრულებლობა ითვალისწინებს 5 ქულის დაკლებას მართვის მოწმობაზე.'
      };
      onUpdateFines([newCustomFine, ...fines]);
      setSelectedFineForPayment(newCustomFine);
      setTicketSearchInput('');
      sounds.playSuccess();
    }
  };

  const pendingFines = fines.filter(f => f.status === 'pending');
  const paidFines = fines.filter(f => f.status === 'paid');
  const totalPendingAmount = pendingFines.reduce((acc, f) => acc + (f.discount_expires_days > 0 ? f.discounted_amount_gel : f.amount_gel), 0);
  const totalPendingGel = totalPendingAmount;
  const totalPointsAtRisk = pendingFines.reduce((acc, f) => acc + (f.points_deducted || 0), 0);

  // Points Progress Bar Color & Status
  const pointsColor = driverPoints >= 70
    ? 'bg-emerald-500'
    : driverPoints >= 40
    ? 'bg-amber-500'
    : 'bg-rose-500';

  const pointsStrokeColor = driverPoints >= 70
    ? '#10B981'
    : driverPoints >= 40
    ? '#F59E0B'
    : '#F43F5E';

  const pointsTextColor = driverPoints >= 70
    ? 'text-emerald-700'
    : driverPoints >= 40
    ? 'text-amber-800'
    : 'text-rose-700';

  // Circular Gauge Calculations
  const gaugeRadius = 52;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius; // ~326.72
  const clampedDriverPoints = Math.max(0, Math.min(100, driverPoints));
  const gaugeStrokeDashoffset = gaugeCircumference - (clampedDriverPoints / 100) * gaugeCircumference;

  // Transliteration map for Georgian to Latin (Passport MRZ & International Standard)
  const geoToLatinMap: Record<string, string> = {
    'ა': 'A', 'ბ': 'B', 'გ': 'G', 'დ': 'D', 'ე': 'E', 'ვ': 'V', 'ზ': 'Z',
    'თ': 'T', 'ი': 'I', 'კ': 'K', 'ლ': 'L', 'მ': 'M', 'ნ': 'N', 'ო': 'O',
    'პ': 'P', 'ჟ': 'ZH', 'რ': 'R', 'ს': 'S', 'ტ': 'T', 'უ': 'U', 'ფ': 'F',
    'ქ': 'K', 'ღ': 'GH', 'ყ': 'Q', 'შ': 'SH', 'ჩ': 'CH', 'ც': 'TS', 'ძ': 'DZ',
    'წ': 'TS', 'ჭ': 'CH', 'ხ': 'KH', 'ჯ': 'J', 'ჰ': 'H'
  };

  const geoToLatin = (str: string): string => {
    return str
      .split('')
      .map(char => geoToLatinMap[char] || char)
      .join('')
      .toUpperCase();
  };

  const splitDriverName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { firstName: '', lastName: '', firstNameLatin: '', lastNameLatin: '' };
    }
    if (parts.length === 1) {
      return {
        firstName: parts[0],
        lastName: '',
        firstNameLatin: geoToLatin(parts[0]),
        lastNameLatin: ''
      };
    }
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return {
      firstName,
      lastName,
      firstNameLatin: geoToLatin(firstName),
      lastNameLatin: geoToLatin(lastName)
    };
  };

  const { firstName, lastName, firstNameLatin, lastNameLatin } = splitDriverName(driverName);

  // 5 Profile Requirements Checklist
  const profileRequirements = [
    {
      id: 'name',
      label: 'მძღოლის სახელი & გვარი',
      shortLabel: 'სახელი',
      isFilled: Boolean(driverName && driverName.trim().length > 0),
      value: driverName || 'შეუვსებელია',
      onAction: () => {
        sounds.playClick();
        if (onOpenFieldPrompt) onOpenFieldPrompt('driver_name');
        else setIsEditingDriverInfo(true);
      }
    },
    {
      id: 'personal_id',
      label: 'პირადი ნომერი (11 ნიშნა)',
      shortLabel: 'პირადი #',
      isFilled: Boolean(driverPersonalNumber && driverPersonalNumber.trim().length >= 7),
      value: driverPersonalNumber || 'შეუვსებელია',
      onAction: () => {
        sounds.playClick();
        if (onOpenFieldPrompt) onOpenFieldPrompt('driver_personal_number');
        else setIsEditingDriverInfo(true);
      }
    },
    {
      id: 'plate',
      label: 'ავტომობილის ნომერი',
      shortLabel: 'ავტო ნომერი',
      isFilled: Boolean(vehicle.plate_number && vehicle.plate_number !== 'GE-000-XX'),
      value: vehicle.plate_number || 'შეუვსებელია',
      onAction: () => {
        sounds.playClick();
        if (onOpenFieldPrompt) onOpenFieldPrompt('plate_number');
        else setIsEditingDocs(true);
      }
    },
    {
      id: 'tech_passport',
      label: 'ტექ-პასპორტი',
      shortLabel: 'ტექ-პასპორტი',
      isFilled: Boolean(vehicle.tech_passport && vehicle.tech_passport.trim().length > 0),
      value: vehicle.tech_passport || 'შეუვსებელია',
      onAction: () => {
        sounds.playClick();
        if (onOpenFieldPrompt) onOpenFieldPrompt('tech_passport');
        else setIsEditingDocs(true);
      }
    },
    {
      id: 'photo',
      label: 'ბიომეტრიული ფოტო',
      shortLabel: 'ფოტო',
      isFilled: Boolean(vehicle.driver_photo_url && vehicle.driver_photo_url.length > 0),
      value: vehicle.driver_photo_url ? 'ატვირთულია' : 'არ არის ატვირთული',
      onAction: handleTriggerPhotoUpload
    }
  ];

  const filledCount = profileRequirements.filter(r => r.isFilled).length;
  const totalCount = profileRequirements.length;
  const completionPercentage = Math.round((filledCount / totalCount) * 100);
  const hasMissingRequirements = filledCount < totalCount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Hidden Biometric Photo Input */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFileChange}
        className="hidden"
      />

      {/* ======================================================== */}
      {/* 0. TOP COMPLETION INDICATOR: FILLED & REMAINING CHIPS     */}
      {/* ======================================================== */}
      <div className={`p-4 sm:p-5 rounded-3xl neu-card border transition-all ${
        hasMissingRequirements
          ? 'border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 shadow-sm'
          : 'border-emerald-300/80 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-emerald-500/10 shadow-sm'
      }`}>
        {/* Progress Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            {hasMissingRequirements ? (
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
                <AlertTriangle size={18} className="animate-pulse" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
                <CheckCircle size={18} />
              </div>
            )}
            <div>
              <div className="text-xs sm:text-sm font-black text-navy flex items-center gap-2">
                <span>პროფილის შევსების სტატუსი:</span>
                <span className={`font-mono text-sm sm:text-base font-extrabold ${
                  hasMissingRequirements ? 'text-amber-800' : 'text-emerald-700'
                }`}>
                  {completionPercentage}%
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  ({filledCount} / {totalCount} შევსებულია)
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {hasMissingRequirements
                  ? 'დარჩენილი ველები მონიშნულია მნათობი ინდიკატორით. დააჭირეთ შესავსებად:'
                  : 'ავტო-პასპორტის ყველა რეკვიზიტი სრულად არის შევსებული და სინქრონიზებული.'}
              </p>
            </div>
          </div>

          {onNavigateToAiClarification && hasMissingRequirements && (
            <button
              onClick={() => onNavigateToAiClarification('გამარჯობა AI მექანიკოსო, როგორ შევავსო მართვის მოწმობისა და ავტო-პასპორტის მონაცემები ვიდეოჯარიმების გადასამოწმებლად?')}
              className="px-3 py-1.5 rounded-xl bg-white text-navy border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-slate-50 transition-all shrink-0"
            >
              <Bot size={14} className="text-gold" />
              <span>AI დაზუსტება</span>
            </button>
          )}
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-3.5">
          <div
            className={`h-full transition-all duration-700 ease-out ${
              hasMissingRequirements
                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* 5 Chips: Filled (Check) or Missing (Glowing Pulse) */}
        <div className="flex flex-wrap items-center gap-2">
          {profileRequirements.map(item => (
            item.isFilled ? (
              <button
                key={item.id}
                onClick={item.onAction}
                className="px-3 py-1.5 rounded-xl bg-white/95 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-emerald-50 transition-all group"
                title={`${item.label}: ${item.value}`}
              >
                <Check size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-slate-500 font-normal">{item.shortLabel}:</span>
                <span className="font-mono text-navy font-black max-w-[120px] truncate">{item.value}</span>
              </button>
            ) : (
              <button
                key={item.id}
                onClick={item.onAction}
                className="relative px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border-2 border-amber-400 text-amber-950 text-xs font-black flex items-center gap-2 cursor-pointer animate-pulse shadow-[0_0_16px_rgba(245,158,11,0.65)] hover:scale-105 hover:bg-amber-400/40 transition-all"
                title={`დარჩენილია: დააჭირეთ ${item.label}-ს შესაყვანად`}
              >
                <Sparkles size={14} className="text-amber-700 animate-spin" style={{ animationDuration: '4s' }} />
                <span>+ {item.label}</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-400/80 text-[10px] text-amber-950 font-mono font-black uppercase">
                  დარჩენილია
                </span>
              </button>
            )
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. AUTHENTIC PASSPORT & DRIVER PROFILE CARD              */}
      {/* ======================================================== */}
      <div className="rounded-3xl neu-card shadow-neu-card border border-slate-200/90 overflow-hidden relative">
        
        {/* Authentic Passport Header Ribbon */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white px-5 sm:px-7 py-3 border-b border-gold/30 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl">🇬🇪</span>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-wide text-gold flex items-center gap-2">
                <span>GEORGIA / საქართველო</span>
                <span className="text-[10px] text-slate-300 font-normal">• შსს მომსახურების სააგენტო</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-mono tracking-wider text-slate-300 font-bold uppercase">
                მართვის მოწმობა & ავტო-პასპორტი • DRIVING LICENCE & VEHICLE REGISTRATION
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/20 text-gold border border-gold/40 flex items-center gap-1.5">
              <Fingerprint size={12} />
              <span>GEO / BIOMETRIC ID</span>
            </span>
          </div>
        </div>

        {/* 3-Column Passport Body */}
        <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative">
          
          {/* =================================================== */}
          {/* A. LEFT COLUMN: PHOTO, NAME, SURNAME, CAR (5 cols)  */}
          {/* =================================================== */}
          <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-6 lg:pb-0 lg:pr-6">
            
            {/* Top: Driver Biometric Photo & Personal Name Dual-Script */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              
              {/* Biometric Photo Frame */}
              <div className="relative group shrink-0">
                <div
                  onClick={handleTriggerPhotoUpload}
                  className={`w-24 sm:w-28 h-32 sm:h-36 rounded-2xl border-2 overflow-hidden shadow-sm flex flex-col items-center justify-center relative cursor-pointer transition-all ${
                    vehicle.driver_photo_url
                      ? 'border-slate-300 bg-slate-900'
                      : 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-300 animate-pulse'
                  }`}
                  title="დააჭირეთ ფოტოს ასატვირთად"
                >
                  {vehicle.driver_photo_url ? (
                    <>
                      <img
                        src={vehicle.driver_photo_url}
                        alt={driverName || 'Driver'}
                        className="w-full h-full object-cover"
                      />
                      {/* Security Hologram overlay sheen */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                      {/* Hover action button */}
                      <div className="absolute inset-0 bg-navy/70 text-white flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                        <Camera size={18} className="text-gold" />
                        <span>შეცვლა</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-amber-900 hover:bg-amber-100/60 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-amber-200/80 flex items-center justify-center mb-1 text-amber-800">
                        <Upload size={18} />
                      </div>
                      <span className="text-[10px] font-black leading-tight">ფოტოს ატვირთვა</span>
                      <span className="text-[9px] text-amber-700/90 font-mono mt-0.5">PHOTO</span>
                    </div>
                  )}
                </div>

                {/* Corner Security Hologram Badge */}
                <div
                  onClick={handleTriggerPhotoUpload}
                  className="absolute -bottom-2 -right-2 bg-navy text-gold p-1.5 rounded-xl border border-gold/40 shadow-xs cursor-pointer hover:scale-110 transition-transform"
                  title="ბიომეტრიული ფოტოს ატვირთვა / შეცვლა"
                >
                  <Fingerprint size={14} />
                </div>
              </div>

              {/* Passport Driver Attributes (Dual-Script Georgian & Latin) */}
              <div className="min-w-0 flex-1 space-y-2 w-full text-center sm:text-left">
                {/* 1. გვარი / Surname */}
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    1. გვარი / SURNAME
                  </div>
                  <div className="text-base font-black text-navy leading-tight truncate">
                    {lastName || (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          if (onOpenFieldPrompt) onOpenFieldPrompt('driver_name');
                          else setIsEditingDriverInfo(true);
                        }}
                        className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg font-bold inline-flex items-center gap-1 hover:bg-amber-200 transition-all text-xs"
                      >
                        <span>შეუვსებელია</span>
                        <Edit3 size={11} />
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                    {lastNameLatin || 'SURNAME'}
                  </div>
                </div>

                {/* 2. სახელი / Given Name */}
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    2. სახელი / GIVEN NAME
                  </div>
                  <div className="text-base font-black text-navy leading-tight truncate">
                    {firstName || (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          if (onOpenFieldPrompt) onOpenFieldPrompt('driver_name');
                          else setIsEditingDriverInfo(true);
                        }}
                        className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg font-bold inline-flex items-center gap-1 hover:bg-amber-200 transition-all text-xs"
                      >
                        <span>შეუვსებელია</span>
                        <Edit3 size={11} />
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                    {firstNameLatin || 'GIVEN NAME'}
                  </div>
                </div>

                {/* 4c & 4d: Nationality & Personal ID */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">
                      4c. მოქალაქეობა
                    </div>
                    <div className="text-xs font-bold text-navy font-mono">
                      GEO / საქართველო
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">
                      4d. პირადი # / ID
                    </div>
                    <div className="text-xs font-mono font-bold text-navy truncate">
                      {driverPersonalNumber || (
                        <button
                          onClick={() => {
                            sounds.playClick();
                            if (onOpenFieldPrompt) onOpenFieldPrompt('driver_personal_number');
                            else setIsEditingDriverInfo(true);
                          }}
                          className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-lg font-bold inline-flex items-center gap-1 hover:bg-amber-200 transition-all text-[10px]"
                        >
                          <span>+ შევსება</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 9. License Categories */}
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-500">
                    კატეგორია: <span className="font-mono text-navy font-black">B, B1</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck size={11} />
                    <span>მართვის უფლება: აქტიური</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Vehicle Details Box */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-gold shrink-0" />
                  <span className="text-xs font-black text-navy">{vehicle.brand} {vehicle.model} ({vehicle.year})</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{vehicle.fuel_type || 'PETROL'}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <GeorgianLicensePlate plate={vehicle.plate_number || 'FR-282-EE'} size="sm" variant="white" />
                <div className="text-[11px] font-mono text-right">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">ტექ-პასპორტი / REG CERT</div>
                  <div className="font-bold text-navy">
                    {vehicle.tech_passport || (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          if (onOpenFieldPrompt) onOpenFieldPrompt('tech_passport');
                          else setIsEditingDocs(true);
                        }}
                        className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-lg hover:bg-amber-200 transition-all text-[10px] font-bold"
                      >
                        + შევსება
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold pt-1">
              <button
                onClick={() => setIsEditingDriverInfo(!isEditingDriverInfo)}
                className="text-navy hover:text-gold flex items-center gap-1 transition-colors"
              >
                <Edit3 size={12} className="text-gold" />
                <span>{isEditingDriverInfo ? 'დახურვა' : 'მძღოლის რედაქტირება'}</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setIsEditingDocs(!isEditingDocs)}
                className="text-navy hover:text-gold flex items-center gap-1 transition-colors"
              >
                <Edit3 size={12} className="text-gold" />
                <span>{isEditingDocs ? 'დახურვა' : 'ავტომობილის რეკვიზიტები'}</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={handleTriggerPhotoUpload}
                className="text-navy hover:text-gold flex items-center gap-1 transition-colors"
              >
                <Camera size={12} className="text-gold" />
                <span>ფოტო</span>
              </button>
            </div>

          </div>

          {/* ============================================================== */}
          {/* B. MIDDLE COLUMN: POINTS & CONTOUR WATERMARK VISUAL (4 cols)    */}
          {/* ============================================================== */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-6 lg:pb-0 lg:px-4 relative overflow-hidden rounded-2xl bg-slate-50/50">
            
            {/* Contour Wave Guilloche Security Watermark (Authentic Security Line Art) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
              <svg className="w-full h-full" viewBox="0 0 320 320" preserveAspectRatio="none" fill="none">
                {/* Concentric Guilloche Circles */}
                <circle cx="160" cy="140" r="130" stroke="#001F3F" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 3" />
                <circle cx="160" cy="140" r="110" stroke="#C5A059" strokeWidth="1.2" opacity="0.4" />
                <circle cx="160" cy="140" r="90" stroke="#001F3F" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 4" />
                <circle cx="160" cy="140" r="70" stroke="#C5A059" strokeWidth="0.6" opacity="0.35" />
                {/* Wavy Contour Lines */}
                <path d="M-20,70 Q60,20 160,70 T340,70" stroke="#001F3F" strokeWidth="0.8" opacity="0.35" />
                <path d="M-20,95 Q80,45 160,95 T340,95" stroke="#C5A059" strokeWidth="0.9" opacity="0.3" />
                <path d="M-20,185 Q80,235 160,185 T340,185" stroke="#C5A059" strokeWidth="0.9" opacity="0.3" />
                <path d="M-20,210 Q60,260 160,210 T340,210" stroke="#001F3F" strokeWidth="0.8" opacity="0.35" />
                <path d="M-20,240 Q100,290 180,240 T340,240" stroke="#001F3F" strokeWidth="0.6" opacity="0.25" strokeDasharray="4 2" />
              </svg>
            </div>

            {/* Header: Points System with Info Trigger */}
            <div className="flex items-center justify-between w-full mb-2 px-1 relative z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award size={14} className="text-gold" />
                <span>ქულების სისტემა (100)</span>
              </span>
              <button
                onClick={() => setShowPointsGuide(!showPointsGuide)}
                className="text-slate-400 hover:text-gold transition-colors p-1"
                title="როგორ მუშაობს ქულები?"
              >
                <Info size={14} />
              </button>
            </div>

            {/* SVG Circular Progress Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center relative z-10 my-1">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 130 130">
                {/* Background Ring Track */}
                <circle
                  cx="65"
                  cy="65"
                  r={gaugeRadius}
                  stroke="#E2E8F0"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Progress Ring with Dynamic Color & Drop Shadow */}
                <circle
                  cx="65"
                  cy="65"
                  r={gaugeRadius}
                  stroke={pointsStrokeColor}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={gaugeStrokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{ filter: `drop-shadow(0 0 6px ${pointsStrokeColor}40)` }}
                />
              </svg>

              {/* Center Points Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black font-mono text-navy tracking-tight leading-none">
                  {driverPoints}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  / 100 ქულა
                </span>
              </div>
            </div>

            {/* Points Status Pill & Deductions Info */}
            <div className="mt-2 text-center space-y-1 relative z-10">
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black border inline-block ${
                driverPoints >= 70
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : driverPoints >= 40
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                {driverPoints >= 70 ? '● უსაფრთხო ზონა' : driverPoints >= 40 ? '● საშუალო რისკი' : '● კრიტიკული ზონა'}
              </span>
              <div className="text-[10px] text-slate-500 font-mono">
                {100 - driverPoints > 0 ? `დაკლებული: -${100 - driverPoints} ქულა` : 'სრული 100 ქულა შენარჩუნებულია'}
              </div>
            </div>

            {/* Bottom MRZ Security Barcode Lines (Machine Readable Zone) */}
            <div className="mt-3.5 w-full p-2 rounded-xl bg-slate-900/95 text-gold font-mono text-[8px] sm:text-[9px] tracking-widest text-center shadow-inner opacity-90 leading-relaxed select-all relative z-10">
              <div className="truncate">P&lt;GEODRIVER&lt;&lt;{(lastNameLatin || 'SURNAME')}&lt;{(firstNameLatin || 'NAME')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
              <div className="truncate">{(driverPersonalNumber || '00000000000')}GEO{vehicle.year || '24'}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;01</div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* C. RIGHT COLUMN: FULL VERIFICATION WINDOW IN TINTED PALETTE (3) */}
          {/* ============================================================== */}
          <div className="lg:col-span-3 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B1528] to-slate-950 text-white p-4 sm:p-5 border border-slate-700/80 shadow-xl flex flex-col justify-between space-y-3.5 relative overflow-hidden">
            
            {/* Tonal Accent Watermark Blurs */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top: Live Sync Status */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse shrink-0" />
                <span className="text-xs font-black text-slate-200">სრული შემოწმება</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                police.ge • {lastAutoSyncedTime}
              </span>
            </div>

            {/* Pending Fines Amount Box */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                სულ გადასახდელი:
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-gold">
                  {totalPendingAmount} ₾
                </span>
                {pendingFines.length > 0 ? (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/40">
                    {pendingFines.length} აქტიური
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-600/40">
                    ✓ სუფთაა
                  </span>
                )}
              </div>
              {pendingFines.some(f => f.discount_expires_days > 0) && (
                <div className="mt-1 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span>⚡</span>
                  <span>-20% საშეღავათო ვადა აქტიურია</span>
                </div>
              )}
            </div>

            {/* Quick Ticket Search Box */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-300 block uppercase tracking-wider">
                ქვითრის ნომრით ძებნა:
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={ticketSearchInput}
                    onChange={(e) => {
                      setTicketSearchInput(e.target.value);
                      if (searchError) setSearchError(null);
                    }}
                    placeholder="CT123456 / DA..."
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-gold"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchAndPayTicket(e);
                      }
                    }}
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={handleSearchAndPayTicket}
                  className="px-2.5 py-1.5 rounded-xl bg-gold/90 hover:bg-gold text-navy text-xs font-bold transition-all shrink-0 shadow-xs"
                  title="ქვითრის ძებნა"
                >
                  ძებნა
                </button>
              </div>
              {searchError && (
                <p className="text-[10px] text-rose-400 font-medium">{searchError}</p>
              )}
            </div>

            {/* Database Requirements Checklist */}
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-[10px] font-mono space-y-1 text-slate-300">
              <div className="flex items-center justify-between text-slate-400 font-sans font-bold text-[11px] pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>ბაზის რეკვიზიტები:</span>
                </span>
                <span className="text-[9px] text-slate-400">police.ge</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-400">1. ნომერი:</span>
                <span className={vehicle.plate_number && vehicle.plate_number !== 'GE-000-XX' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold animate-pulse'}>
                  {vehicle.plate_number || 'დარჩენილია ⚠️'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">2. ტექ-პასპორტი:</span>
                <span className={vehicle.tech_passport ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold animate-pulse'}>
                  {vehicle.tech_passport || 'დარჩენილია ⚠️'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">3. პირადი #:</span>
                <span className={vehicle.driver_personal_number ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold animate-pulse'}>
                  {vehicle.driver_personal_number || 'დარჩენილია ⚠️'}
                </span>
              </div>
            </div>

            {/* Action Buttons: Check & Pay */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleRefreshFines}
                disabled={isRefreshing}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-gold text-xs font-bold flex items-center justify-center gap-2 border border-slate-700/80 transition-all shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold' : 'text-gold'}`} />
                <span>{isRefreshing ? 'მოწმდება...' : 'შემოწმება (police.ge)'}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  if (pendingFines.length > 0) {
                    setSelectedFineForPayment(pendingFines[0]);
                  }
                }}
                disabled={pendingFines.length === 0}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  pendingFines.length > 0
                    ? 'bg-gradient-to-r from-gold via-amber-400 to-gold text-navy shadow-lg shadow-gold/20 hover:scale-[1.01]'
                    : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>
                  {pendingFines.length > 0
                    ? `გადახდა (${totalPendingGel} ₾)`
                    : 'ჯარიმები არ ფიქსირდება ✓'}
                </span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Live Auto-sync Toast Notice */}
      {autoSyncNotice && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-blue-500/15 border border-emerald-300 text-xs font-bold text-navy flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{autoSyncNotice}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 font-black">police.ge Live Sync</span>
        </div>
      )}

      {/* Edit Form */}
      {isEditingDocs && (
        <div className="p-5 rounded-3xl neu-card border border-gold/40 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-navy flex items-center gap-2">
            <Car className="w-4 h-4 text-gold" />
            სატრანსპორტო საშუალების რეკვიზიტები
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1 font-bold">სახელმწიფო ნომერი</label>
              <input
                type="text"
                value={plateInput}
                onChange={(e) => setPlateInput(e.target.value)}
                placeholder="FR-282-EE"
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy font-mono uppercase focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1 font-bold">ტექ-პასპორტის სერია და ნომერი</label>
              <input
                type="text"
                value={techPassportInput}
                onChange={(e) => setTechPassportInput(e.target.value)}
                placeholder="22-3999"
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy font-mono uppercase focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditingDocs(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold neu-btn text-slate-500"
            >
              გაუქმება
            </button>
            <button
              onClick={handleSaveDocs}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gold hover:bg-amber-400 text-navy shadow-gold-soft"
            >
              შენახვა
            </button>
          </div>
        </div>
      )}

      {/* Explanatory Guide Box (Toggleable) */}
      {showPointsGuide && (
        <div className="p-4 rounded-3xl neu-card border border-blue-200 text-xs text-navy space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>როგორ მუშაობს მართვის მოწმობის 100-ქულიანი სისტემა საქართველოში?</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>ყოველ კალენდარულ წელს (1 იანვარს) ყველა მძღოლს ავტომატურად ერიცხება <strong>100 ქულა</strong>.</li>
            <li>სამართალდარღვევისას (სიჩქარე, ღერძულა ხაზი, შუქნიშნის წითელი) ქულები <strong>აკლდება</strong> მუხლის შესაბამისად (5-დან 20 ქულამდე).</li>
            <li><strong>ჭკვიანი ვიდეოკამერების ჯარიმებზე:</strong> ქულა ავტომატურად <strong>არ აკლდება</strong> მფლობელს (0 ქულა), სანამ არ მოხდება რეალური მძღოლის იდენტიფიცირება.</li>
            <li>თუ წლის განმავლობაში ქულების რაოდენობა <strong>0-მდე</strong> დავა, მართვის უფლება ავტომატურად <strong>ჩერდება 1 წლით</strong>.</li>
          </ul>
        </div>
      )}

      {/* Edit Driver Info Form */}
      {isEditingDriverInfo && (
        <div className="p-5 rounded-3xl neu-card border border-gold/40 space-y-3 animate-fade-in">
          <h4 className="text-xs font-bold text-navy flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-gold" />
            მძღოლის პირადი რეკვიზიტები
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">სახელი და გვარი</label>
              <input
                type="text"
                value={driverNameInput}
                onChange={(e) => setDriverNameInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl neu-inset text-xs text-navy focus:outline-none"
                placeholder="გიორგი ბერიძე"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">პირადი ნომერი (11 ნიშნა)</label>
              <input
                type="text"
                value={personalNumberInput}
                onChange={(e) => setPersonalNumberInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl neu-inset text-xs font-mono text-navy focus:outline-none"
                placeholder="01024085432"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsEditingDriverInfo(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold neu-btn text-slate-500"
            >
              გაუქმება
            </button>
            <button
              onClick={handleSaveDriverInfo}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gold hover:bg-amber-400 text-navy shadow-gold-soft"
            >
              დამახსოვრება
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. QUICK PAY BY TICKET NUMBER (ქვითრის ნომრით გადახდა)   */}
      {/* ======================================================== */}
      <div className="p-5 rounded-3xl neu-card shadow-neu-card border border-white">
        <form onSubmit={handleSearchAndPayTicket} className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-gold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <h4 className="text-xs font-extrabold text-navy">
              ქვითრის ნომრით პირდაპირი გადახდა (პატრულის / ვიდეოჯარიმის ქვითარი)
            </h4>
            <p className="text-[11px] text-slate-500">
              შეიყვანეთ ქვითრის ან საპატრულო ოქმის ნომერი მყისიერი შემოწმებისა და გადახდისთვის
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={ticketSearchInput}
                onChange={(e) => setTicketSearchInput(e.target.value)}
                placeholder="მაგ: PT-2026-908124"
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-xs font-mono text-navy uppercase focus:outline-none pr-8"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-navy hover:bg-slate-800 text-gold shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <span>ქვითრის გადახდა</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
        {searchError && (
          <p className="text-xs text-rose-600 font-bold mt-2 ml-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{searchError}</span>
          </p>
        )}
      </div>

      {/* Notification Banner & Quick Link to Parking Service */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 20% discount alert OR Clean Status Banner */}
        {pendingFines.some(f => f.discount_expires_days > 0) ? (
          <div className="p-4 rounded-3xl neu-card border-l-4 border-l-gold flex items-center justify-between border border-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full neu-circle flex items-center justify-center text-gold shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy">
                  საშეღავათო 20%-იანი პერიოდი აქტიურია!
                </p>
                <p className="text-[11px] text-slate-500">
                  საშეღავათო ვადის ფარგლებში ზოგავთ ჯამში {pendingFines.reduce((acc, f) => acc + (f.amount_gel - f.discounted_amount_gel), 0)} ₾-ს.
                </p>
              </div>
            </div>
            <a
              href="https://police.ge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-gold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>police.ge</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="p-4 rounded-3xl neu-card border-l-4 border-l-emerald-500 flex items-center justify-between border border-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy">
                  საპატრულო მონიტორინგი: სუფთაა
                </p>
                <p className="text-[11px] text-slate-500">
                  {vehicle.plate_number}-ზე police.ge ბაზაში ჯარიმები არ იძებნება.
                </p>
              </div>
            </div>
            <a
              href="https://police.ge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>police.ge</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Dedicated Parking Services Banner */}
        {onNavigateToParking && (
          <div
            onClick={onNavigateToParking}
            className="p-4 rounded-3xl bg-blue-50/80 border border-blue-200/80 hover:border-blue-400 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-navy text-gold flex items-center justify-center shrink-0">
                <ParkingSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-navy group-hover:text-blue-900 transition-colors">
                  საპარკინგე სერვისები (თბილისი & ბათუმი)
                </p>
                <p className="text-[11px] text-slate-500">
                  ზონალური პარკირების წამზომი, 10₾/50₾ ჯარიმები & აბონემენტები
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-navy group-hover:text-gold transition-colors">
              <span>გადასვლა</span>
              <ChevronRight size={16} />
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. FINES CARDS LIST (WITH POINTS & RECEIPT PAYMENT)      */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold text-navy flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-gold" />
            <span>ფიქსირებული ქვითრები & დარღვევები</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">
            სულ: {fines.length} (აქტიური: {pendingFines.length})
          </span>
        </div>

        {fines.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl neu-card text-center flex flex-col items-center justify-center space-y-4 border border-white">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-navy">საპატრულო ჯარიმები არ ფიქსირდება!</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                თქვენს ავტომობილზე (<span className="font-mono font-bold text-navy">{vehicle.plate_number}</span>) საპატრულო პოლიციის (police.ge) ცენტრალურ ბაზაში დარღვევები არ იძებნება.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>მართვის მოწმობის ქულები: 100 / 100</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                <Check size={14} className="text-blue-600" />
                <span>სისტემა სუფთაა</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRefreshFines}
                disabled={isRefreshing}
                className="btn-stitch-primary px-5 py-2.5 text-xs font-black flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'მოწმდება...' : 'police.ge ხელახალი შემოწმება'}</span>
              </button>

              <a
                href="https://police.ge"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-stitch-soft px-5 py-2.5 text-xs font-bold flex items-center gap-2"
              >
                <span>police.ge ოფიციალური პორტალი</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fines.map((fine) => {
              const isPaid = fine.status === 'paid';
              const ticketNum = fine.ticket_number || fine.id;
              const pointsDeducted = fine.points_deducted ?? 0;
              const hasPointsPenalty = pointsDeducted > 0;

              return (
                <div
                  key={fine.id}
                  className={`rounded-3xl p-5 neu-card shadow-neu-card transition-all border border-white flex flex-col justify-between ${
                    isPaid ? 'opacity-75 bg-slate-50/60' : ''
                  }`}
                >
                  <div>
                    {/* Header: Ticket Number & Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full neu-circle flex items-center justify-center text-gold shrink-0">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono text-navy font-bold block">
                            {ticketNum}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{fine.date}</span>
                        </div>
                      </div>

                      {isPaid ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          გადახდილია
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-gold" />
                          დარჩა {fine.discount_expires_days} დღე
                        </span>
                      )}
                    </div>

                    {/* Violation Type */}
                    <h3 className="text-sm font-extrabold text-navy mb-2 leading-snug">
                      {fine.violation_type}
                    </h3>

                    {/* Location */}
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 mb-3 flex items-center gap-2">
                      <span className="text-gold">📍</span>
                      <span className="truncate">{fine.location}</span>
                    </p>

                    {/* POINTS DEDUCTION BANNER (თუ გაკლდება ქულები) */}
                    <div className="mb-4">
                      {hasPointsPenalty ? (
                        <div className="p-3 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-xs space-y-1">
                          <div className="flex items-center justify-between font-extrabold text-rose-700">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              აკლდება: -{pointsDeducted} ქულა
                            </span>
                            <span className="text-[10px] bg-rose-200/70 text-rose-900 px-2 py-0.5 rounded-full font-mono font-bold">
                              {fine.article_law_ge || 'ასკ 125-ე მუხლი'}
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-800/90 leading-relaxed">
                            {fine.points_explanation_ge || 'დარღვევა იწვევს მართვის მოწმობაზე ქულების დაკლებას.'}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs space-y-1">
                          <div className="flex items-center justify-between font-extrabold text-blue-800">
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                              0 ქულა (ქულა არ აკლდება)
                            </span>
                            <span className="text-[10px] bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                              ვიდეოჯარიმა
                            </span>
                          </div>
                          <p className="text-[11px] text-blue-900/80 leading-relaxed">
                            {fine.points_explanation_ge || 'ვიდეოკამერით დაფიქსირებული დარღვევა: ქულა მფლობელს არ აკლდება.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Payment Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black font-mono text-navy">
                          {isPaid ? fine.amount_gel : (fine.discount_expires_days > 0 ? fine.discounted_amount_gel : fine.amount_gel)} ₾
                        </span>
                        {!isPaid && fine.discount_expires_days > 0 && (
                          <span className="text-xs line-through text-slate-400 font-mono">
                            {fine.amount_gel} ₾
                          </span>
                        )}
                      </div>
                      {!isPaid && fine.discount_expires_days > 0 && (
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          -20% საშეღავათო ვადა
                        </span>
                      )}
                      {isPaid && (
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          ქვითარი დახურულია
                        </span>
                      )}
                    </div>

                    {isPaid ? (
                      <button
                        onClick={() => setReceiptFine(fine)}
                        className="btn-stitch-soft px-4 py-2 text-xs font-bold"
                      >
                        <FileText className="w-3.5 h-3.5 text-gold" />
                        <span>ქვითრის ნახვა</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenPayment(fine)}
                        className="btn-stitch-primary px-5 py-2.5 text-xs font-black"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>ქვითრის გადახდა ({fine.discount_expires_days > 0 ? fine.discounted_amount_gel : fine.amount_gel} ₾)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. TICKET PAYMENT MODAL (ქვითრის ონლაინ გადახდა)          */}
      {/* ======================================================== */}
      {selectedFineForPayment && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget && !isProcessingPayment) {
              setSelectedFineForPayment(null);
            }
          }}
          className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#EDF1F7] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-white space-y-5 my-8 cursor-default"
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold text-navy flex items-center justify-center font-bold shadow-md">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-navy">
                    საპატრულო ქვითრის გადახდა
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedFineForPayment.ticket_number || selectedFineForPayment.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFineForPayment(null)}
                className="w-8 h-8 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ticket Summary Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">დარღვევა:</span>
                <span className="font-extrabold text-navy text-right max-w-[240px]">
                  {selectedFineForPayment.violation_type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">ავტომობილი:</span>
                <span className="font-mono font-bold text-navy">
                  {selectedFineForPayment.plate_number}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">ადგილმდებარეობა:</span>
                <span className="text-slate-700 text-right max-w-[220px] truncate">
                  {selectedFineForPayment.location}
                </span>
              </div>

              {/* Points consequence during payment */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-bold">ქულების ცვლილება:</span>
                {selectedFineForPayment.points_deducted && selectedFineForPayment.points_deducted > 0 ? (
                  <span className="font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    -{selectedFineForPayment.points_deducted} ქულა (დარჩება {Math.max(0, driverPoints - selectedFineForPayment.points_deducted)}/100)
                  </span>
                ) : (
                  <span className="font-bold text-blue-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    0 ქულა (ვიდეოჯარიმა)
                  </span>
                )}
              </div>
            </div>

            {/* Payment Amount Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>ჯარიმის საწყისი თანხა:</span>
                <span className="font-mono font-bold text-slate-700">{selectedFineForPayment.amount_gel} ₾</span>
              </div>
              {selectedFineForPayment.discount_expires_days > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>-20% საშეღავათო ფასდაკლება ({selectedFineForPayment.discount_expires_days} დღე):</span>
                  <span className="font-mono">-{selectedFineForPayment.amount_gel - selectedFineForPayment.discounted_amount_gel} ₾</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-500">
                <span>საკომისიო (AutoHub Pay):</span>
                <span className="font-bold text-emerald-600">0.00 ₾ (უფასო)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-navy">სულ გადასახდელი:</span>
                <span className="text-2xl font-black font-mono text-navy">
                  {selectedFineForPayment.discount_expires_days > 0 ? selectedFineForPayment.discounted_amount_gel : selectedFineForPayment.amount_gel} ₾
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">გადახდის მეთოდი</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'card'
                      ? 'bg-navy text-gold shadow-md font-extrabold'
                      : 'neu-btn text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>საბანკო ბარათი</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`p-3 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'applepay'
                      ? 'bg-navy text-gold shadow-md font-extrabold'
                      : 'neu-btn text-slate-600'
                  }`}
                >
                  <span className="text-sm font-black"> Pay</span>
                  <span>Apple / G-Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('tbc')}
                  className={`p-3 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'tbc'
                      ? 'bg-navy text-gold shadow-md font-extrabold'
                      : 'neu-btn text-slate-600'
                  }`}
                >
                  <span className="text-xs font-black">TBC / BOG</span>
                  <span>სწრაფი ბანკინგი</span>
                </button>
              </div>
            </div>

            {/* Card Details (if card method chosen) */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200/80">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">ბარათის ნომერი</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl neu-inset font-mono text-sm text-navy focus:outline-none"
                    placeholder="4127 •••• •••• ••••"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">მოქმედების ვადა</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl neu-inset font-mono text-xs text-navy focus:outline-none"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                      className="w-full px-3.5 py-2 rounded-xl neu-inset font-mono text-xs text-navy focus:outline-none"
                      placeholder="•••"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Note & Pay Button */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit SSL დაცული გადახდა • ოფიციალური police.ge არხი</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFineForPayment(null)}
                  disabled={isProcessingPayment}
                  className="btn-stitch-soft w-1/3 py-3 text-xs font-bold"
                >
                  გაუქმება
                </button>
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment}
                  className="btn-stitch-primary w-2/3 py-3.5 text-xs font-black"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-navy" />
                      <span>მუშავდება...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>ქვითრის გადახდა ({selectedFineForPayment.discount_expires_days > 0 ? selectedFineForPayment.discounted_amount_gel : selectedFineForPayment.amount_gel} ₾)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. OFFICIAL PAYMENT RECEIPT MODAL (ოფიციალური ჩეკი)       */}
      {/* ======================================================== */}
      {receiptFine && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setReceiptFine(null);
            }
          }}
          className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-emerald-500/30 space-y-5 my-8 cursor-default"
          >
            
            {/* Header / Seal */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-navy">
                ქვითარი წარმატებით გადახდილია!
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                საქართველოს შინაგან საქმეთა სამინისტრო • police.ge
              </p>
            </div>

            {/* Official e-Receipt Document Style */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 font-mono text-xs">
              <div className="flex justify-between pb-2 border-b border-dashed border-slate-300">
                <span className="text-slate-400 font-sans">ოქმის / ქვითრის #:</span>
                <span className="font-bold text-navy">{receiptFine.ticket_number || receiptFine.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">ტრანზაქციის ID:</span>
                <span className="font-bold text-slate-700">{receiptFine.payment_receipt?.txn_id || 'TXN-GEO-2026-90812'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">გადახდის თარიღი:</span>
                <span className="text-slate-700">{receiptFine.payment_receipt?.payment_date || receiptFine.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">ავტომობილის ნომერი:</span>
                <span className="font-bold text-navy">{receiptFine.plate_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">გადახდის არხი:</span>
                <span className="text-slate-700">{receiptFine.payment_receipt?.payment_method || 'საბანკო ბარათი (Visa)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">ავტორიზაციის კოდი:</span>
                <span className="text-slate-700">{receiptFine.payment_receipt?.auth_code || 'AUTH-94210'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-dashed border-slate-300 items-baseline">
                <span className="text-slate-700 font-sans font-bold">გადახდილი თანხა:</span>
                <span className="text-xl font-black text-emerald-600">
                  {receiptFine.payment_receipt?.amount_paid || receiptFine.discounted_amount_gel || receiptFine.amount_gel} ₾
                </span>
              </div>
            </div>

            {/* Official Badge Note */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                თანხა ასახულია ხაზინის ერთიან ანგარიშზე. საპატრულო ჯარიმა დახურულია.
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  window.print();
                }}
                className="w-1/2 py-3 rounded-2xl neu-btn text-xs font-bold text-navy flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4 text-gold" />
                <span>ბეჭდვა / PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setReceiptFine(null)}
                className="w-1/2 py-3 rounded-2xl bg-navy text-gold text-xs font-extrabold shadow-md hover:bg-slate-800 transition-all"
              >
                დახურვა
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default FinesModule;
