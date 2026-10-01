import { Router } from 'express';
import type { Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../config/database';
import { requireAdmin } from '../middleware/auth';

type Content = Record<string, unknown>;

interface ContentRow extends RowDataPacket {
  id: number;
  player_id?: number;
  club_id?: number | null;
  details?: Content | string | null;
  content_data?: Content | string | null;
  name_ar?: string | null;
  name_en?: string | null;
  title_ar?: string | null;
  title_en?: string | null;
  label_ar?: string | null;
  label_en?: string | null;
}

const router = Router();
const parseJson = (value: ContentRow['details']): Content => {
  if (!value) return {};
  if (typeof value === 'string') {
    try { return JSON.parse(value) as Content; } catch { return {}; }
  }
  return value;
};
const positiveId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
const text = (value: unknown): value is string => typeof value === 'string';
const hasUrlOnlyImages = (data: Content): boolean => {
  const imageFields = ['logoUrl', 'coverImageUrl', 'thumbnailUrl'];
  for (const key of imageFields) {
    const value = data[key];
    if (value === undefined || value === '') continue;
    if (!text(value) || !/^https?:\/\//i.test(value)) return false;
  }
  const gallery = data.galleryUrls;
  return gallery === undefined || (Array.isArray(gallery) && gallery.every((url) => text(url) && /^https?:\/\//i.test(url)));
};
const playerId = async (): Promise<number | null> => {
  const [rows] = await db.query<ContentRow[]>('SELECT id FROM players ORDER BY id ASC LIMIT 1');
  return rows[0]?.id ?? null;
};
const errorResponse = (res: Response, label: string, error: unknown): void => {
  console.error(`[${label}]`, error);
  res.status(500).json({ error: `${label} failed` });
};

const readCollection = async (table: 'achievements' | 'performance_stats' | 'videos'): Promise<Content[]> => {
  const currentPlayerId = table === 'videos' ? null : await playerId();
  if (table !== 'videos' && !currentPlayerId) return [];
  const [rows] = table === 'videos'
    ? await db.query<ContentRow[]>(`SELECT id, content_data FROM ${table} ORDER BY sort_order, id`)
    : await db.query<ContentRow[]>(`SELECT id, content_data FROM ${table} WHERE player_id = ? ORDER BY sort_order, id`, [currentPlayerId]);
  return rows.map((row) => ({ ...parseJson(row.content_data), id: String(row.id) }));
};

const validateCollectionItem = (kind: 'achievements' | 'performance_stats' | 'videos', value: unknown): value is Content => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Content;
  if (kind === 'achievements') return text(item.titleAr) && !!item.titleAr.trim() && text(item.titleEn) && !!item.titleEn.trim();
  if (kind === 'performance_stats') {
    const metrics = ['matches', 'goals', 'assists', 'minutes', 'starts', 'substitutes', 'yellowCards', 'redCards'];
    return metrics.some((key) => item[key] !== undefined && typeof item[key] === 'number' && Number.isFinite(item[key]) && Number(item[key]) >= 0);
  }
  return text(item.titleAr) && !!item.titleAr.trim() && text(item.titleEn) && !!item.titleEn.trim()
    && text(item.videoUrl) && !!item.videoUrl.trim() && hasUrlOnlyImages(item);
};

const collectionRouter = (kind: 'achievements' | 'performance_stats' | 'videos') => {
  const routes = Router();
  const table = kind;

  routes.get('/', async (_req, res) => {
    try { res.json(await readCollection(table)); }
    catch (error) { errorResponse(res, `${table} read`, error); }
  });

  routes.post('/', requireAdmin, async (req, res) => {
    if (!validateCollectionItem(kind, req.body)) {
      res.status(422).json({ error: 'Invalid content item' });
      return;
    }
    try {
      const currentPlayerId = kind === 'videos' ? null : await playerId();
      if (kind !== 'videos' && !currentPlayerId) {
        res.status(409).json({ error: 'Player profile must exist before adding this content' });
        return;
      }
      const item = { ...req.body } as Content;
      delete item.id;
      const sortOrder = typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder)
        ? item.sortOrder : typeof item.priority === 'number' && Number.isFinite(item.priority) ? item.priority : 0;
      const payload = JSON.stringify(item);
      let result: ResultSetHeader;
      if (kind === 'achievements') {
        [result] = await db.query<ResultSetHeader>(
          'INSERT INTO achievements (player_id, title_ar, title_en, description_ar, description_en, achievement_year, featured, sort_order, content_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [currentPlayerId, item.titleAr, item.titleEn, item.descriptionAr ?? null, item.descriptionEn ?? null, /^\d{4}$/.test(String(item.season ?? '')) ? Number(item.season) : null, Boolean(item.featured), sortOrder, payload],
        );
      } else if (kind === 'performance_stats') {
        [result] = await db.query<ResultSetHeader>(
          'INSERT INTO performance_stats (player_id, label_ar, label_en, value, sort_order, content_data) VALUES (?, ?, ?, ?, ?, ?)',
          [currentPlayerId, item.clubNameAr ?? null, item.clubNameEn ?? null, null, sortOrder, payload],
        );
      } else {
        const duration = text(item.duration) && /^\d{1,3}:\d{2}$/.test(item.duration)
          ? Number(item.duration.split(':')[0]) * 60 + Number(item.duration.split(':')[1]) : null;
        [result] = await db.query<ResultSetHeader>(
          'INSERT INTO videos (title_ar, title_en, category, source_type, video_url, duration_seconds, description_ar, description_en, featured, published, sort_order, content_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [item.titleAr, item.titleEn, item.category ?? null, item.videoSourceType ?? 'external', item.videoUrl, duration, item.descriptionAr ?? null, item.descriptionEn ?? null, Boolean(item.featured), Boolean(item.published), sortOrder, payload],
        );
      }
      res.status(201).json({ ...item, id: String(result.insertId) });
    } catch (error) { errorResponse(res, `${table} create`, error); }
  });

  routes.put('/:id', requireAdmin, async (req, res) => {
    const id = positiveId(req.params.id);
    if (!id || !validateCollectionItem(kind, req.body)) {
      res.status(422).json({ error: 'Invalid content item' });
      return;
    }
    try {
      const item = { ...req.body } as Content;
      delete item.id;
      const sortOrder = typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder)
        ? item.sortOrder : typeof item.priority === 'number' && Number.isFinite(item.priority) ? item.priority : 0;
      const payload = JSON.stringify(item);
      let result: ResultSetHeader;
      if (kind === 'achievements') {
        const currentPlayerId = await playerId();
        if (!currentPlayerId) { res.status(409).json({ error: 'Player profile must exist first' }); return; }
        [result] = await db.query<ResultSetHeader>(
          'UPDATE achievements SET title_ar = ?, title_en = ?, description_ar = ?, description_en = ?, achievement_year = ?, featured = ?, sort_order = ?, content_data = ? WHERE id = ? AND player_id = ?',
          [item.titleAr, item.titleEn, item.descriptionAr ?? null, item.descriptionEn ?? null, /^\d{4}$/.test(String(item.season ?? '')) ? Number(item.season) : null, Boolean(item.featured), sortOrder, payload, id, currentPlayerId],
        );
      } else if (kind === 'performance_stats') {
        const currentPlayerId = await playerId();
        if (!currentPlayerId) { res.status(409).json({ error: 'Player profile must exist first' }); return; }
        [result] = await db.query<ResultSetHeader>(
          'UPDATE performance_stats SET label_ar = ?, label_en = ?, value = NULL, sort_order = ?, content_data = ? WHERE id = ? AND player_id = ?',
          [item.clubNameAr ?? null, item.clubNameEn ?? null, sortOrder, payload, id, currentPlayerId],
        );
      } else {
        const duration = text(item.duration) && /^\d{1,3}:\d{2}$/.test(item.duration)
          ? Number(item.duration.split(':')[0]) * 60 + Number(item.duration.split(':')[1]) : null;
        [result] = await db.query<ResultSetHeader>(
          'UPDATE videos SET title_ar = ?, title_en = ?, category = ?, source_type = ?, video_url = ?, duration_seconds = ?, description_ar = ?, description_en = ?, featured = ?, published = ?, sort_order = ?, content_data = ? WHERE id = ?',
          [item.titleAr, item.titleEn, item.category ?? null, item.videoSourceType ?? 'external', item.videoUrl, duration, item.descriptionAr ?? null, item.descriptionEn ?? null, Boolean(item.featured), Boolean(item.published), sortOrder, payload, id],
        );
      }
      if (!result.affectedRows) { res.status(404).json({ error: 'Content item not found' }); return; }
      res.json({ ...item, id: String(id) });
    } catch (error) { errorResponse(res, `${table} update`, error); }
  });

  routes.delete('/:id', requireAdmin, async (req, res) => {
    const id = positiveId(req.params.id);
    if (!id) { res.status(422).json({ error: 'Invalid id' }); return; }
    try {
      let result: ResultSetHeader;
      if (kind === 'videos') {
        [result] = await db.query<ResultSetHeader>('DELETE FROM videos WHERE id = ?', [id]);
      } else {
        const currentPlayerId = await playerId();
        if (!currentPlayerId) { res.status(409).json({ error: 'Player profile must exist first' }); return; }
        [result] = await db.query<ResultSetHeader>(`DELETE FROM ${table} WHERE id = ? AND player_id = ?`, [id, currentPlayerId]);
      }
      if (!result.affectedRows) { res.status(404).json({ error: 'Content item not found' }); return; }
      res.status(204).send();
    } catch (error) { errorResponse(res, `${table} delete`, error); }
  });
  return routes;
};

const validClub = (value: unknown): value is Content => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Content;
  return text(item.clubNameAr) && !!item.clubNameAr.trim() && text(item.clubNameEn) && !!item.clubNameEn.trim() && hasUrlOnlyImages(item);
};

