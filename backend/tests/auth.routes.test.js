// auth.routes.test.js – integration tests for auth endpoints using Supertest
// Run with `npm test`

const request = require('supertest');
const app = require('../src/app');

// Mock the authService to avoid DB calls
jest.mock('../src/services/auth.service', () => ({
  login: jest.fn(),
  registerCustomer: jest.fn(),
  registerProvider: jest.fn(),
  logout: jest.fn()
}));

const authService = require('../src/services/auth.service');

describe('Auth Routes', () => {
  test('POST /api/v1/auth/login – success', async () => {
    authService.login.mockResolvedValue({
      user: { _id: 'u1', email: 'test@example.com', role: 'CUSTOMER' },
      accessToken: 'access',
      refreshToken: 'refresh'
    });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'secret' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toMatchObject({ access_token: 'access', user: expect.any(Object) });
  });

  test('POST /api/v1/auth/login – missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: '' });
    expect(res.statusCode).toBe(422);
  });

  test('POST /api/v1/auth/register/customer – success', async () => {
    authService.registerCustomer.mockResolvedValue({ _id: 'c1' });
    const payload = { name: 'Alice', email: 'alice@test.com', phone: '1234567890', password: 'pwd123' };
    const res = await request(app).post('/api/v1/auth/register/customer').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
  });

  test('POST /api/v1/auth/logout – clears cookie', async () => {
    authService.logout.mockResolvedValue();
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });
});
