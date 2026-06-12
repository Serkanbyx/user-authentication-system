const request = require('supertest');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

process.env.ACCESS_TOKEN_SECRET = 'test-access-secret-key-64-chars-long-for-testing-purposes-only';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-key-64-chars-long-for-testing-purposes-only';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const User = require('../src/models/User');

beforeAll(async () => await connectTestDB());
afterAll(async () => await closeTestDB());
afterEach(async () => await clearTestDB());

const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test1234',
};

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/check your email/i);

    const user = await User.findOne({ email: validUser.email });
    expect(user).toBeTruthy();
    expect(user.isVerified).toBe(false);
  });

  it('should return 409 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 422 when name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 422 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.statusCode).toBe(422);
  });

  it('should return 422 when password is too weak', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'short' });

    expect(res.statusCode).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
    await User.findOneAndUpdate(
      { email: validUser.email },
      { isVerified: true }
    );
  });

  it('should login a verified user and return access token + cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPass1' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: validUser.password });

    expect(res.statusCode).toBe(401);
  });

  it('should return 403 for unverified user', async () => {
    await User.findOneAndUpdate(
      { email: validUser.email },
      { isVerified: false }
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(403);
  });

  it('should return 422 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: validUser.password });

    expect(res.statusCode).toBe(422);
  });
});

describe('GET /api/auth/verify/:token', () => {
  it('should verify a valid token', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const user = await User.findOne({ email: validUser.email }).select('+verifyToken');
    expect(user.verifyToken).toBeDefined();

    const res = await request(app).get(`/api/auth/verify/${user.verifyToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await User.findOne({ email: validUser.email });
    expect(updatedUser.isVerified).toBe(true);
  });

  it('should return 422 for invalid token format', async () => {
    const res = await request(app).get('/api/auth/verify/invalid-token');

    expect(res.statusCode).toBe(422);
  });

  it('should return 400 for non-existent token', async () => {
    const fakeToken = 'a'.repeat(64);
    const res = await request(app).get(`/api/auth/verify/${fakeToken}`);

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/refresh', () => {
  it('should refresh access token with valid refresh cookie', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    await User.findOneAndUpdate({ email: validUser.email }, { isVerified: true });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('should return 401 without refresh cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');

    expect(res.statusCode).toBe(401);
  });

  it('should reject a refresh token after logout (server-side revocation)', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    await User.findOneAndUpdate({ email: validUser.email }, { isVerified: true });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    const cookies = loginRes.headers['set-cookie'];

    await request(app).post('/api/auth/logout').set('Cookie', cookies);

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('should clear refresh cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('refreshToken=;'))).toBe(true);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('should return success regardless of email existence (enumeration prevention)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should generate reset token for existing user', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: validUser.email });

    expect(res.statusCode).toBe(200);

    const user = await User.findOne({ email: validUser.email })
      .select('+resetPasswordToken +resetPasswordExpire');
    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpire).toBeDefined();
  });

  it('should return 422 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'not-valid' });

    expect(res.statusCode).toBe(422);
  });
});

describe('POST /api/auth/reset-password/:token', () => {
  it('should reset password with valid token', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });

    const user = await User.findOne({ email: validUser.email }).select('+resetPasswordToken');

    const res = await request(app)
      .post(`/api/auth/reset-password/${user.resetPasswordToken}`)
      .send({ password: 'NewPass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    await User.findOneAndUpdate({ email: validUser.email }, { isVerified: true });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'NewPass123' });

    expect(loginRes.statusCode).toBe(200);
  });

  it('should return 400 for invalid reset token', async () => {
    const fakeToken = 'b'.repeat(64);
    const res = await request(app)
      .post(`/api/auth/reset-password/${fakeToken}`)
      .send({ password: 'NewPass123' });

    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});
