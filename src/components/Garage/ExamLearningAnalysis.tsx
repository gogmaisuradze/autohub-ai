import { AwardArtwork } from './AwardArtwork';
import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  Crown,
  GraduationCap,
  Scroll,
  Flame,
  ShieldAlert
} from 'lucide-react';

export interface LearningRecord {
  id: number;
  topicId: number;
  attempts: number;
  mistakes: number;
  lastCorrect: boolean;
  updatedAt: number;
}

export type LearningHistory = Record<string, LearningRecord>;

export type AcademicRankId = 'chainiki' | 'kursanti' | 'bakalavri' | 'magistranti' | 'magistri' | 'doqtoranti' | 'doqtori' | 'profesori' | 'akademikosi';

export interface AcademicRank {
  id: AcademicRankId;
  level: number;
  title: string;
  regalia: string;
  icon: string;
  badgeColor: string;
  borderColor: string;
  bgGradient: string;
  quote: string;
  requirement: string;
  demotionWarning?: string;
}

export const ACADEMIC_RANKS: Record<AcademicRankId, AcademicRank> = {
  "chainiki": {
    "id": "chainiki",
    "level": 1,
    "title": "მსმენელი",
    "regalia": "პირველი გაკვეთილის მედალი",
    "icon": "🎒",
    "badgeColor": "bg-amber-50 text-navy border-amber-200",
    "borderColor": "border-gold/40",
    "bgGradient": "from-amber-100/50 via-white to-slate-50",
    "quote": "ღვედი შევიკარი, ახლა საით?",
    "requirement": "დაიწყე სწავლა და მოიპოვე პირველი მედალი"
  },
  "kursanti": {
    "id": "kursanti",
    "level": 2,
    "title": "სტუდენტი",
    "regalia": "ბრინჯაოს საჭე",
    "icon": "🥉",
    "badgeColor": "bg-amber-50 text-navy border-amber-200",
    "borderColor": "border-gold/40",
    "bgGradient": "from-amber-100/50 via-white to-slate-50",
    "quote": "მარჯვნიდან მოსულს უკვე ვამჩნევ.",
    "requirement": "10 განსხვავებული ბილეთი · 50%+ სიზუსტე"
  },
  "bakalavri": {
    "id": "bakalavri",
    "level": 3,
    "title": "ბაკალავრი",
    "regalia": "ვერცხლის საჭე",
    "icon": "🥈",
    "badgeColor": "bg-amber-50 text-navy border-amber-200",
    "borderColor": "border-gold/40",
    "bgGradient": "from-amber-100/50 via-white to-slate-50",
    "quote": "ნიშნებს ვცნობ — ერთმანეთშიც აღარ მერევა.",
    "requirement": "30 განსხვავებული ბილეთი · 60%+ სიზუსტე"
  },
  "magistranti": {
    "id": "magistranti",
    "level": 4,
    "title": "მაგისტრანტი",
    "regalia": "ოქროს წიგნი",
    "icon": "🎓",
    "badgeColor": "bg-amber-50 text-navy border-amber-200",
    "borderColor": "border-gold/40",
    "bgGradient": "from-amber-100/50 via-white to-slate-50",
    "quote": "სამაგისტრო თემა: ვინ გაივლის პირველი?",
    "requirement": "60 განსხვავებული ბილეთი · 70%+ სიზუსტე"
  },
  "magistri": {
    "id": "magistri",
    "level": 5,
    "title": "მაგისტრი",
    "regalia": "ოქროს საჭე",
    "icon": "🥇",
    "badgeColor": "bg-amber-50 text-navy border-amber-200",
    "borderColor": "border-gold/40",
    "bgGradient": "from-amber-100/50 via-white to-slate-50",
    "quote": "ჯერ მაჩვენებელი, მერე მანევრი.",
    "requirement": "100 განსხვავებული ბილეთი · 78%+ სიზუსტე"
  },
  "doqtoranti": {
    "id": "doqtoranti",
    "level": 6,
    "title": "დოქტორანტი",
    "regalia": "ცოდნის ვერცხლის ვარსკვლავი",
    "icon": "🔬",
    "badgeColor": "bg-amber-50 text-navy border-amber-200",
    "borderColor": "border-gold/40",
    "bgGradient": "from-amber-100/50 via-white to-slate-50",
    "quote": "დისერტაცია გზაჯვარედინებზე იწერება.",
    "requirement": "150 განსხვავებული ბილეთი · 84%+ სიზუსტე"
  },
  "doqtori": {
    "id": "doqtori",
    "level": 7,
    "title": "დოქტორი",
    "regalia": "ცოდნის ოქროს ვარსკვლავი",
    "icon": "🏅",
    "badgeColor": "bg-amber-50 text-navy border-amber-200",
    "borderColor": "border-gold/40",
    "bgGradient": "from-amber-100/50 via-white to-slate-50",
    "quote": "პასუხთან ერთად მიზეზიც ვიცი.",
    "requirement": "220 განსხვავებული ბილეთი · 90%+ სიზუსტე"
  },
  "profesori": {
    "id": "profesori",
    "level": 8,
    "title": "პროფესორი",
    "regalia": "დაფნის გვირგვინიანი საჭე",
    "icon": "🎖️",
    "badgeColor": "bg-amber-50 text-navy border-amber-200",
    "borderColor": "border-gold/40",
    "bgGradient": "from-amber-100/50 via-white to-slate-50",
    "quote": "ლექცია დასრულდა — ახლა პრაქტიკაა.",
    "requirement": "250 განსხვავებული ბილეთი · 94%+ სიზუსტე"
  },
  "akademikosi": {
    "id": "akademikosi",
    "level": 9,
    "title": "აკადემიკოსი",
    "regalia": "გვირგვინისა და დაფნის უმაღლესი მედალი",
    "icon": "👑",
    "badgeColor": "bg-amber-50 text-navy border-amber-200",
    "borderColor": "border-gold/40",
    "bgGradient": "from-amber-100/50 via-white to-slate-50",
    "quote": "პრიორიტეტი მაქვს, მაგრამ მაინც გადავამოწმებ.",
    "requirement": "300 განსხვავებული ბილეთი · 97%+ სიზუსტე"
  }
};

