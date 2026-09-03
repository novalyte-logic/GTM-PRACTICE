import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Falling back to local offline heuristic engine.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export const RESUME_CONTEXT = `
Candidate Name: Jamil Yakasai
Target Role: GTM Engineer / GTM System Engineer / GTM Architect / RevOps Engineer
Professional Summary:
Founder & AI Systems Builder who designs and ships applied-AI products, internal tools, operational platforms, and automation workflows from concept through deployment.
Work Experience:
1. Novalyte AI (San Francisco, CA | 2024 - Present) - Founding GTM & Systems Engineer
   - Conceived, architected, and deployed Novalyte AI end-to-end as a multi-sided healthtech ecosystem connecting patient demand, specialty clinics, healthcare professionals, and service vendors.
   - Designed and shipped core operational surfaces: public patient discovery and intake journeys, clinic onboarding tools, and a centralized internal Revenue Command Center.
   - Built the operator Revenue Command Center as a unified control plane uniting clinic acquisition, demand intelligence, workforce exchange, revenue telemetry, and platform administration.
   - Engineered AI-enabled GTM and operational automation workflows covering lead capture, waterfall enrichment (Clay, Apollo), qualification scoring, routing logic, and CRM writeback.
   - Owned system requirements, architecture, SQL data hygiene (cleaning, deduplication, matching), and production deployment.
2. Zendesk (San Francisco, CA | May 2023 - Feb 2025) - Sales Operations Analyst
   - Supported North American enterprise sales teams through Salesforce workflow optimization, pipeline management, forecasting support, and operational reporting.
   - Built executive dashboards converting sales activity and pipeline data into conversion, forecasting, and performance insights for revenue leadership.
   - Led CRM data-hygiene, validation, and process-improvement initiatives that improved pipeline visibility and enabled reliable sales-performance analysis.
3. Geospatialabs (Founder / Independent Prototype)
   - Interactive decision-support prototype mapping regional healthcare clinic capacity and local demand signals in JS, Python, and SQL.
Core Skills:
- Applied AI: LLM workflows, prompt engineering, structured outputs/JSON schemas, tool calling, AI-assisted product development.
- Modern Dev & Data: Python, JavaScript/TypeScript, SQL, REST APIs, webhooks, Supabase/Postgres, BigQuery, data cleaning, deduplication, matching, validation.
- CRM & GTM Infrastructure: Salesforce, HubSpot, lifecycle workflows, lead capture & routing, Clay/Apollo waterfall enrichment workflows, CRM hygiene, pipeline telemetry, outbound operations, executive reporting.
`;
