import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import compression from 'compression';
import morgan from 'morgan';

// Load environment variables first
dotenv.config();

import prisma from './config/database';
import redis from './config/redis';
import { 
  securityHeaders, 
  apiRateLimit, 
  strictRateLimit, 
  errorHandler,
  sanitizeInput,
  xssProtection,
  ipFilter,
  requestSizeLimit
} from './middleware/security';
import { authAttemptLimit } from './middleware/auth';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import achievementRoutes from './routes/achievements';
import nftRoutes from './routes/nfts';
import opportunityRoutes from './routes/opportunities';
import socialRoutes from './routes/social';
import multichainRoutes from './routes/multichain';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';
import healthRoutes from './routes/health';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  transports: ['websocket', 'polling'],
});

const PORT = process.env.PORT || 3001;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Trust proxy for accurate IP addresses behind load balancers
app.set('trust proxy', 1);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(isDevelopment ? 'dev' : 'combined'));

// Security middleware (order matters!)
app.use(ipFilter); // IP filtering first
app.use(requestSizeLimit(10 * 1024 * 1024)); // 10MB limit
app.use(securityHeaders);
app.use(sanitizeInput); // Sanitize inputs early
app.use(xssProtection); // XSS protection
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Session-Token'],
}));

// Rate limiting
app.use('/api/', apiRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static('uploads', {
  maxAge: '1d',
  etag: true,
}));

// API Routes with enhanced security
app.use('/api/auth', authAttemptLimit, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/nfts', nftRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/multichain', multichainRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', strictRateLimit, adminRoutes); // More strict rate limiting for admin
app.use('/api/health', healthRoutes);

// Error handling middleware
app.use(errorHandler);

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join user to their personal room for targeted notifications
  socket.on('join-user', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their personal room`);
  });

  // Join university room for university-wide updates
  socket.on('join-university', (university: string) => {
    socket.join(`university-${university}`);
    console.log(`User joined ${university} room`);
  });

  // Handle real-time achievement submissions
  socket.on('achievement-submitted', (data) => {
    // Broadcast to university room
    socket.to(`university-${data.university}`).emit('new-achievement', data);
    // Broadcast to global feed
    socket.broadcast.emit('achievement-feed-update', data);
  });

  // Handle NFT minting events
  socket.on('nft-minted', (data) => {
    socket.to(`user-${data.userId}`).emit('nft-minted-success', data);
    socket.broadcast.emit('nft-gallery-update', data);
  });

  // Handle leaderboard updates
  socket.on('request-leaderboard', () => {
    // This will be implemented with the leaderboard feature
    socket.emit('leaderboard-update', { message: 'Leaderboard requested' });
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server with WebSocket running on port ${PORT}`);
});

// Export Socket.IO instance for use in routes
export { io };

// Export Prisma instance
export { prisma };

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});