router.get('/clubs', async (_req, res) => {
  try {
    const [rows] = await db.query<ContentRow[]>('SELECT id, name_ar, name_en, content_data FROM clubs ORDER BY id');
    res.json(rows.map((row) => ({ ...parseJson(row.content_data), id: String(row.id), clubNameAr: row.name_ar, clubNameEn: row.name_en ?? '' })));
  } catch (error) { errorResponse(res, 'clubs read', error); }
});

router.post('/clubs', requireAdmin, async (req, res) => {
  if (!validClub(req.body)) { res.status(422).json({ error: 'Invalid club' }); return; }
  try {
    const data = { ...req.body } as Content;
    delete data.id;
    const [result] = await db.query<ResultSetHeader>('INSERT INTO clubs (name_ar, name_en, content_data) VALUES (?, ?, ?)', [data.clubNameAr, data.clubNameEn, JSON.stringify(data)]);
    res.status(201).json({ ...data, id: String(result.insertId) });
  } catch (error) { errorResponse(res, 'clubs create', error); }
});

router.put('/clubs/:id', requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id || !validClub(req.body)) { res.status(422).json({ error: 'Invalid club' }); return; }
  try {
    const data = { ...req.body } as Content;
    delete data.id;
    const [result] = await db.query<ResultSetHeader>('UPDATE clubs SET name_ar = ?, name_en = ?, content_data = ? WHERE id = ?', [data.clubNameAr, data.clubNameEn, JSON.stringify(data), id]);
    if (!result.affectedRows) { res.status(404).json({ error: 'Club not found' }); return; }
    res.json({ ...data, id: String(id) });
  } catch (error) { errorResponse(res, 'clubs update', error); }
});

