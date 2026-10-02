import { Router } from 'express';
import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import db from '../config/database';
import { requireAdmin } from '../middleware/auth';

interface SettingRow extends RowDataPacket {
  setting_value: Record<string, unknown> | string;
}

const router = Router();

const getSetting = (key: string) => async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.execute<SettingRow[]>(
      'SELECT setting_value FROM site_settings WHERE setting_key = ? LIMIT 1',
      [key],
    );
    const value = rows[0]?.setting_value ?? null;
    res.json(typeof value === 'string' ? JSON.parse(value) : value);
  } catch (error) {
    console.error(`[Settings API] Read ${key} failed:`, error);
    res.status(500).json({ error: 'Unable to load site settings' });
  }
};

const putSetting = (key: string) => async (req: Request, res: Response) => {
  const value: unknown = req.body;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    res.status(422).json({ error: 'Settings must be a JSON object' });
    return;
  }

  try {
    await db.execute(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [key, JSON.stringify(value)],
    );
    res.json(value);
  } catch (error) {
    console.error(`[Settings API] Save ${key} failed:`, error);
    res.status(500).json({ error: 'Unable to save site settings' });
  }
};

router.get('/hero', getSetting('hero'));
router.put('/hero', requireAdmin, putSetting('hero'));
router.get('/branding', getSetting('branding'));
router.put('/branding', requireAdmin, putSetting('branding'));

export default router;
