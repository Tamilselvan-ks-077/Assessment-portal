import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resultApi, ResultDetails } from '../../api/resultApi';
import { Button, Card, Badge, LoadingSpinner } from '../../components/ui';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  RotateCcw,
  Home,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { formatSecondsToTime, formatDateTime } from '../../utils/formatters';
import confetti from 'canvas-confetti';

export const TestResultPage: React.FC = () => {
  const { accessCode, attemptId } = useParams<{ accessCode: string; attemptId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ResultDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!attemptId) return;
      setIsLoading(true);
      try {
        const res = await resultApi.getResult(attemptId);
        setData(res);

        // Fire celebratory confetti if test passed!
        if (res.attempt.isPassed) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err: any) {
        setError(err.message || 'Could not load examination result');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <LoadingSpinner size="lg" label="Tabulating scores and performance report..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Result Not Available</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const { attempt, assessment, questions } = data;

  // Calculate stats
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  Object.values(attempt.answers || {}).forEach((a) => {
    if (a.isCorrect) correctCount++;
    else if (
      (a.selectedOptionIds && a.selectedOptionIds.length > 0) ||
      (a.textAnswer && a.textAnswer.trim().length > 0)
    ) {
      incorrectCount++;
    } else {
      unansweredCount++;
    }
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
      {/* Result Hero Card */}
      <Card className="p-6 sm:p-10 border-slate-200 shadow-xl overflow-hidden relative">
        {/* Top ribbon banner */}
        <div
          className={`absolute top-0 inset-x-0 h-2.5 ${
            attempt.isPassed ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="text-center sm:text-left space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assessment Report • {assessment.category}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {assessment.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Candidate: <span className="font-semibold text-slate-800">{attempt.participant.name}</span>{' '}
              ({attempt.participant.email})
            </p>
          </div>

          {/* Big Pass/Fail Badge */}
          <div className="flex flex-col items-center">
            <div
              className={`w-28 h-28 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg border ${
                attempt.isPassed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100'
              }`}
            >
              <span className="text-3xl font-black">{attempt.scorePercentage}%</span>
              <span className="text-xs font-bold uppercase tracking-wider mt-0.5">
                {attempt.isPassed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Score Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Score Earned
            </div>
            <div className="text-xl font-bold text-slate-900">
              {attempt.earnedMarks} / {attempt.totalMarks}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Marks total</div>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center">
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              Correct
            </div>
            <div className="text-xl font-bold text-emerald-700">{correctCount}</div>
            <div className="text-[11px] text-emerald-600/80 mt-0.5">Answers</div>
          </div>

          <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-center">
            <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
              Incorrect / Skipped
            </div>
            <div className="text-xl font-bold text-rose-700">{incorrectCount + unansweredCount}</div>
            <div className="text-[11px] text-rose-600/80 mt-0.5">Answers</div>
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              Time Taken
            </div>
            <div className="text-xl font-bold text-indigo-900">
              {formatSecondsToTime(attempt.timeSpentSeconds)}
            </div>
            <div className="text-[11px] text-indigo-600/80 mt-0.5">Total duration</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm" leftIcon={<Home className="w-4 h-4" />}>
                Home
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print Report
            </Button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/test/${accessCode}/start`)}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Retake Assessment
          </Button>
        </div>
      </Card>

      {/* Answer Review Section (When allowed by assessment settings) */}
      {assessment.settings.allowAnswerReview && questions && questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Detailed Question Review
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Review correct answers & explanations
            </span>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const ans = attempt.answers[q.id];
              const isCorrect = ans?.isCorrect;
              const isExpanded = expandedQuestionId === q.id;

              return (
                <Card
                  key={q.id}
                  className={`border transition-all ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : 'border-rose-200 bg-rose-50/10'
                  }`}
                >
                  <div
                    onClick={() =>
                      setExpandedQuestionId(isExpanded ? null : q.id)
                    }
                    className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                          <span>Question {idx + 1}</span>
                          <span>•</span>
                          <span
                            className={
                              isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'
                            }
                          >
                            {ans?.marksAwarded || 0} / {q.marks} Marks
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                          {q.text}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Explanation & Options */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs sm:text-sm animate-fade-in">
                      {/* Options breakdown */}
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <div className="font-semibold text-slate-700 mb-2">Options:</div>
                          {q.options.map((opt) => {
                            const isChosen = ans?.selectedOptionIds?.includes(opt.id);
                            const isActuallyCorrect =
                              opt.isCorrect || q.correctAnswers?.includes(opt.id);

                            let rowStyle = 'bg-slate-50 text-slate-700 border-slate-200';
                            if (isActuallyCorrect) {
                              rowStyle = 'bg-emerald-100/70 border-emerald-300 text-emerald-950 font-semibold';
                            } else if (isChosen && !isActuallyCorrect) {
                              rowStyle = 'bg-rose-100/70 border-rose-300 text-rose-950 font-semibold';
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${rowStyle}`}
                              >
                                <span>{opt.text}</span>
                                <div className="flex items-center gap-1.5 text-xs">
                                  {isChosen && (
                                    <span className="px-2 py-0.5 rounded bg-slate-900/10 font-bold">
                                      Your choice
                                    </span>
                                  )}
                                  {isActuallyCorrect && (
                                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                                      Correct
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Text answer review */}
                      {ans?.textAnswer && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <div className="font-semibold text-slate-500 text-xs">Your Answer:</div>
                          <div className="text-slate-900 font-mono text-xs">{ans.textAnswer}</div>
                        </div>
                      )}

                      {/* Explanation box */}
                      {q.explanation && (
                        <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-1 text-indigo-950">
                          <div className="font-bold text-xs flex items-center gap-1.5 text-indigo-700">
                            <Sparkles className="w-3.5 h-3.5" /> Explanation
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
