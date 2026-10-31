import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Camera,
  Trash2,
  Sparkles,
  Check,
  Edit3,
  Calendar,
  CreditCard,
  User,
  RefreshCw
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

export interface DriverLicenseData {
  firstName: string;
  lastName: string;
  personalNumber: string;
  licenseNumber: string;
  birthDate: string;
  birthPlace: string;
  issueDate: string;
  expiryDate: string;
  categories: string[];
  points: number;
  photo: string | null;
}

export const DEFAULT_DRIVER_LICENSE: DriverLicenseData = {
  firstName: 'გიორგი',
  lastName: 'მაისურაძე',
  personalNumber: '01024085432',
  licenseNumber: 'AA 849201',
  birthDate: '15.08.1994',
  birthPlace: 'GEORGIA',
  issueDate: '12.05.2022',
  expiryDate: '12.05.2032',
  categories: ['B', 'B1', 'AM'],
  points: 100,
  photo: null
};

export const AVAILABLE_CATEGORIES = [
  { id: 'AM', label: 'AM (მოპედი)', icon: '🛵' },
  { id: 'A', label: 'A (მოტოციკლი)', icon: '🏍️' },
  { id: 'B', label: 'B (მსუბუქი)', icon: '🚗' },
  { id: 'B1', label: 'B1 (კვადროციკლი)', icon: '🏎️' },
  { id: 'C', label: 'C (სატვირთო)', icon: '🚛' },
  { id: 'C1', label: 'C1 (მცირე სატვირთო)', icon: '🚐' },
  { id: 'D', label: 'D (ავტობუსი)', icon: '🚌' },
  { id: 'D1', label: 'D1 (მიკროავტობუსი)', icon: '🚐' },
  { id: 'T', label: 'T/S (ტრაქტორი/სპეც)', icon: '🚜' }
];

export function getStoredDriverLicense(): DriverLicenseData {
  try {
    const raw = localStorage.getItem('autohub_driver_license');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const photo = localStorage.getItem('autohub_driver_photo') || parsed.photo || null;
        return {
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          personalNumber: parsed.personalNumber || '',
          licenseNumber: parsed.licenseNumber || 'AA 849201',
          birthDate: parsed.birthDate || '15.08.1994',
          birthPlace: parsed.birthPlace || 'GEORGIA',
          issueDate: parsed.issueDate || '12.05.2022',
          expiryDate: parsed.expiryDate || '12.05.2032',
          categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : ['B', 'B1', 'AM'],
          points: typeof parsed.points === 'number' ? parsed.points : 100,
          photo
        };
      }
    }

    // Fallback: check autohub_vehicle_profile
    const vRaw = localStorage.getItem('autohub_vehicle_profile');
    const photo = localStorage.getItem('autohub_driver_photo');
    if (vRaw) {
      const v = JSON.parse(vRaw);
      const fullName = (v.driver_name || '').trim();
      const parts = fullName.split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      const personalNumber = v.driver_personal_number || '';
      const points = typeof v.driver_license_points === 'number' ? v.driver_license_points : 100;
      const vPhoto = photo || (typeof v.driver_photo_url === 'string' && v.driver_photo_url.startsWith('data:') ? v.driver_photo_url : null);

      if (firstName || personalNumber) {
        return {
          firstName: firstName || 'გიორგი',
          lastName: lastName || 'მაისურაძე',
          personalNumber: personalNumber || '01024085432',
          licenseNumber: personalNumber ? `AA ${personalNumber.slice(0, 6)}` : 'AA 849201',
          birthDate: '15.08.1994',
          birthPlace: 'GEORGIA',
          issueDate: '12.05.2022',
          expiryDate: '12.05.2032',
          categories: ['B', 'B1', 'AM'],
          points,
          photo: vPhoto
        };
      }
    }
  } catch (err) {
    console.error('Error reading driver license from storage', err);
  }

  // Blank initial state for visitors who haven't filled yet
  return {
    firstName: '',
    lastName: '',
    personalNumber: '',
    licenseNumber: 'AA 849201',
    birthDate: '15.08.1994',
    birthPlace: 'GEORGIA',
    issueDate: '12.05.2022',
    expiryDate: '12.05.2032',
    categories: ['B', 'B1', 'AM'],
    points: 100,
    photo: null
  };
}

