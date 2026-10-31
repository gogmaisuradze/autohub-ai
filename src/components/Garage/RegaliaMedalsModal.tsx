import { AwardArtwork } from './AwardArtwork';
import React from 'react';
import { X, Award, Check, Lock, ChevronRight, Sparkles, Shield, Star, BookOpen, Crown } from 'lucide-react';
import { AcademicRank, AcademicRankId, ACADEMIC_RANKS } from './ExamLearningAnalysis';
import { sounds } from '../../services/soundEffects';

// Ladder rules: [rankId, minTicketsCount, minAccuracyPercent]
export const RANK_LADDER: [AcademicRankId, number, number][] = [
  ['chainiki', 0, 0],
  ['kursanti', 10, 50],
  ['bakalavri', 30, 60],
  ['magistranti', 60, 70],
  ['magistri', 100, 78],
  ['doqtoranti', 150, 84],
  ['doqtori', 220, 90],
  ['profesori', 250, 94],
  ['akademikosi', 300, 97],
];

/**
 * Bespoke, refined metallic vector medal component tailored to AutoHub's luxury aesthetic.
 */
export function RegaliaMedalVisual({ rank, size = 'md', locked = false }: { rank: AcademicRank; size?: 'sm' | 'md' | 'lg'; locked?: boolean }) {
  const dim = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-28 h-28' : 'w-20 h-20';
  return <AwardArtwork level={rank.level} label={rank.regalia} className={dim} locked={locked} fallback={rank.icon} />;
}

interface RegaliaMedalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRank: AcademicRank;
  uniqueTickets: number;
  accuracy: number;
  category?: string;
}

