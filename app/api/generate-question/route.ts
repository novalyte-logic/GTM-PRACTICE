import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, RESUME_CONTEXT } from "@/lib/gemini";
import { InterviewQuestion, InterviewTrack, DifficultyLevel, GTMRoleProfile, CompanyArchetype } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { track, difficulty, roleProfile, companyArchetype, focusTopic } = body;

    const selectedTrack: InterviewTrack = track || 'system-architecture';
    const selectedDifficulty: DifficultyLevel = difficulty || 'Senior GTM Engineer';
    const selectedRole: GTMRoleProfile = roleProfile || 'GTM Systems Engineer';
    const selectedArchetype: CompanyArchetype = companyArchetype || 'Series-B High-Growth PLG SaaS';

    const ai = getGeminiClient();

    const prompt = `
You are an expert Principal GTM Systems Engineer and Hiring Lead at a top-tier tech company (${selectedArchetype}).
Generate a unique, rigorous, and highly practical technical interview question for a candidate interviewing for a ${selectedRole} (${selectedDifficulty}) position.

CANDIDATE CONTEXT (Jamil Yakasai):
${RESUME_CONTEXT}

REQUEST PARAMETERS:
- Track: ${selectedTrack}
- Target Role Profile: ${selectedRole}
- Difficulty Level: ${selectedDifficulty} (Junior = fundamental concepts & basic webhooks, Mid = formulas & flow configuration, Senior = decoupled architectures & multi-provider sync, Staff = enterprise scale & agentic workflows)
- Company Archetype: ${selectedArchetype}
- Specific Focus Topic (if any): ${focusTopic || 'GTM System Architecture, Waterfall Enrichment, CRM Sync, AI Workflows, or Data Hygiene'}

CRITICAL GUIDELINES:
1. Make the question deeply realistic, reflecting true challenges faced by a ${selectedRole} (e.g. Clay/Apollo waterfall logic, HubSpot/Salesforce bi-directional sync loops, Lead-to-Account matching algorithms, webhook race conditions, LLM structured extraction, attribution modeling in SQL/BigQuery, pre-sales PoC scoping, or speed-to-lead SLA routing).
2. Directly reference or challenge aspects of the candidate's real background (Novalyte AI marketplace/waterfall, Zendesk sales ops, SQL/Postgres data hygiene) where natural.
3. Provide rich context, explicit evaluation criteria, a structured hint framework, and a clear expected solution outline.

OUTPUT FORMAT: Return ONLY valid JSON matching this schema:
{
  "id": "gen-${Date.now()}",
  "track": "${selectedTrack}",
  "category": "string (e.g. Lead Ingestion Architecture / Waterfall Enrichment / CRM Lifecycle)",
  "difficulty": "${selectedDifficulty}",
  "roleProfile": "${selectedRole}",
  "title": "string (short punchy title)",
  "question": "string (the full, detailed interview question prompt)",
  "contextScenario": "string (realistic company situation setting the stage)",
  "keyEvaluationCriteria": [
    "string (criterion 1)",
    "string (criterion 2)",
    "string (criterion 3)",
    "string (criterion 4)"
  ],
  "targetSkills": [
    "string (skill 1)",
    "string (skill 2)",
    "string (skill 3)"
  ],
  "resumeConnection": "string (how this connects to Jamil's Novalyte AI or Zendesk background)",
  "sampleTechnicalHint": "string (a structured tip on how to frame the solution)"
}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const responseText = response.text || "{}";
      const parsed: InterviewQuestion = JSON.parse(responseText);
      parsed.id = `gen-${Date.now()}`;
      parsed.difficulty = selectedDifficulty;
      parsed.roleProfile = selectedRole;
      return NextResponse.json(parsed);
    } catch (genAiError: any) {
      console.error("Gemini generate question error:", genAiError);

      const fallback: InterviewQuestion = {
        id: `gen-${Date.now()}`,
        track: selectedTrack,
        category: "GTM Pipeline Resilience",
        difficulty: selectedDifficulty,
        roleProfile: selectedRole,
        title: "Enterprise Webhook Ingestion & Deduplication Pipeline",
        question: `How would you architect a fault-tolerant lead ingestion pipeline that receives 50,000 daily webhook payloads from high-volume marketing forms, enriches data via Clay and Apollo with fallback providers, performs fuzzy deduplication against existing Salesforce accounts in SQL, and routes leads to account executives in under 15 seconds?`,
        contextScenario: `A high-growth SaaS platform is experiencing dropped leads during launch spikes and rep complaints about duplicate accounts.`,
        keyEvaluationCriteria: [
          "Async queueing with Redis / SQS / BullMQ for decoupled webhook ingestion",
          "Fuzzy matching algorithm in Postgres/SQL (Levenshtein distance / Soundex / trigram similarity) on company domains & names",
          "Waterfall enrichment tiering with short-circuiting on verified email match",
          "Idempotent CRM upsert keys to prevent duplicate Lead and Contact records"
        ],
        targetSkills: ["Webhooks", "Clay", "Apollo", "SQL Trigrams", "Salesforce API", "Queueing"],
        resumeConnection: "Draws upon your Novalyte AI Revenue Command Center lead capture and SQL data hygiene experience.",
        sampleTechnicalHint: "Frame your answer in 4 tiers: Ingestion Gateway -> Message Broker & Deduplication Worker -> Waterfall Enrichment -> CRM Dispatch & Notification."
      };

      return NextResponse.json(fallback);
    }
  } catch (error: any) {
    console.error("General error in generate-question route:", error);
    return NextResponse.json({ error: "Internal server error generating question" }, { status: 500 });
  }
}