const storageKey = (category: string) => `autohub.exam.learning.v1.${category}`;
const overrideKey = (category: string) => `autohub.exam.academic_override.v1.${category}`;

export function readLearningHistory(category: string): LearningHistory {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey(category)) || '{}');
    return Object.fromEntries(Object.entries(data).filter(([key, value]) => {
      const r = value as LearningRecord;
      return r && String(r.id) === key && Number.isInteger(r.topicId) &&
        Number.isInteger(r.attempts) && r.attempts > 0 && Number.isInteger(r.mistakes) &&
        r.mistakes >= 0 && r.mistakes <= r.attempts && typeof r.lastCorrect === 'boolean';
    })) as LearningHistory;
  } catch {
    return {};
  }
}

export function recordLearningAnswer(
  category: string,
  id: number,
  topicId: number,
  correct: boolean,
  currentHistory?: LearningHistory
) {
  const history = { ...(currentHistory || readLearningHistory(category)) };
  const previous = history[id];
  history[id] = {
    id,
    topicId,
    attempts: (previous?.attempts || 0) + 1,
    mistakes: (previous?.mistakes || 0) + (correct ? 0 : 1),
    lastCorrect: correct,
    updatedAt: Date.now()
  };
  let saved = true;
  try {
    localStorage.setItem(storageKey(category), JSON.stringify(history));
  } catch {
    saved = false;
  }
  return { history, saved };
}

export function getAcademicRank(attempts: number, correct: number, category = 'B'): AcademicRank {
  // A legacy one-round override must not grant or remove a permanent academic rank.
  const history = readLearningHistory(category);
  const unique = Object.keys(history).length;
  const accuracy = attempts > 0 ? (correct / attempts) * 100 : 0;
  const ladder: [AcademicRankId, number, number][] = [["chainiki", 0, 0], ["kursanti", 10, 50], ["bakalavri", 30, 60], ["magistranti", 60, 70], ["magistri", 100, 78], ["doqtoranti", 150, 84], ["doqtori", 220, 90], ["profesori", 250, 94], ["akademikosi", 300, 97]];
  return [...ladder].reverse().find(([, count, percent]) => unique >= count && accuracy >= percent)
    ? ACADEMIC_RANKS[[...ladder].reverse().find(([, count, percent]) => unique >= count && accuracy >= percent)![0]]
    : ACADEMIC_RANKS.chainiki;
}

export function AcademicMedal({ rank }: { rank: AcademicRank }) {
  return <AwardArtwork level={rank.level} label={rank.regalia} fallback={rank.icon} className="w-16 h-16" />;
}

export function setAcademicOverride(category: string, status: 'akademikosi' | 'chainiki' | null) {
  try {
    if (status) {
      localStorage.setItem(overrideKey(category), status);
    } else {
      localStorage.removeItem(overrideKey(category));
    }
  } catch {}
}

