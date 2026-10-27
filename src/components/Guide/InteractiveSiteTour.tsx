import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { sounds } from '../../services/soundEffects';
import { TabType } from '../Navigation';
import {
  Bot,
  Zap,
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
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
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
    const el = document.querySelector(TOUR_STEPS[0].targetSelector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
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
    }
  }, [isTourActive, currentStepIndex]);

  // Handle smooth element transitions when step changes
  useEffect(() => {
    if (!isTourActive) return;

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    if (step.requiredTab) {
      onNavigateTab(step.requiredTab);
    }

    // Try measuring element immediately
    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      const inView = rect.top >= 60 && rect.bottom <= (window.innerHeight - 60);
      if (!inView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Smoothly track while page scrolls
        const interval = setInterval(() => {
          const r = el.getBoundingClientRect();
          setTargetRect(r);
        }, 40);
        setTimeout(() => clearInterval(interval), 450);
      }
    } else {
      // Fallback if tab content needs a moment to mount
      const timer = setTimeout(() => {
        const delayedEl = document.querySelector(step.targetSelector);
        if (delayedEl) {
          setTargetRect(delayedEl.getBoundingClientRect());
          delayedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isTourActive, currentStepIndex, onNavigateTab]);

  // Recalculate position on scroll & resize smoothly
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

  // Calculate Popover Position with smooth coordinates
  const getPopoverCoords = () => {
    const popoverWidth = Math.min(360, window.innerWidth - 32);
    if (!targetRect) {
      return {
        top: Math.max(20, window.innerHeight / 2 - 130),
        left: Math.max(16, window.innerWidth / 2 - popoverWidth / 2),
        width: popoverWidth
      };
    }

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
      top,
      left,
      width: popoverWidth
    };
  };

  const popoverCoords = getPopoverCoords();

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
            <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/90 backdrop-blur-2xl border-2 border-gold shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white">
              
              {/* Header with Bot Mascot & Close Button */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {/* Floating Animated Robot Mascot */}
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy to-navy-700 text-gold flex items-center justify-center shadow-md relative border border-gold/40 shrink-0 ai-lightning-btn overflow-hidden"
                  >
                    <div className="ai-lightning-flash" />
                    <Bot size={26} className="relative z-10" />
                    <Zap size={12} className="absolute -bottom-1 -left-1 text-gold fill-gold animate-bounce z-20" />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold"></span>
                    </span>
                  </motion.div>

                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/20 text-gold border border-gold/40">
                      AutoHub AI გიდი
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight flex items-center gap-1.5">
                      <span>გამარჯობა!</span>
                      <span className="inline-block animate-bounce">👋</span>
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={dismissCloudPrompt}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/20"
                  title="დახურვა"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Bot Question / Cloud Text */}
              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed mb-4">
                მე ვარ თქვენი პერსონალური ასისტენტი. გსურთ დაგეხმაროთ საიტში გარკვევაში და გაჩვენოთ ყველა სერვისი, ღილაკი და ფანჯარა?
              </p>

              {/* Action Buttons: "არა, მადლობა" vs "დიახ, დავიწყოთ!" */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/15">
                <button
                  type="button"
                  onClick={dismissCloudPrompt}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all text-center border border-white/15"
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
              <div className="absolute -bottom-3 right-8 w-6 h-6 bg-slate-900 border-r-2 border-b-2 border-gold transform rotate-45 shadow-sm"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. GOOGLE-STYLE INTERACTIVE WALKTHROUGH OVERLAY */}
      {isTourActive && currentStep && (
        <>
          {/* Full-Screen Darkened Spotlight Mask SVG with Smooth Spring Transition */}
          <svg className="fixed inset-0 w-full h-full pointer-events-none z-[9985]">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <motion.rect
                  initial={false}
                  animate={{
                    x: targetRect ? targetRect.left - 8 : window.innerWidth / 2 - 100,
                    y: targetRect ? targetRect.top - 8 : window.innerHeight / 2 - 50,
                    width: targetRect ? targetRect.width + 16 : 200,
                    height: targetRect ? targetRect.height + 16 : 100,
                    opacity: targetRect ? 1 : 0
                  }}
                  transition={{
                    type: 'spring',
                    damping: 32,
                    stiffness: 240,
                    mass: 0.8
                  }}
                  rx={18}
                  fill="black"
                />
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

          {/* Smooth Gliding Golden Halo Border Around Target Element */}
          <motion.div
            initial={false}
            animate={{
              x: targetRect ? targetRect.left - 8 : 0,
              y: targetRect ? targetRect.top - 8 : 0,
              width: targetRect ? targetRect.width + 16 : 0,
              height: targetRect ? targetRect.height + 16 : 0,
              opacity: targetRect ? 1 : 0
            }}
            transition={{
              type: 'spring',
              damping: 32,
              stiffness: 240,
              mass: 0.8
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              borderRadius: '18px',
              zIndex: 9988
            }}
            className="border-2 border-gold shadow-[0_0_20px_rgba(252,163,17,0.55)] pointer-events-none"
          />

          {/* Floating Explanation Card (Smoothly Gliding Card with Cross-Fading Content) */}
          <motion.div
            initial={false}
            animate={{
              top: popoverCoords.top,
              left: popoverCoords.left,
              width: popoverCoords.width,
              opacity: targetRect ? 1 : 0
            }}
            transition={{
              type: 'spring',
              damping: 32,
              stiffness: 240,
              mass: 0.8
            }}
            style={{
              position: 'fixed',
              zIndex: 9999
            }}
            className="rounded-3xl p-5 bg-slate-900/90 backdrop-blur-2xl border-2 border-gold shadow-[0_25px_60px_rgba(0,0,0,0.65)] text-white pointer-events-auto"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {/* Popover Header: Step Indicator, Category Badge & Skip Button */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold text-slate-950 shadow-xs">
                      {currentStep.badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                      {currentStep.subtitle}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={closeTour}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/20"
                    title="ტურიდან გასვლა"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Step Title with Icon */}
                <div className="flex items-center gap-2.5 my-2">
                  <div className="w-9 h-9 rounded-xl bg-gold/20 text-gold flex items-center justify-center shrink-0 border border-gold/40 shadow-xs">
                    <StepIcon size={18} />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug drop-shadow-sm">
                    {currentStep.title}
                  </h3>
                </div>

                {/* Step Explanation */}
                <p className="text-xs sm:text-[13.5px] text-slate-100 font-medium leading-relaxed my-2.5 drop-shadow-sm">
                  {currentStep.description}
                </p>

                {/* Progress Dots Indicator */}
                <div className="flex items-center justify-center gap-1.5 py-1 mb-2">
                  {TOUR_STEPS.map((s, idx) => (
                    <span
                      key={s.id}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentStepIndex
                          ? 'w-6 bg-gold shadow-[0_0_8px_rgba(252,163,17,0.7)]'
                          : idx < currentStepIndex
                          ? 'w-2 bg-gold/60'
                          : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons: [ Back ] & [ Next / Finish ] */}
                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/15">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      currentStepIndex === 0
                        ? 'opacity-30 cursor-not-allowed text-slate-500'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30'
                    }`}
                  >
                    <ArrowLeft size={13} />
                    <span>უკან</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={closeTour}
                      className="text-xs text-slate-400 hover:text-white font-bold px-2 py-1 transition-colors"
                    >
                      გამოტოვება
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-xs font-black shadow-md hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                    >
                      <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'დასრულება 🎉' : 'შემდეგი'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {/* 3. TOUR COMPLETED CELEBRATION MODAL */}
      <AnimatePresence>
        {isCompletedModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full rounded-3xl p-6 bg-slate-900/90 backdrop-blur-2xl text-white shadow-2xl border-2 border-gold text-center relative"
            >
              <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto mb-3 border border-gold/40 shadow-md">
                <Sparkles size={32} />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ტური წარმატებით დასრულდა
              </span>

              <h3 className="text-xl font-black text-white mt-2">
                გილოცავთ! თქვენ მზად ხართ 🚀
              </h3>

              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed my-3">
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
