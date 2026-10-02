import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../config/database';
import { requireAdmin } from '../middleware/auth';

interface InquiryRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  organization: string | null;
  message: string;
  status: string;
  read_at: Date | null;
  created_at: Date;
}

const router = Router();
const recentSubmissions = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

const mapInquiry = (row: InquiryRow) => ({
  id: String(row.id), name: row.name, email: row.email, organization: row.organization ?? '',
  message: row.message, status: row.status, readAt: row.read_at?.toISOString() ?? null,
  createdAt: row.created_at.toISOString(),
});

const validateInquiry = (body: unknown): { name: string; email: string; organization: string; message: string } | null => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const data = body as Record<string, unknown>;
  const allowed = new Set(['name', 'email', 'organization', 'message']);
  if (Object.keys(data).some(key => !allowed.has(key))) return null;
  if (typeof data.name !== 'string' || typeof data.email !== 'string' || typeof data.message !== 'string') return null;
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const organization = data.organization === undefined ? '' : data.organization;
  const message = data.message.trim();
  if (typeof organization !== 'string') return null;
  const cleanOrganization = organization.trim();
  if (!name || name.length > 255 || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (cleanOrganization.length > 255 || !message || message.length > 8000) return null;
  return { name, email, organization: cleanOrganization, message };
};

const rateLimited = (ip: string): boolean => {
  const now = Date.now();
  const recent = (recentSubmissions.get(ip) ?? []).filter(time => now - time < WINDOW_MS);
  if (recent.length >= MAX_SUBMISSIONS) { recentSubmissions.set(ip, recent); return true; }
  recent.push(now);
  recentSubmissions.set(ip, recent);
  if (recentSubmissions.size > 10000) {
    for (const [key, times] of recentSubmissions) {
      if (times.every(time => now - time >= WINDOW_MS)) recentSubmissions.delete(key);
    }
  }
  return false;
};

router.post('/', async (req: Request, res: Response) => {
  const input = validateInquiry(req.body);
  if (!input) { res.status(422).json({ error: 'Invalid inquiry' }); return; }
  if (rateLimited(req.ip || 'unknown')) { res.status(429).json({ error: 'Too many inquiries. Please try again later.' }); return; }
  try {
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO contact_inquiries (name, email, organization, message) VALUES (?, ?, ?, ?)',
      [input.name, input.email, input.organization || null, input.message],
    );
    res.status(201).json({ id: String(result.insertId), status: 'new' });
  } catch (error) { console.error('[Inquiries API] Submit failed:', error); res.status(500).json({ error: 'Unable to save inquiry' }); }
});

router.get('/', requireAdmin, async (_req, res) => {
  try {
    const [rows] = await db.query<InquiryRow[]>('SELECT id, name, email, organization, message, status, read_at, created_at FROM contact_inquiries ORDER BY created_at DESC, id DESC');
    res.json(rows.map(mapInquiry));
  } catch (error) { console.error('[Inquiries API] List failed:', error); res.status(500).json({ error: 'Inquiry list unavailable' }); }
});

router.patch('/:id/read', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) { res.status(422).json({ error: 'Invalid inquiry id' }); return; }
  try {
    const [result] = await db.query<ResultSetHeader>("UPDATE contact_inquiries SET status = 'read', read_at = COALESCE(read_at, CURRENT_TIMESTAMP) WHERE id = ?", [id]);
    if (!result.affectedRows) {
      const [rows] = await db.query<RowDataPacket[]>('SELECT id FROM contact_inquiries WHERE id = ? LIMIT 1', [id]);
      if (!rows.length) { res.status(404).json({ error: 'Inquiry not found' }); return; }
    }
    res.status(204).send();
  } catch (error) { console.error('[Inquiries API] Mark read failed:', error); res.status(500).json({ error: 'Unable to update inquiry' }); }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) { res.status(422).json({ error: 'Invalid inquiry id' }); return; }
  try {
    const [result] = await db.query<ResultSetHeader>('DELETE FROM contact_inquiries WHERE id = ?', [id]);
    if (!result.affectedRows) { res.status(404).json({ error: 'Inquiry not found' }); return; }
    res.status(204).send();
  } catch (error) { console.error('[Inquiries API] Delete failed:', error); res.status(500).json({ error: 'Unable to delete inquiry' }); }
});

export default router;
