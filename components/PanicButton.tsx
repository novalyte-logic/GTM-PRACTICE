'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Zap, 
  ArrowRight, 
  Terminal, 
  KeyRound, 
  Cpu, 
  RotateCcw,
  Flame
} from 'lucide-react';

interface PanicButtonProps {
  currentTrack?: string;
  currentQuestionTitle?: string;
  className?: string;
}

interface StrategyRecipe {
  category: string;
  triggerContext: string;
  oneSentenceStrategy: string;
  corePattern: string;
  failProofChecklist: string[];
}

const ARCHITECTURAL_STRATEGIES: Record<string, StrategyRecipe> = {
  'ingestion-spike': {
    category: 'Ingress Webhook Spikes & Rate Limits',
    triggerContext: 'Stripe, HubSpot, or Segment sending bursts of 5,000+ events/sec that threaten downstream CRM crashes.',
    oneSentenceStrategy: 'Ingest payloads via an API Gateway, immediately ACK 200 OK, push to a durable Redis/SQS queue, and process asynchronously with Leaky Bucket concurrency throttles.',
    corePattern: 'API Gateway ➔ Redis Streams / SQS ➔ Worker Pool ➔ Rate-Limited CRM Batch Upsert',
    failProofChecklist: [
      'ACK 200 OK within 200ms before doing any database lookup',
      'Buffer in queue with Dead-Letter Queue (DLQ) for malformed payloads',
      'Batch CRM writes in chunks of 100-200 records using Bulk API 2.0'
    ]
  },
  'idempotency-dedup': {
    category: 'Race Conditions & Duplicate Invoices',
    triggerContext: 'Multiple concurrent webhook deliveries or retries creating duplicate leads, subscriptions, or double-counted ARR.',
    oneSentenceStrategy: 'Acquire an atomic distributed lock in Redis keyed by `event_id` or `source_id:timestamp` with a 30-second TTL before executing any downstream mutation.',
    corePattern: 'SETNX lock:event_123 ➔ Process Business Logic ➔ Mark Key as COMPLETED in Postgres',
    failProofChecklist: [
      'Enforce database unique index on `(source_system, source_event_id)`',
      'Use atomic `SET resource_key my_random_value NX PX 30000` in Redis',
      'If lock acquisition fails, return 200 OK (or retry with exponential jitter)'
    ]
  },
  'governor-limits': {
    category: 'Salesforce SOQL & Apex Governor Limit Crashes',
    triggerContext: 'Apex triggers throwing `System.LimitException: Too many SOQL queries: 101` or `UNABLE_TO_LOCK_ROW`.',
    oneSentenceStrategy: 'Decouple synchronous triggers into asynchronous Queueable Apex or Platform Events, and aggregate all database queries into a single Set/Map collection outside loop constructs.',
    corePattern: 'Trigger (Collect IDs) ➔ Publish Platform Event ➔ Async Queueable Handler ➔ Bulk DML',
    failProofChecklist: [
      'Zero SOQL or DML queries inside `for` loops — strictly use `Map<Id, SObject>`',
      'Offload heavy downstream calculations to Platform Events or Batch Apex',
      'Use `FOR UPDATE` with caution or serialize updates via Redis worker keys'
    ]
  },
  'waterfall-enrichment': {
    category: 'Clay Waterfall Latency & API Credit Burn',
    triggerContext: 'Cascading Apollo/Hunter/ZoomInfo API queries taking 6+ seconds or draining monthly budget prematurely.',
    oneSentenceStrategy: 'Query internal Postgres cache first, trigger external waterfall providers asynchronously in background workers, and terminate the cascade immediately once high-confidence email deliverability is confirmed.',
    corePattern: 'Postgres Cache Check ➔ Apollo ($0.02) ➔ Hunter ($0.05) ➔ ZoomInfo ($0.50 fallback only) ➔ Async CRM Patch',
    failProofChecklist: [
      'Never block synchronous user signup forms with live external enrichment calls',
      'Set hard monthly credit spend caps with automated Slack burn telemetry',
      'Cache validated domain & firmographic metadata for 30-90 days'
    ]
  },
  'reverse-etl': {
    category: 'Snowflake to Salesforce Sync Conflicts',
    triggerContext: 'Reverse ETL sync jobs overwriting human sales rep edits or exhausting 24-hour daily API call allocations.',
    oneSentenceStrategy: 'Implement primary key checksum diffing to sync only modified fields, schedule heavy syncs during off-peak hours, and configure field-level write permissions to never overwrite non-empty human inputs.',
    corePattern: 'Snowflake dbt Model ➔ Census/Hightouch Diff Engine ➔ Selective Field Patch ➔ Salesforce Bulk API',
    failProofChecklist: [
      'Enable "Only write if field is empty" on human-edited fields (e.g. Next Steps)',
      'Use CDC (Change Data Capture) / Hash diffing instead of full-table dumps',
      'Reserve 30% of daily Salesforce API limits for real-time SDR routing'
    ]
  },
  'system-architecture': {
    category: 'General GTM Architecture Default',
    triggerContext: 'High-level architectural design across CRM, MAP, Billing, and Data Warehousing.',
    oneSentenceStrategy: 'Isolate producer ingress with an asynchronous queue buffer, enforce distributed idempotency locks, enrich via tiered cached waterfalls, and sync to downstream systems using bulkified batch workers with DLQ fallbacks.',
    corePattern: 'Producer ➔ Queue Buffer ➔ Idempotent Worker ➔ Cache/Enrich ➔ Bulk Upsert ➔ DLQ Fallback',
    failProofChecklist: [
      'Ingress isolation & fast ACK',
      'Distributed idempotency lock keying',
      'Bulkification & governor limit headroom',
      'DLQ telemetry & observability'
    ]
  }
};

