import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptApi } from '../../api/attemptApi';
import { assessmentApi } from '../../api/assessmentApi';
import { questionApi } from '../../api/questionApi';
import { Attempt, Assessment, Question, Answer } from '../../types';
import {
  Button,
  Card,
  Badge,
  ConfirmDialog,
  LoadingSpinner,
  Textarea,
  Input,
} from '../../components/ui';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { formatSecondsToTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AssessmentTakingPage: React.FC = () => {
  const { accessCode, attemptId } = useParams<{ accessCode: string; attemptId: string }>();
  const navigate = useNavigate();
  const { warning: toastWarning } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);

  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial attempt and assessment data
  useEffect(() => {
    const loadAttemptData = async () => {
      if (!attemptId || !accessCode) return;
      setIsLoading(true);
      try {
        const att = await attemptApi.getAttempt(attemptId);
        const asm = await assessmentApi.getByAccessCode(accessCode);
        const qList = await questionApi.getByAssessmentId(asm.id);

        if (att.status === 'COMPLETED') {
          // Already completed, navigate to result
          navigate(`/test/${accessCode}/result/${attemptId}`, { replace: true });
          return;
        }

        setAttempt(att);
        setAssessment(asm);
        setQuestions(qList);
        setAnswers(att.answers || {});

        // Compute remaining time
        if (asm.settings.timeLimitMinutes > 0) {
          const totalLimitSec = asm.settings.timeLimitMinutes * 60;
          const elapsedSec = Math.floor((Date.now() - new Date(att.startedAt).getTime()) / 1000);
          const remaining = Math.max(0, totalLimitSec - elapsedSec);
          setRemainingSeconds(remaining);
          setTimeSpentSeconds(elapsedSec);
        } else {
          setRemainingSeconds(null);
        }
      } catch {
        navigate(`/test/${accessCode}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttemptData();
  }, [attemptId, accessCode, navigate]);

  // Anti-cheat tab switch monitoring
  useEffect(() => {
    if (!assessment?.settings.enableAntiCheatWarnings || !attemptId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        attemptApi.recordTabSwitch(attemptId);
        toastWarning(
          'Warning: Tab switch recorded. Please keep focus on this examination window.',
          'Anti-Cheat Alert'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [assessment, attemptId, toastWarning]);

  // Route & Window Leave Guard: Prevent accidental exit / reload during active exam
  useEffect(() => {
    if (isLoading || isSubmitting || !attempt || attempt.status !== 'IN_PROGRESS') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an active examination in progress. Are you sure you want to exit?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoading, isSubmitting, attempt]);

  // Final submit handler
  const handleSubmit = useCallback(
    async (isAuto = false) => {
      if (!attemptId || isSubmitting) return;
      setIsSubmitting(true);
      try {
        await attemptApi.submitAttempt(attemptId, timeSpentSeconds);
        navigate(`/test/${accessCode}/result/${attemptId}`, { replace: true });
      } catch (err: any) {
        console.error('Submit error', err);
        setIsSubmitting(false);
      }
    },
    [attemptId, accessCode, timeSpentSeconds, isSubmitting, navigate]
  );

  // Timer Tick
  useEffect(() => {
    if (isLoading || isSubmitting) return;

    timerRef.current = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);

      if (remainingSeconds !== null) {
        setRemainingSeconds((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(true); // Auto-submit on time expiry
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, isSubmitting, remainingSeconds, handleSubmit]);

  // Answer modification handlers
  const handleSelectOption = (questionId: string, optionId: string, isSingle: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] || { questionId, selectedOptionIds: [] };
      let newSelected: string[];

      if (isSingle) {
        newSelected = [optionId];
      } else {
        const set = new Set(current.selectedOptionIds || []);
        if (set.has(optionId)) set.delete(optionId);
        else set.add(optionId);
        newSelected = Array.from(set);
      }

      const updated: Answer = {
        ...current,
        questionId,
        selectedOptionIds: newSelected,
      };

      // Persist to storage
      if (attemptId) {
        attemptApi.saveAnswer(attemptId, updated);
      }

      return { ...prev, [questionId]: updated };
    });
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || { questionId };
      const updated: Answer = {
        ...current,
        questionId,
        textAnswer: text,
      };

      if (attemptId) {
        attemptApi.saveAnswer(attemptId, updated);
      }

      return { ...prev, [questionId]: updated };
    });
  };

  const toggleMarkForReview = (questionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || { questionId };
      const updated: Answer = {
        ...current,
        questionId,
        isMarkedForReview: !current.isMarkedForReview,
      };

      if (attemptId) {
        attemptApi.saveAnswer(attemptId, updated);
      }

      return { ...prev, [questionId]: updated };
    });
  };

  if (isLoading || !assessment || questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <LoadingSpinner size="lg" label="Loading test questions & environment..." />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];

  // Answer statistics
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (a.selectedOptionIds && a.selectedOptionIds.length > 0) return true;
    if (a.textAnswer && a.textAnswer.trim().length > 0) return true;
    return false;
  }).length;

  const unansweredCount = questions.length - answeredCount;

  const isTimerUrgent = remainingSeconds !== null && remainingSeconds < 180; // Less than 3 mins

  return (
    <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Sticky Assessment Header Bar */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {assessment.title}
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="text-xs font-normal text-slate-400">
              ({currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          {remainingSeconds !== null && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
                isTimerUrgent
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatSecondsToTime(remainingSeconds)}</span>
            </div>
          )}

          {/* Question Palette Toggle for mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
            leftIcon={<LayoutGrid className="w-4 h-4 text-slate-500" />}
            className="hidden sm:inline-flex"
          >
            Palette ({answeredCount}/{questions.length})
          </Button>

          {/* Submit Trigger */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowSubmitConfirm(true)}
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            Finish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Question Interface Card (Cols 1-3) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-6 sm:p-8 border-slate-200 shadow-md">
            {/* Question Top Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="md">
                  {currentQuestion.type.replace('_', ' ')}
                </Badge>
                {currentQuestion.isRequired && (
                  <Badge variant="neutral" size="sm">
                    Required
                  </Badge>
                )}
              </div>

              {/* Mark for Review Toggle */}
              <button
                type="button"
                onClick={() => toggleMarkForReview(currentQuestion.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  currentAnswer?.isMarkedForReview
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Flag
                  className={`w-3.5 h-3.5 ${
                    currentAnswer?.isMarkedForReview ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                  }`}
                />
                <span>
                  {currentAnswer?.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
                </span>
              </button>
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed mb-8">
              {currentQuestion.text}
            </h2>

            {/* Options / Inputs based on Question Type */}
            <div className="space-y-3">
              {/* Single Choice & True/False */}
              {(currentQuestion.type === 'SINGLE_CHOICE' || currentQuestion.type === 'TRUE_FALSE') && (
                <div className="space-y-2.5">
                  {currentQuestion.options?.map((opt, idx) => {
                    const isSelected = currentAnswer?.selectedOptionIds?.includes(opt.id);
                    const letter = String.fromCharCode(65 + idx);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQuestion.id, opt.id, true)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 select-none touch-target ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-colors shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {letter}
                        </div>
                        <div className="text-sm sm:text-base leading-snug flex-1">{opt.text}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Multiple Choice */}
              {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2.5">
                  <div className="text-xs text-slate-500 font-medium mb-1">
                    Select all options that apply:
                  </div>
                  {currentQuestion.options?.map((opt, idx) => {
                    const isSelected = currentAnswer?.selectedOptionIds?.includes(opt.id);
                    const letter = String.fromCharCode(65 + idx);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQuestion.id, opt.id, false)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 select-none touch-target ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-colors shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {letter}
                        </div>
                        <div className="text-sm sm:text-base leading-snug flex-1">{opt.text}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Short Answer */}
              {currentQuestion.type === 'SHORT_ANSWER' && (
                <div className="space-y-2">
                  <Input
                    placeholder="Type your concise response here..."
                    value={currentAnswer?.textAnswer || ''}
                    onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                    className="text-base py-3"
                  />
                  <p className="text-xs text-slate-400">
                    Your response will be checked against key concepts upon grading.
                  </p>
                </div>
              )}

              {/* Long Answer */}
              {currentQuestion.type === 'LONG_ANSWER' && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your comprehensive analysis here..."
                    rows={6}
                    value={currentAnswer?.textAnswer || ''}
                    onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                    className="text-base p-4"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Be descriptive and include relevant examples.</span>
                    <span>{(currentAnswer?.textAnswer || '').length} characters</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Question Controls */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="text-xs text-slate-500 font-medium">
                {answeredCount} of {questions.length} Answered
              </div>

              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowSubmitConfirm(true)}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Review & Submit
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar Question Palette (Col 4) */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900">Question Palette</h3>
              <span className="text-xs font-semibold text-slate-500">
                {answeredCount}/{questions.length}
              </span>
            </div>

            {/* Grid of question number tiles */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered =
                  (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
                  (ans?.textAnswer && ans.textAnswer.trim().length > 0);
                const isMarked = ans?.isMarkedForReview;
                const isCurrent = currentIndex === idx;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-full aspect-square rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 ring-offset-2'
                        : ''
                    } ${
                      isMarked
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isAnswered
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                    {isMarked && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-600 shrink-0" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300 shrink-0" />
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-slate-100 shrink-0" />
                <span>Unanswered</span>
              </div>
            </div>

            <div className="mt-5">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                onClick={() => setShowSubmitConfirm(true)}
              >
                Submit Exam
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Submit Dialog */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={() => {
          setShowSubmitConfirm(false);
          handleSubmit(false);
        }}
        title="Ready to Submit Assessment?"
        message={
          <div className="space-y-2 text-xs sm:text-sm">
            <p>
              You have answered <span className="font-bold text-slate-900">{answeredCount}</span> of{' '}
              <span className="font-bold text-slate-900">{questions.length}</span> questions.
            </p>
            {unansweredCount > 0 && (
              <p className="text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                ⚠️ You still have <strong>{unansweredCount} unanswered</strong>{' '}
                {unansweredCount === 1 ? 'question' : 'questions'}. Are you sure you want to finalize now?
              </p>
            )}
            <p className="text-slate-500 text-xs">
              Once submitted, your responses are final and cannot be modified.
            </p>
          </div>
        }
        confirmLabel="Yes, Submit Test"
        cancelLabel="Continue Reviewing"
        isLoading={isSubmitting}
      />
    </div>
  );
};
