import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DtcCode, FineItem, ServiceBookingItem, ServiceItem, VehicleProfile } from '../../types';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Car,
  Calendar,
  Clock,
  Building2,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Printer,
  ChevronDown,
  ChevronUp,
  Wrench,
  ShieldCheck,
  Droplets,
  Plus
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  dtcCodes: DtcCode[];
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  activeBooking?: ServiceBookingItem | null;
  onUpdateBooking?: (updated: ServiceBookingItem) => void;
  allBookings?: ServiceBookingItem[];
  onOpenBookingModal?: () => void;
  services?: ServiceItem[];
  fines?: FineItem[];
}

export const AiMechanicChat: React.FC<Props> = ({
  vehicle,
  dtcCodes,
  initialPrompt,
  onClearInitialPrompt,
  activeBooking,
  onUpdateBooking,
  allBookings = [],
  onOpenBookingModal,
  services = [],
  fines = []
}) => {
  // Accumulated data calculations
  const oilService = services.find(s => s.variant_key === 'engine_oil' || s.title_ge.toLowerCase().includes('ზეთ'));
  const oilHealthPct = oilService ? oilService.health_percentage : 30;
  const ptiService = services.find(s => s.variant_key === 'pti' || s.category === 'legal');
  const pendingFines = fines.filter(f => f.status === 'pending');

  // Currently focused booking (either prop activeBooking or first pending from allBookings)
  const currentBooking = activeBooking || allBookings.find(b => b.status === 'pending' || b.status === 'clarified_by_ai') || allBookings[0] || null;

  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(() => {
    return currentBooking ? currentBooking.status === 'confirmed' : false;
  });
  const [confirmedVoucherCode, setConfirmedVoucherCode] = useState<string>(() => {
    return currentBooking?.voucher_code || `AH-${Math.floor(1000 + Math.random() * 9000)}-TGT`;
  });
  const [isVoucherExpanded, setIsVoucherExpanded] = useState<boolean>(true);

  // Generate initial greeting message
  const getInitialMessages = (): ChatMessage[] => {
    const msgs: ChatMessage[] = [
      {
        id: 'welcome',
        sender: 'assistant',
        text: `მოგესალმებით! მე ვარ თქვენი AutoHub AI პერსონალური მექანიკოსი. ჩემი სისტემა სინქრონიზებულია თქვენი **${vehicle.brand} ${vehicle.model} (${vehicle.year})**-ის ბორტ-კომპიუტერთან.\n\nამჟამად დაფიქსირებულია **${dtcCodes.length} DTC ხარვეზი** (${dtcCodes.map(d => d.code).join(', ')}).\n\nშეგიძლიათ მკითხოთ ნებისმიერი რამ: ნაწილების ფასები, შეკეთების სირთულე, უსაფრთხოა თუ არა გზის გაგრძელება ან სად შეაკეთოთ თბილისსა და რეგიონებში.`,
        timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })
      }
    ];

    if (currentBooking) {
      msgs.push({
        id: 'booking-clarification-init',
        sender: 'assistant',
        text: `📋 **ახალი ჯავშნის AI დაზუსტება:**\nმივიღე თქვენი ჯავშანი **${currentBooking.provider_name}**-ში, თარიღი: **${currentBooking.booking_date} ${currentBooking.booking_time}**.\n\n` +
          `თქვენი **${vehicle.brand} ${vehicle.model}**-ის მოგროვებული ბორტ-მონაცემების ანალიზი:\n` +
          `• ⚠️ **აქტიური DTC კოდები (${dtcCodes.length}):** ${dtcCodes.map(d => `${d.code} (${d.title_ge})`).join(', ') || 'არ ფიქსირდება'}.\n` +
          `• 🛢️ **ძრავის ზეთის რესურსი:** დარჩენილია **${oilHealthPct}%** (Motul 5W-30).\n` +
          `• 🚗 **მიმდინარე გარბენი:** ${vehicle.mileage_km.toLocaleString()} კმ.\n\n` +
          `💡 **AI რეკომენდაცია:** რადგან სერვისცენტრში უკვე დაჯავშნილი გაქვთ ვიზიტი, რეკომენდირებულია ერთდროულად ჩატარდეს კომპიუტერული დიაგნოსტიკა + აალების სანთლების შემოწმება და ძრავის ზეთის შეცვლა. ეს დაგიზოგავთ დროს და სერვისცენტრში მოგანიჭებთ კომპლექსურ ფასდაკლებას.`,
        timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })
      });
    }

    return msgs;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState<boolean>(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '💰 რა ჯდება ამ დეტალების შეცვლა?', query: 'რა ჯდება ამ დეტალების შეცვლა თბილისის ბაზარზე ნაწილებით და ხელობით?' },
    { label: '⚠️ რამდენად საშიშია ეს ხარვეზები?', query: 'რამდენად საშიშია ეს ხარვეზები და შეიძლება თუ არა მოძრაობის გაგრძელება?' },
    { label: '🔧 რა ნაწილები უნდა ვიყიდო?', query: 'კონკრეტულად რა სათადარიგო ნაწილები უნდა შევიძინო მაღაზიაში?' },
    { label: '📍 სად მირჩევთ შეკეთებას?', query: 'სად მირჩევთ სანდო ხელოსანს ან სერვისცენტრს თბილისში?' }
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // When activeBooking changes, sync confirmation status and trigger AI review
  useEffect(() => {
    if (currentBooking) {
      setBookingConfirmed(currentBooking.status === 'confirmed');
      if (currentBooking.voucher_code) {
        setConfirmedVoucherCode(currentBooking.voucher_code);
      }
    }
  }, [currentBooking]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || isLoading) return;

    sounds.playClick();
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const carContext = {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        engine: vehicle.engine,
        mileage: vehicle.mileage_km,
        vin: vehicle.vin,
        active_dtc: dtcCodes.map(d => ({ code: d.code, title: d.title_ge, severity: d.severity })),
        booking: currentBooking ? {
          provider: currentBooking.provider_name,
          date: currentBooking.booking_date,
          time: currentBooking.booking_time,
          status: currentBooking.status
        } : null,
        oil_health: oilHealthPct,
        fines_count: pendingFines.length
      };

      const res = await n8nService.sendChatMessage(textToSend, carContext);
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
      sounds.playSuccess();
    } catch {
      sounds.playAlert();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmFullBookingPackage = (isFullBundle: boolean = true) => {
    sounds.playSuccess();
    const voucher = currentBooking?.voucher_code || `AH-TGT-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingConfirmed(true);
    setConfirmedVoucherCode(voucher);

    const cost = isFullBundle ? 370 : 180;
    const noteText = isFullBundle
      ? 'AI დაზუსტება: სრული კომპლექსური პაკეტი (დიაგნოსტიკა, სვეჩების შემოწმება, Motul 5W-30 ზეთი). გაცემულია ციფრული ვაუჩერი.'
      : 'AI დაზუსტება: მხოლოდ დიაგნოსტიკა და სენსორის შეკეთება.';

    if (currentBooking && onUpdateBooking) {
      onUpdateBooking({
        ...currentBooking,
        status: 'confirmed',
        voucher_code: voucher,
        estimated_cost_gel: cost,
        ai_clarification_notes: noteText
      });
    }

    // Add confirmation message to chat
    const confirmMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'assistant',
      text: `🎉 **ჯავშანი წარმატებით დადასტურდა და გაიცა ციფრული საგზური!**\n\n` +
        `• **სერვისცენტრი:** ${currentBooking?.provider_name || 'თეგეტა მოტორსი'}\n` +
        `• **თარიღი და დრო:** ${currentBooking?.booking_date || 'ხვალ'} ${currentBooking?.booking_time || '11:00'}\n` +
        `• **ვაუჩერის კოდი:** \`${voucher}\`\n` +
        `• **ჯამური სავარაუდო ხარჯი:** ~${cost} ₾\n` +
        `• **ავტომობილი:** ${vehicle.brand} ${vehicle.model} (${vehicle.plate_number})\n\n` +
        `სერვისცენტრში მისვლისას წარადგინეთ ვაუჩერის კოდი ან QR ბარათი. ოსტატს თქვენი მანქანის ტელემეტრიული მონაცემები უკვე გადაეცა!`,
      timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, confirmMsg]);
  };

  const toggleSpeechRecognition = () => {
    sounds.playClick();
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('თქვენს ბრაუზერს არ აქვს ხმოვანი შეყვანის მხარდაჭერა (Web Speech API).');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ka-GE';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    sounds.playClick();
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ka-GE';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Active Booking & AI Clarification Card (Top Banner) */}
      {currentBooking ? (
        <div className="p-5 rounded-3xl neu-card shadow-neu-card border border-white space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-navy to-slate-800 text-gold flex items-center justify-center shadow-md">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-navy tracking-tight">
                    {currentBooking.title_ge}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                    bookingConfirmed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {bookingConfirmed ? (
                      <>
                        <CheckCircle size={11} className="text-emerald-600" />
                        დადასტურებულია & გაცემულია ვაუჩერი
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} className="text-amber-600" />
                        AI დაზუსტების რეჟიმში
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-navy">{currentBooking.provider_name}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-700 font-bold">{currentBooking.booking_date} {currentBooking.booking_time}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">მძღოლი: {currentBooking.driver_name} ({currentBooking.plate_number})</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVoucherExpanded(!isVoucherExpanded)}
                className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-navy flex items-center gap-1.5 hover:text-gold"
              >
                <span>{isVoucherExpanded ? 'შემოკლება' : 'დეტალები'}</span>
                {isVoucherExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {onOpenBookingModal && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenBookingModal();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-navy flex items-center gap-1 shadow-xs"
                >
                  <Plus size={14} className="text-gold" />
                  <span>ახალი ჯავშანი</span>
                </button>
              )}
            </div>
          </div>

          {/* Expanded AI Clarification & Telemetry Cross-check */}
          {isVoucherExpanded && (
            <div className="space-y-4">
              {/* Accumulated data indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Car size={13} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">მანქანა & გარბენი</span>
                  </div>
                  <div className="text-xs font-bold text-navy truncate">{vehicle.brand} {vehicle.model}</div>
                  <div className="text-[11px] font-mono text-slate-500">{vehicle.mileage_km.toLocaleString()} კმ</div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-2 text-rose-500 mb-1">
                    <AlertTriangle size={13} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">DTC ხარვეზები</span>
                  </div>
                  <div className="text-xs font-bold text-rose-600">{dtcCodes.length} აქტიური კოდი</div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    {dtcCodes.map(d => d.code).join(', ') || 'არ არის'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Droplets size={13} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">ზეთის რესურსი</span>
                  </div>
                  <div className="text-xs font-bold text-navy">{oilHealthPct}% დარჩენილი</div>
                  <div className="text-[11px] text-slate-500">Motul 5W-30</div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <ShieldCheck size={13} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">საგზური / Pass</span>
                  </div>
                  <div className="text-xs font-mono font-black text-navy">{confirmedVoucherCode}</div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    {bookingConfirmed ? 'აქტიურია' : 'მოლოდინში'}
                  </div>
                </div>
              </div>

              {/* Digital Service Voucher (if confirmed) */}
              {bookingConfirmed ? (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-navy via-slate-900 to-navy text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-48 bg-gold/10 pointer-events-none transform skew-x-12"></div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold text-navy shadow-sm">
                          SMART SERVICE PASS
                        </span>
                        <span className="text-xs font-mono text-white/70">#{confirmedVoucherCode}</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-white">
                        {currentBooking.provider_name}
                      </h4>
                      <p className="text-xs text-slate-300">
                        დაჯავშნილი დრო: <strong className="text-gold font-mono">{currentBooking.booking_date} {currentBooking.booking_time}</strong>
                        {' '}• მანქანა: <strong className="text-white">{vehicle.brand} ({vehicle.plate_number})</strong>
                      </p>
                      <p className="text-[11px] text-white/80 max-w-xl">
                        {currentBooking.ai_clarification_notes || 'სრული კომპლექსური პაკეტი: კომპიუტერული დიაგნოსტიკა, სვეჩების შემოწმება & ზეთის შეცვლა.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="p-2.5 rounded-2xl bg-white text-navy flex flex-col items-center justify-center shadow-lg">
                        <QrCode size={48} className="text-navy" />
                        <span className="text-[9px] font-mono font-bold mt-1 text-slate-600">SCAN AT GATE</span>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playClick();
                          window.print();
                        }}
                        className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex flex-col items-center justify-center"
                        title="ვაუჩერის ბეჭდვა / შენახვა"
                      >
                        <Printer size={18} />
                        <span className="text-[9px] mt-1 font-bold">ბეჭდვა</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Action Confirmation Banner */
                <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-extrabold text-navy flex items-center gap-1.5">
                      <Sparkles size={15} className="text-gold" />
                      <span>AI რეკომენდაცია: გააერთიანეთ დიაგნოსტიკა და ზეთის შეცვლა</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      O2 სენსორის (P0133) & Misfire-ის (P0300) შეკეთებასთან ერთად ზეთის (30% დარჩენილი) შეცვლით მიიღებთ 15% ფასდაკლებას.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConfirmFullBookingPackage(false)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-navy border border-slate-300 font-bold transition-all text-xs"
                    >
                      მხოლოდ დიაგნოსტიკა (~180 ₾)
                    </button>

                    <button
                      onClick={() => handleConfirmFullBookingPackage(true)}
                      className="px-4 py-2 rounded-xl bg-gold hover:bg-amber-400 text-navy font-black shadow-gold-soft transition-all text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} />
                      <span>სრული პაკეტის დადასტურება (~370 ₾)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* If no booking exists yet, prompt user that they can book */
        <div className="p-4 rounded-3xl neu-card shadow-neu-card border border-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-circle text-gold flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-navy text-sm">
                დაჯავშნეთ ვიზიტი ავტო-ექიმთან ან სერვისცენტრში
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                აირჩიეთ კალენდარში სასურველი დრო და AI ბოტი მოგროვებული მონაცემებით დააზუსტებს ვიზიტს.
              </p>
            </div>
          </div>

          {onOpenBookingModal && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenBookingModal();
              }}
              className="px-4 py-2 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black shadow-gold-soft flex items-center gap-1.5 transition-all text-xs"
            >
              <Calendar size={14} />
              <span>📅 ჩაწერა / ჯავშნის გაფორმება</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Main Chat Container */}
      <div className="h-[500px] sm:h-[620px] flex flex-col rounded-3xl neu-card shadow-neu-card overflow-hidden relative border border-white">
        
        {/* Header Bar */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full neu-circle flex items-center justify-center font-bold text-navy shadow-sm shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-navy tracking-wide">
                  AutoHub AI მექანიკოსი
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold" />
                  AI PRO
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-1 mt-0.5">
                <span>{vehicle.brand} {vehicle.model}</span>
                <span>•</span>
                <span className="text-gold font-bold font-mono">{dtcCodes.length} DTC ხარვეზი</span>
                <span>•</span>
                <span className="text-slate-400 font-mono">{vehicle.mileage_km.toLocaleString()} კმ</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={() => speakText('')}
                className="p-2 rounded-full neu-circle text-rose-500 animate-pulse"
                title="ხმის გაჩერება"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}
            <div className="px-3 py-1 rounded-full text-xs font-bold neu-inset text-navy">
              ქართული ენა
            </div>
          </div>
        </div>

        {/* Message History Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#EDF1F7]/50">
          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isMe
                    ? 'bg-navy text-white shadow-md'
                    : 'neu-circle text-navy'
                }`}>
                  {isMe ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-gold" />}
                </div>

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 shadow-sm ${
                  isMe
                    ? 'bg-navy text-white rounded-tr-none'
                    : 'neu-card text-navy rounded-tl-none'
                }`}>
                  <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </div>

                  <div className={`flex items-center justify-between mt-2 pt-1 border-t text-[10px] ${
                    isMe ? 'border-white/10 text-white/60' : 'border-slate-100 text-slate-400'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {!isMe && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-gold transition-colors flex items-center gap-1 font-semibold"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>წაკითხვა</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full neu-circle flex items-center justify-center">
                <Bot className="w-4 h-4 text-gold animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl neu-card text-slate-600 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-slate-500 ml-1">მექანიკოსი აანალიზებს ბორტ-მონაცემებს...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts Slider / Pre-made answers */}
        {showQuickPrompts ? (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] text-slate-400 font-bold shrink-0">მზა კითხვები:</span>
              {quickPrompts.map((qp, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(qp.query)}
                  className="px-3 py-1 rounded-full text-xs font-bold neu-btn text-navy hover:text-gold whitespace-nowrap transition-all shrink-0 shadow-2xs"
                >
                  {qp.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowQuickPrompts(false)}
              className="text-[10px] text-slate-400 hover:text-navy px-1.5 py-0.5 rounded-md hover:bg-slate-200 shrink-0 font-bold transition-all"
              title="მზა კითხვების დამალვა"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="px-4 py-1 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={() => setShowQuickPrompts(true)}
              className="text-[10px] text-slate-500 hover:text-gold font-bold transition-all flex items-center gap-1"
            >
              <span>+ მზა კითხვების გამოჩენა</span>
            </button>
          </div>
        )}

        {/* Chat Input Box */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={toggleSpeechRecognition}
            className={`w-11 h-11 rounded-full neu-circle flex items-center justify-center transition-all ${
              isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-navy hover:text-gold'
            }`}
            title="ხმოვანი შეტყობინება"
          >
            {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="კითხეთ მექანიკოსს ქართულად..."
            className="flex-1 px-4 py-3 rounded-2xl neu-inset text-sm text-navy placeholder-slate-400 focus:outline-none"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold transition-all ${
              input.trim() && !isLoading
                ? 'bg-gold hover:bg-amber-400 text-navy shadow-gold-soft hover:scale-105 active:scale-95'
                : 'neu-btn text-slate-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};
