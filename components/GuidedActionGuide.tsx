'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Lightbulb, 
  ArrowRight, 
  Award, 
  X, 
  RotateCcw,
  Compass,
  Trophy,
  Play,
  Layers,
  Activity,
  Zap,
  Check,
  Flame,
  Star,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GUIDED_STUDIO_STEPS, GuidedStepItem } from '@/lib/guided-steps-data';
import { MiniQuiz } from '@/components/MiniQuiz';
import { AppTab } from '@/components/Navbar';
import { useStorageItem } from '@/lib/useHydration';

interface GuidedActionGuideProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const STORAGE_KEY_STEP_INDEX = 'gtm_studio_guided_step_index';
const STORAGE_KEY_QUIZ_ANSWERS = 'gtm_studio_quiz_answers';
const STORAGE_KEY_COMPLETED_STEPS = 'gtm_studio_completed_steps';

export const GuidedActionGuide: React.FC<GuidedActionGuideProps> = ({
  activeTab,
  setActiveTab
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedStepIndex, setSelectedStepIndex, removeStepIndex] = useStorageItem<number>(STORAGE_KEY_STEP_INDEX, 0);
  const [savedQuizAnswers, setSavedQuizAnswers, removeQuizAnswers] = useStorageItem<Record<string, string>>(STORAGE_KEY_QUIZ_ANSWERS, {});
  const [completedSteps, setCompletedSteps, removeCompletedSteps] = useStorageItem<number[]>(STORAGE_KEY_COMPLETED_STEPS, []);

  const totalSteps = GUIDED_STUDIO_STEPS.length;
  const totalQuestions = GUIDED_STUDIO_STEPS.reduce((acc, s) => acc + s.quizzes.length, 0);

  // 2. Save step index when user changes steps
  const updateStepIndex = (newIndex: number) => {
    setSelectedStepIndex(newIndex);
  };

  // 3. Save quiz answers
  const handleSaveQuizAnswer = (questionId: string, optionId: string, _isCorrect: boolean) => {
    setSavedQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    // Check if the current step is now completed
    const currentStepObj = GUIDED_STUDIO_STEPS[selectedStepIndex];
    if (currentStepObj) {
      const allStepQs = currentStepObj.quizzes;
      const willBeAnswered = allStepQs.every((q) => q.id === questionId || !!savedQuizAnswers[q.id]);
      if (willBeAnswered && !completedSteps.includes(currentStepObj.stepNumber)) {
        setCompletedSteps((prev) => (prev.includes(currentStepObj.stepNumber) ? prev : [...prev, currentStepObj.stepNumber]));
      }
    }
  };

  const handleStepQuizCompleted = (stepNumber: number, correctCount: number, total: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps((prev) => (prev.includes(stepNumber) ? prev : [...prev, stepNumber]));
    }

    if (correctCount === total) {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
        });
      } catch (_) {}
    }
  };

  // Reset entire tutorial flow & quiz progress
  const handleResetProgress = () => {
    if (window.confirm('Reset all guided roadmap steps and mini-quiz progress?')) {
      removeStepIndex();
      removeQuizAnswers();
      removeCompletedSteps();
    }
  };

  const currentStep = GUIDED_STUDIO_STEPS[selectedStepIndex] || GUIDED_STUDIO_STEPS[0];

  // Calculate total correct answers across all questions
  let totalCorrectAnswers = 0;
  let totalAnsweredQuestions = 0;
  GUIDED_STUDIO_STEPS.forEach((s) => {
    s.quizzes.forEach((q) => {
      const chosen = savedQuizAnswers[q.id];
      if (chosen) {
        totalAnsweredQuestions++;
        const opt = q.options.find((o) => o.id === chosen);
        if (opt?.isCorrect) {
          totalCorrectAnswers++;
        }
      }
    });
  });

  // Calculate Progress Percentage (50% from steps navigation & 50% from quizzes)
  const stepsProgressWeight = (completedSteps.length / totalSteps) * 50;
  const quizProgressWeight = (totalAnsweredQuestions / totalQuestions) * 50;
  const overallProgressPercent = Math.min(100, Math.round(stepsProgressWeight + quizProgressWeight));

  const handleNextStep = () => {
    if (selectedStepIndex < totalSteps - 1) {
      const nextIndex = selectedStepIndex + 1;
      updateStepIndex(nextIndex);
      const nextStepObj = GUIDED_STUDIO_STEPS[nextIndex];
      if (nextStepObj?.tabTarget && nextStepObj.tabTarget !== activeTab) {
        setActiveTab(nextStepObj.tabTarget);
      }
    }
  };

  const handlePrevStep = () => {
    if (selectedStepIndex > 0) {
      const prevIndex = selectedStepIndex - 1;
      updateStepIndex(prevIndex);
      const prevStepObj = GUIDED_STUDIO_STEPS[prevIndex];
      if (prevStepObj?.tabTarget && prevStepObj.tabTarget !== activeTab) {
        setActiveTab(prevStepObj.tabTarget);
      }
    }
  };

  const handleJumpToStep = (index: number) => {
    updateStepIndex(index);
    const stepObj = GUIDED_STUDIO_STEPS[index];
    if (stepObj?.tabTarget) {
      setActiveTab(stepObj.tabTarget);
    }
  };

  return (
    <section aria-label="Interactive Action Guide" className="rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/90 via-white to-amber-50/60 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Banner Bar with Progress Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-sm shadow-xs shrink-0">
            1&rarr;6
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-indigo-600" />
                <span>Sequential Action Roadmap &amp; Knowledge Checks</span>
              </span>
              <span suppressHydrationWarning className="rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-0.5 border border-indigo-200">
                Resumes at Step {selectedStepIndex + 1} of {totalSteps}
              </span>
            </div>
            <p className="text-xs text-stone-600 font-medium">
              Step-by-step guidance from role calibration to live CRM triage. Follow <strong className="text-stone-800 font-bold">1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5 &rarr; 6</strong> with 3-question mini-quizzes per topic.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Progress Mastery Badge */}
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 border border-indigo-100 shadow-2xs text-xs">
            <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
            <div className="text-left">
              <div className="text-[10px] text-stone-500 font-medium leading-none">Topic Mastery</div>
              <div suppressHydrationWarning className="font-bold text-indigo-900 leading-tight">
                {completedSteps.length} / {totalSteps} Topics &bull; {totalCorrectAnswers}/{totalQuestions} Qs
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-bold shadow-2xs transition active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isExpanded ? 'Collapse Roadmap' : 'Open 1-2-3 Step Walkthrough'}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* VISUAL PROGRESS METER */}
      <div className="rounded-xl border border-indigo-100/80 bg-white/90 p-3 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Tutorial Progress Meter:</span>
            </span>
            <span suppressHydrationWarning className="rounded-full bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 text-[11px] border border-emerald-200">
              {overallProgressPercent}% Complete
            </span>
            <span suppressHydrationWarning className="text-[11px] text-stone-500 hidden md:inline">
              ({completedSteps.length} of 6 topics completed &bull; {totalAnsweredQuestions} of 18 questions answered)
            </span>
          </div>

          {overallProgressPercent === 100 ? (
            <span className="font-bold text-emerald-700 text-[11px] flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              <span>Staff GTM Certified 🏆</span>
            </span>
          ) : (
            <span className="text-[11px] text-indigo-700 font-semibold">
              Current: <strong className="font-bold">{currentStep.shortLabel}</strong>
            </span>
          )}
        </div>

        {/* Outer Bar */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-stone-100 border border-stone-200">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${Math.max(5, overallProgressPercent)}%` }}
          />
        </div>

        {/* Mini Topic Status Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 pt-1">
          {GUIDED_STUDIO_STEPS.map((s, idx) => {
            const isDone = completedSteps.includes(s.stepNumber);
            const isSelected = selectedStepIndex === idx;
            const stepAnsweredQs = s.quizzes.filter((q) => !!savedQuizAnswers[q.id]).length;

            return (
              <button
                key={s.id}
                onClick={() => {
                  handleJumpToStep(idx);
                  setIsExpanded(true);
                }}
                className={`rounded-lg p-1.5 text-left border transition flex items-center justify-between gap-1 text-[10px] ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-200'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 font-semibold hover:bg-emerald-100'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="truncate">
                  <span className="font-black mr-1">{s.stepNumber}.</span>
                  <span>{s.topicCategory.split(' ')[0]}</span>
                </div>
                <span className={`shrink-0 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold ${
                  isDone ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {isDone ? '✓' : `${stepAnsweredQs}/${s.quizzes.length}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6 Step Sequence Badges Road */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {GUIDED_STUDIO_STEPS.map((step, idx) => {
          const isCurrent = selectedStepIndex === idx;
          const isDone = completedSteps.includes(step.stepNumber);
          
          return (
            <button
              key={step.id}
              onClick={() => {
                handleJumpToStep(idx);
                setIsExpanded(true);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all border ${
                isCurrent
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-indigo-300 hover:bg-indigo-50/40'
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${
                isCurrent ? 'bg-white text-indigo-700' : isDone ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
              }`}>
                {isDone ? '✓' : step.stepNumber}
              </span>
              <span className="text-[11px] font-semibold">{step.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Expanded Interactive Step Detail & 3-Question Mini Quiz Card */}
      {isExpanded && (
        <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Step Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-sm shadow-xs">
                {currentStep.stepNumber}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Step {currentStep.stepNumber} of {totalSteps} Guide
                  </span>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700 border border-stone-200">
                    Topic: {currentStep.topicCategory}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={selectedStepIndex === 0}
                onClick={handlePrevStep}
                className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition"
              >
                &larr; Previous Step
              </button>
              <button
                disabled={selectedStepIndex === totalSteps - 1}
                onClick={handleNextStep}
                className="rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 text-xs font-bold shadow-2xs disabled:opacity-40 transition flex items-center gap-1"
              >
                <span>Next Step</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 2-Column Content: What is this for & Real-World Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: What is this for? */}
            <div className="rounded-xl bg-stone-50 p-4 border border-stone-200/90 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <Info className="h-4 w-4 text-indigo-600" />
                <span>What is this for?</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                {currentStep.whatItIsFor}
              </p>
            </div>

            {/* Column 2: Real-World Example */}
            <div className="rounded-xl bg-amber-50/70 p-4 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <span>Real-World Scenario Example</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {currentStep.example}
              </p>
            </div>
          </div>

          {/* Dedicated 3-Question MiniQuiz Module */}
          <MiniQuiz
            quizzes={currentStep.quizzes}
            stepNumber={currentStep.stepNumber}
            stepTitle={currentStep.title}
            topicCategory={currentStep.topicCategory}
            savedAnswers={savedQuizAnswers}
            onSaveAnswer={handleSaveQuizAnswer}
            onQuizCompleted={handleStepQuizCompleted}
            compact={false}
          />

          {/* Quick CTA to perform action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-stone-500 font-medium">
                Ready to execute this step in the live simulator?
              </span>
              <button
                onClick={handleResetProgress}
                className="text-stone-400 hover:text-stone-700 text-[11px] underline"
              >
                Reset Progress
              </button>
            </div>

            {currentStep.tabTarget && (
              <button
                onClick={() => {
                  setActiveTab(currentStep.tabTarget!);
                  setIsExpanded(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 font-bold shadow-2xs transition"
              >
                <span>Take Me to Step {currentStep.stepNumber} UI</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
