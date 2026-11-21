// backend/tests/booking.routes.test.js
// Integration tests for booking‑related endpoints

// Mock authentication middleware – bypass token verification
jest.mock('../src/middleware/authenticate', () => (req, res, next) => {
  req.user = { _id: 'c1', role: 'CUSTOMER' };
  next();
});

const request = require('supertest');
const app = require('../src/app');

// Mock validation middleware – bypass request body validation
jest.mock('../src/middleware/validate', () => () => (req, res, next) => next());


jest.mock('../src/services/booking.service', () => ({
  createBooking: jest.fn(),
  getCustomerBookings: jest.fn(),
  getBookingById: jest.fn(),
  cancelBooking: jest.fn(),
  resendOtp: jest.fn(),
  // add other methods as needed
}));

const bookingService = require('../src/services/booking.service');

const authHeader = 'Bearer fake-customer-jwt';

describe('Booking Routes (Customer)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('POST /api/v1/customer/bookings – create booking', async () => {
    const mockBooking = { _id: 'b1', status: 'PENDING' };
    bookingService.createBooking.mockResolvedValue(mockBooking);
    const payload = { serviceId: 's1', addressId: 'a1', scheduledAt: Date.now() };
    const res = await request(app)
      .post('/api/v1/customer/bookings')
      .set('Authorization', authHeader)
      .send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toMatchObject({ _id: 'b1' });
  });

  test('GET /api/v1/customer/bookings/my-bookings – list for customer', async () => {
    bookingService.getCustomerBookings.mockResolvedValue([{ _id: 'b2' }]);
    const res = await request(app)
      .get('/api/v1/customer/bookings/my-bookings')
      .set('Authorization', authHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('GET /api/v1/customer/bookings/:id – fetch single booking', async () => {
    const mock = { _id: 'b3', status: 'CONFIRMED' };
    bookingService.getBookingById.mockResolvedValue(mock);
    const res = await request(app)
      .get('/api/v1/customer/bookings/b3')
      .set('Authorization', authHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe('b3');
  });

  test('POST /api/v1/customer/bookings/:id/cancel – cancel booking', async () => {
    bookingService.cancelBooking.mockResolvedValue({ success: true });
    const res = await request(app)
      .post('/api/v1/customer/bookings/b1/cancel')
      .set('Authorization', authHeader);
    expect(res.statusCode).toBe(200);
  });

  test('POST /api/v1/customer/bookings/:id/resend-otp – resend OTP', async () => {
    bookingService.resendOtp.mockResolvedValue({ success: true });
    const res = await request(app)
      .post('/api/v1/customer/bookings/b1/resend-otp')
      .set('Authorization', authHeader);
    expect(res.statusCode).toBe(200);
  });
});
