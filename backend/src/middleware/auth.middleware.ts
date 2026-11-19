import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AdminPayload, UserPayload } from '../types';
import { verifyToken } from '../utils/jwt';

export function authenticateAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Autentifikatsiya talab qilinadi' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token) as AdminPayload;
    if (decoded.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Ruxsat berilmagan: Faqat admin uchun' });
      return;
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Yaroqsiz yoki muddati o\'tgan token' });
  }
}

export function optionalCustomerAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token) as UserPayload;
    req.user = decoded;
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}
