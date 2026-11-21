const authService = require('../services/auth.service');
const config = require('../config/env');

const setRefreshCookie = (res, token) => {
  res.cookie('__Host-refresh_token', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: config.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  });
};

const registerCustomer = async (req, res, next) => {
  try {
    const user = await authService.registerCustomer(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Customer registered successfully',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

const registerProvider = async (req, res, next) => {
  try {
    const user = await authService.registerProvider(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Provider organization registered successfully',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        access_token: accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const incomingToken = req.cookies['__Host-refresh_token'] || req.body.refresh_token;
    const { user, accessToken, refreshToken } = await authService.rotateRefreshToken(incomingToken);

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        access_token: accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const incomingToken = req.cookies['__Host-refresh_token'] || req.body?.refresh_token;
    await authService.logout(incomingToken);

    res.clearCookie('__Host-refresh_token', { path: '/' });
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerCustomer,
  registerProvider,
  login,
  refresh,
  logout,
};
