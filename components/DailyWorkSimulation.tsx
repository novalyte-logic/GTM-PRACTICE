'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  GripVertical, 
  Play, 
  Award, 
  Sparkles, 
  RotateCcw, 
  ShieldAlert, 
  Flame, 
  Zap, 
  TrendingUp, 
  BarChart2, 
  FileText, 
  ListOrdered,
  Layers,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface DailyGTMTask {
  id: string;
  title: string;
  category: 'Incident & Outage' | 'Architecture & Performance' | 'Cross-Functional & RevOps' | 'Cost & Optimization';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  description: string;
  systemsInvolved: string[];
  impactIfDelayed: string;
  idealPriority: number; // 1 = top urgency, 8 = lowest
  staffRationale: string;
}

const INITIAL_GTM_TASKS: DailyGTMTask[] = [
  {
    id: 'task-1-stripe-webhook',
    title: 'Stripe Webhook Retry Storm & Idempotency Lock Contention',
    category: 'Incident & Outage',
    severity: 'Critical',
    estimatedHours: 1.5,
    description: 'Stripe is retrying 4,000 failed invoice.paid webhooks due to a downstream 504 gateway timeout. Multiple worker threads are creating duplicate subscription records in Salesforce without Redis distributed locking.',
    systemsInvolved: ['Stripe', 'Redis', 'Salesforce CRM', 'AWS Lambda'],
    impactIfDelayed: 'Immediate financial data corruption, double-counted ARR in executive dashboards, and duplicate customer invoice emails.',
    idealPriority: 1,
    staffRationale: 'P0 Critical: Production revenue duplication and race conditions must be halted immediately by enforcing atomic Redis idempotency keys.'
  },
  {
    id: 'task-2-salesforce-soql',
    title: 'Salesforce SOQL 101 Governor Limit Crash in Lead Routing Trigger',
    category: 'Incident & Outage',
    severity: 'Critical',
    estimatedHours: 2.0,
    description: 'Inbound marketing webinar leads are failing with System.LimitException: Too many SOQL queries: 101 because a newly deployed Apex trigger contains a SELECT query inside a for loop.',
    systemsInvolved: ['Salesforce Apex', 'HubSpot MAP', 'Chili Piper'],
    impactIfDelayed: 'Inbound demo requests and webinar leads are silently dropped or backlogged, missing the 5-minute SDR contact window SLA.',
    idealPriority: 2,
    staffRationale: 'P0/P1 High: Speed-to-lead drops dramatically when routing crashes. Bulkifying the SOQL queries into a single Set/Map pattern restores lead flow.'
  },
  {
    id: 'task-3-speed-to-lead',
    title: 'Data Pipeline Latency & P95 Speed-to-Lead Degradation',
    category: 'Architecture & Performance',
    severity: 'High',
    estimatedHours: 2.5,
    description: 'Product-Led Growth (PQL) sync latency from Segment event stream to Salesforce has degraded from 45 seconds to 18 minutes during peak European business hours.',
    systemsInvolved: ['Segment', 'Redis Queue', 'Node.js Workers', 'Salesforce REST API'],
    impactIfDelayed: 'High-intent product signups go cold before sales reps receive Slack notifications, lowering opportunity conversion by 35%.',
    idealPriority: 3,
    staffRationale: 'P1: Autoscale consumer worker concurrency and implement a dedicated high-priority queue for Enterprise workspace signups.'
  },
  {
    id: 'task-4-reverse-etl-conflict',
    title: 'Reverse ETL Record Lock Conflict (Snowflake &rarr; Salesforce)',
    category: 'Architecture & Performance',
    severity: 'High',
    estimatedHours: 1.5,
    description: 'Census/Hightouch hourly sync is throwing UNABLE_TO_LOCK_ROW errors because the batch sync runs while Account Executives are actively editing Opportunity deal stages.',
    systemsInvolved: ['Snowflake', 'Census Reverse ETL', 'Salesforce CRM'],
    impactIfDelayed: 'Account records fail to update with fresh product usage data, and human reps experience saving errors in the CRM UI.',
    idealPriority: 4,
    staffRationale: 'P2: Switch from full-table batch sync to primary key diffing, schedule heavy updates outside sales rep working hours, and enable field-level write exclusion.'
  },
  {
    id: 'task-5-clay-waterfall-cost',
    title: 'Clay Waterfall Enrichment Credit Burn & Match Rate Optimization',
    category: 'Cost & Optimization',
    severity: 'Medium',
    estimatedHours: 2.0,
    description: 'Marketing spent $4,200 in ZoomInfo credits in 48 hours because un-cached leads are bypassing the internal Postgres cache and hitting expensive premium endpoints first.',
    systemsInvolved: ['Clay', 'Apollo API', 'ZoomInfo API', 'PostgreSQL Cache'],
    impactIfDelayed: 'Wasted $15k+ monthly API credit budget with minimal marginal increase in email deliverability.',
    idealPriority: 5,
    staffRationale: 'P2: Enforce a strict waterfall ladder (Postgres Cache -> Apollo at $0.02 -> ZoomInfo at $0.50 only if email is unverified) with monthly budget caps.'
  },
  {
    id: 'task-6-cross-functional-sync',
    title: 'Cross-Functional GTM SLA Sync with RevOps & VP of Sales',
    category: 'Cross-Functional & RevOps',
    severity: 'Medium',
    estimatedHours: 1.0,
    description: 'Bi-weekly strategic sync with Sales Leadership to review Q3 Lead-to-Opportunity conversion metrics, territory routing exceptions, and new AI SDR tooling rollout.',
    systemsInvolved: ['Sales Leadership', 'RevOps', 'Product Management'],
    impactIfDelayed: 'Misalignment between sales leadership expectations and engineering roadmap delivery.',
    idealPriority: 6,
    staffRationale: 'P3: Essential for stakeholder trust and strategic alignment, but must never supersede an ongoing active revenue-dropping production outage.'
  },
  {
    id: 'task-7-api-audit',
    title: 'Bi-Annual 24-Hour API Call & Webhook Integration Audit',
    category: 'Architecture & Performance',
    severity: 'Low',
    estimatedHours: 3.0,
    description: 'Routine audit of all external connected apps, OAuth refresh tokens, and deprecated API version endpoints (Salesforce API v45 retirement deprecation).',
    systemsInvolved: ['Salesforce Org', 'HubSpot API', 'Zapier', 'Custom Integrations'],
    impactIfDelayed: 'Technical debt accumulation, though no immediate failure will occur this week.',
    idealPriority: 7,
    staffRationale: 'P3/P4: Important maintenance task to schedule in sprint backlog or dedicated engineering maintenance windows.'
  }
];

