export const AUTH_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  MISSING_REFRESH_TOKEN: 'missing refresh token',
  INVALID_REFRESH_TOKEN: 'invalid refresh token',
  INVALID_TOKEN_TYPE: 'invalid token type',
  MISSING_USERNAME_PAYLOAD: 'refresh token payload missing username',
  INVALID_CREDENTIALS: 'Invalid credentials',
};

export const JWT_EXPIRATION = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
};

export const JWT_TYPES = {
  REFRESH: 'refresh',
};

export const HTTP_STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
};
