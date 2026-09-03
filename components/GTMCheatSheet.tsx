'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Copy, 
  Check, 
  Workflow, 
  Database, 
  Terminal, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Code2,
  Sparkles,
  CreditCard,
  FileCode2
} from 'lucide-react';
import { GTMFlashcards } from './GTMFlashcards';
import { DailyWorkPlaybook } from './DailyWorkPlaybook';

export const GTMCheatSheet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'playbook' | 'flashcards' | 'blueprints'>('playbook');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CHEAT_SHEET_CARDS = [
    {
      id: 'card-waterfall',
      category: 'Waterfall Enrichment Architecture',
      title: 'Optimal Clay & Multi-Provider Enrichment Cascade',
      summary: 'Tiered cascade designed to maximize verified email coverage while keeping cost <$0.05/lead.',
      codeSnippet: `// 4-Tier Waterfall Enrichment Logic:
1. Tier 1 (Low Cost): Apollo Search ($0.02)
   -> Check syntax & corporate MX records
   -> If status === 'verified', EXIT CASCADE
2. Tier 2 (Deep Social/Scrape): Prospeo / Findymail / Datagma ($0.03)
   -> If valid email found, validate with ZeroBounce
   -> If status === 'deliverable', EXIT CASCADE
3. Tier 3 (High-Intent Premium Fallback): ZoomInfo / Clearbit ($0.25)
   -> Trigger ONLY for Tier-1 VIP ICP accounts (e.g. >100 employees)
4. Tier 4 (AI Fallback): Gemini/LLM Google Search Agent
   -> Scrapes corporate press release / team page for executive email pattern.`,
      takeaways: [
        'Always validate MX records before firing downstream expensive calls.',
        'Apply domain-level deduplication: if 5 leads belong to same domain, enrich company data once and cache for 30 days.'
      ]
    },
    {
      id: 'card-crm-sync',
      category: 'CRM Architecture & Anti-Recursion',
      title: 'Bi-Directional Sync Governance Matrix (HubSpot & Salesforce)',
      summary: 'Prevent infinite update loops and API limit exhaustion.',
      codeSnippet: `// Master System of Record (SSOT) Ownership:
• HubSpot Owns: Form Submissions, Inbound Pageviews, Marketing Email Clicks, MQL Date.
• Salesforce Owns: Lead Status, SDR Activity, Opportunity Stage, Deal Size, Closed-Won ARR.

// Anti-Recursion Guard (Salesforce Flow & Apex Trigger Rule):
if (Trigger.new.LastModifiedById == IntegrationUser.Id && Trigger.old.Lifecycle_Stage__c == Trigger.new.Lifecycle_Stage__c) {
    // Suppress trigger to prevent echoing back to HubSpot
    return;
}`,
      takeaways: [
        'Never allow both systems to write bi-directionally to the same timestamp or status field.',
        'Enforce dedicated Integration User profiles with API-only permissions.'
      ]
    },
    {
      id: 'card-sql-dedup',
      category: 'Data Ops & SQL Hygiene',
      title: 'Fuzzy Deduplication & Lead-to-Account Matching (Postgres/Supabase)',
      summary: 'SQL query for fuzzy matching inbound companies against existing corporate accounts.',
      codeSnippet: `SELECT 
    l.id AS lead_id,
    l.company_name AS raw_company,
    a.id AS matched_account_id,
    a.name AS account_name,
    similarity(l.company_name, a.name) AS match_score
FROM inbound_leads l
JOIN crm_accounts a 
    ON l.domain = a.domain 
    OR similarity(l.company_name, a.name) > 0.85
WHERE l.matched_account_id IS NULL
ORDER BY match_score DESC;`,
      takeaways: [
        'Use pg_trgm extension in Postgres for fast trigram similarity indexing.',
        'Primary key match on cleaned corporate domain (strip www, http, and subdomains) before fuzzy matching company string.'
      ]
    },
    {
      id: 'card-ai-gtm',
      category: 'AI-Native GTM Workflows',
      title: 'Structured JSON Schema Extraction for Inbound Qualification',
      summary: 'Deterministic schema enforcement using Gemini and Zod/JSON schema.',
      codeSnippet: `const InboundLeadSchema = {
  type: "OBJECT",
  properties: {
    isICP: { type: "BOOLEAN" },
    fitReason: { type: "STRING" },
    estimatedEmployeeCount: { type: "INTEGER" },
    recommendedSDRQueue: { type: "STRING" }
  },
  required: ["isICP", "fitReason", "recommendedSDRQueue"]
};`,
      takeaways: [
        'Always enforce structured JSON outputs when chaining LLMs to database writebacks.',
        'Sanitize raw form inputs to prevent prompt injection attacks in automated sales routing.'
      ]
    }
  ];

  return (
    <div className="space-y-6 text-stone-800">
      {/* Header with Sub-tab Switcher */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                GTM Engineering Knowledge Hub
              </span>
            </div>
            <h2 className="text-base font-bold text-stone-900 mt-1">
              GTM Concept Flashcards & Technical Reference
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Master key GTM system architecture terminology, formulas, anti-recursion logic, and interview talking points.
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex flex-wrap items-center rounded-xl bg-stone-100 p-1 border border-stone-200 self-start sm:self-auto gap-1">
            <button
              onClick={() => setActiveTab('playbook')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'playbook'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Workflow className="h-3.5 w-3.5 text-emerald-600" />
              <span>Daily Work &amp; Sprints</span>
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'flashcards'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
              <span>Concept Flashcards</span>
            </button>

            <button
              onClick={() => setActiveTab('blueprints')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'blueprints'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileCode2 className="h-3.5 w-3.5 text-amber-600" />
              <span>Cheat Sheet Blueprints</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 0: DAILY WORK PLAYBOOK */}
      {activeTab === 'playbook' && (
        <DailyWorkPlaybook />
      )}

      {/* TAB 1: GTM CONCEPT FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <GTMFlashcards />
      )}

      {/* TAB 2: CHEAT SHEET BLUEPRINTS GRID */}
      {activeTab === 'blueprints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CHEAT_SHEET_CARDS.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4 text-xs"
            >
              <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700 border border-stone-200">
                    {card.category}
                  </span>
                  <h3 className="text-sm font-bold text-stone-900 mt-1.5">
                    {card.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleCopy(card.id, card.codeSnippet)}
                  className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                  title="Copy code snippet"
                >
                  {copiedId === card.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <p className="text-stone-600 text-[11px] leading-relaxed">
                {card.summary}
              </p>

              {/* Code Block */}
              <pre className="rounded-xl border border-stone-800 bg-stone-950 p-3.5 font-mono text-[11px] text-stone-300 overflow-x-auto whitespace-pre leading-relaxed">
                {card.codeSnippet}
              </pre>

              {/* Takeaways */}
              <div className="space-y-1.5 pt-1">
                <div className="font-bold text-stone-800 text-[11px]">Key Architectural Rules:</div>
                <ul className="space-y-1 text-stone-600 text-[11px]">
                  {card.takeaways.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
