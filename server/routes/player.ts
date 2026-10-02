import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import db from '../config/database';
import { requireAdmin } from '../middleware/auth';

interface PlayerRow extends RowDataPacket {
  id: number;
  name_ar: string;
  name_en: string | null;
  date_of_birth: string | null;
  profile_data: Record<string, unknown> | string | null;
}

const router = Router();
const safePlayerImage = (value: string): boolean => {
  if (value === '' || /^https?:\/\//i.test(value)) return true;
  return value.startsWith('/media/')
    && /^\/media\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value)
    && !value.includes('..')
    && !value.includes('//');
};

const optionalHttpUrl = (value: unknown): boolean => {
  if (value === undefined || value === '') return true;
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const requiredTextFields = [
  'nameAr', 'nameEn', 'nationalityAr', 'nationalityEn', 'locationAr', 'locationEn',
  'primaryPositionAr', 'primaryPositionEn', 'secondaryPositionAr', 'secondaryPositionEn',
  'objectiveAr', 'objectiveEn', 'educationAr', 'educationEn',
  'heroImage', 'profilePhoto',
] as const;

const validPlayer = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const player = value as Record<string, unknown>;
  if (requiredTextFields.some((field) => typeof player[field] !== 'string')) return false;
  if (typeof player.dob !== 'string') return false;
  if (player.dob) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(player.dob)) return false;
    const date = new Date(`${player.dob}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== player.dob) return false;
  }
  if (!Number.isFinite(player.heightCm) || !Number.isFinite(player.weightKg)) return false;
  if (!Array.isArray(player.positionsOrder) || player.positionsOrder.some((item) => !['primary', 'secondary'].includes(item as string))) return false;
  if (player.socialLinks !== undefined && (!player.socialLinks || typeof player.socialLinks !== 'object' || Array.isArray(player.socialLinks))) return false;
  if (player.email !== undefined && typeof player.email !== 'string') return false;
  if (player.phone !== undefined && typeof player.phone !== 'string') return false;
  if (player.whatsapp !== undefined && typeof player.whatsapp !== 'string') return false;
  if (typeof player.email === 'string' && player.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player.email)) return false;
  const socialKeys = ['instagram', 'snapchat', 'facebook', 'youtube', 'tiktok', 'twitter', 'transfermarkt'];
  const socialLinks = (player.socialLinks || {}) as Record<string, unknown>;
  for (const key of socialKeys) {
    if (!optionalHttpUrl(socialLinks[key])) return false;
  }
  if (!optionalHttpUrl(player.websiteUrl)) return false;
  const imageFields = ['heroImage', 'profilePhoto', 'mobileHeroImage', 'playerCutoutImage', 'aboutImage', 'cvPreviewImage', 'socialShareImage'];
  for (const field of imageFields) {
    const image = player[field];
    if (image === undefined) continue;
    if (typeof image !== 'string' || !safePlayerImage(image)) return false;
  }
  return true;
};

const parseProfileData = (value: PlayerRow['profile_data']): Record<string, unknown> => {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return value;
};

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query<PlayerRow[]>(
      "SELECT id, name_ar, name_en, DATE_FORMAT(date_of_birth, '%Y-%m-%d') AS date_of_birth, profile_data FROM players ORDER BY id ASC LIMIT 1",
    );
    const player = rows[0];
    if (!player) {
      res.status(404).json({ error: 'Player profile has not been initialized' });
      return;
    }

    const profile = parseProfileData(player.profile_data);
    res.json({
      ...profile,
      nameAr: player.name_ar,
      nameEn: player.name_en ?? profile.nameEn ?? '',
      dob: player.date_of_birth ?? profile.dob ?? '',
    });
  } catch (error) {
    console.error('[Player API] Read failed:', error);
    res.status(500).json({ error: 'Unable to load player profile' });
  }
});

router.put('/', requireAdmin, async (req, res) => {
  const player = req.body;
  if (!validPlayer(player)) {
    res.status(422).json({ error: 'Invalid player profile' });
    return;
  }

  try {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query<PlayerRow[]>(
        'SELECT id FROM players ORDER BY id ASC LIMIT 1 FOR UPDATE',
      );
      const dob = player.dob || null;
      const profileData = JSON.stringify(player);

      if (rows[0]) {
        await connection.query(
          'UPDATE players SET name_ar = ?, name_en = ?, date_of_birth = ?, profile_data = ? WHERE id = ?',
          [player.nameAr, player.nameEn, dob, profileData, rows[0].id],
        );
      } else {
        await connection.query(
          'INSERT INTO players (name_ar, name_en, date_of_birth, profile_data) VALUES (?, ?, ?, ?)',
          [player.nameAr, player.nameEn, dob, profileData],
        );
      }

      await connection.commit();
      res.json(player);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[Player API] Save failed:', error);
    res.status(500).json({ error: 'Unable to save player profile' });
  }
});

export default router;
