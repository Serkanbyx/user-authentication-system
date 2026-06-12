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

const createAndLoginUser = async () => {
  await request(app).post('/api/auth/register').send(validUser);
  await User.findOneAndUpdate({ email: validUser.email }, { isVerified: true });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: validUser.email, password: validUser.password });

  return {
    accessToken: loginRes.body.accessToken,
    cookies: loginRes.headers['set-cookie'],
  };
};

describe('GET /api/users/profile', () => {
  it('should return user profile when authenticated', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe(validUser.name);
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.isVerified).toBe(true);
    expect(res.body.user.password).toBeUndefined();
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app).get('/api/users/profile');

    expect(res.statusCode).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.statusCode).toBe(401);
  });
});

describe('PUT /api/users/profile', () => {
  it('should update user name', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe('Updated Name');
  });

  it('should return 422 when name exceeds 50 characters', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'A'.repeat(51) });

    expect(res.statusCode).toBe(422);
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .send({ name: 'Updated' });

    expect(res.statusCode).toBe(401);
  });

  it('should keep the current email active until the new one is verified', async () => {
    const { accessToken } = await createAndLoginUser();
    const newEmail = 'updated@example.com';

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: newEmail });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.pendingEmail).toBe(newEmail);

    const user = await User.findOne({ email: validUser.email }).select(
      '+pendingEmail +verifyToken'
    );
    expect(user.pendingEmail).toBe(newEmail);
    expect(user.isVerified).toBe(true);

    const verifyRes = await request(app).get(`/api/auth/verify/${user.verifyToken}`);
    expect(verifyRes.statusCode).toBe(200);

    const updated = await User.findById(user._id).select('+pendingEmail');
    expect(updated.email).toBe(newEmail);
    expect(updated.pendingEmail).toBeUndefined();
  });
});

describe('PUT /api/users/change-password', () => {
  it('should change password with correct current password', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .put('/api/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: validUser.password, newPassword: 'NewPass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'NewPass123' });

    expect(loginRes.statusCode).toBe(200);
  });

  it('should revoke the previous access token after a password change', async () => {
    const { accessToken } = await createAndLoginUser();

    await request(app)
      .put('/api/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: validUser.password, newPassword: 'NewPass123' });

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(401);
  });

  it('should return 401 with wrong current password', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .put('/api/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'WrongPass1', newPassword: 'NewPass123' });

    expect(res.statusCode).toBe(401);
  });

  it('should return 422 when new password is same as current', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .put('/api/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: validUser.password, newPassword: validUser.password });

    expect(res.statusCode).toBe(422);
  });

  it('should return 422 when new password is too weak', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .put('/api/users/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: validUser.password, newPassword: 'weak' });

    expect(res.statusCode).toBe(422);
  });
});
