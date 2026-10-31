import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Search, Check, Sparkles, BookOpen } from 'lucide-react';
import { EXAM_CATEGORIES, ExamCategory } from './examCategories';
import { sounds } from '../../services/soundEffects';

type Score = { id: string; name: string; category: ExamCategory; correct: number; total: number; elapsed: number; date: number };
const scoreKey = 'autohub.exam.scores.v1';
function read<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
export function rankExamScores(scores: Score[], category: ExamCategory) {
  const names = new Set<string>();
  return scores.filter(s => s.category === category)
    .sort((a, b) => b.correct / b.total - a.correct / a.total || a.elapsed - b.elapsed || a.date - b.date)
    .filter(s => { const key = s.name.trim().toLocaleLowerCase(); if (names.has(key)) return false; names.add(key); return true; }).slice(0, 20);
}
export type ExamAward = { name: string; place: number; category: ExamCategory; medal: string; title: string };
export function saveExamScore(category: ExamCategory, correct: number, total: number, elapsed: number) {
  try {
    const name = read<string>('autohub.exam.nickname', 'სტუმარი').trim().slice(0, 40) || 'სტუმარი';
    const identity = name.toLocaleLowerCase();
    const scores = read<Score[]>(scoreKey, []);
    const previousPlace = rankExamScores(scores, category).findIndex(s => s.name.toLocaleLowerCase() === identity) + 1;
    scores.push({ id: crypto.randomUUID(), name, category, correct, total, elapsed: Math.max(0, elapsed), date: Date.now() });
    const stored = scores.slice(-1000);
    localStorage.setItem(scoreKey, JSON.stringify(stored));
    window.dispatchEvent(new Event('autohub-exam-score'));
    const place = rankExamScores(stored, category).findIndex(s => s.name.toLocaleLowerCase() === identity) + 1;
    const key = `autohub.exam.award.v1.${category}.${identity}`;
    const previousBest = read<number>(key, previousPlace || 21);
    if (!place || place >= previousBest) return;
    localStorage.setItem(key, JSON.stringify(place));
    const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : '🏅';
    const title = place === 1 ? 'ოქროს მედალი — პირველი ადგილი!' : place === 2 ? 'ვერცხლის მედალი — მეორე ადგილი!' : place === 3 ? 'ბრინჯაოს მედალი — მესამე ადგილი!' : 'საუკეთესო ოცეულის საპატიო მედალი!';
    const award: ExamAward = { name, place, category, medal, title };
    window.dispatchEvent(new CustomEvent('autohub-exam-award', { detail: award }));
    return award;
  } catch { /* A storage failure must not interrupt the completed exam. */ }
}

