import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Award, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Check, 
  Loader2, 
  GraduationCap, 
  HelpCircle, 
  Lightbulb, 
  Target,
  Trophy,
  Flame,
  Star,
  Compass,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Quiz, QuizDifficulty } from './types';

const LOADING_MESSAGES = [
  "Formulating exactly 10 high-integrity educational questions...",
  "Styling options A, B, C, and D with precise academic logic...",
  "Integrating your customized sub-topic into the curriculum core...",
  "Writing deep, informative educational explanation modules...",
  "Double-checking that only one single option is strictly correct...",
  "Curating beautiful visual assets and interactive checks...",
  "Compiling your custom, high-fidelity assessment key..."
];

const POPULAR_TOPICS = [
  { name: "History", subTopic: "The Rise of Ancient Egypt", icon: "🏛️", color: "from-amber-400 to-orange-500", bgLight: "bg-amber-50", textClass: "text-amber-700" },
  { name: "Biology", subTopic: "Photosynthesis & Botany Cycles", icon: "🌱", color: "from-emerald-400 to-teal-500", bgLight: "bg-emerald-50", textClass: "text-emerald-700" },
  { name: "Computer Science", subTopic: "Machine Learning & Neural Nets", icon: "🤖", color: "from-blue-400 to-indigo-500", bgLight: "bg-blue-50", textClass: "text-blue-700" },
  { name: "Medicine", subTopic: "Cardiovascular Anatomy", icon: "🫀", color: "from-rose-400 to-pink-500", bgLight: "bg-rose-50", textClass: "text-rose-700" },
  { name: "Astronomy", subTopic: "Black Holes & Stellar Life", icon: "🌌", color: "from-violet-400 to-fuchsia-500", bgLight: "bg-violet-50", textClass: "text-violet-700" },
  { name: "Literature", subTopic: "Shakespearean Tragedies", icon: "📚", color: "from-cyan-400 to-sky-500", bgLight: "bg-cyan-50", textClass: "text-cyan-700" }
];