router.delete('/clubs/:id', requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) { res.status(422).json({ error: 'Invalid id' }); return; }
  try {
    const [result] = await db.query<ResultSetHeader>('DELETE FROM clubs WHERE id = ?', [id]);
    if (!result.affectedRows) { res.status(404).json({ error: 'Club not found' }); return; }
    res.status(204).send();
  } catch (error) { errorResponse(res, 'clubs delete', error); }
});

router.use('/achievements', collectionRouter('achievements'));
router.use('/stats', collectionRouter('performance_stats'));
router.use('/videos', collectionRouter('videos'));

const careerRouter = Router();
const validCareer = (value: unknown): value is Content => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Content;
  return text(item.clubNameAr) && !!item.clubNameAr.trim() && text(item.clubNameEn) && !!item.clubNameEn.trim() && hasUrlOnlyImages(item);
};

careerRouter.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query<ContentRow[]>(
      'SELECT e.id AS career_id, e.club_id, e.details, c.name_ar, c.name_en FROM career_entries e LEFT JOIN clubs c ON c.id = e.club_id ORDER BY e.sort_order, e.id',
    );
    res.json(rows.map((row) => ({ ...parseJson(row.details), id: String(row.club_id ?? row.career_id), clubId: row.club_id ? String(row.club_id) : undefined, careerEntryId: String(row.career_id), clubNameAr: parseJson(row.details).clubNameAr ?? row.name_ar ?? '', clubNameEn: parseJson(row.details).clubNameEn ?? row.name_en ?? '' })));
  } catch (error) { errorResponse(res, 'career read', error); }
});