export function clearLearningHistory(category: string): boolean {
  try {
    localStorage.removeItem(storageKey(category));
    localStorage.removeItem(overrideKey(category));
    return true;
  } catch {
    return false;
  }
}

export function seedDemoMistakes(category: string, sampleQuestions: { id: number; topicId: number }[]): LearningHistory {
  const history = readLearningHistory(category);
  sampleQuestions.forEach(q => {
    history[q.id] = {
      id: q.id,
      topicId: q.topicId,
      attempts: (history[q.id]?.attempts || 0) + 1,
      mistakes: (history[q.id]?.mistakes || 0) + 1,
      lastCorrect: false,
      updatedAt: Date.now()
    };
  });
  try {
    localStorage.setItem(storageKey(category), JSON.stringify(history));
  } catch {}
  return history;
}

export function ExamLearningAnalysis({
  history,
  subjects,
  total,
  onPractice,
  saved = true,
  category = 'B'
}: {
  history: LearningHistory;
  subjects: { id: number; title: string }[];
  total: number;
  onPractice: (ids: number[]) => void;
  saved?: boolean;
  category?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const records = Object.values(history);
  const attempts = records.reduce((n, r) => n + r.attempts, 0);
  const mistakes = records.reduce((n, r) => n + r.mistakes, 0);
  const unresolved = records.filter(r => !r.lastCorrect);
  const correctAttempts = Math.max(0, attempts - mistakes);

  const accuracy = attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : 0;
  const coverage = total > 0 ? Math.round((records.length / total) * 100) : 0;

  // Dynamic Academic Rank
  const currentRank = getAcademicRank(attempts, correctAttempts, category);

  // Readiness Index
  let readinessLabel = 'დაიწყე ტესტირება';
  let readinessColor = 'text-slate-500';
  let strokeColor = '#3b82f6';

  if (attempts >= 10) {
    if (accuracy >= 90 && unresolved.length <= 3) {
      readinessLabel = 'საგამოცდო მზადყოფნა: უმაღლესი 🌟';
      readinessColor = 'text-emerald-700';
      strokeColor = '#10b981';
    } else if (accuracy >= 80) {
      readinessLabel = 'საგამოცდო მზადყოფნა: კარგი 👍';
      readinessColor = 'text-teal-700';
      strokeColor = '#14b8a6';
    } else if (accuracy >= 65) {
      readinessLabel = 'საგამოცდო მზადყოფნა: საშუალო ⚡';
      readinessColor = 'text-amber-700';
      strokeColor = '#f59e0b';
    } else {
      readinessLabel = 'საჭიროებს ვარჯიშს ⚠️';
      readinessColor = 'text-rose-700';
      strokeColor = '#f43f5e';
    }
  }

  // Topic Breakdown & Weak Topics (What needs improvement)
  const topicStats = subjects.map(subject => {
    const items = records.filter(r => r.topicId === subject.id);
    const topicAttempts = items.reduce((n, r) => n + r.attempts, 0);
    const topicMistakes = items.reduce((n, r) => n + r.mistakes, 0);
    const topicUnresolved = items.filter(r => !r.lastCorrect).map(r => r.id);
    const errorRate = topicAttempts > 0 ? Math.round((topicMistakes / topicAttempts) * 100) : 0;
    return {
      ...subject,
      attempts: topicAttempts,
      mistakes: topicMistakes,
      unresolved: topicUnresolved,
      errorRate
    };
  }).filter(t => t.attempts > 0);

  // Weakest topics sorted by mistakes count and error rate
  const weakTopics = [...topicStats]
    .filter(t => t.mistakes > 0)
    .sort((a, b) => b.mistakes - a.mistakes || b.errorRate - a.errorRate)
    .slice(0, 4);

  // SVG Gauge calculations (radius = 38)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = attempts > 0
    ? circumference - (accuracy / 100) * circumference
    : circumference;

  return (
    <section
      className="rounded-3xl neu-card border border-white/80 p-4 sm:p-6 text-left space-y-4 shadow-neu-card"
      aria-label="სწავლის ანალიტიკა და აკადემიური რეგალიები"
    >
      <details className="rounded-2xl border border-gold/20 bg-white/70 p-3">
        <summary className="cursor-pointer text-sm font-bold text-navy">აკადემიური გზა · 9 წოდება და მედალი</summary>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mt-3">{Object.values(ACADEMIC_RANKS).map(rank => <div key={rank.id} title={rank.requirement} className={`flex flex-col items-center text-center rounded-xl p-2 border ${rank.level <= currentRank.level ? 'border-gold/40 bg-amber-50' : 'border-slate-100 opacity-50'}`}><AcademicMedal rank={rank} /><span className="text-[10px] font-bold text-navy">{rank.title}</span><span className="text-[9px] text-slate-500 mt-1">{rank.requirement}</span></div>)}</div>
      </details>
      {/* ======================================================== */}
      {/* 1. ACADEMIC STATUS & REGALIA HERO BANNER                 */}
      {/* ======================================================== */}
      <div className={`p-4 sm:p-5 rounded-3xl border-2 ${currentRank.borderColor} bg-gradient-to-r ${currentRank.bgGradient} relative overflow-hidden space-y-3 transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          {/* Left: Icon & Rank Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-md border-2 border-white flex items-center justify-center text-3xl sm:text-4xl shrink-0">
              <AcademicMedal rank={currentRank} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border ${currentRank.badgeColor}`}>
                  დონე {currentRank.level}/9 · {currentRank.title}
                </span>
                {currentRank.id === 'akademikosi' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gold text-navy shadow-xs flex items-center gap-1 animate-pulse">
                    <Crown size={12} />
                    <span>უმაღლესი რეგალია</span>
                  </span>
                )}
                {currentRank.id === 'chainiki' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white flex items-center gap-1">
                    <ShieldAlert size={12} />
                    <span>სწავლის დასაწყისი</span>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-navy mt-1 tracking-tight">
                {currentRank.regalia}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug font-medium">
                {currentRank.quote}
              </p>
            </div>
          </div>

          {/* Right: Score Counter Badge */}
          <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs shrink-0 text-center sm:text-right min-w-[140px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              საგამოცდო შედეგი
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-navy mt-0.5">
              {correctAttempts} <span className="text-xs font-normal text-slate-500">/ {attempts} კითხვა</span>
            </div>
            <div className="text-xs font-bold text-emerald-700 font-mono">
              {accuracy}% სწორი პასუხი
            </div>
          </div>
        </div>

        {/* Algorithm Status Bar */}
        <div className="pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>🧠 გამოუცნობი ადაპტური ალგორითმი:</span>
            <span className="text-navy font-black">აქტიური</span>
            <span className="text-slate-400 font-normal hidden sm:inline">(ხაფანგები, შეცდომები, შერეული ტემპი)</span>
          </div>

          <div className="text-[10px] text-slate-500 font-medium">
            {currentRank.id === 'chainiki' ? (
              <span className="text-rose-700 font-bold">🎒 შემდეგი საფეხური: 10 განსხვავებული ბილეთი და მინიმუმ 50% სიზუსტე.</span>
            ) : currentRank.id === 'akademikosi' ? (
              <span className="text-amber-800 font-bold">👑 აკადემიკოსსაც სჭირდება გამეორება — ცოდნა გზაში გამოგადგება.</span>
            ) : (
              <span>დაწინაურების მოთხოვნა: {currentRank.requirement}</span>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN VISUAL DIAGRAM & METRIC GAUGES                   */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-navy" />
          <h4 className="text-xs sm:text-sm font-black text-navy uppercase tracking-wider">
            ცოდნის პროგრესის დიაგრამა & მეტრიკები
          </h4>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="btn-stitch-soft px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <span>{expanded ? 'ჩაკეცვა' : 'დეტალური რუკა'}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: Circular Donut Gauge Diagram */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/70 border border-slate-100 text-center shadow-xs">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-slate-100"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={strokeColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-mono text-navy leading-none">
                {attempts > 0 ? `${accuracy}%` : '0%'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                სიზუსტე
              </span>
            </div>
          </div>

          <div className="mt-2.5">
            <span className={`text-xs font-black ${readinessColor}`}>
              {readinessLabel}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {attempts > 0 ? `${attempts} ნაპასუხებიდან` : 'ტესტები ჯერ არ დაწყებულა'}
            </p>
          </div>
        </div>

        {/* Right: Metric Cards Grid */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Card 1: Accuracy */}
          <div className="p-3 rounded-2xl bg-white/80 border border-slate-100/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">სიზუსტე</span>
              <TrendingUp size={13} className="text-emerald-600" />
            </div>
            <div className="text-lg font-black font-mono text-navy">
              {attempts ? `${accuracy}%` : '—'}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {correctAttempts} სწორი / {attempts} სულ
            </span>
          </div>

          {/* Card 2: Question Bank Coverage */}
          <div className="p-3 rounded-2xl bg-white/80 border border-slate-100/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">ბაზის მოცვა</span>
              <BookOpen size={13} className="text-blue-600" />
            </div>
            <div className="text-lg font-black font-mono text-navy">
              {total ? `${coverage}%` : '—'}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${coverage}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {records.length} / {total} ბილეთი
            </span>
          </div>

          {/* Card 3: Unresolved Mistakes */}
          <div className="p-3 rounded-2xl bg-white/80 border border-slate-100/80 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">შეცდომები</span>
              <AlertTriangle size={13} className="text-rose-500" />
            </div>
            <div className={`text-lg font-black font-mono ${unresolved.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {unresolved.length}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${attempts ? Math.min(100, Math.round((mistakes / attempts) * 100)) : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {unresolved.length > 0 ? 'გასამეორებელი ბილეთი' : 'ყველა სწორია 🎉'}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. "💡 რა არის გასაუმჯობესებელი" (Smart Recommendations) */}
      {/* ======================================================== */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-black text-xs text-amber-950">
            <Zap size={14} className="text-amber-600 fill-amber-500" />
            <span>რა არის გასაუმჯობესებელი (სწავლის რეკომენდაცია):</span>
          </div>
          {unresolved.length > 0 && (
            <button
              type="button"
              onClick={() => onPractice(unresolved.map(r => r.id))}
              className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <RotateCcw size={12} />
              <span>შეცდომების გამეორება ({unresolved.length})</span>
            </button>
          )}
        </div>

        {attempts === 0 ? (
          <p className="text-xs text-amber-900/90 leading-relaxed">
            💡 <strong>პირადი დიაგნოსტიკა ჯერ ცარიელია:</strong> გაიარეთ პირველი 15 კითხვა ან ოფიციალური სიმულაცია. გამოუცნობი ალგორითმი ავტომატურად გააანალიზებს თქვენს შეცდომებს, შემოგთავაზებთ ხაფანგებს და განსაზღვრავს თქვენს აკადემიურ წოდებას (მსმენელიდან აკადემიკოსამდე).
          </p>
        ) : weakTopics.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-amber-900/90">
              თქვენი შედეგების მიხედვით, ყველაზე მეტი შეცდომა ფიქსირდება შემდეგ თემებში:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {weakTopics.map(topic => (
                <div
                  key={topic.id}
                  className="p-2.5 rounded-xl bg-white/90 border border-amber-200/60 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-navy truncate" title={topic.title}>
                      {topic.title}
                    </div>
                    <div className="text-[10px] text-rose-700 font-semibold mt-0.5">
                      {topic.mistakes} შეცდომა ({topic.errorRate}% ცდომილება)
                    </div>
                  </div>
                  {topic.unresolved.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onPractice(topic.unresolved)}
                      className="shrink-0 px-2 py-1 rounded-lg bg-navy/5 hover:bg-navy/15 text-navy text-[10px] font-bold transition-colors"
                    >
                      ვარჯიში ({topic.unresolved.length})
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>
              <strong>შესანიშნავი პროგრესი!</strong> ყველა გავლილ კითხვაზე სწორი პასუხი გაქვთ დაფიქსირებული. რეკომენდაცია: გაზარდეთ ბაზის მოცვა და სცადეთ 30-კითხვიანი ოფიციალური გამოცდა.
            </span>
          </div>
        )}
      </div>

      {!saved && (
        <p role="status" className="text-xs text-amber-800">
          ბრაუზერში ისტორიის შენახვა ვერ მოხერხდა. ამ გვერდზე ანალიზი ხელმისაწვდომია.
        </p>
      )}

      {/* ======================================================== */}
      {/* 4. EXPANDED MIND MAP & DETAILED TOPIC BREAKDOWN          */}
      {/* ======================================================== */}
      {expanded && attempts > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-navy tracking-wider">
              თემების ცოდნის რუკა ({topicStats.length} გავლილი თემა)
            </h4>
            <span className="text-[11px] text-slate-500">
              სულ {attempts} პასუხი · {mistakes} შეცდომა
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {topicStats.map(topic => {
              const topicSuccess = topic.attempts > 0
                ? Math.round(((topic.attempts - topic.mistakes) / topic.attempts) * 100)
                : 0;

              return (
                <div
                  key={topic.id}
                  className="p-2.5 rounded-xl bg-white/70 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-navy truncate" title={topic.title}>
                        {topic.title}
                      </span>
                      <span className="font-mono font-bold text-slate-600 shrink-0 ml-2">
                        {topicSuccess}% სწორი
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          topicSuccess >= 80 ? 'bg-emerald-500' : topicSuccess >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${topicSuccess}%` }}
                      />
                    </div>
                  </div>

                  {topic.unresolved.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onPractice(topic.unresolved)}
                      className="shrink-0 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold border border-rose-200 transition-colors"
                    >
                      {topic.unresolved.length} შეცდომა
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
