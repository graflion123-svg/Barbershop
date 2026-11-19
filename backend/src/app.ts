import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // Security Middleware
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
  app.use(cors({
    origin: (origin, callback) => {
      // Allow any origin for local network & mobile access
      callback(null, true);
    },
    credentials: true,
  }));

  // Rate Limiting (1000 requests per 15 minutes)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { success: false, message: "Ko'p so'rov yuborildi. Iltimos keyinroq urinib ko'ring." },
  });
  app.use('/api', limiter);

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Tashkent',
    });
  });

  // Mount API routes
  app.use('/api', routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
