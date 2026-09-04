import { jsPDF } from 'jspdf';
import { SessionReport, MockInterviewSession, CandidateAnswerRecord } from '@/lib/types';

/**
 * Cleanly wraps text into lines and writes to PDF, advancing yPos.
 * Automatically adds a new page if yPos exceeds page height.
 */
function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 6
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginBottom = 20;
  const lines = doc.splitTextToSize(text, maxWidth);

  let currentY = y;
  for (const line of lines) {
    if (currentY + lineHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentY = 22; // top margin on new page
    }
    doc.text(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

/**
 * Checks if needed space is available on the current page;
 * if not, creates a new page and resets y.
 */
function ensureSpace(doc: jsPDF, currentY: number, neededSpace: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + neededSpace > pageHeight - 20) {
    doc.addPage();
    return 22;
  }
  return currentY;
}

/**
 * Adds header & footer to all pages of the document
 */
function addHeadersAndFooters(doc: jsPDF, documentTitle: string) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (pages 2+)
    if (i > 1) {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont('helvetica', 'normal');
      doc.text(documentTitle, 18, 12);
      doc.text('GTM-Pulse Studio', pageWidth - 18, 12, { align: 'right' });
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.4);
      doc.line(18, 15, pageWidth - 18, 15);
    }

    // Running Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(18, pageHeight - 12, pageWidth - 18, pageHeight - 12);
    
    doc.text('Confidential Performance Evaluation • Jamil Yakasai', 18, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 18, pageHeight - 7, { align: 'right' });
  }
}

/**
 * Generates and downloads a formal PDF version of a Session Report
 */
