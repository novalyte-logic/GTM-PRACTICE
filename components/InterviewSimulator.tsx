'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  HeartHandshake,
  StickyNote,
  Trash2
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
import { TARGET_APPLICATIONS, getTargetApplication, TargetCompanyApplication } from '@/lib/target-companies';
import { generateSpokenScript, generateTeleprompterCribSheet, SpokenScriptFramework, TeleprompterCribSheet } from '@/lib/script-generator';
import { getCompanyBriefing, CompanyExecutiveBriefing } from '@/lib/company-briefings';

interface InterviewSimulatorProps {
  onSaveAnswer: (record: CandidateAnswerRecord) => void;
  onGenerateReport: () => void;
  completedAnswers: CandidateAnswerRecord[];
  audioEnabled: boolean;
  onOpenReflection?: () => void;
  initialCompanyId?: string;
}

type TimerMode = '25m-focus' | '15m-sprint' | '5m-drill' | '5m-review';

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({
  onSaveAnswer,
  onGenerateReport,
  completedAnswers,
  audioEnabled,
  onOpenReflection,
  initialCompanyId,
}) => {
  // Target Company State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | 'none'>(initialCompanyId || 'none');
  const [showCompanyDrawer, setShowCompanyDrawer] = useState<boolean>(false);

  const selectedCompany: TargetCompanyApplication | undefined = 
    selectedCompanyId !== 'none' ? getTargetApplication(selectedCompanyId) : undefined;

  // Sync initialCompanyId when prop changes
  useEffect(() => {
    if (initialCompanyId) {
      setSelectedCompanyId(initialCompanyId);
      const app = getTargetApplication(initialCompanyId);
      if (app) {
        setRoleProfile(app.role as any);
      }
    }
  }, [initialCompanyId]);

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

  // 'Retry this question' Feedback Loop State
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [previousAttemptEvaluation, setPreviousAttemptEvaluation] = useState<AnswerEvaluation | null>(null);
  const [retryScoreDelta, setRetryScoreDelta] = useState<number | null>(null);
  
  // Pomodoro Focus Timer & 2-Minute Pacing Alert State
  const [timerMode, setTimerMode] = useState<TimerMode>('25m-focus');
  const [timerDurationSeconds, setTimerDurationSeconds] = useState<number>(25 * 60);
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [elapsedQuestionSeconds, setElapsedQuestionSeconds] = useState<number>(0);
  const [showPacingAlert, setShowPacingAlert] = useState<boolean>(false);
  const hasTriggeredTwoMinAlertRef = useRef<boolean>(false);

  // Real-time Speech-to-Text Transcription State
  const [isDictationMode, setIsDictationMode] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    }
    return true;
  });
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const isDictationModeRef = useRef<boolean>(false);

  // DOM Refs for auto-scrolling on Retry
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // AI Hint State
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [isGeneratingHint, setIsGeneratingHint] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<AIArchitecturalHint | null>(null);
  const [showGoldAnswer, setShowGoldAnswer] = useState<boolean>(false);

  // Wildcard Production Constraint State
  const [wildcardConstraint, setWildcardConstraint] = useState<WildcardConstraint | null>(null);
  const [showWildcardPicker, setShowWildcardPicker] = useState<boolean>(false);

  // Persistent Quick Technical Notes Scratchpad
  const [quickNotes, setQuickNotes] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('gtm_simulator_quick_notes') || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [notesExpanded, setNotesExpanded] = useState<boolean>(true);
  const [copiedNotes, setCopiedNotes] = useState<boolean>(false);

  const handleNotesChange = (text: string) => {
    setQuickNotes(text);
    try {
      localStorage.setItem('gtm_simulator_quick_notes', text);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyNotes = () => {
    if (!quickNotes) return;
    navigator.clipboard.writeText(quickNotes);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleClearNotes = () => {
    if (quickNotes && window.confirm('Clear your scratchpad notes?')) {
      handleNotesChange('');
    }
  };

  const handleInsertNoteSnippet = (snippet: string) => {
    const updated = quickNotes ? `${quickNotes}\n• ${snippet}` : `• ${snippet}`;
    handleNotesChange(updated);
  };

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

  // Spoken Script & Teleprompter State
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  const [showTeleprompter, setShowTeleprompter] = useState<boolean>(true);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const scriptFramework: SpokenScriptFramework = useMemo(() => {
    return generateSpokenScript(activeQuestion, selectedCompany);
  }, [activeQuestion, selectedCompany]);

  const teleprompterData: TeleprompterCribSheet = useMemo(() => {
    return generateTeleprompterCribSheet(activeQuestion, selectedCompany);
  }, [activeQuestion, selectedCompany]);

  const companyBriefing: CompanyExecutiveBriefing | undefined = useMemo(() => {
    return selectedCompany ? getCompanyBriefing(selectedCompany.id) : undefined;
  }, [selectedCompany]);

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

  // Gentle 2-minute pacing alert audio chime using Web Audio API
  const playTwoMinuteAlertChime = () => {
    if (typeof window !== 'undefined' && ('AudioContext' in window || (window as any).webkitAudioContext)) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtxClass();
        // Warm melodic marimba triad: F4 (349.23Hz) -> A4 (440Hz) -> C5 (523.25Hz)
        const notes = [349.23, 440.0, 523.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

          gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.12 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.65);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.7);
        });
      } catch (e) {
        console.error('Failed to play pacing alert chime', e);
      }
    }
  };

  // Pomodoro countdown timer effect with gentle 2-minute pacing alert
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerRemainingSeconds((prev) => {
          if (prev <= 1) {
            // Play gentle web audio completion chime
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

          // Gentle 2-minute pacing alert: triggers when timer crosses 2 minutes (120 seconds) remaining
          if ((prev === 121 || (prev <= 120 && prev > 115)) && !hasTriggeredTwoMinAlertRef.current) {
            hasTriggeredTwoMinAlertRef.current = true;
            setShowPacingAlert(true);
            playTwoMinuteAlertChime();
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
    hasTriggeredTwoMinAlertRef.current = false;
    setShowPacingAlert(false);
  };

  const handleAddTimerMinutes = (minutes: number) => {
    setTimerRemainingSeconds((prev) => {
      const updated = prev + minutes * 60;
      if (updated > 120) {
        setShowPacingAlert(false);
        hasTriggeredTwoMinAlertRef.current = false;
      }
      return updated;
    });
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
    setIsRetrying(false);
    setRetryScoreDelta(null);
    setPreviousAttemptEvaluation(null);
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

  // Web Speech API for real-time speech-to-text dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let finalChunk = '';
          let interimChunk = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalChunk += transcript + ' ';
            } else {
              interimChunk += transcript;
            }
          }

          if (finalChunk.trim()) {
            setAnswerText((prev) => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${finalChunk.trim()}` : finalChunk.trim();
            });
          }
          setInterimTranscript(interimChunk);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
          if (event.error === 'not-allowed') {
            setRecognitionError('Microphone permission blocked. Please allow mic permissions in your browser.');
            setIsListening(false);
            setIsDictationMode(false);
            isDictationModeRef.current = false;
          } else if (event.error !== 'no-speech') {
            setRecognitionError(`Recognition message: ${event.error}`);
          }
        };

        recognition.onend = () => {
          // If dictation mode is still enabled by the user, keep listening seamlessly
          if (isDictationModeRef.current) {
            try {
              recognition.start();
              setIsListening(true);
            } catch {
              // already running or reconnecting
            }
          } else {
            setIsListening(false);
            setInterimTranscript('');
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleDictationMode = () => {
    if (!isSpeechSupported || !recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your response.');
      return;
    }

    if (isDictationMode) {
      isDictationModeRef.current = false;
      setIsDictationMode(false);
      setIsListening(false);
      setInterimTranscript('');
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
    } else {
      setRecognitionError(null);
      isDictationModeRef.current = true;
      setIsDictationMode(true);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    }
  };

  // Retry question handlers
  const handleStartRetry = () => {
    if (!currentEvaluation) return;
    setPreviousAttemptEvaluation(currentEvaluation);
    setIsRetrying(true);
    // Smooth scroll to workspace and focus
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 250);
  };

  const handleCancelRetry = () => {
    setIsRetrying(false);
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
      const res = await fetch('/api/generate-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion,
          difficulty,
          roleProfile: selectedCompany ? (selectedCompany.role as any) : roleProfile,
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
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: selectedTrack === 'all' ? 'system-architecture' : selectedTrack,
          difficulty,
          roleProfile: selectedCompany ? (selectedCompany.role as any) : roleProfile,
          companyArchetype,
          targetCompanyId: selectedCompany?.id,
          targetCompany: selectedCompany,
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
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: {
            ...activeQuestion,
            targetCompanyId: selectedCompany?.id || activeQuestion.targetCompanyId,
            targetCompany: selectedCompany || activeQuestion.targetCompany,
          },
          candidateAnswer: answerText,
          track: activeQuestion.track,
          difficulty: activeQuestion.difficulty || difficulty,
          wildcard: wildcardConstraint,
        }),
      });

      const evaluation: AnswerEvaluation = await res.json();
      setCurrentEvaluation(evaluation);

      // Calculate score delta if this was a question retry
      if (isRetrying && previousAttemptEvaluation) {
        const delta = evaluation.overallScore - previousAttemptEvaluation.overallScore;
        setRetryScoreDelta(delta);
      }
      setIsRetrying(false);

      // Save answer record to update session and recalibrate overall score
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
            {/* Target Applied Company Selector */}
            <div className="flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-200 rounded-xl px-2.5 py-1 text-xs">
              <Target className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="text-indigo-950 font-bold">Target Company:</span>
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCompanyId(val);
                  if (val !== 'none') {
                    const app = getTargetApplication(val);
                    if (app) {
                      setRoleProfile(app.role as any);
                    }
                  }
                }}
                className="bg-transparent font-bold text-indigo-900 focus:outline-none cursor-pointer max-w-[210px] truncate"
              >
                <option value="none">🌐 General Practice (All Archetypes)</option>
                <optgroup label="✨ High-Priority Applied Roles">
                  {TARGET_APPLICATIONS.filter(a => a.isNew || a.ashbyQas.length > 0).map((app) => (
                    <option key={app.id} value={app.id}>
                      🎯 {app.company} ({app.role})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="All Tracked Applications">
                  {TARGET_APPLICATIONS.filter(a => !a.isNew && a.ashbyQas.length === 0).map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} ({app.role})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

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
          {/* Pomodoro Focus Timer Card with Visual Countdown & Pacing Alert */}
          <div className={`rounded-2xl border p-4 shadow-sm space-y-3 transition-all duration-300 ${
            timerRemainingSeconds <= 120 && timerRemainingSeconds > 0 && isTimerRunning
              ? 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-300/60 shadow-amber-100/50'
              : 'border-stone-200 bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className={`h-4 w-4 ${timerRemainingSeconds <= 120 && isTimerRunning ? 'text-amber-600 animate-pulse' : 'text-amber-600'}`} />
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Technical Drill Focus Timer
                </span>
                {timerRemainingSeconds <= 120 && timerRemainingSeconds > 0 && isTimerRunning && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 border border-amber-300 animate-pulse">
                    <Clock className="h-3 w-3 text-amber-700" />
                    2m Wrap-Up Alert
                  </span>
                )}
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

            <div className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
              timerRemainingSeconds <= 120 && timerRemainingSeconds > 0 && isTimerRunning
                ? 'bg-white border-amber-300'
                : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-mono font-bold tracking-tight transition-colors ${
                  timerRemainingSeconds <= 120 && timerRemainingSeconds > 0 && isTimerRunning
                    ? 'text-amber-600 animate-pulse'
                    : 'text-stone-900'
                }`}>
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
                  onClick={() => handleAddTimerMinutes(2)}
                  title="Add 2 minutes buffer"
                  className="rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 p-1.5 text-amber-900 text-xs font-bold transition"
                >
                  +2m
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
                className={`h-full transition-all duration-300 ${
                  timerRemainingSeconds <= 120 && timerRemainingSeconds > 0 && isTimerRunning
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${timerProgress}%` }}
              />
            </div>

            {/* Gentle 2-Minute Pacing Alert Notification */}
            {showPacingAlert && timerRemainingSeconds > 0 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 space-y-2 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500 text-white font-bold text-xs mt-0.5">
                      ⏳
                    </span>
                    <div>
                      <div className="text-xs font-bold text-amber-950">
                        Pacing Alert: 2 Minutes Remaining in Suggested Window!
                      </div>
                      <p className="text-[11px] text-amber-900 leading-snug mt-0.5">
                        Wrap up your core architecture and transition to governor limits, edge cases, and business ROI metrics to finish on time.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPacingAlert(false)}
                    className="text-amber-600 hover:text-amber-950 p-0.5 rounded transition"
                    title="Dismiss Alert"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-amber-200/80">
                  <button
                    onClick={() => handleAddTimerMinutes(2)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-300 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
                  >
                    <span>+2m Extension</span>
                  </button>
                  <button
                    onClick={() => setShowPacingAlert(false)}
                    className="text-[11px] font-semibold text-amber-800 hover:underline"
                  >
                    Got it, wrap up answer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Target Company Active Spotlight Card */}
          {selectedCompany && (
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white p-4 shadow-sm space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-sm shadow-xs">
                    🎯
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-stone-900 text-sm">{selectedCompany.company}</span>
                      <span className="text-xs text-indigo-700 font-semibold">• {selectedCompany.role}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">
                      {selectedCompany.location} {selectedCompany.compensation ? `• ${selectedCompany.compensation}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                    {selectedCompany.matchScore}% Match
                  </span>
                  <button
                    onClick={() => setShowCompanyDrawer(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200 shadow-2xs hover:bg-indigo-50 transition"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                    <span>View Application Q&A ({selectedCompany.ashbyQas?.length || 0})</span>
                  </button>
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-indigo-100/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/70 mr-1">Stack:</span>
                {selectedCompany.techStack.map((tech) => (
                  <span key={tech} className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-medium text-stone-700 border border-indigo-100 shadow-2xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

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

                <button
                  onClick={() => setShowScriptModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition shadow-2xs"
                  title="View a ready-to-speak 60-second answer script using the STAR framework"
                >
                  <Volume2 className="h-3.5 w-3.5 text-purple-600" />
                  <span>🎙️ How to Say It (60s Script)</span>
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
          <div ref={workspaceRef} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <StepTooltip stepNumber={3} badgeLabel="Step 3: Structure Solution" />
                <Cpu className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  Your Technical Response Workspace
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Real-Time Speech-to-Text Transcription Toggle */}
                <button
                  onClick={toggleDictationMode}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                    isDictationMode
                      ? 'border-rose-400 bg-rose-50 text-rose-800 ring-2 ring-rose-300 animate-pulse'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                  title={isDictationMode ? 'Click to stop live dictation' : 'Enable real-time speech-to-text dictation'}
                >
                  {isDictationMode ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                      <Mic className="h-3.5 w-3.5 text-rose-600" />
                    </span>
                  ) : (
                    <MicOff className="h-3.5 w-3.5 text-stone-500" />
                  )}
                  <span>{isDictationMode ? 'Dictating Thoughts...' : 'Speech-to-Text (Dictate)'}</span>
                </button>

                <button
                  onClick={() => setAnswerText('')}
                  className="p-1.5 text-stone-400 hover:text-stone-700 transition"
                  title="Clear text"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Real-Time Live Speech-to-Text Transcription Bar */}
            {isDictationMode && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3 space-y-2 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Soundwave animation */}
                    <div className="flex items-center gap-0.5 h-3.5">
                      <span className="w-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                      <span className="w-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                      <span className="w-1 bg-indigo-600 rounded-full animate-bounce h-2" />
                      <span className="w-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.2s] h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-indigo-950">
                      Real-Time Speech-to-Text Active
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                      Speak freely — words transcribe live into your answer
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAnswerText((prev) => (prev ? `${prev.trim()}\n• ` : '• '))}
                      className="rounded-lg bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-800 hover:bg-indigo-50 shadow-2xs"
                      title="Insert bullet point"
                    >
                      + Bullet (•)
                    </button>
                    <button
                      onClick={() => setAnswerText((prev) => `${prev.trim()}\n\n`)}
                      className="rounded-lg bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-800 hover:bg-indigo-50 shadow-2xs"
                      title="Insert new paragraph"
                    >
                      ¶ Paragraph
                    </button>
                    <button
                      onClick={toggleDictationMode}
                      className="rounded-lg bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-800 hover:bg-rose-200"
                    >
                      Stop Mic
                    </button>
                  </div>
                </div>

                {/* Real-Time Live Transcript Preview */}
                <div className="rounded-lg bg-white p-2.5 border border-indigo-100 text-xs min-h-[36px] flex items-center">
                  {interimTranscript ? (
                    <span className="text-indigo-900 italic font-medium">
                      &ldquo;{interimTranscript}&rdquo; <span className="inline-block w-1.5 h-3 bg-indigo-600 ml-1 animate-pulse" />
                    </span>
                  ) : (
                    <span className="text-stone-400 text-[11px]">
                      Listening for speech... Dictate your system architecture, Clay waterfalls, idempotency guards, and edge cases.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Question Revision & Retry Banner (When user clicks 'Retry This Question') */}
            {isRetrying && previousAttemptEvaluation && (
              <div className="rounded-xl border border-indigo-300 bg-indigo-50/90 p-3.5 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-indigo-950">
                        Revision Loop Active: Retrying Question
                      </div>
                      <div className="text-[11px] text-indigo-800">
                        Initial Score: <span className="font-bold text-stone-900">{previousAttemptEvaluation.overallScore}/100 ({previousAttemptEvaluation.letterGrade})</span> • Address the feedback rubric below to recalibrate your session average.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCancelRetry}
                    className="text-stone-400 hover:text-stone-700 p-1"
                    title="Cancel Retry"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {previousAttemptEvaluation.blindSpotsAndMissedEdgeCases?.length > 0 && (
                  <div className="rounded-lg bg-white/90 p-2.5 border border-indigo-200 text-xs space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      Key Blind Spots to Address in Your Revision:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-stone-700 text-[11px]">
                      {previousAttemptEvaluation.blindSpotsAndMissedEdgeCases.map((bs, i) => (
                        <li key={i}>{bs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-indigo-200/60">
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      onClick={() => setAnswerText('')}
                      className="font-bold text-stone-600 hover:text-stone-900 underline"
                    >
                      Clear to re-type / re-record from scratch
                    </button>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-500">
                      Re-evaluation will overwrite this question&apos;s score and recalculate overall session average.
                    </span>
                  </div>

                  <button
                    onClick={handleCancelRetry}
                    className="text-[11px] font-semibold text-stone-500 hover:text-stone-800"
                  >
                    Cancel Revision
                  </button>
                </div>
              </div>
            )}

            {/* Live Teleprompter / Crib Sheet Banner (Feature 4) */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-stone-50 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-[10px]">
                    🪟
                  </span>
                  <span className="text-xs font-extrabold text-indigo-950">
                    Live Teleprompter Crib Sheet (Peek While Speaking)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTeleprompter(!showTeleprompter)}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 transition"
                >
                  {showTeleprompter ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {showTeleprompter && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-xs animate-in fade-in">
                  <div className="rounded-xl bg-white p-2.5 border border-indigo-100 shadow-2xs space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-indigo-600" />
                      3 Buzzwords to Drop:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {teleprompterData.buzzwordsToDrop.map((b) => (
                        <span key={b} className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-900 border border-indigo-100">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-2.5 border border-emerald-100 shadow-2xs space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      Target Metric to Quote:
                    </span>
                    <div className="text-[11px] font-bold text-emerald-900">
                      📈 {teleprompterData.targetMetricToQuote}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-2.5 border border-purple-100 shadow-2xs space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 flex items-center gap-1">
                      <Award className="h-3 w-3 text-purple-600" />
                      Your Story Anchor:
                    </span>
                    <div className="text-[10px] text-purple-950 font-medium line-clamp-2">
                      {teleprompterData.storyAnchor}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <textarea
              ref={textareaRef}
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
                  className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 ${
                    isRetrying ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isRetrying ? <RotateCcw className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                  <span>
                    {isEvaluating
                      ? 'Evaluating Architectural Rigor...'
                      : isRetrying
                      ? 'Submit Revised Answer & Update Score'
                      : 'Submit for Evaluation'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Rubric Debrief & Benchmark Evaluation */}
          {currentEvaluation && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-5 animate-in fade-in">
              {/* Question Retried & Score Recalibrated Notification Banner */}
              {retryScoreDelta !== null && previousAttemptEvaluation && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-xs font-extrabold text-emerald-950 flex items-center gap-2">
                        <span>Question Retried &amp; Session Score Recalibrated!</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          retryScoreDelta >= 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {retryScoreDelta >= 0 ? `+${retryScoreDelta}% Gain` : `${retryScoreDelta}%`}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-900 mt-0.5">
                        Previous Attempt: <span className="font-semibold">{previousAttemptEvaluation.overallScore}% ({previousAttemptEvaluation.letterGrade})</span> → Re-evaluated Score: <span className="font-bold">{currentEvaluation.overallScore}% ({currentEvaluation.letterGrade})</span>. Overall session average updated.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartRetry}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition shadow-2xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retry Again</span>
                  </button>
                </div>
              )}

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
                  {/* 'Retry this question' Button in Scorecard Header */}
                  <button
                    onClick={handleStartRetry}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
                    title="Re-record or revise your technical answer to address blind spots and update your overall score"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Retry This Question</span>
                  </button>

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
                <div className="flex items-center gap-2">
                  {/* 'Retry this question' Button in Footer */}
                  <button
                    onClick={handleStartRetry}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-2xs"
                    title="Retry this question to target feedback blind spots and update your overall score"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-white" />
                    <span>Retry This Question</span>
                  </button>

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
                </div>

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

      {/* Persistent Quick Technical Notes & Live Scratchpad */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
              <StickyNote className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-stone-900">
                  Live Technical Scratchpad &amp; Notes
                </h4>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-saved locally
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Jot down scratch equations, schema fields, webhook payloads, or whiteboard notes during your simulation without leaving the page.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick action buttons */}
            <button
              onClick={handleCopyNotes}
              disabled={!quickNotes}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition disabled:opacity-40 shadow-2xs"
              title="Copy scratchpad notes to clipboard"
            >
              {copiedNotes ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-stone-500" />}
              <span>{copiedNotes ? 'Copied' : 'Copy'}</span>
            </button>

            {quickNotes && (
              <button
                onClick={handleClearNotes}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition shadow-2xs"
                title="Clear notes"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}

            <button
              onClick={() => setNotesExpanded(!notesExpanded)}
              className="rounded-lg p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              title={notesExpanded ? 'Collapse notes' : 'Expand notes'}
            >
              {notesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Quick Technical Keywords / Snippet Helper Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Quick Insert:</span>
          {[
            'Idempotency-Key: UUIDv4 + Redis TTL 24h',
            'SOQL Limit: 100 queries / 150 DML context',
            'Queue: Ingress Webhook -> SQS/Kafka -> Worker',
            'DLQ: Exponential backoff (1s, 2s, 4s, max 5)',
            'Waterfall: Clay -> Apollo -> ZoomInfo cascade',
            'Lamport Timestamp / Updated-By loop breaker'
          ].map((snippet, idx) => (
            <button
              key={idx}
              onClick={() => handleInsertNoteSnippet(snippet)}
              className="rounded-md border border-stone-200 bg-stone-50 hover:bg-indigo-50 hover:border-indigo-200 px-2 py-0.5 text-[10px] font-mono text-stone-600 hover:text-indigo-700 transition"
            >
              + {snippet.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={quickNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={notesExpanded ? 4 : 2}
            placeholder="Jot down quick technical notes, architectural equations, schema fields, webhook payloads, or whiteboard ideas here... Your notes stay saved across drills."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs font-mono text-stone-800 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition leading-relaxed shadow-inner"
          />
          <div className="flex items-center justify-between text-[10px] text-stone-400 px-1 pt-1">
            <span>
              {quickNotes.trim() ? `${quickNotes.trim().split(/\s+/).length} words • ${quickNotes.length} chars` : 'Scratchpad empty'}
            </span>
            <span>Persisted in browser storage</span>
          </div>
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

      {/* 60-Second "How to Say It" Answer Script Modal (Feature 3) */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-600 text-white font-extrabold text-sm shadow-xs">
                  🎙️
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    60-Second Master Answer Script
                  </h3>
                  <p className="text-xs text-purple-700 font-semibold">
                    STAR Framework • Concise &amp; Authoritative
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="rounded-xl border border-stone-200 p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Monologue Box */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-purple-950 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    Spoken Monologue (Ready to Read Out Loud)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(scriptFramework.full60SecondMonologue);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-purple-700 border border-purple-200 hover:bg-purple-100 transition shadow-2xs"
                  >
                    {copiedScript ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedScript ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>
                <p className="text-stone-800 text-xs leading-relaxed font-serif italic bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                  {scriptFramework.full60SecondMonologue}
                </p>
              </div>

              {/* 4-Step Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                  <span className="font-extrabold text-stone-900 text-[11px]">1. The 15s Opening Stance:</span>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{scriptFramework.openingHook15s}</p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                  <span className="font-extrabold text-stone-900 text-[11px]">2. The 30s 3-Layer Solution:</span>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{scriptFramework.technicalArchitecture30s}</p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-1">
                  <span className="font-extrabold text-emerald-900 text-[11px]">3. Your Novalyte Proof Point:</span>
                  <p className="text-emerald-950 text-[11px] leading-relaxed">{scriptFramework.founderProofPoint15s}</p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-1">
                  <span className="font-extrabold text-amber-900 text-[11px]">4. The Proactive Gotcha:</span>
                  <p className="text-amber-950 text-[11px] leading-relaxed">{scriptFramework.proactiveEdgeCaseGotcha}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-500 font-medium">
                Tip: Speak naturally with pauses between the 3 architecture layers.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAnswerText((prev) => prev ? `${prev}\n\n${scriptFramework.full60SecondMonologue}` : scriptFramework.full60SecondMonologue);
                    setShowScriptModal(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Insert into Answer Workspace</span>
                </button>
                <button
                  onClick={() => setShowScriptModal(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Company Application Dossier Modal */}
      {showCompanyDrawer && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-extrabold text-base shadow-sm">
                  🎯
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-stone-900">{selectedCompany.company}</h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                      {selectedCompany.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700 font-semibold">{selectedCompany.role} • {selectedCompany.category}</p>
                  <p className="text-[11px] text-stone-500">{selectedCompany.location} • {selectedCompany.compensation}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompanyDrawer(false)}
                className="rounded-xl border border-stone-200 p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* De-Jargonized Executive Briefing (Feature 5) */}
              {companyBriefing && (
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-950">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <span>Company De-Jargonizer: 3-Minute Executive Briefing</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-stone-900">What They Actually Do (Zero Buzzwords):</span>
                    <p className="text-stone-700 leading-relaxed bg-white/90 p-2.5 rounded-xl border border-amber-100">
                      {companyBriefing.whatTheyActuallyDo}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-rose-900 flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                      The 2 Things Their Hiring Manager is Secretly Anxious About:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {companyBriefing.theTwoHiringAnxieties.map((anxiety, idx) => (
                        <div key={idx} className="rounded-xl bg-rose-50/70 p-2.5 border border-rose-100 text-rose-950 text-[11px] leading-relaxed">
                          <span className="font-bold text-rose-800">#{idx + 1}:</span> {anxiety}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1 border-t border-amber-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950">🎙️ Your 10-Second Interview Opening Hook:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(companyBriefing.openingInterviewHook);
                          alert('Opening hook copied!');
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy Hook</span>
                      </button>
                    </div>
                    <div className="rounded-xl bg-indigo-950 text-indigo-100 p-3 italic text-[11px] leading-relaxed">
                      {companyBriefing.openingInterviewHook}
                    </div>
                  </div>
                </div>
              )}

              {/* Match Rationale */}
              <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-purple-50/50 p-4 space-y-1.5">
                <div className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Why Jamil Matches This Role</span>
                </div>
                <p className="text-indigo-900 leading-relaxed">{selectedCompany.matchRationale}</p>
              </div>

              {/* Stack and Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 space-y-2">
                  <div className="font-bold text-stone-900">Required Tech Stack & Tools</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCompany.techStack.map((tech) => (
                      <span key={tech} className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-800 border border-stone-200 shadow-2xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 space-y-2">
                  <div className="font-bold text-stone-900">Key Deliverables & Responsibilities</div>
                  <ul className="space-y-1 text-stone-600 pl-4 list-disc">
                    {selectedCompany.keyHighlights.slice(0, 3).map((highlight, idx) => (
                      <li key={idx} className="leading-normal">{highlight}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Submitted Ashby Q&As */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                  <span className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                    Submitted Application Q&As ({selectedCompany.ashbyQas?.length || 0})
                  </span>
                  <span className="text-[11px] text-stone-500">Exact answers submitted in your application</span>
                </div>

                {selectedCompany.ashbyQas && selectedCompany.ashbyQas.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCompany.ashbyQas.map((qa, idx) => (
                      <div key={idx} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                        <div className="font-bold text-stone-900 flex items-start justify-between gap-2">
                          <span>Q: {qa.question}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(qa.answer);
                              alert('Answer copied to clipboard!');
                            }}
                            className="shrink-0 p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                            title="Copy Answer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="rounded-xl bg-stone-50 p-3 border border-stone-100 text-stone-700 leading-relaxed">
                          {qa.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-center text-stone-500">
                    No custom Ashby free-response questions for this role. General ATS application profile active.
                  </div>
                )}
              </div>

              {/* Coaching Pro Tip */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-emerald-950 flex items-start gap-2.5">
                <Lightbulb className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-emerald-900">Live Round Defense Strategy:</span>{' '}
                  When answering questions for {selectedCompany.company}, tie your architecture back to your Novalyte AI experience and reinforce the exact proof points you highlighted above.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <a
                href={selectedCompany.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
              >
                <span>Open Original Job Posting</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowCompanyDrawer(false);
                    handleGenerateNewQuestion();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate Interview Question for {selectedCompany.company}</span>
                </button>
                <button
                  onClick={() => setShowCompanyDrawer(false)}
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
