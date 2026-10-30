import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../services/soundEffects';
import { selectStudyRound, selectExamRound } from './adaptiveStudy';
import {
  ExamLearningAnalysis,
  readLearningHistory,
  recordLearningAnswer,
  LearningHistory,
  getAcademicRank,
  setAcademicOverride,
  ACADEMIC_RANKS,
  AcademicRank
} from './ExamLearningAnalysis';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Filter,
  Search,
  Check,
  CheckSquare,
  Square,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  Flame,
  ShieldCheck,
  ChevronRight,
  Crown,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import { DRIVER_LICENSE_NOTEBOOK_URL } from './GarageModule';

export const PRAVA_GE_URL = 'https://prava.ge/subjectpicker?category=1';

export interface PravaSubject {
  id: number;
  title: string;
  questionCount: number;
  category: 'rules' | 'signs' | 'signals' | 'maneuver' | 'safety' | 'law' | 'special';
}

export const PRAVA_SUBJECTS: PravaSubject[] = [
  { id: 1, title: "1. მძღოლი, მგზავრი და ქვეითი", questionCount: 38, category: 'rules' },
  { id: 2, title: "2. უწესივრობა და მართვა", questionCount: 29, category: 'rules' },
  { id: 3, title: "3. მაფრთხილებელი ნიშნები", questionCount: 52, category: 'signs' },
  { id: 4, title: "4. პრიორიტეტის ნიშნები", questionCount: 46, category: 'signs' },
  { id: 5, title: "5. ამკრძალავი ნიშნები", questionCount: 74, category: 'signs' },
  { id: 6, title: "6. მიმთითებელი ნიშნები", questionCount: 35, category: 'signs' },
  { id: 7, title: "7. საინფორმაციო ნიშნები", questionCount: 48, category: 'signs' },
  { id: 8, title: "8. სერვისის ნიშნები", questionCount: 18, category: 'signs' },
  { id: 9, title: "9. დამატებითი ნიშნები", questionCount: 32, category: 'signs' },
  { id: 10, title: "10. შუქნიშანი", questionCount: 42, category: 'signals' },
  { id: 11, title: "11. მარეგულირებელი", questionCount: 24, category: 'signals' },
  { id: 12, title: "12. სპეციალური სიგნალი", questionCount: 16, category: 'signals' },
  { id: 13, title: "13. საავარიო შუქურა", questionCount: 14, category: 'signals' },
  { id: 14, title: "14. სანათი ხელსაწყოები", questionCount: 22, category: 'rules' },
  { id: 15, title: "15. მანევრირება", questionCount: 38, category: 'maneuver' },
  { id: 16, title: "16. გასწრება", questionCount: 34, category: 'maneuver' },
  { id: 17, title: "17. სიჩქარე", questionCount: 28, category: 'maneuver' },
  { id: 18, title: "18. სამუხრუჭე მანძილი", questionCount: 19, category: 'maneuver' },
  { id: 19, title: "19. გაჩერება დგომა", questionCount: 41, category: 'maneuver' },
  { id: 20, title: "20. გზაჯვარედინის გავლა", questionCount: 88, category: 'maneuver' },
  { id: 21, title: "21. რკინიგზა", questionCount: 18, category: 'special' },
  { id: 22, title: "22. ავტომაგისტრალი", questionCount: 20, category: 'special' },
  { id: 23, title: "23. საცხოვრებელი ზონა", questionCount: 15, category: 'special' },
  { id: 24, title: "24. ბუქსირება", questionCount: 17, category: 'special' },
  { id: 25, title: "25. სასწავლო სვლა", questionCount: 12, category: 'special' },
  { id: 26, title: "26. გადაზიდვები", questionCount: 16, category: 'special' },
  { id: 27, title: "27. ველოსიპედი/მოპედი", questionCount: 21, category: 'special' },
  { id: 28, title: "28. საგზაო მონიშვნა", questionCount: 36, category: 'signs' },
  { id: 29, title: "29. სამედიცინო დახმარება", questionCount: 24, category: 'safety' },
  { id: 30, title: "30. მოძრაობის უსაფრთხოება", questionCount: 31, category: 'safety' },
  { id: 31, title: "31. ადმინისტრაციული კანონი", questionCount: 25, category: 'law' },
  { id: 32, title: "32. ეკო-მართვა", questionCount: 12, category: 'safety' }
];

export interface ExamQuestion {
  id: number;
  topicId: number;
  text: string;
  options: string[];
  correct: number;
  exp: string;
  imageUrl?: string;
  officialTicketId?: number;
  imageFile?: string;
}

