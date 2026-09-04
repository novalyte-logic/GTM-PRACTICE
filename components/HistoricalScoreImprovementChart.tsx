'use client';

import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Zap, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  PlayCircle,
  Database,
  Layers,
  Clock,
  RefreshCw,
  Plus
} from 'lucide-react';
import { MockInterviewSession } from '@/lib/types';

interface HistoricalScoreImprovementChartProps {
  sessions: MockInterviewSession[];
  onNavigateToSimulator?: () => void;
  onNavigateToHistory?: () => void;
  onSeedSampleSessions?: () => void;
}

// Custom Recharts Tooltip Component
const CustomImprovementTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-2xl border border-stone-200 bg-white/95 backdrop-blur-md p-4 shadow-xl text-xs space-y-2.5 min-w-[240px] z-50">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <span className="font-extrabold text-stone-900 text-sm">{data.sessionName} • {data.date}</span>
          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
            {data.difficulty}
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-stone-500 font-medium truncate max-w-[220px]" title={data.title}>
            {data.title}
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-stone-600 font-medium">Average Score:</span>
            <span className="text-lg font-extrabold text-indigo-600">{data.averageScore}%</span>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-2 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Vs Baseline (Session 1):</span>
            <span className={`font-bold flex items-center gap-0.5 ${
              data.deltaFromBaseline >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {data.deltaFromBaseline >= 0 ? `+${data.deltaFromBaseline}%` : `${data.deltaFromBaseline}%`}
            </span>
          </div>

          {data.index > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Vs Previous Session:</span>
              <span className={`font-bold ${data.deltaFromPrev >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.deltaFromPrev >= 0 ? `+${data.deltaFromPrev}%` : `${data.deltaFromPrev}%`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-stone-400 text-[10px]">
            <span>Drill Volume:</span>
            <span>{data.questionsCount} questions evaluated</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const HistoricalScoreImprovementChart: React.FC<HistoricalScoreImprovementChartProps> = ({
  sessions,
  onNavigateToSimulator,
  onNavigateToHistory,
  onSeedSampleSessions,
}) => {
  const [showTrendline, setShowTrendline] = useState<boolean>(true);
  const [filterTrack, setFilterTrack] = useState<string>('all');

  // Filter and sort sessions chronologically (oldest to newest)
  const sortedSessions = useMemo(() => {
    let list = [...sessions];
    if (filterTrack !== 'all') {
      list = list.filter((s) => s.track === filterTrack);
    }
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, filterTrack]);

  // Transform sessions into Recharts line chart data
  const chartData = useMemo(() => {
    if (sortedSessions.length === 0) return [];

    const baselineScore = sortedSessions[0].averageScore || 0;
    const n = sortedSessions.length;

    // Optional linear regression trendline calculation: y = mx + c
    let slope = 0;
    let intercept = baselineScore;
    if (n > 1) {
      const xSum = (n * (n - 1)) / 2;
      const xxSum = (n * (n - 1) * (2 * n - 1)) / 6;
      let ySum = 0;
      let xySum = 0;
      sortedSessions.forEach((s, i) => {
        const score = s.averageScore || 0;
        ySum += score;
        xySum += i * score;
      });
      const denominator = n * xxSum - xSum * xSum;
      if (denominator !== 0) {
        slope = (n * xySum - xSum * ySum) / denominator;
        intercept = (ySum - slope * xSum) / n;
      }
    }

    return sortedSessions.map((session, index) => {
      const dateObj = new Date(session.date);
      const formattedDate = isNaN(dateObj.getTime())
        ? 'Session Date'
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const currentScore = session.averageScore || 0;
      const prevScore = index > 0 ? (sortedSessions[index - 1].averageScore || 0) : currentScore;
      const deltaFromBaseline = currentScore - baselineScore;
      const deltaFromPrev = currentScore - prevScore;
      const trendlineValue = Math.round(intercept + slope * index);

      return {
        index: index + 1,
        sessionName: `S#${index + 1}`,
        fullLabel: `Session ${index + 1} (${formattedDate})`,
        title: session.title || `Interview Drill #${index + 1}`,
        date: formattedDate,
        fullIsoDate: session.date,
        averageScore: currentScore,
        deltaFromBaseline,
        deltaFromPrev,
        trendline: Math.min(100, Math.max(0, trendlineValue)),
        questionsCount: session.answers?.length || 0,
        difficulty: session.difficulty || 'Senior GTM Engineer',
        track: session.track || 'system-architecture',
        id: session.id,
      };
    });
  }, [sortedSessions]);

  // Aggregate Metrics
  const totalSessionsCount = sortedSessions.length;
  const baselineScore = chartData.length > 0 ? chartData[0].averageScore : 0;
  const currentScore = chartData.length > 0 ? chartData[chartData.length - 1].averageScore : 0;
  const netImprovement = currentScore - baselineScore;
  const highestScore = chartData.length > 0 ? Math.max(...chartData.map((d) => d.averageScore)) : 0;
  const avgGainPerSession = totalSessionsCount > 1 
    ? (netImprovement / (totalSessionsCount - 1)).toFixed(1)
    : '0.0';

  const seniorHiringBar = 85;
  const isSeniorReady = currentScore >= seniorHiringBar;
  const gapToSenior = seniorHiringBar - currentScore;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                <span>Historical Score Velocity</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700 border border-stone-200">
                <Database className="h-3 w-3 text-stone-500" />
                <span>Stored in localStorage</span>
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                {totalSessionsCount} Saved Sessions
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Average Score Improvement Trajectory
            </h2>
            <p className="text-xs text-stone-500 max-w-2xl">
              Chronological progression of your evaluation scores across historical interview simulations. 
              Tracks net gains from your initial baseline diagnostic toward the Senior &amp; Staff hiring bar.
            </p>
          </div>

          {/* Quick Track Filter */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-1 text-xs">
              <button
                onClick={() => setFilterTrack('all')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  filterTrack === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Tracks
              </button>
              <button
                onClick={() => setFilterTrack('system-architecture')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  filterTrack === 'system-architecture'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Architecture
              </button>
              <button
                onClick={() => setFilterTrack('applied-ai-gtm')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  filterTrack === 'applied-ai-gtm'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                AI &amp; Workflows
              </button>
            </div>
          </div>
        </div>

        {/* KPI Metric Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* Baseline Diagnostic Score */}
          <div className="rounded-xl border border-stone-200/90 bg-stone-50/50 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Baseline Score</span>
              <Clock className="h-3.5 w-3.5 text-stone-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-stone-900">{baselineScore}%</span>
              <span className="text-[11px] font-semibold text-stone-500">Session 1</span>
            </div>
            <div className="text-[11px] text-stone-500 truncate">
              {chartData.length > 0 ? chartData[0].date : 'Initial'} diagnostic
            </div>
          </div>

          {/* Latest Average Score */}
          <div className="rounded-xl border border-stone-200/90 bg-stone-50/50 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Latest Average</span>
              <Award className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-stone-900">{currentScore}%</span>
              <span className="text-[11px] font-semibold text-indigo-600">
                {currentScore >= 90 ? 'Staff Tier' : currentScore >= 85 ? 'Senior Ready' : 'Developing'}
              </span>
            </div>
            <div className="text-[11px] text-stone-500">
              {isSeniorReady ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Senior bar cleared (+{currentScore - seniorHiringBar}%)
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  {gapToSenior}% to Senior Hiring Bar (85%)
                </span>
              )}
            </div>
          </div>

          {/* Net Score Improvement */}
          <div className="rounded-xl border border-stone-200/90 bg-stone-50/50 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Net Improvement</span>
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${netImprovement >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {netImprovement >= 0 ? `+${netImprovement}%` : `${netImprovement}%`}
              </span>
              <span className={`text-xs font-bold flex items-center ${netImprovement >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {netImprovement >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {netImprovement >= 0 ? 'Gaining' : 'Lagging'}
              </span>
            </div>
            <div className="text-[11px] text-stone-500">
              Overall delta from baseline
            </div>
          </div>

          {/* Peak Score Achieved */}
          <div className="rounded-xl border border-stone-200/90 bg-stone-50/50 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Average Velocity</span>
              <Target className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-stone-900">
                {Number(avgGainPerSession) >= 0 ? `+${avgGainPerSession}%` : `${avgGainPerSession}%`}
              </span>
              <span className="text-[11px] font-semibold text-purple-600">/ session</span>
            </div>
            <div className="text-[11px] text-stone-500">
              Personal best: <span className="font-bold text-stone-900">{highestScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <span>Historical Session Average Score Progression</span>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                LineChart (recharts)
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Each node represents an interview session completed and stored in local storage.
            </p>
          </div>

          {/* Trendline Toggle */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-stone-600 hover:text-stone-900">
              <input
                type="checkbox"
                checked={showTrendline}
                onChange={(e) => setShowTrendline(e.target.checked)}
                className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-[11px]">Show Projection Trendline</span>
            </label>
          </div>
        </div>

        {/* Empty State */}
        {chartData.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">No interview sessions found</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Drill your first practice session or seed representative baseline sessions to visualize your improvement trend.
            </p>
            {onNavigateToSimulator && (
              <button
                onClick={onNavigateToSimulator}
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 transition"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Start First Interview Drill</span>
              </button>
            )}
          </div>
        ) : (
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 25, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                
                <XAxis 
                  dataKey="sessionName" 
                  stroke="#a1a1aa" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#e4e4e7' }} 
                  dy={6}
                />
                
                <YAxis 
                  domain={[40, 100]} 
                  stroke="#a1a1aa" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#e4e4e7' }} 
                  tickFormatter={(val) => `${val}%`}
                  dx={-4}
                />
                
                <Tooltip content={<CustomImprovementTooltip />} />
                
                {/* Initial Baseline Reference Line */}
                <ReferenceLine 
                  y={baselineScore} 
                  stroke="#f59e0b" 
                  strokeDasharray="3 3" 
                  strokeWidth={1.2}
                  label={{ 
                    value: `Baseline (${baselineScore}%)`, 
                    position: 'insideBottomLeft', 
                    fill: '#d97706', 
                    fontSize: 10, 
                    fontWeight: 600 
                  }}
                />

                {/* Senior Hiring Bar Reference Line */}
                <ReferenceLine 
                  y={85} 
                  stroke="#10b981" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{ 
                    value: 'Senior Bar (85%)', 
                    position: 'insideTopRight', 
                    fill: '#059669', 
                    fontSize: 10, 
                    fontWeight: 700 
                  }}
                />

                {/* Staff Architect Target Bar Reference Line */}
                <ReferenceLine 
                  y={90} 
                  stroke="#8b5cf6" 
                  strokeDasharray="3 3" 
                  strokeWidth={1.2}
                  label={{ 
                    value: 'Staff Bar (90%)', 
                    position: 'insideTopRight', 
                    fill: '#7c3aed', 
                    fontSize: 10, 
                    fontWeight: 600 
                  }}
                />

                {/* Projection Trendline */}
                {showTrendline && (
                  <Line
                    type="linear"
                    dataKey="trendline"
                    name="Linear Trendline"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={false}
                  />
                )}

                {/* Main Average Score Improvement Line */}
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  name="Average Score"
                  stroke="#4f46e5"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8, fill: '#3730a3', strokeWidth: 2.5, stroke: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart Legend and Footnote */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-4 text-stone-600">
            <span className="flex items-center gap-1.5 font-bold text-stone-900">
              <span className="h-3 w-3 rounded-full bg-indigo-600 inline-block shadow-xs" /> Average Score (%)
            </span>
            {showTrendline && (
              <span className="flex items-center gap-1.5 font-medium text-stone-500">
                <span className="h-0.5 w-3 bg-slate-400 inline-block border-t border-dashed border-slate-400" /> Linear Trendline
              </span>
            )}
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="h-0.5 w-3 bg-emerald-500 inline-block" /> Senior Bar (85%)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-amber-700">
              <span className="h-0.5 w-3 bg-amber-500 inline-block" /> Baseline ({baselineScore}%)
            </span>
          </div>

          <div className="text-stone-400 text-[11px]">
            Hover over any session node for detailed question count and delta comparisons.
          </div>
        </div>
      </div>

      {/* Historical Sessions Breakdown Table */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-stone-600" />
              <span>Historical Session Score Log</span>
              <span className="rounded-full bg-stone-100 px-2 py-0.2 text-[10px] font-bold text-stone-600">
                {chartData.length} records
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              Chronological breakdown of individual sessions and their score improvement relative to your starting baseline.
            </p>
          </div>

          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
            >
              <span>View Full Reports</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50/50">
                <th className="py-2.5 px-3 rounded-l-lg">Session</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Track &amp; Difficulty</th>
                <th className="py-2.5 px-3">Volume</th>
                <th className="py-2.5 px-3">Average Score</th>
                <th className="py-2.5 px-3">Vs Baseline</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Senior Bar Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {chartData.map((session) => (
                <tr key={session.id || session.index} className="hover:bg-stone-50/70 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-stone-900">{session.sessionName}</div>
                    <div className="text-[11px] text-stone-500 truncate max-w-[180px]" title={session.title}>
                      {session.title}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                    {session.date}
                  </td>

                  <td className="py-3 px-3">
                    <span className="inline-block rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                      {session.difficulty}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                    {session.questionsCount} drilled
                  </td>

                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-0.5 rounded-lg text-xs ${
                      session.averageScore >= 85 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : session.averageScore >= 75 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                    }`}>
                      {session.averageScore}%
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {session.index === 1 ? (
                      <span className="text-[11px] font-semibold text-stone-400">Baseline</span>
                    ) : (
                      <span className={`font-bold text-xs flex items-center gap-0.5 ${
                        session.deltaFromBaseline >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {session.deltaFromBaseline >= 0 ? `+${session.deltaFromBaseline}%` : `${session.deltaFromBaseline}%`}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    {session.averageScore >= seniorHiringBar ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Ready ✓</span>
                      </span>
                    ) : (
                      <span className="text-stone-500 font-medium text-xs">
                        -{seniorHiringBar - session.averageScore}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practice Drill CTA */}
      {onNavigateToSimulator && (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-stone-50 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Continue raising your historical average</span>
            </h4>
            <p className="text-xs text-indigo-900/80">
              Run another timed 30 or 60-minute interview simulation to push your trajectory toward the Staff Architect tier.
            </p>
          </div>

          <button
            onClick={onNavigateToSimulator}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Launch Next Simulation</span>
          </button>
        </div>
      )}
    </div>
  );
};
