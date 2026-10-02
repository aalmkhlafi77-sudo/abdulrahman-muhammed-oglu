import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PhotoItem } from '../types/player';
import { getPhotos } from '../services/photoApi';

interface PhotoContextValue {
  photos: PhotoItem[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
  refreshPhotos: () => Promise<void>;
}

const PhotoContext = createContext<PhotoContextValue | null>(null);

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const refreshPhotos = async () => { setPhotos(await getPhotos()); };

  useEffect(() => { void refreshPhotos().catch(error => console.warn('Could not load photos:', error)); }, []);

  return <PhotoContext.Provider value={{ photos, setPhotos, refreshPhotos }}>{children}</PhotoContext.Provider>;
};

export const usePhotos = (): PhotoContextValue => {
  const value = useContext(PhotoContext);
  if (!value) throw new Error('usePhotos must be used inside PhotoProvider');
  return value;
};
