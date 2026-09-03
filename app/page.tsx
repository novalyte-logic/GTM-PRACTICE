'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from '@/components/Navbar';
import { InterviewSimulator } from '@/components/InterviewSimulator';
import { ScenarioLab } from '@/components/ScenarioLab';
import { DailyWorkSimulation } from '@/components/DailyWorkSimulation';
import { GTMEcosystemMap } from '@/components/GTMEcosystemMap';
import { BenchmarkRadar } from '@/components/BenchmarkRadar';
import { PerformanceTrends } from '@/components/PerformanceTrends';
import { AdaptiveLearningPath } from '@/components/AdaptiveLearningPath';
import { SessionHistoryView } from '@/components/SessionHistoryView';
import { GTMCheatSheet } from '@/components/GTMCheatSheet';
import { InterviewReflectionModal } from '@/components/InterviewReflectionModal';
import { GuidedActionGuide } from '@/components/GuidedActionGuide';
import { PanicButton } from '@/components/PanicButton';
import { DeepWorkAudio } from '@/components/DeepWorkAudio';
import { JargonBuster } from '@/components/JargonBuster';
import { BigFiveArchitectures } from '@/components/BigFiveArchitectures';
import { MockInterviewSession, CandidateAnswerRecord, SessionReport } from '@/lib/types';
import { loadSavedSessions, saveSession } from '@/lib/storage';
import { Maximize2, Minimize2, Flame, Sparkles, X, Target } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('simulator');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [savedSessions, setSavedSessions] = useState<MockInterviewSession[]>(() => {
    return loadSavedSessions();
  });
  
  const [activeSession, setActiveSession] = useState<MockInterviewSession>(() => ({
    id: `session-${Date.now()}`,
    title: 'GTM Systems Engineer Practice Session',
    date: new Date().toISOString(),
    track: 'system-architecture',
    difficulty: 'Senior GTM Engineer',
    roleProfile: 'GTM Systems Engineer',
    companyArchetype: 'Series-B High-Growth PLG SaaS',
    durationSeconds: 0,
    answers: [],
    averageScore: 0,
  }));
  
  const [activeReport, setActiveReport] = useState<SessionReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [targetCompanyId, setTargetCompanyId] = useState<string | undefined>(undefined);

  // Read URL params (e.g. ?company=valency) on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const companyParam = params.get('company') || params.get('companyId');
      if (companyParam) {
        setTargetCompanyId(companyParam);
        setActiveTab('simulator');
      }
    }
  }, []);

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
    if (activeSession.answers.length > 0 && confirm('Start a fresh interview session? Your current session is already saved.')) {
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
      setActiveReport(null);
      setActiveTab('simulator');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
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
          />
        ) : (
          /* Focus Mode Top Minimal Status Bar */
          <div className="sticky top-0 z-50 border-b border-stone-300 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-xs transition-all">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-stone-900">
                  Focus Mode Active
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs text-stone-500 font-medium">
                  {activeTab === 'simulator' ? 'Practice Simulator' : activeTab === 'scenarios' ? 'Scenario Lab' : activeTab}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Deep Work Audio Web Audio Synthesizer */}
                <DeepWorkAudio />

                {/* Panic Button in Focus Mode */}
                <PanicButton currentTrack={activeSession.track} />

                {/* Exit Focus Mode Button */}
                <button
                  onClick={() => setFocusMode(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 text-xs font-bold text-stone-800 transition"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Exit Focus Mode</span>
                  <kbd className="rounded bg-white text-[10px] px-1 text-stone-500 border border-stone-200">
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
            <InterviewSimulator
              onSaveAnswer={handleSaveAnswer}
              onGenerateReport={() => handleGenerateReport()}
              completedAnswers={activeSession.answers}
              audioEnabled={audioEnabled}
              onOpenReflection={() => setShowReflectionModal(true)}
              initialCompanyId={targetCompanyId}
            />
          )}

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
