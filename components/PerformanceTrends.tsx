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
  Legend, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Zap, 
  BarChart3, 
  Calendar, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Sparkles,
  Info,
  ChevronRight,
  Eye,
  PlayCircle
} from 'lucide-react';
import { MockInterviewSession, CandidateAnswerRecord } from '@/lib/types';
import { ConfidenceHeatmap } from './ConfidenceHeatmap';
import { CareerMilestones } from './CareerMilestones';
import { StepTooltip } from '@/components/StepTooltip';
import { DifficultyScoreCorrelationChart } from './DifficultyScoreCorrelationChart';
import { HistoricalScoreImprovementChart } from './HistoricalScoreImprovementChart';

interface PerformanceTrendsProps {
  sessions: MockInterviewSession[];
  completedAnswers?: CandidateAnswerRecord[];
  onNavigateToSimulator?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToScenarios?: () => void;
}

// Representative baseline progression model for comparison & preview
const BENCHMARK_PROGRESSION_DATA = [
  {
    sessionName: 'Session 1 (Baseline)',
    fullDate: 'Initial Diagnostic',
    averageScore: 68,
    technicalArchitecture: 65,
    crmAndDataHygiene: 70,
    modernStackTooling: 62,
    gtmBusinessContext: 64,
    communicationAndClarity: 74,
    difficulty: 'Junior GTM Engineer',
    questionsCount: 3
  },
  {
    sessionName: 'Session 2 (CRM Sync)',
    fullDate: 'Drill 2',
    averageScore: 74,
    technicalArchitecture: 72,
    crmAndDataHygiene: 78,
    modernStackTooling: 70,
    gtmBusinessContext: 72,
    communicationAndClarity: 78,
    difficulty: 'Mid-Level GTM Engineer',
    questionsCount: 4
  },
  {
    sessionName: 'Session 3 (Waterfall)',
    fullDate: 'Drill 3',
    averageScore: 81,
    technicalArchitecture: 80,
    crmAndDataHygiene: 82,
    modernStackTooling: 84,
    gtmBusinessContext: 78,
    communicationAndClarity: 82,
    difficulty: 'Mid-Level GTM Engineer',
    questionsCount: 4
  },
  {
    sessionName: 'Session 4 (AI GTM)',
    fullDate: 'Drill 4',
    averageScore: 87,
    technicalArchitecture: 88,
    crmAndDataHygiene: 86,
    modernStackTooling: 89,
    gtmBusinessContext: 85,
    communicationAndClarity: 88,
    difficulty: 'Senior GTM Engineer',
    questionsCount: 5
  },
  {
    sessionName: 'Session 5 (Staff System)',
    fullDate: 'Latest Milestone',
    averageScore: 92,
    technicalArchitecture: 94,
    crmAndDataHygiene: 91,
    modernStackTooling: 93,
    gtmBusinessContext: 90,
    communicationAndClarity: 92,
    difficulty: 'Staff / Principal GTM Architect',
    questionsCount: 5
  }
];

// Custom Chart Tooltip declared at top level
const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-lg text-xs space-y-2 max-w-xs z-50">
        <div className="border-b border-stone-100 pb-1.5 flex items-center justify-between gap-2">
          <div className="font-bold text-stone-900">{data.sessionName}</div>
          <span className="text-[10px] text-stone-500 font-medium">{data.fullDate}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-stone-600 font-medium">Overall Average Score:</span>
          <span className="font-bold text-sm text-indigo-600">{data.averageScore}%</span>
        </div>

        <div className="space-y-1 pt-1 border-t border-stone-100 text-[11px]">
          <div className="flex justify-between text-stone-600">
            <span>Technical Architecture:</span>
            <span className="font-semibold text-emerald-700">{data.technicalArchitecture}%</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>CRM & Data Hygiene:</span>
            <span className="font-semibold text-blue-700">{data.crmAndDataHygiene}%</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Clay & Modern Tooling:</span>
            <span className="font-semibold text-amber-700">{data.modernStackTooling}%</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Applied AI & Workflows:</span>
            <span className="font-semibold text-purple-700">{data.gtmBusinessContext}%</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Executive Communication:</span>
            <span className="font-semibold text-rose-700">{data.communicationAndClarity}%</span>
          </div>
        </div>

        <div className="text-[10px] text-stone-400 pt-1 flex items-center justify-between">
          <span>Difficulty: {data.difficulty}</span>
          <span>{data.questionsCount} questions</span>
        </div>
      </div>
    );
  }
  return null;
};

