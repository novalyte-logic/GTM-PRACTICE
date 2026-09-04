'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  GTM_TOPICS, 
  GTMTopic, 
  TOPIC_CATEGORIES, 
  getTopicById,
  ArchitectureStep,
  PracticeQuestion
} from '@/lib/topics-curriculum';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Search, 
  Play, 
  Pause, 
  RotateCcw, 
  Mic, 
  MicOff, 
  ArrowRight, 
  ArrowLeft, 
  Shuffle, 
  Brain, 
  Network, 
  Lightbulb, 
  ShieldAlert, 
  Flame, 
  Share2, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopicFocusStudioProps {
  initialTopicId?: string;
  onNavigateToSimulator?: () => void;
}

type MasteryStatus = 'unpracticed' | 'needs-work' | 'getting-there' | 'nailed-it';

interface TopicMasteryRecord {
  status: MasteryStatus;
  lastPracticedAt: string;
  practiceCount: number;
}

export const TopicFocusStudio: React.FC<TopicFocusStudioProps> = ({ 
  initialTopicId, 
  onNavigateToSimulator 
}) => {
  // 1. Topic Selection & Navigation State
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(() => {
    if (initialTopicId && getTopicById(initialTopicId)) {
      return getTopicById(initialTopicId)!.id;
    }
    // Check URL query param if available on client
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTopic = params.get('topic') || params.get('topicId');
      if (urlTopic && getTopicById(urlTopic)) {
        return getTopicById(urlTopic)!.id;
      }
    }
    return null;
  });

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedSoundbite, setCopiedSoundbite] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // 2. Persistent Topic Mastery Storage
  const [masteryData, setMasteryData] = useState<Record<string, TopicMasteryRecord>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('gtm_topic_mastery_v1');
        if (raw) return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to load topic mastery from localStorage', err);
      }
    }
    return {};
  });

  const saveMastery = (topicId: string, status: MasteryStatus) => {
    setMasteryData((prev) => {
      const existing = prev[topicId] || { status: 'unpracticed', lastPracticedAt: '', practiceCount: 0 };
      const updated: TopicMasteryRecord = {
        status,
        lastPracticedAt: new Date().toISOString(),
        practiceCount: existing.practiceCount + 1,
      };
      const next = { ...prev, [topicId]: updated };
      try {
        localStorage.setItem('gtm_topic_mastery_v1', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save topic mastery', err);
      }
      return next;
    });

    if (status === 'nailed-it') {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#6366f1']
      });
    }
  };

  // Sync URL query param when selected topic changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (selectedTopicId) {
        url.searchParams.set('topic', selectedTopicId);
      } else {
        url.searchParams.delete('topic');
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [selectedTopicId]);

  // Synchronize initialTopicId prop changes
  const [prevInitialTopic, setPrevInitialTopic] = useState<string | undefined>(initialTopicId);
  if (initialTopicId && initialTopicId !== prevInitialTopic) {
    setPrevInitialTopic(initialTopicId);
    if (getTopicById(initialTopicId)) {
      setSelectedTopicId(getTopicById(initialTopicId)!.id);
      setActiveStep(1);
    }
  }

  const activeTopic = useMemo(() => {
    return selectedTopicId ? getTopicById(selectedTopicId) || null : null;
  }, [selectedTopicId]);

  // 3. Step 2 Architecture Step Highlighting
  const [activeArchStepIndex, setActiveArchStepIndex] = useState<number>(0);
  const [isArchAutoPlaying, setIsArchAutoPlaying] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isArchAutoPlaying && activeTopic) {
      interval = setInterval(() => {
        setActiveArchStepIndex((prev) => (prev + 1) % activeTopic.architectureSteps.length);
      }, 3200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isArchAutoPlaying, activeTopic]);

  // 4. Step 3 Practice Drill State
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [candidateResponse, setCandidateResponse] = useState<string>('');
  const [isTeleprompterVisible, setIsTeleprompterVisible] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    }
    return false;
  });

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Speech Recognition hook
  const recognitionRef = useRef<any>(null);
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            setCandidateResponse((prev) => prev + finalTranscript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
        if (!isTimerRunning && timerSeconds === 60) {
          setIsTimerRunning(true);
        }
      } catch (e) {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      }
    }
  };

  const handleCopySoundbite = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSoundbite(true);
    setTimeout(() => setCopiedSoundbite(false), 2000);
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined' && activeTopic) {
      const url = `${window.location.origin}${window.location.pathname}?topic=${activeTopic.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleRandomTopic = () => {
    const available = GTM_TOPICS.filter((t) => t.id !== selectedTopicId);
    const randomIndex = Math.floor(Math.random() * available.length);
    setSelectedTopicId(available[randomIndex].id);
    setActiveStep(1);
    setActiveArchStepIndex(0);
    setSelectedQuestionIndex(0);
    setTimerSeconds(60);
    setIsTimerRunning(false);
    setCandidateResponse('');
  };

  // Filtered topics for the selection menu
  const filteredTopics = useMemo(() => {
    return GTM_TOPICS.filter((t) => {
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q || 
        t.title.toLowerCase().includes(q) || 
        t.plainEnglish.toLowerCase().includes(q) || 
        t.category.toLowerCase().includes(q) ||
        t.seniorSoundbite.toLowerCase().includes(q) ||
        t.architectureSteps.some(s => s.tech.toLowerCase().includes(q) || s.title.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Overall progress statistics
  const progressStats = useMemo(() => {
    const total = GTM_TOPICS.length;
    let nailed = 0;
    let inProgress = 0;
    let needsWork = 0;

    Object.values(masteryData).forEach((rec) => {
      if (rec.status === 'nailed-it') nailed++;
      else if (rec.status === 'getting-there') inProgress++;
      else if (rec.status === 'needs-work') needsWork++;
    });

    const percent = Math.round((nailed / total) * 100);
    return { total, nailed, inProgress, needsWork, percent };
  }, [masteryData]);

  // Active question in Step 3
  const activeQuestion: PracticeQuestion | undefined = activeTopic?.practiceQuestions[selectedQuestionIndex];

  // =========================================================================
  // VIEW 1: TOPIC SELECTOR MENU (When no topic is isolated)
  // =========================================================================
  if (!activeTopic) {
    return (
      <div id="topic-focus-selector-view" className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header Title & Mastery Summary Banner */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <Target className="h-3.5 w-3.5" />
                <span>Dedicated Topic Mastery Room</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                GTM Topic Focus Studio
              </h1>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Choose <strong>one specific concept</strong> from the 28 core GTM engineering topics below.
                The screen will isolate entirely into a clean 3-step mastery room: 
                <strong> (1) 60-Second Mental Model</strong>, 
                <strong> (2) Visual Architecture & Gotcha</strong>, and 
                <strong> (3) Focused Practice Drill</strong>.
              </p>
            </div>

            {/* Quick Action Buttons & Stats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                id="btn-random-topic"
                onClick={handleRandomTopic}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-xs transition"
              >
                <Shuffle className="h-4 w-4" />
                <span>Random Topic Drill</span>
              </button>
            </div>
          </div>

          {/* Mastery Progress Bar */}
          <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                {progressStats.percent}%
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Mastery Progress</p>
                <p className="text-sm font-bold text-stone-900">
                  {progressStats.nailed} of {progressStats.total} Topics Mastered
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-md bg-stone-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressStats.percent}%` }}
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-stone-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                {progressStats.nailed} Nailed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                {progressStats.inProgress} Getting There
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                {progressStats.total - (progressStats.nailed + progressStats.inProgress)} Remaining
              </span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                id="input-topic-search"
                type="text"
                placeholder="Search topics, keywords (e.g. Redis, Idempotency, Waterfall, Reverse ETL)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            <p className="text-xs text-stone-500 font-medium self-end sm:self-center">
              Showing {filteredTopics.length} of {GTM_TOPICS.length} topics
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TOPIC_CATEGORIES.map((cat) => {
              const count = cat === 'All' 
                ? GTM_TOPICS.length 
                : GTM_TOPICS.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  id={`filter-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedCategory === cat ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 28-Topic Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic, index) => {
            const mastery = masteryData[topic.id];
            const isNailed = mastery?.status === 'nailed-it';
            const isInProgress = mastery?.status === 'getting-there';
            const isNeedsWork = mastery?.status === 'needs-work';

            return (
              <div
                key={topic.id}
                id={`topic-card-${topic.id}`}
                onClick={() => {
                  setSelectedTopicId(topic.id);
                  setActiveStep(1);
                  setActiveArchStepIndex(0);
                  setSelectedQuestionIndex(0);
                  setTimerSeconds(60);
                  setIsTimerRunning(false);
                  setCandidateResponse('');
                }}
                className="group relative bg-white border border-stone-200/90 rounded-xl p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Category & Mastery Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                      {topic.category}
                    </span>

                    {isNailed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Nailed It</span>
                      </span>
                    )}
                    {isInProgress && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        <Flame className="h-3 w-3" />
                        <span>Practicing</span>
                      </span>
                    )}
                    {isNeedsWork && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                        <AlertCircle className="h-3 w-3" />
                        <span>Needs Work</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-stone-900 text-base group-hover:text-emerald-700 transition">
                    {topic.title}
                  </h3>

                  {/* Plain English Snippet */}
                  <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                    {topic.plainEnglish}
                  </p>

                  {/* Metrics to Quote Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {topic.metricsToQuote.slice(0, 2).map((metric) => (
                      <span 
                        key={metric}
                        className="text-[10px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-sm border border-stone-200/60"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span className="group-hover:underline">Enter 3-Step Room</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-3">
            <p className="text-stone-500 text-sm">No GTM topics found matching &quot;{searchQuery}&quot;.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Reset search and filters
            </button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ISOLATED 3-STEP TOPIC MASTERY ROOM
  // =========================================================================
  const currentMastery = masteryData[activeTopic.id]?.status || 'unpracticed';

  return (
    <div id="isolated-topic-mastery-room" className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              id="btn-back-to-all-topics"
              onClick={() => setSelectedTopicId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All 28 Topics</span>
            </button>

            <span className="text-stone-300 text-sm">/</span>

            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {activeTopic.category}
            </span>
          </div>

          {/* Mastery Status Selector & Share Deep Link */}
          <div className="flex items-center gap-2">
            <button
              id="btn-share-topic-link"
              onClick={handleShareLink}
              title="Copy deep link to this topic"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
            </button>

            {/* Quick Next Random Topic */}
            <button
              id="btn-next-random-topic"
              onClick={handleRandomTopic}
              title="Drill another random topic"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Next Topic</span>
            </button>
          </div>
        </div>

        {/* Isolated Topic Title & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {activeTopic.title}
            </h1>
            <p className="text-stone-500 text-xs font-medium">
              3-Step Mastery Room • Focus completely on mastering this single concept
            </p>
          </div>

          {/* Mastery Status Toggles */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200/80 self-start md:self-auto">
            <button
              id="status-needs-work"
              onClick={() => saveMastery(activeTopic.id, 'needs-work')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                currentMastery === 'needs-work'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Needs Work
            </button>
            <button
              id="status-getting-there"
              onClick={() => saveMastery(activeTopic.id, 'getting-there')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                currentMastery === 'getting-there'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Getting There
            </button>
            <button
              id="status-nailed-it"
              onClick={() => saveMastery(activeTopic.id, 'nailed-it')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                currentMastery === 'nailed-it'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Nailed It 🎉
            </button>
          </div>
        </div>

        {/* The 3 Mastery Step Tabs */}
        <div className="pt-3 border-t border-stone-100 grid grid-cols-3 gap-2">
          <button
            id="tab-step-1"
            onClick={() => setActiveStep(1)}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
              activeStep === 1
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Brain className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Step 1: 60s Mental Model</span>
            <span className="sm:hidden">1: Mental Model</span>
          </button>

          <button
            id="tab-step-2"
            onClick={() => setActiveStep(2)}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
              activeStep === 2
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Network className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Step 2: Architecture & Gotcha</span>
            <span className="sm:hidden">2: Architecture</span>
          </button>

          <button
            id="tab-step-3"
            onClick={() => setActiveStep(3)}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
              activeStep === 3
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Target className="h-4 w-4 text-indigo-400" />
            <span className="hidden sm:inline">Step 3: Focused Practice Drill</span>
            <span className="sm:hidden">3: Practice Drill</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* STEP 1: 60-SECOND MENTAL MODEL                                      */}
      {/* =================================================================== */}
      {activeStep === 1 && (
        <div id="step-1-mental-model-container" className="space-y-6">
          {/* Card 1: Plain-English Definition */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="h-4 w-4" />
              <span>Plain-English Mental Model (Zero Jargon)</span>
            </div>

            <p className="text-stone-900 text-lg sm:text-xl font-medium leading-relaxed">
              &ldquo;{activeTopic.plainEnglish}&rdquo;
            </p>

            {/* Metrics to Quote */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Key Metrics to Quote:</span>
              {activeTopic.metricsToQuote.map((metric) => (
                <span
                  key={metric}
                  className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200"
                >
                  {metric}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 2: Why Companies Care ($ Impact) */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <TrendingUp className="h-4 w-4" />
                <span>Why Companies Care ($ Impact & Revenue)</span>
              </div>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                {activeTopic.whyCompaniesCare}
              </p>
            </div>

            {/* Card 3: Novalyte AI & Zendesk Founder Proof Point */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <Award className="h-4 w-4" />
                <span>Founder Proof Point (Novalyte AI & Zendesk)</span>
              </div>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                {activeTopic.founderProofPoint}
              </p>
            </div>
          </div>

          {/* Card 4: The Senior Soundbite */}
          <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>The Senior Soundbite (Your Exact Interview Opener)</span>
              </div>

              <button
                id="btn-copy-soundbite"
                onClick={() => handleCopySoundbite(activeTopic.seniorSoundbite)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
              >
                {copiedSoundbite ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSoundbite ? 'Copied to Clipboard!' : 'Copy Soundbite'}</span>
              </button>
            </div>

            <p className="text-stone-100 text-base sm:text-lg italic leading-relaxed">
              {activeTopic.seniorSoundbite}
            </p>
          </div>

          {/* Next Step Navigation CTA */}
          <div className="flex justify-end pt-2">
            <button
              id="btn-goto-step-2"
              onClick={() => setActiveStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition"
            >
              <span>Next: Step 2 - Visual Architecture & Gotcha</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 2: VISUAL ARCHITECTURE & THE INTERVIEW GOTCHA                 */}
      {/* =================================================================== */}
      {activeStep === 2 && (
        <div id="step-2-architecture-container" className="space-y-6">
          {/* Interactive Architecture Flowchart Walkthrough */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  <Network className="h-4 w-4" />
                  <span>Interactive Architecture Flow ({activeTopic.architectureSteps.length} Steps)</span>
                </div>
                <h3 className="font-bold text-stone-900 text-lg">
                  Production Blueprint for {activeTopic.title}
                </h3>
              </div>

              {/* Step Flow Controls */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-arch-prev"
                  onClick={() => {
                    setIsArchAutoPlaying(false);
                    setActiveArchStepIndex((prev) => (prev > 0 ? prev - 1 : activeTopic.architectureSteps.length - 1));
                  }}
                  className="p-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition"
                  title="Previous Step"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>

                <button
                  id="btn-arch-play-toggle"
                  onClick={() => setIsArchAutoPlaying((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isArchAutoPlaying 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-stone-100 text-stone-800 border border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {isArchAutoPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{isArchAutoPlaying ? 'Pause Flow' : 'Play Flow'}</span>
                </button>

                <button
                  id="btn-arch-next"
                  onClick={() => {
                    setIsArchAutoPlaying(false);
                    setActiveArchStepIndex((prev) => (prev + 1) % activeTopic.architectureSteps.length);
                  }}
                  className="p-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition"
                  title="Next Step"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Node Chain */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeTopic.architectureSteps.map((step, idx) => {
                const isActive = idx === activeArchStepIndex;
                return (
                  <button
                    key={step.stepNumber}
                    id={`arch-node-${step.stepNumber}`}
                    onClick={() => {
                      setIsArchAutoPlaying(false);
                      setActiveArchStepIndex(idx);
                    }}
                    className={`text-left p-4 rounded-xl border transition-all relative ${
                      isActive
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {step.stepNumber}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-stone-200/70 text-stone-700">
                        Node {idx + 1}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-stone-900 mb-1">
                      {step.title}
                    </h4>

                    <p className="text-[11px] font-mono text-emerald-800 font-semibold truncate">
                      {step.tech}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Detailed Selected Node Breakdown */}
            {activeTopic.architectureSteps[activeArchStepIndex] && (
              <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-700">
                      Step {activeTopic.architectureSteps[activeArchStepIndex].stepNumber} Details:
                    </span>
                    <span className="font-bold text-sm text-stone-900">
                      {activeTopic.architectureSteps[activeArchStepIndex].title}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-800">
                    Technology: {activeTopic.architectureSteps[activeArchStepIndex].tech}
                  </span>
                </div>

                <p className="text-stone-700 text-sm leading-relaxed">
                  {activeTopic.architectureSteps[activeArchStepIndex].description}
                </p>
              </div>
            )}
          </div>

          {/* The Critical Interview Trap / Gotcha to Defend */}
          <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4 text-amber-700" />
              <span>The Critical Interview Gotcha & Trap to Defend</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-amber-950">
              How Interviewers Try to Break Your System Design
            </h3>

            <p className="text-amber-950/90 text-sm sm:text-base leading-relaxed">
              {activeTopic.gotchaToDefend}
            </p>
          </div>

          {/* Navigation CTAs */}
          <div className="flex items-center justify-between pt-2">
            <button
              id="btn-back-to-step-1"
              onClick={() => setActiveStep(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Step 1: Mental Model</span>
            </button>

            <button
              id="btn-goto-step-3"
              onClick={() => setActiveStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition"
            >
              <span>Next: Step 3 - Focused Practice Drill</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 3: FOCUSED PRACTICE DRILL                                      */}
      {/* =================================================================== */}
      {activeStep === 3 && activeQuestion && (
        <div id="step-3-practice-container" className="space-y-6">
          {/* Question Selector Bar if multiple questions */}
          {activeTopic.practiceQuestions.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">
                Question:
              </span>
              {activeTopic.practiceQuestions.map((q, idx) => (
                <button
                  key={idx}
                  id={`btn-question-select-${idx}`}
                  onClick={() => {
                    setSelectedQuestionIndex(idx);
                    setTimerSeconds(60);
                    setIsTimerRunning(false);
                    setCandidateResponse('');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedQuestionIndex === idx
                      ? 'bg-stone-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Drill {idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* Active Question Prompt Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                Curated GTM Engineer Interview Question
              </span>

              {/* 60s Countdown Timer Controls */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-bold text-xs border ${
                  timerSeconds <= 10 
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' 
                    : 'bg-stone-100 text-stone-800 border-stone-200'
                }`}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timerSeconds}s</span>
                </div>

                <button
                  id="btn-practice-timer-toggle"
                  onClick={() => setIsTimerRunning((prev) => !prev)}
                  className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition"
                  title={isTimerRunning ? 'Pause Timer' : 'Start 60s Timer'}
                >
                  {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>

                <button
                  id="btn-practice-timer-reset"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(60);
                  }}
                  className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition"
                  title="Reset Timer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              {activeQuestion.question}
            </h2>

            {/* Buzzword Checklist */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500">Target Buzzwords to Hit:</span>
              {activeQuestion.cribSheetBuzzwords.map((buzzword) => {
                const isHit = candidateResponse.toLowerCase().includes(buzzword.toLowerCase());
                return (
                  <span
                    key={buzzword}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium transition ${
                      isHit
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {isHit ? <Check className="h-3 w-3 text-emerald-700" /> : null}
                    <span>{buzzword}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Practice Workstation: Answer Teleprompter vs Recall Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: 60-Second Gold Standard STAR Script */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  <span>60-Second STAR Script</span>
                </div>

                <button
                  id="btn-toggle-teleprompter"
                  onClick={() => setIsTeleprompterVisible((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-800"
                >
                  {isTeleprompterVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{isTeleprompterVisible ? 'Blind Recall Mode' : 'Show Script'}</span>
                </button>
              </div>

              {isTeleprompterVisible ? (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-sm sm:text-base leading-relaxed font-sans select-text">
                  {activeQuestion.starScript}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-stone-100/60 border border-dashed border-stone-300 text-center space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Blind Recall Test Mode
                  </p>
                  <p className="text-sm text-stone-600">
                    Script is hidden. Practice speaking aloud or typing your answer from memory!
                  </p>
                  <button
                    onClick={() => setIsTeleprompterVisible(true)}
                    className="text-xs font-bold text-indigo-700 hover:underline pt-1"
                  >
                    Reveal script
                  </button>
                </div>
              )}

              <div className="pt-2 text-xs text-stone-500 flex items-center justify-between">
                <span>Pacing Goal: ~130 words in 60 seconds</span>
                <button
                  onClick={() => handleCopySoundbite(activeQuestion.starScript)}
                  className="text-stone-700 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy STAR Script</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Verbal Practice & Transcription / Answer Box */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    <Mic className="h-4 w-4" />
                    <span>Your Spoken or Typed Response</span>
                  </div>

                  {speechSupported && (
                    <button
                      id="btn-voice-dictation-toggle"
                      onClick={toggleSpeechRecognition}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                      <span>{isListening ? 'Stop Recording' : 'Record Answer'}</span>
                    </button>
                  )}
                </div>

                <textarea
                  id="textarea-candidate-answer"
                  value={candidateResponse}
                  onChange={(e) => setCandidateResponse(e.target.value)}
                  placeholder="Speak your answer or type notes here to test keyword hits..."
                  rows={6}
                  className="w-full p-3 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none bg-stone-50/50"
                />

                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>
                    Words: {candidateResponse.trim() ? candidateResponse.trim().split(/\s+/).length : 0}
                  </span>
                  {candidateResponse && (
                    <button
                      onClick={() => setCandidateResponse('')}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Topic Mastery Confidence Rating */}
              <div className="pt-4 border-t border-stone-100 space-y-2">
                <p className="text-xs font-bold text-stone-700">
                  Rate your confidence on this topic:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="btn-rate-needs-work"
                    onClick={() => saveMastery(activeTopic.id, 'needs-work')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition ${
                      currentMastery === 'needs-work'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Needs Work
                  </button>

                  <button
                    id="btn-rate-getting-there"
                    onClick={() => saveMastery(activeTopic.id, 'getting-there')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition ${
                      currentMastery === 'getting-there'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Getting There
                  </button>

                  <button
                    id="btn-rate-nailed-it"
                    onClick={() => saveMastery(activeTopic.id, 'nailed-it')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition ${
                      currentMastery === 'nailed-it'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold ring-1 ring-emerald-400'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Nailed It! 🎉
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions: Back to Architecture or Next Random Topic */}
          <div className="flex items-center justify-between pt-2">
            <button
              id="btn-back-to-step-2"
              onClick={() => setActiveStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Step 2: Architecture</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                id="btn-return-all-topics"
                onClick={() => setSelectedTopicId(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs transition"
              >
                <span>All Topics Menu</span>
              </button>

              <button
                id="btn-drill-next-random"
                onClick={handleRandomTopic}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-xs transition"
              >
                <span>Drill Next Random Topic</span>
                <Shuffle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
