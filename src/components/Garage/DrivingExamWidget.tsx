import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../services/soundEffects';
import {
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Play,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Car,
  Check,
  HelpCircle,
  FileText
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
  // Category Selector: default Category 1 = B, B1 (921 questions)
  const [activeCategory, setActiveCategory] = useState<'B' | 'A' | 'C' | 'D' | 'AM'>('B');
  
  // Subject Selection State (Checkboxes for all 32 subjects)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([1, 3, 4, 5, 10, 20]);
  
  // App View State
  const [viewMode, setViewMode] = useState<'subject_picker' | 'exam' | 'practice' | 'results'>('subject_picker');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 mins
  const [answers, setAnswers] = useState<{ [qIdx: number]: number }>({});
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>(EXAM_QUESTIONS);

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
        setTimeLeft((prev) => {
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

  // Toggle Single Subject
  const handleToggleSubject = (subjectId: number) => {
    sounds.playClick();
    setSelectedSubjectIds(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Select All Subjects
  const handleSelectAll = () => {
    sounds.playClick();
    setSelectedSubjectIds(PRAVA_SUBJECTS.map(s => s.id));
  };

  // Clear All Subjects
  const handleClearAll = () => {
    sounds.playClick();
    setSelectedSubjectIds([]);
  };

  // Start Practicing Selected Subjects
  const handleStartSelectedPractice = () => {
    if (selectedSubjectIds.length === 0) {
      alert('გთხოვთ მონიშნოთ მინიმუმ 1 საგანი / თემა დასაწყებად.');
      return;
    }
    sounds.playClick();
    const filtered = EXAM_QUESTIONS.filter(q => selectedSubjectIds.includes(q.topicId));
    const questionsToUse = filtered.length > 0 ? filtered : EXAM_QUESTIONS;
    setActiveQuestions(questionsToUse);
    setCurrentIdx(0);
    setErrorsCount(0);
    setAnswers({});
    setViewMode('practice');
  };

  // Single Subject Practice One-Touch
  const handleStartSingleSubject = (subjectId: number) => {
    sounds.playClick();
    const filtered = EXAM_QUESTIONS.filter(q => q.topicId === subjectId);
    const questionsToUse = filtered.length > 0 ? filtered : EXAM_QUESTIONS;
    setActiveQuestions(questionsToUse);
    setCurrentIdx(0);
    setErrorsCount(0);
    setAnswers({});
    setViewMode('practice');
  };

  // Start Official 30-min Exam Simulator Mode (30 min, 30 questions, max 3 errors)
  const handleStartExam = () => {
    sounds.playClick();
    const pool = [...EXAM_QUESTIONS];
    const generated = Array.from({ length: 30 }, (_, i) => {
      const template = pool[i % pool.length];
      return {
        ...template,
        id: i + 1
      };
    });

    setActiveQuestions(generated);
    setCurrentIdx(0);
    setErrorsCount(0);
    setTimeLeft(1800);
    setAnswers({});
    setViewMode('exam');
  };

  // Answer handler
  const handleAnswer = (optionIdx: number) => {
    if (answers[currentIdx] !== undefined) return;

    const currentQ = activeQuestions[currentIdx];
    const isCorrect = optionIdx === currentQ.correct;

    setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));

    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playWarning();
      const newErrors = errorsCount + 1;
      setErrorsCount(newErrors);

      // In exam mode: max 3 errors. 4th error = FAIL
      if (viewMode === 'exam' && newErrors >= 4) {
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
      if (viewMode === 'exam') {
        if (errorsCount <= 3) {
          confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
          sounds.playSuccess();
        }
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

  // Return to Subject Picker
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
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setActiveQuestions(prev => prev.map(q => q.id === qId ? { ...q, imageUrl: base64 } : q));
      sounds.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const currentQ = activeQuestions[currentIdx] || activeQuestions[0];
  const currentAnswer = answers[currentIdx];
  const isAnswered = currentAnswer !== undefined;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const isPassed = errorsCount <= 3 && timeLeft > 0;

  // Selected Questions Sum
  const totalSelectedQuestionCount = PRAVA_SUBJECTS
    .filter(s => selectedSubjectIds.includes(s.id))
    .reduce((acc, s) => acc + s.questionCount, 0);

  return (
    <div id="driving-exam-widget" className="space-y-6">

      {/* ======================================================== */}
      {/* 1. PRAVA.GE CLONE: SUBJECT PICKER (საგნების არჩევა)     */}
      {/* ======================================================== */}
      {viewMode === 'subject_picker' && (
        <div className="p-5 sm:p-7 rounded-3xl neu-card shadow-neu-card border border-white space-y-6">
          
          {/* Header Bar: Prava.ge Brand + Notebook & External Links */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy via-slate-800 to-navy text-gold flex items-center justify-center font-black text-xl shadow-md">
                🚦
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-navy tracking-tight">
                    prava.ge • საგნების არჩევა (Subject Picker)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Category 1
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  საქართველოს შსს მომსახურების სააგენტოს თეორიული გამოცდის მოსამზადებელი პორტალი
                </p>
              </div>
            </div>

            {/* Quick Link Buttons: Google Notebook & prava.ge direct */}
            <div className="flex items-center gap-2">
              <a
                href={DRIVER_LICENSE_NOTEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="btn-stitch-primary px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm"
                title="ჩემი პრავის კონსპექტი Google Notebook-ში"
              >
                <BookOpen size={14} />
                <span>ჩემი კონსპექტი ↗</span>
                <ExternalLink size={12} />
              </a>

              <a
                href={PRAVA_GE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="btn-stitch-soft px-3.5 py-2 text-xs font-bold text-navy hover:text-gold flex items-center gap-1.5"
                title="prava.ge-ს ორიგინალი ვებგვერდი"
              >
                <span>prava.ge ↗</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Category Switcher Tabs (B, B1 / A, A1 / C, C1 / D, D1 / AM) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              მართვის მოწმობის კატეგორიები:
            </span>
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
              {[
                { id: 'B' as const, label: 'B, B1 კატეგორია (მსუბუქი ავტომობილი)', count: '921 ბილეთი' },
                { id: 'AM' as const, label: 'AM (მოპედი)', count: '328 ბილეთი' },
                { id: 'A' as const, label: 'A, A1 (მოტოციკლი)', count: '864 ბილეთი' },
                { id: 'C' as const, label: 'C, C1 (სატვირთო)', count: '450 ბილეთი' },
                { id: 'D' as const, label: 'D, D1 (ავტობუსი)', count: '380 ბილეთი' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveCategory(cat.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeCategory === cat.id
                      ? 'bg-navy text-gold shadow-sm'
                      : 'text-slate-600 hover:text-navy hover:bg-white/80'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat.id ? 'bg-gold/20 text-gold' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Toolbar: Multi-select controls & Quick Exam Start */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="btn-stitch-soft px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
              >
                <CheckSquare size={14} className="text-emerald-600" />
                <span>ყველას მონიშვნა</span>
              </button>

              <button
                onClick={handleClearAll}
                className="btn-stitch-soft px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1.5"
              >
                <Square size={14} />
                <span>გასუფთავება</span>
              </button>

              <span className="text-xs font-mono font-bold text-slate-600 ml-1">
                მონიშნულია: <strong className="text-navy">{selectedSubjectIds.length}</strong> / 32 საგანი
                <span className="text-slate-400 ml-1">({totalSelectedQuestionCount} ბილეთი)</span>
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Practice Selected Subjects Button */}
              <button
                onClick={handleStartSelectedPractice}
                disabled={selectedSubjectIds.length === 0}
                className="btn-stitch-primary px-5 py-2.5 text-xs font-black flex items-center justify-center gap-2 flex-1 sm:flex-none shadow-gold-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={15} className="fill-navy" />
                <span>შერჩეულის გავლა ({totalSelectedQuestionCount} ბილეთი)</span>
              </button>

              {/* Real Exam Simulator CTA */}
              <button
                onClick={handleStartExam}
                className="btn-stitch-navy px-5 py-2.5 text-xs font-black flex items-center justify-center gap-2 flex-1 sm:flex-none shadow-sm"
              >
                <Clock size={15} className="text-gold" />
                <span>⏱️ გამოცდა (30 წთ)</span>
              </button>
            </div>
          </div>

          {/* Prava.ge Subject Cards Grid (32 Official Subjects) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-gold" />
                <span>32 ოფიციალური საგამოცდო საგანი / თემა</span>
              </h4>
              <span className="text-xs font-mono font-bold text-slate-400">
                სულ 921 ბილეთი B კატეგორიაში
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRAVA_SUBJECTS.map((subject) => {
                const isSelected = selectedSubjectIds.includes(subject.id);
                return (
                  <div
                    key={subject.id}
                    onClick={() => handleToggleSubject(subject.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer border flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-amber-50/70 border-gold shadow-sm ring-1 ring-gold/40'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Card Top: Checkbox & Question count badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-gold text-navy' : 'border border-slate-300 text-transparent'
                        }`}>
                          <Check size={13} strokeWidth={3} />
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-mono text-[10px] font-bold group-hover:bg-gold/20 group-hover:text-amber-900 transition-colors">
                          {subject.questionCount} ბილეთი
                        </span>
                      </div>

                      {/* Subject Title */}
                      <h5 className="font-extrabold text-xs text-navy leading-snug group-hover:text-amber-900 transition-colors line-clamp-2">
                        {subject.title}
                      </h5>
                    </div>

                    {/* Quick Single Subject Launch */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">
                        {isSelected ? '● მონიშნულია' : 'დააჭირეთ მონიშვნას'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartSingleSubject(subject.id);
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-black text-navy bg-white hover:bg-gold hover:text-navy border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                        title="ამ კონკრეტული საგნის გავლა"
                      >
                        <span>გავლა</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note on legislation */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span><strong>prava.ge სინქრონიზაცია:</strong> ბილეთები შეესაბამება საქართველოს საგზაო მოძრაობის კანონსა და მომსახურების სააგენტოს ბაზას.</span>
            </div>
            <a
              href={PRAVA_GE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono font-bold text-navy hover:text-gold flex items-center gap-1"
            >
              <span>prava.ge/subjectpicker?category=1</span>
              <ExternalLink size={11} />
            </a>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2. QUESTION PRACTICE & EXAM RUNNER                      */}
      {/* ======================================================== */}
      {(viewMode === 'exam' || viewMode === 'practice') && (
        <div className="p-6 sm:p-8 rounded-3xl neu-card shadow-neu-card border border-white space-y-6 animate-fade-in">
          
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
            <button
              onClick={handleToSubjectPicker}
              className="btn-stitch-soft px-4 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>← საგნების არჩევა (prava.ge)</span>
            </button>

            {/* Badges for Exam vs Practice */}
            <div className="flex items-center gap-2.5">
              {viewMode === 'exam' && (
                <>
                  <div className={`px-3.5 py-1.5 rounded-2xl font-mono font-black text-xs flex items-center gap-1.5 shadow-sm ${
                    timeLeft < 300
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    <Clock size={14} />
                    <span>⏱️ {minutes}:{seconds}</span>
                  </div>

                  <div className={`px-3.5 py-1.5 rounded-2xl font-mono font-black text-xs flex items-center gap-1.5 shadow-sm ${
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
                <div className="px-3.5 py-1.5 rounded-2xl bg-blue-100 text-blue-900 font-bold text-xs">
                  📖 შერჩეული საგნების სწავლის რეჟიმი
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar & Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="text-navy font-black">
                კითხვა {currentIdx + 1} / {activeQuestions.length}
              </span>
              <span className="font-mono">
                {Math.round(((currentIdx + 1) / activeQuestions.length) * 100)}% შესრულებულია
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-300 rounded-full"
                style={{ width: `${((currentIdx + 1) / activeQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text Card */}
          <div className="p-5 sm:p-6 rounded-2xl neu-surface border border-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-gold">
                ● ბილეთის შეკითხვა #{currentQ.id} (თემა #{currentQ.topicId})
              </span>
              <label className="cursor-pointer text-[11px] font-bold text-navy hover:text-gold flex items-center gap-1.5 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadQuestionImage(e, currentQ.id)}
                />
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-gold/20 text-slate-700 hover:text-navy border border-slate-200 transition-colors">
                  {currentQ.imageUrl ? 'ფოტოს შეცვლა 📷' : '+ ფოტოს მიბმა 📷'}
                </span>
              </label>
            </div>

            {/* Optional Road Illustration / Diagram Photo */}
            {currentQ.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200/90 max-h-72 flex items-center justify-center bg-slate-900 shadow-inner my-2">
                <img
                  src={currentQ.imageUrl}
                  alt={`საგამოცდო ილუსტრაცია #${currentQ.id}`}
                  className="max-h-72 w-auto object-contain"
                />
              </div>
            )}

            <h4 className="text-base sm:text-lg font-black text-navy leading-snug">
              {currentQ.text}
            </h4>
          </div>

          {/* Multiple Choice Options List */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              let btnStyle = 'neu-btn text-slate-700 hover:text-navy border border-slate-200/80 bg-white';
              
              if (isAnswered) {
                if (idx === currentQ.correct) {
                  btnStyle = 'bg-emerald-50 text-emerald-900 border-2 border-emerald-500 font-bold shadow-sm';
                } else if (currentAnswer === idx) {
                  btnStyle = 'bg-rose-50 text-rose-900 border-2 border-rose-500 font-bold shadow-sm';
                } else {
                  btnStyle = 'opacity-50 border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg neu-circle flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && idx === currentQ.correct && (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && currentAnswer === idx && idx !== currentQ.correct && (
                    <XCircle size={18} className="text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Explanation Box */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1 animate-fade-in shadow-xs">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <Sparkles size={14} className="text-gold" />
                <span>საგამოცდო განმარტება & კანონი:</span>
              </div>
              <p className="leading-relaxed">
                {currentQ.exp}
              </p>
            </div>
          )}

          {/* Navigation Action Buttons Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
            {viewMode === 'practice' ? (
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="btn-stitch-soft px-4 py-2.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>წინა კითხვა</span>
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all ${
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
      {/* 3. EXAM RESULTS & REVIEW VIEW                           */}
      {/* ======================================================== */}
      {viewMode === 'results' && (
        <div className="p-6 sm:p-8 rounded-3xl neu-card shadow-neu-card border border-white text-center space-y-6 animate-fade-in">
          
          <div className="w-20 h-20 rounded-3xl neu-circle flex items-center justify-center mx-auto text-3xl shadow-md">
            {isPassed ? '🎉' : '❌'}
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-navy">
              {isPassed ? 'გილოცავთ! გამოცდა ჩაბარებულია!' : 'სამწუხაროდ, გამოცდა ვერ ჩაბარდა'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isPassed
                ? 'თქვენ წარმატებით დაძლიეთ თეორიული გამოცდის სიმულატორი დასაშვებ 3 შეცდომის ლიმიტში.'
                : 'დაფიქსირდა 4 ან მეტი შეცდომა ან ამოიწურა 30-წუთიანი საგამოცდო დრო.'}
            </p>
          </div>

          {/* Results Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            <div className="p-3.5 rounded-2xl neu-surface border border-white">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">სტატუსი</span>
              <span className={`text-sm font-black ${isPassed ? 'text-emerald-700' : 'text-rose-600'}`}>
                {isPassed ? 'ჩაბარებულია' : 'ჩაიჭრა'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl neu-surface border border-white">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">შეცდომები</span>
              <span className="text-sm font-black font-mono text-navy">
                {errorsCount} / 3 (ლიმიტი)
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
                {activeQuestions.length - errorsCount} / {activeQuestions.length}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleStartExam}
              className="btn-stitch-primary px-6 py-3.5 text-xs font-black flex items-center gap-2 shadow-gold-soft"
            >
              <RotateCcw size={15} />
              <span>ხელახლა გამოცდა</span>
            </button>

            <button
              onClick={handleToSubjectPicker}
              className="btn-stitch-navy px-6 py-3.5 text-xs font-black flex items-center gap-2 shadow-sm"
            >
              <BookOpen size={15} className="text-gold" />
              <span>საგნების არჩევაზე დაბრუნება</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default DrivingExamWidget;
