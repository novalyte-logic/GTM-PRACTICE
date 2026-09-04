'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { Navbar, AppTab } from '@/components/Navbar';
import { InterviewSimulator } from '@/components/InterviewSimulator';
import { ScenarioLab } from '@/components/ScenarioLab';
import { DailyWorkSimulation } from '@/components/DailyWorkSimulation';
import { GTMEcosystemMap } from '@/components/GTMEcosystemMap';
import { BenchmarkRadar } from '@/components/BenchmarkRadar';
import { PerformanceTrends } from '@/components/PerformanceTrends';
import { AdaptiveLearningPath } from '@/components/AdaptiveLearningPath';
import { SessionHistoryView, SAMPLE_COMPARISON_SESSIONS } from '@/components/SessionHistoryView';
import { GTMCheatSheet } from '@/components/GTMCheatSheet';
import { InterviewReflectionModal } from '@/components/InterviewReflectionModal';
import { GuidedActionGuide } from '@/components/GuidedActionGuide';
import { PanicButton } from '@/components/PanicButton';
import { DeepWorkAudio } from '@/components/DeepWorkAudio';
import { JargonBuster } from '@/components/JargonBuster';
import { BigFiveArchitectures } from '@/components/BigFiveArchitectures';
import { TopicFocusStudio } from '@/components/TopicFocusStudio';
import { Flashcard } from '@/components/Flashcard';
import { MockInterviewSession, CandidateAnswerRecord, SessionReport } from '@/lib/types';
import { loadSavedSessions, saveSession } from '@/lib/storage';
import { useStorageItem } from '@/lib/useHydration';
import { Maximize2, Minimize2, Flame, Sparkles, X, Target, Clock, Check, RotateCcw, Play, AlertCircle, Plus } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('simulator');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useStorageItem<boolean>('gtm_dark_mode_enabled', false);
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [savedSessions, setSavedSessions] = useStorageItem<MockInterviewSession[]>(
    'gtm_interview_studio_sessions_v1',
    SAMPLE_COMPARISON_SESSIONS
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark', 'bg-stone-950');
        document.body.classList.remove('bg-[#fafaf9]');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark', 'bg-stone-950');
        document.body.classList.add('bg-[#fafaf9]');
      }
    }
  }, [darkMode]);
  
  const [activeSession, setActiveSession] = useState<MockInterviewSession>(() => ({
    id: 'session-default-live',
    title: 'GTM Systems Engineer Practice Session',
    date: '2026-09-03T00:00:00.000Z',
    track: 'system-architecture',
    difficulty: 'Senior GTM Engineer',
    roleProfile: 'GTM Systems Engineer',
    companyArchetype: 'Series-B High-Growth PLG SaaS',
    durationSeconds: 0,
    answers: [],
    averageScore: 0,
  }));
  
  // Elapsed session timer tracking duration in seconds
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);

  // Target Countdown Timer State (e.g. 30 or 60 minutes) for the interview simulator
  const [countdownTargetMinutes, setCountdownTargetMinutes] = useStorageItem<number>(
    'gtm_simulator_countdown_target_min',
    30
  );
  const [countdownRemainingSeconds, setCountdownRemainingSeconds] = useState<number>(() => countdownTargetMinutes * 60);
  const [isCountdownRunning, setIsCountdownRunning] = useState<boolean>(true);
  const hasTriggeredLowTimeAlertRef = React.useRef<boolean>(false);

  // Sync remaining seconds when target is adjusted
  const handleSetCountdownTarget = (minutes: number) => {
    setCountdownTargetMinutes(minutes);
    setCountdownRemainingSeconds(minutes * 60);
    hasTriggeredLowTimeAlertRef.current = false;
  };

  const handleToggleCountdown = () => {
    setIsCountdownRunning((prev) => !prev);
  };

  const handleResetCountdown = () => {
    setCountdownRemainingSeconds(countdownTargetMinutes * 60);
    hasTriggeredLowTimeAlertRef.current = false;
  };

  const handleAddCountdownBuffer = (minutes: number) => {
    setCountdownRemainingSeconds((prev) => prev + minutes * 60);
  };

  // Countdown timer interval with gentle chime when crossing <= 300s (5 minutes)
  useEffect(() => {
    let interval: any = null;
    if (isCountdownRunning) {
      interval = setInterval(() => {
        setCountdownRemainingSeconds((prev) => {
          if (prev <= 1) {
            return 0;
          }
          // Gentle visual & audio alert trigger when 5 minutes (300s) remain
          if ((prev === 301 || (prev <= 300 && prev > 295)) && !hasTriggeredLowTimeAlertRef.current) {
            hasTriggeredLowTimeAlertRef.current = true;
            if (audioEnabled && typeof window !== 'undefined' && 'AudioContext' in window) {
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(554.37, ctx.currentTime + 0.2); // C#5
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
              } catch (e) {
                console.error(e);
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCountdownRunning, audioEnabled]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [activeReport, setActiveReport] = useState<SessionReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  
  // Safely extract URL query param on client without hydration mismatch
  const targetCompanyId = useSyncExternalStore(
    () => () => {},
    () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('company') || params.get('companyId') || undefined;
      }
      return undefined;
    },
    () => undefined
  );

  // Safely extract URL query param for topic deep-linking (?topic=xxx)
  const targetTopicId = useSyncExternalStore(
    () => () => {},
    () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('topic') || params.get('topicId') || undefined;
      }
      return undefined;
    },
    () => undefined
  );

  const [prevTargetTopic, setPrevTargetTopic] = useState<string | undefined>(undefined);
  if (targetTopicId && targetTopicId !== prevTargetTopic) {
    setPrevTargetTopic(targetTopicId);
    setActiveTab('topic-focus');
  }

  // Identify last session with existing answers for 'Resume Last Session' feature
  const resumableSession = useMemo(() => {
    if (activeSession.answers.length === 0) {
      return savedSessions.find((s) => s.answers && s.answers.length > 0) || null;
    }
    return savedSessions.find((s) => s.answers && s.answers.length > 0 && s.id !== activeSession.id) || null;
  }, [savedSessions, activeSession]);

  const handleResumeSession = (sessionToResume: MockInterviewSession) => {
    setActiveSession(sessionToResume);
    setSessionElapsedSeconds(sessionToResume.durationSeconds || 0);
    setActiveTab('simulator');
  };

  // Global Keyboard shortcuts for Focus Mode (Alt+F to toggle, Escape to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setFocusMode((prev) => !prev);
      } else if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode]);

  const handleRefreshSessions = () => {
    const loaded = loadSavedSessions();
    setSavedSessions(loaded);
  };

  const handleSaveAnswer = (record: CandidateAnswerRecord) => {
    setActiveSession((prev) => {
      const existingAnswers = [...prev.answers];
      const existingIndex = existingAnswers.findIndex((a) => a.questionId === record.questionId);
      if (existingIndex >= 0) {
        existingAnswers[existingIndex] = record;
      } else {
        existingAnswers.push(record);
      }

      const totalScore = existingAnswers.reduce((acc, cur) => acc + (cur.evaluation?.overallScore || 0), 0);
      const avgScore = existingAnswers.length > 0 ? Math.round(totalScore / existingAnswers.length) : 0;

      const updatedSession: MockInterviewSession = {
        ...prev,
        durationSeconds: sessionElapsedSeconds,
        answers: existingAnswers,
        averageScore: avgScore,
      };

      // Persist to storage
      saveSession(updatedSession);
      handleRefreshSessions();
      return updatedSession;
    });
  };

  const handleGenerateReport = async (targetSession?: MockInterviewSession) => {
    const sessionToReport = targetSession || activeSession;
    if (!sessionToReport.answers || sessionToReport.answers.length === 0) {
      alert('Please answer at least one question in the Practice Simulator before generating a debrief report.');
      return;
    }

    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionToReport,
          answers: sessionToReport.answers,
        }),
      });

      const report: SessionReport = await res.json();
      setActiveReport(report);

      const updatedSession: MockInterviewSession = {
        ...sessionToReport,
        report,
      };
      saveSession(updatedSession);
      handleRefreshSessions();
      setActiveTab('history');
    } catch (e) {
      console.error('Failed to generate session report', e);
      alert('An error occurred while generating your report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleNewSession = () => {
    if (activeSession.answers.length > 0 && !confirm('Start a fresh interview session? Your current session is already saved.')) {
      return;
    }
    const newSession: MockInterviewSession = {
      id: `session-${Date.now()}`,
      title: `Practice Session #${savedSessions.length + 1}`,
      date: new Date().toISOString(),
      track: 'system-architecture',
      difficulty: 'Senior GTM Engineer',
      roleProfile: 'GTM Systems Engineer',
      companyArchetype: 'Series-B High-Growth PLG SaaS',
      durationSeconds: 0,
      answers: [],
      averageScore: 0,
    };
    setActiveSession(newSession);
    setSessionElapsedSeconds(0);
    setActiveReport(null);
    setActiveTab('simulator');
  };

  return (
    <div className={`min-h-screen bg-[#fafaf9] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900 ${darkMode ? 'dark' : ''}`}>
      <div>
        {/* Regular Navbar or Focus Mode Minimal Header */}
        {!focusMode ? (
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
            totalAnswered={activeSession.answers.length}
            averageScore={activeSession.averageScore}
            onNewSession={handleNewSession}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            activeSessionTitle={activeSession.title}
            isSaved={true}
            sessionElapsedSeconds={sessionElapsedSeconds}
            onResumeLastSession={resumableSession ? () => handleResumeSession(resumableSession) : undefined}
            hasResumableSession={!!resumableSession && activeSession.id !== resumableSession.id}
            countdownTargetMinutes={countdownTargetMinutes}
            countdownRemainingSeconds={countdownRemainingSeconds}
            isCountdownRunning={isCountdownRunning}
            onSetCountdownTarget={handleSetCountdownTarget}
            onToggleCountdown={handleToggleCountdown}
            onResetCountdown={handleResetCountdown}
            onAddCountdownBuffer={handleAddCountdownBuffer}
            isDarkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
        ) : (
          /* Focus Mode Top Minimal Status Bar */
          <div className="sticky top-0 z-50 border-b border-stone-300 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-4 py-2.5 shadow-xs transition-all">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  Focus Mode Active
                </span>
                <span className="text-stone-300">•</span>
                <span 
                  className="text-xs font-bold text-stone-700 dark:text-stone-300 truncate max-w-[140px] sm:max-w-[240px]"
                  title={activeSession.title}
                >
                  {activeSession.title}
                </span>
                {/* Saved Indicator */}
                <span 
                  id="focus-saved-indicator"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs"
                  title="Session synced to local storage"
                >
                  <Check className="h-2.5 w-2.5 text-emerald-600 stroke-[2.5]" />
                  <span>Saved</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Countdown Target Timer Pill in Focus Mode with gentle alert */}
                <div 
                  className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold transition shadow-2xs cursor-pointer ${
                    countdownRemainingSeconds <= 300 && isCountdownRunning
                      ? 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-300/80 animate-pulse'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200'
                  }`}
                  onClick={handleToggleCountdown}
                  title={`${isCountdownRunning ? 'Click to Pause' : 'Click to Start'} (${countdownTargetMinutes}m target)`}
                >
                  <Clock className={`h-3 w-3 ${countdownRemainingSeconds <= 300 ? 'text-amber-600' : 'text-indigo-600'}`} />
                  <span className="font-mono tabular-nums">
                    {formatElapsed(countdownRemainingSeconds)}
                  </span>
                  {countdownRemainingSeconds <= 300 && isCountdownRunning && (
                    <span className="rounded bg-amber-200 px-1 py-0.2 text-[9px] font-extrabold text-amber-900 uppercase">
                      Wrap-Up
                    </span>
                  )}
                </div>

                {/* Elapsed Session Timer in Focus Mode */}
                <div 
                  id="focus-session-timer"
                  className="hidden sm:flex items-center gap-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2.5 py-1 text-xs text-stone-700 dark:text-stone-300 shadow-2xs" 
                  title="Active session elapsed interview pace (Minutes : Seconds)"
                >
                  <span className="text-[10px] text-stone-400">Elapsed:</span>
                  <span suppressHydrationWarning className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
                    {formatElapsed(sessionElapsedSeconds)}
                  </span>
                </div>

                {/* Deep Work Audio Web Audio Synthesizer */}
                <DeepWorkAudio />

                {/* Panic Button in Focus Mode */}
                <PanicButton currentTrack={activeSession.track} />

                {/* Exit Focus Mode Button */}
                <button
                  onClick={() => setFocusMode(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 transition cursor-pointer"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Exit Focus Mode</span>
                  <kbd className="rounded bg-white dark:bg-stone-750 text-[10px] px-1 text-stone-500 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-mono">
                    Esc
                  </kbd>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-6 ${focusMode ? 'py-4 sm:py-4' : ''}`}>
          {/* Interactive Step-by-Step 1->2->3 Walkthrough Guide (Hidden in Focus Mode) */}
          {!focusMode && (
            <GuidedActionGuide
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-4">
              {/* Resume Last Session Banner on Landing View */}
              {resumableSession && activeSession.id !== resumableSession.id && (
                <div 
                  id="resume-last-session-banner"
                  className="rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/80 via-white to-stone-50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                          Resume In-Progress Session
                        </span>
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 border border-indigo-200">
                          {resumableSession.answers.length} {resumableSession.answers.length === 1 ? 'Answer' : 'Answers'} Saved
                        </span>
                        {resumableSession.averageScore > 0 && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                            Avg Score: {resumableSession.averageScore}%
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 mt-0.5">
                        {resumableSession.title}
                      </h3>
                      <p suppressHydrationWarning className="text-[11px] text-stone-500">
                        Last active {new Date(resumableSession.date).toLocaleDateString()} • Track: {resumableSession.track} • {resumableSession.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id="resume-last-session-btn"
                      onClick={() => handleResumeSession(resumableSession)}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 hover:shadow-md transition cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Resume Last Session</span>
                    </button>
                  </div>
                </div>
              )}

              <InterviewSimulator
                key={activeSession.id}
                onSaveAnswer={handleSaveAnswer}
                onGenerateReport={() => handleGenerateReport()}
                completedAnswers={activeSession.answers}
                audioEnabled={audioEnabled}
                onOpenReflection={() => setShowReflectionModal(true)}
                initialCompanyId={targetCompanyId}
              />
            </div>
          )}

          {activeTab === 'topic-focus' && (
            <TopicFocusStudio
              initialTopicId={targetTopicId}
              onNavigateToSimulator={() => setActiveTab('simulator')}
            />
          )}

          {activeTab === 'flashcards' && <Flashcard />}

          {activeTab === 'jargon-buster' && <JargonBuster />}

          {activeTab === 'big-five' && <BigFiveArchitectures />}

          {activeTab === 'scenarios' && <ScenarioLab />}

          {activeTab === 'daily-sim' && <DailyWorkSimulation />}

          {activeTab === 'ecosystem' && <GTMEcosystemMap />}

          {activeTab === 'benchmarks' && (
            <BenchmarkRadar completedAnswers={activeSession.answers} />
          )}

          {activeTab === 'trends' && (
            <PerformanceTrends
              sessions={savedSessions}
              completedAnswers={activeSession.answers}
              onNavigateToSimulator={() => setActiveTab('simulator')}
              onNavigateToHistory={() => setActiveTab('history')}
              onNavigateToScenarios={() => setActiveTab('scenarios')}
            />
          )}

          {activeTab === 'learning-path' && (
            <AdaptiveLearningPath
              completedAnswers={activeSession.answers}
              savedSessions={savedSessions}
              onStartCustomDrill={(track, difficulty) => {
                setActiveSession((prev) => ({
                  ...prev,
                  track,
                  difficulty,
                }));
                setActiveTab('simulator');
              }}
              onNavigateToCheatsheet={() => setActiveTab('cheatsheet')}
            />
          )}

          {activeTab === 'history' && (
            <SessionHistoryView
              sessions={savedSessions}
              onRefreshSessions={handleRefreshSessions}
              onSelectSessionForReport={(sess) => {
                if (sess.report) {
                  setActiveReport(sess.report);
                } else {
                  handleGenerateReport(sess);
                }
              }}
              activeReport={activeReport}
              onCloseReport={() => setActiveReport(null)}
            />
          )}

          {activeTab === 'cheatsheet' && <GTMCheatSheet />}
        </main>
      </div>

      {/* Post-Session Interview Reflection Modal */}
      <InterviewReflectionModal
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        session={activeSession}
        onSaveAndGenerateReport={(reflectionData) => {
          const updatedSession: MockInterviewSession = {
            ...activeSession,
            ...reflectionData,
          };
          setActiveSession(updatedSession);
          saveSession(updatedSession);
          handleRefreshSessions();
          setShowReflectionModal(false);
          handleGenerateReport(updatedSession);
        }}
      />

      {/* Clean Off-White Footer (Hidden in Focus Mode for Maximum Concentration) */}
      {!focusMode && (
        <footer className="border-t border-stone-200 bg-white py-6 text-xs text-stone-500 mt-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">GTM-Pulse Studio</span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600">Applied AI, CRM &amp; Waterfall Systems Interview Intelligence</span>
            </div>
            <div className="text-stone-500">
              Calibrated for Jamil Yakasai • Senior &amp; Staff GTM Engineer Readiness
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
