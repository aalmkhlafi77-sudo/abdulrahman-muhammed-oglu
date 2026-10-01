import { randomBytes, createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../config/database';
import { getUploadConfig, storedImageName } from '../config/uploads';
import { getAuthenticatedAdmin, requireAdmin } from '../middleware/auth';

interface AssetRow extends RowDataPacket {
  id: number;
  stored_filename: string;
  mime_type: string;
  file_size: number;
  public_url: string;
}

interface PhotoRow extends RowDataPacket {
  id: number;
  asset_id: number;
  title_ar: string | null;
  title_en: string | null;
  published: number | boolean;
  sort_order: number;
  display_config: Record<string, unknown> | string | null;
  stored_filename: string;
  mime_type: string;
  file_size: number;
  public_url: string;
  created_at: Date;
  updated_at: Date;
}

type PhotoInput = {
  assetId: number;
  titleAr: string;
  titleEn: string;
  published: boolean;
  sortOrder: number;
  displayConfig: Record<string, unknown>;
};

const router = Router();
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const receive = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 0 } }).single('file');
const receiveUpload = (req: Request, res: Response, next: (error?: unknown) => void): void => {
  receive(req, res, (error) => {
    if (error) {
      res.status(error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: 'Invalid image upload' });
      return;
    }
    next();
  });
};

const positiveId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const imageFormat = (buffer: Buffer): { extension: 'jpg' | 'png' | 'webp'; mimeType: string } | null => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { extension: 'jpg', mimeType: 'image/jpeg' };
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { extension: 'png', mimeType: 'image/png' };
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return { extension: 'webp', mimeType: 'image/webp' };
  return null;
};

const parseDisplay = (value: PhotoRow['display_config']): Record<string, unknown> => {
  if (!value) return {};
  if (typeof value === 'string') {
    try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
  }
  return value;
};

const mapAsset = (row: AssetRow) => ({
  id: String(row.id),
  imageUrl: row.public_url,
  fileName: row.stored_filename,
  mimeType: row.mime_type,
  fileSize: Number(row.file_size),
});

const mapPhoto = (row: PhotoRow) => {
  const display = parseDisplay(row.display_config);
  return {
    id: String(row.id),
    assetId: String(row.asset_id),
    titleAr: row.title_ar ?? '',
    titleEn: row.title_en ?? '',
    imageUrl: row.public_url,
    fileName: row.stored_filename,
    mimeType: row.mime_type,
    fileSize: Number(row.file_size),
    sourceType: 'upload' as const,
    published: Boolean(row.published),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...display,
  };
};

const validatePhoto = (body: unknown): PhotoInput | null => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const data = body as Record<string, unknown>;
  const assetId = positiveId(data.assetId);
  if (!assetId) return null;
  const titleAr = data.titleAr ?? '';
  const titleEn = data.titleEn ?? '';
  if (typeof titleAr !== 'string' || typeof titleEn !== 'string' || titleAr.length > 255 || titleEn.length > 255) return null;
  if (data.published !== undefined && typeof data.published !== 'boolean') return null;
  if (data.featured !== undefined && typeof data.featured !== 'boolean') return null;
  const sortOrder = data.sortOrder ?? 0;
  if (typeof sortOrder !== 'number' || !Number.isSafeInteger(sortOrder) || sortOrder < 0) return null;
  const focalPoint = data.focalPoint;
  if (focalPoint !== undefined && (!focalPoint || typeof focalPoint !== 'object' || Array.isArray(focalPoint)
    || !Number.isFinite((focalPoint as Record<string, unknown>).x) || !Number.isFinite((focalPoint as Record<string, unknown>).y)
    || Number((focalPoint as Record<string, unknown>).x) < 0 || Number((focalPoint as Record<string, unknown>).x) > 100
    || Number((focalPoint as Record<string, unknown>).y) < 0 || Number((focalPoint as Record<string, unknown>).y) > 100)) return null;
  const displayConfig: Record<string, unknown> = {};
  for (const key of ['clubNameAr', 'clubNameEn', 'category', 'captionAr', 'captionEn', 'altText']) {
    const value = data[key];
    if (value !== undefined) {
      if (typeof value !== 'string' || value.length > 500) return null;
      displayConfig[key] = value;
    }
  }
  if (focalPoint !== undefined) displayConfig.focalPoint = focalPoint;
  displayConfig.featured = data.featured ?? false;
  return { assetId, titleAr, titleEn, published: data.published ?? false, sortOrder, displayConfig };
};