export function saveDriverLicense(data: DriverLicenseData) {
  try {
    localStorage.setItem('autohub_driver_license', JSON.stringify(data));

    if (data.photo) {
      localStorage.setItem('autohub_driver_photo', data.photo);
    } else {
      localStorage.removeItem('autohub_driver_photo');
    }

    // Sync to vehicle profile so all other modules (Fines, Parking, Garage) stay updated
    try {
      const vRaw = localStorage.getItem('autohub_vehicle_profile');
      let v = vRaw ? JSON.parse(vRaw) : {};
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      v = {
        ...v,
        driver_name: fullName,
        driver_personal_number: data.personalNumber,
        driver_license_points: data.points,
        driver_photo_url: data.photo || v.driver_photo_url
      };
      localStorage.setItem('autohub_vehicle_profile', JSON.stringify(v));
    } catch {}

    window.dispatchEvent(new CustomEvent('autohub-driver-updated', { detail: data }));
    window.dispatchEvent(new Event('autohub-vehicle-updated'));
  } catch (err) {
    console.error('Error saving driver license to storage', err);
  }
}

interface DriverLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (data: DriverLicenseData) => void;
}

export const DriverLicenseModal: React.FC<DriverLicenseModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [formData, setFormData] = useState<DriverLicenseData>(getStoredDriverLicense);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData(getStoredDriverLicense());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ფოტოს ზომა არ უნდა აღემატებოდეს 5 MB-ს');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setFormData(prev => ({ ...prev, photo: base64 }));
      sounds.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, photo: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    sounds.playClick();
  };

  const toggleCategory = (catId: string) => {
    sounds.playClick();
    setFormData(prev => {
      const exists = prev.categories.includes(catId);
      const next = exists
        ? prev.categories.filter(c => c !== catId)
        : [...prev.categories, catId];
      return { ...prev, categories: next.length > 0 ? next : [catId] };
    });
  };

  const handleFillSample = () => {
    sounds.playClick();
    setFormData({
      ...DEFAULT_DRIVER_LICENSE,
      photo: formData.photo || null
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    saveDriverLicense(formData);
    setSaveSuccess(true);
    if (onSaved) onSaved(formData);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const isComplete = Boolean(formData.firstName && formData.lastName && formData.personalNumber);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-[2.5rem] bg-gradient-to-b from-slate-900 via-navy to-slate-950 text-white border-2 border-gold/40 shadow-2xl p-5 sm:p-8 space-y-6 my-auto overflow-hidden ring-1 ring-gold/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle Ambient Background Watermarks */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-gold text-slate-950 flex items-center justify-center font-black shadow-lg shadow-gold/20 shrink-0">
              🪪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  საქართველოს შსს მომსახურების სააგენტო
                </span>
                <span className="text-[10px] font-bold text-emerald-400 hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>ოფიციალური ფორმატი</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                ციფრული მართვის მოწმობის შევსება & მართვა
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
            aria-label="დახურვა"
          >
            <X size={18} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* AUTHENTIC GEORGIAN DRIVER'S LICENSE DIGITAL CARD PREVIEW */}
        {/* ======================================================== */}
        <div className="relative z-10 rounded-3xl bg-gradient-to-br from-[#182645] via-[#101b33] to-[#0b1326] border-2 border-gold/50 shadow-2xl p-5 sm:p-6 overflow-hidden">
          {/* Card Guilloche / Watermark Pattern */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-[0.06] pointer-events-none select-none flex items-center justify-end pr-4">
            <svg width="240" height="200" viewBox="0 0 240 200" fill="none">
              <circle cx="120" cy="100" r="90" stroke="currentColor" strokeWidth="4" strokeDasharray="6 6" />
              <circle cx="120" cy="100" r="60" stroke="#f59e0b" strokeWidth="3" />
              <path d="M40 100 Q120 20 200 100 Q120 180 40 100 Z" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          </div>

          {/* Top Bar of the Driver's License Card */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded-md bg-white border border-slate-300 shadow-sm flex items-center justify-center font-black text-xs text-rose-600 font-mono tracking-wider">
                🇬🇪 GE
              </div>
              <div>
                <span className="text-[11px] font-mono font-black text-gold uppercase tracking-widest block">
                  საქართველო • GEORGIA
                </span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider block">
                  მართვის მოწმობა / DRIVING LICENCE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Check size={11} className="stroke-[3]" />
                <span>მოქმედი • ACTIVE</span>
              </span>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-black bg-gradient-to-r from-amber-400 to-gold text-slate-950 shadow-xs">
                {formData.points} / 100 ქულა
              </span>
            </div>
          </div>

          {/* Card Main Body: Photo + Real Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Photo Column */}
            <div className="sm:col-span-4 flex flex-col items-center text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-36 rounded-2xl bg-slate-950/80 border-2 border-gold/60 hover:border-gold cursor-pointer relative overflow-hidden group shadow-lg flex flex-col items-center justify-center transition-all"
                title="დააჭირეთ ფოტოს ასატვირთად"
              >
                {formData.photo ? (
                  <>
                    <img
                      src={formData.photo}
                      alt="Driver Portrait"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                      <Camera size={20} className="text-gold" />
                      <span className="text-[9px] font-bold text-white">შეცვლა</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center hover:bg-rose-500 transition-colors shadow-xs"
                      title="ფოტოს წაშლა"
                    >
                      <Trash2 size={11} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl text-gold mb-1 group-hover:scale-110 transition-transform">
                      👤
                    </div>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1">
                      <Camera size={11} />
                      <span>+ ფოტო</span>
                    </span>
                    <span className="text-[8px] text-slate-400 mt-0.5">ატვირთვა</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              <div className="text-[10px] font-mono text-slate-400 mt-2">
                №: <strong className="text-gold">{formData.licenseNumber || 'AA 849201'}</strong>
              </div>

              {/* Category Badges */}
              <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
                {formData.categories.map(cat => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-gold/20 text-gold border border-gold/40"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Official Information Columns */}
            <div className="sm:col-span-8 space-y-2.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">1. გვარი / Surname</span>
                  <span className="text-xs sm:text-sm font-black text-white truncate block">
                    {formData.lastName || '—'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">2. სახელი / Name</span>
                  <span className="text-xs sm:text-sm font-black text-white truncate block">
                    {formData.firstName || '—'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">3. დაბადების თარიღი</span>
                  <span className="text-xs font-bold text-slate-200 block">
                    {formData.birthDate || '15.08.1994'} • {formData.birthPlace}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">7. პირადი ნომერი / PIN</span>
                  <span className="text-xs sm:text-sm font-black text-amber-300 block">
                    {formData.personalNumber || '— — — — — — — — — — —'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">4a. გაცემა</span>
                  <span className="text-xs font-bold text-slate-300 block">{formData.issueDate}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">4b. მოქმედებს</span>
                  <span className="text-xs font-bold text-emerald-400 block">{formData.expiryDate}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold">4c. გამცემი: შსს მომსახურების სააგენტო</span>
                <span className="text-gold font-bold">100-ქულიანი ბალანსი: {formData.points}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FORM FIELDS FOR EDITING / FILLING                        */}
        {/* ======================================================== */}
        <form onSubmit={handleSave} className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <Edit3 size={15} className="text-gold" />
              <span>მძღოლის მონაცემების რედაქტირება</span>
            </h3>

            <button
              type="button"
              onClick={handleFillSample}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20 transition-colors"
            >
              <Sparkles size={12} />
              <span>⚡ ნიმუშის შევსება</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* First Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                სახელი <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="მაგ: გიორგი"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/20 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                გვარი <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="მაგ: მაისურაძე"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/20 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            {/* Personal Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                პირადი ნომერი (11 ციფრი) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  maxLength={11}
                  placeholder="01024085432"
                  value={formData.personalNumber}
                  onChange={e => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setFormData({ ...formData, personalNumber: cleaned });
                  }}
                  className="w-full rounded-xl bg-white/10 border border-white/20 pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-slate-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* License Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                მოწმობის № (სერია/ნომერი)
              </label>
              <input
                type="text"
                placeholder="AA 849201"
                value={formData.licenseNumber}
                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-xs text-white font-mono placeholder-slate-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                დაბადების თარიღი
              </label>
              <input
                type="text"
                placeholder="15.08.1994"
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-xs text-white font-mono placeholder-slate-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>

            {/* License Points */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                100-ქულიანი ბალანსი: <strong className="text-gold">{formData.points}</strong> / 100
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={formData.points}
                onChange={e => setFormData({ ...formData, points: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-white/20 rounded-lg mt-2"
              />
            </div>
          </div>

          {/* Categories Selector Strip */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-slate-300 block">
              აქტიური კატეგორიები (დააწკაპუნეთ ასარჩევად):
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CATEGORIES.map(cat => {
                const isSelected = formData.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-gold-soft font-black ring-1 ring-amber-400/50'
                        : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.id}</span>
                    {isSelected && <Check size={11} className="stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-colors"
            >
              გაუქმება
            </button>

            <button
              type="submit"
              disabled={saveSuccess}
              className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-gold to-amber-500 hover:from-amber-300 hover:to-gold text-slate-950 text-xs font-black shadow-gold-soft flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-amber-300"
            >
              {saveSuccess ? (
                <>
                  <Check size={16} className="stroke-[3] text-emerald-950" />
                  <span>შენახულია & ასახულია!</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-slate-950" />
                  <span>შენახვა & ბარათზე ასახვა</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverLicenseModal;
