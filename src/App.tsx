import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { ScoutingCard } from './components/public/ScoutingCard';
import { PlayerProfile } from './components/public/PlayerProfile';
import { CareerTimeline } from './components/public/CareerTimeline';
import { Achievements } from './components/public/Achievements';
import { PerformanceStats } from './components/public/PerformanceStats';
import { OfficialHighlights } from './components/public/OfficialHighlights';
import { VideoLibrary } from './components/public/VideoLibrary';
import { PhotoGallery } from './components/public/PhotoGallery';
import { MediaInterviews } from './components/public/MediaInterviews';
import { PlayerCV } from './components/public/PlayerCV';
import { ContactSection } from './components/public/ContactSection';
import { Footer } from './components/public/Footer';
import { VideoModal } from './components/public/VideoModal';

// Admin Imports
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminPlayerProfile } from './components/admin/AdminPlayerProfile';
import { AdminCareer } from './components/admin/AdminCareer';
import { AdminAchievements } from './components/admin/AdminAchievements';
import { AdminStats } from './components/admin/AdminStats';
import { AdminVideos } from './components/admin/AdminVideos';
import { AdminMediaLibrary } from './components/admin/AdminMediaLibrary';
import { AdminMediaInterviews } from './components/admin/AdminMediaInterviews';
import { AdminInquiries } from './components/admin/AdminInquiries';
import { AdminSecurityBranding } from './components/admin/AdminSecurityBranding';

import { VideoHighlight } from './types/player';
import { PlayerInfoProvider } from './context/PlayerInfoContext';
import { StructuredContentProvider } from './context/StructuredContentContext';
import { PhotoProvider } from './context/PhotoContext';
import { useStructuredContent } from './context/StructuredContentContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

function AppContent() {
  const [activeVideo, setActiveVideo] = useState<VideoHighlight | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const { videos } = useStructuredContent();

  const handleOpenOfficialHighlights = () => {
    const official = videos.find(v => v.featured) || videos[0];
    if (official) {
      setActiveVideo(official);
    }
  };

  const renderAdminTabContent = (tab: string) => {
    switch (tab) {
      case 'dashboard': return <AdminDashboard />;
      case 'profile': return <AdminPlayerProfile />;
      case 'career': return <AdminCareer />;
      case 'achievements': return <AdminAchievements />;
      case 'stats': return <AdminStats />;
      case 'videos': return <AdminVideos />;
      case 'photos': return <AdminMediaLibrary />;
      case 'media': return <AdminMediaInterviews />;
      case 'inquiries': return <AdminInquiries />;
      case 'security_branding': return <AdminSecurityBranding />;
      default: return <AdminDashboard />;
    }
  };

  return (
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
        
        {/* Public Header Navbar */}
        <Navbar 
          onOpenAdmin={() => setAdminOpen(true)}
          onOpenHighlights={handleOpenOfficialHighlights}
        />

        {/* Public Sections Sequence */}
        <main>
          {/* 1. Hero Banner */}
          <Hero onOpenHighlights={handleOpenOfficialHighlights} />

          {/* 2. 10-Second Scouting Evaluation Card */}
          <ScoutingCard />

          {/* 3. Player Profile, Objective & Attributes */}
          <PlayerProfile />

          {/* 4. Career Timeline & Club Progression */}
          <CareerTimeline />

          {/* 5. Key Achievements & Honors */}
          <Achievements />

          {/* 6. Performance Stats */}
          <PerformanceStats />

          {/* 7. Official Highlights Feature Showcase */}
          <OfficialHighlights onPlayVideo={setActiveVideo} />

          {/* 8. Match Highlights & Video Vault */}
          <VideoLibrary onPlayVideo={setActiveVideo} />

          {/* 9. Photo Gallery (58 images masonry) */}
          <PhotoGallery />

          {/* 10. Media & Field Interviews */}
          <MediaInterviews />

          {/* 11. Printable Player CV */}
          <PlayerCV />

          {/* 12. Contact & Scouting Inquiries */}
          <ContactSection />
        </main>

        {/* Footer */}
        <Footer onOpenAdmin={() => setAdminOpen(true)} />

        {/* Video Player Modal */}
        <VideoModal 
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />

        {/* Admin Portal Overlay */}
        {adminOpen && (
          <AdminLayout onCloseAdmin={() => setAdminOpen(false)}>
            {(activeTab) => renderAdminTabContent(activeTab)}
          </AdminLayout>
        )}

      </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <PlayerInfoProvider>
        <SiteSettingsProvider>
          <StructuredContentProvider>
            <PhotoProvider>
              <AppContent />
            </PhotoProvider>
          </StructuredContentProvider>
        </SiteSettingsProvider>
      </PlayerInfoProvider>
    </LanguageProvider>
  );
}
