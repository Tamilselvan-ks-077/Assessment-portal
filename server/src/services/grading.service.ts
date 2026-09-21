export interface QuestionForGrading {
  id: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER';
  marks: number;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string | null;
}

export interface UserAnswerInput {
  questionId: string;
  selectedOptionIds?: string[];
  textAnswer?: string | null;
  isMarkedForReview?: boolean;
}

export interface GradedAnswerResult {
  questionId: string;
  selectedOptionIds: string[];
  textAnswer: string | null;
  isCorrect: boolean;
  marksAwarded: number;
  isMarkedForReview: boolean;
}

export interface GradingSummary {
  totalMarks: number;
  earnedMarks: number;
  scorePercentage: number;
  isPassed: boolean;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  gradedAnswers: Record<string, GradedAnswerResult>;
}

export class GradingService {
  gradeAssessment(
    questions: QuestionForGrading[],
    answers: Record<string, UserAnswerInput>,
    passingScorePercentage = 70
  ): GradingSummary {
    let totalMarks = 0;
    let earnedMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const gradedAnswers: Record<string, GradedAnswerResult> = {};

    for (const question of questions) {
      totalMarks += question.marks || 1;
      const userAns = answers[question.id];

      if (!userAns || (
        (!userAns.selectedOptionIds || userAns.selectedOptionIds.length === 0) &&
        (!userAns.textAnswer || userAns.textAnswer.trim() === '')
      )) {
        unansweredCount++;
        gradedAnswers[question.id] = {
          questionId: question.id,
          selectedOptionIds: userAns?.selectedOptionIds || [],
          textAnswer: userAns?.textAnswer || null,
          isCorrect: false,
          marksAwarded: 0,
          isMarkedForReview: userAns?.isMarkedForReview || false,
        };
        continue;
      }

      const { isCorrect, marksAwarded } = this.gradeQuestion(question, userAns);

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      earnedMarks += marksAwarded;

      gradedAnswers[question.id] = {
        questionId: question.id,
        selectedOptionIds: userAns.selectedOptionIds || [],
        textAnswer: userAns.textAnswer || null,
        isCorrect,
        marksAwarded,
        isMarkedForReview: userAns.isMarkedForReview || false,
      };
    }

    const safeTotalMarks = totalMarks > 0 ? totalMarks : 1;
    const scorePercentage = Math.round((earnedMarks / safeTotalMarks) * 1000) / 10; // 1 decimal place
    const isPassed = scorePercentage >= passingScorePercentage;

    return {
      totalMarks,
      earnedMarks,
      scorePercentage,
      isPassed,
      correctCount,
      incorrectCount,
      unansweredCount,
      totalQuestions: questions.length,
      gradedAnswers,
    };
  }

  private gradeQuestion(
    question: QuestionForGrading,
    userAns: UserAnswerInput
  ): { isCorrect: boolean; marksAwarded: number } {
    const marks = question.marks || 1;

    switch (question.type) {
      case 'SINGLE_CHOICE':
      case 'TRUE_FALSE': {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        const selectedId = userAns.selectedOptionIds?.[0];
        const isCorrect = !!correctOption && selectedId === correctOption.id;
        return {
          isCorrect,
          marksAwarded: isCorrect ? marks : 0,
        };
      }

      case 'MULTIPLE_CHOICE': {
        const correctOptionIds = new Set(
          question.options.filter((opt) => opt.isCorrect).map((opt) => opt.id)
        );
        const selectedIds = new Set(userAns.selectedOptionIds || []);

        const isExactMatch =
          correctOptionIds.size === selectedIds.size &&
          [...correctOptionIds].every((id) => selectedIds.has(id));

        return {
          isCorrect: isExactMatch,
          marksAwarded: isExactMatch ? marks : 0,
        };
      }

      case 'SHORT_ANSWER': {
        const userText = (userAns.textAnswer || '').trim().toLowerCase();
        if (!userText) {
          return { isCorrect: false, marksAwarded: 0 };
        }

        // Check against correct options text
        const correctTexts = question.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => opt.text.trim().toLowerCase());

        const isMatch =
          correctTexts.length > 0
            ? correctTexts.some((ct) => ct === userText || userText.includes(ct))
            : userText.length > 2; // Default heuristic if no explicit correct options set

        return {
          isCorrect: isMatch,
          marksAwarded: isMatch ? marks : 0,
        };
      }

      case 'LONG_ANSWER': {
        const text = (userAns.textAnswer || '').trim();
        // Server auto-grades if meaningful content provided (> 15 chars)
        const isAcceptable = text.length >= 15;
        return {
          isCorrect: isAcceptable,
          marksAwarded: isAcceptable ? marks : 0,
        };
      }

      default:
        return { isCorrect: false, marksAwarded: 0 };
    }
  }
}
