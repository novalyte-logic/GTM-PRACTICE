'use client';

import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Database, 
  Workflow, 
  Sparkles, 
  BarChart3,
  CheckCircle2,
  Cpu,
  Target,
  Users,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  X,
  ArrowRight,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip 
} from 'recharts';
import { GTM_COMPETENCY_RUBRIC, COMMUNITY_BENCHMARK_PROFILES } from '@/lib/mock-data';
import { CandidateAnswerRecord } from '@/lib/types';

interface BenchmarkRadarProps {
  completedAnswers: CandidateAnswerRecord[];
}

export interface CompetencyPillarDetail {
  id: string;
  pillarName: string;
  shortTitle: string;
  comparisonTradeoff: string;
  technicalMetrics: string[];
  seniorStaffExpectation: string;
  failureModePrevented: string;
  interviewDrillScenario: string;
  typicalQuestions: string[];
}

export const BENCHMARK_COMPETENCY_DETAILS: CompetencyPillarDetail[] = [
  {
    id: 'arch',
    pillarName: 'System Architecture',
    shortTitle: 'Ingress & Webhook Scale',
    comparisonTradeoff: 'API Latency vs. Synchronous Database Persistence',
    technicalMetrics: [
      'P99 API Ingress Latency: Responding <150ms with HTTP 202 Accepted via SQS/Kafka buffering',
      'Idempotent Event Processing: UUID / Redis Redlock with 24-hour expiration to prevent duplicate billing or routing',
      'Dead-Letter Queue (DLQ): Automated exponential backoff with jitter (1s, 2s, 4s, 8s, max 5 retries)',
      'Distributed Token-Bucket Throttling: Protecting downstream SaaS CRM APIs from burst exhaustion'
    ],
    seniorStaffExpectation: 'Decouples high-volume webhook ingestion from slow downstream CRM writes using message queues, guaranteeing zero dropped leads during 10,000 req/min flash surges.',
    failureModePrevented: 'Synchronous blocking CRM calls causing HTTP 504 Gateway Timeouts and lost sales leads.',
    interviewDrillScenario: 'A sudden marketing webinar pushes 45,000 attendee webhooks in under 3 minutes. The candidate must architect an asynchronous buffer that preserves order and prevents downstream CRM throttling.',
    typicalQuestions: [
      'How do you design a webhook receiver that survives a 50x ingress traffic spike?',
      'Explain how idempotency keys prevent duplicate contacts when a webhook provider retries automatically.'
    ]
  },
  {
    id: 'crm',
    pillarName: 'CRM & Data Hygiene',
    shortTitle: 'CRM Schema & Governors',
    comparisonTradeoff: 'CRM Data Schema Normalization vs. SOQL Governor Limits',
    technicalMetrics: [
      'Relational Schema Normalization: Lead-to-Account-to-Opportunity relationship integrity and custom field governance',
      'Compound Deduplication Keys: Matching normalized corporate domain + personal email + tax ID before record creation',
      'SOQL Governor Limits: Staying strictly below Salesforce 100 SOQL queries / 150 DML per execution context',
      'Bi-Directional Race Conditions: Monotonic timestamp validation and field-level change history to break circular loops'
    ],
    seniorStaffExpectation: 'Designs relational schemas that optimize for both reporting speed and API efficiency, leveraging Bulk API 2.0 and Apex batching to prevent governor limit crashes.',
    failureModePrevented: 'Hitting System.LimitException: Too many SOQL queries: 101, halting enterprise sales operations.',
    interviewDrillScenario: 'Salesforce and HubSpot bi-directional sync creating infinite modification loops on the Opportunity object. The candidate must design a loop-breaker using updated_by webhook audit headers.',
    typicalQuestions: [
      'How do you handle composite key deduplication across 2 million records without timing out SOQL?',
      'How do you detect and break a ping-pong update loop between HubSpot and Salesforce?'
    ]
  },
  {
    id: 'enrichment',
    pillarName: 'Enrichment & Modern Stack',
    shortTitle: 'Waterfall & Outbound Tooling',
    comparisonTradeoff: 'Multi-Vendor Waterfall Match Rates vs. API Credit Burn Rate',
    technicalMetrics: [
      'Multi-Vendor Waterfall Routing: Tiered cascades (Clay -> Apollo -> ZoomInfo -> Dropcontact) based on fill-rate',
      'Cache-First Invalidation: Storing enriched data in Redis/Postgres with 60-day TTL before issuing billable vendor calls',
      'HTTP 429 Rate-Limit Recovery: Client-side leaky-bucket queueing with backoff headers (Retry-After)',
      'Regulatory Compliance: GDPR/CAN-SPAM global unsubscribe synchronization across all outbound outreach engines'
    ],
    seniorStaffExpectation: 'Architects multi-vendor waterfalls that maximize verified contact coverage (>85%) while slashing external API costs by >40% through intelligent hierarchical caching.',
    failureModePrevented: 'Burning $15,000 in third-party API credits within hours due to looping enrichment on unqualified spam leads.',
    interviewDrillScenario: 'Targeting 200,000 cold enterprise accounts: candidate routes free domain validation first, calling premium mobile phone enrichment only for qualified VP/C-suite titles.',
    typicalQuestions: [
      'Walk me through the architecture of a 4-tier waterfall enrichment system in Clay/n8n.',
      'How do you prevent duplicate API charges when multiple SDRs import the same lead simultaneously?'
    ]
  },
  {
    id: 'ai',
    pillarName: 'Applied AI & Workflows',
    shortTitle: 'Applied AI & LLM Pipelines',
    comparisonTradeoff: 'LLM Natural Language Extraction vs. Strict Deterministic Schemas',
    technicalMetrics: [
      'Structured JSON Enforcement: Zod / JSON Schema validation on all LLM outputs before CRM record mutation',
      'Inference Latency Budget: Choosing Flash/mini models (<1.2s P95) for real-time lead routing vs Pro models for offline audits',
      'Prompt Engineering & Few-Shot Calibration: Eliminating hallucinations on company sizing and buying intent signals',
      'Human-in-the-Loop (HITL) Fallbacks: Triggering RevOps manual review queues for confidence scores <80%'
    ],
    seniorStaffExpectation: 'Builds fault-tolerant generative AI workflows with strict guardrails, never allowing raw unvalidated LLM output to mutate production CRM records directly.',
    failureModePrevented: 'AI hallucinations creating bogus company names or setting pipeline ARR to $0 due to unparsed JSON.',
    interviewDrillScenario: 'An inbound web inquiry contains conversational text. The candidate uses Gemini Flash with JSON mode to extract budget, timing, and authority, with regex fallback if the LLM API fails.',
    typicalQuestions: [
      'How do you guarantee that an LLM agent never writes hallucinated data into your Salesforce fields?',
      'How do you optimize LLM token cost when processing 10,000 inbound emails daily?'
    ]
  },
  {
    id: 'comm',
    pillarName: 'Executive Communication',
    shortTitle: 'Revenue Impact & SLAs',
    comparisonTradeoff: 'Technical Architecture Purity vs. Business Speed-to-Lead & ARR Impact',
    technicalMetrics: [
      'Speed-to-Lead Optimization: Connecting system latency reduction to 21x higher sales qualification rates (<5 min response)',
      'Revenue Leakage Quantification: Framing technical fixes in terms of pipeline ARR recovered per quarter',
      'Cross-Functional Stakeholder Defense: Explaining trade-offs between Sales agility and RevOps data integrity',
      'Blameless Post-Mortem Rigor: Documenting root cause, business impact, and P0 preventative engineering'
    ],
    seniorStaffExpectation: 'Communicates technical decisions through the lens of revenue metrics (CAC payback, speed-to-lead, win rates), winning cross-functional buy-in from Sales and Engineering leadership.',
    failureModePrevented: 'Engineers spending 6 months building an over-engineered microservice while sales reps churn due to manual lead entry.',
    interviewDrillScenario: 'The VP of Sales demands immediate instant lead routing. The candidate persuasively defends a 30-second deduplication buffer by showing that duplicate calls burn 15% of sales capacity.',
    typicalQuestions: [
      'How do you explain the business ROI of refactoring your CRM integration to a non-technical CRO?',
      'How do you handle a disagreement between Sales asking for speed and RevOps demanding strict data validation?'
    ]
  }
];

