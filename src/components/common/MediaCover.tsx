import React, { useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, Mic, Video } from 'lucide-react';
import type { MediaCategory } from '../../services/mediaApi';

interface MediaCoverProps {
  category: MediaCategory;
  coverUrl?: string | null;
  alt: string;
  className: string;
}

const iconFor = (category: MediaCategory) => {
  if (category === 'video') return <Video aria-hidden="true" className="h-8 w-8" />;
  if (category === 'interview') return <Mic aria-hidden="true" className="h-8 w-8" />;
  if (category === 'image') return <ImageIcon aria-hidden="true" className="h-8 w-8" />;
  return <FileText aria-hidden="true" className="h-8 w-8" />;
};

export const MediaCover: React.FC<MediaCoverProps> = ({ category, coverUrl, alt, className }) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const hasImage = Boolean(coverUrl?.trim()) && !loadFailed;

  useEffect(() => setLoadFailed(false), [coverUrl]);

  return (
    <div className={`${className} overflow-hidden`}>
      {hasImage ? (
        <img src={coverUrl!} alt={alt} className="h-full w-full object-cover" onError={() => setLoadFailed(true)} />
      ) : (
        <div role="img" aria-label={`${category} cover unavailable`} className="flex h-full w-full items-center justify-center bg-slate-950 text-slate-600">
          {iconFor(category)}
        </div>
      )}
    </div>
  );
};
