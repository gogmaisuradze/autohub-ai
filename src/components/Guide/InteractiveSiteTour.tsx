import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { sounds } from '../../services/soundEffects';
import { TabType } from '../Navigation';
import {
  Bot,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Compass,
  Car,
  Layers,
  Activity,
  ShieldAlert,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  requiredTab?: TabType;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'vehicle-profile',
    targetSelector: '[data-tour="header-vehicle"]',
    title: 'ავტომობილის პროფილი & გარაჟი',
    subtitle: 'GARAGE & VEHICLE SWITCHER',
    badge: '1 / 7',
    description: 'აქ ჩანს თქვენი არჩეული ავტომობილი. დაწკაპუნებით შეგიძლიათ გადართოთ მანქანები, შეცვალოთ სახელმწიფო ნომერი, გარბენი ან დაამატოთ ახალი ავტომობილი გარაჟში.',
    icon: Car,
    requiredTab: 'home'
  },
  {
    id: 'navigation-menu',
    targetSelector: '[data-tour="navigation-menu"]',
    title: 'ნავიგაციის მენიუ & განყოფილებები',
    subtitle: 'MAIN NAVIGATION BAR',
    badge: '2 / 7',
    description: 'მთავარი მენიუს ღილაკებით მყისიერად გადადიხართ ნებისმიერ განყოფილებაზე: მთავარი, OBD დიაგნოსტიკა, საპატრულო ჯარიმები, პარკინგი, სერვის-დღიური, რადარების რუკა და მეტი.',
    icon: Compass,
    requiredTab: 'home'
  },
  {
    id: 'cover-banner',
    targetSelector: '[data-tour="cover-banner"]',
    title: 'ციფრული სერვისების ქავერ-ბანერი',
    subtitle: '7 DIGITAL SERVICES & GLAMOUR COVERS',
    badge: '3 / 7',
    description: 'AutoHub-ის 7 ძირითადი ციფრული სერვისი თემატური ავტო-ფოტოებითა და ცოცხალი ვიჯეტებით. ზედა ღილაკებით შეგიძლიათ სწრაფად გადართოთ სერვისები და გახსნათ შესაბამისი მოდული.',
    icon: Layers,
    requiredTab: 'home'
  },
  {
    id: 'orbit-carousel',
    targetSelector: '[data-tour="orbit-carousel"]',
    title: 'სერვისების ორბიტალური მართვა',
    subtitle: 'INTERACTIVE ORBIT TRACK',
    badge: '4 / 7',
    description: 'დაატრიალეთ სერვისების მოცულობითი ბურთები, ცენტრალურ ფანჯარაში იხილეთ სტატუსი და გადადით შესაბამის მოდულში ღილაკით "გადასვლა".',
    icon: Sparkles,
    requiredTab: 'home'
  },
  {
    id: 'department-cards',
    targetSelector: '[data-tour="department-cards"]',
    title: 'განყოფილებების ბარათები & სტატუსი',
    subtitle: 'DEPARTMENT HUBS & SHORTCUTS',
    badge: '5 / 7',
    description: 'თქვენი ავტომობილის ცოცხალი მონაცემები: Check Engine შეცდომების რაოდენობა, გადასახდელი საპატრულო ჯარიმები 20%-იანი ფასდაკლებით და ძრავის ზეთის დარჩენილი რესურსი.',
    icon: ShieldAlert,
    requiredTab: 'home'
  },
  {
    id: 'obd-status',
    targetSelector: '[data-tour="obd-status"]',
    title: 'OBD-II ადაპტერის დაკავშირება',
    subtitle: 'BLUETOOTH / WI-FI SCANNER',
    badge: '6 / 7',
    description: 'ამ ღილაკით აკავშირებთ Bluetooth ან Wi-Fi ELM327 ადაპტერს. ჩართვისას ინდიკატორი მწვანედ აინთება და პირდაპირ ამოიკითხავს შეცდომებს.',
    icon: Activity,
    requiredTab: 'home'
  },
  {
    id: 'ai-floating-widget',
    targetSelector: '[data-tour="ai-floating-widget"]',
    title: 'AI მექანიკოსი & ასისტენტი 24/7',
    subtitle: '24/7 SMART AUTO ASSISTANT',
    badge: '7 / 7',
    description: 'თქვენი პერსონალური ხელოვნური ინტელექტი: დააჭირეთ ქვედა მარჯვენა ღილაკს ნებისმიერ დროს, ჰკითხეთ ნაწილების ფასები, შეცდომების მიზეზები და მიიღეთ რჩევები ქართულად!',
    icon: Bot,
    requiredTab: 'home'
  }
];

interface Props {
  onNavigateTab: (tab: TabType) => void;
  externalTrigger?: number;
}

