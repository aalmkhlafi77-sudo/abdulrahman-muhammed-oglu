export type MediaCategory = 'interview' | 'video' | 'article' | 'image';

export interface MediaItem {
  id: string;
  titleAr: string;
  titleEn: string;
  category: MediaCategory;
  contentAr: string;
  contentEn: string;
  coverAssetId: string | null;
  coverUrl: string;
  externalUrl: string;
  published: boolean;
  sortOrder: number;
}

export type MediaInput = Omit<MediaItem, 'id' | 'coverUrl'>;

const readResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Media request failed (${response.status})`);
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
};

export const getPublicMedia = async (): Promise<MediaItem[]> => readResponse(await fetch('/api/media'));
export const getAdminMedia = async (): Promise<MediaItem[]> => readResponse(await fetch('/api/media/admin', { credentials: 'include' }));
export const createMedia = async (item: MediaInput): Promise<MediaItem> => readResponse(await fetch('/api/media', {
  method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item),
}));
export const updateMedia = async (id: string, item: MediaInput): Promise<MediaItem> => readResponse(await fetch(`/api/media/${id}`, {
  method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item),
}));
export const deleteMedia = async (id: string): Promise<void> => readResponse(await fetch(`/api/media/${id}`, { method: 'DELETE', credentials: 'include' }));
