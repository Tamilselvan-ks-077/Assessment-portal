import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';

const app = createApp();

describe('Auth Endpoints', () => {
  const uniqueEmail = `test_${Date.now()}@assesspulse.com`;
  let token = '';
  let refreshToken = '';

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'test_' } },
    });
    await prisma.$disconnect();
  });

  it('POST /api/v1/auth/register - should register a new test creator', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Creator',
        email: uniqueEmail,
        password: 'Password123!',
        role: 'TEST_CREATOR',
        organization: 'Test Academy',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(uniqueEmail);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    token = res.body.data.token;
    refreshToken = res.body.data.refreshToken;
  });

  it('POST /api/v1/auth/register - should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Duplicate',
        email: uniqueEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login - should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/v1/auth/login - should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me - should get current user profile with JWT', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(uniqueEmail);
  });

  it('POST /api/v1/auth/refresh - should refresh access token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
