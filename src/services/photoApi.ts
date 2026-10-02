import type { PhotoItem } from '../types/player';

export interface UploadedAsset {
  id: string;
  imageUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export type PhotoDetails = Pick<PhotoItem, 'assetId' | 'titleAr' | 'titleEn' | 'published' | 'sortOrder'> &
  Partial<Pick<PhotoItem, 'clubNameAr' | 'clubNameEn' | 'featured' | 'focalPoint' | 'category' | 'captionAr' | 'captionEn' | 'altText'>>;

const readResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Image request failed (${response.status})`);
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
};

export const getPhotos = async (): Promise<PhotoItem[]> => readResponse(await fetch('/api/photos'));

export const getAssets = async (): Promise<UploadedAsset[]> => readResponse(await fetch('/api/assets', {
  credentials: 'include',
}));

export const uploadImage = async (file: File): Promise<UploadedAsset> => {
  const form = new FormData();
  form.append('file', file);
  return readResponse(await fetch('/api/assets/upload', { method: 'POST', credentials: 'include', body: form }));
};

export const createPhoto = async (details: PhotoDetails): Promise<PhotoItem> => readResponse(await fetch('/api/photos', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details),
}));

export const updatePhoto = async (id: string, details: PhotoDetails): Promise<PhotoItem> => readResponse(await fetch(`/api/photos/${id}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details),
}));

export const deletePhoto = async (id: string): Promise<void> => readResponse(await fetch(`/api/photos/${id}`, { method: 'DELETE' }));
export const deleteAsset = async (id: string): Promise<void> => readResponse(await fetch(`/api/assets/${id}`, { method: 'DELETE' }));
