/**
 * NEXUSAI AUTHENTICATION & SESSION SERVICE
 * Location: server/authService.js
 * Platform: NexusAI v9.5.0 Enterprise Agentic Platform
 */

import crypto from 'crypto';
import { dbGetSettings, dbSaveSetting } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusai_enterprise_super_secret_auth_key_2026';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_PLAIN = 'Admin@NexusAI123!';

// Pre-seeded Admin User Memory Object
let seededUser = null;
const activeSessions = new Map(); // token -> { username, expiresAt }

/**
 * Hash password using crypto.scryptSync
 */
function hashPassword(password, salt = 'nexusai_salt_v9') {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

/**
 * Generate Secure Session Token
 */
function generateToken(username) {
  const payload = JSON.stringify({ username, createdAt: Date.now() });
  const hmac = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  const token = Buffer.from(payload).toString('base64url') + '.' + hmac;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  activeSessions.set(token, { username, expiresAt });
  return token;
}

/**
 * Verify Session Token
 */
export function verifyToken(token) {
  if (!token) return null;
  
  const session = activeSessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    return { username: session.username };
  }

  // Fallback: Validate token signature manually
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const payloadStr = Buffer.from(parts[0], 'base64url').toString('utf-8');
    const expectedHmac = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(parts[1]), Buffer.from(expectedHmac))) {
      const payload = JSON.parse(payloadStr);
      if (payload && payload.username === ADMIN_USERNAME) {
        return { username: ADMIN_USERNAME };
      }
    }
  } catch (err) {
    return null;
  }
  return null;
}

/**
 * Initialize Admin User Account
 */
export async function initAuthSystem() {
  const salt = 'nexusai_admin_salt';
  const hashedPassword = hashPassword(ADMIN_PASSWORD_PLAIN, salt);

  seededUser = {
    username: ADMIN_USERNAME,
    passwordHash: hashedPassword,
    salt,
    role: 'administrator',
    createdAt: new Date().toISOString()
  };

  await dbSaveSetting('auth_admin_user', {
    username: ADMIN_USERNAME,
    role: 'administrator',
    initialized: true
  });

  console.log('🔒 [Auth System] Admin account initialized (`admin` / `Admin@NexusAI123!`). Signup disabled.');
}

/**
 * Authenticate User Login
 */
export function authenticateUser(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required.');
  }

  if (username.trim() !== ADMIN_USERNAME) {
    throw new Error('Invalid credentials.');
  }

  const computedHash = hashPassword(password, seededUser.salt);
  if (computedHash !== seededUser.passwordHash) {
    throw new Error('Invalid credentials.');
  }

  const token = generateToken(ADMIN_USERNAME);
  return {
    success: true,
    token,
    user: {
      username: ADMIN_USERNAME,
      role: 'administrator'
    }
  };
}

/**
 * Express Authentication Middleware
 */
export function authMiddleware(req, res, next) {
  // Public paths exempt from authentication
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/status',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/status',
    '/api/health',
    '/health',
    '/favicon.svg',
    '/logo.jpg',
    '/ai_avatar.jpg'
  ];

  if (publicPaths.includes(req.path) || req.path.startsWith('/assets')) {
    return next();
  }

  // Extract Token from Authorization Header or Cookie or Query
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication Required. Please log in with admin credentials.',
      code: 'UNAUTHORIZED'
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please log in again.',
      code: 'INVALID_TOKEN'
    });
  }

  req.user = user;
  next();
}
