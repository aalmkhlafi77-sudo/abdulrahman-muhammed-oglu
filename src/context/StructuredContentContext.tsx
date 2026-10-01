import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Achievement, ClubExperience, PerformanceStat, VideoHighlight } from '../types/player';
import { DataService } from '../services/dataService';

interface StructuredContent {
  clubs: ClubExperience[];
  career: ClubExperience[];
  achievements: Achievement[];
  stats: PerformanceStat[];
  videos: VideoHighlight[];
  setClubs: React.Dispatch<React.SetStateAction<ClubExperience[]>>;
  setCareer: React.Dispatch<React.SetStateAction<ClubExperience[]>>;
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  setStats: React.Dispatch<React.SetStateAction<PerformanceStat[]>>;
  setVideos: React.Dispatch<React.SetStateAction<VideoHighlight[]>>;
  refresh: () => Promise<void>;
}

const ContentContext = createContext<StructuredContent | null>(null);
const endpoints = { clubs: '/api/clubs', career: '/api/career', achievements: '/api/achievements', stats: '/api/stats', videos: '/api/videos' };

export const StructuredContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clubs, setClubs] = useState<ClubExperience[]>([]);
  const [career, setCareer] = useState<ClubExperience[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<PerformanceStat[]>([]);
  const [videos, setVideos] = useState<VideoHighlight[]>([]);

  const refresh = async () => {
    const [clubRows, careerRows, achievementRows, statRows, videoRows] = await Promise.all(
      Object.values(endpoints).map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not load ${url}`);
        return response.json() as Promise<unknown[]>;
      }),
    );
    setClubs(clubRows as ClubExperience[]);
    setCareer(careerRows as ClubExperience[]);
    setAchievements(achievementRows as Achievement[]);
    setStats(statRows as PerformanceStat[]);
    setVideos(videoRows as VideoHighlight[]);
    DataService.setMysqlCollections({ clubs: clubRows as ClubExperience[], achievements: achievementRows as Achievement[], stats: statRows as PerformanceStat[], videos: videoRows as VideoHighlight[] });
  };

  useEffect(() => { void refresh().catch((error) => console.warn('Could not load structured content:', error)); }, []);
  useEffect(() => {
    DataService.setMysqlCollections({ clubs, achievements, stats, videos });
    window.dispatchEvent(new Event('portfolio_server_data_synced'));
  }, [clubs, achievements, stats, videos]);

  const value = useMemo(() => ({ clubs, career, achievements, stats, videos, setClubs, setCareer, setAchievements, setStats, setVideos, refresh }), [clubs, career, achievements, stats, videos]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useStructuredContent = (): StructuredContent => {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useStructuredContent must be used within StructuredContentProvider');
  return value;
};