export function RegaliaMedalsModal({
  isOpen,
  onClose,
  currentRank,
  uniqueTickets,
  accuracy,
  category = 'B',
}: RegaliaMedalsModalProps) {
  if (!isOpen) return null;

  // Ordered list of ranks 1 through 9
  const ranksList = RANK_LADDER.map(([id]) => ACADEMIC_RANKS[id]);

  // Next milestone calculation
  const nextRankEntry = RANK_LADDER.find(([id, count, percent]) => {
    const r = ACADEMIC_RANKS[id];
    return r.level === currentRank.level + 1;
  });

  const nextRank = nextRankEntry ? ACADEMIC_RANKS[nextRankEntry[0]] : null;
  const nextMinCount = nextRankEntry ? nextRankEntry[1] : 0;
  const nextMinAccuracy = nextRankEntry ? nextRankEntry[2] : 0;

  const remainingTickets = Math.max(0, nextMinCount - uniqueTickets);
  const progressPercent = nextMinCount > 0 ? Math.min(100, Math.round((uniqueTickets / nextMinCount) * 100)) : 100;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-navy/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-white/80 flex flex-col overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-navy via-slate-900 to-navy text-white flex items-center justify-between border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-gold/15 to-transparent pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-gold">
                AutoHub Driving Academy • 9-საფეხურიანი რანგები
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span>აკადემიური რეგალიები & მედლები</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/40 font-mono">
                {category} კატეგორია
              </span>
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              გაიარეთ ავთენტური გზა მსმენელიდან აკადემიკოსამდე. თითოეული მედალი მოითხოვს გადაჭრილ ბილეთებსა და მაღალ საგამოცდო სიზუსტეს.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shrink-0 ml-3"
            title="დახურვა"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current User Level Status Card */}
        <div className="p-4 sm:p-6 bg-[#ECEAE5]/60 border-b border-slate-200/80">
          <div className="p-4 sm:p-5 rounded-3xl neu-card shadow-neu-card border border-white bg-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <RegaliaMedalVisual rank={currentRank} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-gold/20 text-navy border border-gold/40">
                    დონე {currentRank.level} / 9
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <Check size={13} className="stroke-[3]" />
                    <span>მოპოვებული რანგი</span>
                  </span>
                </div>
                <h4 className="text-base sm:text-xl font-black text-navy mt-0.5">
                  {currentRank.title} — {currentRank.regalia}
                </h4>
                <p className="text-xs text-slate-500 font-medium italic mt-0.5">
                  „{currentRank.quote}“
                </p>
              </div>
            </div>

            {/* Progress to Next Milestone */}
            {nextRank ? (
              <div className="w-full md:w-72 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-2 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-navy flex items-center gap-1">
                    <span>შემდეგი:</span>
                    <span className="text-gold font-black">{nextRank.title}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-500 text-[11px]">
                    {progressPercent}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>ბილეთები: {uniqueTickets} / {nextMinCount}</span>
                  <span>სიზუსტე: {accuracy}% / {nextMinAccuracy}%</span>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-gold/40 text-navy text-xs font-black flex items-center gap-2">
                <Crown size={16} className="text-gold" />
                <span>უმაღლესი რანგი მიღწეულია! 👏</span>
              </div>
            )}
          </div>
        </div>

        {/* 9 Levels Grid List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FAFBFD]">
          <div className="flex items-center justify-between text-xs font-black text-navy uppercase tracking-wider mb-2">
            <span>სრული რეგალიების კიბე (9 დონე):</span>
            <span className="text-[10px] text-slate-400 font-normal">
              ათვისებული: {uniqueTickets} ბილეთი • სიზუსტე: {accuracy}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ranksList.map((rank) => {
              const ladderEntry = RANK_LADDER.find(([id]) => id === rank.id);
              const minCount = ladderEntry ? ladderEntry[1] : 0;
              const minAcc = ladderEntry ? ladderEntry[2] : 0;

              const isUnlocked = currentRank.level >= rank.level;
              const isCurrent = currentRank.id === rank.id;
              const isLocked = !isUnlocked;

              return (
                <div
                  key={rank.id}
                  className={`p-4 rounded-3xl transition-all duration-200 relative flex flex-col justify-between overflow-hidden group ${
                    isCurrent
                      ? 'bg-white border-2 border-gold shadow-neu-flat ring-4 ring-gold/15 -translate-y-0.5'
                      : isUnlocked
                      ? 'neu-card shadow-neu-card border border-white hover:border-gold/40 bg-white'
                      : 'bg-white/60 border border-slate-200/60 opacity-75'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-amber-400 to-gold rounded-t-3xl" />
                  )}

                  <div>
                    {/* Top Row: Medal & Level Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <RegaliaMedalVisual rank={rank} size="md" locked={isLocked} />

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                          isCurrent
                            ? 'bg-gold text-navy shadow-2xs'
                            : isUnlocked
                            ? 'bg-navy/10 text-navy'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          დონე {rank.level}
                        </span>

                        {isCurrent ? (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>მიმდინარე</span>
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-0.5">
                            <Check size={11} className="stroke-[3]" />
                            <span>მოპოვებული</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                            <Lock size={10} />
                            <span>ჩაკეტილი</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Titles */}
                    <div>
                      <h5 className="text-sm font-black text-navy group-hover:text-gold transition-colors flex items-center gap-1.5">
                        <span>{rank.title}</span>
                      </h5>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 line-clamp-1">
                        {rank.regalia}
                      </p>
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-1">
                        „{rank.quote}“
                      </p>
                    </div>
                  </div>

                  {/* Requirements / Status Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">
                      {minCount === 0 ? 'სტარტი' : `${minCount} ბილეთი • ${minAcc}%+`}
                    </span>
                    <span className={`font-bold ${isUnlocked ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {isUnlocked ? '✓ ათვისებულია' : `საჭიროა კიდევ ${Math.max(0, minCount - uniqueTickets)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 hidden sm:block">
            რეგალიები ინახება თქვენს პროფილში და ავტომატურად ითვლება ყოველი ჩაბარებული ბილეთის მიხედვით.
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full sm:w-auto ml-auto px-6 py-2.5 rounded-2xl bg-navy hover:bg-slate-800 text-gold font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            გასაგებია
          </button>
        </div>
      </div>
    </div>
  );
}
