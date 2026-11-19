import { createApp } from './app';
import { config } from './config';
import { prisma } from './prisma/client';

const app = createApp();

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('PostgreSQL bazasiga muvaffaqiyatli ulandi (Asia/Tashkent).');

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`=================================================`);
      console.log(`  BARBERSHOP BACKEND IS RUNNING (0.0.0.0)`);
      console.log(`  URL: http://localhost:${config.port}`);
      console.log(`  API: http://localhost:${config.port}/api`);
      console.log(`  Health: http://localhost:${config.port}/health`);
      console.log(`  Timezone: ${config.timezone}`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Serverni ishga tushirishda xatolik yuz berdi:', error);
    process.exit(1);
  }
}

startServer();
