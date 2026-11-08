import React, { useState, useEffect } from 'react';
import { VehicleProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import { GeorgianLicensePlate } from '../ui/GeorgianLicensePlate';
import { DocumentCameraScannerModal, ScannedVehicleData } from './DocumentCameraScannerModal';
import {
  X,
  Car,
  FileText,
  Check,
  Calendar,
  Gauge,
  Flame,
  ShieldCheck,
  Zap,
  Plus,
  Edit3,
  Layers,
  Camera
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleProfile;
  onSaveVehicle: (updatedVehicle: VehicleProfile) => void;
  onOpenAddVehicle?: () => void;
  onOpenGarageTab?: () => void;
  lang?: 'ge' | 'en';
}

export const VehicleAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  vehicle,
  onSaveVehicle,
  onOpenAddVehicle,
  onOpenGarageTab,
  lang = 'ge'
}) => {
  const isGe = lang === 'ge';

  const [brand, setBrand] = useState(vehicle.brand || '');
  const [model, setModel] = useState(vehicle.model || '');
  const [year, setYear] = useState(vehicle.year || 2020);
  const [plateNumber, setPlateNumber] = useState(vehicle.plate_number || '');
  const [vin, setVin] = useState(vehicle.vin || '');
  const [techPassport, setTechPassport] = useState(vehicle.tech_passport || '');
  const [engine, setEngine] = useState(vehicle.engine || '');
  const [horsepower, setHorsepower] = useState(vehicle.horsepower || 200);
  const [mileageKm, setMileageKm] = useState(vehicle.mileage_km || 0);
  const [fuelType, setFuelType] = useState<VehicleProfile['fuel_type']>(vehicle.fuel_type || 'petrol');
  const [lastOilChangeKm, setLastOilChangeKm] = useState(vehicle.last_oil_change_km || 0);
  const [ptiExpiryDate, setPtiExpiryDate] = useState(vehicle.pti_expiry_date || '');
  const [obdIp, setObdIp] = useState(vehicle.obd_ip || '192.168.0.10');
  const [obdPort, setObdPort] = useState(vehicle.obd_port || 35000);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handleScanComplete = (scanned: any) => {
    sounds.playSuccess();
    if (scanned.plateNumber) setPlateNumber(scanned.plateNumber);
    if (scanned.vin) setVin(scanned.vin);
    if (scanned.techPassport) setTechPassport(scanned.techPassport);
    if (scanned.brand) setBrand(scanned.brand);
    if (scanned.model) setModel(scanned.model);
    if (scanned.year) setYear(scanned.year);
    if (scanned.engine) setEngine(scanned.engine);
    if (scanned.horsepower) setHorsepower(scanned.horsepower);
    if (scanned.fuelType) setFuelType(scanned.fuelType);
    setSaveSuccessNotice(false);
  };

  useEffect(() => {
    if (isOpen) {
      setBrand(vehicle.brand || '');
      setModel(vehicle.model || '');
      setYear(vehicle.year || 2020);
      setPlateNumber(vehicle.plate_number || '');
      setVin(vehicle.vin || '');
      setTechPassport(vehicle.tech_passport || '');
      setEngine(vehicle.engine || '');
      setHorsepower(vehicle.horsepower || 200);
      setMileageKm(vehicle.mileage_km || 0);
      setFuelType(vehicle.fuel_type || 'petrol');
      setLastOilChangeKm(vehicle.last_oil_change_km || 0);
      setPtiExpiryDate(vehicle.pti_expiry_date || '');
      setObdIp(vehicle.obd_ip || '192.168.0.10');
      setObdPort(vehicle.obd_port || 35000);
      setSaveSuccessNotice(false);
    }
  }, [isOpen, vehicle]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sounds.playSuccess();
    const updated: VehicleProfile = {
      ...vehicle,
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year) || vehicle.year,
      plate_number: plateNumber.trim().toUpperCase(),
      vin: vin.trim().toUpperCase(),
      tech_passport: techPassport.trim(),
      engine: engine.trim(),
      horsepower: Number(horsepower) || vehicle.horsepower,
      mileage_km: Number(mileageKm) || vehicle.mileage_km,
      fuel_type: fuelType,
      last_oil_change_km: Number(lastOilChangeKm) || vehicle.last_oil_change_km,
      pti_expiry_date: ptiExpiryDate.trim(),
      obd_ip: obdIp.trim(),
      obd_port: Number(obdPort) || vehicle.obd_port
    };
    onSaveVehicle(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
      onClose();
    }, 900);
  };

  const isVehicleIncomplete = !plateNumber.trim() || !vin.trim() || !techPassport.trim();

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* 1. OFFICIAL TECH-PASSPORT RIBBON                         */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white px-4 sm:px-6 py-3 border-b border-gold/40 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl select-none">🇬🇪</span>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-wide text-gold flex items-center gap-2 leading-none">
                <span>GEORGIA / საქართველო</span>
                <span className="text-[10px] text-slate-300 font-normal hidden sm:inline">• სარეგისტრაციო მოწმობა</span>
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono tracking-wider text-slate-300 font-bold uppercase mt-1">
                {isGe ? 'მანქანის ციფრული ექაუნთი & ავტო-პასპორტი' : 'VEHICLE ACCOUNT & REGISTRATION CERTIFICATE'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/20 text-gold border border-gold/40 flex items-center gap-1">
              <FileText size={12} />
              <span>{techPassport || 'AA-000000'}</span>
            </span>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title={isGe ? 'დახურვა' : 'Close'}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. HERO PLATE & STATUS                                   */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-gold">
              <Car size={26} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-navy leading-tight">
                {brand} {model}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {year} • {engine || 'Engine N/A'} • {horsepower} HP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {plateNumber && (
              <GeorgianLicensePlate plate={plateNumber} size="md" variant="white" />
            )}
          </div>
        </div>

        {/* AI Camera OCR Scanner Action Banner */}
        <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-gradient-to-r from-navy via-slate-900 to-navy text-white flex flex-wrap items-center justify-between gap-2.5 shadow-sm border border-gold/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shrink-0">
              <Camera size={18} />
            </div>
            <div>
              <div className="text-xs font-black text-gold flex flex-wrap items-center gap-1.5">
                <span>{isGe ? 'ტექ-პასპორტის & მანქანის AI სკანერი' : 'AI Tech-Passport & Vehicle Scanner'}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 whitespace-nowrap shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OCR LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isGe ? 'გადაუღეთ ფოტო ტექ-პასპორტს ან მანქანას და მონაცემები შეივსება' : 'Take a photo of vehicle doc to auto-fill specs'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-gold hover:bg-amber-400 text-navy shadow-sm flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Camera size={14} className="stroke-[2.5]" />
            <span>{isGe ? '📸 ტექ-პასპორტის სკანირება' : '📸 Scan Tech Doc'}</span>
          </button>
        </div>

        {saveSuccessNotice && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 flex items-center gap-2.5 text-xs font-bold animate-fade-in">
            <Check size={18} className="text-emerald-600 shrink-0" />
            <span>{isGe ? '✓ მანქანის მონაცემები წარმატებით შეინახა!' : '✓ Vehicle details updated successfully!'}</span>
          </div>
        )}

        {isVehicleIncomplete && !saveSuccessNotice && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-300 text-amber-950 flex items-center gap-2 text-xs font-bold">
            <FileText size={16} className="text-amber-600 shrink-0" />
            <span>
              {isGe
                ? '⚠️ ტექ-პასპორტი ან VIN კოდი შეუვსებელია — გთხოვთ მიუთითოთ სრულყოფილი მონაცემები.'
                : '⚠️ VIN or Tech Passport missing — please fill in for full integration.'}
            </span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. EDITABLE VEHICLE FIELDS                               */}
        {/* ======================================================== */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                A. {isGe ? 'მარკა (მწარმოებელი)' : 'Make / Brand'} *
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Mercedes-Benz"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-bold text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                A. {isGe ? 'მოდელი' : 'Model'} *
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="GLA 250"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-bold text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {isGe ? 'სახელმწიფო ნომერი' : 'License Plate'} *
              </label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="FR-282-EE"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-mono font-black text-navy uppercase focus:outline-none tracking-wider"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                B. {isGe ? 'გამოშვების წელი' : 'Model Year'}
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                placeholder="2016"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-mono font-bold text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                E. {isGe ? 'VIN შასის კოდი (17-ნიშნა)' : 'VIN Chassis (17 digits)'} *
              </label>
              <input
                type="text"
                maxLength={17}
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="WDCTG4GB2GJ193791"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-mono font-bold text-navy uppercase focus:outline-none tracking-wider"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {isGe ? 'ტექ-პასპორტის #' : 'Tech Passport #'} *
              </label>
              <input
                type="text"
                value={techPassport}
                onChange={(e) => setTechPassport(e.target.value.toUpperCase())}
                placeholder="22-3999"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-mono font-bold text-navy focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                P.1 {isGe ? 'ძრავის სპეციფიკაცია' : 'Engine Spec'}
              </label>
              <input
                type="text"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                placeholder="2.0L Turbo M270 (208 HP)"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-bold text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {isGe ? 'საწვავის ტიპი' : 'Fuel Type'}
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-bold text-navy focus:outline-none bg-white"
              >
                <option value="petrol">{isGe ? 'ბენზინი (Petrol)' : 'Petrol'}</option>
                <option value="diesel">{isGe ? 'დიზელი (Diesel)' : 'Diesel'}</option>
                <option value="hybrid">{isGe ? 'ჰიბრიდი (Hybrid)' : 'Hybrid'}</option>
                <option value="electric">{isGe ? 'ელექტრო (Electric)' : 'Electric'}</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {isGe ? 'მიმდინარე გარბენი (კმ)' : 'Mileage (km)'}
              </label>
              <input
                type="number"
                value={mileageKm}
                onChange={(e) => setMileageKm(Number(e.target.value))}
                placeholder="78400"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-mono font-bold text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {isGe ? 'ბოლო ზეთის შეცვლა (კმ)' : 'Last Oil Change (km)'}
              </label>
              <input
                type="number"
                value={lastOilChangeKm}
                onChange={(e) => setLastOilChangeKm(Number(e.target.value))}
                placeholder="73200"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-mono font-bold text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {isGe ? 'ტექ-დათვალიერების ვადა (PTI)' : 'PTI Expiry'}
              </label>
              <input
                type="date"
                value={ptiExpiryDate}
                onChange={(e) => setPtiExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-mono font-bold text-navy focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {isGe ? 'OBD-II IP მისამართი & პორტი' : 'OBD-II IP:Port'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={obdIp}
                  onChange={(e) => setObdIp(e.target.value)}
                  placeholder="192.168.0.10"
                  className="flex-1 px-3 py-2.5 rounded-xl neu-inset text-xs font-mono text-navy focus:outline-none"
                />
                <input
                  type="number"
                  value={obdPort}
                  onChange={(e) => setObdPort(Number(e.target.value))}
                  placeholder="35000"
                  className="w-20 px-3 py-2.5 rounded-xl neu-inset text-xs font-mono text-navy focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-bold">
              {isGe ? 'გარაჟი & ავტოპარკი:' : 'Garage & Fleet:'}
            </span>

            <div className="flex items-center gap-2">
              {onOpenGarageTab && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                    onOpenGarageTab();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-navy font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Car size={13} className="text-gold" />
                  <span>{isGe ? 'ჩემი გარაჟის გახსნა' : 'Open My Garage'}</span>
                </button>
              )}

              {onOpenAddVehicle && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                    onOpenAddVehicle();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gold/15 hover:bg-gold/25 text-navy font-bold border border-gold/40 shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus size={13} className="text-gold stroke-[3]" />
                  <span>{isGe ? '+ ახალი მანქანა' : '+ Add Car'}</span>
                </button>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. FOOTER ACTIONS                                        */}
          {/* ======================================================== */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-navy hover:bg-slate-100 transition-colors"
            >
              {isGe ? 'დახურვა' : 'Close'}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-xs font-black bg-navy hover:bg-slate-800 text-gold shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Check size={15} className="text-gold stroke-[3]" />
              <span>{isGe ? '💾 მანქანის მონაცემების შენახვა' : '💾 Save Vehicle Info'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* AI Camera OCR Scanner Modal */}
      <DocumentCameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        docType="tech_passport"
        onScanComplete={handleScanComplete}
        lang={lang}
      />
    </div>
  );
};

export default VehicleAccountModal;
