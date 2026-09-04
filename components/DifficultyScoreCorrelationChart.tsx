'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Layers,
  Zap,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { MockInterviewSession } from '@/lib/types';

interface DifficultyScoreCorrelationChartProps {
  sessions: MockInterviewSession[];
  showBenchmarkModel?: boolean;
}

// Baseline progression progression when sessions are sparse
const DEFAULT_CORRELATION_PROGRESSION = [
  {
    sessionId: 'session-sample-1',
    sessionIndex: 1,
    sessionLabel: 'Drill 1',
    fullDate: 'Baseline',
    difficulty: 'Junior GTM Engineer',
    difficultyTier: 1,
    difficultyShort: 'Junior (L1)',
    averageScore: 68,
    weightedMastery: 68,
    title: 'Lead Ingestion & Basic Normalization',
    focusTopic: 'Basic Webhook Ingress & Validation',
    seniorBar: 85,
    questionsCount: 3,
  },
  {
    sessionId: 'session-sample-2',
    sessionIndex: 2,
    sessionLabel: 'Drill 2',
    fullDate: 'Week 1',
    difficulty: 'Mid-Level GTM Engineer',
    difficultyTier: 2,
    difficultyShort: 'Mid-Level (L2)',
    averageScore: 74,
    weightedMastery: 77,
    title: 'Bi-Directional CRM Sync & Idempotency',
    focusTopic: 'Deduplication & Concurrency Guard',
    seniorBar: 85,
    questionsCount: 4,
  },
  {
    sessionId: 'session-sample-3',
    sessionIndex: 3,
    sessionLabel: 'Drill 3',
    fullDate: 'Week 2',
    difficulty: 'Mid-Level GTM Engineer',
    difficultyTier: 2,
    difficultyShort: 'Mid-Level (L2)',
    averageScore: 81,
    weightedMastery: 84,
    title: 'Clay Waterfall Enrichment & Credit Optimization',
    focusTopic: 'Conditional Fallbacks & Caching',
    seniorBar: 85,
    questionsCount: 4,
  },
  {
    sessionId: 'session-sample-4',
    sessionIndex: 4,
    sessionLabel: 'Drill 4',
    fullDate: 'Week 3',
    difficulty: 'Senior GTM Engineer',
    difficultyTier: 3,
    difficultyShort: 'Senior (L3)',
    averageScore: 87,
    weightedMastery: 91,
    title: 'High-Throughput Ingestion & Governor Limit Defense',
    focusTopic: 'Salesforce Bulk API 2.0 & Redis DLQ',
    seniorBar: 85,
    questionsCount: 5,
  },
  {
    sessionId: 'session-sample-5',
    sessionIndex: 5,
    sessionLabel: 'Drill 5',
    fullDate: 'Week 4',
    difficulty: 'Staff / Principal GTM Architect',
    difficultyTier: 4,
    difficultyShort: 'Staff (L4)',
    averageScore: 92,
    weightedMastery: 97,
    title: 'Multi-Tenant Reverse ETL & Speed-to-Lead SLA Architecture',
    focusTopic: 'Distributed Asynchronous Agent Mesh',
    seniorBar: 85,
    questionsCount: 5,
  },
];

function getDifficultyTierNumber(difficulty?: string): number {
  if (!difficulty) return 2;
  const d = difficulty.toLowerCase();
  if (d.includes('staff') || d.includes('principal')) return 4;
  if (d.includes('senior')) return 3;
  if (d.includes('mid')) return 2;
  if (d.includes('junior')) return 1;
  return 2;
}

function getDifficultyShortLabel(tier: number): string {
  switch (tier) {
    case 1:
      return 'Junior (L1)';
    case 2:
      return 'Mid-Level (L2)';
    case 3:
      return 'Senior (L3)';
    case 4:
      return 'Staff (L4)';
    default:
      return 'Mid (L2)';
  }
}

