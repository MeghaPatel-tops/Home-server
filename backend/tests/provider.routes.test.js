// backend/tests/provider.routes.test.js
// Integration tests for provider‑side endpoints

// Mock validation middleware – bypass request body validation
jest.mock('../src/middleware/validate', () => () => (req, res, next) => next());

// Mock authentication middleware – bypass token verification
jest.mock('../src/middleware/authenticate', () => (req, res, next) => {
  req.user = { _id: 'p1', role: 'PROVIDER' };
  next();
});

// Mock models used in controller
jest.mock('../src/models', () => ({
  Provider: {
    findOne: jest.fn().mockResolvedValue({ _id: 'provider_1' }),
  },
  Technician: {
    findOne: jest.fn().mockResolvedValue({ _id: 'tech_1' }),
  },
}));

// Mock booking service which handles provider booking queue and dispatch
jest.mock('../src/services/booking.service', () => ({
  getProviderQueue: jest.fn(),
  acceptDispatch: jest.fn(),
  rejectDispatch: jest.fn(),
  assignTechnician: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const bookingService = require('../src/services/booking.service');

const authHeader = 'Bearer fake-provider-jwt';

describe('Provider Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/v1/provider/bookings/queue – returns queue', async () => {
    bookingService.getProviderQueue.mockResolvedValue([{ _id: 'b1' }]);
    const res = await request(app)
      .get('/api/v1/provider/bookings/queue')
      .set('Authorization', authHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('POST /api/v1/provider/bookings/:id/accept – accept booking', async () => {
    bookingService.acceptDispatch.mockResolvedValue({ status: 'ACCEPTED' });
    const res = await request(app)
      .post('/api/v1/provider/bookings/b1/accept')
      .set('Authorization', authHeader);
    expect(res.statusCode).toBe(200);
  });

  test('POST /api/v1/provider/bookings/:id/reject – reject booking', async () => {
    bookingService.rejectDispatch.mockResolvedValue({ status: 'REJECTED' });
    const res = await request(app)
      .post('/api/v1/provider/bookings/b1/reject')
      .set('Authorization', authHeader);
    expect(res.statusCode).toBe(200);
  });

  test('POST /api/v1/provider/dispatch/assign – assign technician', async () => {
    bookingService.assignTechnician.mockResolvedValue({ success: true });
    const payload = { booking_id: 'b1', technician_id: 't1' };
    const res = await request(app)
      .post('/api/v1/provider/dispatch/assign')
      .set('Authorization', authHeader)
      .send(payload);
    expect(res.statusCode).toBe(200);
  });
});
