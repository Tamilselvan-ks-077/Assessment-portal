import { GradingService } from '../src/services/grading.service';

describe('GradingService', () => {
  const gradingService = new GradingService();

  it('should accurately grade SINGLE_CHOICE questions', () => {
    const questions: any[] = [
      {
        id: 'q1',
        type: 'SINGLE_CHOICE',
        marks: 2,
        options: [
          { id: 'opt1', text: 'Option A', isCorrect: false },
          { id: 'opt2', text: 'Option B', isCorrect: true },
        ],
      },
    ];

    const correctAns = {
      q1: { questionId: 'q1', selectedOptionIds: ['opt2'] },
    };
    const result1 = gradingService.gradeAssessment(questions, correctAns, 70);
    expect(result1.earnedMarks).toBe(2);
    expect(result1.scorePercentage).toBe(100);
    expect(result1.isPassed).toBe(true);
    expect(result1.correctCount).toBe(1);

    const incorrectAns = {
      q1: { questionId: 'q1', selectedOptionIds: ['opt1'] },
    };
    const result2 = gradingService.gradeAssessment(questions, incorrectAns, 70);
    expect(result2.earnedMarks).toBe(0);
    expect(result2.scorePercentage).toBe(0);
    expect(result2.isPassed).toBe(false);
    expect(result2.incorrectCount).toBe(1);
  });

  it('should accurately grade MULTIPLE_CHOICE questions requiring all correct options', () => {
    const questions: any[] = [
      {
        id: 'q2',
        type: 'MULTIPLE_CHOICE',
        marks: 4,
        options: [
          { id: 'opt1', text: 'Correct 1', isCorrect: true },
          { id: 'opt2', text: 'Wrong', isCorrect: false },
          { id: 'opt3', text: 'Correct 2', isCorrect: true },
        ],
      },
    ];

    // Perfect match
    const perfectAns = {
      q2: { questionId: 'q2', selectedOptionIds: ['opt1', 'opt3'] },
    };
    const res1 = gradingService.gradeAssessment(questions, perfectAns);
    expect(res1.earnedMarks).toBe(4);
    expect(res1.isPassed).toBe(true);

    // Partial selection (missing one correct option)
    const partialAns = {
      q2: { questionId: 'q2', selectedOptionIds: ['opt1'] },
    };
    const res2 = gradingService.gradeAssessment(questions, partialAns);
    expect(res2.earnedMarks).toBe(0);
    expect(res2.incorrectCount).toBe(1);
  });

  it('should accurately grade TRUE_FALSE and SHORT_ANSWER questions', () => {
    const questions: any[] = [
      {
        id: 'q3',
        type: 'TRUE_FALSE',
        marks: 1,
        options: [
          { id: 't1', text: 'True', isCorrect: true },
          { id: 't2', text: 'False', isCorrect: false },
        ],
      },
      {
        id: 'q4',
        type: 'SHORT_ANSWER',
        marks: 3,
        options: [
          { id: 's1', text: 'REST', isCorrect: true },
        ],
      },
    ];

    const answers = {
      q3: { questionId: 'q3', selectedOptionIds: ['t1'] },
      q4: { questionId: 'q4', textAnswer: 'rest api' },
    };

    const res = gradingService.gradeAssessment(questions, answers, 50);
    expect(res.totalMarks).toBe(4);
    expect(res.earnedMarks).toBe(4);
    expect(res.scorePercentage).toBe(100);
    expect(res.isPassed).toBe(true);
  });
});
