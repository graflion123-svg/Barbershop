import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AdminPayload, UserPayload } from '../types';

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

export function signUserToken(payload: UserPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '30d',
  });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, config.jwtSecret);
}
