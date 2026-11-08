import React, { useState, useEffect, useRef } from 'react';
import { VehicleProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import {
  X,
  UserCheck,
  ShieldCheck,
  Fingerprint,
  Camera,
  Check,
  AlertTriangle,
  User,
  Sparkles,
  Phone,
  CreditCard,
  Crown,
  UserPlus,
  RefreshCw,
  Award
} from 'lucide-react';
import { PHOTO_AVATARS, renderDriverAvatar } from '../Fines/driverAvatars';
import { DocumentCameraScannerModal, ScannedIdCardData } from './DocumentCameraScannerModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleProfile;
  accountMode: 'owner' | 'visitor';
  onSaveUserData: (data: {
    driver_name: string;
    driver_personal_number: string;
    driver_phone: string;
    driver_photo_url?: string;
    driver_license_points?: number;
  }) => void;
  onToggleAccountMode?: () => void;
  onNewAccount?: () => void;
  lang?: 'ge' | 'en';
}

export const UserAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  vehicle,
  accountMode,
  onSaveUserData,
  onToggleAccountMode,
  onNewAccount,
  lang = 'ge'
}) => {
  const isGe = lang === 'ge';

  const [fullName, setFullName] = useState(vehicle.driver_name || '');
  const [personalNumber, setPersonalNumber] = useState(vehicle.driver_personal_number || '');
  const [phone, setPhone] = useState(vehicle.driver_phone || '');
  const [photoUrl, setPhotoUrl] = useState(vehicle.driver_photo_url || 'avatar_dog');
  const [licensePoints, setLicensePoints] = useState(vehicle.driver_license_points ?? 100);
  const [licenseNumber, setLicenseNumber] = useState('TR-908124');
  const [licenseCategories, setLicenseCategories] = useState('B, B1');
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleScanComplete = (scanned: any) => {
    sounds.playSuccess();
    if (scanned.fullName) setFullName(scanned.fullName);
    if (scanned.personalNumber) setPersonalNumber(scanned.personalNumber);
    if (scanned.phone) setPhone(scanned.phone);
    if (scanned.licenseNumber) setLicenseNumber(scanned.licenseNumber);
    if (scanned.licenseCategories) setLicenseCategories(scanned.licenseCategories);
    if (scanned.photoUrl) setPhotoUrl(scanned.photoUrl);
    setSaveSuccessNotice(false);
  };

  // Synchronize when vehicle or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setFullName(vehicle.driver_name || '');
      setPersonalNumber(vehicle.driver_personal_number || '');
      setPhone(vehicle.driver_phone || '');
      setPhotoUrl(vehicle.driver_photo_url || 'avatar_dog');
      setLicensePoints(vehicle.driver_license_points ?? 100);
      setSaveSuccessNotice(false);
    }
  }, [isOpen, vehicle]);

  // Close on Escape key
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

  // Validation
  const isNameEmpty = !fullName.trim();
  const isPersonalNumberEmpty = !personalNumber.trim();
  const isPhoneEmpty = !phone.trim();
  const isProfileIncomplete = isNameEmpty || isPersonalNumberEmpty || isPhoneEmpty;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sounds.playSuccess();
    onSaveUserData({
      driver_name: fullName.trim(),
      driver_personal_number: personalNumber.trim(),
      driver_phone: phone.trim(),
      driver_photo_url: photoUrl,
      driver_license_points: Number(licensePoints) || 100
    });
    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
      onClose();
    }, 900);
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          sounds.playSuccess();
          setPhotoUrl(event.target.result as string);
          setIsPhotoPickerOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in">
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* 1. AUTHENTIC PASSPORT RIBBON (Georgia Official Header)   */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white px-4 sm:px-6 py-3 border-b border-gold/40 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl select-none">🇬🇪</span>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-wide text-gold flex items-center gap-2 leading-none">
                <span>GEORGIA / საქართველო</span>
                <span className="text-[10px] text-slate-300 font-normal hidden sm:inline">• შსს მომსახურების სააგენტო</span>
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono tracking-wider text-slate-300 font-bold uppercase mt-1">
                {isGe ? 'მძღოლის ბიომეტრიული პროფილი & მართვის მოწმობა' : 'DRIVER BIOMETRIC PROFILE & LICENCE'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border ${
              accountMode === 'owner'
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : 'bg-blue-400/20 text-blue-300 border-blue-400/40'
            }`}>
              {accountMode === 'owner' ? <Crown size={12} className="text-amber-400" /> : <User size={12} className="text-blue-300" />}
              <span className="font-extrabold">{accountMode === 'owner' ? (isGe ? 'მფლობელი' : 'Owner') : (isGe ? 'ვიზიტორი' : 'Guest')}</span>
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

        {/* AI Camera OCR Scanner Action Banner */}
        <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-gradient-to-r from-navy via-slate-900 to-navy text-white flex flex-wrap items-center justify-between gap-2.5 shadow-sm border border-gold/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shrink-0">
              <Camera size={18} />
            </div>
            <div>
              <div className="text-xs font-black text-gold flex flex-wrap items-center gap-1.5">
                <span>{isGe ? 'პირადობის / მართვის მოწმობის AI სკანერი' : 'AI ID & License Scanner'}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 whitespace-nowrap shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OCR LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isGe ? 'გადაუღეთ ფოტო დოკუმენტს და მონაცემები ავტომატურად შეივსება' : 'Take a photo of ID to auto-fill details'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-gold hover:bg-amber-400 text-navy shadow-sm flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Camera size={14} className="stroke-[2.5]" />
            <span>{isGe ? '📸 ფოტოს გადაღება / სკანირება' : '📸 Scan Photo'}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. COMPLETION STATUS NOTICE / CALL TO ACTION             */}
        {/* ======================================================== */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          {saveSuccessNotice ? (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 flex items-center gap-2.5 animate-fade-in shadow-xs">
              <Check size={18} className="text-emerald-600 shrink-0" />
              <div className="text-xs font-bold">
                {isGe ? '✓ მონაცემები წარმატებით შეინახა და სინქრონიზებულია!' : '✓ User data saved and synchronized successfully!'}
              </div>
            </div>
          ) : isProfileIncomplete ? (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-400/80 text-amber-950 flex items-start gap-2.5 shadow-xs animate-pulse">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs font-bold leading-snug">
                <span className="text-amber-900 font-extrabold block mb-0.5">
                  {isGe ? '⚠️ პროფილი შეუვსებელია — გთხოვთ შეავსოთ მონაცემები!' : '⚠️ Profile incomplete — Please fill in your details!'}
                </span>
                <span className="text-slate-700 font-medium text-[11px]">
                  {isGe
                    ? 'საპატრულო ჯარიმების ავტომატური შემოწმებისთვის (police.ge), SMS ქვითრებისა და სერვისების დასაჯავშნად საჭიროა სახელი, პირადი # და ტელეფონი.'
                    : 'Name, Personal ID, and Phone Number are required to verify police fines, receive SMS receipts, and book official services.'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-bold shadow-xs">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>{isGe ? '✅ პროფილი სრულად შევსებულია — სისტემა მზადაა საპატრულო შემოწმებისთვის.' : '✅ Profile complete & verified.'}</span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. MAIN FORM BODY                                        */}
        {/* ======================================================== */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* Top Row: Biometric Avatar & Primary Attributes */}
          <div className="flex flex-row items-start gap-3 sm:gap-5 pb-4 border-b border-slate-100">
            
            {/* Avatar & Photo Picker */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative group">
                <div
                  onClick={() => {
                    sounds.playClick();
                    setIsPhotoPickerOpen(!isPhotoPickerOpen);
                  }}
                  className="w-24 sm:w-28 h-32 sm:h-36 rounded-2xl border-2 border-slate-300 bg-slate-900 overflow-hidden shadow-md flex items-center justify-center relative cursor-pointer transition-all hover:border-gold hover:shadow-lg"
                  title={isGe ? 'ფოტოს შეცვლა' : 'Change photo'}
                >
                  {renderDriverAvatar(photoUrl, 'w-full h-full')}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-navy/70 text-white flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                    <Camera size={18} className="text-gold" />
                    <span>{isGe ? 'შეცვლა' : 'Change'}</span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    sounds.playClick();
                    setIsPhotoPickerOpen(!isPhotoPickerOpen);
                  }}
                  className="absolute -bottom-1 -right-1 bg-navy text-gold p-1.5 rounded-xl border border-gold/40 shadow-xs cursor-pointer hover:scale-110 transition-transform"
                >
                  <Fingerprint size={14} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsPhotoPickerOpen(!isPhotoPickerOpen);
                }}
                className="mt-2 w-full px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold bg-slate-100 text-navy hover:bg-gold/20 hover:text-navy border border-slate-200 transition-all flex items-center justify-center gap-1 whitespace-nowrap"
              >
                <Camera size={12} className="text-gold" />
                <span>{isGe ? 'ფოტოს არჩევა' : 'Select Photo'}</span>
              </button>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomPhotoUpload}
                className="hidden"
              />
            </div>

            {/* Quick Avatar Presets Drawer */}
            {isPhotoPickerOpen && (
              <div className="w-full sm:flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-extrabold text-navy">
                  <span>{isGe ? 'აირჩიეთ ფოტო ან ავატარი:' : 'Choose photo or avatar:'}</span>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="text-[11px] text-gold font-black hover:underline"
                  >
                    {isGe ? '+ ფოტოს ატვირთვა' : '+ Upload Custom'}
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {PHOTO_AVATARS.map((preset) => {
                    const isSelected = photoUrl === preset.id || photoUrl === preset.image;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setPhotoUrl(preset.id);
                          setIsPhotoPickerOpen(false);
                        }}
                        className={`rounded-xl overflow-hidden border-2 p-0.5 transition-all ${
                          isSelected ? 'border-gold ring-2 ring-gold/40 scale-105' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        title={preset.title}
                      >
                        <div className="w-full h-12 rounded-lg overflow-hidden bg-slate-900">
                          <img src={preset.image} alt={preset.title} className="w-full h-full object-cover" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Form Fields: Name, Personal Number */}
            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between mb-1">
                  <span>1. {isGe ? 'სახელი და გვარი (ქართულად)' : 'Full Name (Georgian)'} *</span>
                  {isNameEmpty && <span className="text-amber-600 font-mono text-[10px] font-bold">{isGe ? 'სავალდებულოა' : 'Required'}</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isGe ? 'მაგ: გიორგი მაისურაძე' : 'e.g. Giorgi Maisuradze'}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-navy focus:outline-none transition-all ${
                      isNameEmpty ? 'bg-amber-50/70 border-2 border-amber-300 ring-2 ring-amber-200/50' : 'neu-inset'
                    }`}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between mb-1">
                  <span>4d. {isGe ? 'პირადი ნომერი (11-ნიშნა)' : 'Personal ID (11 digits)'} *</span>
                  {isPersonalNumberEmpty && <span className="text-amber-600 font-mono text-[10px] font-bold">{isGe ? 'სავალდებულოა' : 'Required'}</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={11}
                    value={personalNumber}
                    onChange={(e) => setPersonalNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="01024085432"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-navy focus:outline-none transition-all tracking-wider ${
                      isPersonalNumberEmpty ? 'bg-amber-50/70 border-2 border-amber-300 ring-2 ring-amber-200/50' : 'neu-inset'
                    }`}
                  />
                  <Fingerprint className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Phone & Driving License Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between mb-1">
                <span>{isGe ? 'ტელეფონის ნომერი (SMS)' : 'Phone (SMS)'} *</span>
                {isPhoneEmpty && <span className="text-amber-600 font-mono text-[10px] font-bold">{isGe ? 'სავალდებულოა' : 'Required'}</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+995 599 12 34 56"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-navy focus:outline-none transition-all ${
                    isPhoneEmpty ? 'bg-amber-50/70 border-2 border-amber-300 ring-2 ring-amber-200/50' : 'neu-inset'
                  }`}
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                <span>5. {isGe ? 'მოწმობის #' : 'Licence #'}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="TR-908124"
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-mono font-bold text-navy focus:outline-none uppercase"
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                <span>9. {isGe ? 'მართვის კატეგორიები' : 'Categories'}</span>
              </label>
              <input
                type="text"
                value={licenseCategories}
                onChange={(e) => setLicenseCategories(e.target.value)}
                placeholder="B, B1"
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-bold text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                <span>{isGe ? '100-ქულიანი ბალანსი' : '100-Points Balance'}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={licensePoints}
                  onChange={(e) => setLicensePoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-mono font-black text-navy focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">/ 100</span>
              </div>
            </div>
          </div>

          {/* Account Mode Switcher Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                {isGe ? 'ექაუნთის ტიპი & გარემო' : 'Account Type'}
              </span>
              <div className="text-xs font-black text-navy flex items-center gap-1.5 mt-0.5">
                {accountMode === 'owner' ? (
                  <>
                    <Crown size={14} className="text-gold" />
                    <span>{isGe ? '👑 მფლობელის ექაუნთი (2 მანქანა: Mercedes + BMW)' : '👑 Owner Account (2 Cars)'}</span>
                  </>
                ) : (
                  <>
                    <User size={14} className="text-blue-600" />
                    <span>{isGe ? '👤 სტუმრის / ვიზიტორის ექაუნთი (სუფთა პროფილი)' : '👤 Guest / Visitor Account'}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onToggleAccountMode && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onToggleAccountMode();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-navy border border-slate-300 shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw size={12} className="text-gold" />
                  <span>{accountMode === 'owner' ? (isGe ? 'ვიზიტორზე გადართვა' : 'Switch to Guest') : (isGe ? 'მფლობელზე გადართვა' : 'Switch to Owner')}</span>
                </button>
              )}

              {onNewAccount && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setFullName('');
                    setPersonalNumber('');
                    setPhone('');
                    setPhotoUrl('avatar_dog');
                    onNewAccount();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gold/15 hover:bg-gold/25 text-navy border border-gold/40 flex items-center gap-1.5 transition-all"
                >
                  <Sparkles size={12} className="text-gold" />
                  <span>{isGe ? '✨ ახალი ექაუნთი' : '✨ New Account'}</span>
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

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl text-xs font-black bg-navy hover:bg-slate-800 text-gold shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <Check size={15} className="text-gold stroke-[3]" />
                <span>{isGe ? '💾 მონაცემების შენახვა' : '💾 Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* AI Camera OCR Scanner Modal */}
      <DocumentCameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        docType="id_card"
        onScanComplete={handleScanComplete}
        lang={lang}
      />
    </div>
  );
};

export default UserAccountModal;
