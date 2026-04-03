const REFRESH_COOKIE_NAME = 'refreshToken';

const isProduction = process.env.NODE_ENV === 'production';

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

module.exports = { REFRESH_COOKIE_NAME, refreshCookieOptions };
