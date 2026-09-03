// lib/company-briefings.ts
// Plain-English Executive Briefings for Applied Companies

export interface CompanyExecutiveBriefing {
  companyId: string;
  companyName: string;
  oneLinePlainEnglish: string;
  whatTheyActuallyDo: string;
  theTwoHiringAnxieties: [string, string];
  openingInterviewHook: string;
  techKeywordsToDrop: string[];
}

export const COMPANY_BRIEFINGS: Record<string, CompanyExecutiveBriefing> = {
  valency: {
    companyId: 'valency',
    companyName: 'Valency Systems',
    oneLinePlainEnglish: 'A desktop and cloud hub (called Bond) that lets scientists connect AI models to their research tools via Model Context Protocol (MCP).',
    whatTheyActuallyDo: 'Instead of scientists copy-pasting research between papers, terminal scripts, and databases, Valency provides Bond—an MCP-native workbench where AI agents can execute code, query scientific databases, and summarize findings.',
    theTwoHiringAnxieties: [
      'Can this candidate actually build production-grade Model Context Protocol (MCP) servers in TypeScript/Python, or do they only know buzzwords?',
      'Can they bridge the gap with skeptical PhD scientists and enterprise buyers by writing clear code samples and live demo environments?'
    ],
    openingInterviewHook: '"What excites me most about Valency is Bond\'s MCP-first architecture. Building Novalyte AI taught me that tools are only as good as their protocol bridges; I\'ve spent the last year building MCP services and operator tools that turn technical evaluators into enthusiastic design partners."',
    techKeywordsToDrop: ['Model Context Protocol (MCP)', 'TypeScript', 'Bond Workspaces', 'Attio API', 'Agent Tool Calling']
  },

  canvas_medical: {
    companyId: 'canvas_medical',
    companyName: 'Canvas Medical',
    oneLinePlainEnglish: 'An Electronic Medical Record (EMR) software platform that lets modern healthtech startups write custom Python plugins to automate doctor workflows.',
    whatTheyActuallyDo: 'Traditional hospital software (Epic, Cerner) is clunky and impossible to program. Canvas Medical is built like Stripe for healthcare—giving doctors an intuitive UI while letting developers build automated clinical rules and billing integrations in Python.',
    theTwoHiringAnxieties: [
      'Do they understand clinical and healthcare data workflows (HIPAA, FHIR, patient charts) so they don\'t break doctor workflows?',
      'Can they build developer-facing tools, webhooks, and sample plugins that make it fast for new clinic customers to go live?'
    ],
    openingInterviewHook: '"Having architected Novalyte AI\'s multi-sided healthtech ecosystem spanning patient intake and clinic operations, I understand firsthand how delicate clinical workflows are. I love Canvas because you treat the EHR as an extensible software platform, which is exactly where healthcare needs to go."',
    techKeywordsToDrop: ['EHR / EMR APIs', 'FHIR Data Models', 'Python Plugin SDK', 'Clinical Workflows', 'HIPAA Auditing']
  },

  fal_ai: {
    companyId: 'fal_ai',
    companyName: 'fal (fal.ai)',
    oneLinePlainEnglish: 'The lightning-fast generative AI media inference engine that powers apps generating images, video, and audio.',
    whatTheyActuallyDo: 'Developers and enterprises run diffusion models (Flux, SDXL, voice) on fal because it serves inference requests in under 500 milliseconds with automatic GPU scaling and pay-per-second billing.',
    theTwoHiringAnxieties: [
      'Can this engineer handle ultra-high API request volumes without systems dropping webhook payloads or missing telemetry?',
      'Can they instrument developer activation funnels so we know when an enterprise PoC is hitting production scale?'
    ],
    openingInterviewHook: '"fal is setting the benchmark for developer-first generative media infrastructure. Coming from building high-scale async intake pipelines at Novalyte AI, I love solving the seam where high-throughput inference meets deterministic revenue telemetry and CRM sync."',
    techKeywordsToDrop: ['Inference Telemetry', 'Async Webhooks', 'Stripe Usage Billing', 'GPU Latency', 'Developer Onboarding']
  },

  syntra: {
    companyId: 'syntra',
    companyName: 'Syntra',
    oneLinePlainEnglish: 'Autonomous healthcare AI agents that assist doctors with documentation, care plans, and administrative billing.',
    whatTheyActuallyDo: 'Doctors spend 2 hours doing paperwork for every 1 hour with patients. Syntra builds applied clinical AI that listens to patient encounters and prepares clinical notes, prior authorizations, and orders automatically.',
    theTwoHiringAnxieties: [
      'Can this engineer write rock-solid, HIPAA-compliant structured data extractors that never hallucinate in medical notes?',
      'Can they build reliable integrations between AI services and legacy hospital practice management systems?'
    ],
    openingInterviewHook: '"At Novalyte AI, I built structured clinical intake systems translating unstructured patient queries into strict clinical schemas. Syntra\'s vision of ambient, zero-overhead healthcare AI resonates deeply with what I\'ve seen clinic staff need on the frontlines."',
    techKeywordsToDrop: ['Structured JSON Schemas', 'Ambient Clinical AI', 'EHR Interoperability', 'HIPAA Compliance', 'Zod Validation']
  },

  qualified_health: {
    companyId: 'qualified_health',
    companyName: 'Qualified Health PBC',
    oneLinePlainEnglish: 'An applied healthcare technology public benefit company optimizing provider licensing, credentialing, and clinical intake.',
    whatTheyActuallyDo: 'Healthcare licensing and credentialing takes months of manual paperwork. Qualified Health automates medical verification and network compliance through intelligent software pipelines.',
    theTwoHiringAnxieties: [
      'Can they build reliable state machine pipelines that track multi-step provider verification without losing state?',
      'Do they care about both mission-driven public benefit impact and technical system rigor?'
    ],
    openingInterviewHook: '"Building Novalyte AI showed me how much administrative friction slows down patient care. I\'m drawn to Qualified Health because you pair mission-driven public benefit with rigorous automated infrastructure to solve provider credentialing at scale."',
    techKeywordsToDrop: ['State Machine Pipelines', 'Document Verification', 'Healthcare Compliance', 'Postgres Deduplication', 'Audit Logs']
  },

  decagon: {
    companyId: 'decagon',
    companyName: 'Decagon',
    oneLinePlainEnglish: 'Enterprise customer support AI agents that resolve complex customer tickets autonomously across Zendesk, Salesforce, and email.',
    whatTheyActuallyDo: 'Unlike dumb chatbots from 5 years ago, Decagon connects to internal APIs and CRMs to actually solve customer issues (process refunds, reschedule flights, debug account lockouts) with human-level nuance.',
    theTwoHiringAnxieties: [
      'Can this engineer build deep, two-way integrations into Zendesk and Salesforce without triggering API lockouts or data corruption?',
      'Can they work directly with enterprise customer RevOps teams to configure complex business rules?'
    ],
    openingInterviewHook: '"Having worked directly with Zendesk sales operations and having built full-stack AI workflows at Novalyte AI, I know exactly what enterprise customer teams struggle with. Decagon\'s approach of agentic resolution rather than deflection is the exact future I want to build."',
    techKeywordsToDrop: ['Zendesk API', 'Salesforce Service Cloud', 'Agent Tool Calling', 'Conversation Telemetry', 'Ticket Routing']
  },

  bland_ai: {
    companyId: 'bland_ai',
    companyName: 'Bland AI',
    oneLinePlainEnglish: 'Ultra-low latency conversational AI phone agents that can make and receive phone calls like real humans.',
    whatTheyActuallyDo: 'Enterprises use Bland to automate inbound phone scheduling, outbound lead qualification, and customer support dispatch with voice AI that speaks with sub-second response times.',
    theTwoHiringAnxieties: [
      'Can they build real-time webhook listeners and call dispatch pipelines that trigger instantly when an inbound lead arrives?',
      'Can they handle high-volume SIP/telephony concurrency without dropouts?'
    ],
    openingInterviewHook: '"Speed-to-lead is everything in outbound conversion. What Bland is doing with sub-second conversational voice infrastructure changes the game; I want to help enterprise clients connect their CRM workflows to real-time voice dispatch without missing a single beat."',
    techKeywordsToDrop: ['Speed-to-Lead (<30s)', 'Telephony Webhooks', 'CRM Call Logging', 'Speech-to-Speech Latency', 'Lead Qualification']
  }
};

export function getCompanyBriefing(companyId: string): CompanyExecutiveBriefing | undefined {
  const normalized = companyId.toLowerCase().trim().replace('-', '_');
  if (COMPANY_BRIEFINGS[normalized]) return COMPANY_BRIEFINGS[normalized];
  
  // Fallback match by prefix
  for (const key of Object.keys(COMPANY_BRIEFINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return COMPANY_BRIEFINGS[key];
    }
  }
  return undefined;
}
