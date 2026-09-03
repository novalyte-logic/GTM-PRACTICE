export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface GuidedStepItem {
  id: string;
  stepNumber: number;
  topicCategory: string;
  tabTarget?: 'simulator' | 'scenarios' | 'benchmarks' | 'trends' | 'learning-path' | 'history' | 'cheatsheet';
  title: string;
  shortLabel: string;
  whatItIsFor: string;
  example: string;
  quizzes: QuizQuestion[];
}

export const GUIDED_STUDIO_STEPS: GuidedStepItem[] = [
  {
    id: 'step-1-track-profile',
    stepNumber: 1,
    topicCategory: 'Targeting & Scope Calibration',
    tabTarget: 'simulator',
    title: 'Select Role Profile, Track & Difficulty Tier',
    shortLabel: '1. Select Track & Role',
    whatItIsFor: 'Filters the questions to match the exact company stage and job description you are interviewing for (e.g., Senior GTM Systems Engineer at a high-growth PLG SaaS vs. Enterprise RevOps Architect).',
    example: 'A Series-B startup handling product signups needs "Inbound Webhook & Rate Limiting" architecture, whereas an Enterprise needs "Multi-Instance Salesforce Governance".',
    quizzes: [
      {
        id: 'q1-1',
        question: 'Why should you customize the Role Profile & Company Archetype before practicing?',
        options: [
          {
            id: 'opt-1-1-a',
            text: 'It only changes the aesthetic color palette of the code editor.',
            isCorrect: false,
            explanation: 'Incorrect. Role profiles fundamentally adjust the governor limits, SaaS integrations, and hiring rubrics used by the AI evaluator.'
          },
          {
            id: 'opt-1-1-b',
            text: 'It calibrates the AI evaluation rubrics, question scenarios, and toolchains to match real job hiring bars (e.g., PLG vs Enterprise RevOps).',
            isCorrect: true,
            explanation: 'Correct! An enterprise role evaluates you heavily on SOQL governor limits and ERP syncs, while a PLG startup emphasizes fast webhook buffering and enrichment APIs.'
          },
          {
            id: 'opt-1-1-c',
            text: 'It disables all architectural questions and limits drills to trivia.',
            isCorrect: false,
            explanation: 'Incorrect. Architectural depth and system design are tested across all tiers.'
          }
        ]
      },
      {
        id: 'q1-2',
        question: 'In an Enterprise RevOps Architect role, what is the primary technical governor limit you must proactively address?',
        options: [
          {
            id: 'opt-1-2-a',
            text: 'Salesforce synchronous SOQL query limits (100 per transaction), DML lock row contention, and 24-hr API call caps.',
            isCorrect: true,
            explanation: 'Correct! Enterprise environments have massive batch volumes that hit Salesforce limits unless bulkified and decoupled with asynchronous workers.'
          },
          {
            id: 'opt-1-2-b',
            text: 'HubSpot free tier email sending maximums of 200 emails per month.',
            isCorrect: false,
            explanation: 'Incorrect. Enterprise RevOps focuses on large-scale CRM limits, data warehouses (Snowflake), and bi-directional ERP pipelines.'
          },
          {
            id: 'opt-1-2-c',
            text: 'Browser local storage memory limits of 5MB.',
            isCorrect: false,
            explanation: 'Incorrect. GTM architecture operates primarily in backend middleware, queues, and cloud integrations.'
          }
        ]
      },
      {
        id: 'q1-3',
        question: 'How does a PLG (Product-Led Growth) GTM pipeline architecture differ fundamentally from a traditional Sales-Led pipeline?',
        options: [
          {
            id: 'opt-1-3-a',
            text: 'PLG does not require any CRM or lead routing.',
            isCorrect: false,
            explanation: 'Incorrect. PLG systems still sync qualified product accounts (PQLs) to sales reps.'
          },
          {
            id: 'opt-1-3-b',
            text: 'PLG pipelines handle high-frequency product event streams (Segment/PostHog), scoring Product Qualified Leads (PQLs) in near real-time before syncing to CRM.',
            isCorrect: true,
            explanation: 'Correct! PLG requires event stream ingestion, usage aggregation, and dynamic threshold triggers rather than simple manual demo form submissions.'
          },
          {
            id: 'opt-1-3-c',
            text: 'PLG systems never use automated enrichment APIs.',
            isCorrect: false,
            explanation: 'Incorrect. Fast enrichment is vital to qualify product signups instantly.'
          }
        ]
      }
    ]
  },
  {
    id: 'step-2-architecture-constraints',
    stepNumber: 2,
    topicCategory: 'Governor Limits & Edge Cases',
    tabTarget: 'simulator',
    title: 'Examine Question, Architecture Constraints & Wildcards',
    shortLabel: '2. Examine Constraints',
    whatItIsFor: 'Every high-stakes GTM interview tests your ability to spot edge cases before answering (e.g., 200 req/sec spikes, 100 SOQL query limits, 15s timeout thresholds).',
    example: 'If an inbound webhook receives 5,000 payload drops in 10 seconds, calling HubSpot API directly will return 429 Too Many Requests. You must buffer in Redis/SQS with exponential backoff.',
    quizzes: [
      {
        id: 'q2-1',
        question: 'What is the biggest risk of immediately calling Salesforce REST API synchronously inside a public webhook handler?',
        options: [
          {
            id: 'opt-2-1-a',
            text: 'The webhook will hit API concurrency limits (e.g. 25 long-running requests) and drop customer leads with 504 gateway timeouts.',
            isCorrect: true,
            explanation: 'Correct! Webhook endpoints must acknowledge 200 OK within 200ms and push payloads to a message queue (SQS/Redis) for asynchronous batch processing.'
          },
          {
            id: 'opt-2-1-b',
            text: 'Salesforce will permanently delete the Lead object database table.',
            isCorrect: false,
            explanation: 'Incorrect. Salesforce will reject requests with 429 or 503 HTTP status codes, dropping lead submissions.'
          },
          {
            id: 'opt-2-1-c',
            text: 'There is no risk; Salesforce handles infinite concurrent synchronous writes automatically.',
            isCorrect: false,
            explanation: 'Incorrect. Salesforce has strict concurrent API limits and 24-hour rolling call caps.'
          }
        ]
      },
      {
        id: 'q2-2',
        question: 'How should your architecture handle upstream schema drift (e.g., a required field renamed or returning null in a Stripe/HubSpot payload)?',
        options: [
          {
            id: 'opt-2-2-a',
            text: 'Let the backend crash and restart the server repeatedly.',
            isCorrect: false,
            explanation: 'Incorrect. Uncaught runtime exceptions lead to pipeline outages and data loss.'
          },
          {
            id: 'opt-2-2-b',
            text: 'Use runtime schema validation (Zod/Pydantic), store raw raw_payload JSON in the database, and route malformed records to a Dead-Letter Queue (DLQ).',
            isCorrect: true,
            explanation: 'Correct! Validating with Zod and preserving raw payload JSON allows for non-blocking processing and safe replay after fixing schema mappings.'
          },
          {
            id: 'opt-2-2-c',
            text: 'Silently drop all incoming webhooks without logging.',
            isCorrect: false,
            explanation: 'Incorrect. Dropping data silently prevents recovery and damages revenue attribution.'
          }
        ]
      },
      {
        id: 'q2-3',
        question: 'When an interviewer injects a "100 SOQL query governor limit" wildcard constraint during bulk data sync, how do you solve it?',
        options: [
          {
            id: 'opt-2-3-a',
            text: 'Execute a SOQL query inside a `for` loop for each contact record.',
            isCorrect: false,
            explanation: 'Incorrect! Querying inside a loop is the #1 anti-pattern in Salesforce and immediately throws `System.LimitException: Too many SOQL queries: 101`.'
          },
          {
            id: 'opt-2-3-b',
            text: 'Bulkify the queries: collect all record IDs into a Set, execute a single `SELECT ... WHERE Id IN :idSet`, and map in memory before batch DML.',
            isCorrect: true,
            explanation: 'Correct! Bulkifying gathers all IDs into one single SOQL query and maps relationships in memory, keeping queries to 1-2 per batch.'
          },
          {
            id: 'opt-2-3-c',
            text: 'Ask Salesforce support to remove all limits from the production instance.',
            isCorrect: false,
            explanation: 'Incorrect. Multi-tenant governor limits cannot be removed; code must be bulkified.'
          }
        ]
      }
    ]
  },
  {
    id: 'step-3-draft-answer',
    stepNumber: 3,
    topicCategory: 'Decoupled Pipeline Architecture',
    tabTarget: 'simulator',
    title: 'Structure & Type/Record Your Architectural Solution',
    shortLabel: '3. Structure Your Answer',
    whatItIsFor: 'Forces you to structure your thought process using the Staff GTM Framework: Ingress &rarr; Message Queue/Buffer &rarr; Waterfall Enrichment &rarr; Idempotency/Deduplication &rarr; Telemetry/Dead-Letter Queue.',
    example: 'State your Ingress handler first, then Redis Queue with Celery worker, Clay waterfall for missing emails, and Datadog alerts for failed sync retries.',
    quizzes: [
      {
        id: 'q3-1',
        question: 'Which sequence demonstrates Senior/Staff GTM architectural mastery in an interview answer?',
        options: [
          {
            id: 'opt-3-1-a',
            text: 'Ingress Handler &rarr; Message Queue (Buffer) &rarr; Deduplication & Idempotency Check &rarr; Waterfall Enrichment &rarr; Batch CRM Write with DLQ',
            isCorrect: true,
            explanation: 'Spot on! This decouples ingestion, eliminates duplicates, optimizes costly API calls, and guarantees zero data loss via Dead Letter Queues.'
          },
          {
            id: 'opt-3-1-b',
            text: 'Direct Zapier Webhook &rarr; Instant 1-by-1 Salesforce Insert with no logging or queueing.',
            isCorrect: false,
            explanation: 'Incorrect. No-code direct syncs fail silently under load and violate governor limits.'
          },
          {
            id: 'opt-3-1-c',
            text: 'Nightly CSV export and manual import via spreadsheet.',
            isCorrect: false,
            explanation: 'Incorrect. Modern GTM pipelines require sub-second or near real-time automated routing.'
          }
        ]
      },
      {
        id: 'q3-2',
        question: 'Why is asynchronous message queue buffering (Redis/SQS) superior to direct point-to-point webhook delivery?',
        options: [
          {
            id: 'opt-3-2-a',
            text: 'It isolates downstream rate limits (e.g. 10 req/sec) from traffic spikes (5,000 req/sec) and allows safe retries if downstream SaaS goes down.',
            isCorrect: true,
            explanation: 'Correct! A queue acts as a shock absorber: webhook producers return 200 OK fast, while consumers drain the queue at the downstream API’s allowable pace.'
          },
          {
            id: 'opt-3-2-b',
            text: 'It eliminates the need for any backend code or servers.',
            isCorrect: false,
            explanation: 'Incorrect. Workers still execute the data processing, deduplication, and API writes.'
          },
          {
            id: 'opt-3-2-c',
            text: 'It makes all API calls free of charge.',
            isCorrect: false,
            explanation: 'Incorrect. Queuing manages throughput and reliability, not SaaS vendor pricing.'
          }
        ]
      },
      {
        id: 'q3-3',
        question: 'In a modern enrichment workflow (e.g., Clay / Apollo / ZoomInfo), why is "Waterfall Enrichment" preferred over a single vendor?',
        options: [
          {
            id: 'opt-3-3-a',
            text: 'It optimizes match rates and cost: check cheaper/internal cache first (e.g. Apollo at $0.02), cascading to premium providers (ZoomInfo at $0.50) only when data is missing.',
            isCorrect: true,
            explanation: 'Correct! Waterfall enrichment maximizes fill rates (up to 85%+) while saving 60%+ in API credits by only escalating to expensive vendors when necessary.'
          },
          {
            id: 'opt-3-3-b',
            text: 'It sends identical requests to all providers simultaneously and charges credit card 5 times.',
            isCorrect: false,
            explanation: 'Incorrect. Waterfalling is sequential and conditional, avoiding unnecessary duplicate spend.'
          },
          {
            id: 'opt-3-3-c',
            text: 'It deletes unverified emails without any fallback.',
            isCorrect: false,
            explanation: 'Incorrect. Fallbacks ensure maximum data completeness for sales teams.'
          }
        ]
      }
    ]
  },
  {
    id: 'step-4-ai-evaluation',
    stepNumber: 4,
    topicCategory: 'Rubric Evaluation & Idempotency',
    tabTarget: 'simulator',
    title: 'Run Instant AI Diagnostic & Rubric Scoring',
    shortLabel: '4. Run AI Evaluation',
    whatItIsFor: 'Grades your answer against 5 core competencies: Technical Architecture & Governor Limits, Data Governance, Tooling & Enrichment, Executive Presence, and Edge Case Defense.',
    example: 'Reveals whether you remembered to mention Idempotency Keys (`x-idempotency-key`) to prevent duplicate invoice creations when Stripe webhooks retry.',
    quizzes: [
      {
        id: 'q4-1',
        question: 'Why is an Idempotency Key (`x-idempotency-key`) essential when handling payment and lead creation webhooks?',
        options: [
          {
            id: 'opt-4-1-a',
            text: 'It encrypts the database user password.',
            isCorrect: false,
            explanation: 'Incorrect. Idempotency keys prevent duplicate operations, not encryption.'
          },
          {
            id: 'opt-4-1-b',
            text: 'It ensures that if the source SaaS retries the same webhook 3 times due to a timeout, your system only creates 1 single record in your CRM.',
            isCorrect: true,
            explanation: 'Correct! Networks drop packets, leading to retries. Idempotent deduplication guarantees exactly-once execution.'
          },
          {
            id: 'opt-4-1-c',
            text: 'It makes the API call bypass all CRM validation rules.',
            isCorrect: false,
            explanation: 'Incorrect. It provides safety against race conditions and duplicates.'
          }
        ]
      },
      {
        id: 'q4-2',
        question: 'If the interviewer asks "Why didn\'t you just build this in standard Zapier or Make.com?", what is the strongest architectural defense?',
        options: [
          {
            id: 'opt-4-2-a',
            text: 'Zapier lacks native dead-letter queues, distributed locking, custom rate-limit backoffs, and deterministic idempotency at high scale (>100k events/day).',
            isCorrect: true,
            explanation: 'Correct! Senior engineers explain that no-code tools are great for prototypes, but enterprise volume requires code-level observability, version control, and fault tolerance.'
          },
          {
            id: 'opt-4-2-b',
            text: 'Say you don\'t like GUI tools and prefer writing raw assembly code.',
            isCorrect: false,
            explanation: 'Incorrect. You must explain technical tradeoffs around scalability, governance, and failure modes.'
          },
          {
            id: 'opt-4-2-c',
            text: 'Agree with them and admit your code-based architecture is unnecessary.',
            isCorrect: false,
            explanation: 'Incorrect. Defending architectural decisions with concrete technical rationale is a core Staff evaluation criterion.'
          }
        ]
      },
      {
        id: 'q4-3',
        question: 'Which of the following is the most critical telemetry metric for proving data pipeline reliability to executive leadership?',
        options: [
          {
            id: 'opt-4-3-a',
            text: 'Total lines of code written in Python.',
            isCorrect: false,
            explanation: 'Incorrect. Lines of code does not measure reliability or business value.'
          },
          {
            id: 'opt-4-3-b',
            text: 'End-to-end Lead Processing Latency (P95 < 2s), Dead-Letter Queue Drop Rate (0%), and CRM Sync Error Rate (<0.01%).',
            isCorrect: true,
            explanation: 'Correct! P95 latency guarantees rapid speed-to-lead for SDRs, while 0% DLQ drops ensure zero lost pipeline revenue.'
          },
          {
            id: 'opt-4-3-c',
            text: 'The number of monitor screens in the office.',
            isCorrect: false,
            explanation: 'Incorrect.'
          }
        ]
      }
    ]
  },
  {
    id: 'step-5-calibration-reflection',
    stepNumber: 5,
    topicCategory: 'Calibration & Imposter Recovery',
    tabTarget: 'trends',
    title: 'Post-Drill Reflection & Confidence Calibration Heatmap',
    shortLabel: '5. Reflect & Calibrate',
    whatItIsFor: 'Record how confident you felt versus your actual AI score to identify Imposter Syndrome (scoring 90% while feeling anxious) or Blind Spots (feeling 100% confident while forgetting governor limits).',
    example: 'Moving your calibration delta within &plusmn;5% ensures executive presence in final-round hiring manager interviews.',
    quizzes: [
      {
        id: 'q5-1',
        question: 'What is the "Imposter Zone" in interview calibration analytics?',
        options: [
          {
            id: 'opt-5-1-a',
            text: 'When a candidate cheats on the interview questions.',
            isCorrect: false,
            explanation: 'Incorrect. It refers to psychological self-assessment vs objective capability.'
          },
          {
            id: 'opt-5-1-b',
            text: 'When your architectural answer scored high (e.g. 88%), but you felt nervous and rated your own performance low (e.g. 55%).',
            isCorrect: true,
            explanation: 'Correct! Recognizing this helps you project executive confidence and speak decisively without second-guessing yourself.'
          },
          {
            id: 'opt-5-1-c',
            text: 'When the AI evaluator is temporarily offline.',
            isCorrect: false,
            explanation: 'Incorrect.'
          }
        ]
      },
      {
        id: 'q5-2',
        question: 'Why is maintaining a narrow calibration delta (±5% between self-assessment and AI evaluation) critical for hiring manager rounds?',
        options: [
          {
            id: 'opt-5-2-a',
            text: 'It demonstrates self-awareness and accurate risk evaluation, proving you neither over-promise nor under-estimate engineering scope.',
            isCorrect: true,
            explanation: 'Correct! Engineering leaders prioritize candidates with accurate self-calibration because they communicate project timelines and architectural risks reliably.'
          },
          {
            id: 'opt-5-2-b',
            text: 'It automatically guarantees a 50% salary bump.',
            isCorrect: false,
            explanation: 'Incorrect. It provides calibrated executive presence and trusted technical communication.'
          },
          {
            id: 'opt-5-2-c',
            text: 'It skips the behavioral interview stage.',
            isCorrect: false,
            explanation: 'Incorrect.'
          }
        ]
      },
      {
        id: 'q5-3',
        question: 'What is the "Blind Spot Risk" quadrant on the GTM skill calibration matrix?',
        options: [
          {
            id: 'opt-5-3-a',
            text: 'When you rate yourself 95% confident, but score 50% due to unhandled governor limits, concurrency bugs, or missing error handlers.',
            isCorrect: true,
            explanation: 'Correct! Blind spot risks occur when candidates are unaware of critical edge cases, which leads to production outages if not corrected.'
          },
          {
            id: 'opt-5-3-b',
            text: 'When you refuse to wear reading glasses during the interview.',
            isCorrect: false,
            explanation: 'Incorrect.'
          },
          {
            id: 'opt-5-3-c',
            text: 'When the internet connection drops.',
            isCorrect: false,
            explanation: 'Incorrect.'
          }
        ]
      }
    ]
  },
  {
    id: 'step-6-scenario-sandbox',
    stepNumber: 6,
    topicCategory: 'Live Sandbox Triage',
    tabTarget: 'scenarios',
    title: 'Live Incident Triage Drills & CRM Sandbox',
    shortLabel: '6. Triage in CRM Sandbox',
    whatItIsFor: 'Simulate high-stakes production emergencies (e.g. 429 Rate Limits, Webhook Storms, Bi-Directional Loops) and test real-time architectural mitigations (Redis Buffering, Lock Deduplication).',
    example: 'Trigger a simulated 100-request webhook surge in the Interactive CRM Sandbox, watch the queue buffer it safely, and verify 0% lead drop rate.',
    quizzes: [
      {
        id: 'q6-1',
        question: 'In the Live CRM Sandbox, what mitigation stops two CRMs from updating each other in an infinite bi-directional loop?',
        options: [
          {
            id: 'opt-6-1-a',
            text: 'Sync-Origin metadata headers / System-User exclusion filter & Redis lock key (`lock:contact:<id>`).',
            isCorrect: true,
            explanation: 'Correct! Checking if `last_modified_by == GTM_INTEGRATION_BOT` or holding a 5-second Redis mutex lock prevents re-triggering outgoing sync webhooks.'
          },
          {
            id: 'opt-6-1-b',
            text: 'Turning off the internet router.',
            isCorrect: false,
            explanation: 'Incorrect.'
          },
          {
            id: 'opt-6-1-c',
            text: 'Deleting all contact records in the database.',
            isCorrect: false,
            explanation: 'Incorrect.'
          }
        ]
      },
      {
        id: 'q6-2',
        question: 'When a CRM endpoint returns HTTP 429 Too Many Requests, which retry strategy prevents overwhelming the server again?',
        options: [
          {
            id: 'opt-6-2-a',
            text: 'Immediate synchronous while-loop retry every 1 millisecond.',
            isCorrect: false,
            explanation: 'Incorrect! Immediate tight retries exacerbate server load and result in permanent IP bans.'
          },
          {
            id: 'opt-6-2-b',
            text: 'Exponential backoff with randomized jitter (e.g., wait 2^n seconds ± 500ms random offset) respecting the `Retry-After` header.',
            isCorrect: true,
            explanation: 'Correct! Exponential backoff with jitter spreads retry spikes across time and complies with upstream SaaS rate limits.'
          },
          {
            id: 'opt-6-2-c',
            text: 'Immediately abort the pipeline and discard all unprocessed leads.',
            isCorrect: false,
            explanation: 'Incorrect. Discarding leads loses pipeline revenue; messages must be backed off in a queue.'
          }
        ]
      },
      {
        id: 'q6-3',
        question: 'What is the primary purpose of a Dead-Letter Queue (DLQ) in an enterprise GTM pipeline?',
        options: [
          {
            id: 'opt-6-3-a',
            text: 'To isolate failed/unparseable messages after max retry attempts without blocking the main queue, allowing manual inspection and replay.',
            isCorrect: true,
            explanation: 'Correct! A DLQ prevents poisonous messages from blocking the entire pipeline while guaranteeing that zero records are permanently lost.'
          },
          {
            id: 'opt-6-3-b',
            text: 'To delete customer unsubscribe requests automatically.',
            isCorrect: false,
            explanation: 'Incorrect. Unsubscribes are handled by compliance and subscription preference centers.'
          },
          {
            id: 'opt-6-3-c',
            text: 'To accelerate network download speeds.',
            isCorrect: false,
            explanation: 'Incorrect.'
          }
        ]
      }
    ]
  }
];
