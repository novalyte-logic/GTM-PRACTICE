'use client';

import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Cell, 
  ReferenceLine,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  HeartHandshake, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Eye, 
  Activity, 
  Zap, 
  ShieldCheck,
  Smile,
  Compass
} from 'lucide-react';
import { MockInterviewSession } from '@/lib/types';

interface ConfidenceHeatmapProps {
  sessions: MockInterviewSession[];
  onNavigateToSimulator?: () => void;
}

// Sample benchmark data if user hasn't recorded reflections yet
const SAMPLE_CONFIDENCE_POINTS = [
  {
    id: 's1',
    sessionName: 'Session 1 (Inbound Webhooks)',
    date: 'Drill 1',
    perceivedConfidence: 55,
    objectiveScore: 68,
    emotionalState: 'anxious-hesitant',
    quadrant: 'Underconfident Master',
    technicalDepth5: 3,
    executivePresence5: 2.5,
    edgeCaseDefense5: 3,
    delta: -13,
  },
  {
    id: 's2',
    sessionName: 'Session 2 (CRM Sync Hygiene)',
    date: 'Drill 2',
    perceivedConfidence: 70,
    objectiveScore: 78,
    emotionalState: 'calm-composed',
    quadrant: 'Calibrated Peak Performer',
    technicalDepth5: 3.8,
    executivePresence5: 3.5,
    edgeCaseDefense5: 3.5,
    delta: -8,
  },
  {
    id: 's3',
    sessionName: 'Session 3 (Waterfall Enrichment)',
    date: 'Drill 3',
    perceivedConfidence: 85,
    objectiveScore: 82,
    emotionalState: 'in-flow',
    quadrant: 'Calibrated Peak Performer',
    technicalDepth5: 4.2,
    executivePresence5: 4.0,
    edgeCaseDefense5: 4.1,
    delta: +3,
  },
  {
    id: 's4',
    sessionName: 'Session 4 (AI GTM Workflows)',
    date: 'Drill 4',
    perceivedConfidence: 90,
    objectiveScore: 88,
    emotionalState: 'decisive-commanding',
    quadrant: 'Calibrated Peak Performer',
    technicalDepth5: 4.5,
    executivePresence5: 4.6,
    edgeCaseDefense5: 4.4,
    delta: +2,
  },
  {
    id: 's5',
    sessionName: 'Session 5 (Staff System Architecture)',
    date: 'Drill 5',
    perceivedConfidence: 88,
    objectiveScore: 94,
    emotionalState: 'calm-composed',
    quadrant: 'Calibrated Peak Performer',
    technicalDepth5: 4.8,
    executivePresence5: 4.7,
    edgeCaseDefense5: 4.6,
    delta: -6,
  }
];

