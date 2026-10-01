import bcrypt from 'bcryptjs';
import { Router } from 'express';
import db from '../config/database';
import {
  clearAdminSessionCookie,
  getAuthenticatedAdmin,
  requireAdmin,
  setAdminSessionCookie,
} from '../middleware/auth';

interface AdminWithPassword {
  id: number;
  email: string;
  display_name: string;
  role: string;
  password_hash: string;
  is_active: number | boolean;
}

const router = Router();

const publicAdmin = (admin: Pick<AdminWithPassword, 'id' | 'email' | 'display_name' | 'role'>) => ({
  id: admin.id,
  email: admin.email,
  displayName: admin.display_name,
  role: admin.role,
});

router.post('/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    res.status(422).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, email, display_name, role, password_hash, is_active FROM admins WHERE email = ? LIMIT 1',
      [email],
    );
    const admin = (rows as AdminWithPassword[])[0];
    const valid = admin && Boolean(admin.is_active) && await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    await db.execute('UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);
    setAdminSessionCookie(res, admin.id);
    res.json({ admin: publicAdmin(admin) });
  } catch (error) {
    console.error('[Auth] Login failed:', error);
    res.status(500).json({ error: 'Authentication unavailable' });
  }
});

router.post('/logout', (_req, res) => {
  clearAdminSessionCookie(res);
  res.status(204).send();
});

router.get('/me', async (req, res) => {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    res.json({ admin: publicAdmin(admin) });
  } catch (error) {
    console.error('[Auth] Session lookup failed:', error);
    res.status(500).json({ error: 'Authentication unavailable' });
  }
});

router.post('/change-password', requireAdmin, async (req, res) => {
  const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
  const adminId = res.locals.admin.id as number;

  if (!currentPassword || newPassword.length < 12) {
    res.status(422).json({ error: 'Current password and a new password of at least 12 characters are required' });
    return;
  }

  try {
    const [rows] = await db.execute('SELECT password_hash FROM admins WHERE id = ? AND is_active = 1 LIMIT 1', [adminId]);
    const admin = (rows as Array<{ password_hash: string }>)[0];
    if (!admin || !(await bcrypt.compare(currentPassword, admin.password_hash))) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.execute(
      'UPDATE admins SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, adminId],
    );
    clearAdminSessionCookie(res);
    res.status(204).send();
  } catch (error) {
    console.error('[Auth] Password change failed:', error);
    res.status(500).json({ error: 'Password change unavailable' });
  }
});

export default router;
