import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'auth_token';

export function signToken(payload) {
  const secret = process.env.AUTH_SECRET;
  return jwt.sign(payload, secret, { expiresIn: '2h' });
}

export function verifyToken(token) {
  try {
    const secret = process.env.AUTH_SECRET;
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
