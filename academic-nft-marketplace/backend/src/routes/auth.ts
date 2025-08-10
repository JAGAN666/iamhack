import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import config from '../config/environment';
import { validateInput, schemas, authRateLimit } from '../middleware/security';
import { 
  generateTokens, 
  createSession, 
  refreshTokenHandler, 
  logoutHandler, 
  logoutAllHandler,
  authenticateToken,
  getUserSessions
} from '../middleware/auth';

const router = express.Router();

// Enhanced login with rate limiting and session management
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        university: true,
        role: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.emailVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    // Generate secure tokens with session
    const { accessToken, refreshToken, sessionId } = generateTokens(user.id, user.email, user.role);
    
    // Create session
    createSession(sessionId, user.id, req);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user,
      session: {
        id: sessionId,
        expiresIn: '15m' // Access token expiry
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register new user
router.post('/register', validateInput(schemas.register), async (req, res) => {
  try {
    const { email, universityEmail, firstName, lastName, university, studentId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { universityEmail }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        universityEmail,
        firstName,
        lastName,
        university,
        studentId,
        emailVerified: true, // Auto-verify for demo
        emailVerificationToken: uuidv4(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        university: true,
        role: true,
        emailVerified: true,
      },
    });

    // Generate secure tokens with session
    const { accessToken, refreshToken, sessionId } = generateTokens(user.id, user.email, user.role);
    
    // Create session
    createSession(sessionId, user.id, req);

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      refreshToken,
      user,
      session: {
        id: sessionId,
        expiresIn: '15m' // Access token expiry
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify email (demo endpoint)
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Token refresh endpoint
router.post('/refresh-token', refreshTokenHandler);

// Logout endpoint
router.post('/logout', authenticateToken, logoutHandler);

// Logout from all devices
router.post('/logout-all', authenticateToken, logoutAllHandler);

// Get active sessions for current user
router.get('/sessions', authenticateToken, async (req: any, res) => {
  try {
    const sessions = getUserSessions(req.user.id);
    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Verify current token (health check for frontend)
router.get('/verify', authenticateToken, (req: any, res) => {
  res.json({
    valid: true,
    user: req.user,
    sessionId: req.sessionId
  });
});

export default router;