import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../config/environment';
import prisma from '../config/database';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

interface AuthRequest extends Request {
  user?: any;
  sessionId?: string;
  clientFingerprint?: string;
}

interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  type: 'refresh';
}

interface AccessTokenPayload {
  userId: string;
  sessionId: string;
  email: string;
  role: string;
  type: 'access';
}

// Session store for tracking active sessions
const activeSessions = new Map<string, {
  userId: string;
  createdAt: number;
  lastActive: number;
  ipAddress: string;
  userAgent: string;
}>();

// Rate limiting for authentication attempts
export const authAttemptLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Suspicious activity detection
const suspiciousIPs = new Map<string, {
  attempts: number;
  lastAttempt: number;
  blocked: boolean;
}>();

// Generate client fingerprint for additional security
const generateClientFingerprint = (req: Request): string => {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  
  return crypto.createHash('sha256')
    .update(`${userAgent}${acceptLanguage}${acceptEncoding}`)
    .digest('hex');
};

// Check for suspicious activity
const checkSuspiciousActivity = (req: Request): boolean => {
  const clientIP = req.ip;
  const now = Date.now();
  
  const suspiciousData = suspiciousIPs.get(clientIP);
  if (suspiciousData) {
    if (suspiciousData.blocked && (now - suspiciousData.lastAttempt) < 60 * 60 * 1000) { // 1 hour block
      return true;
    }
    
    // Reset if enough time has passed
    if (now - suspiciousData.lastAttempt > 15 * 60 * 1000) { // 15 minutes
      suspiciousData.attempts = 0;
      suspiciousData.blocked = false;
    }
  }
  
  return false;
};

// Log failed authentication attempt
const logFailedAttempt = (req: Request): void => {
  const clientIP = req.ip;
  const now = Date.now();
  
  const suspiciousData = suspiciousIPs.get(clientIP) || {
    attempts: 0,
    lastAttempt: 0,
    blocked: false
  };
  
  suspiciousData.attempts += 1;
  suspiciousData.lastAttempt = now;
  
  if (suspiciousData.attempts >= 10) {
    suspiciousData.blocked = true;
    console.warn(`IP ${clientIP} blocked due to too many failed authentication attempts`);
  }
  
  suspiciousIPs.set(clientIP, suspiciousData);
};

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check for suspicious activity first
    if (checkSuspiciousActivity(req)) {
      logFailedAttempt(req);
      return res.status(429).json({ 
        error: 'Access blocked due to suspicious activity',
        retryAfter: 3600 // 1 hour
      });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logFailedAttempt(req);
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as AccessTokenPayload;
    
    // Verify token type
    if (decoded.type !== 'access') {
      logFailedAttempt(req);
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Check if session is still active
    const session = activeSessions.get(decoded.sessionId);
    if (!session || session.userId !== decoded.userId) {
      logFailedAttempt(req);
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    // Update last active time
    session.lastActive = Date.now();
    
    // Get user from database to ensure they still exist and are authorized
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        university: true,
        emailVerified: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      logFailedAttempt(req);
      activeSessions.delete(decoded.sessionId);
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.emailVerified) {
      logFailedAttempt(req);
      return res.status(401).json({ error: 'Email not verified' });
    }

    // Generate and verify client fingerprint for additional security
    const clientFingerprint = generateClientFingerprint(req);
    req.clientFingerprint = clientFingerprint;
    req.sessionId = decoded.sessionId;
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    logFailedAttempt(req);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    
    return res.status(403).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      logFailedAttempt(req);
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`User ${req.user.id} attempted to access resource requiring roles ${roles.join(', ')} but has role ${req.user.role}`);
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Enhanced role checking with hierarchical permissions
export const requirePermission = (permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      logFailedAttempt(req);
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Define role hierarchy and permissions
    const rolePermissions: { [key: string]: string[] } = {
      'admin': ['*'], // Admin has all permissions
      'university': ['manage_verifications', 'view_university_users', 'create_opportunities'],
      'student': ['create_achievements', 'mint_nfts', 'apply_opportunities']
    };

    const userPermissions = rolePermissions[req.user.role] || [];
    
    // Check if user has admin privileges (wildcard)
    if (userPermissions.includes('*')) {
      return next();
    }

    // Check if user has any of the required permissions
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      console.warn(`User ${req.user.id} attempted to access resource requiring permissions ${permissions.join(', ')}`);
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permissions,
        available: userPermissions
      });
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET) as AccessTokenPayload;
      
      // Verify token type and session if provided
      if (decoded.type === 'access') {
        const session = activeSessions.get(decoded.sessionId);
        if (session && session.userId === decoded.userId) {
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              university: true,
              emailVerified: true,
            },
          });

          if (user && user.emailVerified) {
            req.user = user;
            req.sessionId = decoded.sessionId;
          }
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Generate secure session tokens
export const generateTokens = (userId: string, email: string, role: string) => {
  const sessionId = crypto.randomUUID();
  
  const accessToken = jwt.sign(
    {
      userId,
      sessionId,
      email,
      role,
      type: 'access'
    } as AccessTokenPayload,
    config.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    {
      userId,
      sessionId,
      type: 'refresh'
    } as RefreshTokenPayload,
    config.JWT_SECRET,
    { expiresIn: '7d' } // Longer-lived refresh token
  );

  return { accessToken, refreshToken, sessionId };
};

// Create session
export const createSession = (sessionId: string, userId: string, req: Request) => {
  activeSessions.set(sessionId, {
    userId,
    createdAt: Date.now(),
    lastActive: Date.now(),
    ipAddress: req.ip,
    userAgent: req.get('User-Agent') || ''
  });
};

// Invalidate session
export const invalidateSession = (sessionId: string) => {
  activeSessions.delete(sessionId);
};

// Clean up expired sessions
setInterval(() => {
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActive > maxAge) {
      activeSessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Run cleanup every hour

// Get active sessions for a user
export const getUserSessions = (userId: string) => {
  const userSessions = [];
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      userSessions.push({
        sessionId,
        createdAt: session.createdAt,
        lastActive: session.lastActive,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent
      });
    }
  }
  return userSessions;
};

// Refresh token endpoint
export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as RefreshTokenPayload;
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Check if session is still active
    const session = activeSessions.get(decoded.sessionId);
    if (!session || session.userId !== decoded.userId) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    // Get user to generate new tokens
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true
      }
    });

    if (!user || !user.emailVerified) {
      invalidateSession(decoded.sessionId);
      return res.status(401).json({ error: 'User not found or not verified' });
    }

    // Generate new tokens with same session
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.email, user.role);
    
    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
};

// Logout handler
export const logoutHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (req.sessionId) {
      invalidateSession(req.sessionId);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Logout from all devices
export const logoutAllHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      // Invalidate all sessions for this user
      for (const [sessionId, session] of activeSessions.entries()) {
        if (session.userId === req.user.id) {
          activeSessions.delete(sessionId);
        }
      }
    }
    
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ error: 'Logout all failed' });
  }
};