// Tooltip declared outside component to comply with React Hooks best practices
const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-lg text-xs space-y-1.5 z-50">
        <div className="font-bold text-stone-900 border-b border-stone-100 pb-1">
          {data.pillarName}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-3 text-[11px]">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-bold text-stone-900">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const BenchmarkRadar: React.FC<BenchmarkRadarProps> = ({ completedAnswers }) => {
  const [showCommunityBenchmark, setShowCommunityBenchmark] = useState<boolean>(true);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all-cohorts');
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyPillarDetail | null>(null);

  // Helper to find competency by pillar name
  const getCompetencyByName = (name: string) => {
    return BENCHMARK_COMPETENCY_DETAILS.find(
      (c) => c.pillarName.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(c.pillarName.toLowerCase())
    ) || BENCHMARK_COMPETENCY_DETAILS[0];
  };

  // Calculate aggregate metrics across answers
  const total = completedAnswers.length;
  const avgOverall = total > 0 
    ? Math.round(completedAnswers.reduce((acc, c) => acc + (c.evaluation?.overallScore || 0), 0) / total) 
    : 0;

  const avgArchitecture = total > 0
    ? Math.round(completedAnswers.reduce((acc, c) => acc + (c.evaluation?.pillarScores?.technicalArchitecture || 0), 0) / total)
    : 0;

  const avgCrm = total > 0
    ? Math.round(completedAnswers.reduce((acc, c) => acc + (c.evaluation?.pillarScores?.crmAndDataHygiene || 0), 0) / total)
    : 0;

  const avgGtm = total > 0
    ? Math.round(completedAnswers.reduce((acc, c) => acc + (c.evaluation?.pillarScores?.gtmBusinessContext || 0), 0) / total)
    : 0;

  const avgStack = total > 0
    ? Math.round(completedAnswers.reduce((acc, c) => acc + (c.evaluation?.pillarScores?.modernStackTooling || 0), 0) / total)
    : 0;

  const avgComm = total > 0
    ? Math.round(completedAnswers.reduce((acc, c) => acc + (c.evaluation?.pillarScores?.communicationAndClarity || 0), 0) / total)
    : 0;

  const activeCohort = 
    COMMUNITY_BENCHMARK_PROFILES.find((c) => c.id === selectedCohortId) || 
    COMMUNITY_BENCHMARK_PROFILES[0];

  const levelPercentile = avgOverall >= 90 ? 95 : avgOverall >= 80 ? 88 : avgOverall >= 70 ? 72 : 55;

  // Radar Data structure
  const radarChartData = [
    {
      pillarName: 'System Architecture',
      candidateScore: total > 0 ? avgArchitecture : 60,
      communityAvg: activeCohort.pillars.technicalArchitecture,
      seniorTarget: 86,
    },
    {
      pillarName: 'CRM & Data Hygiene',
      candidateScore: total > 0 ? avgCrm : 65,
      communityAvg: activeCohort.pillars.crmAndDataHygiene,
      seniorTarget: 84,
    },
    {
      pillarName: 'Enrichment & Modern Stack',
      candidateScore: total > 0 ? avgStack : 70,
      communityAvg: activeCohort.pillars.modernStackTooling,
      seniorTarget: 82,
    },
    {
      pillarName: 'Applied AI & Workflows',
      candidateScore: total > 0 ? avgGtm : 62,
      communityAvg: activeCohort.pillars.gtmBusinessContext,
      seniorTarget: 80,
    },
    {
      pillarName: 'Executive Communication',
      candidateScore: total > 0 ? avgComm : 75,
      communityAvg: activeCohort.pillars.communicationAndClarity,
      seniorTarget: 85,
    },
  ];

  return (
    <div className="space-y-6 text-stone-800">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                <Award className="h-3.5 w-3.5 text-indigo-600" />
                Industry Benchmarks
              </span>
              <span className="text-xs text-stone-500">
                Calibrated against Tier-1 GTM Hiring Standards
              </span>
            </div>
            <h2 className="text-base font-bold text-stone-900 mt-1">
              GTM Systems Engineering Industry Benchmark & Evaluation Rubric
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Calibrated against hiring standards at high-growth B2B SaaS, enterprise RevOps, and AI-native tech organizations.
            </p>
          </div>

          {total > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-3.5 border border-indigo-200">
              <div className="text-right">
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Candidate Readiness</div>
                <div className="text-base font-bold text-indigo-950">Top {100 - levelPercentile}%</div>
              </div>
              <div className="h-7 w-px bg-indigo-200" />
              <div className="text-right">
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Avg Score</div>
                <div className="text-base font-bold text-indigo-950">{avgOverall}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Community Benchmarking Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCommunityBenchmark(!showCommunityBenchmark)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                showCommunityBenchmark 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Community Benchmarking Overlay: {showCommunityBenchmark ? 'ON' : 'OFF'}</span>
            </button>

            <span className="text-xs text-stone-500 hidden md:inline">
              Anonymous aggregate data across 1,420+ GTM Engineer evaluations
            </span>
          </div>

          {showCommunityBenchmark && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
                Peer Cohort:
              </span>
              {COMMUNITY_BENCHMARK_PROFILES.map((cohort) => (
                <button
                  key={cohort.id}
                  onClick={() => setSelectedCohortId(cohort.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    selectedCohortId === cohort.id
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cohort.name.split(' (')[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Radar Chart & Benchmark Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (6 cols): Radar Chart */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-600" />
                5-Pillar Competency Radar
              </h3>
              <p className="text-[11px] text-stone-500">
                {showCommunityBenchmark 
                  ? `Overlaid against ${activeCohort.name}` 
                  : 'Candidate performance vs Senior Industry Target'}
              </p>
            </div>
            {total === 0 && (
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                Sample Preview Mode
              </span>
            )}
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData} outerRadius="75%">
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis 
                  dataKey="pillarName" 
                  tick={{ fill: '#44403c', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                  onClick={(e: any) => {
                    if (e && e.value) {
                      setSelectedCompetency(getCompetencyByName(e.value));
                    }
                  }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#a8a29e', fontSize: 9 }} 
                />
                
                {/* Candidate Score */}
                <Radar
                  name="Your Score"
                  dataKey="candidateScore"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />

                {/* Community Benchmark Overlay */}
                {showCommunityBenchmark && (
                  <Radar
                    name={`${activeCohort.name.split(' (')[0]} Avg`}
                    dataKey="communityAvg"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.2}
                  />
                )}

                {/* Senior Target */}
                <Radar
                  name="Senior Target (85%)"
                  dataKey="seniorTarget"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                />

                <Tooltip content={<CustomRadarTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Radar Nodes with 'i' Tooltip Buttons */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-indigo-600" />
                <span>Competency Nodes (Click &apos;i&apos; for measurement specs):</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
                API latency vs. CRM schema
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {BENCHMARK_COMPETENCY_DETAILS.map((comp) => {
                const isSelected = selectedCompetency?.id === comp.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedCompetency(comp)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition shadow-2xs group ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-bold ring-1 ring-indigo-500/30'
                        : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100/90 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="truncate pr-1.5">
                      <div className="text-xs font-bold text-stone-900 truncate flex items-center gap-1">
                        <span>{comp.pillarName}</span>
                      </div>
                      <div className="text-[10px] text-stone-500 truncate group-hover:text-stone-700">
                        {comp.comparisonTradeoff}
                      </div>
                    </div>
                    <span 
                      className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold group-hover:bg-indigo-600 group-hover:text-white transition shadow-2xs"
                      title={`Inspect ${comp.pillarName} technical criteria`}
                    >
                      i
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right (6 cols): Cohort Breakdown & Community Insights */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              {activeCohort.name} Peer Distribution
            </h3>
            <span className="text-[11px] font-mono text-stone-500">
              Sample: {activeCohort.sampleSize}
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {activeCohort.description}
          </p>

          {/* Percentile Stats */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200">
              <div className="text-[10px] font-bold text-stone-500 uppercase">Median (P50)</div>
              <div className="text-base font-bold text-stone-900 mt-0.5">{activeCohort.percentile50}%</div>
            </div>
            <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200">
              <div className="text-[10px] font-bold text-stone-500 uppercase">Top 25% (P75)</div>
              <div className="text-base font-bold text-indigo-600 mt-0.5">{activeCohort.percentile75}%</div>
            </div>
            <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200">
              <div className="text-[10px] font-bold text-stone-500 uppercase">Top 10% Staff (P90)</div>
              <div className="text-base font-bold text-emerald-600 mt-0.5">{activeCohort.percentile90}%</div>
            </div>
          </div>

          {/* Common Candidate Pitfalls */}
          <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Top Community Blind Spots in this Cohort:</span>
            </div>
            <ul className="space-y-1 text-xs text-amber-950">
              {activeCohort.commonPitfalls.map((pitfall, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{pitfall}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Candidate Aggregate Performance vs Industry Baseline */}
      {total > 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            Detailed 5-Pillar Score Trajectory vs Peer Community
          </h3>

          <div className="space-y-3 pt-1">
            {[
              { name: 'System Architecture & Webhook Scale', score: avgArchitecture, community: activeCohort.pillars.technicalArchitecture, senior: 86 },
              { name: 'CRM Architecture & Data Hygiene (Salesforce/HubSpot)', score: avgCrm, community: activeCohort.pillars.crmAndDataHygiene, senior: 84 },
              { name: 'Enrichment & Modern Outbound (Clay/Apollo)', score: avgStack, community: activeCohort.pillars.modernStackTooling, senior: 82 },
              { name: 'Applied AI & Workflow Automation', score: avgGtm, community: activeCohort.pillars.gtmBusinessContext, senior: 80 },
              { name: 'Executive Revenue Context & Communication', score: avgComm, community: activeCohort.pillars.communicationAndClarity, senior: 85 },
            ].map((item, idx) => {
              const delta = item.score - item.community;
              return (
                <div key={idx} className="rounded-xl bg-stone-50 p-4 border border-stone-200 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold text-stone-900">{item.name}</div>
                    <div className="flex items-center gap-3">
                      {showCommunityBenchmark && (
                        <span className="text-stone-500 font-medium text-[11px]">
                          Community Avg: <span className="text-amber-700 font-semibold">{item.community}%</span>
                          <span className={`ml-1 font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ({delta >= 0 ? `+${delta}%` : `${delta}%`})
                          </span>
                        </span>
                      )}
                      <span className="text-stone-500 font-medium text-[11px]">
                        Senior Target: <span className="text-stone-700 font-semibold">{item.senior}%</span>
                      </span>
                      <span className={`font-bold text-xs ${item.score >= item.senior ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        Your Score: {item.score}%
                      </span>
                    </div>
                  </div>

                  {/* Comparative Multi-Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden flex relative">
                      <div
                        className={`h-full transition-all ${item.score >= item.senior ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                      <span>Junior (50%)</span>
                      <span>Community Median ({item.community}%)</span>
                      <span>Senior Target ({item.senior}%+)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center space-y-2">
          <BarChart3 className="h-8 w-8 text-stone-300 mx-auto" />
          <div className="text-xs font-bold text-stone-800">No Drill Data Recorded Yet</div>
          <p className="text-[11px] text-stone-500">
            Complete questions in the Practice Simulator to generate your personalized 5-pillar competency radar.
          </p>
        </div>
      )}

      {/* 5 Core Competency Rubrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GTM_COMPETENCY_RUBRIC.map((rubric, idx) => (
          <div key={idx} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-stone-900 text-sm">
                {rubric.name}
              </h4>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 border border-stone-200">
                Weight: {rubric.weight}%
              </span>
            </div>

            <p className="text-stone-600 leading-relaxed text-[11px]">
              {rubric.description}
            </p>

            <div className="rounded-xl bg-stone-50 p-3 border border-stone-200 space-y-1">
              <div className="font-bold text-stone-800 uppercase text-[10px] tracking-wider">
                Senior / Staff Bar:
              </div>
              <p className="text-stone-700 text-[11px] leading-snug">
                {rubric.industryExpectationSenior}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Competency Deep-Dive Explanatory Tooltip Modal */}
      {selectedCompetency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5 text-stone-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                    <Info className="h-3.5 w-3.5 text-indigo-600" />
                    Technical Competency Specification
                  </span>
                  <span className="text-xs text-stone-400">Benchmark Radar Node</span>
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {selectedCompetency.pillarName}
                </h3>
                <div className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" />
                  <span>Measured Trade-Off: {selectedCompetency.comparisonTradeoff}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompetency(null)}
                className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
              {/* Technical Metrics Measured */}
              <div className="space-y-2">
                <div className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                  Specific Technical Competencies Measured:
                </div>
                <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 space-y-2">
                  {selectedCompetency.technicalMetrics.map((metric, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-stone-800 leading-relaxed">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Senior / Staff Bar & Failure Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 space-y-1.5">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-indigo-600" />
                    <span>Senior / Staff Hiring Expectation:</span>
                  </div>
                  <p className="text-indigo-950/90 leading-relaxed text-[11px]">
                    {selectedCompetency.seniorStaffExpectation}
                  </p>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 space-y-1.5">
                  <div className="font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <span>Critical System Failure Mode Avoided:</span>
                  </div>
                  <p className="text-rose-950/90 leading-relaxed text-[11px]">
                    {selectedCompetency.failureModePrevented}
                  </p>
                </div>
              </div>

              {/* Realistic Interview Scenario */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-1.5">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>Realistic Interview Drill Evaluation Scenario:</span>
                </div>
                <p className="text-amber-950/90 leading-relaxed text-[11px]">
                  {selectedCompetency.interviewDrillScenario}
                </p>
              </div>

              {/* Sample Questions */}
              <div className="space-y-1.5">
                <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Common Calibration Questions:
                </div>
                <div className="space-y-1 text-stone-600 text-[11px]">
                  {selectedCompetency.typicalQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-stone-400">•</span>
                      <span className="italic">&ldquo;{q}&rdquo;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <div className="flex items-center gap-1.5">
                {BENCHMARK_COMPETENCY_DETAILS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCompetency(c)}
                    className={`h-2 rounded-full transition-all ${
                      c.id === selectedCompetency.id ? 'w-6 bg-indigo-600' : 'w-2 bg-stone-200 hover:bg-stone-300'
                    }`}
                    title={c.pillarName}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const currentIndex = BENCHMARK_COMPETENCY_DETAILS.findIndex(c => c.id === selectedCompetency.id);
                    const nextIndex = (currentIndex + 1) % BENCHMARK_COMPETENCY_DETAILS.length;
                    setSelectedCompetency(BENCHMARK_COMPETENCY_DETAILS[nextIndex]);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition shadow-2xs"
                >
                  <span>Next Competency</span>
                  <ChevronRight className="h-3.5 w-3.5 text-stone-500" />
                </button>

                <button
                  onClick={() => setSelectedCompetency(null)}
                  className="rounded-xl bg-stone-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition shadow-2xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
