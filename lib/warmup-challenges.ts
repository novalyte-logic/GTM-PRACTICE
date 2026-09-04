export interface WarmupChallenge {
  id: string;
  title: string;
  category: 'Ingress & Dedup' | 'Clay Waterfalls' | 'CRM Sync Hygiene' | 'AI Agentic Workflows' | 'Webhook & Rate Limits' | 'Pipeline Telemetry';
  estimatedTime: string;
  difficulty: 'Quick Warm-up (3-5 min)';
  prompt: string;
  scenario: string;
  coreQuestion: string;
  suggestedThreePillars: {
    title: string;
    description: string;
    keyTerms: string[];
  }[];
  quickGotcha: string;
  idealTakeaway: string;
}

export const GTM_WARMUP_CHALLENGES: WarmupChallenge[] = [
  {
    id: 'warmup-clay-waterfall',
    title: 'Clay Waterfall Fallback & Cost Guard',
    category: 'Clay Waterfalls',
    estimatedTime: '4 min',
    difficulty: 'Quick Warm-up (3-5 min)',
    prompt: 'European B2B Lead Enrichment Waterfall',
    scenario: 'Your SDR outbound workflow triggers on European tech leads. You need verified work emails and mobile numbers, but data providers have disparate match rates and strict GDPR rules.',
    coreQuestion: 'How do you structure a 3-tier waterfall enrichment workflow in Clay to maximize match rates while minimizing API credit spend and respecting GDPR?',
    suggestedThreePillars: [
      {
        title: '1. Tiered Waterfall Sequencing',
        description: 'Sequence cheapest/highest EU-coverage provider first (e.g. Kaspr/Dropcontact for EU, fallback to Apollo, then Prospeo/Hunter only if null).',
        keyTerms: ['Conditional Waterfall', 'Cost Optimization', 'Match Rate']
      },
      {
        title: '2. GDPR & Verification Gate',
        description: 'Only call phone enrichment providers if the lead company domain is legally compliant and opt-out registry is clear. Pass all emails through Zerobounce.',
        keyTerms: ['ZeroBounce Verification', 'Catch-All Detection', 'GDPR Filter']
      },
      {
        title: '3. Webhook Batch Ingestion',
        description: 'Push only 100% verified enriched records to HubSpot/Salesforce in batches of 50 to avoid individual webhook latency.',
        keyTerms: ['Batch Push', 'Enriched Payload', 'CRM Upsert']
      }
    ],
    quickGotcha: 'Do not run all enrichment columns concurrently; execute downstream columns conditionally on the previous cell returning null.',
    idealTakeaway: 'Always design waterfalls with cost-order sequencing (free/cheap first, expensive last) and strict deliverability gates.'
  },
  {
    id: 'warmup-sf-governor-guard',
    title: 'High-Volume Webhook vs Salesforce Governor Limits',
    category: 'Webhook & Rate Limits',
    estimatedTime: '5 min',
    difficulty: 'Quick Warm-up (3-5 min)',
    prompt: '5,000 Inbound Lead Webhooks / Min',
    scenario: 'A viral webinar promotion triggers 5,000 lead score update webhooks per minute into your middleware. Salesforce has a daily 100,000 API call limit and row lock contention on Leads.',
    coreQuestion: 'How do you buffer and ingest this traffic into Salesforce without dropping leads or breaching governor limits?',
    suggestedThreePillars: [
      {
        title: '1. Asynchronous Queue Buffering',
        description: 'Ingest webhooks immediately into an Amazon SQS / Redis queue, acknowledging with HTTP 202 Accepted within 50ms.',
        keyTerms: ['SQS / Redis Buffer', 'HTTP 202 Accepted', 'Backpressure']
      },
      {
        title: '2. Bulk API 2.0 Micro-Batching',
        description: 'A background consumer aggregates queued updates every 60 seconds into a single Bulk API 2.0 batch of up to 10,000 records.',
        keyTerms: ['Salesforce Bulk API 2.0', 'Micro-batching', 'Governor Conservation']
      },
      {
        title: '3. Composite Upsert & Dedup',
        description: 'Use external ID (e.g., email_hash) to execute composite upserts, eliminating separate read-then-write lookups.',
        keyTerms: ['External ID Upsert', 'Composite Graph API', 'Row Lock Prevention']
      }
    ],
    quickGotcha: 'Directly calling Salesforce REST API per webhook will exhaust 100k daily limits in under 20 minutes.',
    idealTakeaway: 'Decouple high-velocity webhook ingestion from CRM writes using asynchronous queuing and Bulk API batching.'
  },
  {
    id: 'warmup-idempotent-stripe',
    title: 'Idempotent Webhook Receiver for Billing MRR',
    category: 'Ingress & Dedup',
    estimatedTime: '4 min',
    difficulty: 'Quick Warm-up (3-5 min)',
    prompt: 'Duplicate & Out-of-Order Webhook Delivery',
    scenario: 'Stripe delivers subscription lifecycle webhooks (customer.subscription.updated) to your GTM service. Due to network retries, duplicate and out-of-order events occur.',
    coreQuestion: 'How do you guarantee that HubSpot deal MRR and customer lifecycle status are updated accurately and idempotently?',
    suggestedThreePillars: [
      {
        title: '1. Deduplication Cache via Redis',
        description: 'Store incoming Stripe Event ID (evt_xxx) in Redis with a 48-hour TTL. If key exists, return HTTP 200 immediately without reprocessing.',
        keyTerms: ['Redis SETNX', 'Event ID Dedup', 'Idempotency Key']
      },
      {
        title: '2. Monotonic Timestamp Verification',
        description: 'Inspect event.created timestamp against the last_processed_stripe_ts on the CRM company object. Discard older out-of-sequence events.',
        keyTerms: ['Monotonic Clock', 'Out-of-Order Detection', 'Event Sequence']
      },
      {
        title: '3. Dead-Letter Queue & Audit Log',
        description: 'Route payload parse failures to a DLQ for investigation, keeping an append-only audit trail in Postgres.',
        keyTerms: ['Dead-Letter Queue (DLQ)', 'Audit Trail', 'Sentry Alerting']
      }
    ],
    quickGotcha: 'Never rely on webhook arrival order; network packet re-routing can deliver an invoice.paid before customer.created.',
    idealTakeaway: 'Idempotency requires event ID caching plus timestamp ordering before any CRM mutation.'
  },
  {
    id: 'warmup-intent-slack-alert',
    title: 'Real-Time 6sense Intent Routing to Slack',
    category: 'Pipeline Telemetry',
    estimatedTime: '4 min',
    difficulty: 'Quick Warm-up (3-5 min)',
    prompt: '15-Second SLA High-Intent Alerting',
    scenario: '6sense detects a Tier-1 target account browsing the pricing page. You need to alert the dedicated Account Executive in Slack with decision-maker contacts within 15 seconds.',
    coreQuestion: 'Design the real-time routing pipeline from 6sense webhook to AE Slack channel without spamming duplicate alerts.',
    suggestedThreePillars: [
      {
        title: '1. Real-Time Webhook & CRM Lookup',
        description: 'Webhook triggers serverless function. Query Salesforce via indexed domain to retrieve Account Owner ID and open opportunity stage.',
        keyTerms: ['Account Owner Lookup', 'Indexed Domain Query', 'Routing Logic']
      },
      {
        title: '2. 12-Hour Cooldown Filter',
        description: 'Check Redis cache for (domain + intent_alert_sent). If alerted within 12 hours, suppress notification to prevent Slack alert fatigue.',
        keyTerms: ['Cooldown Debounce', 'Alert Fatigue Guard', 'Redis TTL']
      },
      {
        title: '3. Rich Slack Block Kit Notification',
        description: 'Send Slack Block Kit card with company name, pages visited, buying stage, and 1-click Clay enrichment trigger button for AE.',
        keyTerms: ['Slack Block Kit', 'Interactive Button', 'Speed-to-Lead SLA']
      }
    ],
    quickGotcha: 'Without a deduplication cooldown, a visitor browsing 10 pages in 5 minutes will trigger 10 redundant Slack pings to the rep.',
    idealTakeaway: 'Always pair real-time intent alerting with an intelligent cooldown filter and contextual CRM ownership resolution.'
  },
  {
    id: 'warmup-agentic-lead-research',
    title: 'Agentic LLM Lead Research with Latency Fallback',
    category: 'AI Agentic Workflows',
    estimatedTime: '5 min',
    difficulty: 'Quick Warm-up (3-5 min)',
    prompt: 'LLM 10-K & Job Board Signal Summarizer',
    scenario: 'You are deploying an automated LLM researcher that reads 10-K filings and open job posts to generate custom value props for SDR emails. The LLM latency sometimes exceeds 12 seconds or encounters rate limit errors.',
    coreQuestion: 'How do you architect this agentic pipeline so SDR sequence generation never blocks or fails silently?',
    suggestedThreePillars: [
      {
        title: '1. Asynchronous Background Worker',
        description: 'Trigger research via background queue (BullMQ/Temporal). Never block the SDR UI or the webhook ingress synchronously.',
        keyTerms: ['Temporal / BullMQ', 'Background Worker', 'Async Polling']
      },
      {
        title: '2. Tiered Model & Prompt Fallback',
        description: 'Try primary reasoning model (e.g. Gemini 1.5 Pro). If timeout > 6s, fallback to Gemini Flash with concise template prompt.',
        keyTerms: ['Model Cascading', 'Timeout Circuit Breaker', 'Fallback Prompt']
      },
      {
        title: '3. Human-in-the-Loop Review Tag',
        description: 'If LLM confidence score < 0.7 or extraction fails, flag record as "Needs Review" in Apollo/HubSpot with a fallback standardized template.',
        keyTerms: ['Confidence Score', 'Human-in-the-Loop', 'Template Fallback']
      }
    ],
    quickGotcha: 'Do not put LLM calls on the critical path of inbound demo booking or live API webhooks.',
    idealTakeaway: 'Agentic pipelines must run asynchronously with cascading model fallbacks and clear human review flags.'
  },
  {
    id: 'warmup-crm-merge-dedup',
    title: 'Automated Lead-to-Account Deduplication & Merge',
    category: 'CRM Sync Hygiene',
    estimatedTime: '4 min',
    difficulty: 'Quick Warm-up (3-5 min)',
    prompt: 'Conflicting Lead & Contact Object Records',
    scenario: 'Two SDRs simultaneously entered conflicting Lead records for the VP of Engineering at an enterprise account, one with personal Gmail and one with corporate email.',
    coreQuestion: 'How do you design an automated deduplication and merge pipeline that preserves activity history, attribution, and assignment rules?',
    suggestedThreePillars: [
      {
        title: '1. Composite Key Match Algorithm',
        description: 'Match on normalized (Last Name + Apex Company Domain), or LinkedIn profile URL if emails differ.',
        keyTerms: ['Apex Domain Matching', 'LinkedIn URL Key', 'Fuzzy Matching']
      },
      {
        title: '2. Survivor Record Selection Rules',
        description: 'Determine master record based on: 1) Existing Opportunity association, 2) Most recent activity, 3) Verified corporate email domain.',
        keyTerms: ['Survivor Rules', 'Master Record Governance', 'Field Survivorship']
      },
      {
        title: '3. Activity History Reparenting & Audit',
        description: 'Reparent all open tasks, email logs, and attribution touchpoints onto survivor Contact before soft-deleting duplicate Lead.',
        keyTerms: ['Activity Reparenting', 'Multi-Touch Attribution', 'Audit Log']
      }
    ],
    quickGotcha: 'Hard-deleting duplicates without re-linking campaign member records ruins your multi-touch attribution reporting.',
    idealTakeaway: 'Deduplication requires strict survivorship rules and automated activity reparenting to safeguard revenue attribution.'
  }
];