const getPhoto = async (id: number): Promise<PhotoRow | null> => {
  const [rows] = await db.query<PhotoRow[]>(
    'SELECT p.*, a.stored_filename, a.mime_type, a.file_size, a.public_url FROM photos p JOIN assets a ON a.id = p.asset_id WHERE p.id = ? LIMIT 1', [id],
  );
  return rows[0] ?? null;
};

const isReferencedByJson = async (url: string): Promise<boolean> => {
  const targets = [
    ['players', 'profile_data'], ['clubs', 'content_data'], ['career_entries', 'details'],
    ['achievements', 'content_data'], ['performance_stats', 'content_data'], ['videos', 'content_data'],
    ['site_settings', 'setting_value'],
  ] as const;
  for (const [table, column] of targets) {
    const [rows] = await db.query<RowDataPacket[]>(`SELECT 1 FROM ${table} WHERE JSON_SEARCH(${column}, 'one', ?) IS NOT NULL LIMIT 1`, [url]);
    if (rows.length) return true;
  }
  return false;
};

const assetHasOtherUse = async (assetId: number, url: string): Promise<boolean> => {
  for (const [table, column] of [
    ['photos', 'asset_id'], ['clubs', 'logo_asset_id'], ['videos', 'thumbnail_asset_id'],
    ['media_items', 'cover_asset_id'], ['documents', 'asset_id'],
  ] as const) {
    const [rows] = await db.query<RowDataPacket[]>(`SELECT 1 FROM ${table} WHERE ${column} = ? LIMIT 1`, [assetId]);
    if (rows.length) return true;
  }
  return isReferencedByJson(url);
};

const assetHasBlockingUse = async (assetId: number, url: string): Promise<boolean> => {
  const [photos] = await db.query<RowDataPacket[]>('SELECT 1 FROM photos WHERE asset_id = ? LIMIT 1', [assetId]);
  return photos.length > 0 || isReferencedByJson(url);
};

const removeStoredFile = async (filename: string): Promise<void> => {
  const config = getUploadConfig();
  if (!config || !storedImageName(filename)) throw new Error('Upload storage unavailable');
  await fs.unlink(path.join(config.root, filename));
};

