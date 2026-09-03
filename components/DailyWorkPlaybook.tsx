'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Layers, 
  Workflow, 
  Terminal, 
  ShieldAlert, 
  Database, 
  Cpu, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  TrendingUp,
  FileCode2,
  Calendar,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface DailyWorkPlaybookProps {
  onStartDrill?: (track: string) => void;
}

export const DailyWorkPlaybook: React.FC<DailyWorkPlaybookProps> = ({ onStartDrill }) => {
  const [selectedPillar, setSelectedPillar] = useState<number>(0);
  const [selectedTimelineSlot, setSelectedTimelineSlot] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'daily-timeline' | 'core-pillars' | 'jira-sprint' | 'interview-defense'>('daily-timeline');

  const DAILY_TIMELINE = [
    {
      time: '09:00 AM – 09:45 AM',
      title: 'Morning Sentry & Webhook Alert Triage',
      category: 'Incident & Pipeline Reliability',
      icon: 'ShieldAlert',
      description: 'Review overnight Dead-Letter Queues (DLQ), check Salesforce 24-hour API limit consumption, and investigate any dropped Clearbit/Segment webhook ingestion events.',
      tasks: [
        'Inspect Redis DLQ in Datadog/AWS CloudWatch for rate-limited (HTTP 429) webhook payloads.',
        'Verify HubSpot-to-Salesforce sync health (check for any unmapped picklist errors or infinite sync loops).',
        'Check API credit balances across Clay, Apollo, ZoomInfo, and Perplexity LLM inference.'
      ],
      tools: ['Datadog', 'AWS SQS / Redis', 'Salesforce System Overview', 'Sentry'],
      proTip: 'In interviews, mention that high-velocity GTM systems always separate ingestion from processing via asynchronous queues to prevent losing inbound demo requests during API downtime.'
    },
    {
      time: '10:00 AM – 10:30 AM',
      title: 'GTM Architecture & RevOps Standup',
      category: 'Cross-Functional Alignment',
      icon: 'Users',
      description: 'Align with Revenue Operations (RevOps), Sales Development (SDR) leads, and Marketing Growth on routing bottlenecks and ongoing pipeline engineering sprints.',
      tasks: [
        'Review SDR feedback on lead enrichment accuracy (e.g. valid work email deliverability).',
        'Prioritize requested changes to Round-Robin territory routing rules in Chili Piper / LeanData / custom code.',
        'Review sprint velocity on current quarterly initiatives (e.g. AI Inbound Autonomous Lead Qualifier).'
      ],
      tools: ['Linear / Jira', 'Slack Standup', 'Notion Architecture RFCs', 'LeanData / Chili Piper'],
      proTip: 'Demonstrate that you speak the language of sales pipeline (ARR, MQL-to-SQL conversion, Speed-to-Lead) as fluently as REST APIs and database schema migrations.'
    },
    {
      time: '10:45 AM – 01:00 PM',
      title: 'Deep Engineering: Pipeline Automation & Reverse ETL',
      category: 'Core Engineering & Coding',
      icon: 'Cpu',
      description: 'Uninterrupted heads-down development building custom microservices, Clay enrichment waterfalls, dbt SQL transformations, and event-driven webhooks.',
      tasks: [
        'Write a Node.js / TypeScript microservice with idempotency keys to batch-ingest product usage events from Segment into PostgreSQL.',
        'Configure a 4-tier Clay waterfall: Apollo -> Prospeo -> ZoomInfo -> Gemini Search fallback to achieve >80% corporate email fill rate at <$0.06/lead.',
        'Author dbt models in Snowflake/BigQuery to calculate Product Qualified Account (PQA) scoring metrics.'
      ],
      tools: ['TypeScript / Node.js', 'Clay.com API', 'dbt & Snowflake / Postgres', 'Census / Hightouch Reverse ETL'],
      proTip: 'Highlight the trade-off between synchronous execution (instant feedback) vs. asynchronous queue workers (fault-tolerant & resilient against downstream API governor limits).'
    },
    {
      time: '02:00 PM – 03:30 PM',
      title: 'Sandbox Staging, Load Simulation & Safe Deployment',
      category: 'Testing & Governance',
      icon: 'Layers',
      description: 'Test newly built triggers, flows, and API integration endpoints in isolated CRM sandboxes with high-volume synthetic mock data before deploying to production.',
      tasks: [
        'Execute test suites in Salesforce Sandbox verifying trigger anti-recursion flags (`Trigger.new.LastModifiedById == IntegrationUser.Id`).',
        'Simulate a burst of 5,000 inbound event payloads to verify Redis token bucket rate limiters prevent HTTP 429 lockouts.',
        'Validate fuzzy deduplication logic matching company domain variations (`corp-acme.com` vs `acme.io`).'
      ],
      tools: ['Salesforce Sandbox', 'Postman / Insomnia', 'Vitest / Jest Mock Suites', 'GitHub Actions CI/CD'],
      proTip: 'Never push schema changes directly to production CRM without staging validation, as broken required fields immediately halt AE deal creation.'
    },
    {
      time: '03:45 PM – 04:45 PM',
      title: 'AI Workflow Optimization & Prompt Engineering',
      category: 'AI-Native Automation',
      icon: 'Sparkles',
      description: 'Build and tune autonomous AI agents that analyze inbound contact notes, qualify enterprise ICP fit, and draft personalized outreach hooks for account executives.',
      tasks: [
        'Enforce strict JSON schema validation using Gemini with Zod for extracting customer pain points, budget, and tech stack.',
        'Optimize prompt token usage and cache common company firmographic summaries in Redis to lower operational LLM costs.',
        'Set up automated Slack alerts alerting Enterprise AEs when high-intent tier-1 accounts visit key product pricing pages.'
      ],
      tools: ['Gemini API / Claude API', 'Zod Schema Validation', 'Slack Webhooks API', 'Redis Cache'],
      proTip: 'Emphasize temperature=0.0 and deterministic JSON schemas over conversational free-form text when building AI automations that write to mission-critical CRM fields.'
    },
    {
      time: '05:00 PM – 05:30 PM',
      title: 'Documentation, dbt Documentation & Telemetry Sync',
      category: 'Observability & Documentation',
      icon: 'FileCode2',
      description: 'Wrap up the day by documenting integration contracts in Notion, reviewing peer pull requests, and ensuring pipeline telemetry logs are shipping cleanly.',
      tasks: [
        'Update the GTM Architecture diagram and field-mapping dictionary in Notion.',
        'Review pull requests for colleague webhook endpoints and database migrations.',
        'Check daily pipeline health scorecard: 99.8% webhook delivery success, 142ms avg response time.'
      ],
      tools: ['GitHub Pull Requests', 'Notion Architecture Hub', 'Grafana / Datadog Dashboards'],
      proTip: 'GTM Engineering teams thrive on self-documenting architectures where every custom CRM custom field has a clear upstream owner and SSOT rule.'
    }
  ];

  const CORE_PILLARS = [
    {
      title: '1. Inbound Ingress & Webhook Architecture',
      percentage: '25% of Daily Work',
      badge: 'High Availability',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      summary: 'Building fault-tolerant endpoints that ingest form fills, product telemetry, and partner webhooks without dropping a single lead.',
      keyResponsibilities: [
        'Designing webhook listeners that respond with instant HTTP 202 Accepted and offload heavy processing to background queues.',
        'Implementing SHA-256 HMAC signature verification to prevent unauthorized webhook spoofing.',
        'Enforcing cryptographic idempotency keys (`X-Idempotency-Key: hash(email + timestamp)`) to prevent duplicate leads on network retries.'
      ],
      commonObstacles: 'Downstream CRMs taking 2.5s to respond during high-traffic marketing webinars, causing frontend form timeouts if synchronous.'
    },
    {
      title: '2. Multi-Provider Waterfall Enrichment',
      percentage: '30% of Daily Work',
      badge: 'Cost & Coverage Optimization',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      summary: 'Architecting intelligent cascades that query inexpensive data sources first and only invoke expensive VIP providers when necessary.',
      keyResponsibilities: [
        'Constructing 4-tier enrichment cascades (Apollo $0.02 -> Prospeo $0.03 -> Clearbit $0.25 -> Gemini Search Fallback).',
        'Validating corporate MX records and SMTP handshakes to ensure bounce rates stay under 2% before outreach.',
        'Caching company-level firmographics in Redis/Postgres for 30 days so 10 leads from the same company only trigger 1 enrichment bill.'
      ],
      commonObstacles: 'API provider rate limit throttles during bulk CSV uploads from sales reps or marketing campaigns.'
    },
    {
      title: '3. CRM Bi-Directional Sync & Data Governance',
      percentage: '25% of Daily Work',
      badge: 'System of Record SSOT',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      summary: 'Managing the delicate synchronization balance between Salesforce, HubSpot, product databases, and customer success tools.',
      keyResponsibilities: [
        'Enforcing clear Single Source of Truth (SSOT) field ownership matrices (Marketing owns MQL stage, Sales owns Opp stage).',
        'Writing Apex triggers and Flow recursion guards to prevent infinite update loop ping-pongs.',
        'Designing PostgreSQL trigram similarity deduplication to match inbound leads against parent corporate accounts.'
      ],
      commonObstacles: 'Salesforce 101 SOQL Governor Limits and daily API quota exhaustion due to non-bulkified sync jobs.'
    },
    {
      title: '4. AI-Native Qualification & GTM Agents',
      percentage: '20% of Daily Work',
      badge: 'Modern Frontier',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      summary: 'Deploying autonomous LLM agents that research inbound prospects, score ICP match, and enrich CRM notes in real-time.',
      keyResponsibilities: [
        'Writing prompt pipelines that parse messy form notes and match company tech stacks against open jobs and GitHub repos.',
        'Enforcing strict JSON schema responses using Gemini structured outputs to safely populate CRM custom dropdowns.',
        'Building autonomous Slack bots that notify account executives with pre-drafted personalized discovery agendas.'
      ],
      commonObstacles: 'LLM hallucination or non-deterministic string formatting breaking strict CRM picklist validation rules.'
    }
  ];

  const SPRINT_TICKETS = [
    {
      id: 'GTM-401',
      title: 'Implement Redis Token Bucket to Protect Salesforce 429 Governor Limits',
      priority: 'P0 - Critical',
      tag: 'Architecture / Rate Limiting',
      description: 'Incoming marketing leads during the product launch caused Salesforce API limit exhaustion. Build a Redis token-bucket middleware with exponential backoff and dead-letter queue retry.',
      skills: ['Redis', 'TypeScript', 'Salesforce REST API', 'Fault Tolerance']
    },
    {
      id: 'GTM-402',
      title: 'Build 4-Tier Clay Waterfall with MX Record Pre-Verification',
      priority: 'P1 - High',
      tag: 'Enrichment / Cost Optimization',
      description: 'Reduce monthly Clearbit spend by 65% by cascading Apollo -> Prospeo -> Clearbit fallback with 30-day domain caching.',
      skills: ['Clay.com', 'DNS MX Checks', 'Cost Modeling', 'PostgreSQL']
    },
    {
      id: 'GTM-403',
      title: 'Deploy Gemini-Powered Inbound ICP Classifier with Zod Output',
      priority: 'P1 - High',
      tag: 'AI Agents / Qualification',
      description: 'Create an asynchronous worker that evaluates inbound website form answers, fetches prospect LinkedIn headline, and assigns Tier 1/2/3 ICP score.',
      skills: ['Gemini API', 'Structured JSON', 'Webhook Middleware', 'HubSpot v3 API']
    },
    {
      id: 'GTM-404',
      title: 'Resolve Bi-Directional Lifecycle Stage Ping-Pong Loop in SFDC/HubSpot',
      priority: 'P2 - Medium',
      tag: 'CRM Data Hygiene',
      description: 'HubSpot and Salesforce are continually rewriting the "Lead Status" timestamp every 4 minutes. Implement integration-user filter flags.',
      skills: ['Salesforce Apex', 'HubSpot Workflows', 'SSOT Governance']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">
              <Laptop className="h-3.5 w-3.5 text-stone-700" />
              <span>GTM Engineering Career Blueprint</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              A Day in the Life of a GTM Systems & Solutions Engineer
            </h2>
            <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">
              Explore the real daily responsibilities, architecture challenges, sprint tickets, and cross-functional workflows you will handle on high-performing Go-To-Market engineering teams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onStartDrill && (
              <button
                onClick={() => onStartDrill('system-architecture')}
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition shadow-2xs"
              >
                <span>Practice Architecture Drill</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
          <button
            onClick={() => setActiveTab('daily-timeline')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === 'daily-timeline'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Hour-by-Hour Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('core-pillars')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === 'core-pillars'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>4 Core Work Pillars</span>
          </button>

          <button
            onClick={() => setActiveTab('jira-sprint')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === 'jira-sprint'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Workflow className="h-3.5 w-3.5" />
            <span>Real Sprint Tickets (Jira)</span>
          </button>

          <button
            onClick={() => setActiveTab('interview-defense')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === 'interview-defense'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interview Story Defense</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Daily Timeline */}
      {activeTab === 'daily-timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Timeline Selector */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider px-1">
              Select Schedule Window
            </div>
            <div className="space-y-2">
              {DAILY_TIMELINE.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTimelineSlot(idx)}
                  className={`w-full text-left rounded-xl p-3 border transition-all text-xs space-y-1 ${
                    selectedTimelineSlot === idx
                      ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[11px] font-bold ${
                      selectedTimelineSlot === idx ? 'text-amber-400' : 'text-stone-500'
                    }`}>
                      {slot.time}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      selectedTimelineSlot === idx ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {slot.category}
                    </span>
                  </div>
                  <div className="font-bold text-xs">{slot.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Detailed Inspection Card */}
          <div className="lg:col-span-8">
            {DAILY_TIMELINE[selectedTimelineSlot] && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5 shadow-2xs animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-amber-600">
                      {DAILY_TIMELINE[selectedTimelineSlot].time}
                    </span>
                    <h3 className="text-lg font-bold text-stone-900">
                      {DAILY_TIMELINE[selectedTimelineSlot].title}
                    </h3>
                  </div>
                  <span className="rounded-lg bg-stone-100 px-3 py-1 text-xs font-bold text-stone-800 border border-stone-200">
                    {DAILY_TIMELINE[selectedTimelineSlot].category}
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {DAILY_TIMELINE[selectedTimelineSlot].description}
                </p>

                {/* Daily Checklist Tasks */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Key Engineering Deliverables & Tasks</span>
                  </div>
                  <div className="space-y-2">
                    {DAILY_TIMELINE[selectedTimelineSlot].tasks.map((task, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2.5 rounded-xl border border-stone-100 bg-stone-50/70 p-3 text-xs text-stone-800">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                          {tIdx + 1}
                        </span>
                        <span className="leading-relaxed">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tools & Stack Used */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-stone-600" />
                    <span>Tools & Technologies Utilized</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DAILY_TIMELINE[selectedTimelineSlot].tools.map((tool, toolIdx) => (
                      <span key={toolIdx} className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-800 border border-stone-200">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interview Golden Pro-Tip */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <span>How to articulate this in Senior / Staff Interviews</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    {DAILY_TIMELINE[selectedTimelineSlot].proTip}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: 4 Core Work Pillars */}
      {activeTab === 'core-pillars' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CORE_PILLARS.map((pillar, idx) => (
            <div key={idx} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 shadow-2xs hover:border-stone-300 transition">
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <h3 className="font-bold text-stone-900 text-sm">{pillar.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pillar.badgeColor}`}>
                  {pillar.percentage}
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                {pillar.summary}
              </p>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                  Typical Daily Execution:
                </div>
                <div className="space-y-1.5">
                  {pillar.keyResponsibilities.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-start gap-2 text-xs text-stone-700">
                      <span className="text-stone-400 font-bold">•</span>
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-rose-50/70 border border-rose-100 p-3 text-xs space-y-1">
                <span className="font-bold text-rose-900 text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-rose-600" />
                  <span>Main Daily Friction Point:</span>
                </span>
                <p className="text-rose-950 text-[11px] leading-relaxed">
                  {pillar.commonObstacles}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Jira Sprint Tickets */}
      {activeTab === 'jira-sprint' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white p-4 text-xs text-stone-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-900">Current GTM Sprint Board (2-Week Iteration)</span>
              <p className="text-[11px] text-stone-500 mt-0.5">Real tickets pulled from production engineering backlogs at high-growth SaaS companies.</p>
            </div>
            <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Sprint Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPRINT_TICKETS.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3 shadow-2xs hover:border-stone-300 transition">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700">{ticket.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ticket.priority.includes('P0') ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-stone-900">{ticket.title}</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">{ticket.description}</p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1">
                  {ticket.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Interview Defense Strategies */}
      {activeTab === 'interview-defense' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5 shadow-2xs">
          <div className="space-y-1 border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-stone-900">
              How to Answer: &quot;Describe a typical day in your GTM Engineering workflow&quot;
            </h3>
            <p className="text-xs text-stone-500">
              Use this high-impact 3-part narrative framework during Director/VP of RevOps and Head of Engineering interviews.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 space-y-1.5">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">1</span>
                <span>The Reliability Baseline (20% Time)</span>
              </div>
              <p className="text-stone-700 leading-relaxed pl-7">
                &quot;I start every morning with pipeline observability—checking dead-letter queues, Salesforce governor limit consumption, and webhook health to ensure zero revenue leakage overnight.&quot;
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 space-y-1.5">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">2</span>
                <span>The Core Engineering Sprint (60% Time)</span>
              </div>
              <p className="text-stone-700 leading-relaxed pl-7">
                &quot;The bulk of my day is heads-down architecture and code: designing resilient multi-tier enrichment cascades in Clay and TypeScript, creating dbt SQL transformations for product-qualified lead scoring, and deploying AI qualification agents with deterministic JSON validation.&quot;
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 space-y-1.5">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">3</span>
                <span>Cross-Functional Revenue Impact (20% Time)</span>
              </div>
              <p className="text-stone-700 leading-relaxed pl-7">
                &quot;I partner closely with RevOps, Sales leadership, and Growth PMs to translate business requirements into clean technical architectures, testing everything in sandboxes with synthetic load tests before shipping to production.&quot;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
