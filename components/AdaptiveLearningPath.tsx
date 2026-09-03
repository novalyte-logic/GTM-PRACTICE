'use client';

import React from 'react';
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Cpu, 
  Database, 
  Brain, 
  Compass,
  Play,
  Flame,
  Clock
} from 'lucide-react';
import { CandidateAnswerRecord, MockInterviewSession, InterviewTrack, DifficultyLevel } from '@/lib/types';
import { GTM_FLASHCARDS } from '@/lib/flashcard-data';

interface AdaptiveLearningPathProps {
  completedAnswers: CandidateAnswerRecord[];
  savedSessions: MockInterviewSession[];
  onStartCustomDrill: (track: InterviewTrack, difficulty: DifficultyLevel) => void;
  onOpenFlashcardConcept?: (conceptId: string) => void;
  onNavigateToCheatsheet?: () => void;
}

export const AdaptiveLearningPath: React.FC<AdaptiveLearningPathProps> = ({
  completedAnswers,
  savedSessions,
  onStartCustomDrill,
  onOpenFlashcardConcept,
  onNavigateToCheatsheet,
}) => {
  // Aggregate all answers across active session + saved sessions
  const allAnswers: CandidateAnswerRecord[] = [
    ...completedAnswers,
    ...savedSessions.flatMap((s) => s.answers || []),
  ];

  const totalAnswered = allAnswers.length;

  // Calculate scores per pillar
  const pillarTotals = {
    technicalArchitecture: { total: 0, count: 0, name: 'System Architecture & Webhooks', track: 'system-architecture' as InterviewTrack },
    crmAndDataHygiene: { total: 0, count: 0, name: 'CRM Architecture & Sync Hygiene', track: 'crm-data-hygiene' as InterviewTrack },
    modernStackTooling: { total: 0, count: 0, name: 'Enrichment & Modern GTM Stack (Clay/Apollo)', track: 'waterfall-enrichment' as InterviewTrack },
    gtmBusinessContext: { total: 0, count: 0, name: 'Applied AI & Revenue Workflows', track: 'ai-gtm-workflows' as InterviewTrack },
    communicationAndClarity: { total: 0, count: 0, name: 'Executive Delivery & Revenue Telemetry', track: 'pipeline-telemetry' as InterviewTrack },
  };

  allAnswers.forEach((a) => {
    if (a.evaluation?.pillarScores) {
      pillarTotals.technicalArchitecture.total += a.evaluation.pillarScores.technicalArchitecture || 0;
      pillarTotals.technicalArchitecture.count += 1;

      pillarTotals.crmAndDataHygiene.total += a.evaluation.pillarScores.crmAndDataHygiene || 0;
      pillarTotals.crmAndDataHygiene.count += 1;

      pillarTotals.modernStackTooling.total += a.evaluation.pillarScores.modernStackTooling || 0;
      pillarTotals.modernStackTooling.count += 1;

      pillarTotals.gtmBusinessContext.total += a.evaluation.pillarScores.gtmBusinessContext || 0;
      pillarTotals.gtmBusinessContext.count += 1;

      pillarTotals.communicationAndClarity.total += a.evaluation.pillarScores.communicationAndClarity || 0;
      pillarTotals.communicationAndClarity.count += 1;
    }
  });

  const pillarScores = Object.entries(pillarTotals).map(([key, data]) => {
    const avg = data.count > 0 ? Math.round(data.total / data.count) : 0;
    return {
      key,
      name: data.name,
      track: data.track,
      avg,
      count: data.count,
    };
  });

  // Sort pillars to find weakest and strongest
  const sortedPillars = [...pillarScores].sort((a, b) => a.avg - b.avg);
  const weakestPillar = sortedPillars[0];
  const strongestPillar = sortedPillars[sortedPillars.length - 1];

  // Collect top blind spots from recent evaluations
  const blindSpots: string[] = Array.from(
    new Set(
      allAnswers
        .flatMap((a) => a.evaluation?.blindSpotsAndMissedEdgeCases || [])
        .filter(Boolean)
    )
  ).slice(0, 4);

  // Recommend relevant flashcards based on weakest pillar
  const getRecommendedFlashcards = () => {
    if (!weakestPillar || weakestPillar.count === 0) {
      return GTM_FLASHCARDS.slice(0, 3);
    }
    if (weakestPillar.key === 'crmAndDataHygiene') {
      return GTM_FLASHCARDS.filter((f) => f.category === 'CRM & Sync Hygiene').slice(0, 3);
    }
    if (weakestPillar.key === 'modernStackTooling') {
      return GTM_FLASHCARDS.filter((f) => f.category === 'Waterfall Enrichment').slice(0, 3);
    }
    if (weakestPillar.key === 'gtmBusinessContext') {
      return GTM_FLASHCARDS.filter((f) => f.category === 'AI-Native GTM & Orchestration').slice(0, 3);
    }
    return GTM_FLASHCARDS.filter((f) => f.category === 'System Architecture & Queues').slice(0, 3);
  };

  const recommendedCards = getRecommendedFlashcards();

  const recommendedDifficulty: DifficultyLevel = 
    weakestPillar && weakestPillar.avg < 70 ? 'Mid-Level GTM Engineer' : 'Senior GTM Engineer';

  return (
    <div className="space-y-6 text-stone-800">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                <Compass className="h-3.5 w-3.5 text-indigo-600" />
                Adaptive Learning Path
              </span>
              <span className="text-xs text-stone-500">
                Dynamic AI Skill Gap Analysis
              </span>
            </div>
            <h2 className="text-base font-bold text-stone-900 mt-1">
              Personalized GTM Systems Architecture Study Plan
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Continuously calibrated against your drilled answers to eliminate interview blind spots and accelerate Staff readiness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onStartCustomDrill(weakestPillar?.track || 'system-architecture', recommendedDifficulty)}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-stone-800 transition"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Launch Targeted Remedial Drill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Skill Gap Diagnostics + Recommended Concepts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (7 Cols): Pillar Health & Blind Spot Matrix */}
        <div className="lg:col-span-7 space-y-5">
          {/* Pillar Diagnostic Breakdown */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-600" />
                Competency Heatmap & Focus Priorities
              </h3>
              <span className="text-xs text-stone-400 font-mono">
                {totalAnswered} questions evaluated
              </span>
            </div>

            <div className="space-y-3">
              {pillarScores.map((p, idx) => {
                const isWeakest = p.key === weakestPillar?.key && p.count > 0;
                const isStrongest = p.key === strongestPillar?.key && p.count > 0 && p.avg >= 80;

                return (
                  <div 
                    key={idx}
                    className={`rounded-xl p-3.5 border transition ${
                      isWeakest 
                        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200' 
                        : isStrongest 
                        ? 'bg-emerald-50/50 border-emerald-200' 
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900">{p.name}</span>
                        {isWeakest && (
                          <span className="rounded-md bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                            Priority Focus
                          </span>
                        )}
                        {isStrongest && (
                          <span className="rounded-md bg-emerald-200/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900">
                            Strength
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-900">
                          {p.count > 0 ? `${p.avg}%` : 'Uncalibrated'}
                        </span>
                        <button
                          onClick={() => onStartCustomDrill(p.track, 'Senior GTM Engineer')}
                          className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-semibold text-stone-700 border border-stone-200 hover:bg-stone-100 transition shadow-2xs"
                        >
                          Drill →
                        </button>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          p.avg >= 85 ? 'bg-emerald-500' : p.avg >= 70 ? 'bg-indigo-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(p.avg, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Captured Technical Gotchas & Blind Spots */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Observed Blind Spots & Edge-Case Gotchas
            </h3>
            <p className="text-xs text-stone-500">
              Recurring technical omissions detected during your live simulations:
            </p>

            {blindSpots.length > 0 ? (
              <div className="space-y-2 pt-1">
                {blindSpots.map((spot, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl bg-amber-50/50 p-3 border border-amber-200/80 text-xs">
                    <span className="font-bold text-amber-600 mt-0.5">⚠️</span>
                    <span className="text-amber-950 font-medium leading-relaxed">{spot}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-stone-50 p-4 text-center text-xs text-stone-500 border border-stone-200">
                Complete questions with AI evaluation to discover targeted architectural blind spots.
              </div>
            )}
          </div>
        </div>

        {/* Right (5 Cols): Targeted Concepts & Quick Flashcard Previews */}
        <div className="lg:col-span-5 space-y-5">
          {/* Recommended Pre-Session Concepts */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                Concepts to Review Before Next Drill
              </h3>
              {onNavigateToCheatsheet && (
                <button
                  onClick={onNavigateToCheatsheet}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  All Cards →
                </button>
              )}
            </div>

            <div className="space-y-3">
              {recommendedCards.map((card) => (
                <div 
                  key={card.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 space-y-2 text-xs hover:border-indigo-200 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-stone-900">{card.term}</span>
                    <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                      {card.category}
                    </span>
                  </div>

                  <p className="text-stone-600 text-[11px] line-clamp-2">
                    {card.definition}
                  </p>

                  <div className="rounded-lg bg-indigo-50/60 p-2 text-[11px] text-indigo-950 border border-indigo-100/80">
                    <span className="font-bold text-indigo-700">Interview Tip: </span>
                    {card.interviewTip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Practice Sprint */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Recommended 15-Minute Sprint
              </h4>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-stone-900 text-sm">
                {weakestPillar?.name || 'System Architecture & Webhooks'}
              </div>
              <p className="text-stone-600 text-[11px]">
                Target: Drill 2 technical scenarios focusing on idempotency, rate limiting, and CRM sync governance.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                <Clock className="h-3.5 w-3.5 text-stone-400" />
                <span>Estimated: 15 mins</span>
              </div>

              <button
                onClick={() => onStartCustomDrill(weakestPillar?.track || 'system-architecture', recommendedDifficulty)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 transition"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Start Drill</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
