// backend/tests/zones.routes.test.js
// Integration tests for zone / serviceability endpoints

const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/services/catalog.service', () => ({
  checkServiceability: jest.fn()
}));

const catalogService = require('../src/services/catalog.service');

describe('Zone Routes', () => {
  test('GET /api/v1/zones/check-serviceability – serviceable', async () => {
    catalogService.checkServiceability.mockResolvedValue({
      pincode: '560103',
      is_serviceable: true,
      city: 'Bangalore',
      state: 'Karnataka',
      message: 'Great news! HomeServe professionals are active in your area.'
    });
    const res = await request(app)
      .get('/api/v1/zones/check-serviceability?pincode=560103');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toMatchObject({ is_serviceable: true });
  });

  test('GET /api/v1/zones/check-serviceability – not serviceable', async () => {
    catalogService.checkServiceability.mockResolvedValue({
      pincode: '999999',
      is_serviceable: false,
      city: null,
      message: 'HomeServe is currently expanding to this PIN code.'
    });
    const res = await request(app)
      .get('/api/v1/zones/check-serviceability?pincode=999999');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toMatchObject({ is_serviceable: false });
  });
});