export const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 1,
    topicId: 20,
    text: "არარეგულირებად თანაბარმნიშვნელოვან გზაჯვარედინზე ვის აქვს გავლის უპირატესობა?",
    options: [
      "მარცხნიდან მომავალ სატრანსპორტო საშუალებას",
      "მარჯვნიდან მომავალ სატრანსპორტო საშუალებას („მარჯვენა ხელის წესი“)",
      "პირველად მიმსვლელ ავტომობილს",
      "უფრო დიდი ზომის სატვირთო ავტომობილს"
    ],
    correct: 1,
    exp: "თანაბარმნიშვნელოვან გზაჯვარედინზე მოქმედებს „მარჯვენა ხელის წესი“ — მძღოლი ვალდებულია გზა დაუთმოს მარჯვნიდან მომავალ სატრანსპორტო საშუალებას."
  },
  {
    id: 2,
    topicId: 31,
    text: "რა არის ოფიციალური თეორიული გამოცდის ჩაბარებისათვის დაშვებული შეცდომების მაქსიმალური რაოდენობა?",
    options: [
      "1 შეცდომა",
      "3 შეცდომა (30 კითხვაში)",
      "5 შეცდომა",
      "შეცდომა საერთოდ დაუშვებელია"
    ],
    correct: 1,
    exp: "საქართველოს შსს მომსახურების სააგენტოს წესით, თეორიულ გამოცდაზე დაშვებულია მაქსიმუმ 3 შეცდომა. მე-4 შეცდომაზე გამოცდა ითვლება ჩაჭრილად."
  },
  {
    id: 3,
    topicId: 17,
    text: "რა მაქსიმალური სიჩქარეა დაშვებული დასახლებულ პუნქტში, თუ საგზაო ნიშნით სხვა რამ არ არის განსაზღვრული?",
    options: [
      "60 კმ/სთ",
      "50 კმ/სთ (საქართველოს საგზაო მოძრაობის კანონმდებლობით)",
      "70 კმ/სთ",
      "40 კმ/სთ"
    ],
    correct: 1,
    exp: "დასახლებულ პუნქტებში ყველა ტიპის სატრანსპორტო საშუალებისათვის მაქსიმალური დასაშვები სიჩქარეა 50 კმ/სთ, თუ სპეციალური საგზაო ნიშნებით სხვა რეჟიმი არ არის დადგენილი."
  },
  {
    id: 4,
    topicId: 22,
    text: "რა მაქსიმალური სიჩქარითაა დაშვებული მსუბუქი ავტომობილის მოძრაობა ავტომაგისტრალზე?",
    options: [
      "90 კმ/სთ",
      "100 კმ/სთ",
      "110 კმ/სთ",
      "130 კმ/სთ"
    ],
    correct: 2,
    exp: "ავტომაგისტრალზე მსუბუქი ავტომობილებისა და მოტოციკლებისათვის მაქსიმალური დასაშვები სიჩქარეა 110 კმ/სთ."
  },
  {
    id: 5,
    topicId: 10,
    text: "რას ნიშნავს შუქნიშნის ყვითელი მოციმციმე სიგნალი?",
    options: [
      "მოძრაობა აკრძალულია, მალე აინთება წითელი",
      "ნებას რთავს მოძრაობას და აფრთხილებს არარეგულირებადი გზაჯვარედინის ან საფრთხის შესახებ",
      "ავალდებულებს მძღოლს დაუყოვნებლივ გაჩერდეს Stop-ხაზთან",
      "უპირატესობას ანიჭებს მარცხნიდან მომავალ ტრანსპორტს"
    ],
    correct: 1,
    exp: "ყვითელი მოციმციმე სიგნალი ნებას რთავს მოძრაობას და მიუთითებს არარეგულირებადი გზაჯვარედინის ან ქვეითთა გადასასვლელის არსებობაზე."
  },
  {
    id: 6,
    topicId: 11,
    text: "მარეგულირებელს ხელები განზე აქვს გაშლილი (ან დაშვებული). რომელი მხრიდანაა ნებადართული მოძრაობა?",
    options: [
      "მხოლოდ ზურგის მხრიდან",
      "მკერდისა და ზურგის მხრიდან",
      "მარცხენა და მარჯვენა გვერდის მხრიდან",
      "ყველა მხრიდან თანაბრად"
    ],
    correct: 2,
    exp: "როდესაც მარეგულირებელს ხელები გვერდზე აქვს გაშლილი ან დაშვებული: გვერდებიდან მოძრაობა ნებადართულია (პირდაპირ და მარჯვნივ), ხოლო მკერდისა და ზურგის მხრიდან მოძრაობა აკრძალულია."
  },
  {
    id: 7,
    topicId: 31,
    text: "მართვის დროს მობილური ტელეფონის ხელში ჭერით სარგებლობა ითვალისწინებს:",
    options: [
      "მხოლოდ სიტყვიერ გაფრთხილებას",
      "30 ლარიან ჯარიმასა და მართვის მოწმობაზე 10 ქულის დაკლებას",
      "მართვის უფლების 6 თვით შეჩერებას",
      "ქულების დაკლება არ ხდება"
    ],
    correct: 1,
    exp: "მოძრაობისას მობილურით სარგებლობა (hands-free მოწყობილობის გარეშე) ისჯება 30 ლარიანი ჯარიმით და მართვის მოწმობაზე აკლდება 10 ქულა."
  },
  {
    id: 8,
    topicId: 16,
    text: "როდის არის კატეგორიულად აკრძალული წინ მიმავალი ავტომობილის გასწრება?",
    options: [
      "მხოლოდ ღამის საათებში",
      "გზაჯვარედინზე, ქვეითთა გადასასვლელზე, რკინიგზის გადასასვლელზე და შეზღუდული ხილვადობის მოსახვევში",
      "თუ წინ მიმავალი მოძრაობს 40 კმ/სთ სიჩქარით",
      "ცალმხრივ მოძრაობის გზაზე"
    ],
    correct: 1,
    exp: "გასწრება აკრძალულია რეგულირებად და არარეგულირებად გზაჯვარედინებზე, ქვეითთა გადასასვლელზე, რკინიგზაზე და სახიფათო მოსახვევებში."
  },
  {
    id: 9,
    topicId: 28,
    text: "რას ნიშნავს გზის სავალ ნაწილზე დატანილი უწყვეტი (ღერძულა) თეთრი ხაზი?",
    options: [
      "ხაზის გადაკვეთა ნებადართულია მხოლოდ გასწრების დროს",
      "სატრანსპორტო ნაკადების გამყოფი ხაზია, რომლის გადაკვეთაც კატეგორიულად აკრძალულია",
      "მიუთითებს ავტობუსის ზოლზე",
      "მხოლოდ სარეკომენდაციო ხასიათისაა"
    ],
    correct: 1,
    exp: "უწყვეტი ღერძულა ხაზის გადაკვეთა აკრძალულია. მისი გადაკვეთა ითვალისწინებს ადმინისტრაციულ ჯარიმას და მართვის მოწმობაზე ქულების დაკლებას."
  },
  {
    id: 10,
    topicId: 29,
    text: "ძლიერი არტერიული სისხლდენის დროს კიდურზე ლახტის (ტურნიკეტის) დადება დასაშვებია მაქსიმუმ:",
    options: [
      "3-4 საათით",
      "ზაფხულში 1 საათამდე, ზამთარში 30-45 წუთამდე",
      "მხოლოდ 10 წუთით",
      "სანამ დაშავებული საავადმყოფოში არ მივა"
    ],
    correct: 1,
    exp: "ქსოვილების ნეკროზის თავიდან ასაცილებლად, ლახტის დადება დასაშვებია ზაფხულში არაუმეტეს 1 საათისა, ხოლო ზამთარში — არაუმეტეს 30-45 წუთისა."
  }
];

