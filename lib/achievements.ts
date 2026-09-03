import { CareerBadge, MockInterviewSession, CandidateAnswerRecord } from './types';

export const BADGE_DEFINITIONS: Omit<CareerBadge, 'isUnlocked' | 'progress' | 'unlockedAt'>[] = [
  {
    id: 'badge-first-drill',
    title: 'First Pipeline Deployed',
    description: 'Complete your first GTM Engineering interview drill.',
    iconName: 'Zap',
    category: 'Milestones & Consistency',
    criteriaDescription: 'Complete at least 1 practice question drill',
    points: 50,
  },
  {
    id: 'badge-scenario-master',
    title: 'Scenario Master',
    description: 'Diagnose and resolve real-world production incidents in the Scenario Lab.',
    iconName: 'Activity',
    category: 'Incident Triage & Speed',
    criteriaDescription: 'Complete at least 3 incident triage scenarios',
    points: 150,
  },
  {
    id: 'badge-efficiency-guru',
    title: 'Efficiency Guru',
    description: 'Deliver crisp, high-scoring architectural solutions under target time constraints.',
    iconName: 'Timer',
    category: 'Incident Triage & Speed',
    criteriaDescription: 'Achieve an average score of 85%+ with average response time under 180 seconds',
    points: 200,
  },
  {
    id: 'badge-governor-buster',
    title: 'Governor Limit Buster',
    description: 'Master rate limiting, token buckets, and Salesforce 429 mitigation strategies.',
    iconName: 'ShieldAlert',
    category: 'Technical Architecture',
    criteriaDescription: 'Complete drills or sandbox simulations tackling CRM API rate limits and sync loops',
    points: 175,
  },
  {
    id: 'badge-waterfall-wizard',
    title: 'Waterfall Wizard',
    description: 'Achieve elite mastery in multi-provider waterfall enrichment design (Clay, Apollo, Clearbit).',
    iconName: 'Layers',
    category: 'Technical Architecture',
    criteriaDescription: 'Achieve 85%+ score on waterfall enrichment track questions',
    points: 150,
  },
  {
    id: 'badge-ai-native',
    title: 'AI-Native Automator',
    description: 'Design robust LLM extraction and structured JSON validation workflows for inbound qualification.',
    iconName: 'Sparkles',
    category: 'Technical Architecture',
    criteriaDescription: 'Score 85%+ on AI-Native GTM Workflows track questions',
    points: 175,
  },
  {
    id: 'badge-mindset-pro',
    title: 'Calibrated Mindset Pro',
    description: 'Achieve accurate alignment between perceived confidence and objective AI evaluation metrics.',
    iconName: 'HeartHandshake',
    category: 'Mindset & Calibration',
    criteriaDescription: 'Record post-session reflections with a confidence calibration delta under ±10%',
    points: 125,
  },
  {
    id: 'badge-consistency-champ',
    title: 'Pipeline Veteran',
    description: 'Demonstrate rigorous interview practice consistency across multiple sessions.',
    iconName: 'Flame',
    category: 'Milestones & Consistency',
    criteriaDescription: 'Complete at least 4 distinct mock interview sessions',
    points: 250,
  },
  {
    id: 'badge-staff-architect',
    title: 'Staff GTM Architect',
    description: 'Reach elite staff-level excellence across all 5 core GTM evaluation pillars.',
    iconName: 'Award',
    category: 'Milestones & Consistency',
    criteriaDescription: 'Achieve an overall cumulative average score of 90%+ across all recorded answers',
    points: 300,
  },
  {
    id: 'badge-crm-hygiene',
    title: 'CRM SSOT Guardian',
    description: 'Eliminate duplicate domains and solve bi-directional sync recursion in Salesforce and HubSpot.',
    iconName: 'Database',
    category: 'Technical Architecture',
    criteriaDescription: 'Score 85%+ on CRM & Data Hygiene track drills',
    points: 150,
  }
];

