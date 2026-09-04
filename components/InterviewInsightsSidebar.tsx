'use client';

import React, { useMemo, useState } from 'react';
import { 
  Lightbulb, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Target, 
  ShieldAlert, 
  Copy, 
  Check, 
  ChevronRight, 
  Layers, 
  Pin, 
  X, 
  BarChart2, 
  Cpu, 
  Clock, 
  Compass,
  ArrowRight,
  Plus
} from 'lucide-react';
import { InterviewQuestion, TargetCompanyApplication, DifficultyLevel, GTMRoleProfile, WildcardConstraint } from '@/lib/types';

interface InterviewInsightsSidebarProps {
  activeQuestion: InterviewQuestion;
  candidateAnswer: string;
  targetCompany?: TargetCompanyApplication;
  difficulty?: DifficultyLevel;
  roleProfile?: GTMRoleProfile;
  wildcard?: WildcardConstraint | null;
  onInsertSnippet?: (text: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
}

interface PillarCheck {
  id: string;
  name: string;
  keywords: string[];
  description: string;
}

export const InterviewInsightsSidebar: React.FC<InterviewInsightsSidebarProps> = ({
  activeQuestion,
  candidateAnswer,
  targetCompany,
  difficulty = 'Senior GTM Engineer',
  roleProfile = 'GTM Systems Engineer',
  wildcard,
  onInsertSnippet,
  isOpen,
  onToggle,
  isPinned,
  onTogglePin,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'realtime' | 'keywords' | 'resume' | 'delivery'>('realtime');

  // Real-time keyword check across answer text
  const normalizedAnswer = (candidateAnswer || '').toLowerCase();

  const PILLAR_CHECKS: PillarCheck[] = useMemo(() => [
    {
      id: 'governor',
      name: 'Governor & API Rate Limits',
      keywords: ['limit', 'rate limit', 'governor', 'bulk', 'batch', 'throttle', 'backoff', 'concurrency', '2.0', '100k'],
      description: 'Mention API quota conservation (e.g. Salesforce 24-hour limits, Bulk API 2.0 micro-batching).'
    },
    {
      id: 'idempotency',
      name: 'Idempotency & Dedup Keys',
      keywords: ['idempotent', 'idempotency', 'dedup', 'deduplication', 'hash', 'event id', 'redis', 'ttl', 'lock', 'unique'],
      description: 'Ensure incoming duplicate webhooks or concurrent retries do not create duplicate records.'
    },
    {
      id: 'error-handling',
      name: 'Error Trapping & DLQ',
      keywords: ['dlq', 'dead letter', 'retry', 'fallback', 'alert', 'error', 'catch', 'circuit breaker', 'sentry', 'slack alert'],
      description: 'Prevent silent data drops with a dead-letter queue, automated alerts, and schema validation.'
    },
    {
      id: 'crm-hygiene',
      name: 'CRM Schema & Bidirectional Sync',
      keywords: ['salesforce', 'hubspot', 'lead', 'contact', 'account', 'merge', 'upsert', 'external id', 'sync', 'schema', 'composite'],
      description: 'Address CRM data hygiene, lead-to-account matching, or composite external ID upserts.'
    },
    {
      id: 'business-roi',
      name: 'Business ROI & Speed-to-Lead SLA',
      keywords: ['sla', 'speed-to-lead', 'conversion', 'revenue', 'roi', 'ae', 'sdr', 'adoption', 'pipeline', 'metric', 'telemetry', 'minutes'],
      description: 'Anchor the technical solution in tangible business outcomes (e.g. <2 min SLA, rep trust, conversion lift).'
    }
  ], []);

  // Calculate live coverage
  const coverageResults = useMemo(() => {
    return PILLAR_CHECKS.map((pillar) => {
      const isCovered = pillar.keywords.some((kw) => normalizedAnswer.includes(kw));
      return {
        ...pillar,
        isCovered
      };
    });
  }, [PILLAR_CHECKS, normalizedAnswer]);

  const coveredCount = coverageResults.filter((r) => r.isCovered).length;
  const coveragePercent = Math.round((coveredCount / PILLAR_CHECKS.length) * 100);

  // Derive question category archetype insights
  const questionArchetype = useMemo(() => {
    const text = `${activeQuestion.category} ${activeQuestion.title} ${activeQuestion.question}`.toLowerCase();
    if (text.includes('waterfall') || text.includes('clay') || text.includes('enrich')) {
      return {
        type: 'Enrichment Waterfall & Data Providers',
        intent: 'Testing cost management, provider coverage disparities, and conditional fallback logic.',
        trap: 'Running all enrichment vendors simultaneously instead of waterfalling conditionally on null results.',
        goldPhrasing: 'Sequence vendors from highest-coverage/lowest-cost to expensive specialists with ZeroBounce validation.'
      };
    }
    if (text.includes('webhook') || text.includes('governor') || text.includes('rate') || text.includes('volume')) {
      return {
        type: 'High-Ingress & Governor Resilience',
        intent: 'Testing asynchronous decoupling, queuing architectures, and backpressure defense.',
        trap: 'Making synchronous CRM REST API calls on every inbound webhook packet.',
        goldPhrasing: 'Acknowledge ingress immediately with HTTP 202, buffer in Redis/SQS, and process via Bulk API 2.0.'
      };
    }
    if (text.includes('agent') || text.includes('llm') || text.includes('ai')) {
      return {
        type: 'AI-Native Outbound & Agentic Workflows',
        intent: 'Testing prompt engineering reliability, token cost limits, latency mitigation, and human-in-the-loop review.',
        trap: 'Allowing unverified LLM hallucinations directly into customer-facing emails without verification gates.',
        goldPhrasing: 'Use model cascading (Pro -> Flash) with structured JSON schemas and a human-in-the-loop fallback flag.'
      };
    }
    if (text.includes('lead') || text.includes('contact') || text.includes('dedup') || text.includes('crm')) {
      return {
        type: 'CRM Object Governance & Hygiene',
        intent: 'Testing lead-to-account matching, survivorship rules, and attribution preservation.',
        trap: 'Deleting duplicate records outright without re-linking campaign members and attribution touches.',
        goldPhrasing: 'Enforce master survivorship rules, reparent activity history, and soft-delete duplicate leads.'
      };
    }
    return {
      type: 'End-to-End GTM Systems Architecture',
      intent: 'Testing systemic trade-offs between speed, data integrity, cost, and sales team usability.',
      trap: 'Over-indexing on pure code without addressing sales rep adoption and CRM governor limits.',
      goldPhrasing: 'Balance robust backend queue buffering with clear Slack/CRM rep visibility and telemetry.'
    };
  }, [activeQuestion]);

  // Contextual high-impact keywords for current question
  const contextualKeywords = useMemo(() => {
    const list: string[] = [];
    if (activeQuestion.targetSkills) {
      list.push(...activeQuestion.targetSkills);
    }
    if (activeQuestion.structuredHint?.keyComponentsToMention) {
      list.push(...activeQuestion.structuredHint.keyComponentsToMention);
    }
    // Add default core terms if list is short
    if (list.length < 5) {
      list.push('Idempotency Key', 'Redis Buffer', 'Bulk API 2.0', 'Dead-Letter Queue (DLQ)', 'Exponential Backoff', 'Speed-to-Lead SLA');
    }
    return Array.from(new Set(list)).slice(0, 8);
  }, [activeQuestion]);

  const handleCopyKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKey(kw);
    setTimeout(() => setCopiedKey(null), 1500);
    if (onInsertSnippet) {
      onInsertSnippet(`\n• **${kw}**: `);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-24 z-30 flex items-center gap-2 rounded-xl border border-stone-200 bg-white/95 px-3 py-2 text-xs font-bold text-stone-800 shadow-md backdrop-blur-md hover:bg-stone-50 hover:border-indigo-300 transition-all group"
        title="Open Interview Insights"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
          <Lightbulb className="h-3.5 w-3.5" />
        </div>
        <span className="hidden sm:inline">Interview Insights</span>
        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
          coveragePercent >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {coveragePercent}%
        </span>
      </button>
    );
  }

  return (
    <aside 
      className={`rounded-2xl border border-stone-200 bg-[#fafaf9] shadow-sm flex flex-col transition-all duration-200 overflow-hidden ${
        isPinned ? 'w-full' : 'w-full'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
            <Lightbulb className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-stone-900">Interview Insights</h3>
              <span className="rounded-full bg-indigo-50 px-2 py-0.2 text-[9px] font-bold text-indigo-700 border border-indigo-100">
                Live Co-Pilot
              </span>
            </div>
            <p className="text-[10px] text-stone-500">Real-time guidance for this GTM design</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            className={`p-1 rounded-lg transition ${
              isPinned ? 'bg-indigo-100 text-indigo-700' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
            title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            title="Collapse sidebar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-stone-200 bg-white/60 px-2 py-1.5 text-[11px] font-semibold gap-1">
        <button
          onClick={() => setActiveTab('realtime')}
          className={`flex-1 rounded-lg py-1 px-2 text-center transition ${
            activeTab === 'realtime' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Pillars ({coveredCount}/5)
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`flex-1 rounded-lg py-1 px-2 text-center transition ${
            activeTab === 'keywords' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Keywords
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`flex-1 rounded-lg py-1 px-2 text-center transition ${
            activeTab === 'resume' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Resume Hook
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex-1 rounded-lg py-1 px-2 text-center transition ${
            activeTab === 'delivery' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Delivery Pacing
        </button>
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[700px]">
        {/* Tab 1: Real-Time Architectural Pillar Coverage */}
        {activeTab === 'realtime' && (
          <div className="space-y-3.5">
            {/* Live Meter Bar */}
            <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">Architectural Coverage</span>
                <span className="font-mono font-bold text-indigo-600">{coveragePercent}% ({coveredCount}/5)</span>
              </div>
              <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    coveragePercent >= 80 ? 'bg-emerald-600' : coveragePercent >= 40 ? 'bg-indigo-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Live detector checks your typed or speech-to-text verbalized answer as you speak.
              </p>
            </div>

            {/* Pillar Item Checklist */}
            <div className="space-y-2">
              {coverageResults.map((pillar) => (
                <div 
                  key={pillar.id}
                  className={`rounded-xl border p-2.5 transition-all text-xs space-y-1 ${
                    pillar.isCovered
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      {pillar.isCovered ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      )}
                      <span className={pillar.isCovered ? 'text-emerald-950' : 'text-stone-900'}>
                        {pillar.name}
                      </span>
                    </div>

                    {!pillar.isCovered && onInsertSnippet && (
                      <button
                        onClick={() => onInsertSnippet(`\n• **${pillar.name}**: `)}
                        className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                        title="Add bullet to response"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 leading-normal pl-5">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Evaluator Intent Card */}
            <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <Target className="h-3.5 w-3.5 text-indigo-600" />
                <span>Interviewer Archetype Intent</span>
              </div>
              <div className="text-[11px] font-semibold text-indigo-900">
                {questionArchetype.type}
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {questionArchetype.intent}
              </p>
            </div>

            {/* Trap Warning */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-950 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-900">Watch Out: </span>
                <span className="text-rose-950 text-[11px] leading-snug">{questionArchetype.trap}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: High-Yield Keywords */}
        {activeTab === 'keywords' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900">Must-Mention Technical Terms</span>
              <span className="text-[10px] text-stone-400">Click to insert / copy</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {contextualKeywords.map((kw) => {
                const isMentioned = normalizedAnswer.includes(kw.toLowerCase());
                return (
                  <button
                    key={kw}
                    onClick={() => handleCopyKeyword(kw)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition border ${
                      isMentioned
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-indigo-300 hover:bg-stone-50'
                    }`}
                  >
                    {isMentioned ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : copiedKey === kw ? (
                      <Check className="h-3 w-3 text-indigo-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-stone-400" />
                    )}
                    <span>{kw}</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-1.5 text-xs">
              <span className="font-bold text-stone-900">Gold Standard Phrasing:</span>
              <p className="text-[11px] text-stone-600 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
                &ldquo;{questionArchetype.goldPhrasing}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Resume Story Anchor */}
        {activeTab === 'resume' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Jamil&rsquo;s Novalyte AI Anchor</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {activeQuestion.resumeConnection || 
                 'Connect this challenge to your work at Novalyte AI where you orchestrated automated intake pipelines, integrated webhook transformations, and guarded clinical data schemas.'}
              </p>
            </div>

            {targetCompany && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 space-y-1 text-xs">
                <span className="font-bold text-indigo-950">Target Company Alignment ({targetCompany.company}):</span>
                <p className="text-[11px] text-indigo-900 leading-snug">
                  Role: {targetCompany.role}. Highlight your experience with {targetCompany.techStack.slice(0, 3).join(', ')} to show immediate time-to-value.
                </p>
              </div>
            )}

            {wildcard && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3 space-y-1 text-xs">
                <span className="font-bold text-amber-950">Active Wildcard Defense:</span>
                <p className="text-[11px] text-amber-900 leading-snug">
                  Mitigation: {wildcard.architecturalMitigationHint}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Verbal Delivery Framework */}
        {activeTab === 'delivery' && (
          <div className="space-y-2.5 text-xs">
            <div className="text-xs font-bold text-stone-900">
              4-Phase System Design Verbal Framework
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-2.5 space-y-1">
              <div className="flex items-center justify-between font-bold text-stone-900">
                <span>Phase 1: Clarify & Scope</span>
                <span className="font-mono text-[10px] text-stone-400">Min 0 - 3</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Clarify volume (RPM), latency SLA (&lt;2s vs async), external vendor limits, and fail-safe tolerance.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-2.5 space-y-1">
              <div className="flex items-center justify-between font-bold text-stone-900">
                <span>Phase 2: High-Level Pipeline</span>
                <span className="font-mono text-[10px] text-stone-400">Min 3 - 8</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Trace data from Ingress (Webhook/API) &rarr; Buffer/Queue &rarr; Transformation &rarr; CRM/Storage.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-2.5 space-y-1">
              <div className="flex items-center justify-between font-bold text-stone-900">
                <span>Phase 3: Deep Dive & Bottlenecks</span>
                <span className="font-mono text-[10px] text-stone-400">Min 8 - 15</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Dive deep into governor limits, idempotency keys (Redis TTL), and Clay waterfall cost gates.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-2.5 space-y-1">
              <div className="flex items-center justify-between font-bold text-stone-900">
                <span>Phase 4: Trade-Offs & Business ROI</span>
                <span className="font-mono text-[10px] text-stone-400">Min 15 - 20</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Explain failure recovery (DLQ + alerts) and summarize business impact on AE conversion & pipeline velocity.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