export const DrivingExamWidget: React.FC = () => {
  // Category Selector: B (921), A (760), C (954), D (845), AM (327)
  const [activeCategory, setActiveCategory] = useState<'B' | 'A' | 'C' | 'D' | 'AM'>('B');
  // Media Filter: All, With Photo, Without Photo (Text only)
  const [mediaFilter, setMediaFilter] = useState<'all' | 'with_image' | 'without_image'>('all');
  // Topic search filter
  const [topicSearch, setTopicSearch] = useState('');

  const [learningHistory, setLearningHistory] = useState<LearningHistory>(() => readLearningHistory('B'));
  const [historySaved, setHistorySaved] = useState(true);
  const [sessionMode, setSessionMode] = useState<'practice' | 'exam'>('practice');
  const answeredRef = useRef<Set<number>>(new Set());

  // Ref to question container for smooth auto-scrolling
  const questionCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLearningHistory(readLearningHistory(activeCategory));
    setHistorySaved(true);
  }, [activeCategory]);

  // Subject Selection State (Checkboxes for 32 subjects)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([1, 3, 4, 5, 10, 20]);

  // App View State
  const [viewMode, setViewMode] = useState<'subject_picker' | 'exam' | 'practice' | 'results'>('subject_picker');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 mins (exam mode)
  const [answers, setAnswers] = useState<{ [qIdx: number]: number }>({});
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>(EXAM_QUESTIONS);

  // Dynamic promotion / demotion alert state
  const [academicAlert, setAcademicAlert] = useState<{
    type: 'promoted' | 'demoted';
    title: string;
    desc: string;
    regalia: string;
    icon: string;
  } | null>(null);

  const questionCache = useRef<Record<string, Promise<ExamQuestion[]>>>({});
  const [categoryQuestions, setCategoryQuestions] = useState<ExamQuestion[]>([]);
  const [questionLoadError, setQuestionLoadError] = useState(false);

  const loadCategoryQuestions = (category: string): Promise<ExamQuestion[]> => {
    if (!questionCache.current[category]) {
      questionCache.current[category] = fetch(`${import.meta.env.BASE_URL}data/driving-exam/questions-${category}.json`)
        .then(response => {
          if (!response.ok) throw new Error('Question bank unavailable');
          return response.json();
        })
        .then((questions: ExamQuestion[]) => {
          if (!Array.isArray(questions) || !questions.length) throw new Error('Empty question bank');
          return questions;
        })
        .catch(error => {
          delete questionCache.current[category];
          throw error;
        });
    }
    return questionCache.current[category];
  };

  useEffect(() => {
    let cancelled = false;
    setCategoryQuestions([]);
    setQuestionLoadError(false);
    loadCategoryQuestions(activeCategory)
      .then(questions => {
        if (!cancelled) setCategoryQuestions(questions);
      })
      .catch(() => {
        if (!cancelled) setQuestionLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  // Filter pool by media type (All, Photos only, Text only)
  const filterPoolByMedia = (pool: ExamQuestion[]) => {
    if (mediaFilter === 'with_image') {
      return pool.filter(q => !!q.imageFile || !!q.imageUrl);
    }
    if (mediaFilter === 'without_image') {
      return pool.filter(q => !q.imageFile && !q.imageUrl);
    }
    return pool;
  };

  // Available subjects with question count based on current category
  const availableSubjects = PRAVA_SUBJECTS.map(subject => ({
    ...subject,
    questionCount: categoryQuestions.filter(q => q.topicId === subject.id).length
  }));

  // Filtered subjects for search
  const displayedSubjects = availableSubjects.filter(s =>
    topicSearch.trim() === '' ||
    s.title.toLowerCase().includes(topicSearch.toLowerCase())
  );

  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer Tick during Exam Mode
  useEffect(() => {
    if (viewMode === 'exam') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            sounds.playWarning();
            setViewMode('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewMode]);

  // ==========================================================
  // AUTO-SCROLL TO QUESTION CARD ON QUESTION CHANGE
  // ==========================================================
  useEffect(() => {
    if (viewMode === 'practice' || viewMode === 'exam') {
      const scrollTimeout = setTimeout(() => {
        if (questionCardRef.current) {
          const topOffset = 85;
          const targetY = questionCardRef.current.getBoundingClientRect().top + window.pageYOffset - topOffset;
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });
        }
      }, 40);
      return () => clearTimeout(scrollTimeout);
    }
  }, [currentIdx, viewMode]);

  // Subject Selection Toggles
  const handleToggleSubject = (subjectId: number) => {
    sounds.playClick();
    setSelectedSubjectIds(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSelectAll = () => {
    sounds.playClick();
    setSelectedSubjectIds(availableSubjects.map(s => s.id));
  };

  const handleClearAll = () => {
    sounds.playClick();
    setSelectedSubjectIds([]);
  };

  // Helper to launch a test session
  const startSession = (questions: ExamQuestion[], mode: 'exam' | 'practice', customTime = 1800) => {
    setActiveQuestions(questions);
    setCurrentIdx(0);
    setErrorsCount(0);
    setTimeLeft(customTime);
    setAnswers({});
    answeredRef.current.clear();
    setSessionMode(mode);
    setViewMode(mode);
    setAcademicAlert(null);
  };

  // 1. Official 30-min Exam Simulator (30 questions, 30 min, max 3 errors, unpredictable mix)
  const handleStartExam = async () => {
    sounds.playClick();
    let questionPool: ExamQuestion[];
    try {
      questionPool = await loadCategoryQuestions(activeCategory);
    } catch {
      setQuestionLoadError(true);
      return;
    }
    const filtered = filterPoolByMedia(questionPool);
    const pool = [...(filtered.length >= 30 ? filtered : questionPool)];
    // Unpredictable official exam quota with anti-clustering
    const generated = selectExamRound(pool, 30);
    startSession(generated, 'exam', 1800);
  };

  // 2. Express Test (15 questions, quick 15 min check, unpredictable adaptive mix)
  const handleStartExpress = async () => {
    sounds.playClick();
    let questionPool: ExamQuestion[];
    try {
      questionPool = await loadCategoryQuestions(activeCategory);
    } catch {
      setQuestionLoadError(true);
      return;
    }
    const filtered = filterPoolByMedia(questionPool);
    const pool = [...(filtered.length >= 15 ? filtered : questionPool)];
    const generated = selectStudyRound(pool, learningHistory, 15);
    startSession(generated, 'exam', 900);
  };

  // 3. Marathon Test (60 questions endurance, unpredictable spaced sequence)
  const handleStartMarathon = async () => {
    sounds.playClick();
    let questionPool: ExamQuestion[];
    try {
      questionPool = await loadCategoryQuestions(activeCategory);
    } catch {
      setQuestionLoadError(true);
      return;
    }
    const filtered = filterPoolByMedia(questionPool);
    const pool = [...(filtered.length >= 60 ? filtered : questionPool)];
    const generated = selectStudyRound(pool, learningHistory, Math.min(60, pool.length));
    startSession(generated, 'practice', 3600);
  };

  // 4. Adaptive Smart Study (15 questions combining mistakes, unseen, revision)
  const handleStartSmartStudy = async () => {
    sounds.playClick();
    try {
      const questionPool = await loadCategoryQuestions(activeCategory);
      const filtered = filterPoolByMedia(questionPool);
      const pool = filtered.length >= 15 ? filtered : questionPool;
      const questions = selectStudyRound(pool, learningHistory, 15);
      startSession(questions, 'practice');
    } catch {
      setQuestionLoadError(true);
    }
  };

  // 5. Review Unresolved Mistakes
  const handleReviewMistakes = async (ids: number[]) => {
    try {
      const pool = await loadCategoryQuestions(activeCategory);
      const idSet = new Set(ids);
      const questions = pool.filter(q => idSet.has(q.id));
      if (!questions.length) return;
      startSession(questions, 'practice');
    } catch {
      setQuestionLoadError(true);
    }
  };

  // 6. Selected Subjects Practice
  const handleStartSelectedPractice = async () => {
    if (selectedSubjectIds.length === 0) {
      alert('გთხოვთ მონიშნოთ მინიმუმ 1 თემა დასაწყებად.');
      return;
    }
    sounds.playClick();
    try {
      const questionPool = await loadCategoryQuestions(activeCategory);
      const filteredMedia = filterPoolByMedia(questionPool);
      const filtered = filteredMedia.filter(q => selectedSubjectIds.includes(q.topicId));
      const poolToUse = filtered.length > 0 ? filtered : questionPool.filter(q => selectedSubjectIds.includes(q.topicId));
      if (!poolToUse.length) {
        alert('არჩეულ ფილტრში კითხვები არ მოიძებნა.');
        return;
      }
      startSession(poolToUse, 'practice');
    } catch {
      setQuestionLoadError(true);
    }
  };

  // 7. Single Subject One-Touch
  const handleStartSingleSubject = async (subjectId: number) => {
    sounds.playClick();
    try {
      const questionPool = await loadCategoryQuestions(activeCategory);
      const filteredMedia = filterPoolByMedia(questionPool);
      const filtered = filteredMedia.filter(q => q.topicId === subjectId);
      const poolToUse = filtered.length > 0 ? filtered : questionPool.filter(q => q.topicId === subjectId);
      if (!poolToUse.length) {
        alert('ამ თემაში კითხვები არ მოიძებნა.');
        return;
      }
      startSession(poolToUse, 'practice');
    } catch {
      setQuestionLoadError(true);
    }
  };

  // Reset academic status override (returns to calculated percentage)
  const handleResetRankOverride = () => {
    sounds.playClick();
    setAcademicOverride(activeCategory, null);
    setAcademicAlert(null);
  };

  // Answer handler
  const handleAnswer = (optionIdx: number) => {
    if (answers[currentIdx] !== undefined || answeredRef.current.has(currentIdx)) return;
    answeredRef.current.add(currentIdx);

    const currentQ = activeQuestions[currentIdx];
    const isCorrect = optionIdx === currentQ.correct;
    const progress = recordLearningAnswer(activeCategory, currentQ.id, currentQ.topicId, isCorrect, learningHistory);
    setLearningHistory(progress.history);
    setHistorySaved(progress.saved);

    setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));

    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playWarning();
      const newErrors = errorsCount + 1;
      setErrorsCount(newErrors);

      // In exam mode: max 3 errors. 4th error = FAIL & Demotion to Chainiki
      if (viewMode === 'exam' && newErrors >= 4) {
        setAcademicOverride(activeCategory, 'chainiki');
        setAcademicAlert({
          type: 'demoted',
          title: 'გაქვეითება: „ჩაინიკი მძღოლი“ 🫖',
          desc: 'გამოცდაზე დაფიქსირდა 4 კრიტიკული შეცდომა! თქვენ ჩამოქვეითდით ყველაზე დაბალ საფეხურზე.',
          regalia: ACADEMIC_RANKS.chainiki.regalia,
          icon: '🫖'
        });
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => {
          setViewMode('results');
        }, 1200);
        return;
      }
    }
  };

  // Next Question
  const handleNext = () => {
    sounds.playClick();
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Round completed - evaluate promotion / demotion
      const totalAns = Object.keys(answers).length;
      const totalErr = errorsCount;
      const isFlawless = totalErr === 0 && totalAns >= 10;

      if (isFlawless) {
        // 100% flawless round -> Highest Academic Rank & Regalia!
        setAcademicOverride(activeCategory, 'akademikosi');
        setAcademicAlert({
          type: 'promoted',
          title: 'სრული ტრიუმფი: „საგზაო მოძრაობის აკადემიკოსი“ 👑',
          desc: `საოცარია! ${totalAns}-დან ${totalAns}-ვე კითხვას უშეცდომოდ გაეცით პასუხი (100% სიზუსტე)! გამოუცნობმა ალგორითმმა ვერაფერი დაგაკლოთ — მოგენიჭათ უმაღლესი რეგალია.`,
          regalia: ACADEMIC_RANKS.akademikosi.regalia,
          icon: '👑'
        });
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        sounds.playSuccess();
      } else if (viewMode === 'exam' && totalErr <= 3) {
        confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
        sounds.playSuccess();
      } else if (totalErr >= 4) {
        setAcademicOverride(activeCategory, 'chainiki');
        setAcademicAlert({
          type: 'demoted',
          title: 'გაქვეითება: „ჩაინიკი მძღოლი“ 🫖',
          desc: 'შეცდომების რაოდენობა კრიტიკულია (4+ შეცდომა). თქვენ გაქვეითდით ყველაზე დაბალ საფეხურზე.',
          regalia: ACADEMIC_RANKS.chainiki.regalia,
          icon: '🫖'
        });
      }
      setViewMode('results');
    }
  };

  // Previous Question
  const handlePrev = () => {
    sounds.playClick();
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  // Return to Subject Picker / Hub
  const handleToSubjectPicker = () => {
    sounds.playClick();
    if (timerRef.current) clearInterval(timerRef.current);
    setViewMode('subject_picker');
  };

  // Upload or attach photo to the current question
  const handleUploadQuestionImage = (e: React.ChangeEvent<HTMLInputElement>, qId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target?.result as string;
      setActiveQuestions(prev => prev.map(q => q.id === qId ? { ...q, imageUrl: base64 } : q));
      sounds.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const currentQ = activeQuestions[currentIdx] || activeQuestions[0];
  const questionImageUrl = currentQ?.imageUrl || (currentQ?.imageFile
    ? `${import.meta.env.BASE_URL}data/driving-exam/images/${encodeURIComponent(currentQ.imageFile)}`
    : undefined);
  const currentAnswer = answers[currentIdx];
  const isAnswered = currentAnswer !== undefined;

  // Find topic name for current question
  const currentTopic = PRAVA_SUBJECTS.find(s => s.id === currentQ?.topicId);

  // Keyboard Navigation: keys 1..4 for options, Enter/Right for next, Left for prev
  useEffect(() => {
    if (viewMode !== 'practice' && viewMode !== 'exam') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Keys 1, 2, 3, 4
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIdx = parseInt(e.key, 10) - 1;
        if (currentQ && optIdx < currentQ.options.length) {
          if (answers[currentIdx] === undefined && !answeredRef.current.has(currentIdx)) {
            e.preventDefault();
            handleAnswer(optIdx);
          }
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        if (isAnswered) {
          e.preventDefault();
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (viewMode === 'practice' && currentIdx > 0) {
          e.preventDefault();
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentIdx, isAnswered, activeQuestions, answers]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([index, option]) => activeQuestions[Number(index)]?.correct === option
  ).length;
  const isPassed = answeredCount === activeQuestions.length && errorsCount <= 3 && timeLeft > 0;

  // Cumulative learning calculations & Academic Rank
  const learningRecords = Object.values(learningHistory);
  const cumulativeAttempts = learningRecords.reduce((acc, r) => acc + r.attempts, 0);
  const cumulativeMistakes = learningRecords.reduce((acc, r) => acc + r.mistakes, 0);
  const cumulativeCorrect = Math.max(0, cumulativeAttempts - cumulativeMistakes);
  const academicRank: AcademicRank = getAcademicRank(cumulativeAttempts, cumulativeCorrect, activeCategory);

  // Selected Questions Sum
  const totalSelectedQuestionCount = availableSubjects
    .filter(s => selectedSubjectIds.includes(s.id))
    .reduce((acc, s) => acc + s.questionCount, 0);

  // Category counts
  const totalCategoryCount = categoryQuestions.length;
  const withPhotoCount = categoryQuestions.filter(q => !!q.imageFile || !!q.imageUrl).length;
  const withoutPhotoCount = categoryQuestions.filter(q => !q.imageFile && !q.imageUrl).length;

  return (
    <div id="driving-exam-widget" className="space-y-4">

      {/* ======================================================== */}
      {/* 1. TOP LEARNING ANALYSIS & PROGRESS DIAGRAM              */}
      {/* ======================================================== */}
      {(viewMode === 'subject_picker' || viewMode === 'results') && (
        <div data-tour="exam-academic-analysis">
          <ExamLearningAnalysis
            history={learningHistory}
            subjects={PRAVA_SUBJECTS}
            total={categoryQuestions.length}
            onPractice={handleReviewMistakes}
            saved={historySaved}
            category={activeCategory}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SUBJECT PICKER & TICKET CONFIGURATION HUB             */}
      {/* ======================================================== */}
      {viewMode === 'subject_picker' && (
        <section className="p-4 sm:p-6 rounded-3xl neu-card border border-white/80 space-y-5 shadow-neu-card">

          {/* Header & Category Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🚗</span>
                <h2 className="text-lg sm:text-xl font-black text-navy tracking-tight">
                  საგამოცდო ბილეთების პაკეტები & თემები
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                საქართველოს შსს მომსახურების სააგენტოს ოფიციალური საგამოცდო ბაზა 2026
              </p>
            </div>

            {/* Category Selector Tabs */}
            <div data-tour="exam-category-tabs" className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80">
              {[
                { cat: 'B', label: 'B / B1', desc: 'მსუბუქი', count: 921, icon: '🚗' },
                { cat: 'A', label: 'A / A1', desc: 'მოტოციკლი', count: 760, icon: '🏍️' },
                { cat: 'C', label: 'C / C1', desc: 'სატვირთო', count: 954, icon: '🚚' },
                { cat: 'D', label: 'D / D1', desc: 'ავტობუსი', count: 845, icon: '🚌' },
                { cat: 'AM', label: 'AM', desc: 'მოპედი', count: 327, icon: '🛵' }
              ].map(item => {
                const isActive = activeCategory === item.cat;
                return (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setActiveCategory(item.cat as typeof activeCategory);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-navy text-white shadow-xs'
                        : 'text-slate-600 hover:text-navy hover:bg-white/60'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Media Type Filter Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Filter size={14} className="text-gold" />
              <span>ბილეთების ტიპი:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'all', label: 'ყველა ბილეთი', count: totalCategoryCount || 921, icon: '🌐' },
                { key: 'with_image', label: 'ფოტოებიანი ბილეთები', count: withPhotoCount || 588, icon: '📷' },
                { key: 'without_image', label: 'ტექსტური / ულითო ბილეთები', count: withoutPhotoCount || 333, icon: '📝' }
              ].map(f => {
                const isSelected = mediaFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setMediaFilter(f.key as typeof mediaFilter);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-white text-navy border-gold shadow-xs ring-1 ring-gold/40'
                        : 'bg-white/60 text-slate-600 border-slate-200/70 hover:bg-white'
                    }`}
                  >
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                    <span className="text-[10px] font-mono text-slate-400">({f.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* Quick Start Mode Cards Grid                              */}
          {/* ======================================================== */}
          <div data-tour="exam-modes-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Official Exam Simulator */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-navy via-slate-900 to-navy text-white space-y-3 relative overflow-hidden shadow-md flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-gold/20 text-gold text-[10px] font-black uppercase tracking-wider">
                    ოფიციალური
                  </span>
                  <Award size={16} className="text-gold" />
                </div>
                <h3 className="text-base font-black">გამოცდის სიმულაცია</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  30 კითხვა · 30 წუთი · მაქს. 3 შეცდომა. ზუსტად როგორც სააგენტოში.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartExam}
                className="w-full mt-2 py-2.5 rounded-xl bg-gold hover:bg-gold/90 text-navy font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>დაწყება (30 წთ)</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 2: Express Test */}
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                    სწრაფი
                  </span>
                  <Zap size={16} className="text-blue-600" />
                </div>
                <h3 className="text-base font-black text-navy">ექსპრეს ტესტი</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  15 კითხვა · 15 წუთი. იდეალურია სწრაფი ცოდნის შესამოწმებლად.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartExpress}
                className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-black text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>ექსპრეს რაუნდი</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 3: Smart Adaptive Study */}
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                    სმარტ-სწავლა
                  </span>
                  <Sparkles size={16} className="text-amber-500" />
                </div>
                <h3 className="text-base font-black text-navy">ადაპტური სწავლა</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  15 კითხვა: თქვენი შეცდომები, ახალი ბილეთები და განმეორება.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartSmartStudy}
                className="w-full mt-2 py-2.5 rounded-xl btn-stitch-primary font-black text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>სწავლის დაწყება</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 4: Marathon */}
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                    გამძლეობა
                  </span>
                  <Flame size={16} className="text-rose-600" />
                </div>
                <h3 className="text-base font-black text-navy">მარათონი (60 ბილეთი)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ინტენსიური ვარჯიში 60 უწყვეტი ბილეთით შეცდომების გარეშე.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartMarathon}
                className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-black text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>მარათონის დაწყება</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* Topic-by-Topic Study (32 Topics)                         */}
          {/* ======================================================== */}
          <div data-tour="exam-topics-grid" className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-navy uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={16} className="text-gold" />
                  <span>თემატური სწავლება (32 ოფიციალური თემა)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  მონიშნეთ თქვენთვის სასურველი თემები ან გაიარეთ თითოეული ცალ-ცალკე
                </p>
              </div>

              {/* Topic Search & Actions */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={topicSearch}
                    onChange={e => setTopicSearch(e.target.value)}
                    placeholder="თემის ძიება..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-navy focus:outline-none focus:ring-1 focus:ring-navy w-36 sm:w-44"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                >
                  ყველა
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                >
                  გასუფთავება
                </button>
              </div>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {displayedSubjects.map(sub => {
                const isSelected = selectedSubjectIds.includes(sub.id);
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleToggleSubject(sub.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-navy/5 border-navy/30 ring-1 ring-navy/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-navy text-white' : 'border border-slate-300 text-transparent'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-navy truncate" title={sub.title}>
                          {sub.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {sub.questionCount} ბილეთი
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleStartSingleSubject(sub.id);
                      }}
                      className="shrink-0 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-gold/20 hover:text-navy text-[10px] font-black text-slate-600 transition-colors"
                      title="ამ თემის გავლა"
                    >
                      დაწყება →
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Practice Selected Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                მონიშნულია <strong className="text-navy">{selectedSubjectIds.length}</strong> თემა ({totalSelectedQuestionCount} ბილეთი)
              </span>

              <button
                type="button"
                onClick={handleStartSelectedPractice}
                disabled={selectedSubjectIds.length === 0}
                className="btn-stitch-primary px-5 py-2.5 text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>მონიშნული თემების გავლა ({totalSelectedQuestionCount})</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {questionLoadError && (
            <p role="alert" className="text-xs text-rose-600 font-bold">
              ბილეთების ჩატვირთვა ვერ მოხერხდა. გთხოვთ გადაამოწმოთ კავშირი და სცადოთ ხელახლა.
            </p>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* 3. QUESTION PRACTICE & EXAM RUNNER                      */}
      {/* ======================================================== */}
      {(viewMode === 'exam' || viewMode === 'practice') && (
        <div
          ref={questionCardRef}
          className="p-3 sm:p-6 rounded-3xl neu-card shadow-neu-card border border-white/80 space-y-4 animate-fade-in"
        >
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <button
              onClick={handleToSubjectPicker}
              className="btn-stitch-soft px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>← მთავარზე დაბრუნება</span>
            </button>

            {/* Badges for Exam vs Practice & Academic Rank */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Academic Rank Pill */}
              <div
                className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-xs border ${academicRank.badgeColor}`}
                title={`აკადემიური სტატუსი: ${academicRank.title} (${academicRank.regalia})`}
              >
                <span>{academicRank.icon}</span>
                <span className="hidden sm:inline">{academicRank.title}</span>
              </div>

              {/* Dynamic Live Round Score Counter */}
              <div
                className="px-3 py-1.5 rounded-2xl bg-white text-navy border border-slate-200/90 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                title="ამ რაუნდში სწორი პასუხების რაოდენობა"
              >
                <span>🎯</span>
                <span>{correctCount} / {answeredCount} სწორი</span>
                {answeredCount > 0 && (
                  <span className="text-[10px] text-slate-400">
                    ({Math.round((correctCount / answeredCount) * 100)}%)
                  </span>
                )}
              </div>

              {/* Unpredictable Adaptive Algorithm Badge */}
              <div
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200/80 shadow-2xs"
                title="გამოუცნობი ალგორითმი: ანტი-კლასტერირება, მახე-კითხვები და გადანაცვლებული ბილეთები"
              >
                <Sparkles size={12} className="text-gold" />
                <span>გამოუცნობი ალგორითმი</span>
              </div>

              {viewMode === 'exam' && (
                <>
                  <div className={`px-3 py-1.5 rounded-2xl font-mono font-black text-xs flex items-center gap-1.5 shadow-xs ${
                    timeLeft < 300
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    <Clock size={14} />
                    <span>⏱️ {minutes}:{seconds}</span>
                  </div>

                  <div className={`px-3 py-1.5 rounded-2xl font-mono font-black text-xs flex items-center gap-1.5 shadow-xs ${
                    errorsCount >= 3
                      ? 'bg-rose-500 text-white'
                      : errorsCount > 0
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <XCircle size={14} />
                    <span>შეცდომა: {errorsCount}/3</span>
                  </div>
                </>
              )}

              {viewMode === 'practice' && (
                <div className="px-3 py-1.5 rounded-2xl bg-blue-100 text-blue-900 font-bold text-xs flex items-center gap-1.5">
                  <BookOpen size={14} />
                  <span>სასწავლო რაუნდი · კატეგორია {activeCategory}</span>
                </div>
              )}
            </div>
          </div>

          {/* Question Navigator Strip (1..30 pills) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="text-navy font-black">
                კითხვა {currentIdx + 1} / {activeQuestions.length}
              </span>
              <span className="font-mono text-slate-600">
                {answeredCount}/{activeQuestions.length} ({Math.round((answeredCount / activeQuestions.length) * 100)}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-300 rounded-full"
                style={{ width: `${(answeredCount / activeQuestions.length) * 100}%` }}
              />
            </div>

            {/* Numbered Pills Horizontal Scroll Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1 scrollbar-thin">
              {activeQuestions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const ans = answers[idx];
                const isAns = ans !== undefined;
                const isCor = isAns && ans === q.correct;

                let pillColor = 'bg-white text-slate-700 border-slate-200 hover:border-slate-300';
                if (isCurrent) {
                  pillColor = 'bg-navy text-white font-black ring-2 ring-gold shadow-xs border-navy';
                } else if (isAns) {
                  if (viewMode === 'exam') {
                    pillColor = 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
                  } else {
                    pillColor = isCor
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                  }
                }

                return (
                  <button
                    key={q.id || idx}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setCurrentIdx(idx);
                    }}
                    className={`h-7 min-w-[28px] px-1.5 shrink-0 rounded-lg text-xs font-mono transition-all flex items-center justify-center border shadow-2xs ${pillColor}`}
                    title={`კითხვა #${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* Question Text & Media Card                               */}
          {/* ======================================================== */}
          <div className="p-4 sm:p-6 rounded-2xl neu-surface border border-white space-y-3">
            {/* Meta tags: Ticket ID, Topic, Photo status */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100/90 pb-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase text-gold bg-gold/10 px-2 py-0.5 rounded-md">
                  ● ბილეთი #{currentQ.id}
                </span>
                <span className="text-[11px] font-bold text-slate-600">
                  {currentTopic ? currentTopic.title : `თემა #${currentQ.topicId}`}
                </span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {questionImageUrl ? '📷 ილუსტრაციით' : '📝 ტექსტური ბილეთი'}
                </span>
              </div>

              <label className="cursor-pointer text-[11px] font-bold text-navy hover:text-gold flex items-center gap-1.5 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleUploadQuestionImage(e, currentQ.id)}
                />
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-gold/20 text-slate-700 hover:text-navy border border-slate-200 transition-colors">
                  {questionImageUrl ? 'ფოტოს შეცვლა 📷' : '+ ფოტოს მიბმა 📷'}
                </span>
              </label>
            </div>

            {/* Road Illustration / Diagram Photo */}
            {questionImageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200/90 max-h-80 flex items-center justify-center bg-slate-900 shadow-inner my-2">
                <img
                  src={questionImageUrl}
                  loading="eager"
                  decoding="async"
                  alt={`საგამოცდო ილუსტრაცია #${currentQ.id}`}
                  className="max-h-80 w-auto object-contain"
                />
              </div>
            )}

            {/* Question Text */}
            <h4 className="text-base sm:text-lg font-black text-navy leading-snug pt-1">
              {currentQ.text}
            </h4>
          </div>

          {/* ======================================================== */}
          {/* Multiple Choice Options List                             */}
          {/* ======================================================== */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              let btnStyle = 'neu-btn text-slate-800 hover:text-navy border border-slate-200/90 bg-white hover:border-navy/30';

              if (isAnswered) {
                if (idx === currentQ.correct) {
                  btnStyle = 'bg-emerald-50 text-emerald-950 border-2 border-emerald-500 font-bold shadow-xs';
                } else if (currentAnswer === idx) {
                  btnStyle = 'bg-rose-50 text-rose-950 border-2 border-rose-500 font-bold shadow-xs';
                } else {
                  btnStyle = 'opacity-40 border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg neu-circle flex items-center justify-center font-mono font-bold text-xs shrink-0 text-navy bg-slate-100">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isAnswered && (
                      <span className="hidden sm:inline-block text-[10px] font-mono text-slate-300 font-semibold uppercase">
                        [{idx + 1}]
                      </span>
                    )}
                    {isAnswered && idx === currentQ.correct && (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && currentAnswer === idx && idx !== currentQ.correct && (
                      <XCircle size={18} className="text-rose-600 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instant Explanation Box */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <Sparkles size={14} className="text-gold" />
                <span>საგამოცდო განმარტება & კანონი:</span>
              </div>
              <p className="leading-relaxed">
                {currentQ.exp}
              </p>
            </div>
          )}

          {/* Round Accuracy & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100" aria-live="polite">
            <span>
              სიზუსტე: <strong className="text-navy">{answeredCount ? `${Math.round((100 * correctCount) / answeredCount)}%` : '—'}</strong> ({correctCount} სწორი / {answeredCount} პასუხი)
            </span>
            <span className="hidden sm:inline-block text-[11px] text-slate-400">
              კლავიატურა: [1-4] არჩევა · [Enter / →] შემდეგი
            </span>
          </div>

          {/* Navigation Action Buttons Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
            {viewMode === 'practice' ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="btn-stitch-soft px-4 py-2.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>წინა კითხვა</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              disabled={!isAnswered}
              className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-xs ${
                isAnswered
                  ? 'btn-stitch-primary'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <span>{currentIdx < activeQuestions.length - 1 ? 'შემდეგი კითხვა' : 'შედეგების ნახვა'}</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 4. EXAM RESULTS & REVIEW VIEW                           */}
      {/* ======================================================== */}
      {viewMode === 'results' && (
        <div className="p-6 sm:p-8 rounded-3xl neu-card shadow-neu-card border border-white text-center space-y-6 animate-fade-in">

          <div className="w-20 h-20 rounded-3xl neu-circle flex items-center justify-center mx-auto text-3xl shadow-md">
            {sessionMode === 'practice' ? '📖' : isPassed ? '🎉' : '❌'}
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-navy">
              {sessionMode === 'practice'
                ? 'სწავლის რაუნდი დასრულდა'
                : isPassed
                ? 'გილოცავთ! გამოცდა ჩაბარებულია!'
                : 'გამოცდა ვერ ჩაბარდა'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {sessionMode === 'practice'
                ? 'შედეგები შენახულია თქვენს სწავლის ისტორიაში. ქვემოთ შეგიძლიათ გადახედოთ ანალიზს და გაიმეოროთ შეცდომები.'
                : isPassed
                ? 'თქვენ წარმატებით დაძლიეთ თეორიული გამოცდის სიმულატორი დასაშვები 3 შეცდომის ლიმიტში.'
                : 'დაფიქსირდა 4 ან მეტი შეცდომა ან ამოიწურა 30-წუთიანი საგამოცდო დრო.'}
            </p>
          </div>

          {/* Academic Promotion / Demotion Alert Banner */}
          {academicAlert ? (
            <div className={`p-4 sm:p-5 rounded-2xl border text-left max-w-xl mx-auto space-y-2 animate-fade-in shadow-sm ${
              academicAlert.type === 'promoted'
                ? 'bg-gradient-to-r from-amber-400/20 via-gold/15 to-amber-200/20 border-amber-300 ring-2 ring-gold/40'
                : 'bg-rose-50 border-rose-300 ring-1 ring-rose-400/30'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{academicAlert.icon}</span>
                  <span className="text-sm font-black text-navy">{academicAlert.title}</span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                  academicAlert.type === 'promoted' ? 'bg-amber-400 text-navy' : 'bg-rose-200 text-rose-900'
                }`}>
                  {academicAlert.type === 'promoted' ? 'უმაღლესი რეგალია' : 'გაქვეითება'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {academicAlert.desc}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                <span className="font-bold text-navy flex items-center gap-1.5">
                  <Award size={13} className="text-gold" />
                  <span>რეგალია: {academicAlert.regalia}</span>
                </span>
                {academicAlert.type === 'demoted' && (
                  <button
                    type="button"
                    onClick={handleResetRankOverride}
                    className="text-[10px] text-rose-700 font-bold hover:underline"
                  >
                    სტატუსის განულება ↺
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-2xl border text-left max-w-xl mx-auto flex items-center justify-between gap-3 ${academicRank.badgeColor}`}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{academicRank.icon}</span>
                <div>
                  <div className="text-xs font-black">{academicRank.title}</div>
                  <div className="text-[11px] opacity-80">{academicRank.regalia}</div>
                </div>
              </div>
              {academicRank.id === 'chainiki' && (
                <button
                  type="button"
                  onClick={handleResetRankOverride}
                  className="px-2.5 py-1 rounded-xl bg-white/80 hover:bg-white text-[10px] font-bold text-rose-800 shadow-2xs"
                >
                  განულება ↺
                </button>
              )}
            </div>
          )}

          {/* Results Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            <div className="p-3.5 rounded-2xl neu-surface border border-white">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">სტატუსი</span>
              <span className={`text-sm font-black ${isPassed ? 'text-emerald-700' : 'text-rose-600'}`}>
                {sessionMode === 'practice' ? 'სწავლა' : isPassed ? 'ჩაბარებულია' : 'ჩაიჭრა'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl neu-surface border border-white">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">შეცდომები</span>
              <span className="text-sm font-black font-mono text-navy">
                {errorsCount}{sessionMode === 'exam' ? ' / 3 (ლიმიტი)' : ' შეცდომა'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl neu-surface border border-white">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">დარჩენილი დრო</span>
              <span className="text-sm font-black font-mono text-navy">
                {minutes}:{seconds}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl neu-surface border border-white">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">კითხვები</span>
              <span className="text-sm font-black font-mono text-emerald-700">
                {correctCount} სწორი / {answeredCount} პასუხი
              </span>
            </div>
          </div>

          {/* Cumulative Academic Overview Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1.5">
              <span>📊</span>
              <span>საერთო აკადემიური ბაზა ({activeCategory} კატეგორია):</span>
            </span>
            <span className="font-mono font-black text-navy">
              {cumulativeCorrect} სწორი / {cumulativeAttempts} ნაპასუხები ({cumulativeAttempts > 0 ? Math.round((cumulativeCorrect / cumulativeAttempts) * 100) : 0}% სიზუსტე)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleStartExam}
              className="btn-stitch-primary px-6 py-3.5 text-xs font-black flex items-center gap-2 shadow-gold-soft"
            >
              <RotateCcw size={15} />
              <span>ხელახლა გამოცდა</span>
            </button>

            <button
              type="button"
              onClick={handleStartSmartStudy}
              className="btn-stitch-soft px-6 py-3.5 text-xs font-black flex items-center gap-2"
            >
              <Sparkles size={15} className="text-gold" />
              <span>ადაპტური სწავლის რაუნდი →</span>
            </button>

            <button
              type="button"
              onClick={handleToSubjectPicker}
              className="btn-stitch-navy px-6 py-3.5 text-xs font-black flex items-center gap-2 shadow-sm"
            >
              <BookOpen size={15} className="text-gold" />
              <span>სწავლის მთავარზე დაბრუნება</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default DrivingExamWidget;
