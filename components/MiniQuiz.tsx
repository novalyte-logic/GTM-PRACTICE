'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Zap, 
  Lightbulb, 
  Info,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, QuizOption } from '@/lib/guided-steps-data';

interface MiniQuizProps {
  quizzes: QuizQuestion[];
  stepNumber: number;
  stepTitle?: string;
  topicCategory?: string;
  compact?: boolean;
  onQuizCompleted?: (stepNumber: number, correctCount: number, totalQuestions: number) => void;
  savedAnswers?: Record<string, string>; // questionId -> optionId
  onSaveAnswer?: (questionId: string, optionId: string, isCorrect: boolean) => void;
}

export const MiniQuiz: React.FC<MiniQuizProps> = ({
  quizzes,
  stepNumber,
  stepTitle,
  topicCategory,
  compact = false,
  onQuizCompleted,
  savedAnswers = {},
  onSaveAnswer
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});

  // Merge saved answers with local user selections
  const answers = { ...savedAnswers, ...localAnswers };

  const currentQ = quizzes[currentQuestionIndex] || quizzes[0];
  const selectedOptionId = answers[currentQ?.id];
  const hasAnsweredCurrent = !!selectedOptionId;

  // Calculate score for this step
  const answeredCount = quizzes.filter((q) => !!answers[q.id]).length;
  const correctCount = quizzes.filter((q) => {
    const chosenId = answers[q.id];
    const option = q.options.find((o) => o.id === chosenId);
    return option?.isCorrect === true;
  }).length;

  const isAllAnswered = answeredCount === quizzes.length;

  const handleSelectOption = (question: QuizQuestion, option: QuizOption) => {
    if (answers[question.id]) return; // prevent changing after answer

    const newLocal = { ...localAnswers, [question.id]: option.id };
    setLocalAnswers(newLocal);
    const combinedAnswers = { ...answers, [question.id]: option.id };

    if (onSaveAnswer) {
      onSaveAnswer(question.id, option.id, option.isCorrect);
    }

    if (option.isCorrect) {
      try {
        confetti({
          particleCount: compact ? 30 : 45,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#f59e0b']
        });
      } catch (_) {}
    }

    // Check if all answered now
    const newAnsweredCount = quizzes.filter((q) => !!combinedAnswers[q.id]).length;
    if (newAnsweredCount === quizzes.length && onQuizCompleted) {
      const newCorrectCount = quizzes.filter((q) => {
        const chosenId = combinedAnswers[q.id];
        const opt = q.options.find((o) => o.id === chosenId);
        return opt?.isCorrect === true;
      }).length;
      onQuizCompleted(stepNumber, newCorrectCount, quizzes.length);
    }
  };

  const handleReset = () => {
    const updated = { ...localAnswers };
    quizzes.forEach((q) => {
      delete updated[q.id];
    });
    setLocalAnswers(updated);
    setCurrentQuestionIndex(0);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizzes.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const currentOption = currentQ?.options.find((o) => o.id === selectedOptionId);
  const isCurrentCorrect = currentOption?.isCorrect ?? false;

  return (
    <div className={`rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 sm:p-4 space-y-3 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Quiz Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-indigo-100/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-indigo-600 text-white font-extrabold text-[11px] shadow-2xs">
            Q
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-indigo-950">
                Knowledge Check (Mini Quiz)
              </span>
              {topicCategory && (
                <span className="hidden sm:inline-block rounded-md bg-indigo-100/90 text-indigo-800 text-[10px] font-bold px-2 py-0.2 border border-indigo-200">
                  {topicCategory}
                </span>
              )}
            </div>
            <p className="text-[10px] text-stone-500 font-medium">
              3 Questions on this topic &bull; Question {currentQuestionIndex + 1} of {quizzes.length}
            </p>
          </div>
        </div>

        {/* Question Selector Tabs / Dots */}
        <div className="flex items-center gap-1">
          {quizzes.map((q, idx) => {
            const isQAnswered = !!answers[q.id];
            const isQCorrect = q.options.find((o) => o.id === answers[q.id])?.isCorrect;
            const isCurrent = idx === currentQuestionIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                title={`Go to Question ${idx + 1}`}
                className={`flex h-6 min-w-6 items-center justify-center rounded-lg px-1.5 text-[11px] font-bold transition ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-300'
                    : isQAnswered
                    ? isQCorrect
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-indigo-50'
                }`}
              >
                {isQAnswered ? (
                  isQCorrect ? '✓' : '✗'
                ) : (
                  idx + 1
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Title */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-700">
          <span>Question {currentQuestionIndex + 1} of {quizzes.length}</span>
          <span className="text-stone-500 font-medium">
            Score: <strong className="text-indigo-700 font-bold">{correctCount}/{quizzes.length}</strong>
          </span>
        </div>
        <p className="text-xs sm:text-[13px] font-bold text-stone-900 leading-snug">
          {currentQ.question}
        </p>
      </div>

      {/* Multiple Choice Options List */}
      <div className="space-y-1.5 pt-0.5">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          let buttonClass = 'border-stone-200 bg-white text-stone-800 hover:border-indigo-300 hover:bg-indigo-50/40';

          if (hasAnsweredCurrent) {
            if (opt.isCorrect) {
              buttonClass = 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold shadow-2xs';
            } else if (isSelected && !opt.isCorrect) {
              buttonClass = 'border-rose-300 bg-rose-50 text-rose-950';
            } else {
              buttonClass = 'border-stone-200 bg-white/60 text-stone-400 opacity-60';
            }
          }

          return (
            <button
              key={opt.id}
              disabled={hasAnsweredCurrent}
              onClick={() => handleSelectOption(currentQ, opt)}
              className={`w-full text-left rounded-xl p-2.5 sm:p-3 text-xs border transition flex items-start gap-2.5 ${buttonClass}`}
            >
              <div className="pt-0.5 shrink-0">
                {hasAnsweredCurrent && opt.isCorrect && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                {hasAnsweredCurrent && isSelected && !opt.isCorrect && (
                  <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                )}
                {!hasAnsweredCurrent && (
                  <span className="flex h-4 w-4 rounded-full border border-stone-300 shrink-0" />
                )}
              </div>
              <span className="leading-snug">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Immediate Explanation Feedback */}
      {hasAnsweredCurrent && (
        <div className={`rounded-xl p-3 text-xs space-y-1 animate-in fade-in ${
          isCurrentCorrect
            ? 'bg-emerald-100/75 border border-emerald-200 text-emerald-950'
            : 'bg-rose-100/75 border border-rose-200 text-rose-950'
        }`}>
          <div className="font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  <span>Correct! +10 Mastery Points</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rose-700" />
                  <span>Key Architectural Concept:</span>
                </>
              )}
            </span>
            <span className="text-[10px] opacity-75 font-normal">
              {isCurrentCorrect ? 'Spot On' : 'Review Note'}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed font-medium">
            {currentOption?.explanation || currentQ.options.find((o) => o.isCorrect)?.explanation}
          </p>
        </div>
      )}

      {/* Pagination & Navigation Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-indigo-100 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={handlePrev}
            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-stone-700 hover:bg-stone-100 disabled:opacity-30 transition flex items-center gap-0.5 text-[11px] font-semibold"
          >
            <ChevronLeft className="h-3 w-3" />
            <span>Prev Q</span>
          </button>
          <button
            disabled={currentQuestionIndex === quizzes.length - 1}
            onClick={handleNext}
            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-stone-700 hover:bg-stone-100 disabled:opacity-30 transition flex items-center gap-0.5 text-[11px] font-semibold"
          >
            <span>Next Q</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isAllAnswered && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
              <Award className="h-3 w-3" />
              <span>Step {stepNumber} Quiz Completed ({correctCount}/{quizzes.length})</span>
            </span>
          )}

          {answeredCount > 0 && (
            <button
              onClick={handleReset}
              className="text-[10px] text-stone-500 hover:text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>Retry Step {stepNumber}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
