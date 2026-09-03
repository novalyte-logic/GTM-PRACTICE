'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Copy, 
  Check, 
  Sparkles,
  Zap,
  DollarSign,
  Workflow
} from 'lucide-react';

export interface ArchitectureScenario {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  category: string;
  summary: string;
  metricsToQuote: string[];
  interviewerQuestionPrompt: string;
  interviewAnswerScript: string;
  steps: {
    number: number;
    title: string;
    tech: string;
    description: string;
    gotcha: string;
  }[];
  criticalEdgeCases: string[];
  novalyteConnection: string;
}

export const BIG_FIVE_SCENARIOS: ArchitectureScenario[] = [
  {
    id: 'lead-ingestion-sla',
    title: '1. Inbound Lead Ingestion & Speed-to-Lead Pipeline',
    subtitle: 'Decoupled Webhooks ➔ Redis Queue ➔ CRM Upsert ➔ Instant Slack Alert',
    iconName: 'Zap',
    category: 'Ingestion & Speed-to-Lead',
    summary: 'How high-growth companies receive thousands of marketing form submits, enrich them, write to Salesforce, and alert the sales rep in under 60 seconds without dropping a single lead.',
    interviewerQuestionPrompt: '"How would you architect an inbound lead ingestion pipeline that can handle marketing traffic spikes, prevents dropped leads during CRM downtime, and gets high-intent demo requests to sales reps in under a minute?"',
    metricsToQuote: [
      '<45s end-to-end Speed-to-Lead SLA',
      '99.99% ingress uptime via Redis decoupling',
      'Zero dropped leads during Salesforce maintenance'
    ],
    novalyteConnection: 'At Novalyte AI, architected asynchronous patient intake workers that ingested and validated incoming clinic requests without blocking front-end submission latency.',
    interviewAnswerScript: '"I approach inbound ingestion through a decoupled three-tier architecture: Ingress Gateway, Asynchronous Worker Queue, and CRM Dispatch. When a demo form fires, the API gateway validates the payload schema with Zod, checks an MD5 idempotency key in Redis, and immediately returns a 200 OK within 50 milliseconds. A background worker picks up the job from a Redis BullMQ queue, runs parallel waterfall enrichment, upserts to Salesforce with an external ID to prevent duplicates, and dispatches a rich Slack webhook to the assigned rep with instant calendar booking links. The entire cycle finishes in under 45 seconds."',
    steps: [
      {
        number: 1,
        title: 'Ingress Webhook Gateway',
        tech: 'Next.js API / FastAPI + Zod',
        description: 'Receives the raw webhook from webforms (Webflow, Typeform, HubSpot). Validates schema and generates an MD5 hash idempotency key.',
        gotcha: 'Never do CRM writes synchronously in the webhook handler; if Salesforce takes 2 seconds to respond, you will timeout marketing forms.'
      },
      {
        number: 2,
        title: 'Asynchronous Message Queue',
        tech: 'Redis + BullMQ / AWS SQS',
        description: 'Decouples ingestion from execution. If downstream services are busy, events wait safely in queue with exponential backoff and jitter.',
        gotcha: 'Configure a Dead-Letter Queue (DLQ) with a Slack notification so poison-pill payloads don\'t jam the queue.'
      },
      {
        number: 3,
        title: 'Normalization & L2A Matcher',
        tech: 'Node.js / Python + PostgreSQL',
        description: 'Strips protocols from company domains, checks against 4,000+ personal email domains, and runs exact/fuzzy matching against CRM accounts.',
        gotcha: 'Always handle personal emails (gmail/yahoo) by checking if the user provided a separate company name field.'
      },
      {
        number: 4,
        title: 'Idempotent CRM Upsert',
        tech: 'Salesforce Composite API / HubSpot Batch API',
        description: 'Upserts lead record using email as external ID. Updates lead status to "New - Uncontacted" and assigns owner based on territory rules.',
        gotcha: 'Batch updates during traffic spikes to avoid exhausting the company\'s 24-hour Salesforce API governor limits.'
      },
      {
        number: 5,
        title: 'Rep Alert & Speed-to-Lead SLA',
        tech: 'Slack Webhooks + Chili Piper / Calendly API',
        description: 'Pings the assigned rep in private Slack channel with company firmographics, LinkedIn profile, and a 1-click booking link.',
        gotcha: 'If the assigned rep doesn\'t claim the lead within 15 minutes, auto-escalate to a secondary round-robin pool.'
      }
    ],
    criticalEdgeCases: [
      'HTTP 429 Rate Limits from enrichment vendors',
      'Duplicate form submissions within 2 seconds (handled by Redis idempotency TTL)',
      'Salesforce nightly maintenance downtime (buffered by queue)'
    ]
  },
  {
    id: 'waterfall-enrichment-engine',
    title: '2. Cost-Optimized Waterfall Enrichment Engine',
    subtitle: 'Apollo ➔ Clay ➔ ZoomInfo Cascading with Strict Short-Circuiting',
    iconName: 'DollarSign',
    category: 'Data Enrichment & Cost Governance',
    summary: 'A multi-provider enrichment pipeline that cascades from cheapest to most expensive vendor, stopping the instant verified contact data is found to save tens of thousands in API costs.',
    interviewerQuestionPrompt: '"Our reps are complaining that lead data is incomplete, but our executive team wants to cut data vendor costs by 50%. How would you design an automated enrichment pipeline that maximizes contact fill rate while minimizing credit burn?"',
    metricsToQuote: [
      '62% reduction in data enrichment credit expenditure',
      '88% verified work email & direct-dial fill rate',
      'Sub-5-second execution latency with parallelized lookups'
    ],
    novalyteConnection: 'Built automated multi-sided clinic verification pipelines in Novalyte AI, checking local caches before calling external data verification APIs.',
    interviewAnswerScript: '"I design enrichment as a tiered waterfall with strict short-circuiting. Step 1 checks our internal Postgres cache for known domains. Step 2 queries low-cost providers like Apollo at 2 cents per match. If and only if a verified work email with 95%+ deliverability is not returned, the worker short-circuits to Tier 2 (Clay/People Data Labs). Only VIP enterprise accounts with ARR potential over $50k ever cascade to Tier 3 providers like ZoomInfo at 50 cents. This guarantees an 88%+ fill rate while slashing monthly API spend by over 60%."',
    steps: [
      {
        number: 1,
        title: 'Internal Cache & Domain Sanitization',
        tech: 'PostgreSQL + Redis Cache',
        description: 'Checks if this company domain or contact was already enriched in the past 30 days. If fresh, reuse cached data for $0 cost.',
        gotcha: 'Enforce a 30-to-60 day TTL on cached data so job changes and employee turnover don\'t go stale.'
      },
      {
        number: 2,
        title: 'Tier 1 Low-Cost Ingress Provider',
        tech: 'Apollo.io API (~$0.02 / call)',
        description: 'Queries Apollo for company firmographics (headcount, revenue, industry) and primary contact work email.',
        gotcha: 'Always verify SMTP deliverability score; never accept "catch-all" status without secondary verification.'
      },
      {
        number: 3,
        title: 'Short-Circuit Evaluation Gate',
        tech: 'TypeScript Schema Validation',
        description: 'Evaluates: Does the record now have a verified email and company size? If YES -> Skip all further steps immediately.',
        gotcha: 'Without this gate, code will greedily execute all vendors simultaneously, destroying your API budget.'
      },
      {
        number: 4,
        title: 'Tier 2 Mid-Tier Fallback Provider',
        tech: 'Clay / People Data Labs (~$0.10 / call)',
        description: 'Triggered only if Tier 1 failed or returned unverified. Gathers mobile phone numbers and verified alternate emails.',
        gotcha: 'Set a timeout of 2.5 seconds on third-party calls so slow APIs don\'t stall the entire queue.'
      },
      {
        number: 5,
        title: 'Tier 3 Premium Escalation Gate',
        tech: 'ZoomInfo Enterprise API (~$0.50 / call)',
        description: 'Reserved exclusively for target accounts matching Tier-1 ICP criteria (e.g. 500+ employees or tech stack matches).',
        gotcha: 'Never expose Tier 3 to unverified student or personal email submissions.'
      }
    ],
    criticalEdgeCases: [
      'Catch-all domains (e.g. Goldman Sachs) where SMTP ping returns true for any fake name',
      'API credit exhaustion alerts triggered at 80% quota',
      'Vendor API schema changes breaking downstream JSON parsers'
    ]
  },
  {
    id: 'l2a-deduplication',
    title: '3. Lead-to-Account (L2A) Matching & Deduplication',
    subtitle: 'Domain Normalization ➔ SQL Trigram Similarity ➔ Account Hierarchy',
    iconName: 'Database',
    category: 'CRM Architecture & Hygiene',
    summary: 'The algorithm that automatically pairs incoming leads with their parent corporate accounts in Salesforce or HubSpot, preventing duplicate accounts and routing conflicts.',
    interviewerQuestionPrompt: '"We have 150,000 duplicate leads and accounts across Salesforce. Reps are stepping on each other\'s toes and emailing existing customers. How would you design a programmatic Lead-to-Account matching and deduplication engine?"',
    metricsToQuote: [
      '94% automated match accuracy without human intervention',
      'Eliminated rep territory collisions by 100%',
      'Preserved CRM account ownership history and audit trails'
    ],
    novalyteConnection: 'Built entity resolution and relational matching in Novalyte AI between clinicians, medical groups, and multi-location practice entities.',
    interviewAnswerScript: '"I implement L2A matching in three deterministic tiers in PostgreSQL. First, exact corporate domain matching after stripping protocols, subdomains (like www/careers), and matching against our normalized domain index. Second, for leads with personal emails or subsidiary names, we execute fuzzy string matching using PostgreSQL pg_trgm trigram similarity above an 0.85 threshold on sanitized company names. Third, if an account exists, the lead is converted or linked, automatically inheriting the Account Executive, active customer flags, and territory SLAs. This completely eliminates rep collision."',
    steps: [
      {
        number: 1,
        title: 'Domain & Entity Normalization',
        tech: 'PostgreSQL Regex + tldts library',
        description: 'Normalizes "https://sub.acme.co.uk/jobs" into "acme.co.uk". Filters personal mail providers (Gmail, Outlook).',
        gotcha: 'Don\'t match on country-code TLDs alone; ensure full second-level domain extraction.'
      },
      {
        number: 2,
        title: 'Exact Domain Matching',
        tech: 'Indexed SQL Query on Account.WebsiteDomain',
        description: 'Performs instant indexed lookup against existing CRM Account records. 70% of inbound traffic resolves at this step.',
        gotcha: 'Accounts often have multiple secondary domains (e.g. google.com, alphabet.com); store an array of aliases.'
      },
      {
        number: 3,
        title: 'Fuzzy Entity Resolution (Fallback)',
        tech: 'PostgreSQL pg_trgm / Levenshtein Distance',
        description: 'For personal emails with company names (e.g. "Acme Corp, Inc."), computes trigram similarity against Account names. Matches if score > 0.85.',
        gotcha: 'Set a high threshold (0.85+) to avoid matching "Apex Medical" with "Apex Logistics".'
      },
      {
        number: 4,
        title: 'Parent/Child Account Hierarchy Routing',
        tech: 'Salesforce Ultimate Parent Account ID',
        description: 'Determines if the matched company is a subsidiary of a global parent. Routes according to parent enterprise contract.',
        gotcha: 'If the parent account is an active paid customer, route to the Account Manager, not an inbound SDR.'
      },
      {
        number: 5,
        title: 'CRM Linkage & Conflict-Free Assignment',
        tech: 'Salesforce Lead-to-Contact Conversion / Matched Account Lookup',
        description: 'Populates the Matched_Account__c lookup field on the Lead or auto-converts to Contact based on RevOps policy.',
        gotcha: 'Always leave an audit trail record stating why and when the match was made.'
      }
    ],
    criticalEdgeCases: [
      'Multi-entity conglomerates with identical names in different states/countries',
      'Free webmail addresses (e.g., doctor using personal email for private practice inquiry)',
      'Concurrent lead submissions racing to create the same new Account record'
    ]
  },
  {
    id: 'bi-directional-sync-guard',
    title: '4. Bi-Directional CRM Sync & Loop Prevention',
    subtitle: 'Salesforce ↔ HubSpot ↔ Postgres State Sync with Anti-Recursion Guards',
    iconName: 'ShieldCheck',
    category: 'Integration Resilience',
    summary: 'How to keep marketing (HubSpot) and sales (Salesforce) in perfect harmony without triggering infinite sync recursion loops that crash your systems and exhaust API limits.',
    interviewerQuestionPrompt: '"HubSpot and Salesforce are constantly overwriting each other\'s fields, and last week a webhook loop burned through 100,000 API calls in two hours. How do you architect a bulletproof bi-directional sync engine?"',
    metricsToQuote: [
      'Zero sync recursion incidents with integration user bypass',
      '99.9% field consistency between CRM and product database',
      'Deterministic conflict resolution via field-level SSOT matrix'
    ],
    novalyteConnection: 'Managed bi-directional state synchronization between Novalyte AI clinic portals and the centralized operational database.',
    interviewAnswerScript: '"Sync recursion happens when systems lack deterministic field ownership and integration user suppression. In my architecture, I establish a strict Single Source of Truth (SSOT) data contract: HubSpot owns top-of-funnel marketing fields, Salesforce owns opportunity and pipeline stages, and Product Postgres owns telemetry. Every automated write from our integration service is stamped with a dedicated integration user ID and an anti-recursion header. When an update webhook fires, the ingress worker immediately checks the last-modified user ID—if it matches our integration service, the event is dropped immediately. This guarantees zero feedback loops."',
    steps: [
      {
        number: 1,
        title: 'Single Source of Truth (SSOT) Matrix',
        tech: 'Data Contract & Field Permissions',
        description: 'Deterministic mapping defining which system is authoritative for each field. HubSpot writes "Lifecycle Stage"; Salesforce writes "Deal Stage".',
        gotcha: 'Never allow bi-directional two-way writes to the exact same field without an explicit master arbitration rule.'
      },
      {
        number: 2,
        title: 'Integration User Stamp & Bypass Filter',
        tech: 'System Integration User ID',
        description: 'All automated sync updates execute under a dedicated API user (e.g. "Integration_Bot").',
        gotcha: 'Incoming webhooks must inspect `LastModifiedById`. If modified by Integration_Bot, drop immediately.'
      },
      {
        number: 3,
        title: 'Redis Distributed Lock (Idempotency)',
        tech: 'Redis Redlock with 5-second TTL',
        description: 'Before writing an update to Record X in Salesforce, acquires a temporary lock in Redis on `lock:record_x`.',
        gotcha: 'Prevents race conditions where two simultaneous webhooks try to update the same record at the exact same millisecond.'
      },
      {
        number: 4,
        title: 'Delta Computation & Batch Patching',
        tech: 'JSON Diffing (jsondiffpatch)',
        description: 'Compares existing CRM record against incoming payload. Only sends fields that actually changed value.',
        gotcha: 'Blindly sending all 50 fields on every update triggers false field-history tracking entries in Salesforce.'
      },
      {
        number: 5,
        title: 'Audit Logging & Anomaly Detection',
        tech: 'PostgreSQL Audit Log + Slack Alerts',
        description: 'Logs all sync operations. If an individual record updates more than 5 times in 60 seconds, an automated circuit breaker trips.',
        gotcha: 'Circuit breakers protect your API quota by auto-pausing the sync worker if an abnormal frequency spike is detected.'
      }
    ],
    criticalEdgeCases: [
      'Sales rep manually editing a field in Salesforce while a webhook is in transit from HubSpot',
      'Picklist value mismatches (e.g. "United States" in HubSpot vs "USA" in Salesforce)',
      'Salesforce governor limits reached during month-end batch operations'
    ]
  },
  {
    id: 'ai-agent-gtm-mesh',
    title: '5. Autonomous AI Agent Mesh & PLG Telemetry',
    subtitle: 'Postgres Telemetry ➔ Model Context Protocol (MCP) ➔ AI Triage ➔ CRM',
    iconName: 'Cpu',
    category: 'AI Workflows & Product-Led Growth',
    summary: 'The modern frontier of GTM Engineering: Connecting product usage telemetry to LLM agents using Model Context Protocol (MCP) to automate account research and pipeline scoring.',
    interviewerQuestionPrompt: '"We have thousands of free users signing up for our product. How would you build an autonomous AI system that monitors product usage, qualifies accounts, and drafts customized outreach for our sales team?"',
    metricsToQuote: [
      '300% increase in outbound qualified pipeline velocity',
      'Automated 100% of initial prospect research and dossier preparation',
      'Sub-2-second tool-calling execution via Model Context Protocol (MCP)'
    ],
    novalyteConnection: 'Directly maps to your work building Novalyte AI\'s multi-sided ecosystem and Model Context Protocol (MCP) servers connecting operational databases with AI tool calling.',
    interviewAnswerScript: '"I build modern GTM AI pipelines using an event-driven agent mesh backed by the Model Context Protocol. When a user reaches an activation milestone in our product—like creating their fifth workspace—a Postgres trigger fires a webhook. Our GTM MCP server exposes validated tools for querying product telemetry, checking CRM account ownership, and running domain research. An LLM agent calls these tools, synthesizes a 3-bullet value hypothesis based on the user\'s real product actions, and updates the CRM record with a Product Qualified Account (PQA) score and pre-drafted outreach email. The sales rep simply reviews and hits send."',
    steps: [
      {
        number: 1,
        title: 'Product Activation Trigger',
        tech: 'PostgreSQL WAL / Supabase Realtime',
        description: 'Captures key high-intent user milestones (e.g. workspace created, 3 team members invited, export clicked).',
        gotcha: 'Filter out internal test accounts and bot activity before triggering expensive AI research loops.'
      },
      {
        number: 2,
        title: 'Model Context Protocol (MCP) Server',
        tech: '@modelcontextprotocol/sdk + TypeScript',
        description: 'Exposes secure, schema-validated tools (`get_account_telemetry`, `enrich_domain`, `update_crm_stage`) to LLM agents.',
        gotcha: 'Enforce strict schema validation on all MCP tool inputs using Zod to prevent LLM hallucinations from corrupting the CRM.'
      },
      {
        number: 3,
        title: 'Agentic Research & Synthesis',
        tech: 'Gemini 2.5 Flash / Claude Sonnet with Tool Calling',
        description: 'Agent scrapes target company website, evaluates tech stack fit, and identifies the likely economic buyer (e.g. VP Engineering).',
        gotcha: 'Use fast, cost-efficient models for initial qualification; reserve large models for final customized copy generation.'
      },
      {
        number: 4,
        title: 'PQA Scoring & Structured Extraction',
        tech: 'Zod JSON Schema Output',
        description: 'Outputs a structured JSON assessment: Product Qualified Account (PQA) score (1-100), intent summary, and recommended action.',
        gotcha: 'Always include fallback parsing; if the LLM output fails schema validation, flag for human review instead of crashing.'
      },
      {
        number: 5,
        title: 'Sales Engagement Dispatch',
        tech: 'Outreach / SalesLoft API + Slack Bot',
        description: 'Drafts a hyper-personalized email into the account executive\'s sequence task list and alerts the rep in Slack.',
        gotcha: 'Keep humans in the loop: have the rep click "Approve" rather than blasting automated cold emails blindly.'
      }
    ],
    criticalEdgeCases: [
      'LLM hallucinations generating fake company executive names',
      'API rate limits on LLM inference during high-volume product viral signups',
      'Security boundaries: Ensuring the MCP server cannot execute DROP or bulk UPDATE commands'
    ]
  }
];

