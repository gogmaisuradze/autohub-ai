export interface StudyProgress {
  lastCorrect: boolean;
  mistakes: number;
}

// Tricky official exam topics with highest error rates in Georgia
const TRAP_TOPIC_IDS = [20, 11, 16, 28, 31, 10]; // Crossroads, Traffic controller, Overtaking, Markings, Law, Signals

/**
 * Unpredictable Adaptive Algorithm ("გამოუცნობი ადაპტური ალგორითმი")
 * Deliberately conceals predictable patterns by dynamically interleaving:
 * - Unresolved past mistakes (spaced repetition)
 * - Tricky trap questions (high-difficulty crossroads & rules)
 * - Fresh unseen tickets
 * - Random category wildcards
 * - Strict anti-clustering (avoids 3 questions of the same topic in a row)
 */
export function selectStudyRound<T extends { id: number; topicId?: number }>(
  pool: T[],
  history: Record<string, StudyProgress>,
  size = 15,
  random = Math.random
): T[] {
  if (!pool || pool.length === 0) return [];
  if (pool.length <= size) return [...pool].sort(() => random() - 0.5);

  const shuffle = (items: T[]) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      // High-entropy random index
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const chosen: T[] = [];
  const chosenIds = new Set<number>();

  const take = (items: T[], maxCount: number) => {
    let added = 0;
    const shuffledItems = shuffle(items);
    for (const q of shuffledItems) {
      if (chosen.length >= size || added >= maxCount) break;
      if (!chosenIds.has(q.id)) {
        chosen.push(q);
        chosenIds.add(q.id);
        added++;
      }
    }
  };

  // 1. Unresolved past mistakes (up to ~30% of round)
  const unresolvedMistakes = pool.filter(q => history[q.id] && !history[q.id].lastCorrect);
  take(unresolvedMistakes, Math.ceil(size * 0.3));

  // 2. Tricky trap questions (high-difficulty crossroads, traffic controller, overtaking)
  const trapQuestions = pool.filter(q => q.topicId && TRAP_TOPIC_IDS.includes(q.topicId));
  take(trapQuestions, Math.ceil(size * 0.25));

  // 3. Fresh unseen questions (~35% of round)
  const unseenQuestions = pool.filter(q => !history[q.id]);
  take(unseenQuestions, Math.ceil(size * 0.35));

  // 4. Past correct questions that had mistakes earlier (consolidation revision)
  const consolidation = pool.filter(q => history[q.id]?.lastCorrect && history[q.id].mistakes > 0);
  take(consolidation, Math.ceil(size * 0.15));

  // 5. Fill remaining quota from the entire pool
  take(pool, size);

  // 6. Anti-clustering shuffle: ensure no more than 2 consecutive questions share the same topic
  const finalPool = shuffle(chosen);
  const reordered: T[] = [];
  const remaining = [...finalPool];

  while (remaining.length > 0) {
    let foundIndex = -1;
    const lastTopic = reordered.length > 0 ? reordered[reordered.length - 1].topicId : undefined;
    const secondLastTopic = reordered.length > 1 ? reordered[reordered.length - 2].topicId : undefined;

    // Avoid 3 in a row of the same topic
    for (let i = 0; i < remaining.length; i++) {
      const curTopic = remaining[i].topicId;
      if (curTopic && curTopic === lastTopic && curTopic === secondLastTopic) {
        continue;
      }
      foundIndex = i;
      break;
    }

    if (foundIndex === -1) foundIndex = 0;
    reordered.push(remaining.splice(foundIndex, 1)[0]);
  }

  return reordered;
}

/**
 * Generates an official 30-question exam with an unpredictable mix
 * resembling official Ministry exam distributions (crossroads, signs, speed, first aid, laws)
 */
export function selectExamRound<T extends { id: number; topicId?: number }>(
  pool: T[],
  size = 30,
  random = Math.random
): T[] {
  if (!pool || pool.length === 0) return [];
  if (pool.length <= size) return [...pool].sort(() => random() - 0.5);

  const shuffle = (items: T[]) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  // Group by broad themes
  const prioritiesAndCrossroads = pool.filter(q => q.topicId === 20 || q.topicId === 4);
  const roadSigns = pool.filter(q => q.topicId && [3, 5, 6, 7, 8, 9, 28].includes(q.topicId));
  const rulesAndManeuvers = pool.filter(q => q.topicId && [1, 2, 10, 11, 14, 15, 16, 17, 18, 19].includes(q.topicId));
  const safetyAndSpecial = pool.filter(q => q.topicId && [21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32].includes(q.topicId));

  const chosen: T[] = [];
  const chosenIds = new Set<number>();

  const take = (items: T[], count: number) => {
    for (const q of shuffle(items)) {
      if (chosen.length >= size || count <= 0) break;
      if (!chosenIds.has(q.id)) {
        chosen.push(q);
        chosenIds.add(q.id);
        count--;
      }
    }
  };

  // Balanced official quota
  take(prioritiesAndCrossroads, Math.round(size * 0.3)); // ~9 crossroads
  take(roadSigns, Math.round(size * 0.3)); // ~9 signs
  take(rulesAndManeuvers, Math.round(size * 0.25)); // ~7-8 maneuvers & rules
  take(safetyAndSpecial, Math.round(size * 0.15)); // ~4-5 safety, medicine & laws
  take(pool, size);

  return shuffle(chosen);
}
