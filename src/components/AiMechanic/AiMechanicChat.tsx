import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DtcCode, VehicleProfile } from '../../types';
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
  Car
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  dtcCodes: DtcCode[];
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const AiMechanicChat: React.FC<Props> = ({
  vehicle,
  dtcCodes,
  initialPrompt,
  onClearInitialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `მოგესალმებით! მე ვარ თქვენი AutoHub AI პერსონალური მექანიკოსი. ჩემი სისტემა სინქრონიზებულია თქვენი **${vehicle.brand} ${vehicle.model} (${vehicle.year})**-ის ბორტ-კომპიუტერთან.\n\nამჟამად დაფიქსირებულია **${dtcCodes.length} DTC ხარვეზი** (${dtcCodes.map(d => d.code).join(', ')}).\n\nშეგიძლიათ მკითხოთ ნებისმიერი რამ: ნაწილების ფასები, შეკეთების სირთულე, უსაფრთხოა თუ არა გზის გაგრძელება ან სად შეაკეთოთ თბილისსა და რეგიონებში.`,
      timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
        active_dtc: dtcCodes.map(d => ({ code: d.code, title: d.title_ge, severity: d.severity }))
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
    } catch (e) {
      sounds.playAlert();
    } finally {
      setIsLoading(false);
    }
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
    } catch (e) {
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
    <div className="h-[720px] flex flex-col rounded-3xl neu-card shadow-neu-card overflow-hidden relative">
      {/* 1. Header Bar */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full neu-circle flex items-center justify-center font-bold text-navy shadow-sm">
            <Bot className="w-6 h-6 text-gold" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-navy tracking-wide">
                AutoHub AI მექანიკოსი
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold" />
                GPT-4o Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Car className="w-3.5 h-3.5 text-slate-400" />
              <span>{vehicle.brand} {vehicle.model}</span>
              <span>•</span>
              <span className="text-gold font-bold font-mono">{dtcCodes.length} DTC ხარვეზი</span>
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

      {/* 2. Message History Area */}
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

      {/* 3. Quick Prompts Slider */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
        {quickPrompts.map((qp, index) => (
          <button
            key={index}
            onClick={() => handleSendMessage(qp.query)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold neu-btn text-navy hover:text-gold whitespace-nowrap transition-all shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* 4. Chat Input Box */}
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
  );
};
