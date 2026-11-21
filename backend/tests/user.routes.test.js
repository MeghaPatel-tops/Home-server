// backend/tests/user.routes.test.js
// Integration tests for user‑related routes (profile & addresses)

// Mock validation middleware – bypass request body validation
jest.mock('../src/middleware/validate', () => () => (req, res, next) => next());

jest.mock('../src/middleware/authenticate', () => (req, res, next) => {
  req.user = { _id: 'u1', role: 'CUSTOMER' };
  next();
});

const request = require('supertest');
const app = require('../src/app');

// Mock user service – avoids DB access
jest.mock('../src/services/user.service', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  getAddresses: jest.fn(),
  createAddress: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
}));

const userService = require('../src/services/user.service');

// Helper auth header – the real auth middleware expects a JWT, but for the test we can bypass it
const authHeader = 'Bearer fake-jwt-token';

describe('User Routes (protected)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/v1/users/me – returns profile', async () => {
    userService.getProfile.mockResolvedValue({ _id: 'u1', name: 'Bob', email: 'bob@test.com' });
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', authHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toMatchObject({ _id: 'u1', name: 'Bob' });
  });

  test('PUT /api/v1/users/me – updates profile', async () => {
    const updated = { _id: 'u1', name: 'Bob Updated', phone: '+91 98765 43210' };
    userService.updateProfile.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', authHeader)
      .send({ name: 'Bob Updated', phone: '+91 98765 43210' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Bob Updated');
  });

  test('GET /api/v1/customer/addresses – list addresses', async () => {
    const mockAddrs = [{ _id: 'a1', label: 'Home' }];
    userService.getAddresses.mockResolvedValue(mockAddrs);
    const res = await request(app)
      .get('/api/v1/customer/addresses')
      .set('Authorization', authHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('POST /api/v1/customer/addresses – create address', async () => {
    const payload = { label: 'Office', city: 'Bangalore' };
    const created = { _id: 'a2', ...payload };
    userService.createAddress.mockResolvedValue(created);
    const res = await request(app)
      .post('/api/v1/customer/addresses')
      .set('Authorization', authHeader)
      .send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.label).toBe('Office');
  });

  test('PUT /api/v1/customer/addresses/:id – update address', async () => {
    const updated = { _id: 'a1', label: 'Home Updated' };
    userService.updateAddress.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/v1/customer/addresses/a1')
      .set('Authorization', authHeader)
      .send({ label: 'Home Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.label).toBe('Home Updated');
  });

  test('DELETE /api/v1/customer/addresses/:id – delete address', async () => {
    userService.deleteAddress.mockResolvedValue({ success: true });
    const res = await request(app)
      .delete('/api/v1/customer/addresses/a1')
      .set('Authorization', authHeader);
    expect(res.statusCode).toBe(200);
  });
});