export function ExamAchievement() {
  const [award, setAward] = useState<ExamAward | null>(null);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const celebrate = (event: Event) => {
      setAward((event as CustomEvent<ExamAward>).detail);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setAward(null), 15000);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.35 }, colors: ['#d9a841', '#14213d', '#ffffff'], disableForReducedMotion: true });
      }
    };
    window.addEventListener('autohub-exam-award', celebrate);
    return () => { window.removeEventListener('autohub-exam-award', celebrate); if (timeout) clearTimeout(timeout); };
  }, []);
  if (!award) return null;
  return <aside role="status" aria-live="polite" aria-atomic="true" className="fixed z-[100] top-24 right-3 left-3 sm:left-auto sm:right-6 sm:w-96 rounded-3xl border-2 border-gold bg-navy p-5 text-white shadow-2xl">
    <button type="button" aria-label="მილოცვის დახურვა" onClick={() => setAward(null)} className="absolute top-2 right-3 rounded-lg p-2 text-white/70 hover:text-white">✕</button>
    <div className="text-5xl mb-3" aria-hidden="true">{award.medal}</div>
    <h2 className="text-lg font-black text-gold">გილოცავთ, {award.name}!</h2>
    <p className="mt-2 font-bold">{award.title}</p>
    <p className="mt-2 text-sm text-slate-200">{EXAM_CATEGORIES.find(c => c.cat === award.category)?.label} კატეგორიაში დაიკავე #{award.place} ადგილი. აკადემიური საბჭო ტაშს გიკრავს! 👏</p>
    <p className="mt-3 text-[11px] text-slate-400">ამ ბრაუზერის საუკეთესო ოცეული · ახალი საუკეთესო ადგილი</p>
  </aside>;
}
const formatTime = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
export function ExamLeaderboard({ category }: { category: ExamCategory }) {
  const [filter, setFilter] = useState<ExamCategory>(category);
  const [name, setName] = useState(() => read<string>('autohub.exam.nickname', ''));
  const [scores, setScores] = useState(() => read<Score[]>(scoreKey, []));
  const [saved, setSaved] = useState(true);
  useEffect(() => { const update = () => setScores(read<Score[]>(scoreKey, [])); window.addEventListener('autohub-exam-score', update); window.addEventListener('storage', update); return () => { window.removeEventListener('autohub-exam-score', update); window.removeEventListener('storage', update); }; }, []);
  const top = rankExamScores(scores, filter);
  return <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 space-y-4">
    <h2 className="text-xl font-black text-navy">🏆 საუკეთესო ოცეული</h2>
    <p className="text-sm text-slate-500">ამ ბრაუზერის შედეგები · თითო სახელის საუკეთესო ჩაბარებული სრული გამოცდა. ჯერ სიზუსტე, შემდეგ ნაკლები დრო. სავარჯიშოები რეიტინგში არ შედის.</p>
    <label className="block text-sm font-bold text-navy">შენი სახელი / ფსევდონიმი<input maxLength={40} value={name} onChange={e => { setName(e.target.value); try { localStorage.setItem('autohub.exam.nickname', JSON.stringify(e.target.value)); setSaved(true); } catch { setSaved(false); } }} placeholder="შეიყვანე სახელი გამოცდამდე" className="block w-full sm:max-w-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 mt-2" /></label>
    {!saved && <p role="status" className="text-sm text-rose-600">სახელი ვერ შეინახა — ბრაუზერში შენახვა შეზღუდულია.</p>}
    <label className="block text-sm text-navy">კატეგორია <select value={filter} onChange={e => setFilter(e.target.value as ExamCategory)} className="rounded-xl border border-slate-200 px-3 py-2 ml-2">{EXAM_CATEGORIES.map(c => <option key={c.cat} value={c.cat}>{c.label}</option>)}</select></label>
    {!top.length ? <p className="rounded-2xl bg-slate-50 p-5 text-slate-500">ჯერ შედეგები არ არის. ჩააბარე სრული გამოცდა და შენი შედეგი აქ გამოჩნდება.</p> : <ol className="space-y-2">{top.map((s, i) => <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3"><span className="font-black text-amber-600 w-8">{i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}</span><span className="flex-1 min-w-0 truncate font-bold text-navy">{s.name}</span><span className="text-sm font-bold text-emerald-700">{s.correct}/{s.total}</span><span className="font-mono text-sm text-slate-600">{formatTime(s.elapsed)}</span></li>)}</ol>}
    <p className="text-xs text-slate-400">სხვა მოწყობილობების საერთო რეიტინგი ჯერ დაკავშირებული არ არის. შენახული შედეგები ბრაუზერის მონაცემების გასუფთავებისას წაიშლება.</p>
  </section>;
}

// Visual Miniature SVGs for Sign Categories matching reference styling
export const SIGN_CATEGORY_ICONS: Record<number, React.ReactNode> = {
  // 0: ყველა ნიშანი
  0: (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
      <rect x="2" y="2" width="6.5" height="6.5" rx="1.5" fill="#F59E0B" />
      <circle cx="14.5" cy="5.5" r="3.2" fill="#EF4444" />
      <polygon points="5.5,12 8.5,17.5 2.5,17.5" fill="#2563EB" />
      <rect x="11.5" y="11.5" width="6.5" height="6.5" rx="1.5" fill="#10B981" />
    </svg>
  ),

  // 1: მაფრთხილებელი ნიშნები (Red triangle with white center)
  1: (
    <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0" fill="none">
      <polygon points="10,2 19,17.5 1,17.5" fill="#EF4444" stroke="#DC2626" strokeWidth="0.8" />
      <polygon points="10,5.5 16,16 4,16" fill="#FFFFFF" />
    </svg>
  ),

  // 2: პრიორიტეტის ნიშნები (Yellow diamond priority road sign)
  2: (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
      <rect x="4" y="4" width="12" height="12" rx="1.5" transform="rotate(45 10 10)" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.8" />
      <rect x="6" y="6" width="8" height="8" rx="0.8" transform="rotate(45 10 10)" fill="#F59E0B" />
    </svg>
  ),

  // 3: ამკრძალავი ნიშნები (Red circle with white center)
  3: (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
      <circle cx="10" cy="10" r="7.8" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2.5" />
    </svg>
  ),

  // 4: მიმთითებელი ნიშნები (Solid bright blue circle)
  4: (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
      <circle cx="10" cy="10" r="8" fill="#2563EB" stroke="#1D4ED8" strokeWidth="0.8" />
      <circle cx="10" cy="10" r="6.8" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.6" />
    </svg>
  ),

  // 5: განსაკუთრებული მითითებების ნიშნები (Green square)
  5: (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
      <rect x="2.5" y="2.5" width="15" height="15" rx="2.5" fill="#16A34A" stroke="#15803D" strokeWidth="0.8" />
    </svg>
  ),

  // 6: სერვისის ნიშნები (Blue vertical rectangle with white inner panel)
  6: (
    <svg viewBox="0 0 20 20" className="w-3.5 h-4 shrink-0" fill="none">
      <rect x="4" y="2" width="12" height="16" rx="2" fill="#2563EB" stroke="#1D4ED8" strokeWidth="0.8" />
      <rect x="6" y="4" width="8" height="8" rx="1" fill="#FFFFFF" />
    </svg>
  ),

  // 7: საინფორმაციო ნიშნები (Blue square)
  7: (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
      <rect x="2.5" y="2.5" width="15" height="15" rx="2.5" fill="#2563EB" stroke="#1D4ED8" strokeWidth="0.8" />
    </svg>
  ),

  // 8: დამატებითი ინფორმაციის ნიშნები (White horizontal plate with dark border)
  8: (
    <svg viewBox="0 0 20 20" className="w-4 h-3 shrink-0" fill="none">
      <rect x="1.5" y="5" width="17" height="10" rx="1.5" fill="#FFFFFF" stroke="#334155" strokeWidth="1.2" />
    </svg>
  ),

  // 9: შუქნიშნები (Traffic light)
  9: (
    <svg viewBox="0 0 20 20" className="w-3 h-4 shrink-0" fill="none">
      <rect x="5.5" y="1.5" width="9" height="17" rx="2.5" fill="#1E293B" />
      <circle cx="10" cy="5" r="1.8" fill="#EF4444" />
      <circle cx="10" cy="10" r="1.8" fill="#F59E0B" />
      <circle cx="10" cy="15" r="1.8" fill="#10B981" />
    </svg>
  ),

  // 10: საგზაო მონიშვნები (Road marking with green edge & zebra line)
  10: (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
      <rect x="2" y="2" width="16" height="16" rx="2" fill="#64748B" />
      <rect x="2" y="2" width="4" height="16" fill="#16A34A" opacity="0.9" />
      <line x1="11" y1="3" x2="11" y2="7.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="12.5" x2="11" y2="17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  // 11: უსაფრთხოების რჩევები (Safety shield)
  11: (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
      <path d="M10 2L3 5v5c0 4.5 3 8.7 7 10 4-1.3 7-5.5 7-10V5l-7-3z" fill="#0EA5E9" />
      <path d="M10 4.5L5 6.7v3.3c0 3.3 2.1 6.4 5 7.4 2.9-1 5-4.1 5-7.4V6.7L10 4.5z" fill="#FFFFFF" fillOpacity="0.3" />
    </svg>
  ),
};

// Georgian Category Labels matching reference
const SIGN_CATEGORY_LABELS: Record<number, string> = {
  0: 'ყველა ნიშანი',
  1: 'მაფრთხილებელი ნიშნები',
  2: 'პრიორიტეტის ნიშნები',
  3: 'ამკრძალავი ნიშნები',
  4: 'მიმთითებელი ნიშნები',
  5: 'განსაკუთრებული მითითებების ნიშნები',
  6: 'სერვისის ნიშნები',
  7: 'საინფორმაციო ნიშნები',
  8: 'დამატებითი ინფორმაციის ნიშნები',
  9: 'შუქნიშნები',
  10: 'საგზაო მონიშვნები',
  11: 'უსაფრთხოების რჩევები',
};

type Sign = { id: number; sign_category_id: number; title: string; description: string; image: string };
type Catalog = { categories: { id: number; name: string }[]; signs: Sign[] };

export function SignsLearning() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<number>(1); // Default to 1 (მაფრთხილებელი ნიშნები) as in user's image
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [known, setKnown] = useState<number[]>(() => read<number[]>('autohub.signs.known.v1', []));
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/driving-signs/catalog.json`, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setCatalog)
      .catch(e => {
        if (e.name !== 'AbortError') setError(true);
      });
    return () => controller.abort();
  }, []);

  const toggle = (id: number) => {
    sounds.playClick();
    const next = known.includes(id) ? known.filter(x => x !== id) : [...known, id];
    setKnown(next);
    try {
      localStorage.setItem('autohub.signs.known.v1', JSON.stringify(next));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  };

  // Dynamic counts per category
  const counts: Record<number, number> = { 0: catalog?.signs.length || 0 };
  if (catalog?.signs) {
    catalog.signs.forEach(s => {
      counts[s.sign_category_id] = (counts[s.sign_category_id] || 0) + 1;
    });
  }

  const signs = catalog?.signs.filter(s =>
    (!category || s.sign_category_id === category) &&
    `${s.title} ${s.description}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  ) || [];

  // Order categories to match user reference image:
  // 1 (მაფრთხილებელი), 2 (პრიორიტეტის), 3 (ამკრძალავი), 4 (მიმთითებელი),
  // 5 (განსაკუთრებული მითითებების), 6 (სერვისის), 7 (საინფორმაციო), 8 (დამატებითი ინფორმაციის),
  // 10 (საგზაო მონიშვნები), 9 (შუქნიშნები), 11 (უსაფრთხოების რჩევები)
  const orderedCategoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 10, 9, 11];
  const allCategories = catalog?.categories ? [
    { id: 0, name: 'ყველა ნიშანი' },
    ...orderedCategoryIds.map(id => catalog.categories.find(c => c.id === id)).filter(Boolean) as { id: number; name: string }[]
  ] : [];

  return (
    <section className="rounded-3xl neu-card bg-white border border-slate-200/90 shadow-neu-card p-5 sm:p-7 space-y-5 animate-fade-in">
      {/* Header with Title and Known Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚸</span>
            <h2 className="text-lg sm:text-xl font-black text-navy tracking-tight">
              საგზაო ნიშნების შესწავლა
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            შეისწავლეთ ოფიციალური საგზაო ნიშნები, განმარტებები და შეინახეთ ათვისებული პროგრესი.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs flex items-center gap-1.5">
            <Check size={13} className="text-emerald-600 stroke-[3]" />
            <span>ნასწავლია: {known.length} / {catalog?.signs.length || 252}</span>
          </span>
        </div>
      </div>

      {error ? (
        <p role="alert" className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
          ნიშნები ვერ ჩაიტვირთა. გთხოვთ განაახლოთ გვერდი.
        </p>
      ) : !catalog ? (
        <div className="p-8 text-center text-slate-500 text-xs font-mono">
          ნიშნების კატალოგი იტვირთება…
        </div>
      ) : (
        <>
          {/* Sign Category Selection Pill Buttons (Matching Reference Image) */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block font-mono">
              აირჩიეთ კატეგორია:
            </label>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {allCategories.map((c) => {
                const isSelected = category === c.id;
                const count = counts[c.id] || 0;
                const label = SIGN_CATEGORY_LABELS[c.id] || c.name;
                const icon = SIGN_CATEGORY_ICONS[c.id] || SIGN_CATEGORY_ICONS[0];

                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      sounds.playClick();
                      setCategory(c.id);
                      setExpanded(null);
                    }}
                    className={`px-3.5 sm:px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer transition-all duration-200 select-none shrink-0 group ${
                      isSelected
                        ? 'bg-navy text-white shadow-md ring-1 ring-navy'
                        : 'neu-card bg-white text-slate-800 border border-slate-200/90 hover:border-gold/60 hover:text-navy hover:shadow-xs hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Miniature Sign SVG */}
                    <div className="flex items-center justify-center shrink-0">
                      {icon}
                    </div>

                    {/* Label */}
                    <span className={`text-xs sm:text-[13px] font-bold tracking-tight transition-colors ${
                      isSelected ? 'text-white' : 'text-slate-800 group-hover:text-navy'
                    }`}>
                      {label}
                    </span>

                    {/* Count */}
                    <span className={`text-[11px] font-mono font-medium ml-0.5 transition-colors ${
                      isSelected ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative pt-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="ნიშნების ძიება"
              placeholder="მოძებნეთ საგზაო ნიშანი (სახელი, ნომერი ან საკვანძო სიტყვა)…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200/90 bg-white text-navy text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-gold focus:border-gold shadow-2xs transition-all placeholder:text-slate-400"
            />
          </div>

          {saveError && (
            <p role="status" className="text-xs text-rose-600 font-bold">
              პროგრესი ამჯერად ვერ შეინახა (ბრაუზერის ლოკალური მეხსიერება შეზღუდულია).
            </p>
          )}

          {/* Signs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {signs.map(s => {
              const isLearned = known.includes(s.id);
              const isCardExpanded = expanded === s.id;

              return (
                <article
                  key={s.id}
                  className={`rounded-3xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between group ${
                    isLearned
                      ? 'border-emerald-300 bg-emerald-50/25 shadow-2xs'
                      : 'neu-card bg-white border-slate-200/90 shadow-neu-card hover:border-gold/50 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Sign Image */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setExpanded(isCardExpanded ? null : s.id);
                      }}
                      aria-expanded={isCardExpanded}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className="h-24 sm:h-28 w-full rounded-2xl bg-slate-50/80 flex items-center justify-center p-2 mb-3 border border-slate-100 group-hover:border-gold/30 transition-colors">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={`${import.meta.env.BASE_URL}data/driving-signs/images/${encodeURIComponent(s.image)}`}
                          alt={s.title}
                          className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      <h3 className="text-xs sm:text-sm font-black text-navy group-hover:text-gold transition-colors leading-snug">
                        {s.title}
                      </h3>

                      <span className="text-[11px] text-slate-400 font-bold block mt-1 hover:text-navy transition-colors">
                        {isCardExpanded ? '▲ განმარტების დახურვა' : '▼ განმარტება'}
                      </span>
                    </button>

                    {/* Expanded Explanation */}
                    {isCardExpanded && (
                      <p className="text-xs leading-relaxed text-slate-600 mt-2.5 pt-2 border-t border-slate-100 whitespace-pre-line bg-white/60 p-2 rounded-xl">
                        {s.description.replace(/<[^>]*>/g, '') || 'განმარტება წყაროში არ არის მითითებული.'}
                      </p>
                    )}
                  </div>

                  {/* Learned / Action Button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between">
                    <button
                      type="button"
                      aria-pressed={isLearned}
                      onClick={() => toggle(s.id)}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                        isLearned
                          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                          : 'btn-stitch-soft text-slate-700 hover:text-navy hover:border-gold'
                      }`}
                    >
                      {isLearned ? (
                        <>
                          <Check size={13} className="stroke-[3]" />
                          <span>ნასწავლია</span>
                        </>
                      ) : (
                        <span>ვისწავლე</span>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {!signs.length && (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium">
              საგზაო ნიშანი ამ ფილტრით ვერ მოიძებნა.
            </div>
          )}

          <p className="text-[11px] text-slate-400 font-mono text-right">
            სასწავლო ცნობარი • პროგრესი ინახება ავტომატურად ამ ბრაუზერში
          </p>
        </>
      )}
    </section>
  );
}
