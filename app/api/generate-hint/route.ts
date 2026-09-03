import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, RESUME_CONTEXT } from "@/lib/gemini";
import { AIArchitecturalHint } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, difficulty, roleProfile, wildcard } = body;

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const ai = getGeminiClient();

    const wildcardText = wildcard ? `
INJECTED WILDCARD PRODUCTION CONSTRAINT:
Title: ${wildcard.title}
Constraint: ${wildcard.description}
Impact: ${wildcard.impact}
Architectural Mitigation: ${wildcard.architecturalMitigationHint}
(Ensure your structural hint explicitly includes steps and components to defend against this wildcard constraint!)
` : '';

    const prompt = `
You are a Principal GTM Systems Engineer and Technical Interview Coach.
Generate a real-time, high-level structural architectural hint to help a candidate (Jamil Yakasai) answer the following interview question.

CRITICAL INSTRUCTION:
DO NOT GIVE AWAY THE FULL ANSWER OR CODE.
Instead, provide high-level structural guidance on how to organize the response (e.g., Ingestion -> Normalization -> Waterfall Cascade -> CRM Writeback -> Observability), key technical gotchas/edge cases to address, the business/revenue metric angle, and how to connect their background (Novalyte AI Founding GTM Engineer, Zendesk Sales Ops).

INTERVIEW QUESTION:
Title: ${question.title}
Difficulty: ${difficulty || question.difficulty || 'Senior GTM Engineer'}
Role Profile: ${roleProfile || question.roleProfile || 'GTM Systems Engineer'}
Question: ${question.question}
Context/Scenario: ${question.contextScenario || 'N/A'}
Key Criteria: ${(question.keyEvaluationCriteria || []).join('; ')}
${wildcardText}
CANDIDATE CONTEXT:
${RESUME_CONTEXT}

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "structureFramework": [
    "1. Ingestion / Ingress: (Guidance)",
    "2. Processing / Transformation: (Guidance)",
    "3. Integration / Execution: (Guidance)",
    "4. Governance & Resilience: (Guidance)",
    "5. Telemetry & Business Impact: (Guidance)"
  ],
  "keyComponentsToMention": [
    "Component 1 (e.g. Async Queue / Idempotency)",
    "Component 2 (e.g. Clay/Apollo Waterfall)",
    "Component 3 (e.g. Anti-recursion guard)",
    "Component 4 (e.g. Composite CRM API)"
  ],
  "criticalEdgeCases": [
    "Edge case 1 to watch out for",
    "Edge case 2 to watch out for"
  ],
  "revenueMetricAngle": "A concise sentence on what business metric (Speed to Lead, CAC, Pipeline Velocity, API Quota Uptime) to anchor the answer with.",
  "resumeStoryHook": "A concise tip on how Jamil can reference his Novalyte AI or Zendesk experience."
}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const responseText = response.text || "{}";
      const parsed: AIArchitecturalHint = JSON.parse(responseText);
      return NextResponse.json(parsed);
    } catch (genAiError: any) {
      console.error("Gemini hint generation error, using fallback:", genAiError);

      const fallbackHint: AIArchitecturalHint = {
        structureFramework: [
          "1. Architectural Overview: Decouple ingress gateway (Webhooks/APIs) from heavy workers using an async queue.",
          "2. Data Normalization & Hygiene: Validate schemas (Zod/Pydantic), normalize phone/email, and apply domain-level deduplication.",
          "3. Waterfall & Execution: Tier providers by cost-efficiency with early exit short-circuiting on verified match.",
          "4. CRM Integration & Anti-Recursion: Guard sync updates with integration user filters (`LastModifiedBy != IntegrationUser`) and idempotency keys.",
          "5. Telemetry & Observability: Track speed-to-lead latency, token bucket rate limits, and audit logs."
        ],
        keyComponentsToMention: [
          "Decoupled Message Queue (Redis BullMQ / SQS)",
          "Tiered Waterfall Cascade (Clay / Apollo / ZoomInfo)",
          "Idempotent Upsert Keys",
          "Anti-Recursion Sync Guards"
        ],
        criticalEdgeCases: [
          "HTTP 429 Rate Limit spikes from downstream providers",
          "Bi-directional sync loops between CRM and Marketing Automation"
        ],
        revenueMetricAngle: "Highlight how this architecture protects Speed-to-Lead SLA (<5 minutes) while saving 60%+ on data enrichment spend.",
        resumeStoryHook: "Reference your Novalyte AI Revenue Command Center and Zendesk Salesforce pipeline optimization work."
      };

      return NextResponse.json(fallbackHint);
    }
  } catch (error: any) {
    console.error("General error in generate-hint route:", error);
    return NextResponse.json({ error: "Internal error generating hint" }, { status: 500 });
  }
}
