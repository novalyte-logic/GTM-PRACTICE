export type InterviewTrack = 
  | 'resume-deep-dive' 
  | 'system-architecture' 
  | 'real-world-scenario' 
  | 'crm-data-hygiene' 
  | 'waterfall-enrichment' 
  | 'ai-gtm-workflows' 
  | 'pipeline-telemetry'
  | 'rapid-fire';

export type DifficultyLevel = 
  | 'Junior GTM Engineer'
  | 'Mid-Level GTM Engineer' 
  | 'Senior GTM Engineer' 
  | 'Staff / Principal GTM Architect';

export type GTMRoleProfile = 
  | 'GTM Systems Engineer'
  | 'GTM Engineer'
  | 'Sales Engineer'
  | 'Solutions Architect'
  | 'RevOps Architect'
  | 'Forward Deployed AI Engineer';

export type CompanyArchetype = 
  | 'Series-B High-Growth PLG SaaS' 
  | 'Enterprise B2B Multi-Product' 
  | 'AI-Native Outbound & Agentic GTM' 
  | 'Multi-Sided Healthtech / Marketplace';

export interface EvaluationBenchmark {
  juniorBaseline: number;
  midBaseline: number;
  seniorBaseline: number;
  candidateScore: number;
  percentile: number;
}

export interface AnswerEvaluation {
  overallScore: number; // 0 - 100
  letterGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'Needs Improvement';
  pillarScores: {
    technicalArchitecture: number; // 0-100
    crmAndDataHygiene: number; // 0-100
    gtmBusinessContext: number; // 0-100
    modernStackTooling: number; // 0-100 (Clay, Apollo, Salesforce, SQL, LLM)
    communicationAndClarity: number; // 0-100
  };
  keyStrengths: string[];
  blindSpotsAndMissedEdgeCases: string[];
  resumeStorytellingOptimization: string;
  goldStandardAnswer: string;
  interviewerFollowUp: string;
  benchmark: EvaluationBenchmark;
}

export interface AIArchitecturalHint {
  structureFramework: string[];
  keyComponentsToMention: string[];
  criticalEdgeCases: string[];
  revenueMetricAngle: string;
  resumeStoryHook: string;
}

export interface TargetCompanyApplication {
  id: string;
  company: string;
  role: string;
  category: string;
  location: string;
  compensation?: string;
  status: string;
  isNew?: boolean;
  matchScore: number;
  matchRationale: string;
  techStack: string[];
  summary: string;
  keyHighlights: string[];
  whyMatches: string[];
  risksGaps?: string[];
  applicationUrl: string;
  ashbyQas: Array<{ question: string; answer: string }>;
}

export interface InterviewQuestion {
  id: string;
  track: InterviewTrack;
  category: string;
  difficulty: DifficultyLevel;
  roleProfile?: GTMRoleProfile;
  targetCompanyId?: string;
  targetCompany?: TargetCompanyApplication;
  title: string;
  question: string;
  contextScenario?: string;
  keyEvaluationCriteria: string[];
  targetSkills: string[];
  resumeConnection?: string;
  sampleTechnicalHint?: string;
  structuredHint?: AIArchitecturalHint;
  expectedSolutionOutline?: string;
}

export interface WildcardConstraint {
  id: string;
  category: 
    | 'Rate Limits & Ingress' 
    | 'Webhook Latency & Timeouts' 
    | 'Data Volume & Governor Limits' 
    | 'CRM Sync Loops' 
    | 'Vendor Outages' 
    | 'Schema & Contract Drift' 
    | 'Security & Compliance';
  title: string;
  description: string;
  impact: string;
  architecturalMitigationHint: string;
  severity: 'Medium' | 'High' | 'Critical';
}

export type EmotionalStateType = 
  | 'calm-composed' 
  | 'in-flow' 
  | 'rushed-pressured' 
  | 'anxious-hesitant' 
  | 'fatigued' 
  | 'decisive-commanding';

export interface PerceivedConfidenceAssessment {
  overallScore10: number; // 1 to 10
  technicalDepth5: number; // 1 to 5
  executivePresence5: number; // 1 to 5
  edgeCaseDefense5: number; // 1 to 5
}

export interface CandidateAnswerRecord {
  questionId: string;
  question: InterviewQuestion;
  candidateAnswer: string;
  evaluation: AnswerEvaluation;
  timeSpentSeconds: number;
  timestamp: string;
  userNotes?: string;
  wildcard?: WildcardConstraint;
}

export interface MockInterviewSession {
  id: string;
  title: string;
  date: string;
  track: InterviewTrack;
  difficulty: DifficultyLevel;
  roleProfile?: GTMRoleProfile;
  companyArchetype: CompanyArchetype;
  targetCompanyId?: string;
  targetCompany?: TargetCompanyApplication;
  durationSeconds: number;
  answers: CandidateAnswerRecord[];
  averageScore: number;
  reflections?: string;
  keyTakeaways?: string[];
  report?: SessionReport;
  emotionalState?: EmotionalStateType;
  confidenceAssessment?: PerceivedConfidenceAssessment;
}

export interface SessionReport {
  sessionId: string;
  overallRating: string;
  overallScore: number;
  readinessPercentile: number;
  executiveSummary: string;
  strengths: string[];
  areasToSharpen: string[];
  pillarBreakdown: {
    name: string;
    score: number;
    benchmarkSenior: number;
    summary: string;
  }[];
  resumeLeverageAdvice: {
    topic: string;
    advice: string;
  }[];
  sevenDayActionPlan: {
    day: string;
    focus: string;
    recommendedExercise: string;
  }[];
  recommendedFollowUps: string[];
}

export interface ScenarioStep {
  stepNumber: number;
  prompt: string;
  systemArtifacts?: {
    diagramType?: 'waterfall' | 'sync-loop' | 'webhook-flow' | 'marketplace-routing' | 'cpq-billing' | 'agent-mesh';
    logSnippet?: string;
    jsonPayload?: string;
    sqlQuery?: string;
  };
  options?: {
    id: string;
    label: string;
    explanation: string;
    isOptimal: boolean;
    technicalTradeoff: string;
  }[];
  resolutionGuidance?: string;
}

export interface GTMScenario {
  id: string;
  title: string;
  company: string;
  difficulty: DifficultyLevel;
  roleProfile?: GTMRoleProfile;
  category?: string;
  description: string;
  architectureDiagramSummary: string;
  initialIncidentLog: string;
  businessImpact: string;
  steps: ScenarioStep[];
  expectedSolutionArchitecture?: string;
  learningTakeaway: string;
}

export type FlashcardCategory = 
  | 'System Architecture & Queues' 
  | 'CRM & Sync Hygiene' 
  | 'Waterfall Enrichment' 
  | 'Data Ops & SQL' 
  | 'AI-Native GTM & Orchestration';

export interface GTMFlashcard {
  id: string;
  term: string;
  category: FlashcardCategory;
  difficulty: 'Core Fundamental' | 'Senior Architectural' | 'Staff / Principal Level';
  definition: string;
  implementationPattern: string;
  realWorldExample: string;
  interviewTip: string;
  keyConcepts: string[];
}

export type CareerBadgeCategory = 
  | 'Milestones & Consistency' 
  | 'Technical Architecture' 
  | 'Incident Triage & Speed' 
  | 'Mindset & Calibration';

export interface CareerBadge {
  id: string;
  title: string;
  description: string;
  iconName: string; // lucide icon identifier
  category: CareerBadgeCategory;
  criteriaDescription: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    target: number;
    unit: string;
  };
}
