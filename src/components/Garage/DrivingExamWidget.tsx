import { TicketReconstruction, ReconstructionSwitch, RECONSTRUCTION_IDS } from './TicketReconstruction';
import { SignsLearning, ExamLeaderboard, ExamAchievement, saveExamScore } from './ExamExtras';
import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { EXAM_CATEGORIES, ExamCategory, examCategory } from './examCategories';
import { sounds } from '../../services/soundEffects';
import { selectStudyRound, selectExamRound } from './adaptiveStudy';
import { ExamCategoryCarouselStrip } from './ExamCategoryCarouselStrip';
import { RegaliaMedalsModal, RegaliaMedalVisual } from './RegaliaMedalsModal';
import {
  DriverLicenseModal,
  getStoredDriverLicense,
  DriverLicenseData
} from './DriverLicenseModal';
import { GraduationCap3D, ShieldAlert3D } from './Exam3DIcons';
import {
  ExamLearningAnalysis,
  readLearningHistory,
  recordLearningAnswer,
  clearLearningHistory,
  seedDemoMistakes,
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
  ChevronDown,
  ChevronUp,
  Crown,
  GraduationCap,
  AlertTriangle,
  ShieldAlert,
  Trash2,
  RefreshCw
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

// Preserve earlier combined-package progress before introducing C1 and D1.
function preserveCombinedCategoryProgress() {
  try {
    const marker = 'autohub.exam.split-categories.v1';
    if (localStorage.getItem(marker)) return;
    for (const [oldCategory, newCategory] of [['C', 'C1'], ['D', 'D1']]) {
      for (const prefix of ['autohub.exam.learning.v1.', 'autohub.exam.academic_override.v1.']) {
        const previous = localStorage.getItem(prefix + oldCategory);
        if (previous && !localStorage.getItem(prefix + newCategory)) {
          localStorage.setItem(prefix + newCategory, previous);
        }
      }
    }
    localStorage.setItem(marker, '1');
  } catch { /* Learning remains available when storage is restricted. */ }
}

export const DrivingExamWidget: React.FC = () => {
  // Category Selector: B (921), A (760), C (954), D (845), AM (327)
  const [activeCategory, setActiveCategory] = useState<ExamCategory>('B');
  const [openReconstruction, setOpenReconstruction] = useState<number | null>(null);
  const [reconstructionsEnabled, setReconstructionsEnabled] = useState(() => {
    try { return localStorage.getItem('autohub.exam.reconstructions.v1') === 'on'; } catch { return false; }
  });
  const toggleReconstructions = (enabled: boolean) => {
    setReconstructionsEnabled(enabled);
    try { localStorage.setItem('autohub.exam.reconstructions.v1', enabled ? 'on' : 'off'); } catch { /* Session preference still works. */ }
  };
  const categoryConfig = examCategory(activeCategory);
  // Media Filter: All, With Photo, Without Photo (Text only)
  const [mediaFilter, setMediaFilter] = useState<'all' | 'with_image' | 'without_image'>('all');
  // Topic search filter
  const [topicSearch, setTopicSearch] = useState('');

  const [learningHistory, setLearningHistory] = useState<LearningHistory>(() => (preserveCombinedCategoryProgress(), readLearningHistory('B')));
  const [historySaved, setHistorySaved] = useState(true);
  const [sessionMode, setSessionMode] = useState<'practice' | 'exam'>('practice');
  const [sessionSubtype, setSessionSubtype] = useState<'standard' | 'mistakes' | 'adaptive' | 'marathon' | 'exam'>('standard');
  const [isMistakesListOpen, setIsMistakesListOpen] = useState(false);
  const [mistakesFilter, setMistakesFilter] = useState<'unresolved' | 'all'>('unresolved');
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

  // Academic Regalia & Medals Modal State
  const [isRegaliaModalOpen, setIsRegaliaModalOpen] = useState(false);

  // Driver's License Modal State & Live Synchronization
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [driverLicense, setDriverLicense] = useState<DriverLicenseData>(getStoredDriverLicense);

  useEffect(() => {
    const handleDriverUpdate = () => {
      setDriverLicense(getStoredDriverLicense());
    };
    window.addEventListener('autohub-driver-updated', handleDriverUpdate);
    window.addEventListener('autohub-vehicle-updated', handleDriverUpdate);
    window.addEventListener('storage', handleDriverUpdate);
    return () => {
      window.removeEventListener('autohub-driver-updated', handleDriverUpdate);
      window.removeEventListener('autohub-vehicle-updated', handleDriverUpdate);
      window.removeEventListener('storage', handleDriverUpdate);
    };
  }, []);

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

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef(0);
  const startedAtRef = useRef(0);
  const finishedAtRef = useRef(0);
  const scoreSavedRef = useRef(false);
  const [extrasTab, setExtrasTab] = useState<'tickets' | 'signs' | 'ranking'>('tickets');

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Derive the countdown from a deadline so background throttling cannot pause it.
  useEffect(() => {
    if (viewMode !== 'exam') return;
    const tick = () => {
      if (finishedAtRef.current) return;
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (!remaining) {
        finishedAtRef.current = deadlineRef.current;
        sounds.playWarning();
        setViewMode('results');
      }
    };
    tick();
    timerRef.current = setInterval(tick, 250);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== 'results' || sessionSubtype !== 'exam' || scoreSavedRef.current) return;
    scoreSavedRef.current = true;
    finishedAtRef.current ||= Date.now();
    const correct = Object.entries(answers).filter(([i, answer]) => activeQuestions[Number(i)]?.correct === answer).length;
    if (Object.keys(answers).length === activeQuestions.length && errorsCount <= categoryConfig.maxErrors && finishedAtRef.current <= deadlineRef.current) {
      saveExamScore(activeCategory, correct, activeQuestions.length, finishedAtRef.current - startedAtRef.current);
    }
  }, [viewMode, sessionSubtype, answers, activeQuestions, errorsCount, activeCategory]);

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
    setOpenReconstruction(null);
    startedAtRef.current = Date.now();
    deadlineRef.current = startedAtRef.current + customTime * 1000;
    finishedAtRef.current = 0;
    scoreSavedRef.current = false;
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

  // Category-specific training simulation.
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
    const pool = [...(filtered.length >= categoryConfig.size ? filtered : questionPool)];
    // AutoHub balanced selection with anti-clustering
    const generated = selectExamRound(pool, categoryConfig.size);
    setSessionSubtype('exam');
    startSession(generated, 'exam', categoryConfig.minutes * 60);
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
    setSessionSubtype('standard');
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
    setSessionSubtype('marathon');
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
      setSessionSubtype('adaptive');
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
      setSessionSubtype('mistakes');
      startSession(questions, 'practice');
    } catch {
      setQuestionLoadError(true);
    }
  };

  // 5b. Dedicated Mistakes Practice (All collected errors or only unresolved ones)
  const handleStartMistakesPractice = async (mode: 'unresolved' | 'all' = 'unresolved') => {
    sounds.playClick();
    try {
      let pool = categoryQuestions;
      if (!pool || pool.length === 0) {
        pool = await loadCategoryQuestions(activeCategory);
      }
      const targetRecords = mode === 'unresolved' && unresolvedMistakes.length > 0
        ? unresolvedMistakes
        : allMistakeRecords;

      if (!targetRecords.length) {
        alert('შეცდომების ბანკი ცარიელია! თქვენ ჯერ არ გაქვთ დაფიქსირებული შეცდომები ამ კატეგორიაში.');
        return;
      }

      const idSet = new Set(targetRecords.map(r => r.id));
      const questions = pool.filter(q => idSet.has(q.id));
      if (!questions.length) {
        const fallback = EXAM_QUESTIONS.filter(q => idSet.has(q.id));
        if (fallback.length) {
          setSessionSubtype('mistakes');
          startSession(fallback, 'practice');
          return;
        }
        alert('არჩეული შეცდომების ბილეთები ვერ მოიძებნა.');
        return;
      }

      setSessionSubtype('mistakes');
      startSession(questions, 'practice');
    } catch {
      setQuestionLoadError(true);
    }
  };

  // Practice a single ticket from mistakes list
  const handlePracticeSingleMistakeQuestion = async (qId: number) => {
    sounds.playClick();
    try {
      let pool = categoryQuestions;
      if (!pool || pool.length === 0) {
        pool = await loadCategoryQuestions(activeCategory);
      }
      const found = pool.find(q => q.id === qId) || EXAM_QUESTIONS.find(q => q.id === qId);
      if (found) {
        setSessionSubtype('mistakes');
        startSession([found], 'practice');
      }
    } catch {
      setQuestionLoadError(true);
    }
  };

  // Clear mistake history
  const handleClearMistakes = () => {
    if (window.confirm('ნამდვილად გსურთ შეცდომების ბანკის გასუფთავება? ყველა დაფიქსირებული შეცდომა განულდება.')) {
      sounds.playClick();
      clearLearningHistory(activeCategory);
      setLearningHistory({});
    }
  };

  // Seed demo mistakes for testing
  const handleSeedDemoMistakes = async () => {
    sounds.playClick();
    let pool: ExamQuestion[];
    try {
      pool = categoryQuestions.length > 0 ? categoryQuestions : await loadCategoryQuestions(activeCategory);
    } catch {
      pool = EXAM_QUESTIONS;
    }
    const sample = (pool.length > 0 ? pool : EXAM_QUESTIONS).slice(0, 5).map(q => ({ id: q.id, topicId: q.topicId }));
    const updated = seedDemoMistakes(activeCategory, sample);
    setLearningHistory({ ...updated });
    sounds.playSuccess();
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
    if (viewMode === 'exam' && Date.now() >= deadlineRef.current) {
      setTimeLeft(0);
      finishedAtRef.current = deadlineRef.current;
      setViewMode('results');
      return;
    }
    if (answers[currentIdx] !== undefined || answeredRef.current.has(currentIdx)) return;
    answeredRef.current.add(currentIdx);
    if (viewMode === 'exam' && answeredRef.current.size === activeQuestions.length) {
      finishedAtRef.current = Date.now();
      setTimeLeft(Math.max(0, Math.ceil((deadlineRef.current - finishedAtRef.current) / 1000)));
    }

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
      if (viewMode === 'exam' && newErrors > categoryConfig.maxErrors) {

        setAcademicAlert({
          type: 'demoted',
          title: 'გადაბარებაც სწავლის ნაწილია 📚',
          desc: `გამოცდაზე გადაჭარბებულია ${categoryConfig.maxErrors} შეცდომის ლიმიტი. გაიმეორეთ შეცდომიანი საკითხები.`,
          regalia: ACADEMIC_RANKS.chainiki.regalia,
          icon: '📚'
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
      setOpenReconstruction(null);
      setCurrentIdx(prev => prev + 1);
    } else {
      // Round completed - evaluate promotion / demotion
      const totalAns = Object.keys(answers).length;
      const totalErr = errorsCount;
      const isFlawless = totalErr === 0 && totalAns >= 10;

      if (isFlawless) {
        // 100% flawless round -> Highest Academic Rank & Regalia!

        setAcademicAlert({
          type: 'promoted',
          title: 'უშეცდომო რაუნდი — სემესტრი ჩაბარებულია! 🎓',
          desc: `საოცარია! ${totalAns}-დან ${totalAns}-ვე კითხვას უშეცდომოდ გაეცით პასუხი (100% სიზუსტე)! კიდევ ერთი ნაბიჯი შემდეგი აკადემიური წოდებისკენ!`,
          regalia: ACADEMIC_RANKS.akademikosi.regalia,
          icon: '👑'
        });
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        sounds.playSuccess();
      } else if (viewMode === 'exam' && totalErr <= categoryConfig.maxErrors) {
        confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
        sounds.playSuccess();
      } else if (totalErr >= 4) {

        setAcademicAlert({
          type: 'demoted',
          title: 'გადაბარებაც სწავლის ნაწილია 📚',
          desc: 'აკადემიკოსსაც სჭირდება გადაბარება. გაიმეორე შეცდომიანი საკითხები — წოდება საერთო პროგრესით განისაზღვრება.',
          regalia: ACADEMIC_RANKS.chainiki.regalia,
          icon: '📚'
        });
      }
      setViewMode('results');
    }
  };

  // Previous Question
  const handlePrev = () => {
    sounds.playClick();
    if (currentIdx > 0) {
      setOpenReconstruction(null);
    setCurrentIdx(prev => prev - 1);
    }
  };

  // Return to Subject Picker / Hub
  const handleToSubjectPicker = () => {
    sounds.playClick();
    if (timerRef.current) clearInterval(timerRef.current);
    setViewMode('subject_picker');
    setSessionSubtype('standard');
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
  const isPassed = answeredCount === activeQuestions.length && errorsCount <= categoryConfig.maxErrors && timeLeft > 0;

  // Cumulative learning calculations & Academic Rank
  const learningRecords = Object.values(learningHistory);
  const cumulativeAttempts = learningRecords.reduce((acc, r) => acc + r.attempts, 0);
  const cumulativeMistakes = learningRecords.reduce((acc, r) => acc + r.mistakes, 0);
  const cumulativeCorrect = Math.max(0, cumulativeAttempts - cumulativeMistakes);
  const academicRank: AcademicRank = getAcademicRank(cumulativeAttempts, cumulativeCorrect, activeCategory);

  // Mistakes Bank Calculations
  const allMistakeRecords = Object.values(learningHistory).filter(r => r.mistakes > 0 || !r.lastCorrect);
  const unresolvedMistakes = Object.values(learningHistory).filter(r => !r.lastCorrect);
  const resolvedMistakes = Object.values(learningHistory).filter(r => r.mistakes > 0 && r.lastCorrect);
  const totalMistakesCount = allMistakeRecords.reduce((acc, r) => acc + r.mistakes, 0);

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
      <ExamAchievement />
      {(viewMode === 'subject_picker' || viewMode === 'results') && <ReconstructionSwitch enabled={reconstructionsEnabled} onChange={toggleReconstructions} />}
      {viewMode === 'subject_picker' && <button type="button" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-navy" onClick={async () => {
        try {
          const questions = await loadCategoryQuestions('B');
          const sample = questions.find(q => q.id === 297);
          if (!sample) return;
          setActiveCategory('B');
          setExtrasTab('tickets');
          setSessionSubtype('standard');
          toggleReconstructions(true);
          startSession([sample], 'practice');
        } catch { setQuestionLoadError(true); }
      }}>რეკონსტრუქციის ნიმუში · ბილეთი #297 →</button>}

      {(viewMode === 'subject_picker' || viewMode === 'results') && (
        <div
          id="driving-exam-section"
          data-tour="fines-exam"
          className="relative p-5 sm:p-7 rounded-[2rem] border-2 transition-all bg-gradient-to-br from-[#0c1222] via-[#11192e] to-[#080d1a] text-white border-gold/50 shadow-2xl space-y-5 overflow-hidden group"
        >
          {/* Thematic Ambient Glows */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          {/* Thematic Road & Speedometer Subtle SVG Watermark */}
          <div className="absolute right-4 bottom-2 opacity-[0.07] pointer-events-none select-none hidden lg:block">
            <svg width="280" height="150" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 140 C 50 30, 230 30, 260 140" stroke="currentColor" strokeWidth="8" strokeDasharray="10 10" />
              <circle cx="140" cy="140" r="85" stroke="currentColor" strokeWidth="4" />
              <line x1="140" y1="140" x2="200" y2="75" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
              <circle cx="140" cy="140" r="14" fill="#f59e0b" />
            </svg>
          </div>

          {/* Main Content Row */}
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-4 border-b border-white/10">

            {/* Left Side: Icon & Big Titles */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                <GraduationCap3D size={58} className="transform hover:scale-105 transition-transform" />
              </div>

              <div className="space-y-1">
                {/* Badges Strip */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-gold text-slate-950 shadow-xs flex items-center gap-1.5">
                    <Sparkles size={12} className="text-navy" />
                    <span>საგამოცდო ბაზა 2026</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-200/90 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    {totalCategoryCount || categoryConfig.count} სასწავლო ბილეთი
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-white/10 text-slate-300 border border-white/10 hidden sm:inline-block">
                    32 სასწავლო თემა • AutoHub
                  </span>
                </div>

                {/* Large Title */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight pt-0.5 flex flex-wrap items-center gap-2">
                  <span>მართვის მოწმობის ბილეთები</span>
                  <span className="text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-xl bg-gold/20 text-gold border border-gold/40">
                    ყველა 10 კატეგორია
                  </span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  საქართველოს შსს მომსახურების სააგენტოს თეორიული გამოცდის სრული სიმულატორი, გამოუცნობი ადაპტური ალგორითმი და აკადემიური მზადების რანგები.
                </p>

                {/* Dashboard Quick Navigation Buttons (Signs & Leaderboard) */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setExtrasTab(extrasTab === 'signs' ? 'tickets' : 'signs');
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border shadow-xs cursor-pointer ${
                      extrasTab === 'signs'
                        ? 'bg-gradient-to-r from-amber-400 to-gold text-slate-950 border-amber-300 ring-2 ring-amber-400/50 shadow-gold'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-gold/60'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-500/90 border border-white/40 flex items-center justify-center text-[11px] shadow-2xs shrink-0 text-white font-bold">
                      🛑
                    </span>
                    <span>საგზაო ნიშნების შესწავლა</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      extrasTab === 'signs' ? 'bg-black/20 text-slate-950 font-bold' : 'bg-white/10 text-amber-300'
                    }`}>
                      252 ნიშანი
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setExtrasTab(extrasTab === 'ranking' ? 'tickets' : 'ranking');
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border shadow-xs cursor-pointer ${
                      extrasTab === 'ranking'
                        ? 'bg-gradient-to-r from-amber-400 to-gold text-slate-950 border-amber-300 ring-2 ring-amber-400/50 shadow-gold'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-gold/60'
                    }`}
                  >
                    <span className="text-sm shrink-0">🏆</span>
                    <span>საუკეთესო ოცეული</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      extrasTab === 'ranking' ? 'bg-black/20 text-slate-950 font-bold' : 'bg-white/10 text-amber-300'
                    }`}>
                      Top 20
                    </span>
                  </button>

                  {extrasTab !== 'tickets' && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setExtrasTab('tickets');
                      }}
                      className="px-3 py-2 rounded-2xl text-xs font-bold text-amber-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>← ბილეთებზე დაბრუნება</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Interactive Thematic Driver's License Card Visual & Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  sounds.playClick();
                  setIsLicenseModalOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsLicenseModalOpen(true);
                  }
                }}
                title="დააჭირეთ მართვის მოწმობის სანახავად / შესავსებად ✎"
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-slate-900/90 to-navy/90 border border-gold/40 hover:border-gold hover:shadow-gold-soft cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98] group relative backdrop-blur-md select-none shrink-0"
              >
                {/* Mini License Photo / Avatar Frame */}
                <div className="w-11 h-14 rounded-xl bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 border border-white/20 p-1 flex flex-col justify-between items-center relative overflow-hidden shrink-0 group-hover:border-gold/60 transition-colors">
                  <div className="w-full flex items-center justify-between text-[7px] font-bold text-white/90">
                    <span>GE</span>
                    <span>🇬🇪</span>
                  </div>

                  {driverLicense.photo ? (
                    <img
                      src={driverLicense.photo}
                      alt="Driver"
                      className="w-7 h-7 rounded-full object-cover border border-gold/50 shadow-xs"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-700/80 border border-gold/40 flex items-center justify-center text-[10px] text-gold font-bold">
                      {driverLicense.firstName ? driverLicense.firstName[0] : '👤'}
                    </div>
                  )}

                  <div className="text-[6px] font-mono text-gold font-bold">DRIVING</div>
                </div>

                {/* License Information Details */}
                <div className="space-y-0.5 text-left pr-1 min-w-[130px] max-w-[190px]">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[8px] sm:text-[9px] font-mono font-black text-gold uppercase tracking-wider truncate">
                      GEORGIA • მოწმობა
                    </span>
                    <span className="text-[10px] text-amber-300 opacity-70 group-hover:opacity-100 transition-opacity">
                      ✎
                    </span>
                  </div>

                  <div className="text-xs font-black text-white truncate">
                    {driverLicense.firstName || driverLicense.lastName
                      ? `${driverLicense.firstName} ${driverLicense.lastName}`.trim()
                      : '+ შეავსეთ პროფილი'}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
                    {driverLicense.personalNumber ? (
                      <>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          {driverLicense.points}/100 ქულა
                        </span>
                        <span className="text-slate-400">• {activeCategory}</span>
                      </>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold">
                        შესავსებად ✎
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Launch Exam Button */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  handleStartExam();
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black shadow-gold-soft shrink-0 bg-gradient-to-r from-amber-400 via-gold to-amber-500 hover:from-amber-300 hover:to-gold text-slate-950 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-amber-300"
              >
                <BookOpen size={16} />
                <span>გამოცდის დაწყება ({categoryConfig.size} კითხვა) →</span>
              </button>
            </div>

          </div>

          {/* Categories Carousel Strip (Interactive switcher) */}
          <div className="pt-1">
            <ExamCategoryCarouselStrip
              activeCategory={activeCategory}
              onSelectCategory={(c) => setActiveCategory(c)}
              onOpenRegaliaModal={() => setIsRegaliaModalOpen(true)}
              currentRankTitle={academicRank.title}
              currentRankLevel={academicRank.level}
            />
          </div>

          {/* 4 Thematic Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 hover:border-gold/40 transition-colors backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 block uppercase font-bold flex items-center gap-1">
                <span>🚗</span>
                <span>{activeCategory} კატეგორია</span>
              </span>
              <span className="text-sm sm:text-base font-black text-gold block mt-1">{totalCategoryCount || 921} ბილეთი</span>
              <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">{withPhotoCount || 588} ილუსტრირებული</span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 hover:border-gold/40 transition-colors backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 block uppercase font-bold flex items-center gap-1">
                <Clock size={11} className="text-white" />
                <span>საგამოცდო დრო</span>
              </span>
              <span className="text-sm sm:text-base font-black text-white block mt-1">{categoryConfig.minutes} წთ / {categoryConfig.size} კითხვა</span>
              <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">სასწავლო ტაიმერი</span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 hover:border-gold/40 transition-colors backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 block uppercase font-bold flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>შეცდომის ლიმიტი</span>
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-400 block mt-1">მაქს. {categoryConfig.maxErrors} შეცდომა</span>
              <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">{categoryConfig.maxErrors + 1}-ე შეცდომა ჩაჭრაა</span>
            </div>

            <div
              onClick={() => {
                sounds.playClick();
                setIsRegaliaModalOpen(true);
              }}
              className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 hover:border-gold/60 transition-all backdrop-blur-sm cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
              title="დააჭირეთ რეგალიებისა და მედლების სანახავად (9 დონე)"
            >
              <span className="text-[10px] text-slate-400 block uppercase font-bold flex items-center justify-between gap-1 group-hover:text-gold transition-colors">
                <span className="flex items-center gap-1">
                  <Award size={11} className="text-amber-300" />
                  <span>აკადემიური სტატუსი</span>
                </span>
                <span className="text-gold text-[9px] font-bold">9 დონე →</span>
              </span>
              <span className="text-sm sm:text-base font-black text-amber-300 block mt-1 truncate">
                {academicRank.icon} {academicRank.title}
              </span>
              <span className="text-[10px] text-slate-400 font-sans mt-0.5 block truncate">
                {academicRank.regalia}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 0B. SIGNS LEARNING VIEW (WHEN SELECTED IN DASHBOARD)    */}
      {/* ======================================================== */}
      {extrasTab === 'signs' && (viewMode === 'subject_picker' || viewMode === 'results') && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 neu-card shadow-neu-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-300 flex items-center justify-center text-lg shadow-2xs">
                🛑
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-navy">
                  საგზაო ნიშნების შესწავლა & კატალოგი
                </h3>
                <p className="text-xs text-slate-500">
                  ოფიციალური საგზაო ნიშნები, განმარტებები და თქვენი ათვისების პროგრესი
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setExtrasTab('tickets');
              }}
              className="btn-stitch-soft px-4 py-2 text-xs font-black text-navy hover:text-gold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>← ბილეთებზე დაბრუნება</span>
            </button>
          </div>
          <SignsLearning />
        </div>
      )}

      {/* ======================================================== */}
      {/* 0C. TOP 20 LEADERBOARD VIEW (WHEN SELECTED IN DASHBOARD) */}
      {/* ======================================================== */}
      {extrasTab === 'ranking' && (viewMode === 'subject_picker' || viewMode === 'results') && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 neu-card shadow-neu-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-lg shadow-2xs">
                🏆
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-navy">
                  საუკეთესო ოცეული (Top 20 Leaderboard)
                </h3>
                <p className="text-xs text-slate-500">
                  {activeCategory} კატეგორიის ჩაბარებული სრული გამოცდების საუკეთესო შედეგები
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setExtrasTab('tickets');
              }}
              className="btn-stitch-soft px-4 py-2 text-xs font-black text-navy hover:text-gold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>← ბილეთებზე დაბრუნება</span>
            </button>
          </div>
          <ExamLeaderboard category={activeCategory} />
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOP LEARNING ANALYSIS & PROGRESS DIAGRAM              */}
      {/* ======================================================== */}
      {extrasTab === 'tickets' && (viewMode === 'subject_picker' || viewMode === 'results') && (
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
      {extrasTab === 'tickets' && viewMode === 'subject_picker' && (
        <section className="p-4 sm:p-6 rounded-3xl neu-card border border-white/80 space-y-5 shadow-neu-card">

          {/* Minimalist Academic Regalia & Medals Status Strip */}
          <div className="p-4 sm:p-5 rounded-3xl neu-card shadow-neu-card border border-white bg-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <RegaliaMedalVisual rank={academicRank} size="md" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-gold/20 text-navy border border-gold/40">
                    დონე {academicRank.level} / 9
                  </span>
                  <span className="text-xs font-black text-navy">
                    {academicRank.title}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline-flex items-center gap-0.5">
                    <Check size={11} className="stroke-[3]" />
                    <span>მოპოვებული რეგალია</span>
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Award size={13} className="text-gold" />
                  <span>რეგალია: <strong className="text-navy">{academicRank.regalia}</strong></span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  ათვისებული: {Object.keys(learningHistory).length} ბილეთი • სიზუსტე: {cumulativeAttempts > 0 ? Math.round((cumulativeCorrect / cumulativeAttempts) * 100) : 0}%
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsRegaliaModalOpen(true);
              }}
              className="btn-stitch-soft w-full md:w-auto px-4 py-2.5 text-xs font-bold text-navy hover:text-gold flex items-center justify-center gap-2 shadow-2xs group transition-all"
            >
              <Sparkles size={14} className="text-gold group-hover:scale-110 transition-transform" />
              <span>რეგალიები & მედლები (9 დონე)</span>
              <span className="text-gold font-bold">→</span>
            </button>
          </div>

          {/* Dedicated Category Carousel Strip (AM, B, A, C, D, C1, D1, Military, Tram, T/S) */}
          <div data-tour="exam-category-tabs" className="py-1">
            <ExamCategoryCarouselStrip
              activeCategory={activeCategory}
              onSelectCategory={(itemCat) => {
                sounds.playClick();
                setActiveCategory(itemCat);
              }}
              onOpenRegaliaModal={() => setIsRegaliaModalOpen(true)}
              currentRankTitle={academicRank.title}
              currentRankLevel={academicRank.level}
            />
          </div>

          {/* Header & Verification Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-navy tracking-tight flex items-center gap-2">
                <span>საგამოცდო ბილეთების პაკეტები & თემები</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-navy/5 text-navy border border-navy/15 font-mono">
                  {categoryConfig.label}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {categoryConfig.verified ? 'ჩაბარების ზღვარი: მომსახურების სააგენტოს წესით.' : 'სასწავლო რეჟიმი · ოფიციალური ფორმატი გადასამოწმებელია.'} პერსონალური პროგრესი თითოეულ თემაში.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setExtrasTab('signs');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-navy hover:text-gold bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>🛑</span>
                <span>საგზაო ნიშნები (252)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setExtrasTab('ranking');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-navy hover:text-gold bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>🏆</span>
                <span>საუკეთესო ოცეული</span>
              </button>

              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl shrink-0">
                სულ: {totalCategoryCount || categoryConfig.count} ბილეთი
              </span>
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
          {/* DEDICATED MISTAKES COLLECTION & REVIEW CENTER            */}
          {/* ======================================================== */}
          <div data-tour="exam-mistakes-center" className="rounded-3xl border-2 border-rose-300/80 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/40 p-4 sm:p-6 space-y-4 shadow-sm relative overflow-hidden">
            {/* Background subtle watermark */}
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-rose-900">
              <ShieldAlert3D size={150} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0 flex items-center justify-center">
                  <ShieldAlert3D size={52} className="transform hover:scale-105 transition-transform" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-navy">
                      შეცდომების კრებული & ბანკი
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      კატეგორია {activeCategory}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ყველა ბილეთი, რომელზეც შეცდომა დაფიქსირდა, აქ გროვდება და მათი გავლა ცალკეა შესაძლებელი
                  </p>
                </div>
              </div>

              {/* Status Indicator & Clear / Seed Actions */}
              <div className="flex items-center gap-2">
                {allMistakeRecords.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearMistakes}
                    className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-bold transition-colors flex items-center gap-1 border border-slate-200/80"
                    title="შეცდომების ისტორიის გასუფთავება"
                  >
                    <Trash2 size={13} />
                    <span>გასუფთავება</span>
                  </button>
                )}
                {allMistakeRecords.length === 0 && (
                  <button
                    type="button"
                    onClick={handleSeedDemoMistakes}
                    className="px-2.5 py-1.5 rounded-xl text-amber-700 hover:bg-amber-100 text-[11px] font-bold transition-colors flex items-center gap-1 border border-amber-200"
                    title="შესამოწმებლად დაამატეთ სატესტო შეცდომები"
                  >
                    <Sparkles size={13} />
                    <span>დემო შეცდომები</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stat Counters & Main Action Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center relative z-10">
              {/* Counters */}
              <div className="md:col-span-7 grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-white/90 border border-rose-200/90 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    გასამეორებელი
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-rose-600 mt-0.5">
                    {unresolvedMistakes.length}
                  </div>
                  <span className="text-[10px] text-rose-700/80 font-medium">აქტიური შეცდომა</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    გასწორებული
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-emerald-700 mt-0.5">
                    {resolvedMistakes.length}
                  </div>
                  <span className="text-[10px] text-emerald-700/80 font-medium">დაძლეული ბილეთი</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    სულ შეცდომა
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-navy mt-0.5">
                    {totalMistakesCount}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">დაფიქსირებული</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleStartMistakesPractice('unresolved')}
                  disabled={unresolvedMistakes.length === 0 && allMistakeRecords.length === 0}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                    unresolvedMistakes.length > 0
                      ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-200 transform hover:scale-[1.01] active:scale-[0.99]'
                      : allMistakeRecords.length > 0
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw size={15} />
                  <span>
                    {unresolvedMistakes.length > 0
                      ? `❌ შეცდომების ცალკე გავლა (${unresolvedMistakes.length} ბილეთი)`
                      : allMistakeRecords.length > 0
                      ? `🔄 ყველა შეცდომის განმეორება (${allMistakeRecords.length})`
                      : 'შეცდომები არ ფიქსირდება'}
                  </span>
                </button>

                {allMistakeRecords.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsMistakesListOpen(!isMistakesListOpen)}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-navy border border-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{isMistakesListOpen ? 'სიის ჩაკეცვა' : `დეტალური სიის ნახვა (${allMistakeRecords.length})`}</span>
                    {isMistakesListOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}
              </div>
            </div>

            {/* Empty State Banner when 0 mistakes */}
            {allMistakeRecords.length === 0 && (
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>შეცდომების ბანკი სუფთაა!</strong> თქვენს მიერ გავლილ ბილეთებში შეცდომები არ ფიქსირდება. გაიარეთ ოფიციალური გამოცდის სიმულატორი ცოდნის შესამოწმებლად.
                </span>
              </div>
            )}

            {/* Expandable Detailed Mistakes List */}
            {isMistakesListOpen && allMistakeRecords.length > 0 && (
              <div className="pt-3 border-t border-rose-200/60 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-navy">შეცდომიანი ბილეთების ჩამონათვალი</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setMistakesFilter('unresolved')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          mistakesFilter === 'unresolved' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        მხოლოდ გაუსწორებელი ({unresolvedMistakes.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMistakesFilter('all')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          mistakesFilter === 'all' ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        ყველა ({allMistakeRecords.length})
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {(mistakesFilter === 'unresolved' ? unresolvedMistakes : allMistakeRecords).map(record => {
                    const subject = PRAVA_SUBJECTS.find(s => s.id === record.topicId);
                    return (
                      <div
                        key={record.id}
                        className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-rose-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-[10px] shrink-0 ${
                            !record.lastCorrect ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            #{record.id}
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-navy truncate">
                              ბილეთი #{record.id} · {subject?.title || `თემა #${record.topicId}`}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span className="text-rose-600 font-semibold">{record.mistakes} შეცდომა</span>
                              <span>·</span>
                              <span>{record.attempts} მცდელობა</span>
                              <span>·</span>
                              <span className={record.lastCorrect ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                                {record.lastCorrect ? '✓ გასწორებული' : '● გაუსწორებელი'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePracticeSingleMistakeQuestion(record.id)}
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-navy/5 hover:bg-navy hover:text-white text-navy text-[10px] font-bold transition-all"
                        >
                          ამ ბილეთის გავლა →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* Quick Start Mode Cards Grid */}
          <div data-tour="exam-modes-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Card 1: Official Exam Simulator */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-navy via-slate-900 to-navy text-white space-y-3 relative overflow-hidden shadow-md flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-gold/20 text-gold text-[10px] font-black uppercase tracking-wider">
                    ოფიციალური
                  </span>
                  <Award size={16} className="text-gold" />
                </div>
                <h3 className="text-sm font-black">გამოცდის სიმულაცია</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {categoryConfig.size} კითხვა · {categoryConfig.minutes} წთ · მაქს. {categoryConfig.maxErrors} შეცდომა.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartExam}
                className="w-full mt-2 py-2.5 rounded-xl bg-gold hover:bg-gold/90 text-navy font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>დაწყება ({categoryConfig.minutes} წთ)</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 2: Mistakes Dedicated Round */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/90 to-amber-50/50 border border-rose-200/90 space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                    შეცდომები ({unresolvedMistakes.length})
                  </span>
                  <ShieldAlert3D size={24} />
                </div>
                <h3 className="text-sm font-black text-navy">შეცდომების ცალკე გავლა</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {unresolvedMistakes.length > 0
                    ? `გაიარეთ მხოლოდ ის ${unresolvedMistakes.length} ბილეთი, სადაც შეცდომა დაუშვით.`
                    : allMistakeRecords.length > 0
                    ? `ყველა დაშვებული შეცდომის განმეორებითი გავლა (${allMistakeRecords.length}).`
                    : 'შეცდომები ჯერ არ ფიქსირდება. ბანკი სუფთაა! 🎉'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleStartMistakesPractice('unresolved')}
                disabled={unresolvedMistakes.length === 0 && allMistakeRecords.length === 0}
                className={`w-full mt-2 py-2.5 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-1.5 ${
                  unresolvedMistakes.length > 0
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    : allMistakeRecords.length > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>ცალკე გავლა →</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 3: Express Test */}
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                    სწრაფი
                  </span>
                  <Zap size={16} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-black text-navy">ექსპრეს ტესტი</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  15 კითხვა · 15 წუთი სწრაფი ცოდნის შესამოწმებლად.
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

            {/* Card 4: Smart Adaptive Study */}
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                    სმარტ-სწავლა
                  </span>
                  <Sparkles size={16} className="text-amber-500" />
                </div>
                <h3 className="text-sm font-black text-navy">ადაპტური სწავლა</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  15 კითხვა: შეცდომები, ახალი ბილეთები & გამეორება.
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

            {/* Card 5: Marathon */}
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                    გამძლეობა
                  </span>
                  <Flame size={16} className="text-rose-600" />
                </div>
                <h3 className="text-sm font-black text-navy">მარათონი (60 ბილეთი)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ინტენსიური ვარჯიში 60 უწყვეტი ბილეთით.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartMarathon}
                className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-black text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>მარათონი →</span>
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
                    <span>შეცდომა: {errorsCount}/{categoryConfig.maxErrors}</span>
                  </div>
                </>
              )}

              {sessionSubtype === 'mistakes' ? (
                <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-xs animate-pulse">
                  <ShieldAlert3D size={18} />
                  <span>შეცდომებზე მუშაობა · {activeQuestions.length} ბილეთი</span>
                </div>
              ) : viewMode === 'practice' ? (
                <div className="px-3 py-1.5 rounded-2xl bg-blue-100 text-blue-900 font-bold text-xs flex items-center gap-1.5">
                  <BookOpen size={14} />
                  <span>სასწავლო რაუნდი · კატეგორია {activeCategory}</span>
                </div>
              ) : null}
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
            {!questionImageUrl && RECONSTRUCTION_IDS.has(currentQ.id) && <>
              {isAnswered ? <button type="button" aria-expanded={openReconstruction === currentQ.id} onClick={() => {
                toggleReconstructions(true);
                setOpenReconstruction(openReconstruction === currentQ.id ? null : currentQ.id);
              }} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-navy hover:border-gold/50">
                {openReconstruction === currentQ.id ? 'რეკონსტრუქციის დამალვა' : 'სურვილის შემთხვევაში · რეკონსტრუქციის ნახვა'}
              </button> : <p className="text-[11px] text-slate-500">პასუხის შემდეგ შეძლებ სასწავლო რეკონსტრუქციის სურვილისამებრ გახსნას.</p>}
              {isAnswered && openReconstruction === currentQ.id && <TicketReconstruction id={currentQ.id} />}
            </>}
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

          {/* Instant Mistake Resolution Feedback Banner */}
          {isAnswered && sessionSubtype === 'mistakes' && (
            <div className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-fade-in ${
              currentAnswer === currentQ.correct
                ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-2xs'
                : 'bg-rose-50 text-rose-950 border border-rose-300 shadow-2xs'
            }`}>
              {currentAnswer === currentQ.correct ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-black text-emerald-700">შესანიშნავია! შეცდომა გასწორებულია!</span>
                    <span className="block text-[11px] text-emerald-800/80 font-normal mt-0.5">
                      ბილეთი წარმატებით დაძლეულია და ამოღებულია შეცდომების სიიდან.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-rose-600 shrink-0" />
                  <div>
                    <span className="font-black text-rose-700">შეცდომა კვლავ დაფიქსირდა</span>
                    <span className="block text-[11px] text-rose-800/80 font-normal mt-0.5">
                      ეს ბილეთი რჩება თქვენს შეცდომების ბანკში. გაეცანით განმარტებას ქვემოთ.
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

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
              {sessionSubtype === 'mistakes'
                ? 'შეცდომებზე მუშაობის რაუნდი დასრულდა'
                : sessionMode === 'practice'
                ? 'სწავლის რაუნდი დასრულდა'
                : isPassed
                ? 'გილოცავთ! გამოცდა ჩაბარებულია!'
                : 'გამოცდა ვერ ჩაბარდა'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {sessionSubtype === 'mistakes'
                ? `ამ რაუნდში გაიარეთ ${activeQuestions.length} შეცდომიანი ბილეთი. აქედან ${correctCount} წარმატებით გასწორდა და მოიხსნა შეცდომების სიიდან!`
                : sessionMode === 'practice'
                ? 'შედეგები შენახულია თქვენს სწავლის ისტორიაში. ქვემოთ შეგიძლიათ გადახედოთ ანალიზს და გაიმეოროთ შეცდომები.'
                : isPassed
                ? `სიმულატორი ჩაბარებულია — დასაშვებია ${categoryConfig.maxErrors} შეცდომა.`
                : `გადააჭარბეთ ${categoryConfig.maxErrors} შეცდომის ლიმიტს, ვერ დაასრულეთ ყველა კითხვა ან ამოიწურა ${categoryConfig.minutes} წუთი.`}
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
            {unresolvedMistakes.length > 0 && (
              <button
                type="button"
                onClick={() => handleStartMistakesPractice('unresolved')}
                className="px-6 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white transform hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <RotateCcw size={15} />
                <span>❌ დარჩენილი შეცდომების გავლა ({unresolvedMistakes.length})</span>
              </button>
            )}

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

      {/* Academic Regalia & Medals Modal (9 Levels) */}
      <RegaliaMedalsModal
        isOpen={isRegaliaModalOpen}
        onClose={() => setIsRegaliaModalOpen(false)}
        currentRank={academicRank}
        uniqueTickets={Object.keys(learningHistory).length}
        accuracy={cumulativeAttempts > 0 ? Math.round((cumulativeCorrect / cumulativeAttempts) * 100) : 0}
        category={activeCategory}
      />

      {/* Driver's License View / Edit Modal */}
      <DriverLicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onSaved={(updated) => setDriverLicense(updated)}
      />
    </div>
  );
};

export default DrivingExamWidget;