export default function App() {
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('mixed');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Progress states
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [questionConfirmed, setQuestionConfirmed] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [history, setHistory] = useState<Array<{
    questionNumber: number;
    questionText: string;
    selected: 'A' | 'B' | 'C' | 'D';
    correct: 'A' | 'B' | 'C' | 'D';
    isCorrect: boolean;
    explanation: string;
    options: { A: string; B: string; C: string; D: string };
  }>>([]);

  const [quizState, setQuizState] = useState<'create' | 'taking' | 'results'>('create');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cycling loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerateQuiz = async (selectedTopic: string = topic, selectedSubTopic: string = subTopic) => {
    const mainTopicStr = selectedTopic.trim();
    if (!mainTopicStr) {
      setErrorMessage("Please enter a main topic/subject before continuing.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setQuestionConfirmed(false);
    setScore(0);
    setHistory([]);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: mainTopicStr,
          subTopic: selectedSubTopic.trim(),
          difficulty,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "An error occurred while generating the quiz.");
      }

      const data: Quiz = await response.json();
      
      if (!data.questions || data.questions.length !== 10) {
        throw new Error("Received an invalid quiz format. The quiz must contain exactly 10 questions.");
      }

      setQuiz(data);
      setQuizState('taking');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAnswer = () => {
    if (!quiz || !selectedOption || questionConfirmed) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isAnswerCorrect = selectedOption === currentQuestion.correctOption;

    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
    }

    setHistory(prev => [
      ...prev,
      {
        questionNumber: currentQuestion.questionNumber,
        questionText: currentQuestion.questionText,
        selected: selectedOption,
        correct: currentQuestion.correctOption,
        isCorrect: isAnswerCorrect,
        explanation: currentQuestion.explanation,
        options: currentQuestion.options
      }
    ]);

    setQuestionConfirmed(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < 9) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setQuestionConfirmed(false);
    } else {
      setQuizState('results');
    }
  };

  const getScoreDetails = (correctCount: number) => {
    const percentage = Math.round((correctCount / 10) * 100);
    if (correctCount === 10) {
      return {
        title: "Absolute Perfection! 🏆",
        description: "You got every single question correct! Flawless conceptual understanding.",
        gradient: "from-emerald-500 via-teal-500 to-emerald-700",
        badgeColor: "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50",
        colorClass: "border-emerald-900/50 bg-emerald-950/20"
      };
    } else if (correctCount >= 8) {
      return {
        title: "Exceptional Achievement! 🎓",
        description: "Spectacular result! You've proven deep domain comprehension.",
        gradient: "from-red-500 via-rose-600 to-red-800",
        badgeColor: "bg-red-950/40 text-red-400 border border-red-900/50",
        colorClass: "border-red-900/50 bg-red-950/20"
      };
    } else if (correctCount >= 5) {
      return {
        title: "Superb Foundations! 📚",
        description: "Great progress! Check out the answers key below to master the remaining items.",
        gradient: "from-amber-500 via-orange-600 to-yellow-600",
        badgeColor: "bg-amber-950/40 text-amber-400 border border-amber-900/50",
        colorClass: "border-amber-900/50 bg-amber-950/20"
      };
    } else {
      return {
        title: "Keep Building! 💪",
        description: "Every wrong choice is an open gate to learning. Dive into the customized explanations.",
        gradient: "from-red-600 via-rose-700 to-red-950",
        badgeColor: "bg-red-950/50 text-red-400 border border-red-900/50",
        colorClass: "border-red-950 bg-red-950/30"
      };
    }
  };

  const resetQuiz = () => {
    setTopic('');
    setSubTopic('');
    setDifficulty('mixed');
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setQuestionConfirmed(false);
    setScore(0);
    setHistory([]);
    setQuizState('create');
    setErrorMessage(null);
  };

  const restartQuizSameTopic = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setQuestionConfirmed(false);
    setScore(0);
    setHistory([]);
    setQuizState('taking');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans antialiased relative overflow-hidden flex flex-col selection:bg-red-500/20 selection:text-red-200">
      
      {/* Playful Crimson and Ruby Decorative Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-red-950/40 via-rose-950/20 to-transparent rounded-full blur-3xl -z-10 animate-pulse duration-10000"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-red-900/20 via-neutral-950 to-transparent rounded-full blur-3xl -z-10 animate-pulse duration-10000"></div>

      {/* Header Bar */}
      <header className="h-20 bg-neutral-950/80 backdrop-blur-md border-b border-red-950/60 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-lg shadow-black/50">
        <div className="flex items-center gap-3.5 cursor-pointer group" onClick={resetQuiz} id="logo-branding">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-red-900/30 transition-transform group-hover:scale-105">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black tracking-tight text-neutral-100 text-lg leading-none flex items-center gap-1.5">
              EduQuery <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">Pro</span>
            </h1>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">Interactive Academy</p>
          </div>
        </div>
        
        {quizState !== 'create' && quiz && (
          <div className="flex items-center gap-5">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">Active Syllabus</span>
              <span className="text-xs font-bold text-neutral-200 max-w-[280px] truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
                {quiz.topic}{quiz.subTopic ? ` • ${quiz.subTopic}` : ''}
              </span>
            </div>
            <div className="h-8 w-px bg-red-950/40 hidden md:block"></div>
            <button 
              onClick={resetQuiz}
              className="px-5 py-2 border border-red-950 hover:border-red-600 rounded-full text-xs font-bold text-neutral-300 hover:text-white transition-all bg-neutral-900 hover:bg-neutral-800 cursor-pointer shadow-md"
              id="header-action-btn"
            >
              Start Fresh
            </button>
          </div>
        )}
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-10 z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">

          {/* SCREEN 1: SELECTION AND CREATION */}
          {quizState === 'create' && !loading && (
            <motion.div
              key="setup-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl mx-auto space-y-10"
            >
              {/* Colorful Hero Title */}
              <div className="text-center space-y-4 py-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-950/40 border border-red-900/60 text-red-400 text-[11px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  Generative Learning Platform
                </span>
                <h2 className="font-display text-4xl sm:text-5xl font-black text-neutral-100 tracking-tight leading-tight">
                  Accelerate Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600">Academic Understanding</span>
                </h2>
                <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto font-normal leading-relaxed">
                  Generate exactly 10 premium multiple-choice questions on any subject. Target a core focus, select a difficulty tier, and receive robust expert insights.
                </p>
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900 text-red-200 flex items-start gap-3.5 shadow-lg" id="setup-error-panel">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Assessment Generation Failed</p>
                    <p className="text-red-400/90 text-xs">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Input Form Box */}
              <div className="bg-neutral-900 border border-red-950/60 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-600 to-red-800"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Topic field */}
                  <div className="space-y-2">
                    <label htmlFor="topic" className="block text-xs font-extrabold uppercase tracking-widest text-neutral-500">
                      1. Main Topic or Subject
                    </label>
                    <div className="relative group">
                      <input
                        id="topic"
                        type="text"
                        required
                        className="w-full pl-5 pr-12 py-4 bg-neutral-950 border border-red-950/40 rounded-2xl font-semibold placeholder-neutral-600 text-neutral-100 focus:outline-hidden focus:bg-neutral-900 focus:border-red-600 focus:ring-4 focus:ring-red-950/30 transition-all text-sm"
                        placeholder="e.g. History, Chemistry, Computer Science"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                      <div className="absolute right-4 top-4.5 text-neutral-500 group-focus-within:text-red-500 transition-colors">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Sub-Topic Focus field */}
                  <div className="space-y-2">
                    <label htmlFor="sub-topic" className="block text-xs font-extrabold uppercase tracking-widest text-neutral-500">
                      2. Sub-Topic Focus Area (Optional)
                    </label>
                    <div className="relative group">
                      <input
                        id="sub-topic"
                        type="text"
                        className="w-full pl-5 pr-12 py-4 bg-neutral-950 border border-red-950/40 rounded-2xl font-semibold placeholder-neutral-600 text-neutral-100 focus:outline-hidden focus:bg-neutral-900 focus:border-red-600 focus:ring-4 focus:ring-red-950/30 transition-all text-sm"
                        placeholder="e.g. World War II, Cell Division, Neural Networks"
                        value={subTopic}
                        onChange={(e) => setSubTopic(e.target.value)}
                      />
                      <div className="absolute right-4 top-4.5 text-neutral-500 group-focus-within:text-red-500 transition-colors">
                        <Target className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Difficulty Levels */}
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-neutral-500">
                    3. Target Difficulty level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { value: 'mixed', label: 'Mixed Tier', desc: 'Graduated Level', activeColor: 'border-red-500 text-red-400 bg-red-950/40 ring-red-500/50' },
                      { value: 'easy', label: 'Easy Tier', desc: 'Primary facts', activeColor: 'border-emerald-500 text-emerald-400 bg-emerald-950/40 ring-emerald-500/50' },
                      { value: 'medium', label: 'Medium Tier', desc: 'Concept logic', activeColor: 'border-amber-500 text-amber-400 bg-amber-950/40 ring-amber-500/50' },
                      { value: 'hard', label: 'Hard Tier', desc: 'Advanced Expert', activeColor: 'border-red-600 text-rose-400 bg-red-950/50 ring-red-600/50' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDifficulty(opt.value as QuizDifficulty)}
                        className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          difficulty === opt.value
                            ? `${opt.activeColor} ring-2`
                            : 'border-red-950/40 bg-neutral-950 hover:border-red-900/60 text-neutral-400 hover:bg-neutral-900/50'
                        }`}
                        id={`diff-choice-${opt.value}`}
                      >
                        <span className="text-xs font-extrabold block uppercase tracking-wide">{opt.label}</span>
                        <span className="text-[10px] text-neutral-600 font-medium mt-1.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="button"
                  onClick={() => handleGenerateQuiz()}
                  disabled={!topic.trim()}
                  className={`w-full py-4.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                    topic.trim()
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-800 text-white hover:opacity-95 hover:shadow-red-900/30 cursor-pointer transform hover:-translate-y-0.5 shadow-md shadow-red-950'
                      : 'bg-neutral-850 text-neutral-600 cursor-not-allowed border border-neutral-800'
                  }`}
                  id="btn-trigger-generation"
                >
                  <Sparkles className="w-5 h-5 text-white/90" />
                  Compile Educational Assessment (10 questions)
                </button>
              </div>

              {/* Suggestions Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-neutral-500 uppercase tracking-widest text-center sm:text-left">
                  Or select a beautifully curated pre-designed syllabus:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {POPULAR_TOPICS.map((pt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTopic(pt.name);
                        setSubTopic(pt.subTopic);
                        handleGenerateQuiz(pt.name, pt.subTopic);
                      }}
                      className="flex items-center gap-4.5 p-5 bg-neutral-900 border border-red-950/40 rounded-2xl hover:border-red-500/50 transition-all text-left group cursor-pointer hover:bg-neutral-850/80 relative overflow-hidden shadow-md"
                      id={`preset-btn-${idx}`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pt.color} flex items-center justify-center text-white text-xl shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                        {pt.icon}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-neutral-200 text-xs block uppercase tracking-wider group-hover:text-red-400 transition-colors">
                          {pt.name}
                        </span>
                        <span className="text-[11px] text-neutral-500 block truncate mt-0.5">
                          Focus: {pt.subTopic}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Safeguard Panel */}
              <div className="p-5 bg-red-950/10 border border-red-950/40 rounded-2xl text-[11px] text-neutral-500 leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-extrabold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-red-500" />
                  Academic Quality and Rigor Safeguards
                </div>
                <p>
                  To assure true conceptual comprehension, each session contains exactly 10 questions styled into options A, B, C, and D. You will evaluate questions one-by-one. Correctness metrics and immediate expert explanations will support your cognitive integration.
                </p>
              </div>

            </motion.div>
          )}

          {/* SCREEN 1B: LOADING SCREEN */}
          {loading && (
            <motion.div
              key="loading-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center space-y-8 max-w-xl mx-auto"
              id="loading-spinner-panel"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-800 opacity-25 blur-2xl animate-spin duration-3000"></div>
                <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-red-950 shadow-2xl flex items-center justify-center text-red-500 relative">
                  <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-2xl font-black text-neutral-100 tracking-tight">
                  Synthesizing Academic Assessment
                </h3>
                
                {/* Loader message cycling */}
                <div className="h-6 overflow-hidden relative max-w-md mx-auto">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingMessageIndex}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 font-bold absolute inset-0 w-full"
                    >
                      {LOADING_MESSAGES[loadingMessageIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                
                <p className="text-neutral-500 text-xs max-w-xs mx-auto pt-6 leading-relaxed">
                  We are accessing reliable generative systems to ensure a balanced, high-integrity assessment setup.
                </p>
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: ACTIVE ASSESSMENT - ONE QUESTION AT A TIME */}
          {quizState === 'taking' && quiz && (
            <motion.div
              key="quiz-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col lg:flex-row gap-8 items-start w-full"
            >
              
              {/* SIDEBAR NAVIGATION: Progress & Score Keeping */}
              <aside className="w-full lg:w-80 bg-neutral-900 border border-red-950/60 rounded-3xl p-6 sm:p-7 space-y-6 shrink-0 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-800"></div>
                
                {/* Score Keeping Status */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                    Interactive scorecard
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-emerald-950/30 border border-emerald-900/60 p-3.5 rounded-2xl text-center">
                      <span className="text-[9px] font-extrabold text-emerald-400 block uppercase tracking-wider mb-1">Correct</span>
                      <span className="text-2xl font-black text-emerald-400">{score}</span>
                    </div>
                    <div className="bg-red-950/30 border border-red-900/60 p-3.5 rounded-2xl text-center">
                      <span className="text-[9px] font-extrabold text-red-400 block uppercase tracking-wider mb-1">Incorrect</span>
                      <span className="text-2xl font-black text-red-500">
                        {history.length - score}
                      </span>
                    </div>
                  </div>

                  <div className="bg-red-950/10 border border-red-950/60 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-red-400 block uppercase tracking-widest">PROGRESSION RATE</span>
                      <span className="text-xs font-bold text-neutral-200 block mt-0.5">
                        {history.length} of 10 Evaluated
                      </span>
                    </div>
                    <span className="text-lg font-black text-red-500">
                      {Math.round((score / (history.length || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="h-px bg-red-950/40"></div>

                {/* Progress Indicators (01 to 10 Grid) */}
                <div className="space-y-3.5">
                  <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                    Assessment Map
                  </h3>
                  <div className="grid grid-cols-5 gap-2.5 animate-pulse-once" id="grid-progress-indicators">
                    {quiz.questions.map((q, idx) => {
                      const questionNumStr = String(idx + 1).padStart(2, '0');
                      const isCurrent = idx === currentQuestionIndex;
                      
                      const record = history.find(h => h.questionNumber === q.questionNumber);
                      
                      let boxClass = "border-red-950/40 text-neutral-600 bg-neutral-950 hover:border-red-900/40";
                      if (isCurrent) {
                        boxClass = "border-red-600 bg-gradient-to-br from-red-600 to-red-800 text-white font-black shadow-lg shadow-red-950/30 scale-105";
                      } else if (record) {
                        boxClass = record.isCorrect 
                          ? "border-emerald-600 bg-emerald-600 text-white font-extrabold shadow-sm" 
                          : "border-red-600 bg-red-600 text-white font-extrabold shadow-sm";
                      }

                      return (
                        <div
                          key={q.questionNumber}
                          className={`h-10 rounded-xl flex items-center justify-center text-xs border-2 transition-all ${boxClass}`}
                          title={`Question ${q.questionNumber}`}
                        >
                          {questionNumStr}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-red-950/40"></div>

                {/* Difficulty tag */}
                <div className="flex items-center gap-3 bg-red-950/20 border border-red-900/30 p-3 rounded-xl">
                  <Flame className="w-4 h-4 text-red-500 shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] font-bold text-red-400 block uppercase tracking-wider">Difficulty Target</span>
                    <span className="text-xs font-bold text-neutral-200 uppercase block truncate">{quiz.difficulty} Level</span>
                  </div>
                </div>

                {/* Playful mini achievement hint */}
                <div className="flex items-center gap-2.5 text-[11px] text-neutral-500">
                  <Star className="w-4 h-4 text-red-500 shrink-0 fill-red-950" />
                  <span>Aim for 80% to earn a distinction award.</span>
                </div>

              </aside>

              {/* MAIN CONTENT AREA: ACTIVE INTERACTIVE QUIZ CARD */}
              <div className="flex-1 bg-neutral-900 border border-red-950/60 rounded-3xl shadow-xl overflow-hidden relative w-full flex flex-col min-h-[500px]">
                
                {/* Horizontal progress bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-neutral-950">
                  <div 
                    style={{ width: `${(currentQuestionIndex + 1) * 10}%` }} 
                    className="h-full bg-gradient-to-r from-red-600 via-rose-600 to-red-800 transition-all duration-350"
                  ></div>
                </div>

                <div className="p-6 sm:p-10 space-y-8 flex-1">
                  
                  {/* Metadata Tag */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-950/40 border border-red-900/40 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                      <Compass className="w-3.5 h-3.5" />
                      Section {currentQuestionIndex + 1} of 10
                    </span>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                      Academic Syllabus Evaluation
                    </span>
                  </div>

                  {/* Question Title */}
                  <h2 className="text-xl sm:text-2xl font-semibold text-neutral-100 leading-snug">
                    {quiz.questions[currentQuestionIndex].questionText}
                  </h2>

                  {/* Options Selections with Interactive visual Feedback */}
                  <div className="grid gap-4" id="options-interactive-container">
                    {(['A', 'B', 'C', 'D'] as const).map((key) => {
                      const optionText = quiz.questions[currentQuestionIndex].options[key];
                      const isSelected = selectedOption === key;
                      const isCorrect = quiz.questions[currentQuestionIndex].correctOption === key;
                      
                      let optionStyle = "border-red-950 bg-neutral-950/40 text-neutral-300 hover:border-red-800/80 hover:bg-neutral-950";
                      let badgeStyle = "bg-neutral-950 border-red-950 text-neutral-500";

                      if (questionConfirmed) {
                        if (isCorrect) {
                          optionStyle = "border-emerald-600 bg-emerald-950/30 text-emerald-200 font-bold scale-101";
                          badgeStyle = "bg-emerald-600 border-emerald-600 text-white";
                        } else if (isSelected) {
                          optionStyle = "border-red-600 bg-red-950/40 text-red-200 font-bold";
                          badgeStyle = "bg-red-600 border-red-600 text-white";
                        } else {
                          optionStyle = "border-neutral-950/20 bg-neutral-950/10 text-neutral-600 opacity-50";
                          badgeStyle = "bg-neutral-950 border-neutral-950 text-neutral-700";
                        }
                      } else if (isSelected) {
                        optionStyle = "border-red-600 bg-red-950/20 text-red-200 font-semibold ring-2 ring-red-900/30";
                        badgeStyle = "bg-red-600 border-red-600 text-white shadow-md";
                      }

                      return (
                        <button
                          key={key}
                          disabled={questionConfirmed}
                          onClick={() => setSelectedOption(key)}
                          className={`group w-full flex items-center p-4 rounded-2xl border-2 transition-all text-left ${optionStyle} ${!questionConfirmed ? 'cursor-pointer' : ''}`}
                          id={`question-option-${key}`}
                        >
                          <span className={`w-9 h-9 flex items-center justify-center rounded-lg border-2 text-sm font-black mr-4 shrink-0 transition-colors ${badgeStyle}`}>
                            {key}
                          </span>
                          <span className="text-sm sm:text-base leading-relaxed">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Explanation Section */}
                  <AnimatePresence>
                    {questionConfirmed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="overflow-hidden"
                        key="explanation-box"
                      >
                        <div className="p-5 sm:p-6 bg-gradient-to-br from-red-950/20 to-neutral-950 border border-red-900/40 rounded-2xl space-y-3 mt-6">
                          <div className="flex flex-wrap items-center justify-between gap-2.5">
                            {selectedOption === quiz.questions[currentQuestionIndex].correctOption ? (
                              <span className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900/50">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                CORRECT RESPONSE
                              </span>
                            ) : (
                              <span className="text-red-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 bg-red-950/40 px-3 py-1 rounded-full border border-red-900/50">
                                <XCircle className="w-3.5 h-3.5 text-red-500" />
                                INCORRECT RESPONSE
                              </span>
                            )}
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                              <Lightbulb className="w-4 h-4 text-red-500 fill-red-950" />
                              ACADEMIC EXPLANATION
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                            {quiz.questions[currentQuestionIndex].explanation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Footer Navigation bar */}
                <div className="h-24 bg-neutral-950/50 border-t border-red-950/60 px-6 sm:px-10 flex items-center justify-between shrink-0">
                  <div className="text-xs font-mono text-neutral-500 font-extrabold">
                    EVALUATION: {currentQuestionIndex + 1} OF 10
                  </div>

                  <div className="flex items-center gap-3">
                    {!questionConfirmed ? (
                      <button
                        onClick={handleConfirmAnswer}
                        disabled={!selectedOption}
                        className={`px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                          selectedOption 
                            ? 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:opacity-95 shadow-md shadow-red-900/30 cursor-pointer' 
                            : 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800'
                        }`}
                        id="btn-lock-in"
                      >
                        Lock in & Evaluate
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        id="btn-next-step"
                      >
                        {currentQuestionIndex < 9 ? 'Next Question' : 'Evaluate Final Key'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* SCREEN 3: HIGH-CELEBRATION AND REWARD RESULTS SCREEN */}
          {quizState === 'results' && quiz && (
            <motion.div
              key="results-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              
              {/* Score Assessment Card */}
              {(() => {
                const percentage = Math.round((score / 10) * 100);
                const details = getScoreDetails(score);

                return (
                  <div className={`border border-red-950/60 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-xl relative overflow-hidden bg-neutral-900`} id="score-results-card">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-600 to-red-800"></div>
                    
                    <div className="max-w-xs mx-auto relative">
                      {/* Big Glowing Percentage Badge */}
                      <div className="w-28 h-28 mx-auto bg-gradient-to-tr from-black to-red-950 text-white rounded-full flex flex-col items-center justify-center shadow-2xl relative border-4 border-red-900/40">
                        <span className="text-3xl font-black text-red-400">{percentage}%</span>
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-0.5">SCORE</span>
                      </div>
                      <div className="absolute top-1 right-12">
                        <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${details.badgeColor}`}>
                        Assessment Completed
                      </span>
                      <h3 className="font-display font-black text-3xl text-neutral-100">
                        {details.title}
                      </h3>
                      <p className="text-neutral-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                        {details.description} You successfully mastered <strong className="text-red-400">{score}</strong> out of <strong className="text-neutral-300">10</strong> educational units of study.
                      </p>
                    </div>

                    {/* Stats details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto pt-2">
                      <div className="bg-neutral-950 p-4 rounded-2xl border border-red-950/40 shadow-sm">
                        <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">Total Items</span>
                        <span className="text-lg font-black text-neutral-300">10 / 10</span>
                      </div>
                      <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-900/60 shadow-sm">
                        <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Correct</span>
                        <span className="text-lg font-black text-emerald-400">{score}</span>
                      </div>
                      <div className="bg-red-950/30 p-4 rounded-2xl border border-red-900/60 shadow-sm">
                        <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block">Incorrect</span>
                        <span className="text-lg font-black text-red-500">{10 - score}</span>
                      </div>
                      <div className="bg-red-950/20 p-4 rounded-2xl border border-red-900/40 shadow-sm">
                        <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block">Comprehension</span>
                        <span className="text-lg font-black text-red-500">{percentage}%</span>
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                      <button
                        onClick={restartQuizSameTopic}
                        className="px-6 py-3 rounded-full font-bold text-xs bg-neutral-950 border border-red-950 hover:border-red-600 text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        id="btn-restart-quiz"
                      >
                        <RotateCcw className="w-4 h-4 text-red-500" />
                        Retake Assessment
                      </button>
                      <button
                        onClick={resetQuiz}
                        className="px-6 py-3 rounded-full font-bold text-xs bg-red-600 text-white hover:bg-red-500 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
                        id="btn-new-quiz"
                      >
                        <Sparkles className="w-4 h-4 text-white/90" />
                        Explore Other Subject
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Comprehensive Answer Key & Breakdown */}
              <div className="space-y-4">
                <div className="border-b border-red-950/60 pb-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-black text-xl text-neutral-100">
                      Academic Assessment key
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1">
                      Deep-dive review of options, correctness, and comprehensive academic explanations.
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-red-500 shrink-0 hidden sm:block" />
                </div>

                <div className="space-y-6" id="final-breakdown-list">
                  {history.map((h, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-900 border border-red-950/60 rounded-3xl overflow-hidden shadow-md relative"
                      id={`breakdown-item-${h.questionNumber}`}
                    >
                      {/* Left indicator accent strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${h.isCorrect ? 'bg-emerald-600' : 'bg-red-600'}`}></div>

                      {/* Header bar */}
                      <div className="px-6 py-4 bg-neutral-950 border-b border-red-950/40 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest">
                          Syllabus Question {h.questionNumber.toString().padStart(2, '0')}
                        </span>
                        
                        {h.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1 rounded-full">
                            <Check className="w-3 h-3 text-emerald-500" /> Correct Option {h.correct}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/40 border border-red-900/50 px-3 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5 text-red-500" /> Incorrect Option {h.selected}
                          </span>
                        )}
                      </div>

                      {/* Question Content */}
                      <div className="p-6 space-y-5 pl-8">
                        <p className="font-semibold text-neutral-100 text-sm sm:text-base leading-relaxed">
                          {h.questionText}
                        </p>

                        {/* Options breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                            const isCorrectAnswer = h.correct === optKey;
                            const isUserSelection = h.selected === optKey;

                            let colorClass = "border-red-950/20 bg-neutral-950/40 text-neutral-400";
                            if (isCorrectAnswer) {
                              colorClass = "border-emerald-900/40 bg-emerald-950/20 text-emerald-200 font-bold";
                            } else if (isUserSelection && !h.isCorrect) {
                              colorClass = "border-red-900/40 bg-red-950/20 text-red-200 font-bold";
                            }

                            return (
                              <div key={optKey} className={`p-3.5 rounded-xl border-2 flex items-center gap-3 ${colorClass}`}>
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                  isCorrectAnswer 
                                    ? 'bg-emerald-600 text-white' 
                                    : isUserSelection 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-neutral-950 border border-red-950 text-neutral-500'
                                }`}>
                                  {optKey}
                                </span>
                                <span className="font-medium leading-relaxed">{h.options[optKey]}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Cognitive insight feedback */}
                        <div className="p-4.5 bg-red-950/10 border border-red-950/40 rounded-2xl space-y-1.5">
                          <p className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-red-500 fill-red-950" />
                            Academic Explanation
                          </p>
                          <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                            {h.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Return CTA */}
              <div className="pt-6 pb-16 flex justify-center">
                <button
                  onClick={resetQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-800 hover:opacity-95 text-white rounded-full font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-red-900/30 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                  id="btn-return-home"
                >
                  <Sparkles className="w-4 h-4 text-white/90" />
                  Create Another Custom Quiz
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Elegant minimalist bottom bar footer */}
      <footer className="py-6 border-t border-red-950/60 bg-neutral-950 text-center text-[10px] font-mono text-neutral-500 tracking-wider">
        EDUCATIONAL ASSESSMENT ENGINE • POWERED BY GEMINI 3.5 FLASH • ZERO ACCIDENT DESIGN
      </footer>

    </div>
  );
}
