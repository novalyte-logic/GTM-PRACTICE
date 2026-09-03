'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RefreshCw, 
  AlertOctagon, 
  CheckCircle2, 
  Terminal, 
  Layers, 
  Database, 
  ShieldAlert, 
  Cpu, 
  Zap, 
  ArrowRight, 
  FileCode2, 
  Clock, 
  AlertTriangle,
  Sliders,
  Check,
  X,
  Sparkles,
  Info,
  Server,
  Workflow
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PipelineLog {
  id: string;
  timestamp: string;
  stage: string;
  status: 'success' | 'error' | 'warning' | 'info';
  statusCode: number;
  message: string;
  latencyMs: number;
  payload?: any;
}

export const MockCRMSandbox: React.FC = () => {
  // Error Injection Checkboxes
  const [injectRateLimit429, setInjectRateLimit429] = useState<boolean>(false);
  const [injectSchemaDrift, setInjectSchemaDrift] = useState<boolean>(false);
  const [injectEnrichmentTimeout, setInjectEnrichmentTimeout] = useState<boolean>(false);
  const [injectSyncRecursion, setInjectSyncRecursion] = useState<boolean>(false);
  const [injectAccountConflict, setInjectAccountConflict] = useState<boolean>(false);

  // Resilience & Mitigation Checkboxes
  const [enableRedisDLQ, setEnableRedisDLQ] = useState<boolean>(true);
  const [enableIdempotencyKey, setEnableIdempotencyKey] = useState<boolean>(true);
  const [enableDomainCache, setEnableDomainCache] = useState<boolean>(true);
  const [enableAIFallback, setEnableAIFallback] = useState<boolean>(true);
  const [enableSSOTGovernance, setEnableSSOTGovernance] = useState<boolean>(true);

  // Simulation Running State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(-1);
  const [pipelineLogs, setPipelineLogs] = useState<PipelineLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<PipelineLog | null>(null);

  // Live Metrics
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [dlqCount, setDlqCount] = useState<number>(0);
  const [totalCostCents, setTotalCostCents] = useState<number>(0);
  const [lastLatencyMs, setLastLatencyMs] = useState<number>(0);

  // Sample Lead Data for Inspector
  const [currentLeadPayload, setCurrentLeadPayload] = useState<{
    inbound: any;
    enriched: any;
  }>({
    inbound: {
      email: 'alex.rivera@stripe.com',
      firstName: 'Alex',
      lastName: 'Rivera',
      company: 'Stripe',
      website: 'https://stripe.com',
      formSource: 'Enterprise Demo Request',
      submittedAt: new Date().toISOString()
    },
    enriched: null
  });

  const PIPELINE_STAGES = [
    { id: 0, label: '1. Ingress Webhook', icon: 'Zap', description: 'Accepts POST /api/v1/leads' },
    { id: 1, label: '2. Rate Limiter / Queue', icon: 'Server', description: 'Redis Token Bucket & DLQ' },
    { id: 2, label: '3. Waterfall Enrichment', icon: 'Layers', description: 'Apollo -> Prospeo -> AI' },
    { id: 3, label: '4. Lead-to-Account Match', icon: 'Database', description: 'Postgres Trigram Dedup' },
    { id: 4, label: '5. CRM Write (SFDC)', icon: 'Cpu', description: 'Salesforce REST / Bulk v2' },
    { id: 5, label: '6. Telemetry & Slack', icon: 'Workflow', description: 'Slack Alert & Event Stream' },
  ];

  // Helper to append log
  const addLog = (
    stage: string, 
    status: 'success' | 'error' | 'warning' | 'info', 
    statusCode: number, 
    message: string, 
    latencyMs: number, 
    payload?: any
  ) => {
    const newLog: PipelineLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      stage,
      status,
      statusCode,
      message,
      latencyMs,
      payload
    };
    setPipelineLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    setSelectedLog(newLog);
  };

  // Run the full simulation sequence
  const handleFireSingleLead = async (customLead?: any) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTotalEvents((prev) => prev + 1);

    const lead = customLead || {
      email: injectSchemaDrift ? '' : 'alex.rivera@stripe.com',
      firstName: 'Alex',
      lastName: 'Rivera',
      company: injectAccountConflict ? 'Stripe Inc (UK Entity)' : 'Stripe',
      website: 'stripe.com',
      formSource: 'Enterprise Demo Request',
      submittedAt: new Date().toISOString()
    };

    setCurrentLeadPayload({
      inbound: lead,
      enriched: null
    });

    let overallSuccess = true;
    let enrichedData: any = { ...lead };
    let leadLatency = 0;

    // --- STAGE 0: Ingress Webhook ---
    setActiveStage(0);
    await new Promise((r) => setTimeout(r, 220));
    leadLatency += 35;

    if (injectSchemaDrift && !lead.email) {
      addLog('Ingress Webhook', 'error', 422, 'Unprocessable Entity: Missing required string `email` on inbound schema.', 35, lead);
      setErrorCount((prev) => prev + 1);
      setIsProcessing(false);
      setActiveStage(-1);
      return;
    } else {
      addLog(
        'Ingress Webhook', 
        'success', 
        202, 
        enableIdempotencyKey ? 'HTTP 202 Accepted. Idempotency Key validated (`idemp_9f81a7`). Payload queued.' : 'HTTP 202 Accepted. (No idempotency key attached).', 
        35, 
        lead
      );
    }

    // --- STAGE 1: Rate Limiter & Queue ---
    setActiveStage(1);
    await new Promise((r) => setTimeout(r, 200));
    leadLatency += 20;

    if (injectRateLimit429 && !enableRedisDLQ) {
      addLog('Rate Limiter', 'error', 429, 'CRITICAL: Salesforce Governor Limit Exceeded (Daily API limit consumed). Request dropped without DLQ!', 20);
      setErrorCount((prev) => prev + 1);
      overallSuccess = false;
      setIsProcessing(false);
      setActiveStage(-1);
      return;
    } else if (injectRateLimit429 && enableRedisDLQ) {
      addLog('Rate Limiter', 'warning', 429, 'Salesforce 429 Throttled. Redis Token Bucket routed payload to Dead-Letter Queue (DLQ) with Exponential Backoff retry.', 20);
      setDlqCount((prev) => prev + 1);
      // DLQ saved it, we continue simulation in graceful retry mode
    } else {
      addLog('Rate Limiter', 'success', 200, 'Redis Token Bucket passed: 12 tokens remaining in current 60s bucket window.', 20);
    }

    // --- STAGE 2: Waterfall Enrichment ---
    setActiveStage(2);
    await new Promise((r) => setTimeout(r, 280));

    if (injectEnrichmentTimeout && !enableAIFallback) {
      leadLatency += 5200;
      addLog('Waterfall Enrichment', 'error', 504, 'Gateway Timeout (>5000ms): Apollo & Prospeo upstream API unresponsive.', 5200);
      setErrorCount((prev) => prev + 1);
      overallSuccess = false;
      setIsProcessing(false);
      setActiveStage(-1);
      return;
    } else if (injectEnrichmentTimeout && enableAIFallback) {
      leadLatency += 850;
      enrichedData.title = 'VP of Infrastructure & Platform Engineering';
      enrichedData.employees = 8000;
      enrichedData.techStack = ['AWS', 'Kubernetes', 'PostgreSQL', 'Redis', 'TypeScript'];
      enrichedData.enrichmentProvider = 'Gemini-AI-Search-Fallback ($0.005)';
      setTotalCostCents((prev) => prev + 1);
      addLog('Waterfall Enrichment', 'warning', 206, 'Primary waterfall timed out. Autonomous Gemini Search Agent successfully extracted executive title & tech stack.', 850, enrichedData);
    } else {
      leadLatency += 140;
      if (enableDomainCache) {
        enrichedData.title = 'VP of Infrastructure';
        enrichedData.employees = 8000;
        enrichedData.annualRevenue = '$1.5B+';
        enrichedData.techStack = ['AWS', 'Node.js', 'Salesforce Enterprise'];
        enrichedData.enrichmentProvider = 'In-Memory Domain Cache Hit (stripe.com) [$0.00]';
        addLog('Waterfall Enrichment', 'success', 200, 'Cache Hit on `stripe.com`. Retrieved firmographics in 12ms at $0.00 cost.', 140, enrichedData);
      } else {
        enrichedData.title = 'VP of Infrastructure';
        enrichedData.employees = 8000;
        enrichedData.annualRevenue = '$1.5B+';
        enrichedData.enrichmentProvider = 'Apollo Tier 1 ($0.02) + ZeroBounce Verified';
        setTotalCostCents((prev) => prev + 3);
        addLog('Waterfall Enrichment', 'success', 200, 'Tier 1 Cascade Success: Apollo verified MX records. Saved $0.23 vs Clearbit.', 140, enrichedData);
      }
    }

    // --- STAGE 3: Lead-to-Account Matching ---
    setActiveStage(3);
    await new Promise((r) => setTimeout(r, 200));
    leadLatency += 45;

    if (injectAccountConflict) {
      enrichedData.matchedAccountId = '0015G00002XYZStripeParent';
      enrichedData.accountMatchStrategy = 'Fuzzy Trigram pg_trgm (Score: 0.92) -> Stripe, Inc.';
      addLog('Account Matching', 'warning', 200, 'Fuzzy Domain Resolution: Matched "Stripe UK Entity" to Parent Account `0015G00002XYZStripeParent` (0.92 confidence).', 45, enrichedData);
    } else {
      enrichedData.matchedAccountId = '0015G00002XYZStripeParent';
      enrichedData.accountMatchStrategy = 'Exact Domain Key (`stripe.com`)';
      addLog('Account Matching', 'success', 200, 'Exact Primary Key Domain Match found in Postgres `crm_accounts` table.', 45, enrichedData);
    }

    // --- STAGE 4: CRM Destination Write ---
    setActiveStage(4);
    await new Promise((r) => setTimeout(r, 260));
    leadLatency += 120;

    if (injectSyncRecursion && !enableSSOTGovernance) {
      addLog('CRM Write (SFDC)', 'error', 508, 'Infinite Sync Loop Detected: Salesforce Apex Trigger and HubSpot Workflow mutually ping-ponging `Last_Modified_Date`. API quota drained!', 120);
      setErrorCount((prev) => prev + 1);
      overallSuccess = false;
      setIsProcessing(false);
      setActiveStage(-1);
      return;
    } else if (injectSyncRecursion && enableSSOTGovernance) {
      addLog('CRM Write (SFDC)', 'success', 200, 'Anti-Recursion Rule Enforced: Suppressed trigger because `LastModifiedById == IntegrationUser.Id`. Bi-directional loop safely severed.', 120);
    } else {
      addLog('CRM Write (SFDC)', 'success', 201, 'Salesforce Contact Created (ID: `0035G0000189ABC`). Account Executive Round-Robin routed to Enterprise Pod 2.', 120);
    }

    // --- STAGE 5: Downstream Telemetry & Slack ---
    setActiveStage(5);
    await new Promise((r) => setTimeout(r, 180));
    leadLatency += 30;
    addLog('Telemetry & Slack', 'success', 200, '⚡ Slack Alert fired to `#enterprise-inbound-leads` with personalized Discovery Brief. Event shipped to Snowflake/dbt.', 30);

    setLastLatencyMs(leadLatency);
    setCurrentLeadPayload((prev) => ({
      ...prev,
      enriched: enrichedData
    }));

    if (overallSuccess) {
      setSuccessCount((prev) => prev + 1);
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#10b981', '#6366f1']
        });
      } catch (_) {}
    }

    setIsProcessing(false);
    setActiveStage(-1);
  };

  // Blast 10 rapid leads
  const handleStressTestBurst = async () => {
    if (isProcessing) return;
    for (let i = 0; i < 5; i++) {
      await handleFireSingleLead({
        email: `lead.alex${i}@company${i}.io`,
        firstName: `Alex${i}`,
        lastName: `Engineer${i}`,
        company: `CloudTech ${i}`,
        website: `company${i}.io`,
        formSource: 'Stress Test Burst Generator',
        submittedAt: new Date().toISOString()
      });
      await new Promise((r) => setTimeout(r, 100));
    }
  };

  const handleResetSandbox = () => {
    setPipelineLogs([]);
    setSelectedLog(null);
    setTotalEvents(0);
    setSuccessCount(0);
    setErrorCount(0);
    setDlqCount(0);
    setTotalCostCents(0);
    setLastLatencyMs(0);
    setCurrentLeadPayload({
      inbound: {
        email: 'alex.rivera@stripe.com',
        firstName: 'Alex',
        lastName: 'Rivera',
        company: 'Stripe',
        website: 'https://stripe.com',
        formSource: 'Enterprise Demo Request',
        submittedAt: new Date().toISOString()
      },
      enriched: null
    });
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Header */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-xs font-bold text-indigo-900">
              <Server className="h-3.5 w-3.5 text-indigo-600" />
              <span>Interactive Data Pipeline Simulation</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Mock CRM &amp; Webhook Ingestion Sandbox
            </h2>
            <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">
              Toggle real-world failure anomalies and architectural mitigations in real-time. Watch how HTTP status codes, Redis token-bucket queues, and waterfall enrichment adapt dynamically under load.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFireSingleLead()}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition disabled:opacity-50 shadow-2xs"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
                  <span>Processing Flow...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Fire Inbound Lead Event</span>
                </>
              )}
            </button>

            <button
              onClick={handleStressTestBurst}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 transition disabled:opacity-50 shadow-2xs"
            >
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              <span>Stress Burst (5x)</span>
            </button>

            <button
              onClick={handleResetSandbox}
              disabled={isProcessing}
              className="rounded-xl border border-stone-200 p-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition"
              title="Reset Sandbox"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200/80">
            <div className="text-[10px] text-stone-500 font-bold uppercase">Total Events</div>
            <div className="text-base font-bold text-stone-900 mt-0.5">{totalEvents}</div>
          </div>
          <div className="rounded-xl bg-emerald-50/70 p-2.5 border border-emerald-200/80">
            <div className="text-[10px] text-emerald-800 font-bold uppercase">Success 200 OK</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5">{successCount}</div>
          </div>
          <div className="rounded-xl bg-rose-50/70 p-2.5 border border-rose-200/80">
            <div className="text-[10px] text-rose-800 font-bold uppercase">Failed 4xx/5xx</div>
            <div className="text-base font-bold text-rose-700 mt-0.5">{errorCount}</div>
          </div>
          <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200/80">
            <div className="text-[10px] text-amber-800 font-bold uppercase">DLQ Queued</div>
            <div className="text-base font-bold text-amber-700 mt-0.5">{dlqCount}</div>
          </div>
          <div className="rounded-xl bg-indigo-50/70 p-2.5 border border-indigo-200/80">
            <div className="text-[10px] text-indigo-800 font-bold uppercase">Total API Spend</div>
            <div className="text-base font-bold text-indigo-700 mt-0.5">${(totalCostCents / 100).toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200/80">
            <div className="text-[10px] text-stone-500 font-bold uppercase">Last Latency</div>
            <div className="text-base font-bold text-stone-900 mt-0.5 font-mono">{lastLatencyMs}ms</div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Animation Ribbon */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-stone-900 uppercase tracking-wider">
          <span>Live Ingestion Pipeline Stages</span>
          <span className="text-[11px] text-stone-500 font-normal">Active Stage highlighted in real-time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2">
          {PIPELINE_STAGES.map((stage) => {
            const isActive = activeStage === stage.id;
            return (
              <div
                key={stage.id}
                className={`rounded-xl border p-3 transition-all text-xs space-y-1 ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-400 shadow-md scale-[1.02]'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-[11px] ${isActive ? 'text-indigo-900' : 'text-stone-800'}`}>
                    {stage.label}
                  </span>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                  )}
                </div>
                <p className="text-[10px] text-stone-500 line-clamp-1">{stage.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Matrix: Checkbox Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Box: Failure & Anomaly Injection Toggles */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <h3 className="font-bold text-rose-950 text-sm">
              Failure State Injections (Production Gotchas)
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white p-3 cursor-pointer hover:border-rose-300 transition">
              <input
                type="checkbox"
                checked={injectRateLimit429}
                onChange={(e) => setInjectRateLimit429(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Salesforce 429 Governor Rate Limit</span>
                  <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-800">HTTP 429</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Exhausts CRM 24-hour API limit quota on inbound webhook burst.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white p-3 cursor-pointer hover:border-rose-300 transition">
              <input
                type="checkbox"
                checked={injectSchemaDrift}
                onChange={(e) => setInjectSchemaDrift(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Corrupted Payload Schema Drift</span>
                  <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-800">HTTP 422</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Drops required &apos;email&apos; string from inbound webhook body.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white p-3 cursor-pointer hover:border-rose-300 transition">
              <input
                type="checkbox"
                checked={injectEnrichmentTimeout}
                onChange={(e) => setInjectEnrichmentTimeout(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Clay Waterfall Timeout (&gt;5000ms)</span>
                  <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-800">HTTP 504</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Simulates upstream Apollo/Prospeo latency hang causing gateway timeout.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white p-3 cursor-pointer hover:border-rose-300 transition">
              <input
                type="checkbox"
                checked={injectSyncRecursion}
                onChange={(e) => setInjectSyncRecursion(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Bi-Directional CRM Sync Recursion Loop</span>
                  <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-800">HTTP 508</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Salesforce and HubSpot continually ping-pong update timestamps without recursion filters.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white p-3 cursor-pointer hover:border-rose-300 transition">
              <input
                type="checkbox"
                checked={injectAccountConflict}
                onChange={(e) => setInjectAccountConflict(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900">
                  Fuzzy Match Conflict (Subsidiary Domain)
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Passes subsidiary name variations requiring PostgreSQL trigram resolution.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Right Box: Resilience & Mitigation Toggles */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
            <ShieldAlert className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-emerald-950 text-sm">
              Resilience &amp; Architectural Mitigations
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white p-3 cursor-pointer hover:border-emerald-300 transition">
              <input
                type="checkbox"
                checked={enableRedisDLQ}
                onChange={(e) => setEnableRedisDLQ(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Redis Token Bucket &amp; Dead-Letter Queue (DLQ)</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">Fault Tolerant</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Buffers 429 throttled events in Redis with exponential backoff rather than dropping leads.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white p-3 cursor-pointer hover:border-emerald-300 transition">
              <input
                type="checkbox"
                checked={enableIdempotencyKey}
                onChange={(e) => setEnableIdempotencyKey(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900">
                  Enforce Cryptographic Idempotency Header
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Attaches `X-Idempotency-Key` to safely prevent duplicate leads during network retries.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white p-3 cursor-pointer hover:border-emerald-300 transition">
              <input
                type="checkbox"
                checked={enableDomainCache}
                onChange={(e) => setEnableDomainCache(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>In-Memory 30-Day Domain Cache</span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[9px] font-bold text-indigo-800">Zero Cost</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Caches firmographics on corporate domain to eliminate duplicate Clearbit/Apollo API costs.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white p-3 cursor-pointer hover:border-emerald-300 transition">
              <input
                type="checkbox"
                checked={enableAIFallback}
                onChange={(e) => setEnableAIFallback(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Autonomous Gemini AI Search Fallback</span>
                  <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-800">AI Agent</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Invokes structured Gemini grounding agent when traditional waterfall providers return 404/504.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white p-3 cursor-pointer hover:border-emerald-300 transition">
              <input
                type="checkbox"
                checked={enableSSOTGovernance}
                onChange={(e) => setEnableSSOTGovernance(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900">
                  SSOT Field Governance &amp; Integration User Guard
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Suppresses trigger loops (`Trigger.new.LastModifiedById == IntegrationUser.Id`).
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Live Pipeline Terminal & Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Terminal Event Stream */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-stone-700" />
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Live Ingestion Event Stream
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">
              {pipelineLogs.length} events logged
            </span>
          </div>

          <div className="h-96 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
            {pipelineLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-stone-400 p-6 space-y-2">
                <Play className="h-8 w-8 text-stone-300" />
                <p className="text-xs font-sans text-stone-500">
                  Sandbox ready. Click <strong>&quot;Fire Inbound Lead Event&quot;</strong> to watch live data flows.
                </p>
              </div>
            ) : (
              pipelineLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full text-left rounded-xl p-3 border transition-all space-y-1 ${
                    selectedLog?.id === log.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-stone-100 bg-stone-50/70 hover:bg-stone-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        log.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'error' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {log.statusCode}
                      </span>
                      <span className="font-bold text-stone-900">{log.stage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-400 text-[10px]">
                      <span>{log.latencyMs}ms</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-700 line-clamp-2 leading-relaxed">
                    {log.message}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Lead Payload Inspector */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-stone-700" />
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Payload Inspector (JSON)
              </span>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {currentLeadPayload.enriched ? 'Enriched SFDC Record' : 'Inbound Raw Payload'}
            </span>
          </div>

          <div className="h-96 overflow-y-auto rounded-xl bg-stone-900 p-4 font-mono text-[11px] text-emerald-400 space-y-2">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(
                currentLeadPayload.enriched || currentLeadPayload.inbound,
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