export function downloadSessionReportPDF(
  report: SessionReport,
  sessionTitle: string = 'GTM Systems Architecture Interview Session'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 36; // 18mm margins on left & right
  let y = 20;

  // 1. TOP BRAND BADGE & HEADER
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.roundedRect(18, y, 62, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(67, 56, 202); // indigo-700
  doc.text('GTM-PULSE STUDIO • BENCHMARK', 22, y + 4.8);
  y += 12;

  // Document Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('GTM Systems Engineer Evaluation Report', 18, y);
  y += 6;

  // Subtitle & Session Title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(sessionTitle, 18, y);
  y += 5;

  // Metadata Line
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(`Candidate: Jamil Yakasai (mrjamilyakasai@gmail.com)  |  Target: Senior GTM Systems Engineer  |  Date: ${dateStr}`, 18, y);
  y += 5;

  // Horizontal Rule
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(18, y, pageWidth - 18, y);
  y += 6;

  // 2. SCORE & READINESS KPI CALLOUT CARDS
  const cardWidth = (contentWidth - 6) / 3;
  const cardHeight = 22;

  // Card 1: Overall Score
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(18, y, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('OVERALL BENCHMARK', 22, y + 6);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202); // indigo-700
  doc.text(`${report.overallScore}/100`, 22, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Weighted 5-Pillar Score', 22, y + 19);

  // Card 2: Rating Tier
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(18 + cardWidth + 3, y, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('EVALUATION TIER', 22 + cardWidth + 3, y + 6);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(report.overallRating || 'Strong Hire', 22 + cardWidth + 3, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Senior Hiring Bar Standard', 22 + cardWidth + 3, y + 19);

  // Card 3: Readiness Percentile
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(18 + (cardWidth + 3) * 2, y, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('READINESS PERCENTILE', 22 + (cardWidth + 3) * 2, y + 6);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6); // amber-600
  const topPercent = 100 - (report.readinessPercentile || 85);
  doc.text(`Top ${topPercent}%`, 22 + (cardWidth + 3) * 2, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Calibrated vs Senior Applicants', 22 + (cardWidth + 3) * 2, y + 19);

  y += cardHeight + 7;

  // 3. EXECUTIVE EVALUATION SUMMARY
  y = ensureSpace(doc, y, 25);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('1. EXECUTIVE SUMMARY & HIRING SYNTHESIS', 18, y);
  y += 5;

  doc.setFillColor(250, 250, 249); // stone-50
  doc.setDrawColor(231, 229, 228); // stone-200
  // Left border accent
  const summaryBoxY = y;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(report.executiveSummary, contentWidth - 12);
  const summaryHeight = summaryLines.length * 4.6 + 6;

  doc.roundedRect(18, summaryBoxY, contentWidth, summaryHeight, 2, 2, 'FD');
  doc.setFillColor(99, 102, 241); // indigo-500 line
  doc.rect(18, summaryBoxY, 2, summaryHeight, 'F');

  y = summaryBoxY + 5;
  for (const line of summaryLines) {
    doc.text(line, 24, y);
    y += 4.6;
  }
  y += 6;

  // 4. 5-PILLAR COMPETENCY BENCHMARKS
  y = ensureSpace(doc, y, 40);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('2. 5-PILLAR COMPETENCY BENCHMARKS', 18, y);
  y += 5;

  if (report.pillarBreakdown && report.pillarBreakdown.length > 0) {
    for (const p of report.pillarBreakdown) {
      y = ensureSpace(doc, y, 16);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(18, y, contentWidth, 14, 2, 2, 'FD');

      // Pillar Name & Score
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(p.name, 22, y + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(p.score >= 85 ? 5 : 217, p.score >= 85 ? 150 : 119, p.score >= 85 ? 105 : 6);
      doc.text(`${p.score}%`, pageWidth - 23, y + 4.8, { align: 'right' });

      // Target benchmark text
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Target: ${p.benchmarkSenior || 85}%`, pageWidth - 35, y + 4.8, { align: 'right' });

      // Progress bar
      const barWidth = contentWidth - 8;
      const progressWidth = Math.max(4, (p.score / 100) * barWidth);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(22, y + 6.5, barWidth, 1.8, 0.8, 0.8, 'F');
      doc.setFillColor(p.score >= 85 ? 16 : 245, p.score >= 85 ? 185 : 158, p.score >= 85 ? 129 : 11);
      doc.roundedRect(22, y + 6.5, progressWidth, 1.8, 0.8, 0.8, 'F');

      // Pillar summary
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(p.summary || '', 22, y + 11.5);

      y += 16;
    }
    y += 2;
  }

  // 5. DEMONSTRATED STRENGTHS & AREAS TO SHARPEN
  y = ensureSpace(doc, y, 35);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('3. DEMONSTRATED STRENGTHS', 18, y);
  y += 5;

  if (report.strengths && report.strengths.length > 0) {
    for (const s of report.strengths) {
      y = ensureSpace(doc, y, 10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105); // emerald
      doc.text('•', 22, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      y = addWrappedText(doc, s, 26, y, contentWidth - 10, 4.4);
      y += 1.5;
    }
    y += 3;
  }

  y = ensureSpace(doc, y, 35);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('4. TARGET AREAS TO SHARPEN FOR STAFF TIER', 18, y);
  y += 5;

  if (report.areasToSharpen && report.areasToSharpen.length > 0) {
    for (const a of report.areasToSharpen) {
      y = ensureSpace(doc, y, 10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(217, 119, 6); // amber
      doc.text('•', 22, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      y = addWrappedText(doc, a, 26, y, contentWidth - 10, 4.4);
      y += 1.5;
    }
    y += 3;
  }

  // 6. RESUME POSITIONING & NOVALYTE AI LEVERAGE
  if (report.resumeLeverageAdvice && report.resumeLeverageAdvice.length > 0) {
    y = ensureSpace(doc, y, 35);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('5. RESUME POSITIONING & STORYTELLING ADVICE (NOVALYTE AI / ZENDESK)', 18, y);
    y += 5;

    for (const r of report.resumeLeverageAdvice) {
      y = ensureSpace(doc, y, 14);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(67, 56, 202);
      doc.text(`[${r.topic}]:`, 22, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      y = addWrappedText(doc, r.advice, 22, y + 4, contentWidth - 6, 4.4);
      y += 2.5;
    }
    y += 2;
  }

  // 7. RECOMMENDED 7-DAY ACTION PLAN
  if (report.sevenDayActionPlan && report.sevenDayActionPlan.length > 0) {
    y = ensureSpace(doc, y, 35);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('6. RECOMMENDED 7-DAY PREPARATION SPRINT', 18, y);
    y += 5;

    for (const day of report.sevenDayActionPlan) {
      y = ensureSpace(doc, y, 12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${day.day} (${day.focus}):`, 22, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      y = addWrappedText(doc, day.recommendedExercise, 22, y + 4, contentWidth - 6, 4.4);
      y += 2;
    }
  }

  // Add Headers and Footers to all pages
  addHeadersAndFooters(doc, 'GTM SYSTEMS ENGINEER BENCHMARK REPORT');

  // Save / Download PDF
  const safeTitle = (sessionTitle || 'Session_Report')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 32);
  const fileName = `Jamil_Yakasai_GTM_Report_${safeTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Generates and downloads a formal PDF version of a full MockInterviewSession with answers & evaluations
 */
export function downloadFullSessionPDF(session: MockInterviewSession) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 36;
  let y = 20;

  // Header Badge
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(18, y, 66, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(67, 56, 202);
  doc.text('GTM DRILL RECORD • CANDIDATE DOSSIER', 22, y + 4.8);
  y += 12;

  // Title
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(session.title || 'Technical Practice Session', 18, y);
  y += 6;

  // Meta
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const sessionDate = new Date(session.date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Candidate: Jamil Yakasai  |  Difficulty: ${session.difficulty}  |  Date: ${sessionDate}`, 18, y);
  y += 5;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(18, y, pageWidth - 18, y);
  y += 6;

  // Key KPI Cards
  const sessionAnswers = session.answers || (session as any).questionsAnswered || [];
  const cardWidth = (contentWidth - 6) / 3;
  const cardHeight = 20;

  // Score
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(18, y, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('AVERAGE EVALUATION', 22, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(67, 56, 202);
  doc.text(`${session.averageScore}%`, 22, y + 13);

  // Volume
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(18 + cardWidth + 3, y, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('QUESTIONS DRILLED', 22 + cardWidth + 3, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`${sessionAnswers.length}`, 22 + cardWidth + 3, y + 13);

  // Duration
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(18 + (cardWidth + 3) * 2, y, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DURATION', 22 + (cardWidth + 3) * 2, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const mins = Math.round((session.durationSeconds || 0) / 60);
  doc.text(`${mins} mins`, 22 + (cardWidth + 3) * 2, y + 13);

  y += cardHeight + 7;

  // Reflections / Takeaways if any
  if (session.keyTakeaways?.length || session.reflections) {
    y = ensureSpace(doc, y, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('POST-INTERVIEW REFLECTIONS & TAKEAWAYS', 18, y);
    y += 5;

    if (session.keyTakeaways?.length) {
      for (const t of session.keyTakeaways) {
        y = ensureSpace(doc, y, 8);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(217, 119, 6);
        doc.text('💡', 22, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        y = addWrappedText(doc, t, 28, y, contentWidth - 12, 4.4);
        y += 1.5;
      }
    }

    if (session.reflections) {
      y = ensureSpace(doc, y, 12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(71, 85, 105);
      y = addWrappedText(doc, `Notes: "${session.reflections}"`, 22, y, contentWidth - 8, 4.4);
      y += 2;
    }
    y += 3;
  }

  // Questions Detail
  y = ensureSpace(doc, y, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('QUESTIONS & RUBRIC EVALUATIONS', 18, y);
  y += 5;

  sessionAnswers.forEach((q: CandidateAnswerRecord, idx: number) => {
    y = ensureSpace(doc, y, 35);

    // Question Title Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(18, y, contentWidth, 8, 1.5, 1.5, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Question ${idx + 1}: ${q.question?.title || 'Technical Architecture Scenario'}`, 22, y + 5.5);

    const score = q.evaluation?.overallScore || 0;
    doc.setTextColor(score >= 85 ? 5 : 217, score >= 85 ? 150 : 119, score >= 85 ? 105 : 6);
    doc.text(`${score}% (${q.evaluation?.letterGrade || 'B'})`, pageWidth - 23, y + 5.5, { align: 'right' });
    y += 12;

    // Prompt
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('SCENARIO PROMPT:', 22, y);
    y += 3.8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    y = addWrappedText(doc, q.question?.question || '', 22, y, contentWidth - 8, 4.2);
    y += 3;

    // Candidate Answer
    y = ensureSpace(doc, y, 16);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text('JAMIL\'S RECORDED ANSWER:', 22, y);
    y += 3.8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    y = addWrappedText(doc, q.candidateAnswer || '[No verbal response transcribed]', 22, y, contentWidth - 8, 4.2);
    y += 3;

    // Rubric feedback
    if (q.evaluation) {
      if (q.evaluation.keyStrengths?.length) {
        y = ensureSpace(doc, y, 10);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text('Top Demonstrated Strength: ', 22, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        y = addWrappedText(doc, q.evaluation.keyStrengths[0], 22, y + 3.5, contentWidth - 8, 4.2);
        y += 2;
      }

      if (q.evaluation.blindSpotsAndMissedEdgeCases?.length) {
        y = ensureSpace(doc, y, 10);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(217, 119, 6);
        doc.text('Missed Edge Case / Blind Spot: ', 22, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        y = addWrappedText(doc, q.evaluation.blindSpotsAndMissedEdgeCases[0], 22, y + 3.5, contentWidth - 8, 4.2);
        y += 2;
      }
    }

    // Divider
    y = ensureSpace(doc, y, 8);
    doc.setDrawColor(241, 245, 249);
    doc.line(18, y, pageWidth - 18, y);
    y += 6;
  });

  addHeadersAndFooters(doc, `GTM SESSION RECORD: ${session.title.toUpperCase()}`);

  const safeTitle = (session.title || 'GTM_Session')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 32);
  const fileName = `Jamil_Yakasai_GTM_Session_${safeTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
