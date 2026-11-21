// backend/tests/frontend.integration.test.js
// End-to-End API Integration test suite:
// Verifies Frontend API Client, Request Interceptors, Auth Token Injection,
// 401 Token Refresh Replay, and Frontend Domain Services (Auth, Catalog, Booking)
// against the Express backend API.

const http = require('http');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../src/config/env');
const { UnauthorizedError } = require('../src/core/errors');

// Mock backend services to isolate and test HTTP request/response handling and middleware
jest.mock('../src/services/auth.service', () => ({
  login: jest.fn(),
  registerCustomer: jest.fn(),
  rotateRefreshToken: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('../src/services/user.service', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  getAddresses: jest.fn(),
  createAddress: jest.fn(),
  deleteAddress: jest.fn(),
}));

jest.mock('../src/services/catalog.service', () => ({
  getCategories: jest.fn(),
  getAllServices: jest.fn(),
  getServiceById: jest.fn(),
  checkServiceability: jest.fn(),
}));

jest.mock('../src/services/booking.service', () => ({
  createBooking: jest.fn(),
  getCustomerBookings: jest.fn(),
  getBookingById: jest.fn(),
}));

// Mock User model for authenticate middleware
const mockCustomerUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  role: 'CUSTOMER',
  status: 'ACTIVE',
};

jest.mock('../src/models/User', () => ({
  findById: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(mockCustomerUser),
  }),
}));

// Mock IdempotencyRecord model so idempotency middleware doesn't hang on unmocked DB calls
jest.mock('../src/models/IdempotencyRecord', () => ({
  findOne: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(null),
  }),
  create: jest.fn().mockResolvedValue({}),
  deleteOne: jest.fn().mockResolvedValue({}),
}));

const authServiceMock = require('../src/services/auth.service');
const userServiceMock = require('../src/services/user.service');
const catalogServiceMock = require('../src/services/catalog.service');
const bookingServiceMock = require('../src/services/booking.service');
const { generateAccessToken } = require('../src/core/security/jwt');
const app = require('../src/app');

