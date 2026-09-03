'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Lightbulb, 
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { GUIDED_STUDIO_STEPS, GuidedStepItem } from '@/lib/guided-steps-data';
import { MiniQuiz } from '@/components/MiniQuiz';

interface StepTooltipProps {
  stepNumber: number;
  className?: string;
  badgeLabel?: string;
  onNavigateToTab?: (tab: 'simulator' | 'scenarios' | 'benchmarks' | 'trends' | 'learning-path' | 'history' | 'cheatsheet') => void;
}

export const StepTooltip: React.FC<StepTooltipProps> = ({
  stepNumber,
  className = '',
  badgeLabel,
  onNavigateToTab
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const stepData: GuidedStepItem | undefined = GUIDED_STUDIO_STEPS.find(
    (s) => s.stepNumber === stepNumber
  );

  if (!stepData) return null;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Clickable Step Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Click for Step ${stepNumber} instructions & mini quiz`}
        className="group inline-flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 text-xs font-bold shadow-xs transition-all transform hover:scale-105 active:scale-95 border border-indigo-500"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-indigo-700 text-[10px] font-black">
          {stepNumber}
        </span>
        <span className="text-[11px] tracking-tight font-bold">
          {badgeLabel || `Step ${stepNumber}`}
        </span>
        <HelpCircle className="h-3 w-3 opacity-80 group-hover:opacity-100" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div 
            className="fixed inset-0 z-40 bg-stone-900/25 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-[340px] sm:w-[460px] max-h-[85vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xl z-50 text-stone-900 space-y-4 animate-in fade-in slide-in-from-top-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-xs">
                  {stepNumber}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Step {stepNumber} of {GUIDED_STUDIO_STEPS.length} Guide
                    </span>
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.2 text-[10px] font-semibold text-stone-600">
                      {stepData.topicCategory}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 leading-snug">
                    {stepData.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* What it is for section */}
            <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <Info className="h-3.5 w-3.5 text-indigo-600" />
                <span>What is this for?</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                {stepData.whatItIsFor}
              </p>
            </div>

            {/* Real World Example */}
            <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                <span>Real-World Example</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {stepData.example}
              </p>
            </div>

            {/* Injected 3-Question MiniQuiz */}
            <MiniQuiz
              quizzes={stepData.quizzes}
              stepNumber={stepNumber}
              stepTitle={stepData.title}
              topicCategory={stepData.topicCategory}
              compact={true}
            />

            {/* Footer Navigation Action */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <span className="text-stone-500 text-[11px] font-medium">
                Flow: Click 1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5 &rarr; 6
              </span>
              {stepData.tabTarget && onNavigateToTab && (
                <button
                  onClick={() => {
                    onNavigateToTab(stepData.tabTarget!);
                    setIsOpen(false);
                  }}
                  className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Go to Tool</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
