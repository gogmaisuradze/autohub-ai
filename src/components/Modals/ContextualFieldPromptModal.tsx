import React, { useState, useEffect } from 'react';
import { VehicleProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import { Sparkles, X, Check, Bot, HelpCircle } from 'lucide-react';

export type PromptFieldType =
  | 'plate_number'
  | 'mileage_km'
  | 'engine'
  | 'vin'
  | 'fuel_type'
  | 'tech_passport'
  | 'driver_name'
  | 'driver_phone'
  | 'driver_personal_number';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fieldType: PromptFieldType;
  currentValue: any;
  onSaveField: (field: PromptFieldType, value: any) => void;
  onAskAiToClarify?: (field: PromptFieldType, currentVal?: any) => void;
}

const FIELD_CONFIGS: Record<PromptFieldType, { title: string; hint: string; placeholder: string; inputType: string; presets?: string[] }> = {
  plate_number: {
    title: 'სახელმწიფო ნომრის მითითება',
    hint: 'სახელმწიფო ნომერი აუცილებელია საპატრულო ვიდეოკამერების ჯარიმებისა და -20%-იანი ფასდაკლების ავტომატური შემოწმებისთვის.',
    placeholder: 'მაგ. GE-777-AA ან FR-282-EE',
    inputType: 'text'
  },
  mileage_km: {
    title: 'მიმდინარე გარბენის განახლება',
    hint: 'გარბენი საჭიროა ძრავის ზეთის, სამუხრუჭე ხუნდების, ფილტრებისა და ტექ-დათვალიერების დარჩენილი რესურსის ზუსტად გამოსათვლელად.',
    placeholder: 'მაგ. 78400',
    inputType: 'number'
  },
  engine: {
    title: 'ძრავის სპეციფიკაციის მითითება',
    hint: 'ძრავის მოცულობა და კოდი ეხმარება AI მექანიკოსს DTC შეცდომის კოდების ზუსტ გაშიფვრასა და ნაწილების თავსებადობის დადგენაში.',
    placeholder: 'მაგ. 2.0L Turbo M270 (208 HP)',
    inputType: 'text'
  },
  vin: {
    title: 'VIN შასის კოდის დამატება',
    hint: '17-ნიშნა VIN კოდით AI აგენტი ავტომატურად გაწვდით ორიგინალი ნაწილების კატალოგურ ნომრებსა და ქარხნულ რეკომენდაციებს.',
    placeholder: 'მაგ. WDCTG4GB2GJ193791',
    inputType: 'text'
  },
  fuel_type: {
    title: 'საწვავის ტიპის არჩევა',
    hint: 'განსაზღვრავს ქარხნული ზეთის დაშვებას, გაზომვის პარამეტრებსა და Waze-ის საწვავის ფასებს.',
    placeholder: 'petrol, diesel, hybrid, electric',
    inputType: 'text',
    presets: ['petrol', 'diesel', 'hybrid', 'electric']
  },
  tech_passport: {
    title: 'ტექ-პასპორტის სერია & ნომერი',
    hint: 'ტექ-პასპორტის ნომერი აუცილებელია საპატრულო ვიდეოჯარიმებისა და ტექ-ინსპექტირების (PTI) ბაზასთან 100% ავტომატური სინქრონიზაციისთვის.',
    placeholder: 'მაგ. 22-3999 ან AA1234567',
    inputType: 'text'
  },
  driver_name: {
    title: 'მძღოლის სახელი & გვარი',
    hint: 'გამოიყენება მართვის მოწმობის ციფრული ბარათის, სერვის-ვაუჩერების და სადაზღვევო პოლისის პერსონალიზაციისთვის.',
    placeholder: 'მაგ. გიორგი მაისურაძე',
    inputType: 'text'
  },
  driver_phone: {
    title: 'საკონტაქტო ტელეფონის ნომერი',
    hint: 'ტელეფონის ნომერი საჭიროა სერვისცენტრებიდან დაჯავშნის დადასტურებისა და საგანგაშო შეტყობინებების მისაღებად.',
    placeholder: 'მაგ. +995 599 12 34 56',
    inputType: 'tel'
  },
  driver_personal_number: {
    title: 'მძღოლის პირადი ნომერი (11 ნიშნა)',
    hint: 'პირადი ნომერი აუცილებელია მართვის მოწმობის 100-ქულიანი სისტემის ქულებისა და საპატრულო ჯარიმების ავტომატური კონტროლისთვის.',
    placeholder: 'მაგ. 01024085521',
    inputType: 'text'
  }
};

export const ContextualFieldPromptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  fieldType,
  currentValue,
  onSaveField,
  onAskAiToClarify
}) => {
  const [val, setVal] = useState<string>(currentValue ? String(currentValue) : '');
  const config = FIELD_CONFIGS[fieldType];

  useEffect(() => {
    if (isOpen) {
      setVal(currentValue ? String(currentValue) : '');
    }
  }, [fieldType, currentValue, isOpen]);

  if (!isOpen || !config) return null;

  // Allow closing via Escape key
  useEffect(() => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) return;
    sounds.playSuccess();
    const finalVal = config.inputType === 'number' ? parseInt(val) || 0 : val.trim();
    onSaveField(fieldType, finalVal);
    onClose();
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md neu-surface rounded-3xl p-6 shadow-2xl border border-white animate-in zoom-in-95 cursor-default"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl neu-circle flex items-center justify-center text-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-navy">{config.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy"
          >
            <X size={14} />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed bg-amber-50/80 p-3 rounded-2xl border border-amber-200/60">
          {config.hint}
        </p>

        {config.presets && config.presets.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {config.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setVal(preset)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  val === preset
                    ? 'bg-gold text-navy border-gold shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-gold'
                }`}
              >
                {preset === 'petrol' ? '⛽ ბენზინი' : preset === 'diesel' ? '🛢️ დიზელი' : preset === 'hybrid' ? '🔋 ჰიბრიდი' : preset === 'electric' ? '⚡ ელექტრო' : preset}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type={config.inputType}
              placeholder={config.placeholder}
              value={val}
              onChange={(e) => setVal(fieldType === 'plate_number' || fieldType === 'vin' ? e.target.value.toUpperCase() : e.target.value)}
              autoFocus
              className="w-full px-4 py-3 rounded-2xl neu-inset text-sm font-bold text-navy outline-none tracking-wide"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {onAskAiToClarify ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onAskAiToClarify(fieldType, val);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-navy text-gold text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-all shadow-xs"
                title="AI მექანიკოსს სთხოვეთ მონაცემების გარკვევა"
              >
                <Bot size={14} className="text-gold" />
                <span>🤖 AI დაზუსტება</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-navy transition-all"
              >
                მოგვიანებით
              </button>

              <button
                type="submit"
                disabled={!val.trim()}
                className="px-5 py-2 rounded-xl bg-gold hover:bg-amber-400 disabled:opacity-50 text-navy font-black text-xs shadow-gold-soft flex items-center gap-1.5 transition-all"
              >
                <Check size={14} />
                <span>შენახვა</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContextualFieldPromptModal;
