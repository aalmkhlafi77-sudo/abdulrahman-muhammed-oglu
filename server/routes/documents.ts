import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import multer from 'multer';
import db from '../config/database';
import { getUploadConfig, storedDocumentName } from '../config/uploads';
import { requireAdmin } from '../middleware/auth';

interface CvRow extends RowDataPacket {
  id: number;
  title_ar: string;
  title_en: string;
  public_url: string;
  stored_filename: string;
  file_size: number;
  updated_at: Date;
}

const router = Router();
const MAX_PDF_BYTES = 15 * 1024 * 1024;
const receivePdf = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_PDF_BYTES, files: 1, fields: 0 } }).single('file');
const receive = (req: Request, res: Response, next: (error?: unknown) => void): void => {
  receivePdf(req, res, error => {
    if (error) {
      res.status(error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: 'Invalid PDF upload' });
      return;
    }
    next();
  });
};

const getCurrentCv = async (): Promise<CvRow | null> => {
  const [rows] = await db.query<CvRow[]>(
    `SELECT d.id, d.title_ar, d.title_en, a.public_url, a.stored_filename, a.file_size, d.updated_at
     FROM documents d JOIN assets a ON a.id = d.asset_id
     WHERE d.document_type = 'cv' AND d.published = TRUE ORDER BY d.id DESC LIMIT 1`,
  );
  return rows[0] ?? null;
};

const mapCv = (row: CvRow | null) => row ? ({
  id: String(row.id), titleAr: row.title_ar, titleEn: row.title_en, url: row.public_url,
  fileName: row.stored_filename, fileSize: Number(row.file_size), updatedAt: row.updated_at,
}) : null;

const removeIfUnused = async (assetId: number, filename: string): Promise<void> => {
  const [references] = await db.query<RowDataPacket[]>(
    `SELECT 1 FROM photos WHERE asset_id = ? UNION ALL
     SELECT 1 FROM clubs WHERE logo_asset_id = ? UNION ALL
     SELECT 1 FROM videos WHERE thumbnail_asset_id = ? UNION ALL
     SELECT 1 FROM media_items WHERE cover_asset_id = ? UNION ALL
     SELECT 1 FROM documents WHERE asset_id = ? LIMIT 1`,
    [assetId, assetId, assetId, assetId, assetId],
  );
  if (references.length) return;
  await db.query('DELETE FROM assets WHERE id = ?', [assetId]);
  const config = getUploadConfig();
  if (config && storedDocumentName(filename)) {
    await fs.unlink(path.join(config.root, 'documents', filename)).catch(error => {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    });
  }
};

router.get('/cv', async (_req, res) => {
  try { res.json(mapCv(await getCurrentCv())); }
  catch (error) { console.error('[CV API] Read failed:', error); res.status(500).json({ error: 'Unable to load official CV' }); }
});

router.post('/cv', requireAdmin, receive, async (req, res) => {
  const config = getUploadConfig();
  if (!config) { res.status(503).json({ error: 'Persistent upload storage is not configured' }); return; }
  if (!req.file?.buffer?.length) { res.status(422).json({ error: 'PDF file is required' }); return; }
  if (req.file.mimetype !== 'application/pdf' || req.file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    res.status(415).json({ error: 'Only valid PDF documents are accepted' });
    return;
  }

  const filename = `${randomBytes(16).toString('hex')}.pdf`;
  const documentDirectory = path.resolve(config.root, 'documents');
  const filePath = path.resolve(documentDirectory, filename);
  if (!filePath.startsWith(`${documentDirectory}${path.sep}`) || !storedDocumentName(filename)) {
    res.status(400).json({ error: 'Invalid document path' });
    return;
  }

  let connection: Awaited<ReturnType<typeof db.getConnection>> | undefined;
  let committed = false;
  let oldAssets: Array<{ id: number; stored_filename: string }> = [];
  try {
    await fs.mkdir(documentDirectory, { recursive: true });
    await fs.writeFile(filePath, req.file.buffer, { flag: 'wx', mode: 0o644 });
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [oldRows] = await connection.query<Array<RowDataPacket & { document_id: number; id: number | null; stored_filename: string | null }>>(
      `SELECT d.id AS document_id, a.id, a.stored_filename FROM documents d LEFT JOIN assets a ON a.id = d.asset_id
       WHERE d.document_type = 'cv' ORDER BY d.id DESC FOR UPDATE`,
    );
    oldAssets = oldRows.filter(row => row.id && row.stored_filename).map(row => ({ id: row.id!, stored_filename: row.stored_filename! }));
    const publicUrl = `${config.baseUrl}/documents/${filename}`;
    const [assetResult] = await connection.query<ResultSetHeader>(
      'INSERT INTO assets (type, original_filename, stored_filename, mime_type, file_size, storage_path, public_url, source_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['document', 'official-cv.pdf', filename, 'application/pdf', req.file.buffer.length, `documents/${filename}`, publicUrl, 'upload'],
    );

    if (oldRows[0]) {
      await connection.query(
        'UPDATE documents SET title_ar = ?, title_en = ?, asset_id = ?, published = TRUE WHERE id = ?',
        ['السيرة الذاتية الرسمية', 'Official Player CV', assetResult.insertId, oldRows[0].document_id],
      );
      if (oldRows.length > 1) {
        await connection.query("DELETE FROM documents WHERE document_type = 'cv' AND id <> ?", [oldRows[0].document_id]);
      }
    } else {
      await connection.query(
        'INSERT INTO documents (title_ar, title_en, asset_id, document_type, published) VALUES (?, ?, ?, ?, TRUE)',
        ['السيرة الذاتية الرسمية', 'Official Player CV', assetResult.insertId, 'cv'],
      );
    }
    await connection.commit();
    committed = true;
    connection.release();
    connection = undefined;

    for (const oldAsset of oldAssets) {
      try { await removeIfUnused(oldAsset.id, oldAsset.stored_filename); }
      catch (cleanupError) { console.warn('[CV API] Previous document cleanup failed:', cleanupError); }
    }
    res.status(201).json(mapCv(await getCurrentCv()));
  } catch (error) {
    if (connection) { await connection.rollback().catch(() => {}); connection.release(); }
    if (!committed) await fs.unlink(filePath).catch(() => {});
    console.error('[CV API] Upload failed:', error);
    res.status(500).json({ error: 'Unable to store official CV' });
  }
});

router.delete('/cv', requireAdmin, async (_req, res) => {
  let connection: Awaited<ReturnType<typeof db.getConnection>> | undefined;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query<Array<RowDataPacket & { id: number; asset_id: number | null; stored_filename: string | null }>>(
      `SELECT d.id, d.asset_id, a.stored_filename FROM documents d LEFT JOIN assets a ON a.id = d.asset_id
       WHERE d.document_type = 'cv' ORDER BY d.id DESC FOR UPDATE`,
    );
    if (!rows[0]) {
      await connection.rollback();
      connection.release();
      res.status(404).json({ error: 'Official CV not found' });
      return;
    }
    await connection.query("DELETE FROM documents WHERE document_type = 'cv'");
    await connection.commit();
    connection.release();
    connection = undefined;
    for (const row of rows) {
      if (row.asset_id && row.stored_filename) await removeIfUnused(row.asset_id, row.stored_filename);
    }
    res.status(204).send();
  } catch (error) {
    if (connection) { await connection.rollback().catch(() => {}); connection.release(); }
    console.error('[CV API] Delete failed:', error);
    res.status(500).json({ error: 'Unable to delete official CV' });
  }
});

export default router;