export const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({
  sessions,
  completedAnswers = [],
  onNavigateToSimulator,
  onNavigateToHistory,
  onNavigateToScenarios
}) => {
  const [analyticsView, setAnalyticsView] = useState<'velocity' | 'confidence' | 'milestones' | 'difficulty-correlation' | 'improvement'>('velocity');
  const [showBenchmarkModel, setShowBenchmarkModel] = useState<boolean>(sessions.length < 2);
  const [activePillars, setActivePillars] = useState<{
    architecture: boolean;
    crm: boolean;
    tooling: boolean;
    business: boolean;
    communication: boolean;
  }>({
    architecture: true,
    crm: true,
    tooling: false,
    business: false,
    communication: false,
  });

  // Prepare chart data chronologically (oldest to newest)
  const chartData = useMemo(() => {
    if (showBenchmarkModel && sessions.length < 2) {
      return BENCHMARK_PROGRESSION_DATA;
    }

    if (sessions.length === 0) {
      return BENCHMARK_PROGRESSION_DATA;
    }

    // Sort chronologically
    const sorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sorted.map((session, index) => {
      const totalAnswers = session.answers?.length || 0;
      const dateObj = new Date(session.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Calculate individual pillar averages for this session
      let avgArch = 0;
      let avgCrm = 0;
      let avgTooling = 0;
      let avgBusiness = 0;
      let avgComm = 0;

      if (totalAnswers > 0) {
        avgArch = Math.round(session.answers.reduce((acc, a) => acc + (a.evaluation?.pillarScores?.technicalArchitecture || 0), 0) / totalAnswers);
        avgCrm = Math.round(session.answers.reduce((acc, a) => acc + (a.evaluation?.pillarScores?.crmAndDataHygiene || 0), 0) / totalAnswers);
        avgTooling = Math.round(session.answers.reduce((acc, a) => acc + (a.evaluation?.pillarScores?.modernStackTooling || 0), 0) / totalAnswers);
        avgBusiness = Math.round(session.answers.reduce((acc, a) => acc + (a.evaluation?.pillarScores?.gtmBusinessContext || 0), 0) / totalAnswers);
        avgComm = Math.round(session.answers.reduce((acc, a) => acc + (a.evaluation?.pillarScores?.communicationAndClarity || 0), 0) / totalAnswers);
      } else {
        avgArch = session.averageScore;
        avgCrm = session.averageScore;
        avgTooling = session.averageScore;
        avgBusiness = session.averageScore;
        avgComm = session.averageScore;
      }

      return {
        sessionName: `Session #${index + 1}`,
        title: session.title,
        fullDate: formattedDate,
        averageScore: session.averageScore || 0,
        technicalArchitecture: avgArch,
        crmAndDataHygiene: avgCrm,
        modernStackTooling: avgTooling,
        gtmBusinessContext: avgBusiness,
        communicationAndClarity: avgComm,
        difficulty: session.difficulty,
        questionsCount: totalAnswers,
        id: session.id
      };
    });
  }, [sessions, showBenchmarkModel]);

  // Aggregate Metrics
  const totalSessionsCount = sessions.length;
  const isUsingMock = showBenchmarkModel && totalSessionsCount < 2;

  const currentScore = chartData.length > 0 ? chartData[chartData.length - 1].averageScore : 0;
  const firstScore = chartData.length > 0 ? chartData[0].averageScore : 0;
  const scoreDelta = currentScore - firstScore;
  const highestScore = chartData.length > 0 ? Math.max(...chartData.map((d) => d.averageScore)) : 0;
  const totalQuestionsDrilled = sessions.reduce((acc, s) => acc + (s.answers?.length || 0), 0);

  const seniorBar = 85;
  const gapToSenior = seniorBar - currentScore;

  return (
    <div className="space-y-6 text-stone-800">
      {/* Top View Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAnalyticsView('velocity')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs ${
              analyticsView === 'velocity'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>Score Velocity &amp; Progression</span>
          </button>

          <button
            onClick={() => setAnalyticsView('confidence')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs ${
              analyticsView === 'confidence'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Target className="h-3.5 w-3.5 text-indigo-400" />
            <span>Confidence vs Objective Heatmap</span>
            <span className="rounded-full bg-indigo-500/20 text-indigo-700 text-[10px] px-2 py-0.2 font-bold uppercase">
              Mindset Matrix
            </span>
          </button>

          <button
            onClick={() => setAnalyticsView('milestones')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs ${
              analyticsView === 'milestones'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span>Career Milestones &amp; Badges</span>
          </button>

          <button
            id="difficulty-correlation-tab-btn"
            onClick={() => setAnalyticsView('difficulty-correlation')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs ${
              analyticsView === 'difficulty-correlation'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-purple-400" />
            <span>Difficulty vs Score Correlation</span>
            <span className="rounded-full bg-purple-500/20 text-purple-700 text-[10px] px-2 py-0.2 font-bold uppercase">
              Trajectory
            </span>
          </button>
          <button
            id="historical-improvement-tab-btn"
            onClick={() => setAnalyticsView('improvement')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs ${
              analyticsView === 'improvement'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
            <span>Average Score Improvement Trajectory</span>
            <span className="rounded-full bg-indigo-500/20 text-indigo-700 text-[10px] px-2 py-0.2 font-bold uppercase">
              LineChart
            </span>
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium hidden md:block">
          {analyticsView === 'velocity' && 'Longitudinal pillar scoring trends'}
          {analyticsView === 'confidence' && 'Self-assessment calibration & imposter zone'}
          {analyticsView === 'milestones' && 'GTM architectural competency achievements'}
          {analyticsView === 'difficulty-correlation' && 'Difficulty level vs score correlation & mastery trajectory'}
          {analyticsView === 'improvement' && 'Chronological average score trajectory vs hiring bar baseline'}
        </div>
      </div>

      {analyticsView === 'improvement' && (
        <HistoricalScoreImprovementChart
          sessions={sessions}
          onNavigateToSimulator={onNavigateToSimulator}
          onNavigateToHistory={onNavigateToHistory}
        />
      )}

      {analyticsView === 'confidence' && (
        <ConfidenceHeatmap 
          sessions={sessions} 
          onNavigateToSimulator={onNavigateToSimulator} 
        />
      )}

      {analyticsView === 'milestones' && (
        <CareerMilestones
          sessions={sessions}
          completedAnswers={completedAnswers}
          onNavigateToSimulator={onNavigateToSimulator}
          onNavigateToScenarios={onNavigateToScenarios}
        />
      )}

      {analyticsView === 'difficulty-correlation' && (
        <DifficultyScoreCorrelationChart
          sessions={sessions}
          showBenchmarkModel={showBenchmarkModel}
        />
      )}

      {analyticsView === 'velocity' && (
        <>
          {/* Header Banner */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <StepTooltip stepNumber={5} badgeLabel="Step 5: Calibration Trends" />
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    Performance Analytics
                  </span>
                  {isUsingMock && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                      Target Trajectory Model
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-stone-900 mt-1">
                  GTM Engineering Score Velocity & Performance Trends
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Visualize your evaluation score trajectory, identify pillar velocity, and track readiness against Senior & Staff hiring bars.
                </p>
              </div>

              {totalSessionsCount >= 2 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBenchmarkModel(!showBenchmarkModel)}
                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition shadow-2xs"
                  >
                    {showBenchmarkModel ? 'Show My Real Sessions' : 'Compare with Target Model'}
                  </button>
                </div>
              )}
            </div>
          </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest Average Score */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Latest Average Score</span>
            <Award className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{currentScore}%</span>
            <span className="text-xs font-semibold text-indigo-600">
              {currentScore >= 90 ? 'Staff Tier' : currentScore >= 80 ? 'Senior Bar' : 'Mid-Level'}
            </span>
          </div>
          <div className="text-[11px] text-stone-500">
            {gapToSenior <= 0 ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Exceeds Senior baseline
              </span>
            ) : (
              <span>{gapToSenior}% to Senior Hiring Bar</span>
            )}
          </div>
        </div>

        {/* Overall Score Velocity */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Score Trajectory</span>
            <Zap className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`}
            </span>
            <span className={`text-xs font-semibold flex items-center ${scoreDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {scoreDelta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {scoreDelta >= 0 ? 'Gaining' : 'Lagging'}
            </span>
          </div>
          <div className="text-[11px] text-stone-500">
            Net change across {chartData.length} recorded sessions
          </div>
        </div>

        {/* Peak Score Achieved */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Peak Score</span>
            <Target className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{highestScore}%</span>
            <span className="text-xs font-semibold text-amber-600">Personal Best</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Highest individual evaluation
          </div>
        </div>

        {/* Total Questions Evaluated */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Drill Volume</span>
            <BarChart3 className="h-4 w-4 text-stone-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              {isUsingMock ? '21' : totalQuestionsDrilled}
            </span>
            <span className="text-xs font-semibold text-stone-600">Questions</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Across {isUsingMock ? '5' : totalSessionsCount} complete mock sessions
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Line Chart */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Score Progression Over Time
            </h3>
            <p className="text-[11px] text-stone-500">
              Tracking average percentage score and competency pillars chronologically.
            </p>
          </div>

          {/* Toggle Pillar Lines */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider mr-1">Pillars:</span>
            
            <button
              onClick={() => setActivePillars(p => ({ ...p, architecture: !p.architecture }))}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                activePillars.architecture 
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                  : 'border-stone-200 bg-stone-50 text-stone-400'
              }`}
            >
              Arch
            </button>

            <button
              onClick={() => setActivePillars(p => ({ ...p, crm: !p.crm }))}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                activePillars.crm 
                  ? 'border-blue-300 bg-blue-50 text-blue-800' 
                  : 'border-stone-200 bg-stone-50 text-stone-400'
              }`}
            >
              CRM
            </button>

            <button
              onClick={() => setActivePillars(p => ({ ...p, tooling: !p.tooling }))}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                activePillars.tooling 
                  ? 'border-amber-300 bg-amber-50 text-amber-800' 
                  : 'border-stone-200 bg-stone-50 text-stone-400'
              }`}
            >
              Clay
            </button>

            <button
              onClick={() => setActivePillars(p => ({ ...p, business: !p.business }))}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                activePillars.business 
                  ? 'border-purple-300 bg-purple-50 text-purple-800' 
                  : 'border-stone-200 bg-stone-50 text-stone-400'
              }`}
            >
              AI & Ops
            </button>

            <button
              onClick={() => setActivePillars(p => ({ ...p, communication: !p.communication }))}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                activePillars.communication 
                  ? 'border-rose-300 bg-rose-50 text-rose-800' 
                  : 'border-stone-200 bg-stone-50 text-stone-400'
              }`}
            >
              Comm
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ef" vertical={false} />
              
              <XAxis 
                dataKey="sessionName" 
                stroke="#a8a29e" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#e7e5e4' }} 
              />
              
              <YAxis 
                domain={[40, 100]} 
                stroke="#a8a29e" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#e7e5e4' }} 
                tickFormatter={(val) => `${val}%`}
              />
              
              <Tooltip content={<CustomChartTooltip />} />
              
              {/* Senior Target Baseline Reference Line */}
              <ReferenceLine 
                y={85} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ value: 'Senior Bar (85%)', position: 'insideTopRight', fill: '#059669', fontSize: 10, fontWeight: 700 }}
              />

              {/* Primary Overall Average Score Line */}
              <Line
                type="monotone"
                dataKey="averageScore"
                name="Overall Score"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, fill: '#4338ca', strokeWidth: 2, stroke: '#ffffff' }}
              />

              {/* Optional Pillar Lines */}
              {activePillars.architecture && (
                <Line
                  type="monotone"
                  dataKey="technicalArchitecture"
                  name="Technical Arch"
                  stroke="#059669"
                  strokeWidth={1.75}
                  strokeDasharray="2 2"
                  dot={{ r: 3, fill: '#059669' }}
                />
              )}

              {activePillars.crm && (
                <Line
                  type="monotone"
                  dataKey="crmAndDataHygiene"
                  name="CRM Hygiene"
                  stroke="#2563eb"
                  strokeWidth={1.75}
                  strokeDasharray="2 2"
                  dot={{ r: 3, fill: '#2563eb' }}
                />
              )}

              {activePillars.tooling && (
                <Line
                  type="monotone"
                  dataKey="modernStackTooling"
                  name="Clay / Stack"
                  stroke="#d97706"
                  strokeWidth={1.75}
                  strokeDasharray="2 2"
                  dot={{ r: 3, fill: '#d97706' }}
                />
              )}

              {activePillars.business && (
                <Line
                  type="monotone"
                  dataKey="gtmBusinessContext"
                  name="AI & GTM"
                  stroke="#9333ea"
                  strokeWidth={1.75}
                  strokeDasharray="2 2"
                  dot={{ r: 3, fill: '#9333ea' }}
                />
              )}

              {activePillars.communication && (
                <Line
                  type="monotone"
                  dataKey="communicationAndClarity"
                  name="Communication"
                  stroke="#e11d48"
                  strokeWidth={1.75}
                  strokeDasharray="2 2"
                  dot={{ r: 3, fill: '#e11d48' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-stone-100">
          <div className="flex items-center gap-4 text-stone-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 inline-block" /> Overall Avg
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-0.5 w-3 bg-emerald-500 inline-block" /> Senior Baseline (85%)
            </span>
          </div>

          <div className="text-stone-400 text-[11px]">
            Hover over any point to inspect granular 5-pillar evaluations.
          </div>
        </div>
      </div>

      {/* Difficulty vs Average Score Trend Correlation Graph */}
      <DifficultyScoreCorrelationChart
        sessions={sessions}
        showBenchmarkModel={showBenchmarkModel}
      />

      {/* Historical Milestones Breakdown */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-stone-600" />
            Session History Milestones ({chartData.length} Recorded)
          </h3>

          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View Full Reports</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-medium">
                <th className="py-2.5 px-3">Session</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Difficulty</th>
                <th className="py-2.5 px-3">Questions</th>
                <th className="py-2.5 px-3">Overall Score</th>
                <th className="py-2.5 px-3 text-right">Senior Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {chartData.map((s, idx) => (
                <tr key={idx} className="hover:bg-stone-50/80 transition">
                  <td className="py-3 px-3 font-semibold text-stone-900">
                    {s.sessionName}
                  </td>
                  <td className="py-3 px-3 text-stone-600">
                    {s.fullDate}
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                      {s.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-600">
                    {s.questionsCount} drilled
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                      s.averageScore >= 85 ? 'bg-emerald-50 text-emerald-700' : s.averageScore >= 70 ? 'bg-indigo-50 text-indigo-700' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {s.averageScore}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {s.averageScore >= 85 ? (
                      <span className="text-emerald-600 font-semibold">Ready ✓</span>
                    ) : (
                      <span className="text-stone-500">-{85 - s.averageScore}%</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practice CTA */}
      {onNavigateToSimulator && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Ready to raise your average score?
            </h4>
            <p className="text-xs text-indigo-800/80">
              Complete a 3-question drill on Senior-level Webhook Ingestion, Clay Waterfalls, or Salesforce Sync Loops.
            </p>
          </div>

          <button
            onClick={onNavigateToSimulator}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Launch Practice Drill</span>
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
};
