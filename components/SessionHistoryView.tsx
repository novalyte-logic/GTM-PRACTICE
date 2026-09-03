'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Download, 
  Upload, 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  BookOpen, 
  Sparkles, 
  Printer, 
  Edit3, 
  Save, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Bookmark,
  Sparkle,
  Copy,
  Check,
  Share2,
  FileDown,
  ArrowLeftRight,
  Columns2,
  Target
} from 'lucide-react';
import { MockInterviewSession, SessionReport, CandidateAnswerRecord } from '@/lib/types';
import { deleteSession, saveSession, exportSessionsAsJSON, importSessionsFromJSON } from '@/lib/storage';

interface SessionHistoryViewProps {
  sessions: MockInterviewSession[];
  onRefreshSessions: () => void;
  onSelectSessionForReport: (session: MockInterviewSession) => void;
  activeReport: SessionReport | null;
  onCloseReport: () => void;
}

// Default mock sessions available for immediate side-by-side comparison
export const SAMPLE_COMPARISON_SESSIONS: MockInterviewSession[] = [
  {
    id: 'sample-baseline-session-1',
    title: 'Baseline Session: Ingress Webhook Architecture & Basic CRM Sync',
    date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    difficulty: 'Mid-Level GTM Engineer',
    track: 'system-architecture',
    companyArchetype: 'Series-B High-Growth PLG SaaS',
    durationSeconds: 780,
    averageScore: 74,
    emotionalState: 'rushed-pressured',
    confidenceAssessment: {
      overallScore10: 6,
      technicalDepth5: 3,
      executivePresence5: 3,
      edgeCaseDefense5: 4
    },
    answers: [
      {
        questionId: 'gtm-jr-1',
        candidateAnswer: 'I would set up an endpoint in Express.js, validate the payload with Zod, and write directly to Salesforce API synchronously. If the call fails, I return an HTTP error to the webhook caller.',
        timeSpentSeconds: 420,
        timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        evaluation: {
          overallScore: 74,
          letterGrade: 'B',
          pillarScores: {
            technicalArchitecture: 70,
            crmAndDataHygiene: 72,
            gtmBusinessContext: 75,
            modernStackTooling: 78,
            communicationAndClarity: 75
          },
          keyStrengths: [
            'Used Zod for input schema sanitization and field normalization',
            'Recognized need for standard E.164 phone formatting'
          ],
          blindSpotsAndMissedEdgeCases: [
            'Synchronous write directly to Salesforce risks HTTP 504 timeouts during burst traffic',
            'Missed asynchronous buffering with SQS/Kafka and distributed Redis idempotency keys'
          ]
        } as any,
        question: {
          id: 'gtm-jr-1',
          track: 'system-architecture',
          category: 'Lead Ingestion & Webhook Fundamentals',
          difficulty: 'Junior GTM Engineer',
          title: 'Inbound Webhook Payload Parsing & Data Normalization',
          question: 'Inbound Webhook Payload Parsing & Data Normalization'
        } as any
      }
    ],
    reflections: 'Felt a bit rushed under time constraints. Focused too heavily on data cleansing regex and forgot to decouple ingestion from the CRM write path.',
    keyTakeaways: [
      'Decouple ingestion from database persistence using SQS/Redis queues',
      'Always implement an Idempotency-Key header check to prevent duplicate leads'
    ]
  },
  {
    id: 'sample-progress-session-2',
    title: 'Advanced Drill: Distributed Queues, SOQL Governors & Clay Waterfalls',
    date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    difficulty: 'Senior GTM Engineer',
    track: 'system-architecture',
    companyArchetype: 'Enterprise B2B Multi-Product',
    durationSeconds: 1020,
    averageScore: 88,
    emotionalState: 'calm-composed',
    confidenceAssessment: {
      overallScore10: 9,
      technicalDepth5: 5,
      executivePresence5: 4,
      edgeCaseDefense5: 5
    },
    answers: [
      {
        questionId: 'gtm-sr-1',
        candidateAnswer: 'I decouple the ingestion endpoint by immediately acknowledging with HTTP 202 Accepted and pushing to an AWS SQS FIFO queue. A pool of worker microservices reads from SQS with Redis Redlock for distributed idempotency (24h TTL). For Salesforce writes, we batch records via Bulk API 2.0 to stay well under the 100 SOQL / 150 DML transaction limits. Failed records route to a Dead-Letter Queue with exponential backoff (1s, 2s, 4s, max 5 retries) before triggering an incident alert.',
        timeSpentSeconds: 510,
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        evaluation: {
          overallScore: 88,
          letterGrade: 'A',
          pillarScores: {
            technicalArchitecture: 90,
            crmAndDataHygiene: 88,
            gtmBusinessContext: 85,
            modernStackTooling: 89,
            communicationAndClarity: 88
          },
          keyStrengths: [
            'Architected asynchronous message buffering using HTTP 202 and SQS queues',
            'Implemented Redis Redlock idempotency keys to eliminate duplicate leads',
            'Mitigated Salesforce 100 SOQL governor limits proactively using Bulk API 2.0',
            'Configured robust DLQ retry policy with exponential backoff and jitter'
          ],
          blindSpotsAndMissedEdgeCases: [
            'Could detail database connection pooling limits for concurrent Postgres workers'
          ]
        } as any,
        question: {
          id: 'gtm-sr-1',
          track: 'system-architecture',
          category: 'High-Throughput Ingestion & Queuing',
          difficulty: 'Senior GTM Engineer',
          title: 'Asynchronous Webhook Ingestion & Governor Limit Defense',
          question: 'Asynchronous Webhook Ingestion & Governor Limit Defense'
        } as any
      }
    ],
    reflections: 'Much calmer structure. Applied the 4-step framework cleanly: Ingress -> Decoupled Buffer -> Bulk Mutation -> DLQ & Alerting.',
    keyTakeaways: [
      'Framing architecture around Speed-to-Lead SLA resonated strongly',
      'Name-dropping Bulk API 2.0 directly neutralized governor limit objections'
    ]
  }
];

