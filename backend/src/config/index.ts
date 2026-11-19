import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/barbershop_db?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'barbershop_super_secret_jwt_key_2026_luxury_blades',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  timezone: process.env.TZ || 'Asia/Tashkent',
  standardSlotMinutes: 45, // 1 kishi = 45 daqiqa
};
