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
  Info
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
                  tick={{ fill: '#44403c', fontSize: 10, fontWeight: 600 }} 
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
    </div>
  );
};