export interface PrioritizationAnalysis {
  score: number;
  overallTier: 'Staff GTM Architect (Mastery)' | 'Senior GTM Engineer (Proficient)' | 'Associate Engineer (Needs Calibration)';
  reliabilityScore: number;
  velocityScore: number;
  revenueRiskScore: number;
  criticalOutageHandledFirst: boolean;
  breakdown: string[];
  staffRecommendations: string[];
}

export const DailyWorkSimulation: React.FC = () => {
  const [tasks, setTasks] = useState<DailyGTMTask[]>(INITIAL_GTM_TASKS);
  const [analysisReport, setAnalysisReport] = useState<PrioritizationAnalysis | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const moveTask = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= tasks.length) return;
    const updated = [...tasks];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setTasks(updated);
    setAnalysisReport(null); // invalidate previous report
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    moveTask(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  const handleResetToDefault = () => {
    setTasks(INITIAL_GTM_TASKS);
    setAnalysisReport(null);
  };

  const handleApplyIdealOrder = () => {
    const sorted = [...INITIAL_GTM_TASKS].sort((a, b) => a.idealPriority - b.idealPriority);
    setTasks(sorted);
    setAnalysisReport(null);
  };

  const handleRunExecutionSimulation = () => {
    let penalty = 0;
    const breakdown: string[] = [];

    // Check if the top 2 tasks are the Critical production blockers (Stripe or Salesforce SOQL)
    const firstTask = tasks[0];
    const secondTask = tasks[1];
    const criticalOutageHandledFirst = 
      (firstTask.id === 'task-1-stripe-webhook' || firstTask.id === 'task-2-salesforce-soql') &&
      (secondTask.id === 'task-1-stripe-webhook' || secondTask.id === 'task-2-salesforce-soql');

    if (criticalOutageHandledFirst) {
      breakdown.push('✅ Correctly prioritized active revenue outages (Stripe Webhook Storm & Salesforce SOQL Crash) before routine roadmap or meeting tasks.');
    } else {
      penalty += 35;
      breakdown.push('⚠️ High Revenue Risk: Critical production outages (Stripe duplication or SOQL crashes) were placed behind non-emergency tasks, risking dropped leads and data corruption.');
    }

    // Check position of Cross-Functional meeting vs emergencies
    const syncIndex = tasks.findIndex((t) => t.id === 'task-6-cross-functional-sync');
    if (syncIndex === 0 || syncIndex === 1) {
      penalty += 20;
      breakdown.push('⚠️ GTM Velocity Tradeoff: Attending a strategic sync meeting while production webhook pipelines are crashing results in silent data loss.');
    } else {
      breakdown.push('✅ Scheduled stakeholder syncs appropriately after active production fires were stabilized.');
    }

    // Check API Audit position
    const auditIndex = tasks.findIndex((t) => t.id === 'task-7-api-audit');
    if (auditIndex < 3) {
      penalty += 15;
      breakdown.push('⚠️ Prioritization Inefficiency: Routine API deprecation audits were scheduled ahead of urgent PQL speed-to-lead latency optimizations.');
    } else {
      breakdown.push('✅ Placed routine maintenance and technical debt audits in the lower backlog queue.');
    }

    // Measure overall Kendall tau / rank distance
    let rankDistance = 0;
    tasks.forEach((t, currentRank) => {
      const idealRank = t.idealPriority - 1;
      rankDistance += Math.abs(currentRank - idealRank);
    });

    const calculatedScore = Math.max(30, Math.min(100, Math.round(100 - penalty - (rankDistance * 2))));
    
    let overallTier: PrioritizationAnalysis['overallTier'] = 'Staff GTM Architect (Mastery)';
    if (calculatedScore < 70) {
      overallTier = 'Associate Engineer (Needs Calibration)';
    } else if (calculatedScore < 88) {
      overallTier = 'Senior GTM Engineer (Proficient)';
    }

    const reliabilityScore = criticalOutageHandledFirst ? 95 : 50;
    const velocityScore = Math.max(45, 92 - Math.round(rankDistance * 2.5));
    const revenueRiskScore = criticalOutageHandledFirst ? 94 : 40;

    const staffRecommendations = [
      'Rule of Production Outages: Always triage live data corruption (Stripe duplicates) and lead-drop bugs (Apex SOQL) within 15 minutes before opening IDE for roadmap features.',
      'Decouple Speed-to-Lead: When P95 latency exceeds 5 minutes, provision autoscaling worker queues rather than manually batch-syncing in Salesforce.',
      'Protect Stakeholder Trust: Proactively update the VP of Sales in Slack before attending meetings so they know production triage is actively underway.'
    ];

    const report: PrioritizationAnalysis = {
      score: calculatedScore,
      overallTier,
      reliabilityScore,
      velocityScore,
      revenueRiskScore,
      criticalOutageHandledFirst,
      breakdown,
      staffRecommendations
    };

    setAnalysisReport(report);

    if (calculatedScore >= 85) {
      try {
        confetti({
          particleCount: 50,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b']
        });
      } catch (_) {}
    }
  };

  const getSeverityBadge = (sev: DailyGTMTask['severity']) => {
    switch (sev) {
      case 'Critical': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Medium': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Low': return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white font-extrabold shadow-xs shrink-0">
              <ListOrdered className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                  <Flame className="h-3.5 w-3.5 text-amber-600" />
                  Staff GTM Daily Work &amp; Prioritization Simulation
                </span>
                <span className="text-xs text-stone-500 hidden sm:inline">
                  Interactive Triage Queue
                </span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-1">
                Queue Prioritization &amp; Reliability Impact Analysis
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleApplyIdealOrder}
              className="rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Apply Staff Ideal Order</span>
            </button>
            <button
              onClick={handleResetToDefault}
              className="rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleRunExecutionSimulation}
              className="rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-4 py-1.5 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5 text-emerald-400" />
              <span>Simulate Day &amp; Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drag & Drop Prioritized Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span className="font-bold text-stone-700">
              Prioritized Daily Queue (1 = Top Urgency &rarr; 7 = Backlog)
            </span>
            <span>Drag items or use &uarr; &darr; arrows to reorder</span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task, index) => {
              const isP0 = index < 2;
              const isP1 = index >= 2 && index < 4;
              const isP2 = index >= 4;

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  className={`rounded-2xl border bg-white p-3.5 sm:p-4 shadow-2xs transition-all duration-200 ${
                    draggedIndex === index ? 'opacity-40 border-indigo-400 scale-[0.99]' : 'hover:border-indigo-300'
                  } ${isP0 ? 'border-rose-200 ring-1 ring-rose-100/80' : 'border-stone-200'}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Rank Badge & Grip */}
                    <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                        isP0 ? 'bg-rose-600 text-white' : isP1 ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-700'
                      }`}>
                        #{index + 1}
                      </span>
                      <GripVertical className="h-4 w-4 text-stone-400 cursor-grab active:cursor-grabbing" />
                    </div>

                    {/* Task Details */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-md px-2 py-0.2 text-[10px] font-bold border ${getSeverityBadge(task.severity)}`}>
                          {task.severity}
                        </span>
                        <span className="rounded-md bg-stone-100 px-2 py-0.2 text-[10px] font-semibold text-stone-600 border border-stone-200">
                          {task.category}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium ml-auto flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimatedHours}h est.
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                        {task.title}
                      </h4>

                      <p className="text-xs text-stone-600 leading-relaxed font-normal">
                        {task.description}
                      </p>

                      {/* Systems & Impact Tag */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] font-bold text-stone-400">Systems:</span>
                        {task.systemsInvolved.map((sys, sIdx) => (
                          <span key={sIdx} className="rounded-md bg-stone-50 px-1.5 py-0.2 text-[10px] font-medium text-stone-700 border border-stone-200">
                            {sys}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Move Up/Down Controls */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        disabled={index === 0}
                        onClick={() => moveTask(index, index - 1)}
                        title="Move Up"
                        className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30 transition border border-stone-200"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        disabled={index === tasks.length - 1}
                        onClick={() => moveTask(index, index + 1)}
                        title="Move Down"
                        className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30 transition border border-stone-200"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Real-Time Execution Report (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {analysisReport ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-600" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Operational Prioritization Report
                    </span>
                    <h3 className="text-base font-bold text-stone-900">
                      {analysisReport.overallTier}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-600">
                    {analysisReport.score}%
                  </div>
                  <span className="text-[10px] font-semibold text-stone-400">Total Score</span>
                </div>
              </div>

              {/* Metric Pillars */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200 text-center">
                  <div className="text-[10px] font-semibold text-stone-500">System Reliability</div>
                  <div className={`text-sm font-bold ${analysisReport.reliabilityScore >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {analysisReport.reliabilityScore}%
                  </div>
                </div>
                <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200 text-center">
                  <div className="text-[10px] font-semibold text-stone-500">GTM Velocity</div>
                  <div className="text-sm font-bold text-indigo-600">
                    {analysisReport.velocityScore}%
                  </div>
                </div>
                <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200 text-center">
                  <div className="text-[10px] font-semibold text-stone-500">Revenue Protection</div>
                  <div className={`text-sm font-bold ${analysisReport.revenueRiskScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {analysisReport.revenueRiskScore}%
                  </div>
                </div>
              </div>

              {/* Execution Feedback Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-900">Prioritization Impact Analysis</h4>
                <div className="space-y-1.5">
                  {analysisReport.breakdown.map((item, idx) => (
                    <div key={idx} className="rounded-xl bg-stone-50 p-2.5 border border-stone-200/80 text-xs text-stone-700 leading-relaxed font-medium">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff GTM Architectural Recommendations */}
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Staff GTM Operating Principles</span>
                </div>
                <ul className="space-y-1.5">
                  {analysisReport.staffRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-stone-600 bg-indigo-50/40 p-2 rounded-lg border border-indigo-100 font-medium">
                      <span className="text-indigo-600 font-bold">&bull;</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-2xs border border-stone-200 text-stone-400">
                <BarChart2 className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-800">Ready to Simulate Your GTM Day?</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Reorder the tasks above according to high-stakes GTM urgency, then click <strong>&quot;Simulate Day &amp; Generate Report&quot;</strong> to evaluate your operational tradeoffs against Staff engineering rubrics.
                </p>
              </div>
              <button
                onClick={handleRunExecutionSimulation}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Simulate Execution Report</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
