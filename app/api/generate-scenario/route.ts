import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, RESUME_CONTEXT } from "@/lib/gemini";
import { GTMScenario, DifficultyLevel, GTMRoleProfile } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, difficulty, roleProfile, customTopic } = body;

    const selectedDifficulty: DifficultyLevel = difficulty || 'Senior GTM Engineer';
    const selectedRole: GTMRoleProfile = roleProfile || 'GTM Systems Engineer';
    const selectedCategory = category || 'SaaS Integration & Deployment Incident';

    const ai = getGeminiClient();

    const prompt = `
You are a Principal GTM Systems Engineer and Technical Scenario Designer.
Generate a realistic, high-stakes technical troubleshooting scenario question faced by a ${selectedRole} (${selectedDifficulty}).

TOPIC/CATEGORY:
${customTopic ? `Custom Topic: ${customTopic}` : `Category: ${selectedCategory}`}

REQUIREMENTS:
1. Scenario must mimic real-world challenges faced by GTM Engineers, Sales Engineers, and Solutions Architects, such as:
   - Integrating new SaaS products (e.g. Gong, Slack, Clay, Apollo, Snowflake, Segment, Stripe, Salesforce, HubSpot).
   - Troubleshooting complex deployment issues (e.g. API rate limit lockouts, webhook cascade loops, out-of-order event delivery, queue deadlocks).
   - Designing scalable solutions for customer needs (e.g. real-time routing for 100k leads/day across global territories, enterprise CPQ & billing sync).
2. Include realistic telemetry / error logs, JSON payloads, or SQL snippets.
3. Provide multi-step decision prompts with optimal vs suboptimal options, technical trade-offs, and a comprehensive expected solution architecture.
4. Provide a clear learning takeaway.

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "id": "gen-scenario-${Date.now()}",
  "title": "string (Punchy incident title)",
  "company": "string (e.g. Enterprise SaaS / Healthtech / AI Startup)",
  "difficulty": "${selectedDifficulty}",
  "roleProfile": "${selectedRole}",
  "category": "${selectedCategory}",
  "description": "string (Clear contextual setup of the system architecture and breaking incident)",
  "businessImpact": "string (Quantified business impact on pipeline, revenue, SLA, or rep productivity)",
  "architectureDiagramSummary": "string (Pipeline representation, e.g. A -> B -> C -> D)",
  "initialIncidentLog": "string (Realistic raw timestamped error log snippet)",
  "expectedSolutionArchitecture": "string (Detailed 3-4 bullet technical architecture blueprint explaining how to resolve and scale the system)",
  "steps": [
    {
      "stepNumber": 1,
      "prompt": "string (Immediate triage question for the engineer)",
      "systemArtifacts": {
        "diagramType": "waterfall",
        "logSnippet": "string",
        "jsonPayload": "string"
      },
      "options": [
        {
          "id": "opt-1",
          "label": "string (Action option 1)",
          "explanation": "string",
          "isOptimal": true,
          "technicalTradeoff": "string"
        },
        {
          "id": "opt-2",
          "label": "string (Suboptimal option 2)",
          "explanation": "string",
          "isOptimal": false,
          "technicalTradeoff": "string"
        }
      ],
      "resolutionGuidance": "string (Engineering explanation)"
    }
  ],
  "learningTakeaway": "string (Core takeaway rule for GTM engineers)"
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
      const parsed: GTMScenario = JSON.parse(responseText);
      parsed.id = `gen-scenario-${Date.now()}`;
      return NextResponse.json(parsed);
    } catch (genAiError: any) {
      console.error("Gemini scenario generation error:", genAiError);

      const fallbackScenario: GTMScenario = {
        id: `gen-scenario-${Date.now()}`,
        title: "Distributed Webhook Deduplication & Out-of-Order Delivery Incident",
        company: "Global SaaS Enterprise (1,200 employees)",
        difficulty: selectedDifficulty,
        roleProfile: selectedRole,
        category: "Webhook Ingestion & Distributed Systems",
        description: "An enterprise product-led SaaS platform receives high volumes of user signup, trial activation, and upgrade webhooks from their mobile and web apps. Due to network retries, 'User Upgraded to Pro ($2,400)' events are arriving at the CRM ingestion gateway before the initial 'User Created' event, causing 12% of high-value upgrades to fail foreign key validation and silently disappear from the sales pipeline.",
        businessImpact: "$180K in monthly expansion revenue is missing from Salesforce Opportunities; Sales Reps are not receiving upgrade alerts.",
        architectureDiagramSummary: "App Event Stream -> Ingestion Gateway (No Order Guarantee) -> Direct CRM Insert (Fails Foreign Key if User Record Missing)",
        initialIncidentLog: `[11:20:01] POST /api/events - Type: 'subscription.upgraded' (account_id: 'acc_9921', user_id: 'usr_8812', amount: 2400)
[11:20:01] Salesforce Insert: Upsert Opportunity (Contact__c = 'usr_8812') -> ERROR: FIELD_INTEGRITY_EXCEPTION: No Contact found with ID 'usr_8812'
[11:20:04] POST /api/events - Type: 'user.created' (user_id: 'usr_8812', email: 'director@fortune500.com')`,
        expectedSolutionArchitecture: `1. Event Staging & Outbox Pattern: Ingest all events into an outbox table in Postgres/Redis with event sequence number or monotonic timestamp.
2. Dependency-Aware Worker: If a dependent event ('subscription.upgraded') arrives before its parent ('user.created'), push to a temporary 30-second delayed retry queue.
3. Idempotent Upsert Keys: Use external ID hashes (e.g. \`event_id\` or \`subscription_id\`) to guarantee single execution.
4. Auto-Reconciliation Cron: Schedule a 5-minute background reconciliation query to link orphaned transactions.`,
        steps: [
          {
            stepNumber: 1,
            prompt: "How do you re-architect the event ingestion layer to handle out-of-order event arrival without losing revenue opportunities?",
            systemArtifacts: {
              diagramType: "webhook-flow",
              logSnippet: "FIELD_INTEGRITY_EXCEPTION: Foreign key reference 'usr_8812' does not exist at execution time."
            },
            options: [
              {
                id: "opt-1",
                label: "Stage events in an async queue; if parent Contact is missing, delay event execution by 15-30 seconds with exponential retry backoff.",
                explanation: "Allows the initial 'user.created' event to complete insertion, resolving the dependency gracefully without dropping data.",
                isOptimal: true,
                technicalTradeoff: "Introduces minimal 15s latency for out-of-order events while ensuring 100% data integrity."
              },
              {
                id: "opt-2",
                label: "Drop the failed upgrade events and instruct customer support to manually create opportunities.",
                explanation: "Unscalable, highly error-prone, and guarantees missing pipeline revenue.",
                isOptimal: false,
                technicalTradeoff: "Severe revenue loss and manual toil."
              }
            ],
            resolutionGuidance: "In asynchronous distributed GTM architectures, event order is never guaranteed across network hops. Always implement dependency-checking retry queues or an event outbox pattern."
          }
        ],
        learningTakeaway: "Never assume in-order event delivery in distributed GTM pipelines. Always use idempotent outbox staging and delayed retry queues for dependent foreign key records."
      };

      return NextResponse.json(fallbackScenario);
    }
  } catch (error: any) {
    console.error("General error in generate-scenario route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
