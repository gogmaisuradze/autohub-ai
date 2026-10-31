import React, { useEffect, useState } from 'react';
import { EXAM_CATEGORIES, ExamCategory } from './examCategories';

type Score = { id: string; name: string; category: ExamCategory; correct: number; total: number; elapsed: number; date: number };
const scoreKey = 'autohub.exam.scores.v1';
function read<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
export function saveExamScore(category: ExamCategory, correct: number, total: number, elapsed: number) {
  try {
    const name = read<string>('autohub.exam.nickname', 'სტუმარი').trim().slice(0, 40) || 'სტუმარი';
    const scores = read<Score[]>(scoreKey, []);
    scores.push({ id: crypto.randomUUID(), name, category, correct, total, elapsed: Math.max(0, elapsed), date: Date.now() });
    localStorage.setItem(scoreKey, JSON.stringify(scores.slice(-1000)));
    window.dispatchEvent(new Event('autohub-exam-score'));
  } catch { /* A storage failure must not interrupt the completed exam. */ }
}
const formatTime = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
export function ExamLeaderboard({ category }: { category: ExamCategory }) {
  const [filter, setFilter] = useState<ExamCategory>(category);
  const [name, setName] = useState(() => read<string>('autohub.exam.nickname', ''));
  const [scores, setScores] = useState(() => read<Score[]>(scoreKey, []));
  const [saved, setSaved] = useState(true);
  useEffect(() => { const update = () => setScores(read<Score[]>(scoreKey, [])); window.addEventListener('autohub-exam-score', update); window.addEventListener('storage', update); return () => { window.removeEventListener('autohub-exam-score', update); window.removeEventListener('storage', update); }; }, []);
  const sorted = scores.filter(s => s.category === filter).sort((a, b) => b.correct / b.total - a.correct / a.total || a.elapsed - b.elapsed || a.date - b.date);
  const names = new Set<string>();
  const top = sorted.filter(s => { const key = s.name.trim().toLocaleLowerCase(); if (names.has(key)) return false; names.add(key); return true; }).slice(0, 20);
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

type Sign = { id: number; sign_category_id: number; title: string; description: string; image: string };
type Catalog = { categories: { id: number; name: string }[]; signs: Sign[] };
export function SignsLearning() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState(4);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [known, setKnown] = useState<number[]>(() => read<number[]>('autohub.signs.known.v1', []));
  const [saveError, setSaveError] = useState(false);
  useEffect(() => { const controller = new AbortController(); fetch(`${import.meta.env.BASE_URL}data/driving-signs/catalog.json`, { signal: controller.signal }).then(r => { if (!r.ok) throw Error(); return r.json(); }).then(setCatalog).catch(e => { if (e.name !== 'AbortError') setError(true); }); return () => controller.abort(); }, []);
  const toggle = (id: number) => { const next = known.includes(id) ? known.filter(x => x !== id) : [...known, id]; setKnown(next); try { localStorage.setItem('autohub.signs.known.v1', JSON.stringify(next)); setSaveError(false); } catch { setSaveError(true); } };
  const signs = catalog?.signs.filter(s => (!category || s.sign_category_id === category) && `${s.title} ${s.description}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())) || [];
  return <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 space-y-5">
    <div><h2 className="text-xl font-black text-navy">საგზაო ნიშნების შესწავლა</h2><p className="text-sm text-slate-500 mt-1">შეისწავლე ნიშნები, გახსენი განმარტება და მონიშნე ნასწავლი · {known.length} / {catalog?.signs.length || 252}</p></div>
    {error ? <p role="alert">ნიშნები ვერ ჩაიტვირთა. განაახლე გვერდი ხელახლა.</p> : !catalog ? <p role="status">ნიშნები იტვირთება…</p> : <>
      <div className="flex flex-wrap gap-2">{[{id: 0,name:'ყველა'},...catalog.categories].map(c => <button key={c.id} aria-pressed={category === c.id} onClick={() => { setCategory(c.id); setExpanded(null); }} className={`rounded-xl px-3 py-2 text-xs font-bold ${category === c.id ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-amber-50'}`}>{c.name}</button>)}</div>
      <input aria-label="ნიშნების ძიება" placeholder="მოძებნე სახელი, ნომერი ან სიტყვა…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
      {saveError && <p role="status" className="text-sm text-rose-600">პროგრესი ამჯერად ვერ შეინახა.</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">{signs.map(s => <article key={s.id} className={`rounded-2xl border p-3 sm:p-4 ${known.includes(s.id) ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-white'}`}>
        <button onClick={() => setExpanded(expanded === s.id ? null : s.id)} aria-expanded={expanded === s.id} className="w-full text-left"><img loading="lazy" decoding="async" src={`${import.meta.env.BASE_URL}data/driving-signs/images/${encodeURIComponent(s.image)}`} alt={s.title} className="h-24 sm:h-28 w-full object-contain mb-3" /><h3 className="text-xs sm:text-sm font-bold text-navy">{s.title}</h3><span className="text-[11px] text-slate-400">{expanded === s.id ? 'განმარტების დახურვა' : 'განმარტება ↓'}</span></button>
        {expanded === s.id && <p className="text-xs leading-relaxed text-slate-600 mt-3 whitespace-pre-line">{s.description.replace(/<[^>]*>/g, '') || 'განმარტება წყაროში არ არის მითითებული.'}</p>}
        <button aria-pressed={known.includes(s.id)} onClick={() => toggle(s.id)} className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-bold ${known.includes(s.id) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{known.includes(s.id) ? '✓ ნასწავლია' : 'ვისწავლე'}</button>
      </article>)}</div>
      {!signs.length && <p className="text-sm text-slate-500">ნიშანი ვერ მოიძებნა.</p>}
      <p className="text-xs text-slate-400">სასწავლო ცნობარი · პროგრესი ამ ბრაუზერში ინახება.</p>
    </>}
  </section>;
}
