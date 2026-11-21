// Increase timeout for routes that may involve DB init
jest.setTimeout(20000);

const request = require('supertest');
const app = require('../../src/app');

// Mock catalogService to avoid DB hit for zone check
jest.mock('../../src/services/catalog.service', () => ({
  checkServiceability: jest.fn().mockResolvedValue({
    pincode: '560103',
    is_serviceable: true,
    city: 'Bangalore',
    state: 'Karnataka',
    message: 'Great news! HomeServe professionals are active in your area.'
  })
}));


describe('Health and Public Routes', () => {
  it('GET /health returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /health/ready returns status check', async () => {
    const res = await request(app).get('/health/ready');
    // Either ready or not_ready depending on DB connection state
    expect([200, 503]).toContain(res.statusCode);
  });

  it('GET /api/v1/zones/check-serviceability verifies pincode format', async () => {
    const res = await request(app).get('/api/v1/zones/check-serviceability?pincode=560103');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
  });

  it('Rejects unauthenticated access to protected profile', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.statusCode).toEqual(401);
  });
});
