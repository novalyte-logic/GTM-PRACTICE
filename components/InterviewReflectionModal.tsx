'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Award, 
  TrendingUp, 
  HeartHandshake, 
  Smile, 
  Zap, 
  Clock, 
  AlertCircle, 
  BatteryWarning, 
  Compass, 
  CheckCircle2, 
  Plus, 
  X,
  FileText,
  Sliders,
  Flame,
  Star
} from 'lucide-react';
import { 
  MockInterviewSession, 
  EmotionalStateType, 
  PerceivedConfidenceAssessment 
} from '@/lib/types';

interface InterviewReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: MockInterviewSession;
  onSaveAndGenerateReport: (reflectionData: {
    emotionalState: EmotionalStateType;
    confidenceAssessment: PerceivedConfidenceAssessment;
    reflections: string;
    keyTakeaways: string[];
  }) => void;
}

const EMOTIONAL_STATES: {
  id: EmotionalStateType;
  label: string;
  emoji: string;
  description: string;
  accentColor: string;
}[] = [
  {
    id: 'calm-composed',
    label: 'Calm & Composed',
    emoji: '🧘',
    description: 'Methodical pacing, steady tone, confident in architectural structure.',
    accentColor: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  },
  {
    id: 'in-flow',
    label: 'In The Zone / Flow',
    emoji: '⚡',
    description: 'High momentum, fast technical recall, instinctive edge-case mitigation.',
    accentColor: 'border-indigo-300 bg-indigo-50 text-indigo-900',
  },
  {
    id: 'decisive-commanding',
    label: 'Decisive & Structured',
    emoji: '🎯',
    description: 'Strong STAR framework, grounded in real revenue metrics and trade-offs.',
    accentColor: 'border-purple-300 bg-purple-50 text-purple-900',
  },
  {
    id: 'rushed-pressured',
    label: 'Rushed / Under Time Pressure',
    emoji: '⏱️',
    description: 'Felt short on time, hurried through gotchas, missed deeper explanations.',
    accentColor: 'border-amber-300 bg-amber-50 text-amber-900',
  },
  {
    id: 'anxious-hesitant',
    label: 'Anxious / Second-Guessing',
    emoji: '😰',
    description: 'Doubted specific API endpoints or syntax, overthought initial steps.',
    accentColor: 'border-rose-300 bg-rose-50 text-rose-900',
  },
  {
    id: 'fatigued',
    label: 'Mentally Fatigued',
    emoji: '🧠',
    description: 'Brain fog on complex state loops, energy or focus dipped mid-session.',
    accentColor: 'border-stone-300 bg-stone-100 text-stone-900',
  },
];

