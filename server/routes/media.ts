import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../config/database';
import { requireAdmin } from '../middleware/auth';

interface MediaRow extends RowDataPacket {
  id: number;
  title_ar: string;
  title_en: string | null;
  category: string | null;
  content_ar: string | null;
  content_en: string | null;
  cover_asset_id: number | null;
  cover_url: string | null;
  external_url: string | null;
  published: boolean | number;
  sort_order: number;
}

const router = Router();
const categories = new Set(['interview', 'video', 'article', 'image']);
const fields = new Set(['titleAr', 'titleEn', 'category', 'contentAr', 'contentEn', 'coverAssetId', 'externalUrl', 'published', 'sortOrder']);

const mapMedia = (row: MediaRow) => ({
  id: String(row.id), titleAr: row.title_ar, titleEn: row.title_en ?? '', category: row.category,
  contentAr: row.content_ar ?? '', contentEn: row.content_en ?? '',
  coverAssetId: row.cover_asset_id === null ? null : String(row.cover_asset_id), coverUrl: row.cover_url ?? '',
  externalUrl: row.external_url ?? '', published: Boolean(row.published), sortOrder: row.sort_order,
});

const selectMedia = async (id?: number, publishedOnly = false): Promise<MediaRow[]> => {
  const conditions: string[] = [];
  const values: number[] = [];
  if (id !== undefined) { conditions.push('m.id = ?'); values.push(id); }
  if (publishedOnly) conditions.push('m.published = TRUE');
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.query<MediaRow[]>(
    `SELECT m.id, m.title_ar, m.title_en, m.category, m.content_ar, m.content_en, m.cover_asset_id, a.public_url AS cover_url, m.external_url, m.published, m.sort_order
     FROM media_items m LEFT JOIN assets a ON a.id = m.cover_asset_id ${where} ORDER BY m.sort_order, m.id`, values,
  );
  return rows;
};

const validateInput = (body: unknown): Record<string, unknown> | null => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const value = body as Record<string, unknown>;
  if (Object.keys(value).some(key => !fields.has(key))) return null;
  if (typeof value.titleAr !== 'string' || !value.titleAr.trim() || value.titleAr.trim().length > 255) return null;
  if (typeof value.titleEn !== 'string' || value.titleEn.trim().length > 255) return null;
  if (typeof value.category !== 'string' || !categories.has(value.category)) return null;
  if (typeof value.contentAr !== 'string' || value.contentAr.length > 30000) return null;
  if (typeof value.contentEn !== 'string' || value.contentEn.length > 30000) return null;
  if (value.coverAssetId !== null && (!Number.isSafeInteger(Number(value.coverAssetId)) || Number(value.coverAssetId) <= 0)) return null;
  if (typeof value.externalUrl !== 'string' || value.externalUrl.length > 1000) return null;
  if (value.externalUrl) {
    try { if (!['http:', 'https:'].includes(new URL(value.externalUrl).protocol)) return null; } catch { return null; }
  }
  if (typeof value.published !== 'boolean') return null;
  if (!Number.isSafeInteger(value.sortOrder) || Number(value.sortOrder) < 0 || Number(value.sortOrder) > 1000000) return null;
  return { ...value, titleAr: value.titleAr.trim(), titleEn: value.titleEn.trim(), externalUrl: value.externalUrl.trim() };
};

const hasValidCover = async (assetId: unknown): Promise<boolean> => {
  if (assetId === null) return true;
  const [rows] = await db.query<RowDataPacket[]>('SELECT id FROM assets WHERE id = ? AND type = ? LIMIT 1', [assetId, 'image']);
  return rows.length > 0;
};

const save = async (req: Request, res: Response, id?: number) => {
  const value = validateInput(req.body);
  if (!value) { res.status(422).json({ error: 'Invalid media item' }); return; }
  try {
    if (!await hasValidCover(value.coverAssetId)) { res.status(422).json({ error: 'Cover asset not found' }); return; }
    if (id === undefined) {
      const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO media_items (title_ar, title_en, category, content_ar, content_en, cover_asset_id, external_url, published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [value.titleAr, value.titleEn, value.category, value.contentAr, value.contentEn, value.coverAssetId, value.externalUrl, value.published, value.sortOrder],
      );
      res.status(201).json(mapMedia((await selectMedia(result.insertId))[0]));
      return;
    }
    const [existing] = await db.query<RowDataPacket[]>('SELECT id FROM media_items WHERE id = ? LIMIT 1', [id]);
    if (!existing.length) { res.status(404).json({ error: 'Media item not found' }); return; }
    await db.query(
      'UPDATE media_items SET title_ar = ?, title_en = ?, category = ?, content_ar = ?, content_en = ?, cover_asset_id = ?, external_url = ?, published = ?, sort_order = ? WHERE id = ?',
      [value.titleAr, value.titleEn, value.category, value.contentAr, value.contentEn, value.coverAssetId, value.externalUrl, value.published, value.sortOrder, id],
    );
    res.json(mapMedia((await selectMedia(id))[0]));
  } catch (error) {
    console.error('[Media API] Save failed:', error);
    res.status(500).json({ error: 'Unable to save media item' });
  }
};

router.get('/', async (_req, res) => {
  try { res.json((await selectMedia(undefined, true)).map(mapMedia)); }
  catch (error) { console.error('[Media API] Public list failed:', error); res.status(500).json({ error: 'Media list unavailable' }); }
});

router.get('/admin', requireAdmin, async (_req, res) => {
  try { res.json((await selectMedia()).map(mapMedia)); }
  catch (error) { console.error('[Media API] Admin list failed:', error); res.status(500).json({ error: 'Media list unavailable' }); }
});

router.post('/', requireAdmin, (req, res) => { void save(req, res); });
router.put('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) { res.status(422).json({ error: 'Invalid media id' }); return; }
  void save(req, res, id);
});
router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) { res.status(422).json({ error: 'Invalid media id' }); return; }
  try {
    const [result] = await db.query<ResultSetHeader>('DELETE FROM media_items WHERE id = ?', [id]);
    if (!result.affectedRows) { res.status(404).json({ error: 'Media item not found' }); return; }
    res.status(204).send();
  } catch (error) { console.error('[Media API] Delete failed:', error); res.status(500).json({ error: 'Unable to delete media item' }); }
});

export default router;