export const BigFiveArchitectures: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(BIG_FIVE_SCENARIOS[0].id);
  const [activeStepNumber, setActiveStepNumber] = useState<number>(1);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const activeScenario = BIG_FIVE_SCENARIOS.find((s) => s.id === selectedScenarioId) || BIG_FIVE_SCENARIOS[0];

  const handleCopyScript = () => {
    navigator.clipboard.writeText(activeScenario.interviewAnswerScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl border border-stone-200 bg-gradient-to-r from-stone-900 via-stone-800 to-indigo-950 p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
            <Workflow className="h-3.5 w-3.5 text-indigo-400" />
            <span>90% of All GTM Engineer Interviews</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            The &quot;Big 5&quot; Master Architecture Walkthroughs
          </h1>
          <p className="text-sm md:text-base text-stone-300 leading-relaxed">
            In corporate tech interviews, almost every technical challenge is a variation of these five architectures. 
            Master the data flow, the gotchas, and the exact 60-second answer framework for each.
          </p>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-stone-100 p-2 rounded-2xl border border-stone-200">
        {BIG_FIVE_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => {
              setSelectedScenarioId(scenario.id);
              setActiveStepNumber(1);
            }}
            className={`flex flex-col items-start p-3 rounded-xl text-left transition ${
              selectedScenarioId === scenario.id
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200 font-bold'
                : 'text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 mb-0.5">
              {scenario.category}
            </span>
            <span className="text-xs line-clamp-2 leading-snug">{scenario.title}</span>
          </button>
        ))}
      </div>

      {/* Active Architecture Stage */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
        {/* Title & Interview Prompt Banner */}
        <div className="space-y-3 border-b border-stone-100 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {activeScenario.category}
              </span>
              <h2 className="text-xl font-extrabold text-stone-900 mt-0.5">{activeScenario.title}</h2>
              <p className="text-xs text-stone-500 font-medium">{activeScenario.subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeScenario.metricsToQuote.map((metric, idx) => (
                <span key={idx} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  📈 {metric}
                </span>
              ))}
            </div>
          </div>

          {/* The Interview Question */}
          <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>The Exact Question Interviewers Ask:</span>
            </div>
            <p className="text-xs text-amber-950 italic font-medium leading-relaxed">
              {activeScenario.interviewerQuestionPrompt}
            </p>
          </div>
        </div>

        {/* Visual Pipeline Interactive Flow (Steps 1 to 5) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-indigo-600" />
              Interactive Step-by-Step Architecture Pipeline:
            </span>
            <span className="text-[11px] text-stone-500 font-medium">Click any node to inspect data layer &amp; gotchas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
            {activeScenario.steps.map((step) => {
              const isSelected = activeStepNumber === step.number;

              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStepNumber(step.number)}
                  className={`rounded-2xl p-3.5 text-left border transition relative flex flex-col justify-between min-h-[120px] ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-stone-200 text-stone-700'
                      }`}>
                        Stage {step.number}
                      </span>
                      {step.number < 5 && (
                        <ArrowRight className="h-3 w-3 text-stone-400 hidden md:block" />
                      )}
                    </div>
                    <div className="font-bold text-xs text-stone-900 leading-snug">{step.title}</div>
                  </div>

                  <div className="text-[10px] font-mono text-indigo-700 line-clamp-1 font-medium mt-2">
                    {step.tech}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Node Detail Card */}
          {(() => {
            const activeStep = activeScenario.steps.find((s) => s.number === activeStepNumber) || activeScenario.steps[0];
            return (
              <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 p-4 space-y-3 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                      {activeStep.number}
                    </span>
                    <h4 className="font-extrabold text-stone-900 text-sm">{activeStep.title}</h4>
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                    Tech: {activeStep.tech}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-stone-900">What Happens Here:</span>
                    <p className="text-stone-700 leading-relaxed">{activeStep.description}</p>
                  </div>

                  <div className="space-y-1 bg-rose-50/70 p-3 rounded-xl border border-rose-200 text-rose-950">
                    <span className="font-bold flex items-center gap-1 text-rose-800">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Critical Edge Case / Gotcha to Defend:
                    </span>
                    <p className="leading-relaxed">{activeStep.gotcha}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* 60-Second "How to Say It" Soundbite Script */}
        <div className="rounded-2xl border border-stone-900 bg-stone-900 p-5 text-stone-100 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500 text-white font-bold text-xs">
                🎙️
              </span>
              <span className="font-extrabold text-white text-xs uppercase tracking-wider">
                60-Second Master Answer Script (Memorize This Framework)
              </span>
            </div>

            <button
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1 rounded-lg bg-stone-800 hover:bg-stone-700 px-2.5 py-1 text-xs font-bold text-stone-200 transition"
            >
              {copiedScript ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Script</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Script</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs leading-relaxed text-stone-200 font-serif italic bg-stone-800/80 p-3.5 rounded-xl border border-stone-700">
            {activeScenario.interviewAnswerScript}
          </p>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>
              <strong>Your Founder Connection:</strong> {activeScenario.novalyteConnection}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
