import React, { useState } from 'react';
import { VehicleProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import { Sparkles, X, Check } from 'lucide-react';

export type PromptFieldType = 'plate_number' | 'mileage_km' | 'engine' | 'vin';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fieldType: PromptFieldType;
  currentValue: any;
  onSaveField: (field: PromptFieldType, value: any) => void;
}

const FIELD_CONFIGS: Record<PromptFieldType, { title: string; hint: string; placeholder: string; inputType: string }> = {
  plate_number: {
    title: 'სახელმწიფო ნომრის მითითება',
    hint: 'სახელმწიფო ნომერი აუცილებელია საპატრულო ვიდეოკამერების ჯარიმებისა და -20%-იანი ფასდაკლების ავტომატური შემოწმებისთვის.',
    placeholder: 'მაგ. GE-777-AA',
    inputType: 'text'
  },
  mileage_km: {
    title: 'მიმდინარე გარბენის განახლება',
    hint: 'გარბენი საჭიროა ძრავის ზეთის, სამუხრუჭე ხუნდების, ფილტრებისა და ტექ-დათვალიერების დარჩენილი რესურსის ზუსტად გამოსათვლელად.',
    placeholder: 'მაგ. 48200',
    inputType: 'number'
  },
  engine: {
    title: 'ძრავის სპეციფიკაციის მითითება',
    hint: 'ძრავის მოცულობა/კოდი ეხმარება AI მექანიკოსს DTC შეცდომის კოდების ზუსტ გაშიფვრასა და ნაწილების თავსებადობის დადგენაში.',
    placeholder: 'მაგ. 2.0L TwinPower Turbo (B48)',
    inputType: 'text'
  },
  vin: {
    title: 'VIN კოდის დამატება',
    hint: '17-ნიშნა VIN კოდით AI აგენტი ავტომატურად გაწვდით ორიგინალი ნაწილების კატალოგურ ნომრებსა და ქარხნულ რეკომენდაციებს.',
    placeholder: 'მაგ. WBA5R1C50NFP12345',
    inputType: 'text'
  }
};

export const ContextualFieldPromptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  fieldType,
  currentValue,
  onSaveField
}) => {
  const [val, setVal] = useState<string>(currentValue ? String(currentValue) : '');
  const config = FIELD_CONFIGS[fieldType];

  if (!isOpen || !config) return null;

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

        <p className="text-xs text-slate-500 mb-4 leading-relaxed bg-amber-50 p-3 rounded-2xl border border-amber-200/60">
          {config.hint}
        </p>

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

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-navy transition-all"
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
        </form>
      </div>
    </div>
  );
};

export default ContextualFieldPromptModal;
