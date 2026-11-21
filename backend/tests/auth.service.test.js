/**
 * Jest tests for AuthService (authentication / registration)
 * Run with `npm test` (Jest is already set up in the project).
 */

const AuthService = require('../src/services/auth.service');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');
const Provider = require('../src/models/Provider');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} = require('../src/core/errors');
const { generateAccessToken, generateRefreshTokenString, hashRefreshToken } = require('../src/core/security/jwt');
const { hashPassword, comparePassword } = require('../src/core/security/password');

jest.mock('../src/models/User');
jest.mock('../src/models/RefreshToken');
jest.mock('../src/models/Provider');
jest.mock('../src/core/security/jwt');
jest.mock('../src/core/security/password');

describe('AuthService.login', () => {
  const validEmail = 'test@example.com';
  const validPassword = 'Secret123';
  const userId = 'user123';
  const passwordHash = 'hashed';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('throws BadRequestError when email or password is missing', async () => {
    await expect(AuthService.login('', validPassword)).rejects.toBeInstanceOf(BadRequestError);
    await expect(AuthService.login(validEmail, '')).rejects.toBeInstanceOf(BadRequestError);
  });

  test('throws UnauthorizedError for unknown email', async () => {
    // Adjust mock to support .select chaining
User.findOne.mockImplementation(() => ({
  select: jest.fn().mockResolvedValue(null)
}));
    await expect(AuthService.login(validEmail, validPassword)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  test('throws UnauthorizedError when password does not match', async () => {
    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ _id: userId, email: validEmail, passwordHash, status: 'ACTIVE' })
    }));
    comparePassword.mockResolvedValue(false);
    await expect(AuthService.login(validEmail, validPassword)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  test('throws UnauthorizedError when user is suspended', async () => {
    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ _id: userId, email: validEmail, passwordHash, status: 'SUSPENDED' })
    }));
    comparePassword.mockResolvedValue(true);
    await expect(AuthService.login(validEmail, validPassword)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  test('returns tokens and user when credentials are valid', async () => {
    const mockUser = { _id: userId, email: validEmail, role: 'CUSTOMER', status: 'ACTIVE', toJSON: jest.fn().mockReturnValue({ id: userId }) };
    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser)
    }));
    comparePassword.mockResolvedValue(true);
    generateAccessToken.mockReturnValue('access-token');
    generateRefreshTokenString.mockReturnValue('raw-refresh');
    hashRefreshToken.mockReturnValue('hashed-refresh');
    RefreshToken.create.mockResolvedValue({});

    const result = await AuthService.login(validEmail, validPassword);
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('accessToken', 'access-token');
    expect(result).toHaveProperty('refreshToken', 'raw-refresh');
  });
});

// Additional tests for registerCustomer, registerProvider, rotateRefreshToken, logout would follow similar patterns.