export const ConfidenceHeatmap: React.FC<ConfidenceHeatmapProps> = ({ sessions }) => {
  const [viewMode, setViewMode] = useState<'scatter-quadrant' | 'trajectory-line'>('scatter-quadrant');
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Compute points from user's actual sessions or fallback to sample
  const dataPoints = useMemo(() => {
    const sessionsWithData = sessions.filter((s) => s.confidenceAssessment || s.emotionalState);
    if (sessionsWithData.length >= 2) {
      return sessionsWithData.map((s, idx) => {
        const perceived = s.confidenceAssessment ? s.confidenceAssessment.overallScore10 * 10 : 70;
        const objective = s.averageScore || 75;
        const delta = perceived - objective;

        let quadrant = 'Growth Foundation';
        if (perceived >= 70 && objective >= 70) quadrant = 'Calibrated Peak Performer';
        else if (perceived < 70 && objective >= 70) quadrant = 'Underconfident Master';
        else if (perceived >= 70 && objective < 70) quadrant = 'Blind Spot Hazard';

        return {
          id: s.id,
          sessionName: s.title || `Session ${idx + 1}`,
          date: s.date ? new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Drill ${idx + 1}`,
          perceivedConfidence: perceived,
          objectiveScore: objective,
          emotionalState: s.emotionalState || 'calm-composed',
          quadrant,
          technicalDepth5: s.confidenceAssessment?.technicalDepth5 || 3.5,
          executivePresence5: s.confidenceAssessment?.executivePresence5 || 3.5,
          edgeCaseDefense5: s.confidenceAssessment?.edgeCaseDefense5 || 3.5,
          delta,
        };
      });
    }
    return SAMPLE_CONFIDENCE_POINTS;
  }, [sessions]);

  // Aggregate Calibration Metrics
  const metrics = useMemo(() => {
    if (dataPoints.length === 0) return { avgDelta: 0, accuracy: 100, imposterCount: 0, overconfidentCount: 0, peakCount: 0 };
    
    let totalAbsDelta = 0;
    let imposter = 0;
    let overconfident = 0;
    let peak = 0;

    dataPoints.forEach((p) => {
      totalAbsDelta += Math.abs(p.delta);
      if (p.delta <= -12) imposter++;
      else if (p.delta >= 12) overconfident++;
      else peak++;
    });

    const avgDelta = Math.round(totalAbsDelta / dataPoints.length);
    const accuracy = Math.max(0, 100 - avgDelta * 3);

    return {
      avgDelta,
      accuracy,
      imposterCount: imposter,
      overconfidentCount: overconfident,
      peakCount: peak,
    };
  }, [dataPoints]);

  const getColorByQuadrant = (quadrant: string) => {
    switch (quadrant) {
      case 'Calibrated Peak Performer':
        return '#10b981'; // emerald
      case 'Underconfident Master':
        return '#6366f1'; // indigo (imposter)
      case 'Blind Spot Hazard':
        return '#f43f5e'; // rose
      default:
        return '#f59e0b'; // amber
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-xs font-bold text-indigo-900">
              <HeartHandshake className="h-3.5 w-3.5 text-indigo-600" />
              <span>Mindset &amp; Executive Presence Analytics</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Confidence vs. Objective Performance Heatmap
            </h2>
            <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">
              Maps your perceived confidence score (self-assessed in post-session reflections) against objective AI scoring to detect imposter syndrome, eliminate blind spots, and tune interview calibration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-stone-200 bg-stone-50 p-1 text-xs font-semibold">
              <button
                onClick={() => setViewMode('scatter-quadrant')}
                className={`rounded-lg px-3 py-1.5 transition ${
                  viewMode === 'scatter-quadrant' ? 'bg-white text-stone-900 shadow-2xs border border-stone-200' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                4-Quadrant Matrix
              </button>
              <button
                onClick={() => setViewMode('trajectory-line')}
                className={`rounded-lg px-3 py-1.5 transition ${
                  viewMode === 'trajectory-line' ? 'bg-white text-stone-900 shadow-2xs border border-stone-200' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Calibration Trajectory
              </button>
            </div>
          </div>
        </div>

        {/* 4 Summary Calibration Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/80 space-y-0.5">
            <div className="text-[10px] text-stone-500 font-bold uppercase">Calibration Accuracy</div>
            <div className="text-lg font-bold text-stone-900">{metrics.accuracy}%</div>
            <p className="text-[10px] text-stone-500">Alignment between feel &amp; output</p>
          </div>

          <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-200/80 space-y-0.5">
            <div className="text-[10px] text-emerald-800 font-bold uppercase">Calibrated Sessions</div>
            <div className="text-lg font-bold text-emerald-700">{metrics.peakCount}</div>
            <p className="text-[10px] text-emerald-700">Optimal high-performance zone</p>
          </div>

          <div className="rounded-xl bg-indigo-50/70 p-3 border border-indigo-200/80 space-y-0.5">
            <div className="text-[10px] text-indigo-800 font-bold uppercase">Imposter Zone (Delta &lt; -10)</div>
            <div className="text-lg font-bold text-indigo-700">{metrics.imposterCount}</div>
            <p className="text-[10px] text-indigo-700">Scored higher than you felt</p>
          </div>

          <div className="rounded-xl bg-rose-50/70 p-3 border border-rose-200/80 space-y-0.5">
            <div className="text-[10px] text-rose-800 font-bold uppercase">Blind Spot Risk</div>
            <div className="text-lg font-bold text-rose-700">{metrics.overconfidentCount}</div>
            <p className="text-[10px] text-rose-700">Overconfidence vs edge cases</p>
          </div>
        </div>
      </div>

      {/* Main Chart Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chart Container */}
        <div className="lg:col-span-8 rounded-2xl border border-stone-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-stone-900">
                {viewMode === 'scatter-quadrant' ? 'Perceived Confidence vs Objective Score Scatter' : 'Trajectory Over Time'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {viewMode === 'scatter-quadrant' 
                  ? 'Horizontal Axis: Perceived Confidence (0-100) • Vertical Axis: Objective Score (0-100)'
                  : 'Track how your calibration delta converges as you practice more sessions.'
                }
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Calibrated Peak</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-indigo-700">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span>Imposter Zone</span>
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'scatter-quadrant' ? (
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    dataKey="perceivedConfidence" 
                    name="Perceived Confidence" 
                    unit="%" 
                    domain={[40, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="objectiveScore" 
                    name="Objective AI Score" 
                    unit="%" 
                    domain={[40, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <ZAxis range={[100, 200]} />
                  <ReferenceLine x={70} stroke="#cbd5e1" strokeDasharray="4 4" label={{ value: 'Confidence Threshold (70%)', position: 'top', fill: '#94a3b8', fontSize: 10 }} />
                  <ReferenceLine y={70} stroke="#cbd5e1" strokeDasharray="4 4" label={{ value: 'Passing Score (70%)', position: 'right', fill: '#94a3b8', fontSize: 10 }} />
                  
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-lg text-xs space-y-1">
                            <div className="font-bold text-stone-900">{data.sessionName}</div>
                            <div className="text-[11px] text-stone-500">{data.date}</div>
                            <div className="pt-1 text-[11px] space-y-0.5">
                              <div className="flex justify-between gap-4">
                                <span className="text-stone-500">Perceived Confidence:</span>
                                <span className="font-bold text-indigo-700">{data.perceivedConfidence}%</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-stone-500">Objective Score:</span>
                                <span className="font-bold text-emerald-700">{data.objectiveScore}%</span>
                              </div>
                              <div className="flex justify-between gap-4 border-t border-stone-100 pt-1 font-semibold">
                                <span>Calibration Delta:</span>
                                <span className={data.delta >= 0 ? 'text-amber-600' : 'text-indigo-600'}>
                                  {data.delta > 0 ? `+${data.delta}%` : `${data.delta}%`}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    data={dataPoints} 
                    onClick={(entry) => setSelectedPoint(entry)}
                  >
                    {dataPoints.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getColorByQuadrant(entry.quadrant)} 
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              ) : (
                <LineChart data={dataPoints} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-lg text-xs space-y-1">
                            <div className="font-bold text-stone-900">{label}</div>
                            {payload.map((p, i) => (
                              <div key={i} className="flex justify-between gap-4 text-[11px]">
                                <span style={{ color: p.color }}>{p.name}:</span>
                                <span className="font-bold">{p.value}%</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Line 
                    type="monotone" 
                    dataKey="perceivedConfidence" 
                    name="Perceived Confidence (Self)" 
                    stroke="#6366f1" 
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="objectiveScore" 
                    name="Objective AI Score" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
            <span>💡 Pro-tip: Aim to have your perceived confidence fall within ±5% of your objective AI score.</span>
            <span className="font-semibold text-stone-700">{dataPoints.length} sessions plotted</span>
          </div>
        </div>

        {/* Right: Quadrant Explanations & Selected Point Details */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Quadrant Diagnostics
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-1">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span>Calibrated Peak Performer</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-snug">
                  High perceived confidence paired with high objective score. You accurately assess your edge case defense.
                </p>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 space-y-1">
                <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  <span>Underconfident Master (Imposter Zone)</span>
                </div>
                <p className="text-[11px] text-indigo-900 leading-snug">
                  You felt hesitant or second-guessed yourself, but your architectural code &amp; logic was top-tier. Boost your executive tone!
                </p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 space-y-1">
                <div className="font-bold text-rose-950 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-600" />
                  <span>Blind Spot Hazard (Overconfidence)</span>
                </div>
                <p className="text-[11px] text-rose-900 leading-snug">
                  Felt confident, but missed critical Salesforce governor limits or webhook timeouts. Focus on failure recovery.
                </p>
              </div>
            </div>
          </div>

          {/* Selected Session Deep-Dive */}
          {selectedPoint && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2.5 text-xs animate-in fade-in">
              <div className="font-bold text-stone-900 flex items-center justify-between">
                <span>{selectedPoint.sessionName}</span>
                <span className="text-[10px] text-stone-500">{selectedPoint.date}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white p-2 rounded-lg border border-stone-200">
                  <div className="text-[9px] text-stone-400 font-bold uppercase">Perceived</div>
                  <div className="font-bold text-indigo-700">{selectedPoint.perceivedConfidence}%</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-stone-200">
                  <div className="text-[9px] text-stone-400 font-bold uppercase">Objective</div>
                  <div className="font-bold text-emerald-700">{selectedPoint.objectiveScore}%</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-stone-200">
                  <div className="text-[9px] text-stone-400 font-bold uppercase">Delta</div>
                  <div className="font-bold text-amber-700">{selectedPoint.delta > 0 ? `+${selectedPoint.delta}%` : `${selectedPoint.delta}%`}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