export function computeCareerBadges(
  sessions: MockInterviewSession[],
  completedAnswers: CandidateAnswerRecord[],
  completedScenarioCount: number = 0
): {
  badges: CareerBadge[];
  totalPoints: number;
  unlockedCount: number;
  nextRank: { name: string; currentPoints: number; targetPoints: number; progressPercent: number };
} {
  // Aggregate stats
  const allAnswers = [
    ...completedAnswers,
    ...sessions.flatMap((s) => s.answers || []),
  ];

  // Remove duplicates by timestamp/questionId
  const uniqueAnswerMap = new Map<string, CandidateAnswerRecord>();
  allAnswers.forEach((ans) => {
    const key = `${ans.questionId}-${ans.timestamp}`;
    if (!uniqueAnswerMap.has(key)) {
      uniqueAnswerMap.set(key, ans);
    }
  });
  const dedupedAnswers = Array.from(uniqueAnswerMap.values());

  const totalAnsweredCount = dedupedAnswers.length;
  const avgOverallScore = dedupedAnswers.length > 0
    ? Math.round(dedupedAnswers.reduce((acc, a) => acc + (a.evaluation?.overallScore || 0), 0) / dedupedAnswers.length)
    : 0;

  const avgTimeSpent = dedupedAnswers.length > 0
    ? Math.round(dedupedAnswers.reduce((acc, a) => acc + (a.timeSpentSeconds || 120), 0) / dedupedAnswers.length)
    : 120;

  const waterfallAnswers = dedupedAnswers.filter((a) => a.question?.track === 'waterfall-enrichment');
  const avgWaterfallScore = waterfallAnswers.length > 0
    ? Math.round(waterfallAnswers.reduce((acc, a) => acc + (a.evaluation?.overallScore || 0), 0) / waterfallAnswers.length)
    : 0;

  const aiAnswers = dedupedAnswers.filter((a) => a.question?.track === 'ai-gtm-workflows');
  const avgAiScore = aiAnswers.length > 0
    ? Math.round(aiAnswers.reduce((acc, a) => acc + (a.evaluation?.overallScore || 0), 0) / aiAnswers.length)
    : 0;

  const crmAnswers = dedupedAnswers.filter((a) => a.question?.track === 'crm-data-hygiene');
  const avgCrmScore = crmAnswers.length > 0
    ? Math.round(crmAnswers.reduce((acc, a) => acc + (a.evaluation?.overallScore || 0), 0) / crmAnswers.length)
    : 0;

  const sessionsWithReflection = sessions.filter((s) => s.confidenceAssessment);
  let calibratedReflectionCount = 0;
  sessionsWithReflection.forEach((s) => {
    const perceived = (s.confidenceAssessment?.overallScore10 || 5) * 10;
    const actual = s.averageScore || 70;
    const delta = Math.abs(perceived - actual);
    if (delta <= 12) {
      calibratedReflectionCount++;
    }
  });

  const badges: CareerBadge[] = BADGE_DEFINITIONS.map((def) => {
    let isUnlocked = false;
    let current = 0;
    let target = 1;
    let unit = 'drills';

    switch (def.id) {
      case 'badge-first-drill':
        current = totalAnsweredCount;
        target = 1;
        unit = 'drill completed';
        isUnlocked = current >= target;
        break;

      case 'badge-scenario-master':
        current = completedScenarioCount;
        target = 3;
        unit = 'scenarios resolved';
        isUnlocked = current >= target;
        break;

      case 'badge-efficiency-guru':
        current = avgOverallScore >= 85 && avgTimeSpent <= 180 ? 1 : (avgOverallScore >= 75 ? 0.6 : 0.2);
        target = 1;
        unit = 'speed & accuracy goal';
        isUnlocked = avgOverallScore >= 85 && avgTimeSpent <= 180 && totalAnsweredCount >= 2;
        break;

      case 'badge-governor-buster':
        const govCount = dedupedAnswers.filter(
          (a) => a.question?.title.toLowerCase().includes('rate limit') || 
                 a.question?.question.toLowerCase().includes('governor') ||
                 a.wildcard !== undefined
        ).length;
        current = govCount;
        target = 2;
        unit = 'rate limit challenges';
        isUnlocked = current >= target;
        break;

      case 'badge-waterfall-wizard':
        current = waterfallAnswers.length > 0 ? avgWaterfallScore : 0;
        target = 85;
        unit = '% average score';
        isUnlocked = waterfallAnswers.length >= 1 && avgWaterfallScore >= 85;
        break;

      case 'badge-ai-native':
        current = aiAnswers.length > 0 ? avgAiScore : 0;
        target = 85;
        unit = '% average score';
        isUnlocked = aiAnswers.length >= 1 && avgAiScore >= 85;
        break;

      case 'badge-mindset-pro':
        current = calibratedReflectionCount;
        target = 1;
        unit = 'calibrated reflection';
        isUnlocked = calibratedReflectionCount >= 1;
        break;

      case 'badge-consistency-champ':
        current = sessions.length;
        target = 4;
        unit = 'saved sessions';
        isUnlocked = current >= target;
        break;

      case 'badge-staff-architect':
        current = avgOverallScore;
        target = 90;
        unit = '% cumulative score';
        isUnlocked = totalAnsweredCount >= 3 && avgOverallScore >= 90;
        break;

      case 'badge-crm-hygiene':
        current = crmAnswers.length > 0 ? avgCrmScore : 0;
        target = 85;
        unit = '% average score';
        isUnlocked = crmAnswers.length >= 1 && avgCrmScore >= 85;
        break;

      default:
        isUnlocked = false;
        break;
    }

    return {
      ...def,
      isUnlocked,
      unlockedAt: isUnlocked ? 'Unlocked in session' : undefined,
      progress: {
        current: Math.min(current, target),
        target,
        unit,
      },
    };
  });

  const unlockedBadges = badges.filter((b) => b.isUnlocked);
  const totalPoints = unlockedBadges.reduce((sum, b) => sum + b.points, 0);

  // Ranks
  let rankName = 'Associate GTM Engineer';
  let targetPoints = 200;
  if (totalPoints >= 1000) {
    rankName = 'Principal GTM Architect';
    targetPoints = 1500;
  } else if (totalPoints >= 600) {
    rankName = 'Staff GTM Solutions Engineer';
    targetPoints = 1000;
  } else if (totalPoints >= 300) {
    rankName = 'Senior GTM Engineer';
    targetPoints = 600;
  } else if (totalPoints >= 100) {
    rankName = 'Mid-Level GTM Engineer';
    targetPoints = 300;
  }

  const progressPercent = Math.min(100, Math.round((totalPoints / targetPoints) * 100));

  return {
    badges,
    totalPoints,
    unlockedCount: unlockedBadges.length,
    nextRank: {
      name: rankName,
      currentPoints: totalPoints,
      targetPoints,
      progressPercent,
    },
  };
}
