// lib/jargon-data.ts
// Plain-English GTM Engineering Dictionary & Interview Soundbite Bank

export type JargonCategory = 
  | 'Ingestion & Architecture' 
  | 'Enrichment & Waterfall' 
  | 'CRM & Data Hygiene' 
  | 'Business & Pipeline' 
  | 'AI & Modern Stack';

export interface JargonTerm {
  id: string;
  term: string;
  acronym?: string;
  category: JargonCategory;
  plainEnglish: string;
  whyCompaniesCare: string;
  jamilFounderHook: string;
  interviewSoundbite: string;
  relatedTools?: string[];
}

export const JARGON_DICTIONARY: JargonTerm[] = [
  // 1. Ingestion & Architecture
  {
    id: 'webhook-decoupling',
    term: 'Webhook Ingestion Decoupling',
    category: 'Ingestion & Architecture',
    plainEnglish: 'When a user submits a form, instead of making the user wait while you enrich the lead and write to Salesforce, you immediately return a 200 OK and push the payload into a background queue (like Redis or SQS) to process asynchronously.',
    whyCompaniesCare: 'If a CRM API is slow or temporarily down, marketing form submits won\'t fail or timeout. You never drop a paid inbound lead.',
    jamilFounderHook: 'Connects to Novalyte AI\'s asynchronous intake workers where patient requests are queued and processed without blocking user interactions.',
    interviewSoundbite: '"I always decouple ingress from execution using a message broker like Redis BullMQ or SQS. The webhook endpoint only acknowledges receipt and enqueues, ensuring 99.99% ingress uptime even during CRM maintenance."',
    relatedTools: ['Redis', 'BullMQ', 'AWS SQS', 'FastAPI', 'Node.js']
  },
  {
    id: 'idempotency',
    term: 'Idempotency Keys / Anti-Duplicate Execution',
    category: 'Ingestion & Architecture',
    plainEnglish: 'Ensuring that if a webhook sends the exact same payload 3 times (due to network retries or a user double-clicking submit), your system only creates ONE lead in the CRM and only charges you for ONE enrichment call.',
    whyCompaniesCare: 'Without idempotency, marketing campaigns duplicate contacts in Salesforce, spam prospects with duplicate automated emails, and double-bill API costs.',
    jamilFounderHook: 'Novalyte AI\'s webhook ingestion listeners used transaction UUID hashing to deduplicate clinic submissions.',
    interviewSoundbite: '"I generate a composite hash—usually MD5 of email plus event timestamp window—and store it as an idempotency key in Redis with a TTL. Any duplicate webhook retry is immediately dropped before triggering downstream CRM writes."',
    relatedTools: ['Redis TTL', 'PostgreSQL ON CONFLICT', 'MD5 Hashing']
  },
  {
    id: 'dead-letter-queue',
    term: 'Dead-Letter Queue (DLQ)',
    acronym: 'DLQ',
    category: 'Ingestion & Architecture',
    plainEnglish: 'A quarantine box for failed events. If an enrichment API or CRM write fails after 3 automatic retries with exponential backoff, the payload goes to a DLQ instead of vanishing so an engineer can inspect and replay it.',
    whyCompaniesCare: 'Zero data loss. High-intent enterprise demo requests never disappear into an error void.',
    jamilFounderHook: 'Novalyte AI\'s fallback error handlers and audit logs captured failed clinic webhook dispatches for replay.',
    interviewSoundbite: '"Failed worker jobs retry 3 times with exponential backoff and jitter. If they still fail, they land in a dead-letter queue with full context, alerting on-call via Slack so we can replay after third-party API recovery."',
    relatedTools: ['Redis BullMQ', 'AWS SQS DLQ', 'Slack Alerts']
  },
  {
    id: 'reverse-etl',
    term: 'Reverse ETL',
    category: 'Ingestion & Architecture',
    plainEnglish: 'Taking clean, aggregated data out of your data warehouse (BigQuery, Snowflake, Postgres) and syncing it back into operational business tools (Salesforce, HubSpot, Slack, Zendesk).',
    whyCompaniesCare: 'Sales reps don\'t write SQL. Reverse ETL puts product usage data (e.g. "User logged in 15 times this week") right onto the Salesforce lead record so reps know who to call.',
    jamilFounderHook: 'At Zendesk and Novalyte AI, querying SQL databases to populate executive dashboards and operational pipeline trackers.',
    interviewSoundbite: '"I use reverse ETL patterns—either via tools like Census/Hightouch or lightweight scheduled SQL syncs—to push telemetry and activation milestones directly into Salesforce contact fields so reps have real-time product context."',
    relatedTools: ['Census', 'Hightouch', 'BigQuery', 'PostgreSQL', 'HubSpot API']
  },

  // 2. Enrichment & Waterfall
  {
    id: 'waterfall-enrichment',
    term: 'Waterfall Enrichment',
    category: 'Enrichment & Waterfall',
    plainEnglish: 'A cascading sequence of data providers arranged by price or accuracy. You check Provider A (cheapest, e.g. Apollo at 2¢). If they don\'t have a verified work email or phone, you call Provider B (mid-tier, e.g. Clay/People Data Labs). If still missing, you call Provider C (expensive, e.g. ZoomInfo at 50¢).',
    whyCompaniesCare: 'Cuts data enrichment costs by 50% to 70% while maximizing email and phone fill rates for outbound reps.',
    jamilFounderHook: 'Novalyte AI\'s marketplace automated multi-provider lookups for clinic credentials and patient contact verification.',
    interviewSoundbite: '"I design enrichment as a tiered waterfall with strict short-circuiting. If Apollo yields a verified work email, we stop and never burn expensive ZoomInfo credits, slashing API expenditure by over 60%."',
    relatedTools: ['Clay', 'Apollo.io', 'ZoomInfo', 'Clearbit', 'Hunter.io']
  },
  {
    id: 'short-circuiting',
    term: 'Short-Circuiting in Enrichment',
    category: 'Enrichment & Waterfall',
    plainEnglish: 'Immediately stopping an enrichment sequence the moment your required criteria is satisfied. If Step 1 gives you a valid email, you don\'t run Step 2, 3, or 4.',
    whyCompaniesCare: 'Direct dollar savings on monthly SaaS API bills.',
    jamilFounderHook: 'Novalyte AI\'s validation pipelines exited early once verified clinic records were matched in cache.',
    interviewSoundbite: '"Short-circuiting is the first cost-governance rule in my enrichment architecture. Every step evaluates a schema validation gate before determining whether the next vendor call is strictly necessary."',
    relatedTools: ['Clay Tables', 'Node.js Promises', 'Python Asyncio']
  },
  {
    id: 'domain-stripping',
    term: 'Domain Normalization / MX Record Lookup',
    category: 'Enrichment & Waterfall',
    plainEnglish: 'Turning "jamil@google.com" into "google.com", or identifying that "jamil@gmail.com" is a free personal email and querying MX records to determine if it should be flagged or routed differently.',
    whyCompaniesCare: 'Corporate lead-to-account matching fails if you search for "google.com/" or "http://www.google.com" or try to match "gmail.com" to an enterprise account.',
    jamilFounderHook: 'PostgreSQL regex domain extraction and data hygiene scripts in Novalyte AI intake.',
    interviewSoundbite: '"I normalize domains at ingress: strip protocols, subdomains, and trailing paths, and cross-reference a blacklist of 4,000+ free email providers (Gmail, Yahoo, Outlook) so we don\'t mistakenly associate a personal email to an enterprise account."',
    relatedTools: ['PostgreSQL Regex', 'DNS MX Lookup', 'tldts', 'Zod']
  },

  // 3. CRM & Data Hygiene
  {
    id: 'lead-to-account-matching',
    term: 'Lead-to-Account (L2A) Matching',
    acronym: 'L2A',
    category: 'CRM & Data Hygiene',
    plainEnglish: 'When a new lead fills out a form, automatically finding the existing Company/Account record in your CRM and linking them, rather than creating an orphaned company or assigning them to the wrong sales rep.',
    whyCompaniesCare: 'If an existing $100,000 customer\'s VP fills out a form, you cannot have a junior BDR cold-call them treating them like a stranger. The account owner must get the lead immediately.',
    jamilFounderHook: 'Novalyte AI\'s multi-sided healthtech matching logic linking clinicians to parent hospital/network organizations.',
    interviewSoundbite: '"I implement L2A matching in three tiers: exact corporate domain match, fuzzy legal entity matching using Postgres trigram similarity, and IP reverse-DNS fallback. Once matched, the lead inherits the account owner and territory SLAs."',
    relatedTools: ['Salesforce Accounts', 'HubSpot Companies', 'PostgreSQL pg_trgm', 'LeanData']
  },
  {
    id: 'sync-recursion',
    term: 'Sync Recursion / Bi-Directional Sync Loop',
    category: 'CRM & Data Hygiene',
    plainEnglish: 'A catastrophic feedback loop where System A updates System B, which triggers an update webhook back to System A, which updates System B again, cycling thousands of times a minute.',
    whyCompaniesCare: 'Burns through daily API limits in 10 minutes, locks CRM record databases, causes massive overage charges, and corrupts timestamps.',
    jamilFounderHook: 'Handling bi-directional state sync between Novalyte AI clinic portals and the internal Revenue Command Center.',
    interviewSoundbite: '"To eliminate sync recursion, I enforce single-source-of-truth field ownership and stamp all automated updates with a bypass flag or dedicated integration user ID. If the last-modified user matches our integration service, downstream webhooks drop the event."',
    relatedTools: ['HubSpot Webhooks', 'Salesforce Apex Triggers', 'Redis Locks', 'Audit Logging']
  },
  {
    id: 'single-source-of-truth',
    term: 'Single Source of Truth (SSOT)',
    acronym: 'SSOT',
    category: 'CRM & Data Hygiene',
    plainEnglish: 'A strict rule declaring which system wins if there is a disagreement. For example: "Stripe owns Billing Status, Product owns Last Login Date, and Salesforce owns Deal Stage."',
    whyCompaniesCare: 'Prevents marketing and sales software from continuously overwriting each other\'s data.',
    jamilFounderHook: 'Novalyte AI\'s architectural separation: Supabase/Postgres as the primary data store, driving front-end and reporting clients.',
    interviewSoundbite: '"A healthy GTM architecture requires deterministic SSOT mapping. Product telemetry owns activation metrics, the billing gateway owns MRR, and the CRM owns deal stage. Systems only update their assigned domain to prevent split-brain conflicts."',
    relatedTools: ['Data Contracts', 'Salesforce Validation Rules', 'PostgreSQL Schemas']
  },
  {
    id: 'governor-limits',
    term: 'API Governor Limits & Rate Limits',
    category: 'CRM & Data Hygiene',
    plainEnglish: 'The hard ceiling on how many API calls a CRM or vendor lets you make per day or per second (e.g. Salesforce allows ~100k API calls/24h, HubSpot allows 100 requests/10 seconds).',
    whyCompaniesCare: 'If you blow the limit, your entire sales team\'s software stops working for the rest of the day.',
    jamilFounderHook: 'Managing API consumption and caching in Novalyte AI across external LLM and database connections.',
    interviewSoundbite: '"I design CRM writes with batching and token-bucket rate limiting. Instead of writing 500 individual single-record HTTP POSTs, we batch 200 records into a single composite API call, preserving over 90% of our daily Salesforce governor limits."',
    relatedTools: ['Salesforce Composite API', 'HubSpot Batch API', 'Token Bucket', 'Redis Rate Limiter']
  },

  // 4. Business & Pipeline
  {
    id: 'speed-to-lead',
    term: 'Speed-to-Lead SLA',
    acronym: 'SLA',
    category: 'Business & Pipeline',
    plainEnglish: 'The exact amount of time it takes between a high-intent prospect clicking "Request Demo" and a human sales rep reaching out via email, phone, or LinkedIn.',
    whyCompaniesCare: 'Industry data proves reaching out within 5 minutes increases conversion rates by 8x compared to waiting 30 minutes. If reps take 2 hours, the prospect has already booked a demo with your competitor.',
    jamilFounderHook: 'Novalyte AI\'s real-time notification engine alerting clinic coordinators within seconds of new patient inquiries.',
    interviewSoundbite: '"Speed-to-lead is our primary engineering metric. By decoupling ingestion and running parallel waterfall enrichment in under 8 seconds, we route demo requests to the assigned rep\'s Slack with an instant calendar booking link in under 45 seconds."',
    relatedTools: ['Slack Webhooks', 'Chili Piper', 'Calendly API', 'HubSpot Workflows']
  },
  {
    id: 'round-robin-routing',
    term: 'Round-Robin Lead Routing & Territory Assignment',
    category: 'Business & Pipeline',
    plainEnglish: 'Fairly and automatically distributing inbound leads among qualified sales reps based on region, company size, rep availability, and quota tier.',
    whyCompaniesCare: 'Prevents top reps from cherry-picking deals and ensures no lead sits unassigned while an Account Executive is on vacation.',
    jamilFounderHook: 'Zendesk sales ops round-robin ticket and opportunity assignment rules.',
    interviewSoundbite: '"I implement weighted round-robin routing with working-hours and calendar check integration. If a lead arrives after-hours or the assigned rep is OOO, it routes to a high-priority secondary triage queue to protect our SLA."',
    relatedTools: ['LeanData', 'Salesforce Assignment Rules', 'Chili Piper', 'Redis Counter']
  },
  {
    id: 'mrr-cac-payback',
    term: 'CAC Payback & LTV Attribution',
    acronym: 'CAC / LTV',
    category: 'Business & Pipeline',
    plainEnglish: 'Customer Acquisition Cost (CAC): How much money you spent on ads and sales reps to get one customer. CAC Payback: How many months of software subscriptions it takes to earn that money back.',
    whyCompaniesCare: 'Investors and executives evaluate GTM Engineers on how efficiently systems convert ad spend into cash flow.',
    jamilFounderHook: 'Novalyte AI\'s Revenue Command Center measuring conversion funnels and customer acquisition economics.',
    interviewSoundbite: '"Every architectural decision I make is tied to pipeline velocity and CAC efficiency—whether that is cutting $25k in annual enrichment credits or increasing inbound conversion by shaving 10 minutes off our response latency."',
    relatedTools: ['Stripe Billing', 'Salesforce Opportunities', 'BigQuery SQL', 'Tableau']
  },

  // 5. AI & Modern Stack
  {
    id: 'model-context-protocol',
    term: 'Model Context Protocol (MCP)',
    acronym: 'MCP',
    category: 'AI & Modern Stack',
    plainEnglish: 'An open standard that lets LLMs and AI agents securely read data and take actions inside your company\'s databases, CRMs, and dev tools using standardized tool-calling schemas.',
    whyCompaniesCare: 'The future of GTM is autonomous AI agents doing lead qualification, CRM updates, and prospecting research instead of manual human data entry.',
    jamilFounderHook: 'Novalyte AI\'s custom agent integrations and Model Context Protocol servers connecting internal databases to AI workflows.',
    interviewSoundbite: '"I build custom MCP servers that expose safe, schema-validated tools—like querying CRM account status or enriching a company domain—allowing internal AI agents to execute GTM triage while enforcing strict RBAC and input validation."',
    relatedTools: ['@modelcontextprotocol/sdk', 'TypeScript', 'FastAPI', 'Claude / Gemini']
  },
  {
    id: 'structured-llm-extraction',
    term: 'Structured LLM Extraction & JSON Schemas',
    category: 'AI & Modern Stack',
    plainEnglish: 'Using an AI model to read unstructured text (like a 2-paragraph freeform form submission or call transcript) and reliably output a clean, strict JSON object that can be written directly to database columns.',
    whyCompaniesCare: 'Turns messy customer notes into clean CRM dropdown fields (e.g. "Budget: $50k+", "Timeline: Next month", "Pain point: EHR integration") with 0 manual rep effort.',
    jamilFounderHook: 'Novalyte AI\'s structured intake forms translating conversational patient inputs into clinical action schemas.',
    interviewSoundbite: '"I leverage Gemini/OpenAI structured outputs with strict Pydantic or Zod schemas to parse open-ended demo request notes into categorized CRM fields with fallback validation on schema failure."',
    relatedTools: ['Zod', 'Pydantic', 'Gemini Structured Output', 'OpenAI Function Calling']
  },
  {
    id: 'agentic-prospecting',
    term: 'Agentic Research & Outbound Workflows',
    category: 'AI & Modern Stack',
    plainEnglish: 'Using an autonomous AI loop to browse target company career pages, 10-K filings, and tech stacks, synthesizing an exact personalized pitch before a sales rep even opens the record.',
    whyCompaniesCare: 'Allows 1 sales rep to send 500 personalized, high-context emails per week instead of 30 generic templates.',
    jamilFounderHook: 'Building autonomous outreach and multi-sided marketplace discovery pipelines in Novalyte AI.',
    interviewSoundbite: '"I orchestrate agentic workflows that ingest prospect domains, scrape public signals, synthesize a custom value hypothesis using LLMs, and push a pre-drafted personalized email directly into the rep\'s Outreach/SalesLoft sequence."',
    relatedTools: ['Claygent', 'Firecrawl', 'Gemini 2.5 Flash', 'Outreach API']
  }
];
