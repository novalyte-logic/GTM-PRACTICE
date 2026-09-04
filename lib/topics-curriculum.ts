// lib/topics-curriculum.ts
// Exhaustive 28-Topic Mastery Curriculum for GTM Systems Engineers

export interface ArchitectureStep {
  stepNumber: number;
  title: string;
  tech: string;
  description: string;
}

export interface PracticeQuestion {
  question: string;
  starScript: string;
  cribSheetBuzzwords: string[];
}

export interface GTMTopic {
  id: string;
  title: string;
  category: 
    | 'Ingestion & Edge'
    | 'Enrichment & Cost'
    | 'CRM Hygiene & Identity'
    | 'Routing & SLAs'
    | 'Sync & Resilience'
    | 'PLG & Reverse ETL'
    | 'Outbound & Intent'
    | 'AI & Model Context Protocol (MCP)';
  plainEnglish: string;
  whyCompaniesCare: string;
  founderProofPoint: string;
  seniorSoundbite: string;
  gotchaToDefend: string;
  metricsToQuote: string[];
  architectureSteps: ArchitectureStep[];
  practiceQuestions: PracticeQuestion[];
}

export const TOPIC_CATEGORIES = [
  'All',
  'Ingestion & Edge',
  'Enrichment & Cost',
  'CRM Hygiene & Identity',
  'Routing & SLAs',
  'Sync & Resilience',
  'PLG & Reverse ETL',
  'Outbound & Intent',
  'AI & Model Context Protocol (MCP)'
] as const;