router.post('/assets/upload', requireAdmin, receiveUpload, async (req, res) => {
  const config = getUploadConfig();
  if (!config) { res.status(503).json({ error: 'Upload storage is not configured' }); return; }
  if (!req.file?.buffer?.length) { res.status(422).json({ error: 'Image file is required' }); return; }
  const format = imageFormat(req.file.buffer);
  if (!format || !['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) {
    res.status(415).json({ error: 'Only JPEG, PNG, and WebP images are accepted' });
    return;
  }
  const filename = `${randomBytes(16).toString('hex')}.${format.extension}`;
  const publicUrl = `${config.baseUrl}/${filename}`;
  const filePath = path.join(config.root, filename);
  try {
    await fs.mkdir(config.root, { recursive: true });
    await fs.writeFile(filePath, req.file.buffer, { flag: 'wx', mode: 0o644 });
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO assets (type, stored_filename, mime_type, file_size, storage_path, public_url, source_type, checksum) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['image', filename, format.mimeType, req.file.buffer.length, filename, publicUrl, 'upload', createHash('sha256').update(req.file.buffer).digest('hex')],
    );
    res.status(201).json({ id: String(result.insertId), imageUrl: publicUrl, fileName: filename, mimeType: format.mimeType, fileSize: req.file.buffer.length });
  } catch (error) {
    await fs.unlink(filePath).catch(() => {});
    console.error('[Images] Upload failed:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

router.get('/assets', requireAdmin, async (_req, res) => {
  try {
    const [rows] = await db.query<AssetRow[]>('SELECT id, stored_filename, mime_type, file_size, public_url FROM assets WHERE type = ? ORDER BY id DESC', ['image']);
    res.json(rows.map(mapAsset));
  } catch (error) { console.error('[Images] Asset list failed:', error); res.status(500).json({ error: 'Asset list unavailable' }); }
});

router.delete('/assets/:id', requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) { res.status(422).json({ error: 'Invalid asset id' }); return; }
  try {
    const [rows] = await db.query<AssetRow[]>('SELECT id, stored_filename, public_url FROM assets WHERE id = ? AND type = ? LIMIT 1', [id, 'image']);
    const asset = rows[0];
    if (!asset) { res.status(404).json({ error: 'Asset not found' }); return; }
    if (await assetHasBlockingUse(id, asset.public_url)) { res.status(409).json({ error: 'Asset is in use' }); return; }
    if (!storedImageName(asset.stored_filename)) { res.status(409).json({ error: 'Asset has no managed file' }); return; }
    await db.query('UPDATE clubs SET logo_asset_id = NULL WHERE logo_asset_id = ?', [id]);
    const [result] = await db.query<ResultSetHeader>('DELETE FROM assets WHERE id = ?', [id]);
    if (!result.affectedRows) { res.status(404).json({ error: 'Asset not found' }); return; }
    await removeStoredFile(asset.stored_filename);
    res.status(204).send();
  } catch (error) { console.error('[Images] Asset deletion failed:', error); res.status(500).json({ error: 'Asset deletion failed' }); }
});

router.get('/photos', async (req, res) => {
  try {
    const admin = await getAuthenticatedAdmin(req);
    const [rows] = await db.query<PhotoRow[]>(
      `SELECT p.*, a.stored_filename, a.mime_type, a.file_size, a.public_url FROM photos p JOIN assets a ON a.id = p.asset_id ${admin ? '' : 'WHERE p.published = TRUE'} ORDER BY p.sort_order, p.id`,
    );
    res.json(rows.map(mapPhoto));
  } catch (error) { console.error('[Images] Photo list failed:', error); res.status(500).json({ error: 'Photo list unavailable' }); }
});

router.post('/photos', requireAdmin, async (req, res) => {
  const input = validatePhoto(req.body);
  if (!input) { res.status(422).json({ error: 'Invalid photo' }); return; }
  try {
    const [assets] = await db.query<AssetRow[]>('SELECT id FROM assets WHERE id = ? AND type = ? AND source_type = ? LIMIT 1', [input.assetId, 'image', 'upload']);
    if (!assets.length) { res.status(404).json({ error: 'Uploaded asset not found' }); return; }
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO photos (asset_id, title_ar, title_en, published, display_config, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [input.assetId, input.titleAr, input.titleEn, input.published, JSON.stringify(input.displayConfig), input.sortOrder],
    );
    res.status(201).json(mapPhoto((await getPhoto(result.insertId))!));
  } catch (error) { console.error('[Images] Photo creation failed:', error); res.status(500).json({ error: 'Photo creation failed' }); }
});

router.put('/photos/:id', requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  const input = validatePhoto(req.body);
  if (!id || !input) { res.status(422).json({ error: 'Invalid photo' }); return; }
  try {
    const [assets] = await db.query<AssetRow[]>('SELECT id FROM assets WHERE id = ? AND type = ? AND source_type = ? LIMIT 1', [input.assetId, 'image', 'upload']);
    if (!assets.length) { res.status(404).json({ error: 'Uploaded asset not found' }); return; }
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE photos SET asset_id = ?, title_ar = ?, title_en = ?, published = ?, display_config = ?, sort_order = ? WHERE id = ?',
      [input.assetId, input.titleAr, input.titleEn, input.published, JSON.stringify(input.displayConfig), input.sortOrder, id],
    );
    if (!result.affectedRows) { res.status(404).json({ error: 'Photo not found' }); return; }
    res.json(mapPhoto((await getPhoto(id))!));
  } catch (error) { console.error('[Images] Photo update failed:', error); res.status(500).json({ error: 'Photo update failed' }); }
});

router.delete('/photos/:id', requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) { res.status(422).json({ error: 'Invalid photo id' }); return; }
  try {
    const photo = await getPhoto(id);
    if (!photo) { res.status(404).json({ error: 'Photo not found' }); return; }
    await db.query('DELETE FROM photos WHERE id = ?', [id]);
    if (!await assetHasOtherUse(photo.asset_id, photo.public_url)) {
      await db.query('DELETE FROM assets WHERE id = ?', [photo.asset_id]);
      await removeStoredFile(photo.stored_filename);
    }
    res.status(204).send();
  } catch (error) { console.error('[Images] Photo deletion failed:', error); res.status(500).json({ error: 'Photo deletion failed' }); }
});

export default router;
