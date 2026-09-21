import { QuestionRepository } from '../repositories/question.repository';
import { AssessmentRepository } from '../repositories/assessment.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { CreateQuestionInput, UpdateQuestionInput, ReorderQuestionsInput } from '../validators/question.validator';

export class QuestionService {
  private questionRepo: QuestionRepository;
  private assessmentRepo: AssessmentRepository;

  constructor() {
    this.questionRepo = new QuestionRepository();
    this.assessmentRepo = new AssessmentRepository();
  }

  private formatQuestion(question: any) {
    if (!question) return null;

    const correctAnswers =
      question.options
        ?.filter((opt: any) => opt.isCorrect)
        .map((opt: any) => opt.id) || [];

    return {
      id: question.id,
      assessmentId: question.assessmentId,
      text: question.text,
      type: question.type,
      marks: question.marks,
      order: question.order,
      explanation: question.explanation,
      isRequired: question.isRequired,
      options: question.options?.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
        order: opt.order,
      })),
      correctAnswers: correctAnswers.length > 0 ? correctAnswers : undefined,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  async getByAssessmentId(assessmentId: string, user: { userId: string; role: string }) {
    const assessment = await this.assessmentRepo.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    if (user.role !== 'ADMIN' && assessment.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to view these questions');
    }

    const questions = await this.questionRepo.findByAssessmentId(assessmentId);
    return questions.map(this.formatQuestion);
  }

  async create(assessmentId: string, input: CreateQuestionInput, user: { userId: string; role: string }) {
    const assessment = await this.assessmentRepo.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    if (user.role !== 'ADMIN' && assessment.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to add questions to this assessment');
    }

    // Auto calculate order if not specified
    let order = input.order;
    if (order === undefined) {
      const existingQuestions = await this.questionRepo.findByAssessmentId(assessmentId);
      order = existingQuestions.length;
    }

    // If options contain isCorrect or correctAnswers array is provided, process options
    const options = (input.options || []).map((opt, idx) => ({
      text: opt.text,
      isCorrect:
        opt.isCorrect ||
        (input.correctAnswers && input.correctAnswers.includes(opt.id || opt.text)) ||
        false,
      order: opt.order ?? idx,
    }));

    const question = await this.questionRepo.create({
      assessmentId,
      text: input.text,
      type: input.type as any,
      marks: input.marks,
      order,
      explanation: input.explanation,
      isRequired: input.isRequired,
      options,
    });

    return this.formatQuestion(question);
  }

  async update(id: string, input: UpdateQuestionInput, user: { userId: string; role: string }) {
    const existing = await this.questionRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Question not found');
    }

    if (user.role !== 'ADMIN' && existing.assessment.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to update this question');
    }

    const options = input.options?.map((opt, idx) => ({
      id: opt.id,
      text: opt.text,
      isCorrect:
        opt.isCorrect ||
        (input.correctAnswers && input.correctAnswers.includes(opt.id || opt.text)) ||
        false,
      order: opt.order ?? idx,
    }));

    const updated = await this.questionRepo.update(id, {
      text: input.text,
      type: input.type as any,
      marks: input.marks,
      order: input.order,
      explanation: input.explanation,
      isRequired: input.isRequired,
      options,
    });

    return this.formatQuestion(updated);
  }

  async delete(id: string, user: { userId: string; role: string }) {
    const existing = await this.questionRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Question not found');
    }

    if (user.role !== 'ADMIN' && existing.assessment.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to delete this question');
    }

    await this.questionRepo.delete(id);
    return { id, message: 'Question deleted successfully' };
  }

  async reorder(assessmentId: string, input: ReorderQuestionsInput, user: { userId: string; role: string }) {
    const assessment = await this.assessmentRepo.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    if (user.role !== 'ADMIN' && assessment.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to reorder questions');
    }

    await this.questionRepo.reorder(assessmentId, input.questions);
    const updated = await this.questionRepo.findByAssessmentId(assessmentId);
    return updated.map(this.formatQuestion);
  }
}
