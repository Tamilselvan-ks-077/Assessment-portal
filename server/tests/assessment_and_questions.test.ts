import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';

const app = createApp();

describe('Assessment & Question CRUD Flow', () => {
  let creatorToken = '';
  let assessmentId = '';
  let questionId = '';
  let accessCode = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'creator@assesspulse.com',
        password: 'password123',
      });
    creatorToken = res.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/v1/assessments - should create a new assessment', async () => {
    const res = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        title: 'Integration Test Assessment',
        description: 'Test Assessment description',
        category: 'Testing',
        timeLimitMinutes: 15,
        passingScorePercentage: 70,
        maxAttempts: 2,
        shuffleQuestions: true,
        shuffleOptions: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Integration Test Assessment');
    expect(res.body.data.accessCode).toBeDefined();

    assessmentId = res.body.data.id;
    accessCode = res.body.data.accessCode;
  });

  it('POST /api/v1/assessments/:id/questions - should add a single choice question', async () => {
    const res = await request(app)
      .post(`/api/v1/assessments/${assessmentId}/questions`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        text: 'What is 2 + 2?',
        type: 'SINGLE_CHOICE',
        marks: 5,
        order: 0,
        options: [
          { text: '3', isCorrect: false },
          { text: '4', isCorrect: true },
          { text: '5', isCorrect: false },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.options.length).toBe(3);
    questionId = res.body.data.id;
  });

  it('PATCH /api/v1/questions/:id - should update the question', async () => {
    const res = await request(app)
      .patch(`/api/v1/questions/${questionId}`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        marks: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.marks).toBe(10);
  });

  it('POST /api/v1/assessments/:id/publish - should publish assessment', async () => {
    const res = await request(app)
      .post(`/api/v1/assessments/${assessmentId}/publish`)
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('GET /api/v1/public/tests/:accessCode - should return safe public test info', async () => {
    const res = await request(app).get(`/api/v1/public/tests/${accessCode}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Integration Test Assessment');
    expect(res.body.data.timeLimitMinutes).toBe(15);
  });
});
