import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import db from '../config/database';

const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

interface AdminRow {
  id: number;
  email: string;
  display_name: string;
  role: string;
  password_hash?: string;
  is_active: number | boolean;
}

const requiredSessionSecret = (): string => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('Missing required environment variable: SESSION_SECRET');
  }
  return secret;
};

const encode = (value: string): string => Buffer.from(value).toString('base64url');

const sign = (value: string): string =>
  crypto.createHmac('sha256', requiredSessionSecret()).update(value).digest('base64url');

const createSessionToken = (adminId: number): string => {
  const payload = encode(JSON.stringify({ adminId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }));
  return `${payload}.${sign(payload)}`;
};

const getCookie = (req: Request, name: string): string | undefined => {
  const header = req.headers.cookie;
  if (!header) return undefined;

  const value = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : undefined;
};

const getAdminIdFromRequest = (req: Request): number | null => {
  const token = getCookie(req, SESSION_COOKIE);
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { adminId?: number; exp?: number };
    if (!parsed.adminId || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed.adminId;
  } catch {
    return null;
  }
};

export const setAdminSessionCookie = (res: Response, adminId: number): void => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(createSessionToken(adminId))}; Max-Age=${SESSION_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secure}`,
  );
};

export const clearAdminSessionCookie = (res: Response): void => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secure}`);
};

export const getAuthenticatedAdmin = async (req: Request): Promise<AdminRow | null> => {
  const adminId = getAdminIdFromRequest(req);
  if (!adminId) return null;

  const [rows] = await db.execute(
    'SELECT id, email, display_name, role, is_active FROM admins WHERE id = ? LIMIT 1',
    [adminId],
  );
  const admin = (rows as AdminRow[])[0];
  return admin && Boolean(admin.is_active) ? admin : null;
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    res.locals.admin = admin;
    next();
  } catch (error) {
    console.error('[Auth] Session validation failed:', error);
    res.status(500).json({ error: 'Authentication unavailable' });
  }
};