careerRouter.post('/', requireAdmin, async (req, res) => {
  if (!validCareer(req.body)) { res.status(422).json({ error: 'Invalid career entry' }); return; }
  const currentPlayerId = await playerId().catch(() => null);
  if (!currentPlayerId) { res.status(409).json({ error: 'Player profile must exist before adding career entries' }); return; }
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const data = { ...req.body } as Content;
    delete data.id; delete data.careerEntryId;
    const [clubResult] = await connection.query<ResultSetHeader>('INSERT INTO clubs (name_ar, name_en, content_data) VALUES (?, ?, ?)', [data.clubNameAr, data.clubNameEn, JSON.stringify(data)]);
    const clubId = clubResult.insertId;
    const [careerResult] = await connection.query<ResultSetHeader>('INSERT INTO career_entries (player_id, club_id, title_ar, title_en, details, sort_order) VALUES (?, ?, ?, ?, ?, ?)', [currentPlayerId, clubId, data.clubNameAr, data.clubNameEn, JSON.stringify(data), Number(data.sortOrder) || 0]);
    await connection.commit();
    res.status(201).json({ ...data, id: String(clubId), clubId: String(clubId), careerEntryId: String(careerResult.insertId) });
  } catch (error) {
    await connection.rollback();
    errorResponse(res, 'career create', error);
  } finally { connection.release(); }
});

careerRouter.put('/:id', requireAdmin, async (req, res) => {
  const careerId = positiveId(req.params.id);
  if (!careerId || !validCareer(req.body)) { res.status(422).json({ error: 'Invalid career entry' }); return; }
  const currentPlayerId = await playerId().catch(() => null);
  if (!currentPlayerId) { res.status(409).json({ error: 'Player profile must exist first' }); return; }
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [found] = await connection.query<ContentRow[]>('SELECT id, club_id FROM career_entries WHERE id = ? AND player_id = ? FOR UPDATE', [careerId, currentPlayerId]);
    if (!found[0]) { await connection.rollback(); res.status(404).json({ error: 'Career entry not found' }); return; }
    const data = { ...req.body } as Content;
    delete data.id; delete data.careerEntryId;
    const clubId = found[0].club_id;
    if (clubId) {
      await connection.query('UPDATE clubs SET name_ar = ?, name_en = ?, content_data = ? WHERE id = ?', [data.clubNameAr, data.clubNameEn, JSON.stringify(data), clubId]);
    }
    await connection.query('UPDATE career_entries SET title_ar = ?, title_en = ?, details = ?, sort_order = ? WHERE id = ?', [data.clubNameAr, data.clubNameEn, JSON.stringify(data), Number(data.sortOrder) || 0, careerId]);
    await connection.commit();
    res.json({ ...data, id: String(clubId ?? careerId), clubId: clubId ? String(clubId) : undefined, careerEntryId: String(careerId) });
  } catch (error) {
    await connection.rollback();
    errorResponse(res, 'career update', error);
  } finally { connection.release(); }
});

careerRouter.delete('/:id', requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  const currentPlayerId = await playerId().catch(() => null);
  if (!id) { res.status(422).json({ error: 'Invalid id' }); return; }
  if (!currentPlayerId) { res.status(409).json({ error: 'Player profile must exist first' }); return; }
  try {
    const [result] = await db.execute<ResultSetHeader>('DELETE FROM career_entries WHERE id = ? AND player_id = ?', [id, currentPlayerId]);
    if (!result.affectedRows) { res.status(404).json({ error: 'Career entry not found' }); return; }
    res.status(204).send();
  } catch (error) { errorResponse(res, 'career delete', error); }
});

export const careerRoutes = careerRouter;
export const clubRoutes = router;
