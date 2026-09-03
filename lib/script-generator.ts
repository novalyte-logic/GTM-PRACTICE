// lib/script-generator.ts
// Generates structured 60-second spoken scripts and live teleprompter crib sheets for GTM interview questions.

import { InterviewQuestion, TargetCompanyApplication } from './types';

export interface SpokenScriptFramework {
  openingHook15s: string;
  technicalArchitecture30s: string;
  founderProofPoint15s: string;
  proactiveEdgeCaseGotcha: string;
  full60SecondMonologue: string;
}

export interface TeleprompterCribSheet {
  buzzwordsToDrop: string[];
  targetMetricToQuote: string;
  storyAnchor: string;
  quickChecklist: string[];
}

export function generateSpokenScript(
  question: InterviewQuestion,
  company?: TargetCompanyApplication
): SpokenScriptFramework {
  const companyName = company?.company || 'our company';
  const roleName = company?.role || question.roleProfile || 'Senior GTM Engineer';
  const techPills = company?.techStack?.slice(0, 3).join(', ') || 'asynchronous queueing, SQL deduplication, and CRM writeback';

  let openingHook15s = `When architecting a solution for ${question.title.toLowerCase()}, my guiding principle is to decouple ingress from downstream execution so that high lead velocity never compromises system reliability.`;
  
  if (company) {
    openingHook15s = `At ${companyName}, where the ${roleName} sits at the core of your ${company.category}, I approach this by ensuring our infrastructure leveraging ${techPills} operates deterministically with zero data loss.`;
  }

  const technicalArchitecture30s = `I structure the solution in three clear layers: First, an ingress gateway that immediately returns a 200 OK after writing to a Redis message queue with an MD5 idempotency key. Second, an asynchronous worker that executes parallel waterfall enrichment with strict short-circuiting so we never waste API credits. Third, a batch upsert into the CRM using external IDs, followed by an immediate Slack alert with pre-compiled calendar booking links.`;

  const founderProofPoint15s = question.resumeConnection 
    ? question.resumeConnection 
    : `At Novalyte AI, I architected this exact pattern across our Revenue Command Center, reducing lead-to-booking latency from 40 minutes down to under 60 seconds while processing thousands of clinic events.`;

  const proactiveEdgeCaseGotcha = `And the critical edge case I proactively defend against is webhook race conditions and rate-limit lockouts—we enforce token-bucket rate limiters and dedicated integration user bypasses so systems never trigger recursive sync loops.`;

  const full60SecondMonologue = `"${openingHook15s} ${technicalArchitecture30s} In fact, ${founderProofPoint15s.replace('Draws upon your', 'I leveraged my').replace('Directly challenges Jamil on his', 'In my previous')} ${proactiveEdgeCaseGotcha}"`;

  return {
    openingHook15s,
    technicalArchitecture30s,
    founderProofPoint15s,
    proactiveEdgeCaseGotcha,
    full60SecondMonologue
  };
}

export function generateTeleprompterCribSheet(
  question: InterviewQuestion,
  company?: TargetCompanyApplication
): TeleprompterCribSheet {
  // Extract keywords or skills
  const skills = question.targetSkills && question.targetSkills.length > 0 
    ? question.targetSkills 
    : ['Redis Queue', 'Idempotency Key', 'Waterfall Short-Circuit'];

  const buzzwordsToDrop = [
    skills[0] || 'Idempotency Key',
    skills[1] || 'Asynchronous Queue',
    skills[2] || 'SSOT Data Contract'
  ];

  let targetMetricToQuote = '<45s Speed-to-Lead SLA';
  if (question.category.toLowerCase().includes('waterfall') || question.category.toLowerCase().includes('enrich')) {
    targetMetricToQuote = '60%+ Data Enrichment Cost Savings';
  } else if (question.category.toLowerCase().includes('dedup') || question.category.toLowerCase().includes('l2a')) {
    targetMetricToQuote = '95%+ L2A Automated Match Accuracy';
  } else if (question.category.toLowerCase().includes('ai') || question.category.toLowerCase().includes('mcp')) {
    targetMetricToQuote = 'Sub-2-second MCP Tool Calling Execution';
  }

  const storyAnchor = company 
    ? `Tie Novalyte AI architecture directly to ${company.company}'s stack (${company.techStack.slice(0, 2).join(', ')})`
    : `Novalyte AI Revenue Command Center (clinic intake + SQL data hygiene)`;

  const quickChecklist = [
    'State your 3-layer architecture first',
    'Drop the specific metric (e.g. ' + targetMetricToQuote + ')',
    'Mention the edge case before they ask'
  ];

  return {
    buzzwordsToDrop,
    targetMetricToQuote,
    storyAnchor,
    quickChecklist
  };
}
