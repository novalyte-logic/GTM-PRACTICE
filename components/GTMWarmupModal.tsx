'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Shuffle, 
  ChevronRight, 
  Lightbulb, 
  ShieldAlert, 
  Layers, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { GTM_WARMUP_CHALLENGES, WarmupChallenge } from '@/lib/warmup-challenges';
import { useStorageItem } from '@/lib/useHydration';

interface GTMWarmupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteWarmup?: (challengeTitle: string) => void;
}

export const GTMWarmupModal: React.FC<GTMWarmupModalProps> = ({
  isOpen,
  onClose,
  onCompleteWarmup
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 minutes
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [showReferenceSolution, setShowReferenceSolution] = useState<boolean>(false);
  const [confidenceLevel, setConfidenceLevel] = useState<'primed' | 'solid' | 'needs-review' | null>(null);
  const [completedChallenges, setCompletedChallenges] = useStorageItem<string[]>('gtm_warmup_completed_v1', []);

  const challenge = useMemo(() => GTM_WARMUP_CHALLENGES[selectedIndex] || GTM_WARMUP_CHALLENGES[0], [selectedIndex]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
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
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Reset challenge-specific states when switching
  const handleSelectChallenge = (index: number) => {
    setSelectedIndex(index);
    setTimerSeconds(300);
    setIsTimerRunning(false);
    setNotes('');
    setShowReferenceSolution(false);
    setConfidenceLevel(null);
  };

  const handleRandomChallenge = () => {
    const nextIdx = Math.floor(Math.random() * GTM_WARMUP_CHALLENGES.length);
    handleSelectChallenge(nextIdx);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = ((300 - timerSeconds) / 300) * 100;

  const handleAddSnippet = (snippet: string) => {
    setNotes((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n• ${snippet}` : `• ${snippet}`;
    });
  };

  const handleFinishWarmup = () => {
    if (!completedChallenges.includes(challenge.id)) {
      setCompletedChallenges([...completedChallenges, challenge.id]);
    }
    if (onCompleteWarmup) {
      onCompleteWarmup(challenge.title);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl rounded-2xl border border-stone-200 bg-[#fafaf9] shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-xs">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-stone-900">5-Minute GTM Architecture Warm-up</h2>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200">
                  Low-Stakes Primer
                </span>
                {completedChallenges.includes(challenge.id) && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Warmed Up
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                Prime your system thinking and get in the zone before starting the formal interview round.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Challenge Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
              <button
                onClick={handleRandomChallenge}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 hover:bg-white transition"
                title="Pick random challenge"
              >
                <Shuffle className="h-3 w-3" />
                <span>Random</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              title="Close warm-up"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Challenge Tabs Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-stone-200 bg-white/70 px-4 py-2 text-xs scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0 mr-1">
            Warm-up Drills:
          </span>
          {GTM_WARMUP_CHALLENGES.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleSelectChallenge(idx)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition shrink-0 ${
                selectedIndex === idx
                  ? 'bg-amber-500 text-white shadow-2xs font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              {completedChallenges.includes(item.id) && <CheckCircle2 className="h-3 w-3" />}
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Active Challenge Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-700 border border-stone-200">
                  {challenge.category}
                </span>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                  {challenge.estimatedTime} Drill
                </span>
              </div>

              {/* 5-Minute Timer Bar */}
              <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                <Clock className={`h-3.5 w-3.5 ${isTimerRunning ? 'text-amber-600 animate-pulse' : 'text-stone-400'}`} />
                <span className={`font-mono text-xs font-bold ${timerSeconds <= 60 ? 'text-rose-600 animate-pulse' : 'text-stone-900'}`}>
                  {formatTime(timerSeconds)}
                </span>
                
                <div className="flex items-center gap-1 ml-1 pl-1 border-l border-stone-200">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-1 rounded-md hover:bg-white text-stone-700 transition"
                    title={isTimerRunning ? 'Pause timer' : 'Start 5m timer'}
                  >
                    {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(300);
                    }}
                    className="p-1 rounded-md hover:bg-white text-stone-400 hover:text-stone-700 transition"
                    title="Reset timer"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Timer Visual Progress */}
            <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${timerProgress}%` }}
              />
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                {challenge.prompt}
              </div>
              <h3 className="text-base font-bold text-stone-900 mt-0.5">
                {challenge.title}
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                {challenge.scenario}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200/90 bg-amber-50/60 p-3 text-xs text-amber-950 space-y-1">
              <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-amber-700" />
                Quick Architecture Question:
              </span>
              <p className="font-semibold text-stone-900 text-xs leading-relaxed">
                {challenge.coreQuestion}
              </p>
            </div>
          </div>

          {/* Quick Scratchpad & Rapid Outline */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-stone-900">
                  Quick Rapid Architecture Outline (Scratchpad)
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-stone-400 font-medium mr-1">Quick Scaffolding:</span>
                <button
                  onClick={() => handleAddSnippet('1. Ingestion / Webhook Gateway with HTTP 202')}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700 hover:bg-stone-200 transition"
                >
                  + Ingress
                </button>
                <button
                  onClick={() => handleAddSnippet('2. Redis Deduplication Cache (48h TTL on Event ID)')}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700 hover:bg-stone-200 transition"
                >
                  + Dedup Cache
                </button>
                <button
                  onClick={() => handleAddSnippet('3. Asynchronous Queue & Micro-Batching (Bulk API 2.0)')}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700 hover:bg-stone-200 transition"
                >
                  + Bulk Queue
                </button>
                <button
                  onClick={() => handleAddSnippet('4. Dead-Letter Queue & Slack Alerting on Schema Drift')}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700 hover:bg-stone-200 transition"
                >
                  + DLQ / Alert
                </button>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down your 3 architectural bullet points here (e.g. Ingestion gate, queue buffering, CRM write guard)..."
              rows={3}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/60 p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 transition resize-none font-mono"
            />
          </div>

          {/* Reference Solution Toggle */}
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setShowReferenceSolution(!showReferenceSolution)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50 transition"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-stone-900">
                  {showReferenceSolution ? 'Hide 3-Pillar Reference Blueprint' : 'Reveal 3-Pillar Reference Blueprint (Self-Check)'}
                </span>
                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                  {showReferenceSolution ? 'Click to collapse' : 'Click to peek'}
                </span>
              </div>
              <ChevronRight className={`h-4 w-4 text-stone-400 transition-transform ${showReferenceSolution ? 'rotate-90' : ''}`} />
            </button>

            {showReferenceSolution && (
              <div className="p-4 pt-0 border-t border-stone-100 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
                  {challenge.suggestedThreePillars.map((pillar, i) => (
                    <div key={i} className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 space-y-1.5">
                      <div className="text-xs font-bold text-stone-900">{pillar.title}</div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">{pillar.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {pillar.keyTerms.map((term) => (
                          <span key={term} className="rounded bg-white px-1.5 py-0.5 text-[9px] font-bold text-stone-700 border border-stone-200">
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Common Gotcha */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-950 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-900">Common Interview Gotcha: </span>
                    <span className="text-rose-950">{challenge.quickGotcha}</span>
                  </div>
                </div>

                {/* Golden Takeaway */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-950 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900">Golden Architecture Takeaway: </span>
                    <span className="text-emerald-950">{challenge.idealTakeaway}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Self-Assessment Quick Check */}
          <div className="rounded-xl border border-stone-200 bg-white p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-700">Warm-up Confidence Check:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setConfidenceLevel('primed')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    confidenceLevel === 'primed'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  ⚡ Primed & Ready
                </button>
                <button
                  onClick={() => setConfidenceLevel('solid')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    confidenceLevel === 'solid'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  👍 Solid
                </button>
                <button
                  onClick={() => setConfidenceLevel('needs-review')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    confidenceLevel === 'needs-review'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  🔍 Reviewed Blueprint
                </button>
              </div>
            </div>

            <span className="text-[11px] text-stone-500">
              Completed: {completedChallenges.length} of {GTM_WARMUP_CHALLENGES.length} warm-up drills
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-white px-5 py-3.5">
          <button
            onClick={onClose}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
          >
            Skip for Now
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectChallenge((selectedIndex + 1) % GTM_WARMUP_CHALLENGES.length)}
              className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
            >
              Try Another Warm-up
            </button>

            <button
              onClick={handleFinishWarmup}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <span>Warm-up Complete: Start Main Interview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
