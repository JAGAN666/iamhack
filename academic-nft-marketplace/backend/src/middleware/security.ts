import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import Joi from 'joi';

// Enhanced rate limiting
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.round(windowMs / 1000),
      });
    },
  });
};

// Specific rate limits for different endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts');
export const uploadRateLimit = createRateLimit(60 * 60 * 1000, 10, 'Too many file uploads');
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100);
export const strictRateLimit = createRateLimit(5 * 60 * 1000, 10, 'Too many requests');

// Enhanced helmet configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Input validation middleware
export const validateInput = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message),
      });
    }
    next();
  };
};

// Common validation schemas with enhanced security
export const schemas = {
  register: Joi.object({
    email: Joi.string().email().max(255).required().trim(),
    universityEmail: Joi.string().email().max(255).required().trim(),
    firstName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s'-]+$/).required().trim(),
    lastName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s'-]+$/).required().trim(),
    university: Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s&.-]+$/).required().trim(),
    studentId: Joi.string().max(50).optional().trim(),
  }).options({ stripUnknown: true }),
  
  achievement: Joi.object({
    type: Joi.string().valid('gpa', 'research', 'leadership').required(),
    title: Joi.string().min(5).max(200).pattern(/^[a-zA-Z0-9\s\-_.,!?()]+$/).required().trim(),
    description: Joi.string().min(10).max(1000).required().trim(),
    gpaValue: Joi.number().precision(2).min(0).max(4.0).when('type', {
      is: 'gpa',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }).options({ stripUnknown: true }),
  
  opportunity: Joi.object({
    title: Joi.string().min(5).max(200).pattern(/^[a-zA-Z0-9\s\-_.,!?()]+$/).required().trim(),
    description: Joi.string().min(10).max(2000).required().trim(),
    type: Joi.string().valid('internship', 'job', 'research', 'mentorship', 'event', 'scholarship').required(),
    category: Joi.string().valid('digital', 'physical').required(),
    requiredNFTs: Joi.array().items(Joi.string().valid('gpa_guardian', 'research_rockstar', 'leadership_legend')).min(1).max(3).required(),
    salary: Joi.string().max(100).pattern(/^[\$€£¥]?[0-9,\-\s]+[kKmM]?(\s?-\s?[\$€£¥]?[0-9,\-\s]+[kKmM]?)?$/).optional().trim(),
    location: Joi.string().max(200).optional().trim(),
    remote: Joi.boolean().default(false),
    startDate: Joi.date().greater('now').optional(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
    applicationDeadline: Joi.date().greater('now').optional(),
    maxParticipants: Joi.number().integer().min(1).max(10000).optional(),
  }).options({ stripUnknown: true }),

  // Login validation
  login: Joi.object({
    email: Joi.string().email().max(255).required().trim(),
  }).options({ stripUnknown: true }),

  // File upload validation
  fileUpload: Joi.object({
    filename: Joi.string().pattern(/^[a-zA-Z0-9_\-\.]+$/).max(255).required(),
    mimetype: Joi.string().valid('application/pdf', 'image/jpeg', 'image/png', 'image/jpg').required(),
    size: Joi.number().max(10 * 1024 * 1024).required() // 10MB max
  }).options({ stripUnknown: true }),
};

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this information already exists',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Please log in again',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

// SQL injection protection
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\/\*|\*\/|--|\#)/gi,
    /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\(\s*\d+\s*\))/gi
  ];

  const checkForInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return sqlInjectionPatterns.some(pattern => pattern.test(obj));
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkForInjection(value));
    }
    return false;
  };

  if (checkForInjection(req.body) || checkForInjection(req.query) || checkForInjection(req.params)) {
    return res.status(400).json({
      error: 'Potentially malicious input detected',
      code: 'SECURITY_VIOLATION'
    });
  }

  next();
};

// XSS protection
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<[^>]*\b(onerror|onload|onclick|onmouseover)\s*=[^>]*>/gi
  ];

  const sanitizeString = (str: string): string => {
    let sanitized = str;
    xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    return sanitized;
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      Object.keys(obj).forEach(key => {
        sanitized[key] = sanitizeObject(obj[key]);
      });
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

// CSRF protection for state-changing operations
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.headers['csrf-token'];
    const sessionToken = req.headers['x-session-token'];
    
    if (!token || !sessionToken) {
      return res.status(403).json({
        error: 'CSRF protection: missing required tokens',
        code: 'CSRF_TOKEN_MISSING'
      });
    }

    // In a real implementation, you would verify the CSRF token
    // For this demo, we'll just check that tokens are present
    if (typeof token !== 'string' || typeof sessionToken !== 'string') {
      return res.status(403).json({
        error: 'CSRF protection: invalid token format',
        code: 'CSRF_TOKEN_INVALID'
      });
    }
  }

  next();
};

// Request size limits
export const requestSizeLimit = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request entity too large',
        maxSize: maxSize,
        received: contentLength
      });
    }
    
    next();
  };
};

// IP allowlist/blocklist middleware
const blockedIPs = new Set<string>();
const allowedIPs = new Set<string>();

export const ipFilter = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip;
  
  // Check if IP is explicitly blocked
  if (blockedIPs.has(clientIP)) {
    return res.status(403).json({
      error: 'Access denied from this IP address',
      code: 'IP_BLOCKED'
    });
  }
  
  // If allowlist is configured and IP is not in allowlist
  if (allowedIPs.size > 0 && !allowedIPs.has(clientIP)) {
    return res.status(403).json({
      error: 'Access denied: IP not in allowlist',
      code: 'IP_NOT_ALLOWED'
    });
  }
  
  next();
};

// Functions to manage IP lists (for admin use)
export const blockIP = (ip: string) => blockedIPs.add(ip);
export const unblockIP = (ip: string) => blockedIPs.delete(ip);
export const allowIP = (ip: string) => allowedIPs.add(ip);
export const disallowIP = (ip: string) => allowedIPs.delete(ip);