export const PanicButton: React.FC<PanicButtonProps> = ({
  currentTrack,
  currentQuestionTitle,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedStrategyKey, setSelectedStrategyKey] = useState<string>(() => {
    if (currentTrack && ARCHITECTURAL_STRATEGIES[currentTrack]) {
      return currentTrack;
    }
    return 'ingestion-spike';
  });
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  const activeStrategy = ARCHITECTURAL_STRATEGIES[selectedStrategyKey] || ARCHITECTURAL_STRATEGIES['system-architecture'];

  const handleCopyStrategy = () => {
    navigator.clipboard.writeText(activeStrategy.oneSentenceStrategy);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-1.5 text-xs shadow-xs transition-all duration-150 animate-pulse hover:animate-none ${className}`}
        title="Stuck? Open Panic Button for 1-sentence Staff strategy"
      >
        <Flame className="h-3.5 w-3.5" />
        <span>Panic Button: 1-Sentence Strategy</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl space-y-5 text-stone-900">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-rose-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white font-extrabold shadow-sm shrink-0">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-black uppercase text-rose-800 border border-rose-300">
                      Immediate Architectural Bailout
                    </span>
                    <span className="text-xs text-stone-400">Emergency Staff Strategy</span>
                  </div>
                  <h3 className="text-base font-extrabold text-stone-900 mt-0.5">
                    1-Sentence Staff GTM Architectural Answer
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Strategy Category Switcher */}
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(ARCHITECTURAL_STRATEGIES).map(([key, strat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedStrategyKey(key)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    selectedStrategyKey === key
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {strat.category.split('&')[0]}
                </button>
              ))}
            </div>

            {/* The 1-Sentence Golden Architectural Strategy Card */}
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/70 p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-rose-600" />
                  Your 1-Sentence High-Score Response
                </span>
                <button
                  onClick={handleCopyStrategy}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-bold text-rose-900 border border-rose-200 shadow-2xs hover:bg-rose-50"
                >
                  {hasCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{hasCopied ? 'Copied to Clipboard!' : 'Copy Strategy'}</span>
                </button>
              </div>

              <p className="text-sm sm:text-base font-extrabold text-rose-950 leading-relaxed tracking-tight">
                &ldquo;{activeStrategy.oneSentenceStrategy}&rdquo;
              </p>

              <div className="pt-1 text-[11px] font-mono text-rose-800 bg-white/80 p-2 rounded-lg border border-rose-200/80">
                <span className="font-bold text-rose-900">Blueprint Sequence:</span> {activeStrategy.corePattern}
              </div>
            </div>

            {/* 3-Point Bulletproof Defense Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-800">
                Staff 3-Point Checklist to Mention in Your Interview:
              </h4>
              <ul className="space-y-1.5">
                {activeStrategy.failProofChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
              <span>Recite this 1-sentence framework out loud to instantly stabilize your answer.</span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-stone-900 text-white font-bold px-4 py-2 hover:bg-stone-800 transition"
              >
                Got It, Back to Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