describe('Frontend ↔ Backend API Integration', () => {
  let server;
  let baseURL;
  let frontendApiClient;
  let currentAccessToken = null;

  // Frontend helper functions matching frontend/src/services/apiClient.js
  const setAccessToken = (token) => {
    currentAccessToken = token;
  };
  const clearAccessToken = () => {
    currentAccessToken = null;
  };
  const createIdempotencyKey = () => 'idemp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

  // Frontend Services matching frontend/src/services/*
  const frontendAuthService = {
    async login(credentials) {
      const response = await frontendApiClient.post('/api/v1/auth/login', credentials);
      const token = response.data?.data?.access_token || response.data?.access_token;
      const user = response.data?.data?.user || response.data?.user;
      if (token) setAccessToken(token);
      return { token, user };
    },
    async getCurrentUser() {
      const response = await frontendApiClient.get('/api/v1/users/me');
      return response.data?.data || response.data;
    },
    async updateProfile(updates) {
      const payload = { ...updates };
      if (payload.full_name !== undefined) {
        payload.name = payload.full_name;
        delete payload.full_name;
      }
      const response = await frontendApiClient.put('/api/v1/users/me', payload);
      return response.data?.data || response.data;
    },
    async getAddresses() {
      const response = await frontendApiClient.get('/api/v1/customer/addresses');
      return response.data?.data || response.data || [];
    },
    async createAddress(addressData) {
      const response = await frontendApiClient.post('/api/v1/customer/addresses', addressData);
      return response.data?.data || response.data;
    },
    async deleteAddress(addressId) {
      const response = await frontendApiClient.delete(`/api/v1/customer/addresses/${addressId}`);
      return response.data;
    },
    async logout() {
      try {
        await frontendApiClient.post('/api/v1/auth/logout');
      } finally {
        clearAccessToken();
      }
    },
  };

  const frontendCatalogService = {
    async getCategories() {
      const res = await frontendApiClient.get('/api/v1/categories');
      return res.data?.data || res.data;
    },
    async getAllServices(search = '', categoryId = '') {
      const res = await frontendApiClient.get('/api/v1/services', {
        params: {
          search: search || undefined,
          category_id: categoryId || undefined,
        },
      });
      return res.data?.data || res.data;
    },
    async getServiceById(serviceId) {
      const res = await frontendApiClient.get(`/api/v1/services/${serviceId}`);
      return res.data?.data || res.data;
    },
    async checkServiceability(categoryId, pincode) {
      const res = await frontendApiClient.get('/api/v1/zones/check-serviceability', {
        params: { category_id: categoryId, pincode },
      });
      return res.data?.data || res.data;
    },
  };

  const frontendBookingService = {
    async createBooking(bookingData) {
      const idempotencyKey = createIdempotencyKey();
      const res = await frontendApiClient.post('/api/v1/customer/bookings', bookingData, {
        headers: { 'Idempotency-Key': idempotencyKey },
      });
      return res.data?.data || res.data;
    },
    async getCustomerBookings(statusFilter = '') {
      const res = await frontendApiClient.get('/api/v1/customer/bookings/my-bookings');
      const data = res.data?.data || res.data;
      return statusFilter && Array.isArray(data)
        ? data.filter((b) => b.booking_status === statusFilter)
        : data;
    },
    async getBookingById(bookingId) {
      const res = await frontendApiClient.get(`/api/v1/customer/bookings/${bookingId}`);
      return res.data?.data || res.data;
    },
  };

  beforeAll((done) => {
    // Start backend express app on an ephemeral port
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseURL = `http://127.0.0.1:${port}`;

      // Initialize frontend Axios client instance mirroring frontend/src/services/apiClient.js
      frontendApiClient = axios.create({
        baseURL,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        withCredentials: true,
        httpAgent: new http.Agent({ keepAlive: false }),
      });

      // Request interceptor: attach Authorization and X-Request-ID
      frontendApiClient.interceptors.request.use((reqConfig) => {
        if (currentAccessToken && !reqConfig.headers.Authorization) {
          reqConfig.headers.Authorization = `Bearer ${currentAccessToken}`;
        }
        if (!reqConfig.headers['X-Request-ID']) {
          reqConfig.headers['X-Request-ID'] = 'req_' + Math.random().toString(36).substring(2, 11);
        }
        return reqConfig;
      });

      // Response interceptor: handle 401 with Token Refresh & Queue Replay
      let isRefreshing = false;
      let failedQueue = [];

      const processQueue = (error, token = null) => {
        failedQueue.forEach((prom) => {
          if (error) prom.reject(error);
          else prom.resolve(token);
        });
        failedQueue = [];
      };

      frontendApiClient.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;
          if (error.response?.status === 401 && !originalRequest._retry) {
            if (
              originalRequest.url.includes('/api/v1/auth/login') ||
              originalRequest.url.includes('/api/v1/auth/refresh')
            ) {
              clearAccessToken();
              return Promise.reject(error);
            }

            if (isRefreshing) {
              return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              })
                .then((token) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  return frontendApiClient(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
              const res = await axios.post(
                `${baseURL}/api/v1/auth/refresh`,
                { refresh_token: 'valid_refresh_token' },
                { withCredentials: true, httpAgent: new http.Agent({ keepAlive: false }) }
              );
              const newToken = res.data?.data?.access_token || res.data?.access_token;
              if (newToken) {
                setAccessToken(newToken);
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return frontendApiClient(originalRequest);
              }
              throw new Error('No token returned');
            } catch (refreshErr) {
              processQueue(refreshErr, null);
              clearAccessToken();
              return Promise.reject(refreshErr);
            } finally {
              isRefreshing = false;
            }
          }
          return Promise.reject(error);
        }
      );

      done();
    });
  });

  afterAll((done) => {
    if (server) {
      if (server.closeAllConnections) {
        server.closeAllConnections();
      }
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    clearAccessToken();
    // By default, refresh rejects with 401 if not explicitly mocked
    authServiceMock.rotateRefreshToken.mockRejectedValue(new UnauthorizedError('No active refresh token'));
  });

  describe('1. Frontend API Client & Request Interceptors', () => {
    test('attaches X-Request-ID correlation header on every outgoing call', async () => {
      catalogServiceMock.getCategories.mockResolvedValue([]);

      const res = await frontendApiClient.get('/api/v1/categories');

      expect(res.config.headers['X-Request-ID']).toBeDefined();
      expect(res.config.headers['X-Request-ID']).toMatch(/^req_[a-z0-9]+$/);
    });

    test('returns 401 when calling protected endpoint without access token', async () => {
      await expect(frontendAuthService.getCurrentUser()).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    test('automatically transparently refreshes token on 401 and replays pending request', async () => {
      // 1. Initial expired token
      const expiredToken = 'expired.token.jwt';
      setAccessToken(expiredToken);

      // 2. Mock refresh endpoint returning new fresh access token
      const freshToken = generateAccessToken({ id: mockCustomerUser._id, role: mockCustomerUser.role });
      authServiceMock.rotateRefreshToken.mockResolvedValue({
        user: mockCustomerUser,
        accessToken: freshToken,
        refreshToken: 'new_refresh_token',
      });

      // 3. User service succeeds once replayed with the new token
      userServiceMock.getProfile.mockResolvedValue(mockCustomerUser);

      // 4. Calling protected endpoint should seamlessly succeed via 401 refresh interceptor
      const profile = await frontendAuthService.getCurrentUser();

      expect(profile).toMatchObject({ _id: mockCustomerUser._id, name: mockCustomerUser.name });
      expect(authServiceMock.rotateRefreshToken).toHaveBeenCalledTimes(1);
      expect(userServiceMock.getProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Frontend authService Integration', () => {
    test('login(): successfully authenticates user and sets in-memory access token for subsequent calls', async () => {
      const validToken = generateAccessToken({ id: mockCustomerUser._id, role: mockCustomerUser.role });
      authServiceMock.login.mockResolvedValue({
        user: mockCustomerUser,
        accessToken: validToken,
        refreshToken: 'refresh_cookie_token',
      });

      const { token, user } = await frontendAuthService.login({
        email: 'rahul@example.com',
        password: 'Password123!',
      });

      expect(token).toBe(validToken);
      expect(user.name).toBe('Rahul Sharma');

      // Subsequent call to getCurrentUser should now succeed without manually passing headers
      userServiceMock.getProfile.mockResolvedValue(mockCustomerUser);
      const profile = await frontendAuthService.getCurrentUser();
      expect(profile.name).toBe('Rahul Sharma');
    });

    test('updateProfile(): maps full_name to name and sends PUT request to backend', async () => {
      const validToken = generateAccessToken({ id: mockCustomerUser._id, role: mockCustomerUser.role });
      setAccessToken(validToken);

      userServiceMock.updateProfile.mockResolvedValue({
        ...mockCustomerUser,
        name: 'Rahul Sharma Updated',
        phone: '9876543210',
      });

      const result = await frontendAuthService.updateProfile({
        full_name: 'Rahul Sharma Updated',
        phone: '9876543210',
      });

      expect(result.name).toBe('Rahul Sharma Updated');
      expect(userServiceMock.updateProfile).toHaveBeenCalledWith(
        mockCustomerUser._id,
        expect.objectContaining({ name: 'Rahul Sharma Updated', phone: '9876543210' })
      );
    });

    test('getAddresses(), createAddress(), deleteAddress(): customer address book flow', async () => {
      const validToken = generateAccessToken({ id: mockCustomerUser._id, role: mockCustomerUser.role });
      setAccessToken(validToken);

      const addressPayload = {
        label: 'Home',
        houseDetails: 'Flat 402, Green Glen',
        streetLocality: 'Bellandur',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560103',
      };

      // Create address
      userServiceMock.createAddress.mockResolvedValue({ _id: 'addr_101', ...addressPayload });
      const created = await frontendAuthService.createAddress(addressPayload);
      expect(created._id).toBe('addr_101');

      // List addresses
      userServiceMock.getAddresses.mockResolvedValue([{ _id: 'addr_101', ...addressPayload }]);
      const list = await frontendAuthService.getAddresses();
      expect(list).toHaveLength(1);
      expect(list[0]._id).toBe('addr_101');

      // Delete address
      userServiceMock.deleteAddress.mockResolvedValue({ success: true });
      const delResult = await frontendAuthService.deleteAddress('addr_101');
      expect(delResult.success).toBe(true);
    });

    test('logout(): posts to logout and clears in-memory access token', async () => {
      const validToken = generateAccessToken({ id: mockCustomerUser._id, role: mockCustomerUser.role });
      setAccessToken(validToken);

      authServiceMock.logout.mockResolvedValue({ success: true });
      await frontendAuthService.logout();

      // Next protected call should fail with 401 because token was cleared and no refresh exists
      await expect(frontendAuthService.getCurrentUser()).rejects.toMatchObject({
        response: { status: 401 },
      });
    });
  });

  describe('3. Frontend catalogService Integration', () => {
    test('getCategories(): fetches categories from /api/v1/categories', async () => {
      const mockCategories = [
        { _id: 'cat_1', name: 'Electrical Services', slug: 'electrical' },
        { _id: 'cat_2', name: 'Plumbing & Water', slug: 'plumbing' },
      ];
      catalogServiceMock.getCategories.mockResolvedValue(mockCategories);

      const categories = await frontendCatalogService.getCategories();
      expect(categories).toHaveLength(2);
      expect(categories[0].name).toBe('Electrical Services');
    });

    test('getAllServices(): queries /api/v1/services with search and category filters', async () => {
      const mockServices = [
        { _id: 'srv_1', name: 'Ceiling Fan Installation', basePricePaise: 29900 },
      ];
      catalogServiceMock.getAllServices.mockResolvedValue(mockServices);

      const services = await frontendCatalogService.getAllServices('fan', 'cat_1');
      expect(services).toHaveLength(1);
      expect(catalogServiceMock.getAllServices).toHaveBeenCalledWith('fan', 'cat_1');
    });

    test('checkServiceability(): checks 6-digit PIN code serviceability at /api/v1/zones/check-serviceability', async () => {
      catalogServiceMock.checkServiceability.mockResolvedValue({
        pincode: '560103',
        is_serviceable: true,
        city: 'Bangalore',
        state: 'Karnataka',
        message: 'Great news! HomeServe professionals are active in your area.',
      });

      const result = await frontendCatalogService.checkServiceability('cat_1', '560103');
      expect(result.is_serviceable).toBe(true);
      expect(result.city).toBe('Bangalore');
      expect(catalogServiceMock.checkServiceability).toHaveBeenCalledWith('560103', 'cat_1');
    });
  });

  describe('4. Frontend bookingService Integration', () => {
    test('createBooking(): creates booking with Idempotency-Key header and validates schema', async () => {
      const validToken = generateAccessToken({ id: mockCustomerUser._id, role: mockCustomerUser.role });
      setAccessToken(validToken);

      const bookingPayload = {
        service_id: '507f1f77bcf86cd799439012',
        address: {
          house_details: 'Flat 402, Green Glen',
          street_locality: 'Bellandur Main Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560103',
        },
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        payment_preference: 'ONLINE',
      };

      const mockCreatedBooking = {
        _id: 'bk_20261121_01',
        booking_number: 'BK-20261121-1234',
        ...bookingPayload,
        booking_status: 'PENDING_ASSIGNMENT',
      };

      bookingServiceMock.createBooking.mockResolvedValue(mockCreatedBooking);

      const result = await frontendBookingService.createBooking(bookingPayload);

      expect(result._id).toBe('bk_20261121_01');
      expect(result.booking_number).toBe('BK-20261121-1234');
      expect(bookingServiceMock.createBooking).toHaveBeenCalledWith(
        mockCustomerUser._id,
        expect.objectContaining({ service_id: '507f1f77bcf86cd799439012' })
      );
    });

    test('getCustomerBookings(): fetches bookings and handles client-side status filtering', async () => {
      const validToken = generateAccessToken({ id: mockCustomerUser._id, role: mockCustomerUser.role });
      setAccessToken(validToken);

      const mockBookings = [
        { _id: 'b1', booking_status: 'PENDING_ASSIGNMENT' },
        { _id: 'b2', booking_status: 'COMPLETED' },
      ];
      bookingServiceMock.getCustomerBookings.mockResolvedValue(mockBookings);

      // All bookings
      const all = await frontendBookingService.getCustomerBookings();
      expect(all).toHaveLength(2);

      // Filtered status
      const completedOnly = await frontendBookingService.getCustomerBookings('COMPLETED');
      expect(completedOnly).toHaveLength(1);
      expect(completedOnly[0]._id).toBe('b2');
    });

    test('getBookingById(): fetches single booking details by ID', async () => {
      const validToken = generateAccessToken({ id: mockCustomerUser._id, role: mockCustomerUser.role });
      setAccessToken(validToken);

      const mockBooking = {
        _id: 'bk_999',
        booking_number: 'BK-20261121-9999',
        booking_status: 'CONFIRMED',
      };
      bookingServiceMock.getBookingById.mockResolvedValue(mockBooking);

      const booking = await frontendBookingService.getBookingById('bk_999');
      expect(booking._id).toBe('bk_999');
      expect(booking.booking_number).toBe('BK-20261121-9999');
      expect(bookingServiceMock.getBookingById).toHaveBeenCalledWith('bk_999', expect.objectContaining({ _id: mockCustomerUser._id }));
    });
  });
});
