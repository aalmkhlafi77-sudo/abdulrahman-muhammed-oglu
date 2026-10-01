import path from 'node:path';
import { getUploadConfig } from './uploads';

const requiredEnvironment = [
  'APP_URL',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'SESSION_SECRET',
  'UPLOAD_ROOT',
  'MEDIA_BASE_URL',
] as const;

export const validateProductionEnvironment = (buildDirectory: string): void => {
  for (const name of requiredEnvironment) {
    if (!process.env[name]?.trim()) {
      throw new Error(`Missing required production environment variable: ${name}`);
    }
  }

  const appUrl = process.env.APP_URL!;
  try {
    const parsed = new URL(appUrl);
    if (!/^https?:$/.test(parsed.protocol)) throw new Error('invalid protocol');
  } catch {
    throw new Error('APP_URL must be an absolute HTTP(S) URL');
  }

  const uploadConfig = getUploadConfig();
  if (!uploadConfig) throw new Error('Persistent upload storage is not configured');

  const relativeUploadPath = path.relative(path.resolve(buildDirectory), uploadConfig.root);
  const isInsideBuild = !relativeUploadPath || (!relativeUploadPath.startsWith(`..${path.sep}`) && relativeUploadPath !== '..' && !path.isAbsolute(relativeUploadPath));
  if (isInsideBuild) {
    throw new Error('UPLOAD_ROOT must be outside the build directory');
  }
};