export const SessionHistoryView: React.FC<SessionHistoryViewProps> = ({
  sessions,
  onRefreshSessions,
  onSelectSessionForReport,
  activeReport,
  onCloseReport,
}) => {
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<MockInterviewSession | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedDetail, setCopiedDetail] = useState<boolean>(false);

  // Pool of all sessions available for comparison (combining saved sessions and sample benchmarks)
  const comparisonPool = sessions.length >= 2 
    ? sessions 
    : [...sessions, ...SAMPLE_COMPARISON_SESSIONS.filter(s => !sessions.some(existing => existing.id === s.id))];

  // Side-by-Side Comparison State
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareSessionAId, setCompareSessionAId] = useState<string>(
    comparisonPool[1]?.id || comparisonPool[0]?.id || ''
  );
  const [compareSessionBId, setCompareSessionBId] = useState<string>(
    comparisonPool[0]?.id || ''
  );
  
  // Floating Reflections / Key Takeaways Drawer State
  const [reflectingSession, setReflectingSession] = useState<MockInterviewSession | null>(null);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [takeawaysList, setTakeawaysList] = useState<string[]>([]);
  const [newTakeawayInput, setNewTakeawayInput] = useState<string>('');
  const [isSavingReflection, setIsSavingReflection] = useState<boolean>(false);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session record?')) {
      deleteSession(id);
      onRefreshSessions();
      if (selectedSessionDetail?.id === id) {
        setSelectedSessionDetail(null);
      }
      if (reflectingSession?.id === id) {
        setReflectingSession(null);
      }
    }
  };

  const handleExport = () => {
    const jsonStr = exportSessionsAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gtm-engineer-interview-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const text = await file.text();
        const success = importSessionsFromJSON(text);
        if (success) {
          onRefreshSessions();
          alert('Sessions imported successfully!');
        } else {
          alert('Failed to parse JSON file.');
        }
      }
    };
    input.click();
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportToPDF = () => {
    if (!activeReport) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>GTM-Pulse Studio Benchmark Report - Jamil Yakasai</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #1c1917; line-height: 1.5; font-size: 13px; max-width: 820px; margin: 0 auto; background: #fff; }
            .header-badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; border: 1px solid #c7d2fe; }
            h1 { font-size: 22px; margin: 0 0 4px 0; color: #0f172a; letter-spacing: -0.02em; }
            .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px; }
            .score-card { display: flex; gap: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 24px; margin-bottom: 24px; }
            .score-box { text-align: left; }
            .score-val { font-size: 28px; font-weight: 800; color: #4338ca; line-height: 1; }
            .score-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-top: 4px; }
            h2 { font-size: 13px; text-transform: uppercase; color: #334155; letter-spacing: 0.05em; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px; margin: 24px 0 12px 0; font-weight: 800; }
            .summary { background: #fafaf9; border-left: 4px solid #6366f1; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px; font-size: 12.5px; line-height: 1.6; }
            .pillar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
            .pillar-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; background: #ffffff; }
            .pillar-name { font-weight: 700; font-size: 12px; color: #0f172a; display: flex; justify-content: space-between; align-items: center; }
            .pillar-score { color: #4338ca; font-weight: 800; font-size: 14px; }
            .pillar-target { font-size: 10px; color: #64748b; margin-top: 2px; }
            .pillar-desc { font-size: 11px; color: #475569; margin-top: 6px; line-height: 1.4; }
            .list-item { margin-bottom: 8px; line-height: 1.5; }
            .action-item { margin-bottom: 10px; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #6366f1; border-radius: 4px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
            @media print {
              body { padding: 15px; font-size: 12px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-badge">Performance Benchmark Report</div>
          <h1>GTM Systems Engineer Technical Evaluation</h1>
          <div class="meta">
            <strong>Candidate:</strong> Jamil Yakasai (mrjamilyakasai@gmail.com) &bull; 
            <strong>Target Role:</strong> Senior GTM Systems Engineer &bull; 
            <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>

          <div class="score-card">
            <div class="score-box">
              <div class="score-val">${activeReport.overallScore}/100</div>
              <div class="score-label">Overall Benchmark Score</div>
            </div>
            <div class="score-box" style="margin-left: 20px;">
              <div class="score-val" style="color: #059669;">${activeReport.overallRating}</div>
              <div class="score-label">Evaluation Rating</div>
            </div>
            <div class="score-box" style="margin-left: 20px;">
              <div class="score-val" style="color: #d97706;">Top ${100 - (activeReport.readinessPercentile || 85)}%</div>
              <div class="score-label">Readiness Percentile</div>
            </div>
          </div>

          <h2>1. Executive Summary</h2>
          <div class="summary">${activeReport.executiveSummary.replace(/\n/g, '<br/>')}</div>

          <h2>2. 5-Pillar Competency Benchmarks</h2>
          <div class="pillar-grid">
            ${activeReport.pillarBreakdown?.map(p => `
              <div class="pillar-card">
                <div class="pillar-name">
                  <span>${p.name}</span>
                  <span class="pillar-score">${p.score}%</span>
                </div>
                <div class="pillar-target">Industry Senior Target: ${p.benchmarkSenior || 85}%</div>
                <div class="pillar-desc">${p.summary}</div>
              </div>
            `).join('')}
          </div>

          <h2>3. Key Demonstrated Strengths</h2>
          <ul>
            ${activeReport.strengths?.map(s => `<li class="list-item"><strong>${s}</strong></li>`).join('')}
          </ul>

          <h2>4. Target Areas to Sharpen for Staff Tier</h2>
          <ul>
            ${activeReport.areasToSharpen?.map(a => `<li class="list-item">${a}</li>`).join('')}
          </ul>

          ${activeReport.sevenDayActionPlan?.length ? `
            <h2>5. Recommended 7-Day Sprint Plan</h2>
            <div>
              ${activeReport.sevenDayActionPlan.map(d => `
                <div class="action-item">
                  <strong>${d.day} (${d.focus}):</strong> ${d.recommendedExercise}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="footer">
            GTM-Pulse Studio &bull; Offline Performance Review &bull; Evaluated against Tier-1 SaaS GTM Hiring Bars
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const handleExportSessionToPDF = (session: MockInterviewSession) => {
    const printWindow = window.open('', '_blank');
    const sessionAnswers = session.answers || (session as any).questionsAnswered || [];
    if (printWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>${session.title} - Jamil Yakasai</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #1c1917; line-height: 1.5; font-size: 13px; max-width: 820px; margin: 0 auto; background: #fff; }
            .header-badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; }
            h1 { font-size: 20px; margin: 0 0 4px 0; color: #0f172a; }
            .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            .score-card { display: flex; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 20px; margin-bottom: 20px; }
            .score-box { text-align: left; }
            .score-val { font-size: 24px; font-weight: 800; color: #4338ca; }
            .score-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .q-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fafaf9; }
            .q-title { font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 6px; }
            .q-score { color: #4338ca; font-weight: 800; float: right; font-size: 14px; }
            .answer-text { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 12px; margin: 10px 0; white-space: pre-wrap; }
            .strengths { color: #065f46; font-size: 12px; margin-top: 8px; }
            .blindspots { color: #92400e; font-size: 12px; margin-top: 8px; }
            @media print { body { padding: 15px; font-size: 12px; } }
          </style>
        </head>
        <body>
          <div class="header-badge">Session Evaluation Record</div>
          <h1>${session.title}</h1>
          <div class="meta">
            Candidate: Jamil Yakasai &bull; Difficulty: ${session.difficulty} &bull; Date: ${new Date(session.date).toLocaleString()}
          </div>
          <div class="score-card">
            <div class="score-box">
              <div class="score-val">${session.averageScore}%</div>
              <div class="score-label">Session Average Score</div>
            </div>
            <div class="score-box" style="margin-left: 20px;">
              <div class="score-val" style="color: #059669;">${sessionAnswers.length}</div>
              <div class="score-label">Questions Drilled</div>
            </div>
          </div>
          ${sessionAnswers.map((a: CandidateAnswerRecord, idx: number) => `
            <div class="q-box">
              <span class="q-score">${a.evaluation?.overallScore || 0}%</span>
              <div class="q-title">${idx + 1}. ${a.question?.title || 'Technical Drill'}</div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${a.question?.category || a.question?.track || 'General'} &bull; ${a.question?.difficulty || 'Senior'}</div>
              <strong>Candidate Answer:</strong>
              <div class="answer-text">${a.candidateAnswer}</div>
              ${a.evaluation?.keyStrengths?.length ? `
                <div class="strengths">
                  <strong>Key Strengths:</strong>
                  <ul>${a.evaluation.keyStrengths.map((s: string) => `<li>${s}</li>`).join('')}</ul>
                </div>
              ` : ''}
              ${a.evaluation?.blindSpotsAndMissedEdgeCases?.length ? `
                <div class="blindspots">
                  <strong>Blind Spots & Gotchas:</strong>
                  <ul>${a.evaluation.blindSpotsAndMissedEdgeCases.map((b: string) => `<li>${b}</li>`).join('')}</ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  // Helper to generate formatted text from SessionReport
  const generateReportText = (report: SessionReport): string => {
    const divider = '================================================================================';
    const subDivider = '--------------------------------------------------------------------------------';
    
    let text = `${divider}\nGTM SYSTEMS ENGINEER INTERVIEW EVALUATION & PERFORMANCE REPORT\n${divider}\n`;
    text += `Candidate: Jamil Yakasai\n`;
    text += `Target Role: Senior GTM Systems Engineer / RevOps Architect\n`;
    text += `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n`;
    text += `Overall Score: ${report.overallScore}/100\n`;
    text += `Rating: ${report.overallRating}\n`;
    text += `Readiness Percentile: Top ${100 - (report.readinessPercentile || 85)}%\n\n`;

    text += `${subDivider}\n1. EXECUTIVE SUMMARY\n${subDivider}\n`;
    text += `${report.executiveSummary}\n\n`;

    text += `${subDivider}\n2. 5-PILLAR COMPETENCY BENCHMARK\n${subDivider}\n`;
    report.pillarBreakdown?.forEach((p) => {
      text += `• ${p.name}: ${p.score}% (Industry Senior Target: ${p.benchmarkSenior || 85}%)\n  ${p.summary}\n`;
    });
    text += `\n`;

    text += `${subDivider}\n3. DEMONSTRATED STRENGTHS\n${subDivider}\n`;
    report.strengths?.forEach((s, idx) => {
      text += `${idx + 1}. ${s}\n`;
    });
    text += `\n`;

    text += `${subDivider}\n4. TARGET AREAS TO SHARPEN FOR STAFF TIER\n${subDivider}\n`;
    report.areasToSharpen?.forEach((a, idx) => {
      text += `${idx + 1}. ${a}\n`;
    });
    text += `\n`;

    if (report.resumeLeverageAdvice?.length) {
      text += `${subDivider}\n5. RESUME POSITIONING & STORYTELLING ADVICE\n${subDivider}\n`;
      report.resumeLeverageAdvice.forEach((r) => {
        text += `• [${r.topic}]: ${r.advice}\n`;
      });
      text += `\n`;
    }

    if (report.sevenDayActionPlan?.length) {
      text += `${subDivider}\n6. RECOMMENDED 7-DAY PREPARATION SPRINT\n${subDivider}\n`;
      report.sevenDayActionPlan.forEach((d) => {
        text += `• ${d.day} (${d.focus}): ${d.recommendedExercise}\n`;
      });
      text += `\n`;
    }

    text += `${divider}\nGenerated by GTM Systems Engineering Interview Studio\n${divider}\n`;
    return text;
  };

  // Helper to generate formatted text from MockInterviewSession
  const generateSessionDetailText = (session: MockInterviewSession): string => {
    const divider = '================================================================================';
    const subDivider = '--------------------------------------------------------------------------------';
    const sessionAnswers = session.answers || (session as any).questionsAnswered || [];

    let text = `${divider}\nGTM PRACTICE DRILL RECORD & EVALUATION REPORT\n${divider}\n`;
    text += `Session Title: ${session.title}\n`;
    text += `Difficulty Tier: ${session.difficulty}\n`;
    text += `Date: ${new Date(session.date).toLocaleString()}\n`;
    text += `Average Score: ${session.averageScore}%\n`;
    text += `Total Questions Drilled: ${sessionAnswers.length}\n\n`;

    if (session.keyTakeaways?.length || session.reflections) {
      text += `${subDivider}\nPOST-INTERVIEW KEY TAKEAWAYS & CANDIDATE NOTES\n${subDivider}\n`;
      if (session.keyTakeaways?.length) {
        text += `Key Takeaways:\n`;
        session.keyTakeaways.forEach((t) => {
          text += `• ${t}\n`;
        });
      }
      if (session.reflections) {
        text += `\nCandidate Debrief Reflections:\n${session.reflections}\n`;
      }
      text += `\n`;
    }

    text += `${subDivider}\nQUESTIONS & EVALUATION DETAIL\n${subDivider}\n`;
    sessionAnswers.forEach((q: CandidateAnswerRecord, idx: number) => {
      text += `\n[QUESTION ${idx + 1}]: ${q.question?.title || 'Technical Scenario'}\n`;
      text += `Track: ${q.question?.track || 'System Architecture'}\n`;
      text += `Prompt:\n${q.question?.question || ''}\n\n`;
      text += `Recorded Candidate Answer:\n${q.candidateAnswer}\n\n`;
      if (q.evaluation) {
        text += `Evaluation Score: ${q.evaluation.overallScore}% (${q.evaluation.letterGrade})\n`;
        text += `Top Strength: ${q.evaluation.keyStrengths?.[0] || 'N/A'}\n`;
        text += `Missed Edge Case: ${q.evaluation.blindSpotsAndMissedEdgeCases?.[0] || 'N/A'}\n`;
        if (q.evaluation.goldStandardAnswer) {
          text += `Gold Standard Solution Framework:\n${q.evaluation.goldStandardAnswer}\n`;
        }
      }
      text += `\n${'- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'}\n`;
    });

    return text;
  };

  const handleDownloadReportText = () => {
    if (!activeReport) return;
    const content = generateReportText(activeReport);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gtm-engineer-interview-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  const handleCopyReport = () => {
    if (!activeReport) return;
    const content = generateReportText(activeReport);
    navigator.clipboard.writeText(content);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadSessionDetail = (session: MockInterviewSession) => {
    const content = generateSessionDetailText(session);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gtm-session-${session.id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  const handleCopySessionDetail = (session: MockInterviewSession) => {
    const content = generateSessionDetailText(session);
    navigator.clipboard.writeText(content);
    setCopiedDetail(true);
    setTimeout(() => setCopiedDetail(false), 2000);
  };

  // Open reflections drawer
  const handleOpenReflections = (session: MockInterviewSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setReflectingSession(session);
    setReflectionText(session.reflections || '');
    setTakeawaysList(session.keyTakeaways || []);
  };

  const handleAddTakeaway = () => {
    if (newTakeawayInput.trim()) {
      setTakeawaysList((prev) => [...prev, newTakeawayInput.trim()]);
      setNewTakeawayInput('');
    }
  };

  const handleRemoveTakeaway = (index: number) => {
    setTakeawaysList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveReflection = () => {
    if (!reflectingSession) return;
    setIsSavingReflection(true);
    const updated: MockInterviewSession = {
      ...reflectingSession,
      reflections: reflectionText,
      keyTakeaways: takeawaysList,
    };
    saveSession(updated);
    onRefreshSessions();
    if (selectedSessionDetail?.id === reflectingSession.id) {
      setSelectedSessionDetail(updated);
    }
    setTimeout(() => {
      setIsSavingReflection(false);
      setReflectingSession(null);
    }, 400);
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    const sessionDifficulty = s.difficulty || (s as any).targetDifficulty;
    const matchesDiff = filterDifficulty === 'all' || sessionDifficulty === filterDifficulty;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesDiff;

    const sessionAnswers = s.answers || (s as any).questionsAnswered || [];
    const matchesTitle = s.title?.toLowerCase().includes(query);
    const matchesQuestions = sessionAnswers.some(
      (q: CandidateAnswerRecord) => q.question?.title?.toLowerCase().includes(query) || q.candidateAnswer?.toLowerCase().includes(query)
    );
    const matchesReflections = s.reflections?.toLowerCase().includes(query);
    return matchesDiff && (matchesTitle || matchesQuestions || matchesReflections);
  });

  // Calculate aggregated stats
  const totalQuestionsAnswered = sessions.reduce((acc, s) => {
    const arr = s.answers || (s as any).questionsAnswered || [];
    return acc + arr.length;
  }, 0);

  const averageOverallScore = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.averageScore || 0), 0) / sessions.length)
    : 0;

  return (
    <div className="space-y-6 text-stone-800">
      {/* Top Header & Export/Import */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                Session Archive & Debrief Reports
              </span>
            </div>
            <h2 className="text-base font-bold text-stone-900 mt-1">
              Historical Practice Sessions & Private Takeaways
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Review saved mock interview evaluations, manage private post-session reflections, and track milestone growth.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition shadow-sm"
            >
              <Upload className="h-3.5 w-3.5 text-stone-500" />
              <span>Import</span>
            </button>

            <button
              onClick={handleExport}
              disabled={sessions.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition disabled:opacity-40 shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-stone-500" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Global Stats Ribbon */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-100 text-xs">
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
              <div className="text-stone-500 text-[11px] font-medium">Saved Sessions</div>
              <div className="text-lg font-bold text-stone-900">{sessions.length}</div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
              <div className="text-stone-500 text-[11px] font-medium">Questions Drilled</div>
              <div className="text-lg font-bold text-stone-900">{totalQuestionsAnswered}</div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
              <div className="text-stone-500 text-[11px] font-medium">Average Benchmark Score</div>
              <div className="text-lg font-bold text-indigo-600">{averageOverallScore}/100</div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
              <div className="text-stone-500 text-[11px] font-medium">Candidate Profile</div>
              <div className="text-xs font-bold text-stone-900">Jamil Yakasai</div>
            </div>
          </div>
        )}
      </div>

      {/* Active Session Report View if present */}
      {activeReport && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-6 animate-in fade-in">
          {/* Report Top Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Official Debrief Report
                </span>
                <span className="text-xs text-stone-400">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-stone-900 mt-1">
                GTM Engineer Performance Debrief
              </h3>
              <p className="text-xs text-stone-500">
                Candidate: <span className="font-semibold text-stone-800">Jamil Yakasai</span> • Target: Senior GTM Systems Engineer
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="text-right mr-1">
                <div className="text-[10px] uppercase font-bold text-stone-400">Overall Score</div>
                <div className="text-xl font-bold text-stone-900">{activeReport.overallScore}/100</div>
              </div>
              <div className="rounded-xl bg-indigo-50 px-3 py-1.5 border border-indigo-200 text-center mr-1">
                <div className="text-[10px] uppercase font-bold text-indigo-600">Rating</div>
                <div className="text-xs font-bold text-indigo-900">{activeReport.overallRating}</div>
              </div>

              {/* Copy Report Text */}
              <button
                onClick={handleCopyReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 text-xs font-semibold shadow-xs transition"
                title="Copy entire markdown evaluation report"
              >
                {copiedReport ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-stone-500" />}
                <span>{copiedReport ? 'Copied!' : 'Copy'}</span>
              </button>

              {/* Export/Download Text (.md) */}
              <button
                onClick={handleDownloadReportText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 text-xs font-semibold shadow-xs transition"
                title="Download report as Markdown / Text file"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600" />
                <span>Export .md</span>
              </button>

              {/* Export to PDF Button */}
              <button
                onClick={handleExportToPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-xs font-bold shadow-xs transition"
                title="Download and review performance benchmarks offline as PDF"
              >
                <FileDown className="h-3.5 w-3.5 text-indigo-600" />
                <span>Export to PDF</span>
              </button>
              
              <button
                onClick={onCloseReport}
                className="rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-stone-800 shadow-xs ml-1"
              >
                Close Report
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Executive Evaluation Summary
            </h4>
            <p className="text-xs leading-relaxed text-stone-700 whitespace-pre-line bg-stone-50 p-4 rounded-xl border border-stone-200">
              {activeReport.executiveSummary}
            </p>
          </div>

          {/* Pillars Breakdown Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              5-Pillar Competency Benchmark
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {activeReport.pillarBreakdown?.map((pillar, idx) => (
                <div key={idx} className="rounded-xl bg-stone-50 p-3.5 border border-stone-200 space-y-1.5">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>{pillar.name}</span>
                    <span className="text-indigo-600">{pillar.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pillar.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-stone-600 leading-snug">{pillar.summary}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Areas to Sharpen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-200 space-y-1.5">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Demonstrated Strengths
              </div>
              <ul className="list-disc pl-4 space-y-1 text-emerald-950">
                {activeReport.strengths?.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-amber-50/70 p-4 border border-amber-200 space-y-1.5">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Target Areas to Sharpen for Staff Tier
              </div>
              <ul className="list-disc pl-4 space-y-1 text-amber-950">
                {activeReport.areasToSharpen?.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Resume Storytelling Tips */}
          {activeReport.resumeLeverageAdvice && activeReport.resumeLeverageAdvice.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Resume Leverage & Positioning Advice (Novalyte AI & Zendesk)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {activeReport.resumeLeverageAdvice.map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-indigo-50/70 p-3.5 border border-indigo-200 space-y-1">
                    <div className="font-bold text-indigo-900">{item.topic}</div>
                    <div className="text-indigo-950 leading-relaxed text-[11px]">{item.advice}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Action Plan */}
          {activeReport.sevenDayActionPlan && activeReport.sevenDayActionPlan.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Recommended 7-Day Interview Preparation Sprint
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {activeReport.sevenDayActionPlan.map((day, idx) => (
                  <div key={idx} className="rounded-xl bg-stone-50 p-3 border border-stone-200 space-y-1">
                    <div className="font-bold text-indigo-700">{day.day}: {day.focus}</div>
                    <div className="text-stone-600 text-[11px] leading-snug">{day.recommendedExercise}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past sessions by question title, answers, reflections, or keywords..."
            className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 focus:border-indigo-500 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="all">All Difficulty Tiers</option>
            <option value="Junior GTM Engineer">Junior GTM Engineer</option>
            <option value="Mid-Level GTM Engineer">Mid-Level GTM Engineer</option>
            <option value="Senior GTM Engineer">Senior GTM Engineer</option>
            <option value="Staff / Principal GTM Architect">Staff / Principal GTM Architect</option>
          </select>

          {/* Toggle Side-by-Side Comparison Mode */}
          <button
            onClick={() => {
              setIsCompareMode(!isCompareMode);
              if (!isCompareMode && !compareSessionAId && comparisonPool.length > 0) {
                setCompareSessionAId(comparisonPool[1]?.id || comparisonPool[0]?.id);
                setCompareSessionBId(comparisonPool[0]?.id);
              }
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-sm shrink-0 ${
              isCompareMode
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
            title="Compare two past interview sessions side-by-side"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>{isCompareMode ? 'Exit Compare' : 'Side-by-Side Compare'}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual Session Comparison View */}
      {isCompareMode && (() => {
        const sessionA = comparisonPool.find((s) => s.id === compareSessionAId) || comparisonPool[0];
        const sessionB = comparisonPool.find((s) => s.id === compareSessionBId) || comparisonPool[1] || comparisonPool[0];

        const answersA: CandidateAnswerRecord[] = sessionA?.answers || (sessionA as any)?.questionsAnswered || [];
        const answersB: CandidateAnswerRecord[] = sessionB?.answers || (sessionB as any)?.questionsAnswered || [];

        const getPillarScoresForSession = (s: MockInterviewSession) => {
          const ans = s?.answers || (s as any)?.questionsAnswered || [];
          if (!ans.length) {
            return {
              techArch: s?.averageScore || 75,
              crmData: Math.max(60, (s?.averageScore || 75) - 2),
              enrichment: Math.max(65, (s?.averageScore || 75) + 3),
              appliedAI: Math.max(60, (s?.averageScore || 75) - 5),
              communication: s?.averageScore || 75
            };
          }
          let techArch = 0, crmData = 0, enrichment = 0, appliedAI = 0, communication = 0;
          let count = 0;
          ans.forEach((a: CandidateAnswerRecord) => {
            if (a.evaluation?.pillarScores) {
              techArch += a.evaluation.pillarScores.technicalArchitecture || 0;
              crmData += a.evaluation.pillarScores.crmAndDataHygiene || 0;
              enrichment += a.evaluation.pillarScores.modernStackTooling || 0;
              appliedAI += a.evaluation.pillarScores.gtmBusinessContext || 0;
              communication += a.evaluation.pillarScores.communicationAndClarity || 0;
              count++;
            }
          });
          if (!count) {
            return {
              techArch: s?.averageScore || 75,
              crmData: Math.max(60, (s?.averageScore || 75) - 2),
              enrichment: Math.max(65, (s?.averageScore || 75) + 3),
              appliedAI: Math.max(60, (s?.averageScore || 75) - 5),
              communication: s?.averageScore || 75
            };
          }
          return {
            techArch: Math.round(techArch / count),
            crmData: Math.round(crmData / count),
            enrichment: Math.round(enrichment / count),
            appliedAI: Math.round(appliedAI / count),
            communication: Math.round(communication / count)
          };
        };

        const pillarsA = getPillarScoresForSession(sessionA);
        const pillarsB = getPillarScoresForSession(sessionB);
        const overallDelta = (sessionB?.averageScore || 0) - (sessionA?.averageScore || 0);

        const getCategories = (ans: CandidateAnswerRecord[]) => {
          const set = new Set<string>();
          ans.forEach(a => {
            if (a.question?.category) set.add(a.question.category);
            else if (a.question?.track) set.add(a.question.track);
          });
          return Array.from(set);
        };

        const getStrengths = (ans: CandidateAnswerRecord[]) => {
          const list: string[] = [];
          ans.forEach(a => {
            if (a.evaluation?.keyStrengths) list.push(...a.evaluation.keyStrengths);
          });
          return Array.from(new Set(list));
        };

        const categoriesA = getCategories(answersA);
        const categoriesB = getCategories(answersB);
        const strengthsA = getStrengths(answersA);
        const strengthsB = getStrengths(answersB);

        return (
          <div className="rounded-2xl border-2 border-indigo-500/30 bg-white p-5 shadow-md space-y-6 animate-in fade-in">
            {/* Comparison Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                    <Columns2 className="h-3.5 w-3.5 text-indigo-600" />
                    Dual-Session Benchmark Comparison
                  </span>
                  <span className="text-xs text-stone-400">
                    Select two sessions to benchmark score delta and technical focus areas
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900 mt-1">
                  Side-by-Side Performance &amp; Technical Focus Analysis
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const temp = compareSessionAId;
                    setCompareSessionAId(compareSessionBId);
                    setCompareSessionBId(temp);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition shadow-2xs"
                  title="Swap baseline and target comparison slots"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Swap (A ⇄ B)</span>
                </button>

                <button
                  onClick={() => setIsCompareMode(false)}
                  className="rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 shadow-2xs"
                >
                  Close Comparison
                </button>
              </div>
            </div>

            {/* Delta Banner */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">Overall Score Trajectory</div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-stone-600">{sessionA?.averageScore || 0}%</span>
                    <span className="text-stone-300">➔</span>
                    <span className="text-base font-extrabold text-stone-900">{sessionB?.averageScore || 0}%</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                      overallDelta >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {overallDelta >= 0 ? `+${overallDelta}% ▲` : `${overallDelta}% ▼`}
                    </span>
                  </div>
                </div>

                <div className="pt-3 sm:pt-0">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Questions Answered</div>
                  <div className="flex items-center justify-center gap-2 mt-1 text-xs font-bold text-stone-800">
                    <span>Session A: {answersA.length}</span>
                    <span className="text-stone-300">vs</span>
                    <span>Session B: {answersB.length}</span>
                  </div>
                </div>

                <div className="pt-3 sm:pt-0">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Difficulty Tier Transition</div>
                  <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-semibold text-stone-700">
                    <span className="rounded bg-white px-2 py-0.5 border border-stone-200">{sessionA?.difficulty || 'Mid-Level'}</span>
                    <span className="text-stone-400">➔</span>
                    <span className="rounded bg-indigo-50 px-2 py-0.5 border border-indigo-200 font-bold text-indigo-900">{sessionB?.difficulty || 'Senior'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side-by-Side Dual Column Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Session A (Left Column) */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-4 shadow-2xs">
                {/* Selector Header */}
                <div className="space-y-1.5 border-b border-stone-100 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-700 border border-stone-200">
                      Session A (Baseline)
                    </span>
                    <span className="text-xs font-bold text-indigo-700">
                      Average Score: {sessionA?.averageScore || 0}%
                    </span>
                  </div>
                  <select
                    value={compareSessionAId}
                    onChange={(e) => setCompareSessionAId(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 p-2 text-xs font-semibold text-stone-900 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    {comparisonPool.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.averageScore}%) • {new Date(s.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-stone-500 flex items-center justify-between pt-0.5">
                    <span>{sessionA?.difficulty}</span>
                    <span>{new Date(sessionA?.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Technical Focus Areas */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-stone-400" />
                    Technical Focus Areas &amp; Categories
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {categoriesA.map((c, i) => (
                      <span key={i} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 border border-stone-200">
                        {c}
                      </span>
                    ))}
                    {categoriesA.length === 0 && <span className="text-xs text-stone-400 italic">No specific categories logged</span>}
                  </div>
                </div>

                {/* Questions Drilled */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-stone-400" />
                    Scenarios &amp; Questions Drilled ({answersA.length})
                  </h5>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {answersA.map((a, i) => (
                      <div key={i} className="rounded-lg bg-stone-50 p-2 border border-stone-200 text-xs">
                        <div className="font-bold text-stone-900">{i + 1}. {a.question?.title || 'Technical Drill'}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5 flex justify-between">
                          <span>Score: {a.evaluation?.overallScore || 0}%</span>
                          <span>{a.question?.track}</span>
                        </div>
                      </div>
                    ))}
                    {answersA.length === 0 && <div className="text-xs text-stone-400 italic">No questions recorded in this session.</div>}
                  </div>
                </div>

                {/* Key Strengths Demonstrated */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Demonstrated Strengths
                  </h5>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {strengthsA.slice(0, 4).map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 shrink-0">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                    {strengthsA.length === 0 && <li className="text-stone-400 italic">Standard execution demonstrated.</li>}
                  </ul>
                </div>

                {/* Post-Interview Reflections */}
                {sessionA?.reflections && (
                  <div className="space-y-1 rounded-lg bg-amber-50/60 p-2.5 border border-amber-200 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Takeaway Notes:</div>
                    <p className="text-stone-700 italic text-[11px]">{sessionA.reflections}</p>
                  </div>
                )}
              </div>

              {/* Session B (Right Column) */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/20 p-4 space-y-4 shadow-2xs">
                {/* Selector Header */}
                <div className="space-y-1.5 border-b border-indigo-100 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800 border border-indigo-200">
                      Session B (Comparison Target)
                    </span>
                    <span className="text-xs font-bold text-indigo-700">
                      Average Score: {sessionB?.averageScore || 0}%
                    </span>
                  </div>
                  <select
                    value={compareSessionBId}
                    onChange={(e) => setCompareSessionBId(e.target.value)}
                    className="w-full rounded-lg border border-indigo-200 bg-white p-2 text-xs font-semibold text-stone-900 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    {comparisonPool.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.averageScore}%) • {new Date(s.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-stone-500 flex items-center justify-between pt-0.5">
                    <span>{sessionB?.difficulty}</span>
                    <span>{new Date(sessionB?.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Technical Focus Areas */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-indigo-600" />
                    Technical Focus Areas &amp; Categories
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {categoriesB.map((c, i) => (
                      <span key={i} className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-800 border border-indigo-200">
                        {c}
                      </span>
                    ))}
                    {categoriesB.length === 0 && <span className="text-xs text-stone-400 italic">No specific categories logged</span>}
                  </div>
                </div>

                {/* Questions Drilled */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                    Scenarios &amp; Questions Drilled ({answersB.length})
                  </h5>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {answersB.map((a, i) => (
                      <div key={i} className="rounded-lg bg-white p-2 border border-indigo-100 text-xs shadow-2xs">
                        <div className="font-bold text-stone-900">{i + 1}. {a.question?.title || 'Technical Drill'}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5 flex justify-between">
                          <span className="font-semibold text-indigo-600">Score: {a.evaluation?.overallScore || 0}%</span>
                          <span>{a.question?.track}</span>
                        </div>
                      </div>
                    ))}
                    {answersB.length === 0 && <div className="text-xs text-stone-400 italic">No questions recorded in this session.</div>}
                  </div>
                </div>

                {/* Key Strengths Demonstrated */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Demonstrated Strengths &amp; Breakthroughs
                  </h5>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {strengthsB.slice(0, 4).map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 shrink-0">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                    {strengthsB.length === 0 && <li className="text-stone-400 italic">Standard execution demonstrated.</li>}
                  </ul>
                </div>

                {/* Post-Interview Reflections */}
                {sessionB?.reflections && (
                  <div className="space-y-1 rounded-lg bg-amber-50/60 p-2.5 border border-amber-200 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Takeaway Notes:</div>
                    <p className="text-stone-700 italic text-[11px]">{sessionB.reflections}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 5-Pillar Competency Trajectory Comparative Bars */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                  5-Pillar Competency Trajectory Comparison
                </h4>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-stone-500">
                    <span className="h-2 w-2 rounded-full bg-stone-400" /> Session A
                  </span>
                  <span className="flex items-center gap-1 text-indigo-700 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-indigo-600" /> Session B
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {[
                  { name: 'System Architecture & Webhooks', a: pillarsA.techArch, b: pillarsB.techArch, benchmark: 85 },
                  { name: 'CRM Architecture & Data Hygiene', a: pillarsA.crmData, b: pillarsB.crmData, benchmark: 85 },
                  { name: 'Modern Stack & Enrichment (Clay/Apollo)', a: pillarsA.enrichment, b: pillarsB.enrichment, benchmark: 80 },
                  { name: 'Applied AI & Workflow Automation', a: pillarsA.appliedAI, b: pillarsB.appliedAI, benchmark: 80 },
                  { name: 'Executive Revenue Context & Comm.', a: pillarsA.communication, b: pillarsB.communication, benchmark: 85 },
                ].map((pillar, idx) => {
                  const delta = pillar.b - pillar.a;
                  return (
                    <div key={idx} className="rounded-lg bg-stone-50 p-3 border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-stone-800">{pillar.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          delta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {delta >= 0 ? `+${delta}%` : `${delta}%`}
                        </span>
                      </div>
                      {/* Comparative Progress Bars */}
                      <div className="space-y-1 text-[10px]">
                        <div className="flex items-center justify-between text-stone-500">
                          <span>Session A: {pillar.a}%</span>
                          <div className="w-2/3 h-2 rounded-full bg-stone-200 overflow-hidden ml-2">
                            <div className="h-full bg-stone-400 rounded-full" style={{ width: `${pillar.a}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-indigo-700 font-semibold">
                          <span>Session B: {pillar.b}%</span>
                          <div className="w-2/3 h-2 rounded-full bg-stone-200 overflow-hidden ml-2">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pillar.b}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Sessions List & Detailed Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center space-y-2">
              <Calendar className="h-8 w-8 text-stone-300 mx-auto" />
              <div className="text-xs font-bold text-stone-800">No sessions match your filter</div>
              <p className="text-[11px] text-stone-500">
                Complete technical question drills in the Practice Simulator to populate your archive.
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = selectedSessionDetail?.id === session.id;
              const hasReflections = Boolean(session.reflections || session.keyTakeaways?.length);
              const sessionAnswers = session.answers || (session as any).questionsAnswered || [];
              const sessionDate = session.date || (session as any).completedAt || new Date().toISOString();
              const sessionDifficulty = session.difficulty || (session as any).targetDifficulty || 'Senior GTM Engineer';
              const isInComparison = compareSessionAId === session.id || compareSessionBId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionDetail(session)}
                  className={`rounded-2xl border p-4 cursor-pointer transition shadow-sm space-y-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700 border border-stone-200">
                          {sessionDifficulty}
                        </span>
                        {hasReflections && (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Bookmark className="h-3 w-3" />
                            Reflections Saved
                          </span>
                        )}
                        {isInComparison && (
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <Columns2 className="h-3 w-3" />
                            In Compare
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 mt-1">
                        {session.title || 'Technical Architecture Practice Session'}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-indigo-600">
                        {session.averageScore || 0}%
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {new Date(sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
                    <div>
                      {sessionAnswers.length} questions drilled
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Compare Selection Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCompareMode(true);
                          if (compareSessionAId !== session.id) {
                            setCompareSessionBId(session.id);
                          }
                        }}
                        className={`p-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 px-2 transition ${
                          isInComparison
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                            : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                        }`}
                        title="Compare this session side-by-side"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                        <span>Compare</span>
                      </button>

                      {/* Open Floating Reflection Button */}
                      <button
                        onClick={(e) => handleOpenReflections(session, e)}
                        className="p-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 text-[11px] font-semibold flex items-center gap-1 px-2"
                        title="Add/Edit Post-Interview Reflections"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Reflections</span>
                      </button>

                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Pane (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedSessionDetail ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-5">
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-700">
                      {selectedSessionDetail.difficulty || (selectedSessionDetail as any).targetDifficulty || 'Senior GTM Engineer'}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(selectedSessionDetail.date || (selectedSessionDetail as any).completedAt || new Date()).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mt-1">
                    {selectedSessionDetail.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Copy Session Markdown */}
                  <button
                    onClick={() => handleCopySessionDetail(selectedSessionDetail)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 shadow-2xs"
                    title="Copy session notes and questions to clipboard"
                  >
                    {copiedDetail ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-stone-500" />}
                    <span>{copiedDetail ? 'Copied' : 'Copy'}</span>
                  </button>

                  {/* Download Session Markdown */}
                  <button
                    onClick={() => handleDownloadSessionDetail(selectedSessionDetail)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 shadow-2xs"
                    title="Export session questions and evaluations as Markdown"
                  >
                    <Download className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Export</span>
                  </button>

                  {/* Export Session PDF */}
                  <button
                    onClick={() => handleExportSessionToPDF(selectedSessionDetail)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 shadow-2xs"
                    title="Download and print session report as PDF"
                  >
                    <FileDown className="h-3.5 w-3.5 text-stone-600" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={(e) => handleOpenReflections(selectedSessionDetail, e)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 shadow-2xs"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-amber-600" />
                    <span>Takeaways</span>
                  </button>

                  <button
                    onClick={() => onSelectSessionForReport(selectedSessionDetail)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-2xs"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>Debrief</span>
                  </button>
                </div>
              </div>

              {/* Emotional State & Confidence Self-Assessment (if recorded) */}
              {(selectedSessionDetail.emotionalState || selectedSessionDetail.confidenceAssessment) && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                    <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <span>Mindset & Perceived Confidence Calibration</span>
                    </span>
                    {selectedSessionDetail.emotionalState && (
                      <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-indigo-900 border border-indigo-200 shadow-2xs">
                        State: {selectedSessionDetail.emotionalState === 'calm-composed' ? '🧘 Calm & Composed' :
                               selectedSessionDetail.emotionalState === 'in-flow' ? '⚡ In The Zone / Flow' :
                               selectedSessionDetail.emotionalState === 'decisive-commanding' ? '🎯 Decisive & Structured' :
                               selectedSessionDetail.emotionalState === 'rushed-pressured' ? '⏱️ Rushed / Time Pressure' :
                               selectedSessionDetail.emotionalState === 'anxious-hesitant' ? '😰 Anxious / Second-Guessing' :
                               '🧠 Mentally Fatigued'}
                      </span>
                    )}
                  </div>

                  {selectedSessionDetail.confidenceAssessment && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                      <div className="rounded-lg bg-white p-2 border border-indigo-100">
                        <div className="text-[10px] text-stone-500 font-bold uppercase">Overall Feeling</div>
                        <div className="text-xs font-bold text-indigo-700 mt-0.5">{selectedSessionDetail.confidenceAssessment.overallScore10}/10</div>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-indigo-100">
                        <div className="text-[10px] text-stone-500 font-bold uppercase">Arch Depth</div>
                        <div className="text-xs font-bold text-stone-900 mt-0.5">{selectedSessionDetail.confidenceAssessment.technicalDepth5}/5</div>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-indigo-100">
                        <div className="text-[10px] text-stone-500 font-bold uppercase">Executive Presence</div>
                        <div className="text-xs font-bold text-stone-900 mt-0.5">{selectedSessionDetail.confidenceAssessment.executivePresence5}/5</div>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-indigo-100">
                        <div className="text-[10px] text-stone-500 font-bold uppercase">Edge Defense</div>
                        <div className="text-xs font-bold text-stone-900 mt-0.5">{selectedSessionDetail.confidenceAssessment.edgeCaseDefense5}/5</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Private Reflections & Takeaways Section */}
              {(selectedSessionDetail.reflections || (selectedSessionDetail.keyTakeaways && selectedSessionDetail.keyTakeaways.length > 0)) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Bookmark className="h-4 w-4 text-amber-600" />
                      Candidate Post-Interview Key Takeaways & Private Notes
                    </div>
                  </div>

                  {selectedSessionDetail.keyTakeaways && selectedSessionDetail.keyTakeaways.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSessionDetail.keyTakeaways.map((item, idx) => (
                        <span key={idx} className="rounded-lg bg-white border border-amber-300 px-2.5 py-1 font-semibold text-amber-900 shadow-2xs">
                          💡 {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedSessionDetail.reflections && (
                    <p className="text-stone-700 leading-relaxed whitespace-pre-line bg-white/80 p-3 rounded-lg border border-amber-200/80">
                      {selectedSessionDetail.reflections}
                    </p>
                  )}
                </div>
              )}

              {/* Drilled Questions Breakdown */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Questions & Answers in this Session ({(selectedSessionDetail.answers || (selectedSessionDetail as any).questionsAnswered || []).length})
                </div>

                {(selectedSessionDetail.answers || (selectedSessionDetail as any).questionsAnswered || []).map((record: CandidateAnswerRecord, index: number) => (
                  <div key={index} className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-stone-900">
                        {index + 1}. {record.question?.title || 'Technical Question'}
                      </div>
                      <span className="font-bold text-indigo-600">
                        Score: {record.evaluation?.overallScore || 0}% ({record.evaluation?.letterGrade || 'B+'})
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-semibold text-stone-500 text-[11px]">Your Recorded Answer:</div>
                      <p className="text-stone-800 leading-relaxed bg-white p-3 rounded-lg border border-stone-200">
                        {record.candidateAnswer}
                      </p>
                    </div>

                    {record.evaluation && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-200 text-emerald-950">
                          <span className="font-bold text-emerald-900">Top Strength: </span>
                          {record.evaluation.keyStrengths?.[0] || 'Clear structure'}
                        </div>
                        <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-amber-950">
                          <span className="font-bold text-amber-900">Missed Edge Case: </span>
                          {record.evaluation.blindSpotsAndMissedEdgeCases?.[0] || 'Mention rate limits'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center space-y-2">
              <FileText className="h-8 w-8 text-stone-300 mx-auto" />
              <div className="text-xs font-bold text-stone-800">No session selected</div>
              <p className="text-[11px] text-stone-500">
                Click any session in the list to view its complete questions, evaluations, and private takeaways.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Reflections & Key Takeaways Modal / Drawer */}
      {reflectingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900">
                  Private Post-Interview Reflections & Key Takeaways
                </h3>
              </div>
              <button
                onClick={() => setReflectingSession(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-stone-600">
              Session: <span className="font-semibold text-stone-900">{reflectingSession.title}</span> ({new Date(reflectingSession.date || (reflectingSession as any).completedAt || new Date()).toLocaleDateString()})
            </div>

            {/* Quick Key Takeaway Chips */}
            <div className="space-y-2">
              <label className="font-bold text-stone-800">
                Key Takeaways / Architecture Rules (Bullet Tags):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTakeawayInput}
                  onChange={(e) => setNewTakeawayInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTakeaway();
                    }
                  }}
                  placeholder="e.g. Always decouple ingress via Redis queue; guard SFDC sync with LastModifiedById..."
                  className="flex-1 rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
                <button
                  onClick={handleAddTakeaway}
                  className="rounded-xl bg-stone-900 px-3 py-2.5 font-bold text-white hover:bg-stone-800 text-xs flex items-center gap-1 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {takeawaysList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {takeawaysList.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900"
                    >
                      <span>💡 {tag}</span>
                      <button
                        onClick={() => handleRemoveTakeaway(idx)}
                        className="text-amber-600 hover:text-amber-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reflection Text Area */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-800">
                Personal Debrief Notes & Next Steps:
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Write down what went well, which edge cases you overlooked, what questions you want to ask the interviewer, or specific metrics from Novalyte AI to highlight next time..."
                rows={5}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs leading-relaxed text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-500">
                Saved securely in your browser storage for iterative review.
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReflectingSession(null)}
                  className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveReflection}
                  disabled={isSavingReflection}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSavingReflection ? 'Saving...' : 'Save Reflections'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
