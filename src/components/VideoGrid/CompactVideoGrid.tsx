import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ProtestData } from '../../utils/dataFetching';
import { getModifiedUrl } from '../../utils/dataFetching';

const CompactVideoGrid: React.FC = () => {
  const { filteredVideoData, loading } = useAppContext();
  const [visibleVideos, setVisibleVideos] = useState<ProtestData[]>([]);
  const [hoveredVideo, setHoveredVideo] = useState<ProtestData | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [loadedCount, setLoadedCount] = useState(12); // Start with fewer videos
  const gridRef = useRef<HTMLDivElement>(null);
  const hoverVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!loading && filteredVideoData.length > 0) {
      setVisibleVideos(filteredVideoData.slice(0, Math.min(loadedCount, filteredVideoData.length)));
    }
  }, [loading, filteredVideoData, loadedCount]);

  const loadMore = () => {
    setLoadedCount(prev => Math.min(prev + 12, filteredVideoData.length));
  };

  const handleVideoClick = (video: ProtestData) => {
    // On mobile, open the video source link
    if (window.innerWidth < 768) {
      window.open(video.Link, '_blank');
    }
  };

  const handleVideoHover = (video: ProtestData, event: React.MouseEvent) => {
    // Only show popup on larger screens (non-mobile)
    if (window.innerWidth < 768) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let x = rect.right + 15; // Slightly more spacing
    let y = rect.top + (rect.height / 2); // Center vertically with the item
    
    // Check if popup would go off-screen to the right
    if (x + 320 > windowWidth) {
      // Position to the left instead with more spacing
      x = rect.left - 320 - 15;
    }
    
    // Check if popup would go off-screen vertically
    if (y + 132 > windowHeight) { // 132 is half of popup height (264/2)
      y = windowHeight - 132 - 20; // 20px margin from bottom
    }
    
    if (y - 132 < 20) { // 20px margin from top
      y = 132 + 20;
    }
    
    setHoverPosition({ x, y });
    setHoveredVideo(video);
    
    // Auto-play the hover video with a slight delay
    setTimeout(() => {
      if (hoverVideoRef.current) {
        hoverVideoRef.current.play().catch(() => console.log("Autoplay prevented"));
      }
    }, 150);
  };

  const handleVideoLeave = () => {
    setHoveredVideo(null);
    setHoverPosition(null);
    
    if (hoverVideoRef.current) {
      hoverVideoRef.current.pause();
    }
  };

  const getLocation = (video: ProtestData) => {
    const parts = [video.City_Village, video.County, video.Province].filter(Boolean);
    return parts.join(', ');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] morphic-video-grid overflow-hidden">
        <div className="p-8 border-b border-white/20 morphic-gradient-overlay">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-10 bg-gradient-to-b from-[#00558c] to-[#004778] rounded-full morphic-floating"></div>
            <h2 className="text-2xl font-bold text-gray-800">Protest Videos</h2>
          </div>
        </div>
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 h-[calc(600px-88px)]">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="aspect-square morphic-loading rounded-2xl" style={{ animationDelay: `${index * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] morphic-video-grid overflow-hidden relative" ref={gridRef}>
      <div className="p-8 border-b border-white/20 morphic-gradient-overlay">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-10 bg-gradient-to-b from-[#00558c] to-[#004778] rounded-full morphic-floating"></div>
            <h2 className="text-2xl font-bold text-gray-800">Protest Videos</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="morphic-card text-white px-4 py-2 rounded-full text-sm font-medium">
              <span className="text-[#00558c] font-bold">{filteredVideoData.length}</span> total • <span className="text-[#00558c] font-bold">{visibleVideos.length}</span> shown
            </div>
            <Link 
              to="/all-videos"
              className="morphic-button morphic-button-primary px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-white"
            >
              See All Videos
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 h-[calc(600px-156px)] overflow-y-auto morphic-scrollbar">
        {visibleVideos.map((video, index) => (
          <div
            key={`${video.MediaURL}-${index}`}
            className="aspect-square morphic-video-item cursor-pointer group relative transition-all duration-500 transform-gpu"
            onMouseEnter={(e) => handleVideoHover(video, e)}
            onMouseLeave={handleVideoLeave}
            onClick={() => handleVideoClick(video)}
            style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
          >
            <video
              className="w-full h-full object-cover transition-all duration-500 rounded-[19px]"
              src={`https://fdd.box.com/shared/static/${getModifiedUrl(video.MediaURL)}.mp4`}
              muted
              loop
              preload="metadata"
            />
            
            {/* Video overlay info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[19px]">
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7Z"/>
                  </svg>
                  <p className="text-sm font-medium">{formatDate(video.Date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z"/>
                  </svg>
                  <p className="text-xs opacity-90 truncate">{video.County}, {video.Province}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Load More Button */}
        {loadedCount < filteredVideoData.length && (
          <div className="aspect-square flex items-center justify-center">
            <button
              onClick={loadMore}
              className="morphic-button-primary px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105"
            >
              Load More
              <div className="text-xs mt-1 opacity-75">
                {filteredVideoData.length - loadedCount} remaining
              </div>
            </button>
          </div>
        )}
      </div>
      
      {/* Hover popup */}
      {hoveredVideo && hoverPosition && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[9998] pointer-events-none" />
          
          <div
            className="fixed z-[9999] w-80 h-64 morphic-popup overflow-hidden transition-all duration-300 ease-out transform pointer-events-none"
            style={{
              left: `${hoverPosition.x}px`,
              top: `${hoverPosition.y}px`,
              transform: 'translateY(-50%) scale(1)',
              animation: 'fadeInScale 0.3s ease-out'
            }}
          >
          <video
            ref={hoverVideoRef}
            className="w-full h-full object-cover rounded-[19px]"
            src={`https://fdd.box.com/shared/static/${getModifiedUrl(hoveredVideo.MediaURL)}.mp4`}
            muted
            loop
          />
          
          {/* Video info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-5 rounded-b-[19px]">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7Z"/>
                </svg>
                <p className="font-semibold text-sm">{formatDate(hoveredVideo.Date)}</p>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z"/>
                </svg>
                <p className="text-xs opacity-90">{getLocation(hoveredVideo)}</p>
              </div>
              <p className="text-xs line-clamp-2 leading-relaxed mb-2">{hoveredVideo.Description}</p>
              {hoveredVideo.Estimated_Size && (
                <div className="flex items-center gap-1 text-xs opacity-75">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4ZM8 12C10.2 12 12 13.8 12 16C12 18.2 10.2 20 8 20C5.8 20 4 18.2 4 16C4 13.8 5.8 12 8 12ZM8 6C9.1 6 10 6.9 10 8C10 9.1 9.1 10 8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6Z"/>
                  </svg>
                  {hoveredVideo.Estimated_Size} people
                </div>
              )}
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default CompactVideoGrid;