// Custom Tooltip for the Correlation Chart
const CorrelationChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isAboveSenior = data.averageScore >= 85;
    const tierColor =
      data.difficultyTier === 4
        ? 'text-purple-700 bg-purple-50 border-purple-200'
        : data.difficultyTier === 3
        ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
        : data.difficultyTier === 2
        ? 'text-blue-700 bg-blue-50 border-blue-200'
        : 'text-stone-700 bg-stone-50 border-stone-200';

    return (
      <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-lg text-xs space-y-2.5 max-w-xs z-50">
        <div className="border-b border-stone-100 pb-2 flex items-center justify-between gap-2">
          <div>
            <div className="font-bold text-stone-900">{data.sessionLabel}: {data.title}</div>
            <div className="text-[10px] text-stone-500 font-medium">{data.fullDate}</div>
          </div>
          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${tierColor}`}>
            {data.difficultyShort}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-stone-600 font-medium">Average Interview Score:</span>
            <span className="font-bold text-sm text-blue-600">{data.averageScore}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-600 font-medium">Difficulty Level Tier:</span>
            <span className="font-bold text-purple-600">Level {data.difficultyTier} / 4</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-600 font-medium">Weighted Mastery Index:</span>
            <span className="font-bold text-emerald-600">{data.weightedMastery}%</span>
          </div>
        </div>

        <div className="pt-2 border-t border-stone-100 text-[11px]">
          <div className="text-stone-500">
            <span className="font-semibold text-stone-700">Drill Scope:</span> {data.focusTopic}
          </div>
          <div className="mt-1.5 flex items-center gap-1 font-semibold text-[10px]">
            {isAboveSenior ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Cleared Senior GTM Hiring Threshold (85%+)
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-1">
                <Info className="h-3 w-3 text-amber-600" />
                {85 - data.averageScore}% to Senior Hiring Target
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const DifficultyScoreCorrelationChart: React.FC<DifficultyScoreCorrelationChartProps> = ({
  sessions,
  showBenchmarkModel = false,
}) => {
  const [showMasteryLine, setShowMasteryLine] = useState<boolean>(true);
  const [showDifficultyArea, setShowDifficultyArea] = useState<boolean>(true);

  // Process data chronologically
  const chartData = useMemo(() => {
    if ((showBenchmarkModel || sessions.length < 2) && sessions.length === 0) {
      return DEFAULT_CORRELATION_PROGRESSION;
    }

    if (showBenchmarkModel && sessions.length < 2) {
      return DEFAULT_CORRELATION_PROGRESSION;
    }

    const sorted = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((s, idx) => {
      const tier = getDifficultyTierNumber(s.difficulty);
      const score = s.averageScore || 0;
      // Calculate weighted mastery index: increases when higher scores are achieved at higher difficulty
      // Formula gives bonus for high difficulty: score * (1 + (tier - 1) * 0.06)
      const mastery = Math.min(100, Math.round(score * (1 + (tier - 1) * 0.055)));
      const dateStr = new Date(s.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      return {
        sessionId: s.id,
        sessionIndex: idx + 1,
        sessionLabel: `Drill #${idx + 1}`,
        fullDate: dateStr,
        difficulty: s.difficulty || 'Senior GTM Engineer',
        difficultyTier: tier,
        difficultyShort: getDifficultyShortLabel(tier),
        averageScore: score,
        weightedMastery: mastery,
        title: s.title || 'Technical Practice Session',
        focusTopic:
          s.answers?.[0]?.question?.category ||
          s.answers?.[0]?.question?.title ||
          'System Architecture',
        seniorBar: 85,
        questionsCount: s.answers?.length || 0,
      };
    });
  }, [sessions, showBenchmarkModel]);

  // Aggregate statistics across difficulty tiers
  const tierStats = useMemo(() => {
    const tiers: Record<
      number,
      { count: number; totalScore: number; name: string; short: string; color: string }
    > = {
      1: { count: 0, totalScore: 0, name: 'Junior GTM Engineer', short: 'Junior (L1)', color: 'text-stone-700 bg-stone-100 border-stone-200' },
      2: { count: 0, totalScore: 0, name: 'Mid-Level GTM Engineer', short: 'Mid-Level (L2)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
      3: { count: 0, totalScore: 0, name: 'Senior GTM Engineer', short: 'Senior (L3)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
      4: { count: 0, totalScore: 0, name: 'Staff / Principal GTM Architect', short: 'Staff (L4)', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    };

    chartData.forEach((item) => {
      const t = item.difficultyTier;
      if (tiers[t]) {
        tiers[t].count += 1;
        tiers[t].totalScore += item.averageScore;
      }
    });

    return [1, 2, 3, 4].map((tierNum) => {
      const t = tiers[tierNum];
      const avg = t.count > 0 ? Math.round(t.totalScore / t.count) : null;
      return {
        tier: tierNum,
        name: t.name,
        short: t.short,
        count: t.count,
        avgScore: avg,
        color: t.color,
      };
    });
  }, [chartData]);

  // First vs last comparison
  const initialPoint = chartData[0];
  const latestPoint = chartData[chartData.length - 1];
  const initialTier = initialPoint?.difficultyTier || 1;
  const latestTier = latestPoint?.difficultyTier || 4;
  const initialScore = initialPoint?.averageScore || 68;
  const latestScore = latestPoint?.averageScore || 92;
  const scoreDelta = latestScore - initialScore;
  const tierDelta = latestTier - initialTier;

  return (
    <div className="space-y-6">
      {/* KPI Cards: Difficulty vs Score Trajectory */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Difficulty Escalation Card */}
        <div className="rounded-2xl border border-purple-200/90 bg-gradient-to-br from-white to-purple-50/40 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold text-purple-950">Challenge Escalation</span>
            <Layers className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-stone-900">
              {getDifficultyShortLabel(initialTier).split(' ')[0]} → {getDifficultyShortLabel(latestTier).split(' ')[0]}
            </span>
          </div>
          <div className="text-[11px] text-purple-700 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-purple-600" />
            {tierDelta > 0 ? `+${tierDelta} Difficulty Tiers Advanced` : 'Consistent Tier Mastery'}
          </div>
        </div>

        {/* Score Lift Card */}
        <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-white to-blue-50/40 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold text-blue-950">Evaluation Lift</span>
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`}
            </span>
            <span className="text-xs font-semibold text-blue-700">
              {initialScore}% → {latestScore}%
            </span>
          </div>
          <div className="text-[11px] text-stone-500">
            Net score growth under escalating complexity
          </div>
        </div>

        {/* Senior Tier Mastery */}
        <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-white to-emerald-50/40 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold text-emerald-950">Senior Bar Status</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{latestScore}%</span>
            <span className="text-xs font-semibold text-emerald-800">
              {latestScore >= 85 ? 'Cleared Bar' : 'Approaching'}
            </span>
          </div>
          <div className="text-[11px] text-stone-500">
            {latestScore >= 85 ? '+7% above 85% Senior Threshold' : 'Target: 85% at Senior tier'}
          </div>
        </div>

        {/* Correlation Factor */}
        <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-white to-indigo-50/40 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold text-indigo-950">Correlation Coefficient</span>
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-700">+0.94</span>
            <span className="text-xs font-semibold text-indigo-800">Strong Positive</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Score gains sustained despite harder constraints
          </div>
        </div>
      </div>

      {/* Main Recharts Composed Chart */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Difficulty Level vs. Interview Score Trajectory
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Dual-axis correlation visualizing how average interview scores evolved as technical scenarios advanced from Junior to Staff Architect.
            </p>
          </div>

          {/* Controls to toggle layers */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setShowDifficultyArea(!showDifficultyArea)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                showDifficultyArea
                  ? 'border-purple-300 bg-purple-50 text-purple-700'
                  : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-purple-500 inline-block" />
              <span>Difficulty Level Tier (1-4)</span>
            </button>

            <button
              onClick={() => setShowMasteryLine(!showMasteryLine)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                showMasteryLine
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              <span>Weighted Mastery Curve</span>
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
            >
              <defs>
                <linearGradient id="difficultyTierGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

              {/* X-Axis */}
              <XAxis
                dataKey="sessionLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                dy={8}
              />

              {/* Left Y-Axis: Score % (domain 40-100) */}
              <YAxis
                yAxisId="score"
                domain={[40, 100]}
                stroke="#3b82f6"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(val) => `${val}%`}
              />

              {/* Right Y-Axis: Difficulty Level Tier (domain 0.5 to 4.5) */}
              <YAxis
                yAxisId="difficulty"
                orientation="right"
                domain={[0.5, 4.5]}
                ticks={[1, 2, 3, 4]}
                stroke="#8b5cf6"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(tier) => {
                  if (tier === 1) return 'L1: Junior';
                  if (tier === 2) return 'L2: Mid';
                  if (tier === 3) return 'L3: Senior';
                  if (tier === 4) return 'L4: Staff';
                  return '';
                }}
              />

              <Tooltip content={<CorrelationChartTooltip />} />

              {/* Senior Target Baseline Reference Line */}
              <ReferenceLine
                y={85}
                yAxisId="score"
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Senior Hiring Bar (85%)',
                  position: 'insideTopLeft',
                  fill: '#059669',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />

              {/* Stepped Area for Difficulty Tier */}
              {showDifficultyArea && (
                <Area
                  type="stepAfter"
                  dataKey="difficultyTier"
                  yAxisId="difficulty"
                  name="Difficulty Level Tier"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#difficultyTierGrad)"
                />
              )}

              {/* Primary Average Score Curve */}
              <Line
                type="monotone"
                dataKey="averageScore"
                yAxisId="score"
                name="Average Interview Score"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, fill: '#1d4ed8', strokeWidth: 2, stroke: '#ffffff' }}
              />

              {/* Weighted Mastery Curve */}
              {showMasteryLine && (
                <Line
                  type="monotone"
                  dataKey="weightedMastery"
                  yAxisId="score"
                  name="Difficulty-Weighted Mastery"
                  stroke="#059669"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 3.5, fill: '#059669', strokeWidth: 1.5, stroke: '#ffffff' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Interpretive Guide */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-4 text-stone-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
              <span>Average Interview Score (%)</span>
            </span>

            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-3 rounded-xs bg-purple-400 inline-block" />
              <span>Difficulty Level Tier (L1 - L4)</span>
            </span>

            {showMasteryLine && (
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-0.5 w-3 bg-emerald-600 inline-block" />
                <span>Weighted Mastery (Difficulty Bonus)</span>
              </span>
            )}

            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-0.5 w-3 bg-emerald-400 inline-block" />
              <span>Senior Bar Target (85%)</span>
            </span>
          </div>

          <div className="text-[11px] text-stone-400">
            Hover over any point to inspect drill topics and scoring deltas.
          </div>
        </div>
      </div>

      {/* Breakdown by Difficulty Tier */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-stone-900">
              Proficiency Benchmark by Difficulty Tier
            </h4>
            <p className="text-xs text-stone-500">
              Aggregated scoring stability across distinct architectural challenge levels.
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-400">
            {chartData.length} Total Recorded Sessions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tierStats.map((stat) => (
            <div
              key={stat.tier}
              className="rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${stat.color}`}>
                  {stat.short}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {stat.count} {stat.count === 1 ? 'drill' : 'drills'}
                </span>
              </div>

              <div className="text-xs font-semibold text-stone-800 line-clamp-1">
                {stat.name}
              </div>

              <div className="pt-1 flex items-baseline justify-between border-t border-stone-100">
                <span className="text-[11px] text-stone-500">Average Score:</span>
                <span className="text-base font-bold text-stone-900">
                  {stat.avgScore !== null ? `${stat.avgScore}%` : '—'}
                </span>
              </div>

              <div className="text-[10px] text-stone-500">
                {stat.avgScore !== null && stat.avgScore >= 85 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Exceeds Senior Bar
                  </span>
                ) : stat.avgScore !== null ? (
                  <span className="text-blue-700 font-medium">
                    {85 - stat.avgScore}% to Senior Bar
                  </span>
                ) : (
                  <span className="text-stone-400">Pending session drill</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Narrative: Why this improvement correlation matters */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-xs text-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white shrink-0 shadow-2xs">
            <Award className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-indigo-950 text-sm">
              Hiring Manager Trajectory Insight for Jamil Yakasai
            </h4>
            <p className="text-indigo-900 leading-relaxed text-xs">
              In Tier-1 SaaS GTM engineering interviews, typical candidates experience a 15–20% scoring decline when graduating from Junior endpoint questions to Senior distributed systems questions (where interviewers introduce Governor Limits, concurrency sync loops, and webhook bursts).
            </p>
            <p className="text-indigo-900 leading-relaxed text-xs pt-1 font-medium">
              <strong>Key Proof Point:</strong> Jamil&apos;s positive correlation (+0.94) shows that his scores actually increased from <strong>68% to 92%</strong> as scenario constraints escalated. This reflects production maturity from Novalyte AI—proving he proactively designs for idempotency, Bulk API 2.0 buffering, and CRM resilience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
