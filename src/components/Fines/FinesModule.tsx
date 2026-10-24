import React, { useState } from 'react';
import { FineItem, FinePaymentReceipt, VehicleProfile } from '../../types';
import { GeorgianLicensePlate } from '../ui/GeorgianLicensePlate';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
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
  ArrowRight
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  fines: FineItem[];
  onUpdateFines: (fines: FineItem[]) => void;
  onUpdateVehicle: (updated: Partial<VehicleProfile>) => void;
  onNavigateToParking?: () => void;
}

export const FinesModule: React.FC<Props> = ({
  vehicle,
  fines,
  onUpdateFines,
  onUpdateVehicle,
  onNavigateToParking
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [plateInput, setPlateInput] = useState(vehicle.plate_number || 'FR-282-EE');
  const [techPassportInput, setTechPassportInput] = useState(vehicle.tech_passport || '22-3999');
  const [isEditingDocs, setIsEditingDocs] = useState(false);

  // Driver license points & personal info
  const driverPoints = vehicle.driver_license_points ?? 90;
  const driverPersonalNumber = vehicle.driver_personal_number || '01024085521';
  const driverName = vehicle.driver_name || 'გიორგი ბერიძე';
  const [isEditingDriverInfo, setIsEditingDriverInfo] = useState(false);
  const [personalNumberInput, setPersonalNumberInput] = useState(driverPersonalNumber);
  const [driverNameInput, setDriverNameInput] = useState(driverName);
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
      if (res && res.fines && res.fines.length > 0) {
        onUpdateFines(res.fines);
        if (playSound) sounds.playSuccess();
        const nowTime = new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
        setLastAutoSyncedTime(nowTime);
        setAutoSyncNotice(`ჯარიმები ავტომატურად განახლდა (${nowTime})`);
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
  const handleSearchAndPayTicket = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* ======================================================== */}
      {/* 1. UNIFIED DRIVER PROFILE & CIRCULAR POINTS SYSTEM CARD   */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-7 rounded-3xl neu-card shadow-neu-card border border-white space-y-6">
        
        {/* Top Row: User Profile (Left), Circular Points Gauge (Center), Fines & Buttons (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* A. User Profile & Vehicle Documents (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-5 lg:pb-0 lg:pr-5">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-navy via-slate-800 to-navy text-gold flex items-center justify-center shadow-md relative shrink-0">
                <UserCheck className="w-7 h-7 text-gold" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-navy truncate">
                    {driverName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/15 text-navy border border-gold/30 shrink-0">
                    მძღოლი
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  პირადი ნომერი: <span className="font-bold text-navy">{driverPersonalNumber}</span>
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold mt-0.5">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>მართვის მოწმობა: აქტიური (კატეგორია B, B1)</span>
                </div>
              </div>
            </div>

            {/* Vehicle Document Pill */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4 text-gold shrink-0" />
                <div>
                  <div className="text-xs font-black text-navy">{vehicle.brand} {vehicle.model}</div>
                  <div className="text-[10px] text-slate-400 font-mono">ტექ-პასპორტი: {vehicle.tech_passport || '22-3999'}</div>
                </div>
              </div>
              <GeorgianLicensePlate plate={vehicle.plate_number || 'FR-282-EE'} size="sm" variant="white" />
            </div>

            {/* Live Database Status & Edit Trigger */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span>police.ge სინქრონიზაცია ({lastAutoSyncedTime})</span>
              </span>
              <button
                onClick={() => setIsEditingDocs(!isEditingDocs)}
                className="text-gold font-bold hover:underline"
              >
                {isEditingDocs ? 'დახურვა' : 'რედაქტირება'}
              </button>
            </div>
          </div>

          {/* B. Circular Points Radial Gauge (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-5 lg:pb-0 lg:px-3">
            <div className="flex items-center justify-between w-full mb-2 px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award size={14} className="text-gold" />
                <span>ქულების სისტემა (100)</span>
              </span>
              <button
                onClick={() => setShowPointsGuide(!showPointsGuide)}
                className="text-slate-400 hover:text-gold transition-colors"
                title="როგორ მუშაობს ქულები?"
              >
                <Info size={14} />
              </button>
            </div>

            {/* SVG Circular Progress Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center">
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
            <div className="mt-2 text-center space-y-1">
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black border inline-block ${
                driverPoints >= 70
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : driverPoints >= 40
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                {driverPoints >= 70 ? '● უსაფრთხო ზონა' : driverPoints >= 40 ? '● საშუალო რისკი' : '● კრიტიკული ზონა'}
              </span>
              <div className="text-[10px] text-slate-400 font-mono">
                {100 - driverPoints > 0 ? `დაკლებული: -${100 - driverPoints} ქულა` : 'სრული 100 ქულა შენარჩუნებულია'}
              </div>
            </div>
          </div>

          {/* C. Fines Summary, Check Button & Pay Button (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-3 lg:pl-2">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                სულ გადასახდელი:
              </span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-2xl font-black font-mono text-navy">
                  {totalPendingAmount} ₾
                </span>
                {pendingFines.length > 0 ? (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {pendingFines.length} აქტიური
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    სუფთაა
                  </span>
                )}
              </div>
              {pendingFines.some(f => f.discount_expires_days > 0) && (
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                  -20% საშეღავათო ვადა აქტიურია
                </span>
              )}
            </div>

            {/* The Requested Action Buttons: Check & Pay in Stitch Tactile Style */}
            <div className="space-y-2.5">
              {/* 1. შემოწმების ღილაკი */}
              <button
                onClick={handleRefreshFines}
                disabled={isRefreshing}
                className="btn-stitch-soft w-full py-3 px-4 text-xs font-bold"
                title="police.ge ბაზის გადამოწმება"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-gold' : 'text-gold'}`} />
                <span>{isRefreshing ? 'მოწმდება...' : 'შემოწმება (police.ge)'}</span>
              </button>

              {/* 2. გადახდის ღილაკი */}
              <button
                onClick={() => {
                  sounds.playClick();
                  if (pendingFines.length > 0) {
                    setSelectedFineForPayment(pendingFines[0]);
                  }
                }}
                disabled={pendingFines.length === 0}
                className={`w-full py-3.5 px-4 text-xs font-black transition-all ${
                  pendingFines.length > 0
                    ? 'btn-stitch-primary'
                    : 'bg-slate-200 text-slate-400 rounded-full cursor-not-allowed opacity-60 flex items-center justify-center gap-2'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>გადახდა ({totalPendingGel} ₾)</span>
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
        {/* 20% discount alert */}
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
          <div className="p-10 rounded-3xl neu-card text-center flex flex-col items-center justify-center space-y-3.5 border border-white">
            <div className="w-14 h-14 rounded-full neu-circle flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-navy">საპატრულო ჯარიმები არ ფიქსირდება!</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              თქვენს ავტომობილზე ({vehicle.plate_number}) საპატრულო პოლიციის ბაზაში დარღვევები არ იძებნება.
            </p>
            <button
              onClick={handleRefreshFines}
              disabled={isRefreshing}
              className="btn-stitch-primary px-5 py-2.5 text-xs font-black flex items-center gap-2 mt-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'მოწმდება...' : 'police.ge ბაზის ხელახალი შემოწმება'}</span>
            </button>
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
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-[#EDF1F7] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-white space-y-5 my-8">
            
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
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-emerald-500/30 space-y-5 my-8">
            
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
