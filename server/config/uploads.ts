import path from 'node:path';

export interface UploadConfig {
  root: string;
  baseUrl: string;
  mountPath: string;
}

export const getUploadConfig = (): UploadConfig | null => {
  const configuredRoot = process.env.UPLOAD_ROOT?.trim();
  const configuredBaseUrl = process.env.MEDIA_BASE_URL?.trim();
  if (!configuredRoot || !configuredBaseUrl) return null;
  if (!path.isAbsolute(configuredRoot)) throw new Error('UPLOAD_ROOT must be an absolute directory');

  const root = path.resolve(configuredRoot);
  if (root === path.parse(root).root) throw new Error('UPLOAD_ROOT cannot be a filesystem root');

  const baseUrl = configuredBaseUrl.replace(/\/+$/, '');
  const parsed = new URL(baseUrl, 'http://localhost');
  if (!baseUrl.startsWith('/') && !/^https?:\/\//i.test(baseUrl)) {
    throw new Error('MEDIA_BASE_URL must be an absolute URL or path');
  }
  if (parsed.search || parsed.hash || parsed.pathname === '/') {
    throw new Error('MEDIA_BASE_URL must be a directory URL without query or fragment');
  }
  if (parsed.pathname === '/api' || parsed.pathname.startsWith('/api/')) {
    throw new Error('MEDIA_BASE_URL cannot overlap API routes');
  }
  return { root, baseUrl, mountPath: parsed.pathname };
};

export const storedImageName = (value: string): boolean => /^[a-f0-9]{32}\.(jpg|png|webp)$/.test(value);
export const storedDocumentName = (value: string): boolean => /^[a-f0-9]{32}\.pdf$/.test(value);
