import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { VideoHighlight, VideoCategory } from '../../types/player';
import { Film, Play, Clock, Filter, Tag, CheckCircle } from 'lucide-react';

interface VideoLibraryProps {
  onPlayVideo: (video: VideoHighlight) => void;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({ onPlayVideo }) => {
  const { t } = useLanguage();
  const videos = DataService.getVideos().filter(v => v.published);
  const clubs = DataService.getClubs();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedClub, setSelectedClub] = useState<string>('ALL');

  const categories: { key: string; labelAr: string; labelEn: string }[] = [
    { key: 'ALL', labelAr: 'الكل', labelEn: 'ALL' },
    { key: 'GOALS', labelAr: 'الأهداف', labelEn: 'GOALS' },
    { key: 'ASSISTS', labelAr: 'صناعة الأهداف', labelEn: 'ASSISTS' },
    { key: 'SKILLS', labelAr: 'المهارات', labelEn: 'SKILLS' },
    { key: 'MATCHES', labelAr: 'المباريات', labelEn: 'MATCHES' },
    { key: 'HIGHLIGHTS', labelAr: 'الملخصات', labelEn: 'HIGHLIGHTS' },
    { key: 'INTERVIEWS', labelAr: 'المقابلات', labelEn: 'INTERVIEWS' },
    { key: 'MEDIA', labelAr: 'الإعلام', labelEn: 'MEDIA' },
  ];

  const filteredVideos = videos.filter(vid => {
    const matchesCategory = activeCategory === 'ALL' || vid.category === activeCategory;
    const matchesClub = selectedClub === 'ALL' || vid.clubNameAr === selectedClub || vid.clubNameEn === selectedClub;
    return matchesCategory && matchesClub;
  });

  return (
    <section id="highlights" className="py-20 bg-[#0e1420] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Film className="w-3.5 h-3.5" />
            <span>{t('مكتبة المقاطع والمهارات', 'Match Video Vault')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('فيديوهات المباريات والمهارات والأهداف', 'Highlights & Skills Library')}
          </h2>
        </div>

        {/* Filters Bar (Interactive buttons/tabs strictly adhering to frontend design guidelines) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 font-latin ${
                  activeCategory === cat.key
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t(cat.labelAr, cat.labelEn)}
              </button>
            ))}
          </div>

          {/* Club Dropdown Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Filter className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 w-full md:w-auto"
            >
              <option value="ALL">{t('جميع الأندية', 'All Clubs')}</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.clubNameAr}>
                  {t(club.clubNameAr, club.clubNameEn)}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Video Cards Grid */}
        {filteredVideos.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">
              {t('لا توجد مقاطع فيديو في هذا التصنيف حالياً.', 'No videos found for the selected filter.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div 
                key={video.id}
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between group"
              >
                {/* Video Card Media Top */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Category Tag */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-cyan-400 text-[10px] font-extrabold uppercase font-latin">
                    {video.category}
                  </span>

                  {/* Duration Tag */}
                  {video.duration && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 text-[10px] font-bold font-latin flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {video.duration}
                    </span>
                  )}

                  {/* Play Trigger Overlay */}
                  <button
                    onClick={() => onPlayVideo(video)}
                    className="absolute inset-0 flex items-center justify-center bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />
                    </div>
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {video.clubNameAr && (
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                        {t(video.clubNameAr, video.clubNameEn || '')}
                      </span>
                    )}

                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors leading-snug">
                      {t(video.titleAr, video.titleEn)}
                    </h3>

                    {video.descriptionAr && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {t(video.descriptionAr, video.descriptionEn || '')}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onPlayVideo(video)}
                      className="text-cyan-400 font-bold hover:underline flex items-center gap-1 text-xs"
                    >
                      <span>{t('مشاهدة الفيديو', 'Watch Clip')}</span>
                    </button>
                    <span className="text-[10px] text-slate-500 uppercase font-latin">{video.videoSourceType}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