export const GTM_TOPICS: GTMTopic[] = [
  // ==========================================
  // 1. INGESTION & EDGE (4 Topics)
  // ==========================================
  {
    id: 'webhook-decoupling',
    title: 'Webhook Ingestion Decoupling & Queue Buffering',
    category: 'Ingestion & Edge',
    plainEnglish: 'When a prospective buyer fills out a website form, your server immediately answers "Got it!" (HTTP 200/202) and drops the data into a high-speed waiting line (Redis or SQS) so background workers can do the heavy lifting without making the user wait.',
    whyCompaniesCare: 'If Salesforce or HubSpot is slow or taking 3 seconds to respond, marketing forms will timeout and high-value inbound leads get dropped. Decoupling protects marketing spend and guarantees 99.99% ingress uptime.',
    founderProofPoint: 'At Novalyte AI, built asynchronous event ingestion queues in Redis to absorb sudden traffic spikes of clinic intake requests without stalling the user UI.',
    seniorSoundbite: '"I never allow synchronous CRM writes inside an ingress webhook handler. I decouple ingestion using an asynchronous broker like Redis BullMQ or AWS SQS, returning HTTP 202 in under 40 milliseconds."',
    gotchaToDefend: 'Worker starvation and backpressure: If the queue grows faster than workers can process, or if downstream Salesforce APIs start rate-limiting, you need auto-scaling worker consumers and token-bucket throttling to prevent out-of-memory crashes.',
    metricsToQuote: ['<40ms Webhook Response Latency', '99.99% Ingress Uptime', 'Zero Dropped Inbound Leads'],
    architectureSteps: [
      { stepNumber: 1, title: 'Edge Webhook Gateway', tech: 'Next.js API Route / Cloudflare Worker', description: 'Receives raw POST from Webflow or Typeform, runs fast Zod schema validation.' },
      { stepNumber: 2, title: 'In-Memory Buffer', tech: 'Redis BullMQ / AWS SQS', description: 'Pushes validated payload into persistent queue with exponential backoff configuration.' },
      { stepNumber: 3, title: 'Async Consumer Worker', tech: 'Node.js / Python Background Worker', description: 'Pulls jobs off queue at a controlled concurrency rate (e.g. max 20 concurrent jobs).' },
      { stepNumber: 4, title: 'Downstream Dispatch', tech: 'Salesforce Composite API', description: 'Batches multiple records together to conserve daily API governor limits.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you prevent inbound demo request forms from timing out when Salesforce is under scheduled maintenance or experiencing downtime?',
        starScript: 'Situation: During product launches, webhooks can overwhelm synchronous CRM handlers. Task: Guarantee 100% ingress resilience without losing leads. Action: Decoupled the webhook into an API gateway that responds 202 Accepted in 35ms after appending to Redis BullMQ with persistent disk storage. Result: During CRM downtime, 10,000+ leads remained safe in the queue and were drained automatically upon recovery.',
        cribSheetBuzzwords: ['HTTP 202 Accepted', 'Redis BullMQ', 'Decoupled Queue', 'Worker Backpressure']
      },
      {
        question: 'What telemetry and health monitoring do you set up on an ingestion queue to detect backpressure?',
        starScript: 'I monitor three key metrics: Queue Depth (number of waiting jobs), Processing Latency (time from enqueue to completion), and Dead-Letter Queue error rate. If queue depth exceeds 500 items or latency exceeds 45 seconds, an automated PagerDuty/Slack alert fires and spins up secondary worker pods.',
        cribSheetBuzzwords: ['Queue Depth', 'P95 Processing Latency', 'Dead-Letter Alerting', 'Auto-scaling Pods']
      }
    ]
  },

  {
    id: 'idempotency-keys',
    title: 'Idempotency Keys & Anti-Duplicate Execution',
    category: 'Ingestion & Edge',
    plainEnglish: 'Generating a unique digital fingerprint for every incoming lead so that if a user double-clicks submit or an external server sends the same event 4 times, your system only creates ONE record and only spends money on ONE enrichment call.',
    whyCompaniesCare: 'Saves thousands of dollars on duplicate data vendor calls and stops embarrassing bugs where sales reps receive 3 duplicate notifications for the same prospect.',
    founderProofPoint: 'Engineered transaction hashing and Redis idempotency locks in Novalyte AI to ensure patient appointment reservations could never be double-booked.',
    seniorSoundbite: '"Every mutation in my architecture requires an idempotency key—calculated as a deterministic hash of the payload signature and timestamp window—preventing duplicate writes across network retries."',
    gotchaToDefend: 'Clock drift and key collisions: Setting the TTL too short allows duplicate submissions separated by a few seconds; setting it too long wastes Redis memory. A 24-hour TTL keyed on `email:form_id:date_bucket` provides optimal balance.',
    metricsToQuote: ['100% Duplicate Prevention', 'Zero Redundant Vendor API Calls', '48-hour Safe Idempotency Window'],
    architectureSteps: [
      { stepNumber: 1, title: 'Payload Hash Computation', tech: 'SHA-256 / MD5 Hash', description: 'Extracts core business identity (email, event_type, date_hour) and calculates hash.' },
      { stepNumber: 2, title: 'Atomic Redis SETNX Check', tech: 'Redis SET NX EX (48h TTL)', description: 'Attempts atomic key reservation. If key exists, immediately aborts and returns cached response.' },
      { stepNumber: 3, title: 'Stateful Lock Acquisition', tech: 'Redlock / Distributed Mutex', description: 'Guarantees that two concurrent requests with identical hashes cannot both proceed.' },
      { stepNumber: 4, title: 'Execution & Cache Result', tech: 'PostgreSQL / CRM Upsert', description: 'Writes record to CRM and stores execution receipt in cache for future duplicate calls.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you handle rapid double-clicks on a "Book Demo" webform that sends identical requests within 200 milliseconds?',
        starScript: 'I use atomic Redis SETNX with an idempotency key derived from the user email and form submission ID. The first request acquires the lock and sets a 24-hour TTL; the second request received 150ms later sees the key already set and is dropped safely with an HTTP 200 acknowledging receipt.',
        cribSheetBuzzwords: ['Redis SETNX', 'Payload Fingerprint', 'Atomic Mutex', '48h TTL']
      }
    ]
  },

  {
    id: 'dead-letter-queues',
    title: 'Dead-Letter Queues (DLQ) & Poison-Pill Handling',
    category: 'Ingestion & Edge',
    plainEnglish: 'A specialized safety quarantine box where malformed or failing events are placed after exhausting automatic retries, so broken events do not block the entire line or disappear forever.',
    whyCompaniesCare: 'Ensures zero revenue leakage. When a high-value enterprise prospect submits an unexpectedly formatted phone number or company name that crashes the JSON parser, the lead is preserved and flagged for 1-click inspection.',
    founderProofPoint: 'Constructed automated error-catching pipelines and DLQ replay monitors in Novalyte AI that logged unhandled clinic payloads for instant recovery.',
    seniorSoundbite: '"In an asynchronous GTM pipeline, unhandled exceptions must never drop data. Every failing job undergoes three exponential retries with jitter before safe eviction to a dead-letter queue with rich observability."',
    gotchaToDefend: 'Poison-pill loops: If an unhandled schema error causes the worker to crash repeatedly without moving to the DLQ, it locks up the worker queue. Workers must catch errors and isolate the offending payload.',
    metricsToQuote: ['0% Data Loss On Unhandled Schemas', '3-Tier Exponential Backoff', '<15min Mean Time to DLQ Replay'],
    architectureSteps: [
      { stepNumber: 1, title: 'Worker Try/Catch Boundary', tech: 'Node.js Async Worker', description: 'Wraps vendor and CRM calls in resilient retry policies.' },
      { stepNumber: 2, title: 'Exponential Backoff with Jitter', tech: 'BullMQ Retry Policy (2s, 8s, 32s)', description: 'Retries transient network and 503 errors without pounding the upstream API simultaneously.' },
      { stepNumber: 3, title: 'DLQ Eviction & Slack Alarm', tech: 'Redis DLQ + Webhook Bot', description: 'Moves failed payload to dead-letter queue and alerts engineering Slack channel with stack trace.' },
      { stepNumber: 4, title: 'Admin Replay Console', tech: 'CLI / Admin Dashboard UI', description: 'Allows RevOps or engineers to fix the schema or API key and replay the queue with 1 click.' }
    ],
    practiceQuestions: [
      {
        question: 'Walk me through your error recovery strategy when an external enrichment vendor suddenly changes their JSON response schema without notice.',
        starScript: 'When Apollo or Clay changes their schema, Zod runtime validation fails in our worker. Instead of crashing, the worker captures the raw response, retries twice, and on failure moves the lead into a Redis DLQ while alerting our Slack channel. The lead is still written to Salesforce with raw metadata so the rep gets alerted, while engineering updates the schema parser.',
        cribSheetBuzzwords: ['Zod Runtime Schema', 'Exponential Backoff', 'Slack Pager Alert', 'DLQ Replay Console']
      }
    ]
  },

  {
    id: 'rate-limiting-token-buckets',
    title: 'API Rate Limiting, Token Buckets & Governor Limits',
    category: 'Ingestion & Edge',
    plainEnglish: 'A digital traffic cop that meters how fast your code speaks to third-party tools (like Salesforce, HubSpot, or Apollo) so you never breach their daily limits (e.g. 100k calls/day) or trigger HTTP 429 "Too Many Requests" errors.',
    whyCompaniesCare: 'If an engineer accidentally triggers 100,000 API calls in one hour, Salesforce will freeze all company integrations for the rest of the day, halting sales reps and customer support.',
    founderProofPoint: 'Maintained strict rate limiting and token caching across Novalyte AI\'s LLM inference queries and database connections.',
    seniorSoundbite: '"I protect our CRM governor limits by implementing sliding-window rate limiters and micro-batching. We convert 500 individual HTTP calls into a single Salesforce Composite batch, conserving 95% of our daily quota."',
    gotchaToDefend: 'Burst traffic vs sustained ceiling: Token bucket handles bursts well, but if daily volume approaches 80% of Salesforce daily limits, the system must throttle non-critical background jobs (like night syncs) in favor of real-time speed-to-lead.',
    metricsToQuote: ['95% API Quota Conservation via Batching', 'Zero HTTP 429 Lockouts', 'Sliding Window Token Bucket'],
    architectureSteps: [
      { stepNumber: 1, title: 'Global Quota Tracker', tech: 'Redis sliding-window counter', description: 'Tracks rolling 24-hour API call consumption against vendor quota ceiling.' },
      { stepNumber: 2, title: 'Token Bucket Governor', tech: 'Bottleneck / RateLimiter', description: 'Ensures outbound requests to Salesforce never exceed 25 requests per second.' },
      { stepNumber: 3, title: 'Composite Micro-Batcher', tech: 'Salesforce Composite API', description: 'Bundles up to 25 sObject operations into one single HTTP payload.' },
      { stepNumber: 4, title: 'Priority Lane Routing', tech: 'Dual Queue (VIP vs Bulk)', description: 'Real-time demo requests skip the line; nightly historical updates pause automatically if quota > 80%.' }
    ],
    practiceQuestions: [
      {
        question: 'Your sales VP complains that during end-of-month reporting, real-time lead routing stalled. How do you investigate and fix this?',
        starScript: 'I investigate our Salesforce API usage logs to see if heavy reporting or mass updates exhausted our daily limit. To fix this permanently, I implement a dual-lane queue: Priority Lane for real-time speed-to-lead that is always allocated 20% reserved token budget, and Background Lane for batch syncs that automatically pauses when quota consumption exceeds 80%.',
        cribSheetBuzzwords: ['Composite API Batching', 'Priority Lane Reservation', 'Sliding Window Rate Limit', '80% Quota Circuit Breaker']
      }
    ]
  },

  // ==========================================
  // 2. ENRICHMENT & COST (4 Topics)
  // ==========================================
  {
    id: 'waterfall-enrichment',
    title: 'Tiered Waterfall Cascades & Short-Circuiting',
    category: 'Enrichment & Cost',
    plainEnglish: 'A step-by-step ladder of data providers arranged from cheapest to most expensive. You check the 2-cent provider first; if they find a verified email, you stop immediately and never spend 50 cents on the premium vendor.',
    whyCompaniesCare: 'Cuts tens of thousands of dollars off annual data vendor bills (ZoomInfo, Clay, Apollo) while maintaining an 85%+ contact data match rate.',
    founderProofPoint: 'Automated multi-sided credential verification in Novalyte AI, checking local PostgreSQL database cache before paying for third-party API lookups.',
    seniorSoundbite: '"I design enrichment pipelines around strict short-circuiting. If our internal Postgres cache or Tier 1 provider returns a validated contact, we terminate the waterfall immediately, slashing monthly credit consumption by over 60%."',
    gotchaToDefend: 'Partial matches and false positive deliverability: Apollo might return an email that has a "catch-all" status. If you short-circuit prematurely, the sales rep bounces the email. Short-circuit logic must verify deliverability status, not just string presence.',
    metricsToQuote: ['62% Reduction in API Credit Spend', '88% Contact Fill Rate', '<4s Waterfall Execution'],
    architectureSteps: [
      { stepNumber: 1, title: 'Internal Cache Lookup', tech: 'PostgreSQL / Redis (30-day TTL)', description: 'Checks if domain or contact was enriched within the last 30 days. $0 cost.' },
      { stepNumber: 2, title: 'Tier 1 Low-Cost Ingress', tech: 'Apollo.io API (~$0.02 / call)', description: 'Queries company firmographics and primary contact email.' },
      { stepNumber: 3, title: 'Deliverability Evaluation Gate', tech: 'Validation Rule', description: 'Checks: Email present AND SMTP score >= 90%? If YES -> Stop waterfall.' },
      { stepNumber: 4, title: 'Tier 2 Mid-Tier Fallback', tech: 'Clay / People Data Labs (~$0.10)', description: 'Triggered only if Tier 1 returned null or low confidence.' },
      { stepNumber: 5, title: 'Tier 3 Premium Escalation', tech: 'ZoomInfo Enterprise (~$0.50)', description: 'Reserved exclusively for Tier-1 Enterprise target accounts (>500 employees).' }
    ],
    practiceQuestions: [
      {
        question: 'Design an enrichment waterfall that maximizes rep phone number coverage without running out of ZoomInfo credits halfway through the month.',
        starScript: 'I gate ZoomInfo behind firmographic criteria. First, Apollo enriches company size and revenue for 2 cents. If the company is sub-100 employees, we stop there. If the company is Enterprise (>500 employees or >$50M revenue) AND the role is VP/C-Suite, the worker cascades to ZoomInfo for verified direct dials. This protects budget while arming enterprise reps with top-tier data.',
        cribSheetBuzzwords: ['Firmographic Gating', 'Short-Circuit Evaluation', 'Tiered Cost Hierarchy', 'Internal Cache TTL']
      }
    ]
  },

  {
    id: 'domain-normalization',
    title: 'Domain Normalization & Free Webmail Filtering',
    category: 'Enrichment & Cost',
    plainEnglish: 'Cleaning up messy email inputs by stripping out extra web stuff (turning "https://careers.acme.co.uk/" into "acme.co.uk") and knowing that "jamil@gmail.com" is a personal address that should not be matched to an enterprise company.',
    whyCompaniesCare: 'Without normalization, matching fails. Leads get assigned to the wrong account or create duplicate accounts in Salesforce, creating rep territory fights.',
    founderProofPoint: 'Engineered regex URL cleaners and domain normalization routines in Novalyte AI to reconcile clinic web portals.',
    seniorSoundbite: '"I normalize domains using second-level domain parsers and cross-reference a blacklist of over 4,000 public email providers to prevent personal mailboxes from corrupting enterprise account hierarchies."',
    gotchaToDefend: 'Country-code Top-Level Domains (ccTLDs): Stripping `.co.uk`, `.com.au`, or `.ac.jp` incorrectly as a simple string split breaks the domain. You must use a dedicated public suffix library like `tldts`.',
    metricsToQuote: ['99.8% Domain Resolution Accuracy', '4,000+ Filtered Webmail Providers', 'Zero False Enterprise Matches'],
    architectureSteps: [
      { stepNumber: 1, title: 'Protocol & Path Stripper', tech: 'Regex / URL Parser', description: 'Removes http://, https://, www., paths, and trailing slashes.' },
      { stepNumber: 2, title: 'Public Suffix Extraction', tech: 'tldts npm library', description: 'Extracts true second-level domain (e.g. acme.co.uk instead of co.uk).' },
      { stepNumber: 3, title: 'Webmail Blacklist Check', tech: 'Redis Set Lookup (O(1))', description: 'Checks domain against 4,000+ known free mailboxes (gmail, yahoo, protonmail).' },
      { stepNumber: 4, title: 'Corporate Routing Flag', tech: 'PostgreSQL Boolean Flag', description: 'Flags record as "Corporate Domain" vs "Personal Lead" for distinct downstream routing.' }
    ],
    practiceQuestions: [
      {
        question: 'A doctor submits a demo request using a Gmail address but enters their private practice clinic name in the form. How do you route this lead correctly?',
        starScript: 'Our ingress parser identifies gmail.com as a public webmail domain and skips domain-based account matching. It then evaluates the form\'s "Company Name" field, running a PostgreSQL trigram similarity search against existing clinic accounts. If a high-confidence match is found, the lead is linked to the clinic account; otherwise, it is routed to an inbound qualification queue with a personal email flag.',
        cribSheetBuzzwords: ['Public Suffix List', 'Trigram Similarity Search', 'Personal Email Flag', 'Domain Blacklist']
      }
    ]
  },

  {
    id: 'smtp-deliverability',
    title: 'SMTP Deliverability, MX Records & Catch-All Verification',
    category: 'Enrichment & Cost',
    plainEnglish: 'Checking whether an email address actually exists before sending a message, checking mail server (MX) records, and spotting "catch-all" servers that pretend every email address is real.',
    whyCompaniesCare: 'If sales reps send emails to dead addresses and bounce rates exceed 2%, Google and Microsoft will black-list your company domain, landing all outbound emails in the spam folder.',
    founderProofPoint: 'Configured transactional and notification email deliverability safeguards at Novalyte AI, enforcing SPF, DKIM, and deliverability verification.',
    seniorSoundbite: '"Before any contact is pushed to an outbound sequencer, my pipeline validates DNS MX records and runs deep SMTP handshakes to ensure deliverability exceeds 95% and protect domain sender reputation."',
    gotchaToDefend: 'Catch-all domains: Companies like Goldman Sachs or Apple configure mail servers to accept all incoming messages (HTTP 250 OK) even if the person doesn\'t work there. You must run secondary signal checks (LinkedIn tenure, Apollo last-seen date) on catch-all domains.',
    metricsToQuote: ['<1.5% Outbound Bounce Rate', 'Domain Reputation 99/100', 'Automatic Catch-All Detection'],
    architectureSteps: [
      { stepNumber: 1, title: 'DNS MX Record Probe', tech: 'Node.js dns.resolveMx', description: 'Verifies the domain has active mail exchange servers configured.' },
      { stepNumber: 2, title: 'SMTP Handshake Emulation', tech: 'ZeroBounce / NeverBounce API', description: 'Sends VRFY or RCPT TO commands without sending actual email payload.' },
      { stepNumber: 3, title: 'Catch-All Detection', tech: 'Randomized Address Ping', description: 'Pings a fake address (e.g. `xyz987@domain.com`). If it accepts, flags domain as Catch-All.' },
      { stepNumber: 4, title: 'Deliverability Scoring', tech: 'Zod Deliverability Contract', description: 'Requires score >= 90% before allowing auto-enrollment in outbound sales sequences.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you protect your sales team\'s email domain reputation when ramping up cold outbound campaigns from 500 to 5,000 emails per day?',
        starScript: 'I enforce a three-part deliverability guard: First, zero emails are sent without pre-flight SMTP deliverability verification. Second, leads on catch-all domains are routed to manual review rather than auto-sequencing. Third, we distribute outbound volume across secondary sending domains with warmed-up DKIM and SPF records, keeping hard bounces strictly below 1.5%.',
        cribSheetBuzzwords: ['Catch-All Validation', 'DNS MX Lookup', 'Secondary Sending Domains', 'SPF/DKIM/DMARC']
      }
    ]
  },

  {
    id: 'technographic-scraping',
    title: 'Technographic Scraping & Tech Stack Intent',
    category: 'Enrichment & Cost',
    plainEnglish: 'Automatically detecting what software a target company uses (e.g. they use Salesforce, Stripe, and React) by scanning their website code and job posts, so reps know their exact tech stack before hopping on a call.',
    whyCompaniesCare: 'Reps can open meetings with hyper-relevant questions ("I noticed you use Salesforce Composite APIs and Next.js..."), increasing demo-to-close conversion rates by 40%.',
    founderProofPoint: 'Built tech stack fingerprinting and ecosystem discovery crawlers in Novalyte AI to categorize prospective medical client workflows.',
    seniorSoundbite: '"I enrich target accounts with real-time technographic footprints—scraping DNS headers, JavaScript libraries, and public job descriptions—to compute high-intent compatibility scores before sales rep outreach."',
    gotchaToDefend: 'Headless / Obfuscated scripts: Many modern applications use server-side rendering or tag managers (Google Tag Manager) that hide script tags from simple HTML scrapers. You need API partners (BuiltWith, StoreLeads) or Puppeteer-based headless DOM evaluation.',
    metricsToQuote: ['+40% Demo-to-Opportunity Conversion', '40+ Tracked Enterprise Tech Stacks', 'Automated ICP Qualification'],
    architectureSteps: [
      { stepNumber: 1, title: 'DNS & HTTP Header Inspector', tech: 'Axios Header Probe', description: 'Checks server headers for Cloudflare, AWS CloudFront, Vercel, or HubSpot headers.' },
      { stepNumber: 2, title: 'Client-Side Script Extractor', tech: 'BuiltWith API / Cheerio', description: 'Inspects DOM for analytics tags (Segment, Mixpanel, Datadog) and CRM widgets.' },
      { stepNumber: 3, title: 'Job Posting Intent Crawler', tech: 'Firecrawl / Google Search API', description: 'Scrapes company careers page for keywords (e.g. "Seeking Salesforce Developer").' },
      { stepNumber: 4, title: 'ICP Tech Fit Score', tech: 'PostgreSQL Scoring Function', description: 'Calculates 1-100 fit score based on target tech requirements.' }
    ],
    practiceQuestions: [
      {
        question: 'How would you build an automated system that alerts sales reps the exact day a target account starts hiring for a Salesforce Administrator?',
        starScript: 'I set up a daily crawler using Firecrawl and Google Jobs API querying our top 500 target account career pages for keywords like "Salesforce Administrator" or "RevOps Engineer". When a new posting matches, a webhook writes an "Active Hiring Trigger" to the account in Salesforce and notifies the assigned Account Executive in Slack.',
        cribSheetBuzzwords: ['Technographic Footprint', 'Careers Page Crawler', 'ICP Fit Scoring', 'Intent Trigger Alert']
      }
    ]
  },

  // ==========================================
  // 3. CRM HYGIENE & IDENTITY (4 Topics)
  // ==========================================
  {
    id: 'l2a-matching',
    title: 'Lead-to-Account (L2A) Matching & Fuzzy Resolution',
    category: 'CRM Hygiene & Identity',
    plainEnglish: 'The algorithm that automatically pairs incoming leads with their parent company in your CRM, preventing duplicate company records and making sure the existing Account Executive gets the deal.',
    whyCompaniesCare: 'Prevents territory collisions where two different sales reps embarrass the company by emailing two different executives at the same customer at the same time.',
    founderProofPoint: 'Architected entity resolution in Novalyte AI connecting individual healthcare providers to multi-location practice groups.',
    seniorSoundbite: '"I implement L2A matching in three deterministic tiers: exact domain matching, PostgreSQL trigram similarity on company legal entities, and automated parent account hierarchy inheritance."',
    gotchaToDefend: 'Overly aggressive fuzzy matching: Matching "Apex Medical" with "Apex Logistics" because both have high string similarity. You must require high threshold similarity (>0.85) AND cross-validate with country/state location.',
    metricsToQuote: ['94% Automated Match Rate', 'Zero Rep Territory Collisions', 'Sub-200ms Match Latency'],
    architectureSteps: [
      { stepNumber: 1, title: 'Domain Index Lookup', tech: 'SQL Indexed Query', description: 'Direct lookup against Account.Domain. Resolves 75% of business leads instantly.' },
      { stepNumber: 2, title: 'Domain Alias Array Check', tech: 'PostgreSQL GIN Index on Aliases[]', description: 'Matches secondary corporate domains (e.g. google.com vs alphabet.com).' },
      { stepNumber: 3, title: 'Fuzzy Legal Name Resolver', tech: 'PostgreSQL pg_trgm (similarity > 0.85)', description: 'Matches personal email leads where company name is provided in the webform.' },
      { stepNumber: 4, title: 'CRM Relationship Link', tech: 'Salesforce Matched_Account__c', description: 'Sets lookup field, links lead, and applies parent account routing rules.' }
    ],
    practiceQuestions: [
      {
        question: 'Explain how you design an automated Lead-to-Account matching engine in PostgreSQL using both exact and fuzzy techniques.',
        starScript: 'I structure it as a 3-tier cascade: Tier 1 performs an exact match on normalized email domain against our indexed Account.Domain table. If the email is a webmail address, Tier 2 executes PostgreSQL trigram similarity (pg_trgm) on the submitted company name with a strict 0.85 threshold. If a match is found, we populate Matched_Account__c; otherwise, we flag for human review.',
        cribSheetBuzzwords: ['pg_trgm Trigram Similarity', 'Domain Alias GIN Index', 'Matched_Account__c Lookup', '0.85 Similarity Threshold']
      }
    ]
  },

  {
    id: 'account-hierarchies',
    title: 'Account Hierarchies & Subsidiary Rollups',
    category: 'CRM Hygiene & Identity',
    plainEnglish: 'Managing parent-child company relationships (e.g. Instagram is owned by Meta; Waymo is owned by Alphabet) so enterprise contracts and global sales reps cover the entire corporate family tree.',
    whyCompaniesCare: 'If an enterprise customer signs a $500k global agreement, you cannot allow a junior rep to sell a $5k individual subscription to their subsidiary. Enterprise reps must own the entire hierarchy.',
    founderProofPoint: 'Structured multi-tiered clinic organizational models at Novalyte AI connecting headquarters to branch offices.',
    seniorSoundbite: '"I model multi-entity enterprise accounts using Ultimate Parent Account IDs and recursive CTE queries, rolling up contract ARR and territory ownership across the global family tree."',
    gotchaToDefend: 'Circular references: Account A points to Account B as parent, and Account B points to Account A, causing infinite loops in database queries. Database constraints must prevent recursive parent cycles.',
    metricsToQuote: ['100% Hierarchy Visibility', 'Recursive CTE Querying', 'Zero Circular Parent References'],
    architectureSteps: [
      { stepNumber: 1, title: 'Parent Account Pointer', tech: 'Salesforce ParentId field', description: 'Standard self-referencing relationship pointing from subsidiary to corporate parent.' },
      { stepNumber: 2, title: 'Recursive Hierarchy Traversal', tech: 'PostgreSQL WITH RECURSIVE CTE', description: 'Traverses up the chain to discover the Ultimate Parent ID and total subsidiary count.' },
      { stepNumber: 3, title: 'Rollup Summary Aggregation', tech: 'Scheduled Aggregator Service', description: 'Sums up total ARR, open opportunities, and active users across all subsidiary nodes.' },
      { stepNumber: 4, title: 'Global Territory Enforcement', tech: 'RevOps Routing Rules', description: 'Assigns all subsidiaries to the named Strategic Account Executive.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you calculate total ARR across a complex enterprise account with 20 subsidiaries across 4 continents?',
        starScript: 'I write a recursive Common Table Expression (CTE) in PostgreSQL that traverses the parent-child account tree starting from the Ultimate Parent ID. It aggregates active contract ARR across all child account nodes, writes the summary back to the parent record, and stamps each child with the Global Account Owner.',
        cribSheetBuzzwords: ['Recursive CTE', 'Ultimate Parent Account ID', 'ARR Rollup Aggregator', 'Parent Cycle Validation']
      }
    ]
  },

  {
    id: 'deduplication-survivorship',
    title: 'Deduplication & Field Survivorship Rules',
    category: 'CRM Hygiene & Identity',
    plainEnglish: 'When merging two duplicate records in Salesforce, the deterministic rules that decide which data survives (e.g. "keep the original creation date, but take the most recently verified phone number and the highest opportunity stage").',
    whyCompaniesCare: 'A naive merge tool can accidentally overwrite a rep\'s carefully written deal notes or erase an enterprise customer\'s contract start date.',
    founderProofPoint: 'Implemented data hygiene and patient record reconciliation routines in Novalyte AI.',
    seniorSoundbite: '"I design automated deduplication around deterministic field survivorship matrices: historical timestamps survive on the master record, while contact and activity data are merged with audit logging."',
    gotchaToDefend: 'Overwriting non-empty values with nulls: A common bug where a newly submitted empty field overwrites rich historical data on the older record during a merge. Survivorship logic must treat nulls as non-destructive.',
    metricsToQuote: ['Deterministic Survivorship Matrix', 'Zero Overwritten Valid Data', 'Complete Merge Audit History'],
    architectureSteps: [
      { stepNumber: 1, title: 'Duplicate Detection Query', tech: 'Salesforce Matching Rules / SQL', description: 'Identifies potential duplicates by email, normalized phone, or domain.' },
      { stepNumber: 2, title: 'Master Record Selection', tech: 'Survivorship Algorithm', description: 'Selects the oldest created record or the record with an active customer contract as Master.' },
      { stepNumber: 3, title: 'Field-by-Field Arbitration', tech: 'Rules Engine Matrix', description: 'Applies field rules: e.g. Phone = Most Recently Verified; Status = Highest Funnel State.' },
      { stepNumber: 4, title: 'Reparenting & Audit Logging', tech: 'Salesforce Merge API', description: 'Reparents all tasks, notes, and deals to the master record, archiving merge history.' }
    ],
    practiceQuestions: [
      {
        question: 'What survivorship logic do you apply when merging a newly submitted inbound marketing lead into an existing dormant contact record?',
        starScript: 'The existing record retains its Master status, preserving its historical creation date, Account association, and previous opportunity history. The newly submitted record contributes its fresh phone number, updated job title, and new campaign UTM parameters. Null values on the incoming lead never overwrite existing populated data, and all activities are preserved.',
        cribSheetBuzzwords: ['Master Record Selection', 'Field Survivorship Matrix', 'Non-Destructive Null Handling', 'Reparenting Related Objects']
      }
    ]
  },

  {
    id: 'ssot-contracts',
    title: 'Single Source of Truth (SSOT) & Data Contracts',
    category: 'CRM Hygiene & Identity',
    plainEnglish: 'A written rulebook and code contract specifying which software owns which piece of information (e.g. Stripe owns Billing, Product owns Usage, and Salesforce owns Sales Pipeline) so tools stop overwriting each other.',
    whyCompaniesCare: 'Prevents conflicting numbers in board meetings where marketing reports 500 customers, billing reports 420, and sales reports 480.',
    founderProofPoint: 'Enforced clear data ownership boundaries at Novalyte AI between operational databases and client-facing dashboards.',
    seniorSoundbite: '"A scalable revenue engine requires strict SSOT data contracts. Systems only write to their designated authoritative domain, preventing split-brain states and data corruption across tools."',
    gotchaToDefend: 'Ad-hoc manual edits: When a sales rep manually edits a field that is supposed to be owned by Stripe or automated telemetry, their manual value gets wiped on the next sync. Lock automated fields in the CRM UI with read-only permissions.',
    metricsToQuote: ['100% Data Domain Authority', 'Zero Split-Brain Board Reports', 'Enforced Field-Level Security'],
    architectureSteps: [
      { stepNumber: 1, title: 'Data Contract Schema', tech: 'JSON Schema / TypeScript Contract', description: 'Documents system of record for every field: Stripe = MRR; Postgres = Active Seats; Salesforce = Stage.' },
      { stepNumber: 2, title: 'Read-Only CRM Layouts', tech: 'Salesforce Field-Level Security', description: 'Makes automated fields read-only for human reps to prevent accidental manual overwrites.' },
      { stepNumber: 3, title: 'Integration Permission Gate', tech: 'Dedicated API Integration User', description: 'Only allows the integration service user to update contract-governed fields.' },
      { stepNumber: 4, title: 'Schema Drift Validation', tech: 'CI/CD Schema Linter', description: 'Validates that neither HubSpot nor Salesforce field changes break upstream contracts.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you resolve a conflict where the marketing team wants to edit the "Lifecycle Stage" field in HubSpot, but sales ops insists Salesforce is the source of truth?',
        starScript: 'I mediate this by establishing a clear Single Source of Truth contract: HubSpot owns early lifecycle stages from "Subscriber" to "Marketing Qualified Lead". Once a lead is accepted by sales, ownership transitions exclusively to Salesforce for "Opportunity" and "Customer". Field permissions in HubSpot are locked to read-only for late stages, eliminating overwrite conflicts.',
        cribSheetBuzzwords: ['Authoritative System of Record', 'Lifecycle State Hand-off', 'Field-Level Security Locks', 'Data Contract Schema']
      }
    ]
  },

  // ==========================================
  // 4. ROUTING & SLAS (4 Topics)
  // ==========================================
  {
    id: 'speed-to-lead-sla',
    title: 'Speed-to-Lead <60s SLA & Instant Rep Alerts',
    category: 'Routing & SLAs',
    plainEnglish: 'Getting an inbound demo request into the assigned sales rep\'s Slack with an instant calendar booking link in under 60 seconds, because reaching out within 5 minutes increases conversion rates by 8x.',
    whyCompaniesCare: 'If a competitor calls the prospect first, you lose the deal. Cutting response time from 30 minutes to 60 seconds directly increases sales revenue by 20% to 50%.',
    founderProofPoint: 'Engineered real-time notification dispatchers in Novalyte AI that alerted clinic managers within seconds of urgent intake requests.',
    seniorSoundbite: '"Speed-to-lead is our ultimate engineering SLA. By decoupling ingestion and parallelizing enrichment, we route demo requests to the assigned rep\'s Slack with rich context in under 45 seconds."',
    gotchaToDefend: 'Slack notification fatigue: Reps ignore plain text Slack bots. The Slack message must include clickable action buttons ("Booked Call", "Disqualified", "Re-route") and auto-escalate if unacted upon within 15 minutes.',
    metricsToQuote: ['<45s Lead-to-Rep Slack SLA', '8x Higher Qualification Rate', '15-minute Auto-Escalation'],
    architectureSteps: [
      { stepNumber: 1, title: 'Webform Ingestion', tech: 'Edge API Gateway', description: 'Receives request, checks idempotency in 35ms.' },
      { stepNumber: 2, title: 'Parallel Waterfall Enrichment', tech: 'Async Worker', description: 'Fetches company headcount and LinkedIn in 3.5 seconds.' },
      { stepNumber: 3, title: 'L2A & Territory Assignment', tech: 'Salesforce Routing Engine', description: 'Assigns owner and writes to CRM in 1.8 seconds.' },
      { stepNumber: 4, title: 'Interactive Slack Card', tech: 'Slack Block Kit API', description: 'Pings rep channel with prospect title, ARR estimate, and 1-click booking link.' }
    ],
    practiceQuestions: [
      {
        question: 'Walk me through the end-to-end architecture required to achieve a sub-60-second speed-to-lead SLA.',
        starScript: 'The architecture runs in 4 steps: 1) Ingress gateway returns 202 in 30ms and drops payload to Redis. 2) Parallel worker fetches contact enrichment and L2A matching in under 4 seconds. 3) Worker writes to Salesforce with an external ID. 4) A Slack Block Kit webhook pings the assigned Account Executive with 1-click calendar links. The entire pipeline completes in under 45 seconds.',
        cribSheetBuzzwords: ['<45s Speed-to-Lead', 'Slack Block Kit Webhook', 'Parallel Enrichment', '15-min Escalation SLA']
      }
    ]
  },

  {
    id: 'round-robin-routing',
    title: 'Weighted Round-Robin & Quota-Tier Assignment',
    category: 'Routing & SLAs',
    plainEnglish: 'Fairly and automatically distributing inbound leads among sales reps based on their quota capacity (e.g. a senior rep gets 3 leads for every 1 lead given to a ramping rep), their timezone, and their current working hours.',
    whyCompaniesCare: 'Prevents reps from burning out or starving, and ensures ramping reps get the right volume of practice without hurting overall company conversion.',
    founderProofPoint: 'Configured ticket and opportunity assignment routing rules in Zendesk sales operations.',
    seniorSoundbite: '"I implement stateful weighted round-robin distribution with calendar awareness, ensuring leads are dynamically routed only to active, available reps based on quota tier weights."',
    gotchaToDefend: 'Calendar blind spots: Routing a hot lead to a rep who just stepped into a 2-hour lunch or took PTO. The routing engine must check Google Calendar / Outlook Free/Busy API before dispatching.',
    metricsToQuote: ['100% Fair Quota Distribution', 'Live Calendar Free/Busy Checks', 'Dynamic Ramping Weights'],
    architectureSteps: [
      { stepNumber: 1, title: 'Active Pool Filter', tech: 'Redis Rep Availability Set', description: 'Filters pool of reps by active status, timezone, and working hours.' },
      { stepNumber: 2, title: 'Live Calendar Check', tech: 'Google Calendar Free/Busy API', description: 'Checks if rep is currently in a meeting or on PTO. Skips if busy.' },
      { stepNumber: 3, title: 'Weighted Counter Increment', tech: 'Redis Atomic INCRBY', description: 'Selects the rep furthest behind their weighted ratio (e.g. Senior = 3x, Ramp = 1x).' },
      { stepNumber: 4, title: 'CRM Ownership Stamping', tech: 'Salesforce Lead Owner ID', description: 'Updates OwnerId and resets SLA response timer for that rep.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you design a round-robin engine that prevents leads from being assigned to sales reps who are out sick or currently in a demo?',
        starScript: 'Before computing the round-robin index, the router queries the Google Calendar Free/Busy API with a 60-second Redis cache. If the rep has an active calendar event or an OOO status, they are temporarily removed from the eligible pool. The lead is routed to the next available rep, and an audit log notes the OOO bypass.',
        cribSheetBuzzwords: ['Google Calendar Free/Busy API', 'Weighted Ratios', 'Redis Availability Set', 'Atomic Counter']
      }
    ]
  },

  {
    id: 'territory-rules',
    title: 'Territory Rules & Named Account Locks',
    category: 'Routing & SLAs',
    plainEnglish: 'Ensuring that geographic regions (e.g. EMEA, APAC, US-West) and VIP "named accounts" (like Nike, Apple, or Pfizer) are exclusively locked to designated Enterprise Account Executives regardless of where the form submit comes from.',
    whyCompaniesCare: 'Eliminates ugly internal battles where an inbound SDR tries to take credit for an executive lead at an enterprise account that an Enterprise AE has been nurturing for 6 months.',
    founderProofPoint: 'Managed territory segmentation and account governance during sales operations at Zendesk.',
    seniorSoundbite: '"I enforce named account locks at the routing gateway: any inbound lead matching a strategic account domain immediately bypasses general triage and routes to the named Account Executive."',
    gotchaToDefend: 'Mismatched headquarters vs employee location: An engineer in London submits a form for Google US. If you route purely by IP address, it lands in EMEA. Named account lists must always supersede geographic IP rules.',
    metricsToQuote: ['Zero Named Account Bypasses', 'Geographic IP + Company HQ Fallback', 'Named Account Rule Precedence'],
    architectureSteps: [
      { stepNumber: 1, title: 'Named Account Matcher', tech: 'SQL Indexed Set', description: 'Checks if account domain exists in the "Named Enterprise Accounts" list. Highest priority.' },
      { stepNumber: 2, title: 'Company HQ Geographic Resolver', tech: 'Enriched Firmographic Data', description: 'If not named, looks at Company Headquarters Country/State rather than user IP.' },
      { stepNumber: 3, title: 'IP Geolocation Fallback', tech: 'MaxMind GeoIP', description: 'Used only for early-stage personal leads with no corporate firmographic footprint.' },
      { stepNumber: 4, title: 'Territory Stamping', tech: 'Salesforce Territory__c', description: 'Stamps territory field and assigns designated territory team.' }
    ],
    practiceQuestions: [
      {
        question: 'An employee at a Fortune 500 company in France submits an inquiry. Should this lead go to the France territory rep or the US Global Account Director?',
        starScript: 'The rule of precedence dictates that Named Account assignment always overrides geographic location. Because the Fortune 500 company has a designated Global Account Director, the lead routes directly to that director, who can then coordinate with the local French sales team while preserving account ownership continuity.',
        cribSheetBuzzwords: ['Rule of Precedence', 'Named Account Lock', 'Company HQ vs User IP', 'Global Account Director']
      }
    ]
  },

  {
    id: 'sla-failovers',
    title: 'Out-of-Office & Escalation Failovers',
    category: 'Routing & SLAs',
    plainEnglish: 'An automated safety timer: if an assigned sales rep fails to open or contact a high-intent lead within 15 minutes, the system automatically takes the lead back and hands it to a secondary available rep.',
    whyCompaniesCare: 'Stops hot inbound leads from sitting untouched in a rep\'s inbox while the prospect is actively comparing your product with competitors.',
    founderProofPoint: 'Engineered automated task escalation timers in Novalyte AI to ensure patient care workflows never stalled.',
    seniorSoundbite: '"To enforce our 15-minute SLA, I schedule delayed BullMQ escalation jobs upon lead assignment. If the rep hasn\'t changed the lead status within 15 minutes, the lead is re-routed and the manager alerted."',
    gotchaToDefend: 'False escalations: Rep called the lead immediately on their mobile phone, but didn\'t log the call in Salesforce yet. Integrating phone call logs (Aircall/Dialpad) ensures automatic activity logging so leads aren\'t unfairly stolen from reps.',
    metricsToQuote: ['<15min Guaranteed Contact SLA', 'Automated Manager Slack Escalations', 'Zero Neglected Inbound Leads'],
    architectureSteps: [
      { stepNumber: 1, title: 'Delayed Escalation Job', tech: 'Redis BullMQ delayed job (15 min)', description: 'Schedules a check 15 minutes in the future when a lead is assigned.' },
      { stepNumber: 2, title: 'Activity Verification Check', tech: 'Salesforce Task / Activity query', description: 'Checks if Status changed from "New" or if an email/call activity was logged.' },
      { stepNumber: 3, title: 'Re-Assignment Execution', tech: 'Salesforce Update API', description: 'If untouched, pulls lead, re-assigns to Backup Round-Robin pool.' },
      { stepNumber: 4, title: 'Manager Slack Ping', tech: 'Slack Channel Webhook', description: 'Alerts sales manager: "Lead for [Acme] escalated after 15m without contact from [Rep]."' }
    ],
    practiceQuestions: [
      {
        question: 'How would you build an automated system that monitors lead response times and enforces a 15-minute SLA without polling Salesforce every 10 seconds?',
        starScript: 'I use an event-driven delayed job pattern: when a lead is created and assigned, our worker schedules a BullMQ job with a 15-minute delay. When the timer fires, the worker checks Salesforce once. If the status is still "New - Uncontacted", it executes re-routing and alerts the sales manager via Slack. This requires zero aggressive polling.',
        cribSheetBuzzwords: ['BullMQ Delayed Job (15m)', 'Event-Driven Escalation', 'Activity Verification Check', 'Manager Slack Alert']
      }
    ]
  },

  // ==========================================
  // 5. SYNC & RESILIENCE (4 Topics)
  // ==========================================
  {
    id: 'bi-directional-sync',
    title: 'Bi-Directional Sync Recursion Loops & Anti-Echo',
    category: 'Sync & Resilience',
    plainEnglish: 'The catastrophic bug where System A updates System B, which sends a webhook that updates System A, which updates System B, cycling thousands of times a minute until your systems crash and daily API limits are burned.',
    whyCompaniesCare: 'A sync loop can exhaust a company\'s entire $100k/year Salesforce API quota in 20 minutes, locking out all employees.',
    founderProofPoint: 'Architected bi-directional state synchronization between Novalyte AI operational databases and partner healthcare portals.',
    seniorSoundbite: '"To eliminate sync recursion, I enforce single-source-of-truth field ownership and stamp all automated updates with a bypass flag. If the last-modified user matches our integration user, downstream webhooks drop the event."',
    gotchaToDefend: 'Third-party tools stripping custom headers: If you rely on an HTTP header like `X-Sync-Origin`, some CRMs strip custom headers before firing outbound webhooks. Stamping a designated `LastModifiedById` (Integration User) directly on the record is far more resilient.',
    metricsToQuote: ['Zero Sync Recursion Incidents', 'Integration User Bypass Stamp', 'Deterministic Field Ownership'],
    architectureSteps: [
      { stepNumber: 1, title: 'Integration User Stamp', tech: 'Dedicated Salesforce API User', description: 'All automated writes execute under a specific user (e.g. `sync-bot@company.com`).' },
      { stepNumber: 2, title: 'Webhook Ingress Filter', tech: 'Webhook Payload Inspector', description: 'Inspects `LastModifiedById`. If modified by `sync-bot`, drops event immediately with 200 OK.' },
      { stepNumber: 3, title: 'Delta Field Diff Check', tech: 'JSON Diffing', description: 'Checks if values actually changed before issuing any outbound write.' },
      { stepNumber: 4, title: 'Circuit Breaker Counter', tech: 'Redis sliding-window counter', description: 'If a single record ID is updated more than 5 times in 60 seconds, auto-trips circuit breaker.' }
    ],
    practiceQuestions: [
      {
        question: 'A junior engineer set up a bi-directional sync between HubSpot and Salesforce, and suddenly your Salesforce API quota is 95% exhausted. How do you stop it and fix the root cause?',
        starScript: 'First, I immediately pause the sync worker queue or deactivate the outbound webhook in HubSpot to stop the bleeding. Second, I inspect API logs to identify the looping fields. To fix the root cause, I ensure all automated updates execute under a dedicated integration user ID and add a check to the webhook ingress: if LastModifiedById equals the integration user, drop the event immediately.',
        cribSheetBuzzwords: ['Integration User Bypass', 'LastModifiedById Check', 'Sync Pause / Circuit Breaker', 'Delta JSON Diff']
      }
    ]
  },

  {
    id: 'delta-batching',
    title: 'Delta Computation & Batch Patching',
    category: 'Sync & Resilience',
    plainEnglish: 'Comparing what already exists in the CRM against incoming updates and only sending the 2 fields that actually changed (instead of blindly resending all 50 fields), and bundling 200 updates into one single network call.',
    whyCompaniesCare: 'Saves 90% of daily API calls and prevents false history entries in Salesforce ("User updated 50 fields") that clutter audit logs.',
    founderProofPoint: 'Optimized database write patterns and state syncing in Novalyte AI using selective delta patching.',
    seniorSoundbite: '"I compute json-diffs prior to CRM synchronization, transmitting only the modified delta fields in batch composite payloads to conserve API limits and preserve clean field-history audit trails."',
    gotchaToDefend: 'Timestamp jitter: Comparing two identical dates where one has milliseconds (`.000Z`) and one does not can trigger a false positive delta. Normalizing data types prior to diffing is essential.',
    metricsToQuote: ['90% Reduction in API Payloads', 'Clean Field Audit Histories', 'Composite Batching (200 records)'],
    architectureSteps: [
      { stepNumber: 1, title: 'Record Fetch / Cache', tech: 'Redis / Local Mirror', description: 'Retrieves current state of the record in CRM.' },
      { stepNumber: 2, title: 'Type-Normalized Diffing', tech: 'jsondiffpatch / custom diff', description: 'Compares existing vs incoming values, filtering out unchanged fields and whitespace differences.' },
      { stepNumber: 3, title: 'Delta Validation', tech: 'Zod Partial Schema', description: 'If delta object is empty (`{}`), terminates without making an API call.' },
      { stepNumber: 4, title: 'Batch Flush', tech: 'Salesforce Composite API', description: 'Pushes up to 200 record patches in a single HTTP request.' }
    ],
    practiceQuestions: [
      {
        question: 'Why is sending a full record payload to Salesforce considered bad practice compared to sending a computed delta patch?',
        starScript: 'Sending the full record burns unnecessary bandwidth, triggers false entries in Salesforce Field History Tracking, fires unnecessary Apex triggers, and increases the likelihood of lock conflicts. Computing a delta patch sends only the fields that actually changed, keeping audit trails clean and API calls minimal.',
        cribSheetBuzzwords: ['Field History Tracking Noise', 'Delta Json Diff', 'Apex Trigger Suppression', 'Composite Patch Batching']
      }
    ]
  },

  {
    id: 'distributed-locking',
    title: 'Distributed Locking with Redis Redlock',
    category: 'Sync & Resilience',
    plainEnglish: 'A temporary digital "Do Not Disturb" sign placed on a record in Redis for 5 seconds while a worker is updating it, preventing two simultaneous webhooks from clashing and corrupting data.',
    whyCompaniesCare: 'Prevents race conditions in high-volume systems where simultaneous form submits or webhooks overwrite each other.',
    founderProofPoint: 'Implemented distributed locking and mutex synchronization in Novalyte AI to protect scheduling workflows.',
    seniorSoundbite: '"To prevent concurrent race conditions across our distributed workers, I acquire temporary Redis Redlocks on entity IDs with 5-second TTLs before applying CRM mutations."',
    gotchaToDefend: 'Deadlocks from unreleased locks: If a worker crashes while holding the lock, the record is frozen forever unless the lock has an automatic TTL (Time-to-Live). Always specify a strict 5-second lease TTL.',
    metricsToQuote: ['Zero Concurrent Race Conditions', '5-Second Lock Lease TTL', 'Sub-millisecond Mutex Acquisition'],
    architectureSteps: [
      { stepNumber: 1, title: 'Lock Key Definition', tech: 'Key: `lock:account:{id}`', description: 'Defines discrete lock key per business entity.' },
      { stepNumber: 2, title: 'Atomic Lock Acquisition', tech: 'Redis SET resource_name my_random_value NX PX 5000', description: 'Acquires lock atomically with a 5000ms TTL.' },
      { stepNumber: 3, title: 'Database Mutation', tech: 'PostgreSQL / Salesforce Update', description: 'Applies update safely knowing no other worker is editing this record.' },
      { stepNumber: 4, title: 'Safe Release via Lua Script', tech: 'Redis Lua Script', description: 'Releases lock only if the random token matches, preventing accidentally releasing someone else\'s lock.' }
    ],
    practiceQuestions: [
      {
        question: 'Two webhooks for the same contact arrive at your server at the exact same millisecond. How do you prevent a race condition in the database?',
        starScript: 'I use a Redis distributed lock (Redlock) keyed to the contact ID with a 5-second TTL. The first worker acquires the lock and processes the update. The second worker fails to acquire the lock and yields with a 200ms exponential backoff retry. Once the first worker finishes and releases the lock, the second worker reads the updated state and applies its changes safely.',
        cribSheetBuzzwords: ['Redis Redlock', 'Atomic SET NX PX', '5-Second Lease TTL', 'Exponential Backoff Retry']
      }
    ]
  },

  {
    id: 'circuit-breakers',
    title: 'Circuit Breakers & Anomaly Spike Detection',
    category: 'Sync & Resilience',
    plainEnglish: 'An automated fuse box: if an integration starts generating 100 errors a minute or update volume spikes by 500%, the circuit trips and pauses the integration automatically to prevent massive data corruption.',
    whyCompaniesCare: 'Protects the company from runaway scripts, catastrophic third-party outages, and sudden multi-thousand-dollar API overage bills.',
    founderProofPoint: 'Designed anomaly detection thresholds and circuit breaker patterns in Novalyte AI\'s event streaming infrastructure.',
    seniorSoundbite: '"I protect our ecosystem with circuit breaker patterns: if an integration detects an abnormal 5x frequency spike or consecutive 500 errors, it automatically trips, pauses execution, and alerts on-call."',
    gotchaToDefend: 'Automatic reset vs manual reset: If the circuit resets automatically while the external service is still broken, it creates a flapping cycle. Use a half-open state where a single canary test request must succeed before resuming full traffic.',
    metricsToQuote: ['Sub-10s Anomaly Trip Time', 'Half-Open Canary Testing', 'Zero Runaway API Invocations'],
    architectureSteps: [
      { stepNumber: 1, title: 'Error & Volume Counter', tech: 'Rolling 60-second Sliding Window', description: 'Tracks success rate, 5xx error percentage, and request volume.' },
      { stepNumber: 2, title: 'Trip Condition Evaluation', tech: 'Circuit Breaker Logic', description: 'If error rate > 20% or request spike > 5x baseline: Trip state to OPEN.' },
      { stepNumber: 3, title: 'Traffic Suspension & Alerting', tech: 'Queue Pause + PagerDuty', description: 'Pauses worker consumption, queues events safely on disk, alerts engineering.' },
      { stepNumber: 4, title: 'Half-Open Canary Recovery', tech: 'Single-job Trial Worker', description: 'Sends 1 canary job after 5 minutes. If successful, transitions to CLOSED and resumes processing.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you architect an automated circuit breaker on an external integration with Apollo or ZoomInfo?',
        starScript: 'I wrap vendor API requests in a circuit breaker with three states: Closed, Open, and Half-Open. If consecutive 5xx errors or 429 rate-limit responses exceed a 20% threshold over 60 seconds, the breaker trips to Open, pausing worker calls and alerting Slack. After a 5-minute cooldown, it enters Half-Open, dispatching a single canary request. If that succeeds, the queue resumes normal operations.',
        cribSheetBuzzwords: ['Closed / Open / Half-Open States', 'Rolling Error Window', 'Canary Request', 'Queue Pause & Resume']
      }
    ]
  },

  // ==========================================
  // 6. PLG & REVERSE ETL (4 Topics)
  // ==========================================
  {
    id: 'warehouse-reverse-etl',
    title: 'Warehouse to CRM Reverse ETL Architecture',
    category: 'PLG & Reverse ETL',
    plainEnglish: 'Extracting clean, calculated business metrics from your data warehouse (BigQuery, Snowflake, Postgres) and pushing them directly into Salesforce fields so sales reps can see product usage without knowing SQL.',
    whyCompaniesCare: 'Arming sales reps with product usage context directly in Salesforce leads to 2x higher close rates on renewals and expansions.',
    founderProofPoint: 'Extracted aggregated analytics from Novalyte AI databases and rendered actionable pipeline insights for business users.',
    seniorSoundbite: '"I leverage Reverse ETL patterns to push calculated warehouse telemetry—like 30-day active user counts and workspace exports—directly onto CRM records to empower reps with real-time product context."',
    gotchaToDefend: 'Warehouse sync latency: Warehouses run on batch schedules (e.g. nightly). If a sales rep expects real-time usage updates, a batch sync is too slow. Clarify which metrics need real-time webhooks vs scheduled reverse ETL.',
    metricsToQuote: ['100% Rep Visibility into Product Telemetry', 'Zero Manual SQL Requests', 'Hourly Differential Sync'],
    architectureSteps: [
      { stepNumber: 1, title: 'Warehouse Data Modeling', tech: 'dbt / BigQuery SQL Models', description: 'Transforms raw telemetry into clean business views: `active_users_30d`, `tier_limits_hit`.' },
      { stepNumber: 2, title: 'Reverse ETL Extraction', tech: 'Census / Hightouch / Custom SQL', description: 'Runs incremental query fetching only accounts where metrics changed since last sync.' },
      { stepNumber: 3, title: 'Schema Mapping & Typecast', tech: 'Field Mapping Config', description: 'Maps warehouse columns to Salesforce custom fields (`Active_Seats__c`, `Telemetry_Score__c`).' },
      { stepNumber: 4, title: 'Batch CRM Update', tech: 'Salesforce Bulk API 2.0', description: 'Pushes updates in large batches without exhausting daily synchronous API governor limits.' }
    ],
    practiceQuestions: [
      {
        question: 'When should an engineering team build custom Reverse ETL syncs versus buying tools like Census or Hightouch?',
        starScript: 'If the requirement involves 1-2 standard objects with simple scheduled SQL syncs and the team has engineering bandwidth, custom SQL workers with Bulk API 2.0 work well. However, when syncing across 5+ destinations (Salesforce, HubSpot, Zendesk, Marketo) with complex visual field mappings and non-technical RevOps users, purchasing Census or Hightouch delivers much faster ROI and built-in observability.',
        cribSheetBuzzwords: ['dbt Metric Models', 'Incremental Warehouse Sync', 'Bulk API 2.0', 'Census vs Custom Tradeoffs']
      }
    ]
  },

  {
    id: 'pqa-telemetry',
    title: 'Product-Qualified Account (PQA) Telemetry & Triggers',
    category: 'PLG & Reverse ETL',
    plainEnglish: 'Tracking when free software users hit an "aha! moment" or power-usage milestone (like inviting 5 teammates or uploading 100 documents) and instantly alerting sales reps to reach out for an enterprise upgrade.',
    whyCompaniesCare: 'Product-Qualified Accounts close at 3x the rate of cold inbound leads because the customer has already experienced the product\'s value.',
    founderProofPoint: 'Implemented patient milestone tracking and clinic engagement telemetry in Novalyte AI to trigger expansion outreach.',
    seniorSoundbite: '"I instrument real-time PLG telemetry hooks that compute Product-Qualified Account scores, automatically surfacing high-intent expansion opportunities to Account Executives in Slack."',
    gotchaToDefend: 'False alarm fatigue: If every small action triggers a PQA alert, sales reps will mute Slack. The PQA model must require multiple composite triggers (e.g. 5+ active seats AND >80% quota consumption AND corporate domain).',
    metricsToQuote: ['3x Higher Conversion Rate than Cold Leads', 'Composite PQA Scoring (1-100)', 'Real-time High-Intent Slack Pings'],
    architectureSteps: [
      { stepNumber: 1, title: 'In-App Telemetry Event', tech: 'Segment / PostHog / Postgres Trigger', description: 'Fires event when team crosses activation threshold (e.g. 5th user invited).' },
      { stepNumber: 2, title: 'PQA Scoring Algorithm', tech: 'Event-Driven Worker', description: 'Evaluates composite criteria: Seat utilization, weekly active days, feature usage.' },
      { stepNumber: 3, title: 'CRM Stage & Tag Stamping', tech: 'Salesforce Opportunity Creation', description: 'Creates or updates Opportunity: "Expansion Qualified - PQA Score 92".' },
      { stepNumber: 4, title: 'Rich Context Slack Card', tech: 'Slack Bot Notification', description: 'Alerts AE with exact user names, invited teammates, and suggested upgrade talking points.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you define and architect a Product Qualified Account (PQA) scoring pipeline for a B2B SaaS company?',
        starScript: 'A PQA pipeline requires three components: 1) Event capture via PostHog or Postgres triggers tracking key activation actions (like team invites and exports). 2) A scoring engine that calculates a 1-100 composite score requiring both firmographic fit (>50 employees) and product velocity (>3 active users in 7 days). 3) A webhook that flags the account as PQA in Salesforce and notifies the assigned rep with actionable product usage context.',
        cribSheetBuzzwords: ['Composite PQA Scoring', 'Activation Milestones', 'PostHog / Postgres Triggers', 'Actionable Expansion Context']
      }
    ]
  },

  {
    id: 'stripe-mrr-sync',
    title: 'Stripe Billing & MRR Subscription Telemetry Sync',
    category: 'PLG & Reverse ETL',
    plainEnglish: 'Connecting your payment processor (Stripe) to your CRM so sales reps can see exact Monthly Recurring Revenue (MRR), subscription renewals, failed credit card payments, and churn risks in real-time.',
    whyCompaniesCare: 'Stops sales reps from selling to delinquent customers and enables automated playbooks when a customer upgrades or cancels their plan.',
    founderProofPoint: 'Integrated subscription billing, invoice generation, and financial tracking workflows in Novalyte AI.',
    seniorSoundbite: '"I architect webhook listeners for Stripe billing events that update subscription MRR, handle credit card failure alerts, and maintain financial reconciliation between billing and CRM."',
    gotchaToDefend: 'Webhook out-of-order delivery: Stripe can deliver an `invoice.payment_succeeded` webhook before the `customer.subscription.created` webhook arrives. Workers must inspect Stripe event timestamps and use idempotent upserts.',
    metricsToQuote: ['100% Financial Reconciliation', 'Zero Out-of-Order Webhook Bugs', '<2min Churn Alert Notification'],
    architectureSteps: [
      { stepNumber: 1, title: 'Stripe Signature Verification', tech: 'Stripe Webhook SDK', description: 'Verifies cryptographic signature using webhook signing secret to block spoofed events.' },
      { stepNumber: 2, title: 'Event Idempotency Check', tech: 'Redis Event ID Cache', description: 'Stores Stripe `evt_xxx` ID to ignore duplicate webhook deliveries.' },
      { stepNumber: 3, title: 'Customer Matching & L2A', tech: 'Stripe Customer ID Lookup', description: 'Finds matched Salesforce Account using `Stripe_Customer_ID__c`.' },
      { stepNumber: 4, title: 'MRR & Status Stamping', tech: 'Salesforce Account Update', description: 'Updates `MRR__c`, `Subscription_Status__c`, and `Renewal_Date__c`.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you handle out-of-order webhook delivery from payment providers like Stripe in your CRM sync pipeline?',
        starScript: 'Stripe guarantees at-least-once delivery, which means webhooks can arrive out of order or duplicated. I handle this by caching the event timestamp in Redis and querying the Stripe API for the authoritative subscription state if an invoice arrives before customer creation. Updates to the CRM are always idempotent upserts using the Stripe Customer ID as an external identifier.',
        cribSheetBuzzwords: ['Stripe Signature Verification', 'At-Least-Once Delivery', 'Authoritative State Pull', 'External ID Upsert']
      }
    ]
  },

  {
    id: 'user-to-account-rollup',
    title: 'User-Level to Account-Level Rollup Aggregations',
    category: 'PLG & Reverse ETL',
    plainEnglish: 'Summarizing hundreds of individual employee actions (e.g. 50 people logging in, 1,200 total queries run) into single high-level metrics on the parent Company record in Salesforce so reps can assess company health at a glance.',
    whyCompaniesCare: 'Sales reps manage accounts, not individual users. Rollup metrics show overall account health, churn risk, and seat expansion potential.',
    founderProofPoint: 'Calculated organizational clinic utilization and user activity rollups at Novalyte AI.',
    seniorSoundbite: '"I design asynchronous rollup pipelines in PostgreSQL that aggregate user-level usage into account-level health scores, updating CRM records without performance penalties on the main database."',
    gotchaToDefend: 'Expensive real-time aggregation queries: Running `COUNT(*)` across 50,000 user rows on every customer page load kills database performance. Pre-calculate aggregations asynchronously into summary tables.',
    metricsToQuote: ['Pre-calculated Aggregations (Zero DB Lag)', 'Daily Active Seat Utilization Tracking', 'Automated Health Score Stamping'],
    architectureSteps: [
      { stepNumber: 1, title: 'Raw Activity Logging', tech: 'PostgreSQL User Activity Table', description: 'Records user sign-ins, feature clicks, and exported reports.' },
      { stepNumber: 2, title: 'Scheduled Aggregation Worker', tech: 'SQL Materialized View / Cron', description: 'Computes rollups: `active_users_7d`, `total_exports`, `seat_utilization_pct`.' },
      { stepNumber: 3, title: 'Differential Change Detection', tech: 'Delta Compare', description: 'Pulls only accounts whose rollup metrics changed by more than 5% since last sync.' },
      { stepNumber: 4, title: 'CRM Account Update', tech: 'Salesforce Bulk API', description: 'Stamps `Active_Seats__c` and `Health_Score__c` on the parent Account record.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you aggregate product metrics across 10,000 users belonging to a single enterprise customer without causing database query timeouts?',
        starScript: 'I pre-calculate aggregations asynchronously into dedicated summary rollup tables or materialized views using a scheduled background worker. The CRM sync worker reads from this pre-aggregated table rather than running real-time COUNT queries on the raw event logs, keeping query latency under 50 milliseconds.',
        cribSheetBuzzwords: ['Materialized View Aggregation', 'Asynchronous Rollup Worker', 'Differential Change Detection', 'Seat Utilization Metric']
      }
    ]
  },

  // ==========================================
  // 7. OUTBOUND & INTENT (4 Topics)
  // ==========================================
  {
    id: 'sequencer-ingestion',
    title: 'Sales Sequencer Ingestion & Governance (Outreach/SalesLoft)',
    category: 'Outbound & Intent',
    plainEnglish: 'Automatically pushing verified leads into sales email sequencing tools (Outreach, SalesLoft, Apollo) while enforcing safety limits so reps don\'t spam prospects or violate opt-out laws.',
    whyCompaniesCare: 'Automates 90% of a BDR\'s manual administrative work while ensuring strict compliance with CAN-SPAM and GDPR unsubscribe rules.',
    founderProofPoint: 'Managed automated outreach sequences, email cadences, and sales operations at Zendesk and Novalyte AI.',
    seniorSoundbite: '"I govern sequencer ingestion through strict pre-flight validation: checking universal opt-out lists, active deal locks, and domain throttles before auto-enrolling contacts into Outreach sequences."',
    gotchaToDefend: 'Simultaneous conflicting sequences: Two different SDRs adding the same VP to two different email sequences in the same week. The ingestion service must lock the contact to one active sequence at a time.',
    metricsToQuote: ['100% Sequence Mutual Exclusivity', 'Zero CAN-SPAM / GDPR Violations', 'Automated Unsubscribe Sync'],
    architectureSteps: [
      { stepNumber: 1, title: 'Pre-Flight Governance Check', tech: 'PostgreSQL Opt-Out Index', description: 'Checks if contact has ever unsubscribed, requested DNC, or has an active deal.' },
      { stepNumber: 2, title: 'Domain Throttle Check', tech: 'Redis Active Counter', description: 'Ensures we never email more than 3 people at the same company simultaneously.' },
      { stepNumber: 3, title: 'Sequence Enrollment API', tech: 'Outreach / SalesLoft API', description: 'Enrolls contact into the appropriate persona sequence (e.g. "CTO Inbound Nurture").' },
      { stepNumber: 4, title: 'Two-Way Activity Sync', tech: 'Webhook Listener', description: 'Listens for email opens, replies, and bounces, updating CRM lead stage automatically.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you prevent multiple sales reps from spamming different executives at the same target company at the same time?',
        starScript: 'I implement a domain-level concurrency governor in our sequencer ingestion pipeline. When a lead is queued for sequence enrollment, the worker checks Redis to see how many contacts at that domain are currently in an active sequence. If the active count is at our cap (e.g. max 3 per company), additional leads are queued in a delayed buffer until existing cadences finish.',
        cribSheetBuzzwords: ['Domain-Level Concurrency Cap', 'Mutual Exclusivity Lock', 'Pre-Flight Opt-Out Verification', 'Universal DNC List']
      }
    ]
  },

  {
    id: 'intent-signal-triggers',
    title: 'Intent Signal Event Triggers (G2 / 6sense / Bombora)',
    category: 'Outbound & Intent',
    plainEnglish: 'Detecting when a company is secretly researching your product or your competitors on review sites (like G2) or tech forums, and immediately triggering an outbound campaign to their decision-makers.',
    whyCompaniesCare: 'Timing is everything. Reaching out when a company is actively shopping increases meeting book rates by 300% compared to cold outbound.',
    founderProofPoint: 'Constructed intent-driven discovery workflows and prospect qualification signals at Novalyte AI.',
    seniorSoundbite: '"I transform raw third-party intent signals from G2 and 6sense into high-priority outbound triggers, matching surging topics against our ICP matrix to mobilize sales reps within hours."',
    gotchaToDefend: 'Low-confidence signal noise: Bombora surges can fire on general keyword searches that have no purchase intent. Signals must be combined with technographic fit and job-change data before triggering rep outreach.',
    metricsToQuote: ['300% Higher Meeting Book Rate', '<2h Intent-to-Outreach Latency', 'Composite Intent Confidence Scoring'],
    architectureSteps: [
      { stepNumber: 1, title: 'Intent Webhook Ingress', tech: 'G2 / 6sense Webhook Listener', description: 'Captures intent event (e.g. "Acme Corp viewed your pricing page on G2").' },
      { stepNumber: 2, title: 'L2A Match & Account Lookup', tech: 'PostgreSQL Domain Matcher', description: 'Identifies the corresponding Account record in Salesforce.' },
      { stepNumber: 3, title: 'Contact Waterfall Generation', tech: 'Apollo / Clay Automated Lookups', description: 'Auto-finds relevant decision-maker personas (VP Engineering, Head of RevOps).' },
      { stepNumber: 4, title: 'Outbound Action Dispatch', tech: 'Outreach API + Slack Notification', description: 'Drafts personalized email sequence and pings the Account Executive in Slack.' }
    ],
    practiceQuestions: [
      {
        question: 'How would you architect an end-to-end automated workflow triggered when an enterprise account visits your G2 review page?',
        starScript: 'When G2 fires an intent webhook, our ingress service matches the domain to our CRM Account. It enriches the account to pull verified emails for the VP of Engineering and Head of Sales Ops. It drafts a personalized sequence referencing current market challenges, creates an intent task in Salesforce, and pings the AE in Slack with a 1-click approval button.',
        cribSheetBuzzwords: ['G2 Buyer Intent Webhook', 'Automated Persona Extraction', 'Pre-Drafted Outreach Sequence', '1-Click AE Approval']
      }
    ]
  },

  {
    id: 'multi-channel-cadence',
    title: 'Multi-Channel Cadence Orchestration (LinkedIn + Email + Phone)',
    category: 'Outbound & Intent',
    plainEnglish: 'Coordinating outbound sales touches across multiple channels—Day 1 email, Day 2 LinkedIn profile view, Day 4 phone call, Day 7 follow-up email—in a synchronized timeline without annoying the prospect.',
    whyCompaniesCare: 'Single-channel cold emails get ignored. Multi-channel touchpoints increase meeting booking rates by 2.5x by meeting buyers where they prefer to communicate.',
    founderProofPoint: 'Orchestrated multi-channel communication pipelines (SMS, email, portal) for clinic patient intake at Novalyte AI.',
    seniorSoundbite: '"I design synchronized multi-channel cadences using distributed state machines, orchestrating email, LinkedIn, and telephony steps while respecting channel cooldown periods."',
    gotchaToDefend: 'Channel spam: Sending an email, a LinkedIn message, and making a phone call all within 10 minutes makes the company look desperate. Cadence rules must enforce 24-to-48 hour cooling periods between distinct channel touchpoints.',
    metricsToQuote: ['2.5x Higher Prospect Response Rate', 'Enforced 24h Channel Cooldowns', 'Unified State Machine Cadence'],
    architectureSteps: [
      { stepNumber: 1, title: 'Cadence State Machine', tech: 'Temporal / BullMQ State Machine', description: 'Tracks the exact step, channel, and scheduled execution time for each contact.' },
      { stepNumber: 2, title: 'Channel Dispatcher', tech: 'Outreach / SendGrid / Twilio API', description: 'Executes the scheduled channel action (Email, Phone Task, LinkedIn Step).' },
      { stepNumber: 3, title: 'Reply & Sentiment Interceptor', tech: 'Inbound Webhook Listener', description: 'If prospect replies on ANY channel, immediately halts all upcoming steps across all channels.' },
      { stepNumber: 4, title: 'Rep Task Board Sync', tech: 'Salesforce Task Sync', description: 'Creates prioritized call list for the rep with background company research.' }
    ],
    practiceQuestions: [
      {
        question: 'If a prospect replies "Not interested" to a sales email, how do you ensure they are not called on the phone 2 days later by an automated sequence?',
        starScript: 'I use a centralized state machine for all outbound touches. When the email reply webhook arrives, an NLP sentiment filter identifies the negative reply and updates the contact\'s global status to "Opted Out - Disqualified". The state machine immediately cancels all pending BullMQ delayed jobs across email, LinkedIn, and telephony, logging an audit record and notifying the rep.',
        cribSheetBuzzwords: ['Unified State Machine', 'Global Opt-Out Propagation', 'Delayed Job Cancellation', 'Channel Cooldown Window']
      }
    ]
  },

  {
    id: 'abm-account-scoring',
    title: 'Account-Based Marketing (ABM) Engagement Scoring',
    category: 'Outbound & Intent',
    plainEnglish: 'A mathematical point system that calculates how "hot" an enterprise account is based on actions taken by all of its employees combined (e.g. VP opened 3 emails = 15 pts; engineer visited docs = 10 pts; pricing page visited = 25 pts).',
    whyCompaniesCare: 'Tells marketing and sales which 20 accounts out of 1,000 target accounts are ready to buy this week, focusing rep energy where closing probability is highest.',
    founderProofPoint: 'Developed lead scoring, engagement algorithms, and conversion tracking at Novalyte AI and Zendesk.',
    seniorSoundbite: '"I build aggregate ABM engagement scoring models that decay points over time, surfacing accounts with surging multi-stakeholder intent to sales leadership in real-time dashboards."',
    gotchaToDefend: 'Point inflation without time decay: An account that visited your website 6 months ago shouldn\'t still have an 80-point hot score. Engagement models must apply an exponential time-decay factor (e.g. points lose 50% value every 30 days).',
    metricsToQuote: ['Exponential 30-day Time Decay', 'Multi-Stakeholder Engagement Scoring', 'Top 5% Account Prioritization'],
    architectureSteps: [
      { stepNumber: 1, title: 'Multi-Touch Event Collection', tech: 'PostgreSQL / Segment Events', description: 'Logs every web visit, email open, document download, and ad click.' },
      { stepNumber: 2, title: 'Weighted Scoring Engine', tech: 'Scheduled Calculation Worker', description: 'Applies point weights: Pricing Page = 25pts; Case Study = 10pts; Email Open = 2pts.' },
      { stepNumber: 3, title: 'Exponential Time Decay Function', tech: 'SQL Decay Formula', description: 'Applies decay multiplier based on elapsed days: `score = raw_score * exp(-lambda * days)`.' },
      { stepNumber: 4, title: 'Tier Elevation & Routing', tech: 'Salesforce Account Tiering', description: 'Promotes account to "Tier 1 - Hot Surge" when score crosses 75, triggering sales alert.' }
    ],
    practiceQuestions: [
      {
        question: 'Why is time decay a critical component of any B2B account engagement scoring model?',
        starScript: 'Without time decay, points accumulate indefinitely, causing dormant accounts that were active six months ago to falsely appear high-intent. Applying an exponential time decay factor ensures that engagement scores reflect current buying intent, directing sales reps exclusively toward accounts actively researching solutions right now.',
        cribSheetBuzzwords: ['Exponential Time Decay Formula', 'Multi-Stakeholder Aggregate Score', 'Threshold Elevation Trigger', 'Dormant Account Prevention']
      }
    ]
  },

  // ==========================================
  // 8. AI & MODEL CONTEXT PROTOCOL (MCP) (4 Topics)
  // ==========================================
  {
    id: 'model-context-protocol-mcp',
    title: 'Model Context Protocol (MCP) Server Architecture',
    category: 'AI & Model Context Protocol (MCP)',
    plainEnglish: 'The modern open standard that lets AI models and agents securely query your internal databases, call CRM APIs, and execute approved tools through strict, schema-validated contracts.',
    whyCompaniesCare: 'The next era of GTM Engineering is autonomous AI agents doing lead qualification and CRM updates instead of humans. MCP provides the safe, standard plumbing for agents to talk to software tools.',
    founderProofPoint: 'Designed and deployed Model Context Protocol (MCP) server endpoints connecting operational clinic databases to AI agents in Novalyte AI.',
    seniorSoundbite: '"I architect custom Model Context Protocol servers in TypeScript, exposing schema-validated tools for CRM querying and domain enrichment while enforcing strict role-based access boundaries."',
    gotchaToDefend: 'Over-privileged tools and security boundaries: Giving an LLM agent an unrestricted SQL tool or an `update_crm` tool without strict input sanitization. The MCP server must enforce tight Zod schemas and prevent destructive operations (e.g. no bulk deletes).',
    metricsToQuote: ['Sub-2s Agent Tool Execution', 'Zero Injection Vulnerabilities', 'Zod-Validated MCP Tool Schemas'],
    architectureSteps: [
      { stepNumber: 1, title: 'MCP Server Host', tech: '@modelcontextprotocol/sdk + TypeScript', description: 'Runs MCP server exposing standardized tools over stdio or SSE transport.' },
      { stepNumber: 2, title: 'Zod Tool Definitions', tech: 'Input Schema Validation', description: 'Defines tools like `get_account_status`, `enrich_company`, `log_sales_meeting`.' },
      { stepNumber: 3, title: 'Permission & RBAC Layer', tech: 'Scoped API Tokens', description: 'Restricts agent to read-only queries or sandboxed write operations.' },
      { stepNumber: 4, title: 'Audit Logger', tech: 'PostgreSQL MCP Call Log', description: 'Logs every prompt, tool invocation, parameters, and returned output for security auditing.' }
    ],
    practiceQuestions: [
      {
        question: 'Explain how Model Context Protocol (MCP) works and why it is superior to ad-hoc custom API integrations for AI-powered GTM systems.',
        starScript: 'MCP provides an open, standardized protocol for AI models to discover, inspect, and invoke tools using structured JSON-RPC contracts. Instead of writing custom brittle glue code for every LLM and CRM integration, an MCP server exposes type-safe, Zod-validated tools. The AI agent inspects the tool schemas, issues tool calls, and the MCP server executes the backend logic securely with built-in audit logging.',
        cribSheetBuzzwords: ['@modelcontextprotocol/sdk', 'Structured JSON-RPC Contracts', 'Zod Schema Validation', 'Scoped Tool Permissions']
      }
    ]
  },

  {
    id: 'structured-llm-extraction',
    title: 'Structured LLM Extraction & JSON Schemas (Zod)',
    category: 'AI & Model Context Protocol (MCP)',
    plainEnglish: 'Using an AI model to read messy, unstructured text (like a messy 3-paragraph demo request or customer call recording) and reliably output a clean, strict JSON object that fits directly into database columns.',
    whyCompaniesCare: 'Transforms unstructured sales notes into clean dropdown fields (e.g. "Current CRM: HubSpot", "Team Size: 50", "Pain Point: Data hygiene") with zero human data-entry effort.',
    founderProofPoint: 'Architected structured LLM extraction schemas in Novalyte AI to parse open-ended patient intakes into rigorous clinical data models.',
    seniorSoundbite: '"I leverage Gemini structured outputs with strict Zod schemas to parse open-ended customer communications into validated CRM fields with automated fallback validation."',
    gotchaToDefend: 'LLM hallucination on unknown fields: When a customer doesn\'t mention their budget, the LLM might invent "$50,000". Your schema must explicitly support nullable fields with prompt instructions: "If not explicitly stated, return null; never guess."',
    metricsToQuote: ['99.4% Valid JSON Output Rate', 'Zero Hallucinated Dropdown Values', 'Sub-3s Extraction Latency'],
    architectureSteps: [
      { stepNumber: 1, title: 'Raw Inbound Ingestion', tech: 'Webform Text / Call Transcript', description: 'Captures unstructured text from prospect.' },
      { stepNumber: 2, title: 'Zod Schema Specification', tech: 'TypeScript Zod Object', description: 'Defines exact fields: `budgetRange`, `timelineMonths`, `currentTechStack[]`.' },
      { stepNumber: 3, title: 'Constrained LLM Generation', tech: 'Gemini 2.5 Flash Structured Mode', description: 'Forces model output into compliant JSON adhering strictly to the schema.' },
      { stepNumber: 4, title: 'Runtime Schema Validation', tech: 'zod.safeParse()', description: 'Validates output before writing to CRM; falls back to manual triage if validation fails.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you guarantee that an LLM will never output malformed JSON or hallucinate values when extracting CRM fields from customer transcripts?',
        starScript: 'I use two defense layers: 1) Constrained generation via Gemini or OpenAI structured outputs enforcing a strict Zod JSON schema. 2) Runtime validation using `zod.safeParse()`. In the system prompt, I instruct the model that fields must remain null if not explicitly mentioned by the prospect. If schema validation fails, the payload is flagged for human review rather than corrupting the CRM.',
        cribSheetBuzzwords: ['Constrained Structured Output', 'zod.safeParse() Runtime Gate', 'Nullable Explicit Guard', 'Zod Schema Validation']
      }
    ]
  },

  {
    id: 'autonomous-research-agents',
    title: 'Autonomous Account Research & Dossier Agents',
    category: 'AI & Model Context Protocol (MCP)',
    plainEnglish: 'An AI assistant that automatically visits a prospect\'s website, reads their recent 10-K filings and news articles, and writes a 3-bullet executive cheat sheet for the sales rep before their meeting.',
    whyCompaniesCare: 'Saves each sales rep 45 minutes of manual prep work per meeting, allowing reps to conduct 30% more customer meetings every week.',
    founderProofPoint: 'Engineered autonomous research and provider profiling agents in Novalyte AI.',
    seniorSoundbite: '"I build autonomous research agents that scrape company signals, synthesize a custom value hypothesis using Gemini 2.5 Flash, and attach a 3-bullet executive dossier directly to the CRM deal."',
    gotchaToDefend: 'Runaway token costs: Running deep multi-page web scraping and large model inference on thousands of junk leads. Gate agentic research: only run autonomous research on qualified accounts with >50 employees or verified pipeline.',
    metricsToQuote: ['45 Minutes Saved per Rep per Meeting', '+30% Weekly Meeting Capacity', 'Sub-15s Dossier Generation'],
    architectureSteps: [
      { stepNumber: 1, title: 'Meeting Booking Trigger', tech: 'Calendly / Chili Piper Webhook', description: 'Fires when an enterprise prospect books a demo on the website.' },
      { stepNumber: 2, title: 'Target Web Scraper', tech: 'Firecrawl API / Puppeteer', description: 'Extracts homepage value prop, product documentation, and leadership bios.' },
      { stepNumber: 3, title: 'LLM Synthesis Agent', tech: 'Gemini 2.5 Flash', description: 'Synthesizes 3 bullets: 1) What they do, 2) Their likely architectural pain point, 3) Recommended opening question.' },
      { stepNumber: 4, title: 'Salesforce & Slack Push', tech: 'Salesforce Note + Slack DM', description: 'Attaches dossier to Salesforce Opportunity and DMs the assigned rep 10 minutes before the call.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you design an AI research agent that prepares sales reps for discovery calls without blowing your monthly LLM inference budget?',
        starScript: 'I implement strict cost gating: the research agent only triggers when a prospect books a qualified demo on an account with >50 employees. We use Firecrawl to scrape only the homepage and about page, and use a fast, cost-efficient model like Gemini 2.5 Flash to synthesize a standardized 3-bullet dossier. This costs less than 2 cents per meeting while saving the rep 45 minutes of research.',
        cribSheetBuzzwords: ['Cost-Gating Criteria', 'Gemini 2.5 Flash', 'Firecrawl Web Extraction', '3-Bullet Executive Dossier']
      }
    ]
  },

  {
    id: 'ai-lead-triage',
    title: 'AI Inbound Lead Triage & Auto-Categorization',
    category: 'AI & Model Context Protocol (MCP)',
    plainEnglish: 'Using an AI model to read incoming enterprise demo inquiries, determine their urgency and buying intent, and automatically route tier-1 prospects to immediate booking while sending student/spam inquiries to self-serve docs.',
    whyCompaniesCare: 'Stops junior sales reps from wasting time on students or job seekers, while ensuring VIP Fortune 500 inquiries are fast-tracked in seconds.',
    founderProofPoint: 'Created intelligent clinical intake triage and priority routing pipelines in Novalyte AI.',
    seniorSoundbite: '"I deploy AI triage models at ingress that categorize inbound leads into discrete intent tiers, fast-tracking VIP buyers directly to executive booking while routing low-intent traffic to self-serve nurtures."',
    gotchaToDefend: 'False negative classification: An AI model mistakenly categorizing a Fortune 500 VP who used a casual tone as "low intent". High-value company domains must always bypass AI disqualification to ensure human eyes review enterprise leads.',
    metricsToQuote: ['100% Protection of Enterprise Domains', '80% Reduction in Rep Time on Unqualified Leads', 'Sub-3s Ingress Triage'],
    architectureSteps: [
      { stepNumber: 1, title: 'Inbound Ingress Listener', tech: 'Webhook Gateway', description: 'Receives demo request payload with freeform notes.' },
      { stepNumber: 2, title: 'Domain Whitelist Override', tech: 'Target Enterprise Domain Check', description: 'If domain is on the Enterprise Target list, bypasses AI evaluation and marks Tier 1 immediately.' },
      { stepNumber: 3, title: 'AI Intent Classifier', tech: 'Gemini Structured Classifier', description: 'Classifies into: 1) High Intent Enterprise, 2) Mid-Market, 3) Support / Student / Spam.' },
      { stepNumber: 4, title: 'Conditional Workflow Routing', tech: 'CRM Lead Router', description: 'Tier 1 -> Instant Slack to AE; Tier 3 -> Auto-email with documentation link.' }
    ],
    practiceQuestions: [
      {
        question: 'How do you prevent an AI lead qualification model from accidentally disqualifying a legitimate enterprise prospect who wrote a short or informal demo message?',
        starScript: 'I implement a deterministic whitelist override before the AI classifier ever runs. If the email domain matches our Enterprise Target Account list or has >500 employees, it is automatically marked Tier 1 and routed to a human rep regardless of what the user wrote. The AI model is only used to categorize ambiguous mid-market and SMB submissions, ensuring zero false negatives on enterprise deals.',
        cribSheetBuzzwords: ['Deterministic Whitelist Override', 'False Negative Prevention', 'Dual-Tier Classification', 'Conditional Workflow Router']
      }
    ]
  }
];

export function getTopicById(topicId: string): GTMTopic | undefined {
  const normalized = topicId.toLowerCase().trim().replace('_', '-');
  return GTM_TOPICS.find((t) => t.id === normalized || t.id.includes(normalized) || normalized.includes(t.id));
}