export const InteractiveSiteTour: React.FC<Props> = ({
  onNavigateTab,
  externalTrigger
}) => {
  // State: Cloud Bot Prompt (ღრუბლის ფანჯარა ბოტი)
  const [isCloudPromptOpen, setIsCloudPromptOpen] = useState(false);
  
  // State: Google-style Interactive Tour
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  // Trigger initial Cloud Bot after 1.5s delay if not dismissed in this session
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('autohub_cloud_guide_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsCloudPromptOpen(true);
        }, 1400);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Respond to manual external triggers (e.g. from Header help button)
  useEffect(() => {
    if (externalTrigger && externalTrigger > 0) {
      startTour();
    }
  }, [externalTrigger]);

  const startTour = useCallback(() => {
    sounds.playSuccess();
    setIsCloudPromptOpen(false);
    setIsCompletedModalOpen(false);
    setCurrentStepIndex(0);
    setIsTourActive(true);
    onNavigateTab('home');
  }, [onNavigateTab]);

  const dismissCloudPrompt = () => {
    sounds.playClick();
    setIsCloudPromptOpen(false);
    try {
      sessionStorage.setItem('autohub_cloud_guide_dismissed', 'true');
    } catch {}
  };

  const closeTour = () => {
    sounds.playClick();
    setIsTourActive(false);
    setTargetRect(null);
  };

  // Update target element's bounding rectangle on step change, resize, or scroll
  const updateTargetRect = useCallback(() => {
    if (!isTourActive) return;

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      // If target element is not found on screen, fallback
      setTargetRect(null);
    }
  }, [isTourActive, currentStepIndex]);

  // Handle scroll to element when step changes
  useEffect(() => {
    if (!isTourActive) return;

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    if (step.requiredTab) {
      onNavigateTab(step.requiredTab);
    }

    // Give DOM time to update before scrolling & bounding
    const timeout = setTimeout(() => {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Recalculate after scroll finishes
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
        }, 350);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isTourActive, currentStepIndex, onNavigateTab]);

  // Recalculate position on scroll & resize
  useEffect(() => {
    if (!isTourActive) return;

    const handleScrollOrResize = () => {
      updateTargetRect();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize);
    };
  }, [isTourActive, updateTargetRect]);

  const handleNext = () => {
    sounds.playClick();
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Completed all steps!
      completeTour();
    }
  };

  const handlePrev = () => {
    sounds.playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const completeTour = () => {
    sounds.playSuccess();
    setIsTourActive(false);
    setTargetRect(null);
    setIsCompletedModalOpen(true);

    try {
      sessionStorage.setItem('autohub_cloud_guide_dismissed', 'true');
      localStorage.setItem('autohub_tour_completed', 'true');
    } catch {}

    // Confetti celebration!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep?.icon || Sparkles;

  // Calculate Popover Position (Google-style smart tooltip positioning)
  const getPopoverStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      };
    }

    const popoverWidth = Math.min(360, window.innerWidth - 32);
    const popoverHeight = 260;
    const margin = 16;

    // Center horizontally on target, clamped within viewport
    let left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - popoverWidth - 16));

    // Place below if space permits; otherwise place above
    let top = targetRect.bottom + margin;
    if (top + popoverHeight > window.innerHeight - 20) {
      top = Math.max(20, targetRect.top - popoverHeight - margin);
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
      zIndex: 9999
    };
  };

  return (
    <>
      {/* 1. INITIAL CLOUD BOT PROMPT (ღრუბლის ფანჯარა ბოტი) */}
      <AnimatePresence>
        {isCloudPromptOpen && !isTourActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] select-none"
          >
            {/* Cloud Speech Bubble Container */}
            <div className="relative rounded-3xl p-5 sm:p-6 bg-white/98 backdrop-blur-2xl border-2 border-gold/50 shadow-[0_20px_50px_rgba(20,33,61,0.22)] text-navy">
              
              {/* Header with Bot Mascot & Close Button */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {/* Floating Animated Robot Mascot */}
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy to-navy-700 text-gold flex items-center justify-center shadow-md relative border border-gold/30 shrink-0"
                  >
                    <Bot size={26} />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold"></span>
                    </span>
                  </motion.div>

                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/15 text-gold border border-gold/30">
                      AutoHub AI გიდი
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-navy mt-0.5 tracking-tight flex items-center gap-1.5">
                      <span>გამარჯობა!</span>
                      <span className="inline-block animate-bounce">👋</span>
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={dismissCloudPrompt}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-navy flex items-center justify-center transition-colors border border-slate-200"
                  title="დახურვა"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Bot Question / Cloud Text */}
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-4">
                მე ვარ თქვენი პერსონალური ასისტენტი. გსურთ დაგეხმაროთ საიტში გარკვევაში და გაჩვენოთ ყველა სერვისი, ღილაკი და ფანჯარა?
              </p>

              {/* Action Buttons: "არა, მადლობა" vs "დიახ, დავიწყოთ!" */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={dismissCloudPrompt}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-navy text-xs font-bold transition-all text-center"
                >
                  არა, მადლობა
                </button>

                <button
                  type="button"
                  onClick={startTour}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-xs font-black shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>დავიწყოთ!</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Speech Cloud Pointer Tail (pointing downward right) */}
              <div className="absolute -bottom-3 right-8 w-6 h-6 bg-white border-r-2 border-b-2 border-gold/50 transform rotate-45 shadow-sm"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. GOOGLE-STYLE INTERACTIVE WALKTHROUGH OVERLAY */}
      {isTourActive && currentStep && (
        <>
          {/* Full-Screen Darkened Spotlight Mask SVG */}
          <svg className="fixed inset-0 w-full h-full pointer-events-none z-[9985]">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                {targetRect && (
                  <rect
                    x={targetRect.left - 8}
                    y={targetRect.top - 8}
                    width={targetRect.width + 16}
                    height={targetRect.height + 16}
                    rx={18}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(15, 23, 42, 0.72)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Interactive Backdrop Clickcatcher to avoid accidental outside interactions */}
          <div
            className="fixed inset-0 z-[9986]"
            onClick={closeTour}
          />

          {/* Glowing Animated Golden Laser Border Around Target Element */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'fixed',
                left: `${targetRect.left - 8}px`,
                top: `${targetRect.top - 8}px`,
                width: `${targetRect.width + 16}px`,
                height: `${targetRect.height + 16}px`,
                borderRadius: '18px',
                zIndex: 9988
              }}
              className="border-2 border-gold shadow-[0_0_25px_rgba(252,163,17,0.85)] pointer-events-none animate-pulse"
            />
          )}

          {/* Floating Explanation Card (Google-style Popover Card) */}
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            style={getPopoverStyle()}
            className="rounded-3xl p-4 sm:p-5 bg-white/98 backdrop-blur-2xl border-2 border-gold shadow-2xl text-navy pointer-events-auto"
          >
            {/* Popover Header: Step Indicator, Category Badge & Skip Button */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold text-slate-950 shadow-xs">
                  {currentStep.badge}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {currentStep.subtitle}
                </span>
              </div>

              <button
                type="button"
                onClick={closeTour}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-navy flex items-center justify-center transition-colors"
                title="ტურიდან გასვლა"
              >
                <X size={13} />
              </button>
            </div>

            {/* Step Title with Icon */}
            <div className="flex items-center gap-2 my-1.5">
              <div className="w-8 h-8 rounded-xl bg-navy text-gold flex items-center justify-center shrink-0 shadow-xs">
                <StepIcon size={16} />
              </div>
              <h3 className="text-sm sm:text-base font-black text-navy leading-snug">
                {currentStep.title}
              </h3>
            </div>

            {/* Step Explanation */}
            <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed my-2.5">
              {currentStep.description}
            </p>

            {/* Progress Dots Indicator */}
            <div className="flex items-center justify-center gap-1.5 py-1 mb-2">
              {TOUR_STEPS.map((s, idx) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-6 bg-gold'
                      : idx < currentStepIndex
                      ? 'w-2 bg-navy/60'
                      : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons: [ Back ] & [ Next / Finish ] */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  currentStepIndex === 0
                    ? 'opacity-30 cursor-not-allowed text-slate-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-navy'
                }`}
              >
                <ArrowLeft size={13} />
                <span>უკან</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeTour}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
                >
                  გამოტოვება
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-xs font-black shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'დასრულება 🎉' : 'შემდეგი'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* 3. TOUR COMPLETED CELEBRATION MODAL */}
      <AnimatePresence>
        {isCompletedModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full rounded-3xl p-6 bg-white text-navy shadow-2xl border-2 border-gold text-center relative"
            >
              <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto mb-3 border border-gold/40 shadow-md">
                <Sparkles size={32} />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-emerald-100 text-emerald-800">
                ტური წარმატებით დასრულდა
              </span>

              <h3 className="text-xl font-black text-navy mt-2">
                გილოცავთ! თქვენ მზად ხართ 🚀
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed my-3">
                თქვენ გაეცანით AutoHub-ის ყველა ძირითად ფუნქციას, ფანჯარასა და ღილაკს. ნებისმიერ დროს შეგიძლიათ ხელახლა ჩართოთ ტური საიტის ზედა მენიუდან.
              </p>

              <button
                type="button"
                onClick={() => setIsCompletedModalOpen(false)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-sm font-black shadow-lg hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                დავიწყოთ მუშაობა!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InteractiveSiteTour;
