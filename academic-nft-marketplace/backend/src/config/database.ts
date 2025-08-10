import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Connection pool configuration for production
if (process.env.NODE_ENV === 'production') {
  prisma.$connect().then(() => {
    console.log('✅ Database connected successfully');
  }).catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });
}

export default prisma;