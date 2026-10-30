import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DtcCode, VehicleProfile } from '../../types';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import { TabType } from '../Navigation';
import {
  Bot,
  X,
  Send,
  Maximize2,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Zap
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  dtcCodes: DtcCode[];
  onOpenFullChat: (tab: TabType) => void;
  onOpenBookingModal?: () => void;
  lang?: 'ge' | 'en';
}

interface MiniMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const FloatingMechanicWidget: React.FC<Props> = ({
  vehicle,
  dtcCodes,
  onOpenFullChat,
  onOpenBookingModal,
  lang = 'ge'
}) => {
  const isGe = lang === 'ge';
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<MiniMessage[]>([]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    sounds.playClick();
    const userMsg: MiniMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await n8nService.askAiMechanic(textToSend, vehicle, dtcCodes);
      sounds.playSuccess();
      const aiReply: MiniMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply || (isGe ? 'გასაგებია. გირჩევთ დიაგნოსტიკის ჩატარებას.' : 'Understood. Diagnostic check recommended.'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      sounds.playClick();
      const fallbackText = dtcCodes.length > 0
        ? (isGe
            ? `თქვენს ${vehicle.brand}-ზე სკანირებული კოდები (${dtcCodes.map(c => c.code).join(', ')}) საჭიროებს შემოწმებას. სავარაუდო ხარჯი თბილისში ~${dtcCodes.reduce((s, c) => s + (c.estimated_cost_gel || 120), 0)} ₾-ია.`
            : `Codes (${dtcCodes.map(c => c.code).join(', ')}) on your ${vehicle.brand} require inspection.`)
        : (isGe
            ? `თქვენს ${vehicle.brand}-ზე სკანირების შედეგად შეცდომები არ ფიქსირდება, სისტემა სუფთაა.`
            : `Systems clean on your ${vehicle.brand}.`);

      const fallbackReply: MiniMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = isGe
    ? ['ჩეკის მიზეზი?', 'რა ჯდება შეკეთება?', 'შეიძლება სიარული?']
    : ['Check Engine cause?', 'Repair cost?', 'Safe to drive?'];

  if (isDismissed) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 font-sans">
        <button
          onClick={() => {
            sounds.playSuccess();
            setIsDismissed(false);
            setIsOpen(true);
          }}
          className="relative w-12 h-12 rounded-full bg-navy text-gold shadow-xl border border-gold/70 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group ai-lightning-btn overflow-hidden"
          title={isGe ? 'AI მექანიკოსის გამოჩენა' : 'Open AI Mechanic'}
        >
          {/* Subtle lightning sweep flash */}
          <div className="ai-lightning-flash" />
          
          <Bot size={22} className="relative z-10 text-gold group-hover:rotate-12 transition-transform" />
          <Zap size={11} className="absolute -bottom-0.5 -right-0.5 text-gold fill-gold z-20 animate-bounce" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-navy z-20 animate-pulse"></span>
        </button>
      </div>
    );
  }

  return (
    <div data-tour="ai-floating-widget" className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 font-sans">
      <AnimatePresence mode="wait">
        {/* 1. COLLAPSED FLOATING PILL BUTTON */}
        {!isOpen && (
          <motion.div
            key="collapsed-pill"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative flex items-center gap-1.5"
          >
            <button
              onClick={() => {
                sounds.playSuccess();
                setIsOpen(true);
              }}
              className="group relative overflow-hidden btn-stitch-ai px-4 py-3 shadow-xl border border-gold/70 z-10 ai-lightning-btn"
              title={isGe ? 'AI მექანიკოსის ფანჯარა' : 'AI Mechanic Window'}
            >
              {/* Soft Shimmer Layer */}
              <div className="ai-lightning-flash" />

              <div className="relative z-10 flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-navy/90 flex items-center justify-center text-gold shadow-sm group-hover:scale-110 transition-transform border border-gold/40">
                    <Bot size={18} className="drop-shadow-xs" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-navy animate-pulse"></span>
                  <Zap size={10} className="absolute -bottom-1 -left-1 text-gold fill-gold animate-bounce" />
                </div>

                <div className="text-left hidden min-[360px]:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-tight text-white group-hover:text-gold transition-colors flex items-center gap-1">
                      <span>{isGe ? 'AI მექანიკოსი' : 'AI Mechanic'}</span>
                      <Zap size={13} className="text-gold fill-gold animate-pulse" />
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-gold/20 text-gold border border-gold/50 shadow-xs">
                      24/7
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-200 font-bold">
                    {dtcCodes.length > 0
                      ? (isGe ? `${dtcCodes.length} ხარვეზი • ონლაინ` : `${dtcCodes.length} issues • Online`)
                      : (isGe ? '⚡ ონლაინ AI კონსულტაცია' : '⚡ Live AI Advice')}
                  </p>
                </div>
              </div>
            </button>

            {/* Dismiss button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick();
                setIsDismissed(true);
              }}
              className="w-7 h-7 rounded-full bg-white/95 hover:bg-white text-slate-400 hover:text-rose-600 shadow-md border border-slate-200/80 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              title={isGe ? 'გათიშვა / დამალვა' : 'Close / Hide'}
            >
              <X size={13} />
            </button>
          </motion.div>
        )}

        {/* 2. EXPANDED FLOATING CHAT WINDOW */}
        {isOpen && (
          <motion.div
            key="expanded-chat"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="w-[310px] min-[400px]:w-[340px] sm:w-[370px] rounded-3xl neu-card bg-white shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[78vh]"
          >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-navy via-slate-900 to-navy text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gold border border-gold/40">
                  <Bot size={18} />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-navy animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight">
                    {isGe ? 'AI მექანიკოსი' : 'AI Mechanic'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-gold text-navy">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  {vehicle.brand} {vehicle.model} • 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenFullChat('ai');
                }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-gold hover:bg-white/10 transition-colors"
                title={isGe ? 'სრული ჩატის გახსნა' : 'Open Full Chat'}
              >
                <Maximize2 size={14} />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title={isGe ? 'დაკეცვა' : 'Minimize'}
              >
                <ChevronDown size={16} />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsOpen(false);
                  setIsDismissed(true);
                }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-white/10 transition-colors"
                title={isGe ? 'გათიშვა' : 'Close / Turn off'}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Issue Bar */}
          {dtcCodes.length > 0 && (
            <div className="px-3 py-1.5 bg-rose-50 border-b border-rose-100 flex items-center justify-between text-[11px] text-rose-700">
              <span className="flex items-center gap-1.5 font-bold">
                <AlertTriangle size={12} className="text-rose-500" />
                <span>{dtcCodes.length} {isGe ? 'DTC ხარვეზი' : 'DTC errors'}</span>
              </span>
              <button
                onClick={() => handleSendMessage(isGe ? 'ამიხსენი ეს შეცდომები დეტალურად' : 'Explain these DTC errors in detail')}
                className="text-[10px] font-bold text-rose-800 underline hover:text-rose-900"
              >
                {isGe ? 'ანალიზი' : 'Analyze'}
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="p-3 overflow-y-auto space-y-2.5 max-h-[300px] sm:max-h-[340px] bg-slate-50/70 text-xs no-scrollbar">
            {messages.length === 0 && !loading && (
              <div className="py-4 px-2 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gold/15 text-navy flex items-center justify-center mx-auto">
                  <Bot size={20} className="text-navy" />
                </div>
                <h5 className="font-extrabold text-xs text-navy">
                  {dtcCodes.length > 0
                    ? `სკანერმა იპოვა ${dtcCodes.length} DTC ხარვეზი`
                    : 'სკანირების შედეგი: სისტემა სუფთაა'}
                </h5>
                <p className="text-[11px] text-slate-500">
                  {dtcCodes.length > 0
                    ? 'დასვით კითხვა ან გაუშვით სკანირებული ხარვეზების ანალიზი n8n-ში:'
                    : 'შეიძლება დაგისვათ კითხვა ავტომობილის მოვლაზე ან სერვისზე:'}
                </p>
                <div className="flex flex-col gap-1.5 pt-1">
                  {dtcCodes.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSendMessage(`გამარჯობა, სკანერმა ამოაგდო კოდები: ${dtcCodes.map(c => c.code).join(', ')}. ამიხსენი დეტალურად მიზეზები და ხარჯი.`)}
                        className="w-full py-2 px-3 rounded-xl bg-gold text-navy font-black text-[11px] shadow-xs hover:bg-amber-400 transition-all text-left flex items-center justify-between"
                      >
                        <span>⚡ სკანირების ანალიზი</span>
                        <ArrowRight size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendMessage('რა ჯდება ამ დეტალების შეცვლა თბილისში?')}
                        className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-navy font-bold text-[11px] hover:bg-slate-100 transition-all text-left"
                      >
                        💰 შეკეთების ხარჯი
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendMessage('რა პროფილაქტიკურ რჩევებს მომცემთ მანქანის მოვლისთვის?')}
                      className="w-full py-2 px-3 rounded-xl bg-navy text-gold font-bold text-[11px] hover:bg-slate-800 transition-all text-center"
                    >
                      🚗 პროფილაქტიკური რჩევები
                    </button>
                  )}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2.5 rounded-2xl max-w-[88%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-navy text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-navy rounded-tl-xs shadow-xs border border-slate-200/70'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
                  {m.time}
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white text-slate-500 text-xs shadow-xs w-fit">
                <Sparkles size={13} className="text-gold animate-spin" />
                <span>{isGe ? 'მექანიკოსი აანალიზებს...' : 'Mechanic analyzing...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-gold/15 text-slate-700 hover:text-navy border border-slate-200 shrink-0 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isGe ? 'ჰკითხეთ მექანიკოსს...' : 'Ask the mechanic...'}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy focus:outline-none focus:border-gold bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="w-8 h-8 rounded-xl bg-gold hover:bg-amber-400 disabled:opacity-50 text-navy flex items-center justify-center transition-all shadow-sm shrink-0 active:scale-95"
            >
              <Send size={14} />
            </button>
          </form>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
