import express from 'express';
import prisma from '../config/database';
import redis from '../config/redis';

const router = express.Router();

// Basic health check
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Detailed health check with dependencies
router.get('/detailed', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    memory: false,
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Redis check (if configured)
    if (redis) {
      await redis.ping();
      checks.redis = true;
    } else {
      checks.redis = true; // Not configured, so consider it healthy
    }
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  // Memory check
  const memUsage = process.memoryUsage();
  checks.memory = memUsage.heapUsed < 500 * 1024 * 1024; // Less than 500MB

  const allHealthy = Object.values(checks).every(check => check);

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    checks,
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    },
  });
});

export default router;