export const InterviewReflectionModal: React.FC<InterviewReflectionModalProps> = ({
  isOpen,
  onClose,
  session,
  onSaveAndGenerateReport,
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionalStateType>(
    session.emotionalState || 'in-flow'
  );
  
  const [overallScore10, setOverallScore10] = useState<number>(
    session.confidenceAssessment?.overallScore10 || 7
  );
  const [technicalDepth5, setTechnicalDepth5] = useState<number>(
    session.confidenceAssessment?.technicalDepth5 || 4
  );
  const [executivePresence5, setExecutivePresence5] = useState<number>(
    session.confidenceAssessment?.executivePresence5 || 4
  );
  const [edgeCaseDefense5, setEdgeCaseDefense5] = useState<number>(
    session.confidenceAssessment?.edgeCaseDefense5 || 3
  );

  const [reflectionText, setReflectionText] = useState<string>(
    session.reflections || ''
  );
  const [takeaways, setTakeaways] = useState<string[]>(
    session.keyTakeaways || [
      'Need to explicitly state token bucket rate limiting on webhook ingestion',
      'Frame my Novalyte AI experience around speed-to-lead SLAs'
    ]
  );
  const [newTakeawayInput, setNewTakeawayInput] = useState<string>('');

  if (!isOpen) return null;

  const actualAvgScore = session.averageScore || 0;
  const perceivedScorePercent = overallScore10 * 10;
  const calibrationDelta = actualAvgScore - perceivedScorePercent;

  const handleAddTakeaway = () => {
    if (!newTakeawayInput.trim()) return;
    setTakeaways([...takeaways, newTakeawayInput.trim()]);
    setNewTakeawayInput('');
  };

  const handleRemoveTakeaway = (index: number) => {
    setTakeaways(takeaways.filter((_, i) => i !== index));
  };

  const handleQuickAddSuggested = (text: string) => {
    if (!takeaways.includes(text)) {
      setTakeaways([...takeaways, text]);
    }
  };

  const handleSubmit = () => {
    onSaveAndGenerateReport({
      emotionalState: selectedEmotion,
      confidenceAssessment: {
        overallScore10,
        technicalDepth5,
        executivePresence5,
        edgeCaseDefense5,
      },
      reflections: reflectionText,
      keyTakeaways: takeaways,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Session Debrief & Candidate Reflection
              </h3>
              <p className="text-xs text-stone-500">
                Calibrate your internal mindset, emotional state, and perceived confidence against AI evaluation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* 1. Emotional State Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
              <span>1. How did you feel during this technical drill?</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {EMOTIONAL_STATES.map((state) => {
                const isSelected = selectedEmotion === state.id;
                return (
                  <button
                    key={state.id}
                    type="button"
                    onClick={() => setSelectedEmotion(state.id)}
                    className={`rounded-xl p-3 text-left border transition-all ${
                      isSelected
                        ? `${state.accentColor} ring-2 ring-indigo-500 shadow-xs`
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100/80 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{state.emoji}</span>
                      <span className="font-bold text-xs">{state.label}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 line-clamp-2">
                      {state.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Perceived Confidence Level */}
          <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                <span>2. Perceived Confidence Self-Assessment</span>
              </label>

              <span className="text-xs font-bold text-indigo-700 font-mono">
                Overall: {overallScore10}/10 ({overallScore10 * 10}%)
              </span>
            </div>

            {/* Overall Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-stone-600 font-medium">
                <span>Overall Performance Feeling:</span>
                <span className="text-stone-900 font-semibold">
                  {overallScore10 >= 8 ? 'Senior / Staff Caliber' : overallScore10 >= 6 ? 'Solid Competent' : 'Shaky / Needs Review'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={overallScore10}
                onChange={(e) => setOverallScore10(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>1 (Struggled)</span>
                <span>5 (Average)</span>
                <span>10 (Flawless Staff)</span>
              </div>
            </div>

            {/* Sub-Pillars (1 to 5) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="rounded-lg bg-white p-2.5 border border-stone-200 space-y-1">
                <div className="flex justify-between text-[11px] text-stone-700">
                  <span>Architecture Depth:</span>
                  <span className="font-bold text-indigo-600">{technicalDepth5}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={technicalDepth5}
                  onChange={(e) => setTechnicalDepth5(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-stone-200 space-y-1">
                <div className="flex justify-between text-[11px] text-stone-700">
                  <span>Executive Delivery:</span>
                  <span className="font-bold text-indigo-600">{executivePresence5}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={executivePresence5}
                  onChange={(e) => setExecutivePresence5(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-stone-200 space-y-1">
                <div className="flex justify-between text-[11px] text-stone-700">
                  <span>Edge-Case Defense:</span>
                  <span className="font-bold text-indigo-600">{edgeCaseDefense5}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={edgeCaseDefense5}
                  onChange={(e) => setEdgeCaseDefense5(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* Confidence vs AI Score Calibration Feedback */}
            {actualAvgScore > 0 && (
              <div className={`rounded-xl p-3 text-xs border ${
                Math.abs(calibrationDelta) <= 10 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : calibrationDelta > 10
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}>
                <div className="font-bold flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Calibration Alignment Insight</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {Math.abs(calibrationDelta) <= 10
                    ? `🎯 Highly Calibrated: Your self-assessment (${perceivedScorePercent}%) closely matches the evaluator score (${actualAvgScore}%).`
                    : calibrationDelta > 10
                    ? `🌟 Imposter Syndrome Alert: You evaluated yourself at ${perceivedScorePercent}%, but your AI evaluation scored ${actualAvgScore}%. Your technical answers were stronger than you realized!`
                    : `⚠️ Blind Spot Calibration: You felt ${perceivedScorePercent}% confident, but the evaluator scored ${actualAvgScore}%. Review the missed edge cases to sharpen your defense.`}
                </p>
              </div>
            )}
          </div>

          {/* 3. Qualitative Reflection Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              3. Qualitative Self-Notes & What Clicked
            </label>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              rows={3}
              placeholder="e.g. My explanation of the Clay waterfall cascade felt crisp, but I hesitated on the Salesforce governor limit details..."
              className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none shadow-xs"
            />
          </div>

          {/* 4. Key Takeaways & Action Items */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              4. Key Study Takeaways Before Next Interview
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTakeawayInput}
                onChange={(e) => setNewTakeawayInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTakeaway())}
                placeholder="Add a specific concept to study tonight..."
                className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none shadow-xs"
              />
              <button
                type="button"
                onClick={handleAddTakeaway}
                className="rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition"
              >
                Add
              </button>
            </div>

            {/* Takeaways Tag List */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {takeaways.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1 text-xs text-stone-800 border border-stone-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTakeaway(idx)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick-add suggestions */}
            <div className="pt-1">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Quick-Add Common GTM Gotchas:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Redis token-bucket rate limiting',
                  'Salesforce Bulk API v2 batching',
                  'Idempotency keys on webhooks',
                  'Anti-recursion sync flags'
                ].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickAddSuggested(sug)}
                    className="rounded-md bg-stone-50 px-2 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between border-t border-stone-100 pt-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
          >
            <Award className="h-3.5 w-3.5 text-amber-300" />
            <span>Save Reflection & View Full Debrief</span>
          </button>
        </div>
      </div>
    </div>
  );
};
