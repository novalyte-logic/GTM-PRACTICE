'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  BookOpen, 
  ArrowRight, 
  Award,
  Layers,
  Cpu,
  Database,
  Building,
  Volume2,
  ListFilter,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  Timer,
  Sliders,
  Check,
  Zap,
  Target,
  HelpCircle,
  Copy,
  BarChart3,
  Dices,
  X,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  InterviewQuestion, 
  InterviewTrack, 
  DifficultyLevel, 
  GTMRoleProfile,
  CompanyArchetype, 
  CandidateAnswerRecord, 
  AnswerEvaluation,
  AIArchitecturalHint,
  WildcardConstraint
} from '@/lib/types';
import { CURATED_QUESTIONS, WILDCARD_CONSTRAINTS } from '@/lib/mock-data';
import { StepTooltip } from '@/components/StepTooltip';
import { PanicButton } from '@/components/PanicButton';

interface InterviewSimulatorProps {
  onSaveAnswer: (record: CandidateAnswerRecord) => void;
  onGenerateReport: () => void;
  completedAnswers: CandidateAnswerRecord[];
  audioEnabled: boolean;
  onOpenReflection?: () => void;
}

type TimerMode = '25m-focus' | '15m-sprint' | '5m-drill' | '5m-review';

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({
  onSaveAnswer,
  onGenerateReport,
  completedAnswers,
  audioEnabled,
  onOpenReflection,
}) => {
  // Filters & Role Profile State
  const [selectedTrack, setSelectedTrack] = useState<InterviewTrack | 'all'>('all');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Senior GTM Engineer');
  const [roleProfile, setRoleProfile] = useState<GTMRoleProfile>('GTM Systems Engineer');
  const [companyArchetype, setCompanyArchetype] = useState<CompanyArchetype>('Series-B High-Growth PLG SaaS');
  
  // Question pool & active index
  const [questionsList, setQuestionsList] = useState<InterviewQuestion[]>(CURATED_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState<boolean>(false);

  // Candidate Answer State
  const [answerText, setAnswerText] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation | null>(null);
  
  // Pomodoro Focus Timer State
  const [timerMode, setTimerMode] = useState<TimerMode>('25m-focus');
  const [timerDurationSeconds, setTimerDurationSeconds] = useState<number>(25 * 60);
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [elapsedQuestionSeconds, setElapsedQuestionSeconds] = useState<number>(0);

  // Audio Speech Recognition
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  
  // AI Hint State
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [isGeneratingHint, setIsGeneratingHint] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<AIArchitecturalHint | null>(null);
  const [showGoldAnswer, setShowGoldAnswer] = useState<boolean>(false);

  // Wildcard Production Constraint State
  const [wildcardConstraint, setWildcardConstraint] = useState<WildcardConstraint | null>(null);
  const [showWildcardPicker, setShowWildcardPicker] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Filter questions by selected difficulty, track, or role
  const filteredQuestions = questionsList.filter((q) => {
    const trackMatch = selectedTrack === 'all' || q.track === selectedTrack;
    const diffMatch = !difficulty || q.difficulty === difficulty;
    const roleMatch = !roleProfile || !q.roleProfile || q.roleProfile === roleProfile;
    return trackMatch && diffMatch;
  });

  const activeQuestion: InterviewQuestion = 
    filteredQuestions[currentQuestionIndex] || 
    filteredQuestions[0] || 
    questionsList[0] || 
    CURATED_QUESTIONS[0];

  // Check Adaptive Difficulty Progression
  const recentAnswerScores = completedAnswers
    .filter((a) => a.question?.difficulty === difficulty)
    .map((a) => a.evaluation?.overallScore || 0);

  const highProficiencyCount = recentAnswerScores.filter((s) => s >= 80).length;
  const canLevelUp = 
    (difficulty === 'Junior GTM Engineer' && highProficiencyCount >= 2) ||
    (difficulty === 'Mid-Level GTM Engineer' && highProficiencyCount >= 2) ||
    (difficulty === 'Senior GTM Engineer' && highProficiencyCount >= 3);

  const getNextDifficultyTier = (current: DifficultyLevel): DifficultyLevel => {
    if (current === 'Junior GTM Engineer') return 'Mid-Level GTM Engineer';
    if (current === 'Mid-Level GTM Engineer') return 'Senior GTM Engineer';
    return 'Staff / Principal GTM Architect';
  };

  const handleLevelUp = () => {
    const nextTier = getNextDifficultyTier(difficulty);
    setDifficulty(nextTier);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Pomodoro countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerRemainingSeconds((prev) => {
          if (prev <= 1) {
            // Play gentle web audio chime
            if (typeof window !== 'undefined' && 'AudioContext' in window) {
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.8);
              } catch (e) {
                console.error(e);
              }
            }
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
        setElapsedQuestionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleSetTimerMode = (mode: TimerMode) => {
    setTimerMode(mode);
    let seconds = 25 * 60;
    if (mode === '15m-sprint') seconds = 15 * 60;
    if (mode === '5m-drill') seconds = 5 * 60;
    if (mode === '5m-review') seconds = 5 * 60;
    setTimerDurationSeconds(seconds);
    setTimerRemainingSeconds(seconds);
    setIsTimerRunning(false);
  };

  const handleAddTimerMinutes = (minutes: number) => {
    setTimerRemainingSeconds((prev) => prev + minutes * 60);
    setTimerDurationSeconds((prev) => prev + minutes * 60);
  };

  // Read question aloud when enabled
  useEffect(() => {
    if (audioEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window && activeQuestion) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeQuestion.question);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [activeQuestion, audioEnabled]);

  const switchQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    const targetQ = filteredQuestions[index] || questionsList[index];
    const existing = completedAnswers.find((a) => a.questionId === targetQ?.id);
    if (existing) {
      setAnswerText(existing.candidateAnswer);
      setCurrentEvaluation(existing.evaluation);
      setElapsedQuestionSeconds(existing.timeSpentSeconds || 0);
    } else {
      setAnswerText('');
      setCurrentEvaluation(null);
      setElapsedQuestionSeconds(0);
      setShowGoldAnswer(false);
      setActiveHint(null);
    }
  };

  // Web Speech API for voice dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
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
            setAnswerText((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error', event.error);
          setRecognitionError(event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your response.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setRecognitionError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    }
  };

  // Request real-time structural AI Hint
  const handleOpenAIHint = async () => {
    setShowHintModal(true);
    if (activeHint) return;

    if (activeQuestion.structuredHint) {
      setActiveHint(activeQuestion.structuredHint);
      return;
    }

    setIsGeneratingHint(true);
    try {
      const res = await fetch('/app/api/generate-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion,
          difficulty,
          roleProfile,
          wildcard: wildcardConstraint,
        }),
      });
      const data = await res.json();
      setActiveHint(data);
    } catch (e) {
      console.error('Failed to generate AI hint', e);
      // Fallback hint
      setActiveHint({
        structureFramework: [
          '1. Ingestion & Ingress: Decouple incoming webhooks via async queue (Redis/SQS).',
          '2. Normalization: Sanitize inputs, enforce Zod schemas, normalize phone/domain.',
          '3. Execution & Waterfall: Cascade providers by cost with short-circuiting.',
          '4. CRM Sync: Apply anti-recursion filters and idempotency keys.',
          '5. Telemetry: Measure speed-to-lead latency and error retry rates.'
        ],
        keyComponentsToMention: ['Async Queue', 'Idempotency Keys', 'Clay/Apollo Waterfall', 'Anti-Recursion Guard'],
        criticalEdgeCases: ['HTTP 429 Rate Limits', 'Bi-directional sync loops'],
        revenueMetricAngle: 'Protect speed-to-lead SLA (<5 min) while cutting enrichment data cost by 60%.',
        resumeStoryHook: 'Reference your Novalyte AI Revenue Command Center and Zendesk sales ops experience.'
      });
    } finally {
      setIsGeneratingHint(false);
    }
  };

  const handleInsertScaffold = () => {
    if (!activeHint) return;
    const scaffoldTemplate = `### Technical Architecture Overview
${activeHint.structureFramework.join('\n')}

### Core Components & Modern Tooling
- ${activeHint.keyComponentsToMention.join('\n- ')}

### Edge Case Mitigation & Governance
- ${activeHint.criticalEdgeCases.join('\n- ')}

### Revenue & Business Impact
${activeHint.revenueMetricAngle}
`;
    setAnswerText((prev) => prev ? `${prev}\n\n${scaffoldTemplate}` : scaffoldTemplate);
    setShowHintModal(false);
  };

  // Generate dynamic custom interview question
  const handleGenerateNewQuestion = async () => {
    setIsGeneratingQuestion(true);
    try {
      const res = await fetch('/app/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: selectedTrack === 'all' ? 'system-architecture' : selectedTrack,
          difficulty,
          roleProfile,
          companyArchetype,
        }),
      });
      const newQuestion: InterviewQuestion = await res.json();
      setQuestionsList((prev) => [newQuestion, ...prev]);
      setCurrentQuestionIndex(0);
      setAnswerText('');
      setCurrentEvaluation(null);
      setElapsedQuestionSeconds(0);
      setActiveHint(null);
    } catch (e) {
      console.error('Failed to generate new question', e);
      alert('Could not generate question. Please try again.');
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Submit answer for AI evaluation
  const handleEvaluateAnswer = async () => {
    if (!answerText.trim()) {
      alert('Please type or record your technical response before submitting for evaluation.');
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await fetch('/app/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion,
          candidateAnswer: answerText,
          track: activeQuestion.track,
          difficulty: activeQuestion.difficulty || difficulty,
          wildcard: wildcardConstraint,
        }),
      });

      const evaluation: AnswerEvaluation = await res.json();
      setCurrentEvaluation(evaluation);

      // Save answer record
      const record: CandidateAnswerRecord = {
        questionId: activeQuestion.id,
        question: activeQuestion,
        candidateAnswer: answerText,
        evaluation,
        wildcard: wildcardConstraint || undefined,
        timeSpentSeconds: elapsedQuestionSeconds || 60,
        timestamp: new Date().toISOString(),
      };
      onSaveAnswer(record);

      if (evaluation.overallScore >= 80) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (e) {
      console.error('Failed to evaluate answer', e);
      alert('An error occurred during evaluation. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Format timer MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = timerDurationSeconds > 0 
    ? ((timerDurationSeconds - timerRemainingSeconds) / timerDurationSeconds) * 100 
    : 0;

  return (
    <div className="space-y-6 text-stone-800">
      {/* Top Configuration & Progression Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <StepTooltip stepNumber={1} badgeLabel="Step 1: Role & Track" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                <Target className="h-3.5 w-3.5 text-indigo-600" />
                Live Interview Simulator
              </span>
              <span className="text-xs text-stone-500 hidden sm:inline">
                Calibrated for Senior & Staff GTM Roles
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-stone-900 mt-1">
              Technical Architecture & System Design Practice
            </h2>
          </div>

          {/* Role Profile & Difficulty Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Role Profile Selector */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-stone-500 font-medium">Role:</span>
              <select
                value={roleProfile}
                onChange={(e) => setRoleProfile(e.target.value as GTMRoleProfile)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="GTM Systems Engineer">GTM Systems Engineer</option>
                <option value="GTM Engineer">GTM Engineer</option>
                <option value="Sales Engineer">Sales Engineer</option>
                <option value="Solutions Architect">Solutions Architect</option>
                <option value="RevOps Architect">RevOps Architect</option>
                <option value="Forward Deployed AI Engineer">Forward Deployed AI Engineer</option>
              </select>
            </div>

            {/* Difficulty Level Selector */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-stone-500 font-medium">Tier:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="Junior GTM Engineer">Junior GTM Engineer</option>
                <option value="Mid-Level GTM Engineer">Mid-Level GTM Engineer</option>
                <option value="Senior GTM Engineer">Senior GTM Engineer</option>
                <option value="Staff / Principal GTM Architect">Staff / Principal GTM Architect</option>
              </select>
            </div>

            {/* Track Selector */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-stone-500 font-medium">Track:</span>
              <select
                value={selectedTrack}
                onChange={(e) => {
                  setSelectedTrack(e.target.value as any);
                  setCurrentQuestionIndex(0);
                }}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="all">All Tracks</option>
                <option value="resume-deep-dive">Novalyte & Resume Deep-Dive</option>
                <option value="system-architecture">System Architecture</option>
                <option value="waterfall-enrichment">Clay & Waterfall Enrichment</option>
                <option value="crm-data-hygiene">CRM & Sync Hygiene</option>
                <option value="ai-gtm-workflows">AI & Agentic Workflows</option>
                <option value="pipeline-telemetry">Pipeline Telemetry & SQL</option>
              </select>
            </div>

            <button
              onClick={handleGenerateNewQuestion}
              disabled={isGeneratingQuestion}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isGeneratingQuestion ? 'Synthesizing...' : 'New AI Drill'}</span>
            </button>
          </div>
        </div>

        {/* Adaptive Difficulty Progression Banner */}
        {canLevelUp && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900">Proficiency Milestone Unlocked!</span>{' '}
                <span className="text-emerald-800">
                  You scored 80%+ across multiple questions in {difficulty}. You are ready for the next level.
                </span>
              </div>
            </div>
            <button
              onClick={handleLevelUp}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-emerald-700 px-3 py-1 font-bold text-white shadow-sm hover:bg-emerald-800 transition"
            >
              <span>Level Up to {getNextDifficultyTier(difficulty)}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Stage: Left = Question & Pomodoro, Right = Answer & Debrief */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Active Question & Pomodoro Focus Timer */}
        <div className="lg:col-span-5 space-y-5">
          {/* Pomodoro Focus Timer Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Technical Drill Focus Timer
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSetTimerMode('25m-focus')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    timerMode === '25m-focus' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  25m Drill
                </button>
                <button
                  onClick={() => handleSetTimerMode('15m-sprint')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    timerMode === '15m-sprint' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  15m Sprint
                </button>
                <button
                  onClick={() => handleSetTimerMode('5m-drill')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    timerMode === '5m-drill' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  5m Rapid
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-stone-50 rounded-xl p-3 border border-stone-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-mono font-bold text-stone-900">
                  {formatTime(timerRemainingSeconds)}
                </div>
                <div className="text-[11px] text-stone-500">
                  Elapsed: <span className="font-medium text-stone-800">{formatTime(elapsedQuestionSeconds)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm transition ${
                    isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-900 hover:bg-stone-800'
                  }`}
                >
                  {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                </button>

                <button
                  onClick={() => handleAddTimerMinutes(5)}
                  title="Add 5 minutes"
                  className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-100 text-xs font-bold"
                >
                  +5m
                </button>

                <button
                  onClick={() => handleSetTimerMode(timerMode)}
                  title="Reset Timer"
                  className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${timerProgress}%` }}
              />
            </div>
          </div>

          {/* Active Question Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <StepTooltip stepNumber={2} badgeLabel="Step 2: Constraints" />
                <span className="rounded-md bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700 border border-stone-200">
                  {activeQuestion.category}
                </span>
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                  {activeQuestion.difficulty}
                </span>
              </div>

              {/* Wildcard Constraint Injector */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowWildcardPicker(!showWildcardPicker)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold transition shadow-2xs ${
                      wildcardConstraint
                        ? 'border-amber-400 bg-amber-100 text-amber-900'
                        : 'border-amber-300 bg-amber-50/80 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    <Dices className="h-3.5 w-3.5 text-amber-600" />
                    <span>{wildcardConstraint ? 'Change Wildcard' : '🎲 Inject Wildcard'}</span>
                  </button>

                  {/* Wildcard Picker Dropdown */}
                  {showWildcardPicker && (
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl z-50 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="text-xs font-bold text-stone-900">
                          Simulate Production Gotcha
                        </span>
                        <button
                          onClick={() => {
                            const rand = WILDCARD_CONSTRAINTS[Math.floor(Math.random() * WILDCARD_CONSTRAINTS.length)];
                            setWildcardConstraint(rand);
                            setShowWildcardPicker(false);
                          }}
                          className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 hover:bg-amber-200"
                        >
                          🎲 Random
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-xs">
                        {WILDCARD_CONSTRAINTS.map((wc) => (
                          <button
                            key={wc.id}
                            onClick={() => {
                              setWildcardConstraint(wc);
                              setShowWildcardPicker(false);
                            }}
                            className="w-full text-left rounded-xl p-2 hover:bg-stone-50 border border-stone-100 transition space-y-0.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-900 text-[11px]">{wc.title}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                wc.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {wc.severity}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-500 line-clamp-1">{wc.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-xs text-stone-400 font-mono">
                  Q{currentQuestionIndex + 1} of {filteredQuestions.length || 1}
                </span>
              </div>
            </div>

            {/* Injected Wildcard Alert Banner (if active) */}
            {wildcardConstraint && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <span>🎲 Wildcard Constraint Injected:</span>
                      <span className="text-stone-900 font-bold">{wildcardConstraint.title}</span>
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                      wildcardConstraint.severity === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {wildcardConstraint.severity}
                    </span>
                  </div>

                  <button
                    onClick={() => setWildcardConstraint(null)}
                    className="text-stone-400 hover:text-stone-700 p-0.5"
                    title="Remove Wildcard"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-amber-950 font-medium leading-relaxed">
                  {wildcardConstraint.description}
                </p>

                <div className="rounded-lg bg-white/90 p-2 text-[10px] text-amber-950 border border-amber-200/80">
                  <span className="font-bold text-indigo-700">Required Mitigation: </span>
                  {wildcardConstraint.architecturalMitigationHint}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900 leading-snug">
                {activeQuestion.title}
              </h3>
              <p className="text-xs font-medium text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                {activeQuestion.question}
              </p>
            </div>

            {activeQuestion.contextScenario && (
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 text-xs space-y-1">
                <span className="font-bold text-stone-700 uppercase text-[10px] tracking-wider">
                  Company Context:
                </span>
                <p className="text-stone-600">{activeQuestion.contextScenario}</p>
              </div>
            )}

            {/* Evaluation Criteria Checklist */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-stone-800">Key Evaluation Criteria:</div>
              <ul className="space-y-1 text-xs text-stone-600">
                {activeQuestion.keyEvaluationCriteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Bar: AI Hint, Panic Button & Gold Standard Answer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAIHint}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>AI Hint</span>
                </button>

                <PanicButton
                  currentTrack={activeQuestion.track}
                  currentQuestionTitle={activeQuestion.title}
                />
              </div>

              <button
                onClick={() => setShowGoldAnswer(!showGoldAnswer)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900 transition"
              >
                <span>{showGoldAnswer ? 'Hide Exemplar' : 'View Gold Standard'}</span>
                {showGoldAnswer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Exemplar Gold Standard Answer Dropdown */}
            {showGoldAnswer && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs space-y-2 animate-in fade-in">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-600" />
                  Principal Architect Exemplar Response
                </div>
                <p className="text-stone-700 leading-relaxed whitespace-pre-line text-[11px]">
                  {activeQuestion.expectedSolutionOutline || 
                   activeQuestion.sampleTechnicalHint || 
                   "A gold standard answer begins with an architectural overview: 'I decouple ingress from enrichment using an async queue (e.g., Redis BullMQ), then execute a tiered waterfall cascade with short-circuiting once verified contacts are found. All writes use idempotency keys to prevent duplicate Lead records, and data flows to Salesforce via a dedicated integration user with anti-recursion triggers.'"}
                </p>
              </div>
            )}

            {/* Question Quick-Switch Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => switchQuestion(currentQuestionIndex - 1)}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 disabled:opacity-40"
              >
                ← Previous
              </button>
              <div className="flex gap-1">
                {filteredQuestions.slice(0, 6).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchQuestion(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentQuestionIndex ? 'w-6 bg-indigo-600' : 'w-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                  />
                ))}
              </div>
              <button
                disabled={currentQuestionIndex >= filteredQuestions.length - 1}
                onClick={() => switchQuestion(currentQuestionIndex + 1)}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Candidate Answer Workspace & AI Rubric Debrief */}
        <div className="lg:col-span-7 space-y-5">
          {/* Answer Workspace */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <StepTooltip stepNumber={3} badgeLabel="Step 3: Structure Solution" />
                <Cpu className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  Your Technical Response Workspace
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoiceRecording}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                    isListening
                      ? 'border-rose-300 bg-rose-50 text-rose-700 animate-pulse'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {isListening ? <Mic className="h-3.5 w-3.5 text-rose-600" /> : <MicOff className="h-3.5 w-3.5" />}
                  <span>{isListening ? 'Recording Audio...' : 'Voice Dictation'}</span>
                </button>

                <button
                  onClick={() => setAnswerText('')}
                  className="p-1.5 text-stone-400 hover:text-stone-700"
                  title="Clear text"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Outline your end-to-end technical architecture, API integration sequence, SQL deduplication strategy, edge-case guards, and business outcomes..."
              rows={9}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-4 text-xs font-sans leading-relaxed text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition resize-y"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-xs text-stone-500">
                Words: <span className="font-semibold text-stone-700">{answerText.trim() ? answerText.trim().split(/\s+/).length : 0}</span> • Characters: <span className="font-semibold text-stone-700">{answerText.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <StepTooltip stepNumber={4} badgeLabel="Step 4: AI Evaluation" />
                <button
                  onClick={handleEvaluateAnswer}
                  disabled={isEvaluating || !answerText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isEvaluating ? 'Evaluating Architectural Rigor...' : 'Submit for Evaluation'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Rubric Debrief & Benchmark Evaluation */}
          {currentEvaluation && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-5 animate-in fade-in">
              {/* Score Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Architectural Evaluation Scorecard
                  </div>
                  <h4 className="text-base font-bold text-stone-900 mt-0.5">
                    Grade: <span className="text-indigo-600">{currentEvaluation.letterGrade}</span> ({currentEvaluation.overallScore}/100)
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-stone-50 border border-stone-200 px-3 py-1.5 text-center">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">Percentile</div>
                    <div className="text-xs font-bold text-stone-900">
                      Top {100 - (currentEvaluation.benchmark?.percentile || 85)}%
                    </div>
                  </div>

                  <button
                    onClick={onGenerateReport}
                    className="inline-flex items-center gap-1 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-stone-800 transition"
                  >
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    <span>Generate Full Debrief Report</span>
                  </button>
                </div>
              </div>

              {/* 5-Pillar Score Tracks */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-800">5-Pillar GTM Competency Breakdown:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(currentEvaluation.pillarScores).map(([pillar, score]) => (
                    <div key={pillar} className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 space-y-1">
                      <div className="flex justify-between font-semibold text-stone-700 capitalize">
                        <span>{pillar.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-bold text-stone-900">{score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Blind Spots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-1.5">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Demonstrated Strengths
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-emerald-950">
                    {currentEvaluation.keyStrengths?.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1.5">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Missed Edge Cases & Blind Spots
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-amber-950">
                    {currentEvaluation.blindSpotsAndMissedEdgeCases?.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Resume Storytelling Advice (Novalyte AI & Zendesk) */}
              {currentEvaluation.resumeStorytellingOptimization && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs space-y-1.5">
                  <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    Resume Leverage Advice (Novalyte AI & Zendesk)
                  </div>
                  <p className="text-indigo-950 leading-relaxed">
                    {currentEvaluation.resumeStorytellingOptimization}
                  </p>
                </div>
              )}

              {/* Realistic Follow-up Question */}
              {currentEvaluation.interviewerFollowUp && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs space-y-1">
                  <div className="font-bold text-stone-800 flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5 text-stone-600" />
                    Next Follow-Up Question from Interviewer:
                  </div>
                  <p className="text-stone-700 italic">
                    &ldquo;{currentEvaluation.interviewerFollowUp}&rdquo;
                  </p>
                </div>
              )}

              {/* Conclude Session / Debrief Trigger Actions */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setAnswerText('');
                    setCurrentEvaluation(null);
                    setElapsedQuestionSeconds(0);
                    setWildcardConstraint(null);
                    if (currentQuestionIndex < filteredQuestions.length - 1) {
                      switchQuestion(currentQuestionIndex + 1);
                    } else {
                      handleGenerateNewQuestion();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition shadow-2xs"
                >
                  <span>Next Question Drill</span>
                  <ArrowRight className="h-3.5 w-3.5 text-stone-500" />
                </button>

                <div className="flex items-center gap-2">
                  <StepTooltip stepNumber={5} badgeLabel="Step 5: Calibrate & Reflect" />
                  {onOpenReflection && (
                    <button
                      onClick={onOpenReflection}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
                    >
                      <HeartHandshake className="h-3.5 w-3.5 text-amber-600" />
                      <span>Reflect & Debrief</span>
                    </button>
                  )}

                  <button
                    onClick={onGenerateReport}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 transition shadow-2xs"
                  >
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    <span>Generate Session Report</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Architectural Hint Modal / Drawer */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold text-stone-900">
                  AI Structural Architectural Guidance
                </h3>
              </div>
              <button
                onClick={() => setShowHintModal(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800"
              >
                ✕
              </button>
            </div>

            {isGeneratingHint ? (
              <div className="py-12 text-center space-y-2">
                <Sparkles className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-stone-600 font-medium">
                  Synthesizing architectural scaffold and edge-case framework...
                </p>
              </div>
            ) : activeHint ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs">
                <div className="space-y-2">
                  <div className="font-bold text-stone-900 uppercase text-[11px] tracking-wider">
                    Recommended Response Structure:
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-1.5">
                    {activeHint.structureFramework.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-stone-700">
                        <span className="font-bold text-indigo-600">{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 space-y-1">
                    <div className="font-bold text-indigo-900">Key Components to Name-Drop:</div>
                    <ul className="list-disc pl-4 space-y-0.5 text-indigo-950">
                      {activeHint.keyComponentsToMention.map((comp, idx) => (
                        <li key={idx}>{comp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-1">
                    <div className="font-bold text-amber-900">Critical Gotchas to Defend:</div>
                    <ul className="list-disc pl-4 space-y-0.5 text-amber-950">
                      {activeHint.criticalEdgeCases.map((edge, idx) => (
                        <li key={idx}>{edge}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                  <div className="font-bold text-stone-800">Business / Revenue Metric Anchor:</div>
                  <p className="text-stone-600">{activeHint.revenueMetricAngle}</p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-1">
                  <div className="font-bold text-emerald-900">Jamil&apos;s Resume Connection:</div>
                  <p className="text-emerald-950">{activeHint.resumeStoryHook}</p>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-500">
                Focuses on structure without spoiling the full implementation.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInsertScaffold}
                  disabled={!activeHint}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Insert Scaffold into Workspace</span>
                </button>
                <button
                  onClick={() => setShowHintModal(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
