import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';

const app = createApp();

describe('Public Test Attempt & Analytics Flow', () => {
  let attemptId = '';
  let questionId = '';
  let correctOptionId = '';

  beforeAll(async () => {
    // Fetch DEV2026 assessment seeded question
    const assessment = await prisma.assessment.findUnique({
      where: { accessCode: 'DEV2026' },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    const q1 = assessment?.questions[0];
    questionId = q1!.id;
    correctOptionId = q1!.options.find((o) => o.isCorrect)!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/v1/public/tests/DEV2026/start - should start attempt and return sanitized questions', async () => {
    const res = await request(app)
      .post('/api/v1/public/tests/DEV2026/start')
      .send({
        participant: {
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          studentId: 'STU-100',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.attempt.id).toBeDefined();
    expect(res.body.data.questions).toBeDefined();

    // Verify answers & correct flags are NOT leaked to candidate
    res.body.data.questions.forEach((q: any) => {
      expect(q.explanation).toBeUndefined();
      expect(q.correctAnswers).toBeUndefined();
      q.options?.forEach((opt: any) => {
        expect(opt.isCorrect).toBeUndefined();
      });
    });

    attemptId = res.body.data.attempt.id;
  });

  it('POST /api/v1/public/attempts/:id/answers - should save answer during test', async () => {
    const res = await request(app)
      .post(`/api/v1/public/attempts/${attemptId}/answers`)
      .send({
        questionId,
        selectedOptionIds: [correctOptionId],
        isMarkedForReview: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answers[questionId]).toBeDefined();
  });

  it('POST /api/v1/public/attempts/:id/submit - should submit and grade attempt server-side', async () => {
    const res = await request(app)
      .post(`/api/v1/public/attempts/${attemptId}/submit`)
      .send({
        timeSpentSeconds: 300,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.scorePercentage).toBeGreaterThanOrEqual(0);
    expect(res.body.data.submittedAt).toBeDefined();
  });

  it('GET /api/v1/attempts/:id/result - should retrieve detailed score result', async () => {
    const res = await request(app).get(`/api/v1/attempts/${attemptId}/result`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.attempt.id).toBe(attemptId);
    expect(res.body.data.assessment.title).toBeDefined();
  });

  it('GET /api/v1/assessments/:id/analytics - should compute accurate performance analytics', async () => {
    const assessment = await prisma.assessment.findUnique({
      where: { accessCode: 'DEV2026' },
    });

    // Login as Admin to fetch analytics
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@assesspulse.com', password: 'password123' });
    const adminToken = loginRes.body.data.token;

    const res = await request(app)
      .get(`/api/v1/assessments/${assessment!.id}/analytics`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAttempts).toBeGreaterThanOrEqual(1);
    expect(res.body.data.scoreDistribution).toBeDefined();
    expect(res.body.data.questionPerformance).toBeDefined();
  });
});
