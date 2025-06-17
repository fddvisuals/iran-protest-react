import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ProtestData } from '../../utils/dataFetching';
import { getModifiedUrl } from '../../utils/dataFetching';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HorizontalVideoGrid: React.FC = () => {
  const { filteredVideoData, loading } = useAppContext();
  const [visibleVideos, setVisibleVideos] = useState<ProtestData[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    if (!loading && filteredVideoData.length > 0) {
      // Show first 15 videos for horizontal display
      setVisibleVideos(filteredVideoData.slice(0, Math.min(15, filteredVideoData.length)));
      // Initialize all videos as muted
      const initialMuted = new Set(filteredVideoData.slice(0, 15).map(video => video.MediaURL));
      setMutedVideos(initialMuted);
    }
  }, [loading, filteredVideoData]);

  // Check scroll position and update arrow states
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollPosition();
    }, 100);
    
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      
      return () => {
        clearTimeout(timer);
        scrollElement.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
    
    return () => clearTimeout(timer);
  }, [visibleVideos]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -320, // Width of one video item plus gap
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 320, // Width of one video item plus gap
        behavior: 'smooth'
      });
    }
  };

  const getVideoId = (video: ProtestData) => video.MediaURL;

  const handlePlayPause = (video: ProtestData, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const videoId = getVideoId(video);
    const videoElement = videoRefs.current.get(videoId);
    
    if (videoElement) {
      // If this video is currently playing, pause it
      if (currentlyPlaying === videoId) {
        videoElement.pause();
        setCurrentlyPlaying(null);
      } else {
        // Pause any currently playing video
        if (currentlyPlaying) {
          const currentVideoElement = videoRefs.current.get(currentlyPlaying);
          if (currentVideoElement) {
            currentVideoElement.pause();
          }
        }
        // Play the new video
        videoElement.play().catch(() => console.log("Playback prevented"));
        setCurrentlyPlaying(videoId);
      }
    }
  };

  const handleMuteToggle = (video: ProtestData, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const videoId = getVideoId(video);
    const videoElement = videoRefs.current.get(videoId);
    
    if (videoElement) {
      const isMuted = mutedVideos.has(videoId);
      videoElement.muted = !isMuted;
      
      if (isMuted) {
        setMutedVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
      } else {
        setMutedVideos(prev => new Set(prev).add(videoId));
      }
    }
  };

  const handleVideoRef = (video: ProtestData, element: HTMLVideoElement | null) => {
    const videoId = getVideoId(video);
    if (element) {
      videoRefs.current.set(videoId, element);
      // Set initial muted state
      element.muted = mutedVideos.has(videoId);
      
      // Add event listeners
      const handleEnded = () => {
        setCurrentlyPlaying(null);
      };
      
      const handlePause = () => {
        if (currentlyPlaying === videoId) {
          setCurrentlyPlaying(null);
        }
      };
      
      element.addEventListener('ended', handleEnded);
      element.addEventListener('pause', handlePause);
      
      // Cleanup function
      element.onloadstart = () => {
        element.removeEventListener('ended', handleEnded);
        element.removeEventListener('pause', handlePause);
      };
    } else {
      videoRefs.current.delete(videoId);
    }
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
      <div className="w-full morphic-container mb-8">
        <div className="p-6 border-b border-white/10 bg-[#00558c] rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-[#E9ECEF] to-[#CED4DA] rounded-full shadow-lg"></div>
              <h2 className="text-xl font-bold text-white">RECENT PROTEST VIDEOS</h2>
            </div>
            <Link 
              to="/all-videos"
              className="morphic-button-primary px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-white"
            >
              See All Videos
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Array.from({ length: 15 }).map((_, index) => (
              <div key={index} className="flex-none w-64 h-96 morphic-loading rounded-2xl" style={{ animationDelay: `${index * 0.1}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full morphic-container mb-8 relative">
      <div className="p-6 border-b border-white/10 bg-[#00558c] rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-[#E9ECEF] to-[#CED4DA] rounded-full shadow-lg"></div>
            <h2 className="text-xl font-bold text-white">RECENT PROTEST VIDEOS</h2>
          </div>
          <Link 
            to="/all-videos"
            className="morphic-button-primary px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-white"
          >
            See All Videos
          </Link>
        </div>
      </div>
      
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-[#00558c] hover:scale-110 border border-gray-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-[#00558c] hover:scale-110 border border-gray-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        
        <div className="px-6 py-6" ref={scrollRef}>
          <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 morphic-scrollbar scroll-smooth">
            {visibleVideos.map((video, index) => {
              const videoId = getVideoId(video);
              const isPlaying = currentlyPlaying === videoId;
              const isMuted = mutedVideos.has(videoId);
              
              return (
                <div
                  key={`${videoId}-${index}`}
                  className="flex-none w-64 h-96 morphic-video-item cursor-pointer group relative transition-all duration-300 transform-gpu"
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
                >
                  <video
                    ref={(el) => handleVideoRef(video, el)}
                    className="w-full h-full object-cover transition-all duration-300 rounded-[19px]"
                    src={`https://fdd.box.com/shared/static/${getModifiedUrl(video.MediaURL)}.mp4`}
                    muted={isMuted}
                    loop
                    preload="metadata"
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 rounded-[19px]">
                    {/* Top Controls */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      {/* Play/Pause Button - Top Left */}
                      <button
                        onClick={(e) => handlePlayPause(video, e)}
                        className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 hover:scale-110 z-20"
                        aria-label={isPlaying ? "Pause video" : "Play video"}
                      >
                        {isPlaying ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"/>
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5V19L19 12L8 5Z"/>
                          </svg>
                        )}
                      </button>

                      {/* Mute/Unmute Button - Top Right */}
                      <button
                        onClick={(e) => handleMuteToggle(video, e)}
                        className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-20"
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                      >
                        {isMuted ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.5 12C16.5 10.23 15.5 8.71 14 7.97V10.18L16.45 12.63C16.48 12.43 16.5 12.22 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.63 14.91 21 13.5 21 12C21 7.72 18 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM4.27 3L3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.53C15.58 18.04 14.83 18.46 14 18.7V20.77C15.38 20.45 16.63 19.82 17.68 18.96L19.73 21L21 19.73L12 10.73L4.27 3ZM12 4L9.91 6.09L12 8.18V4Z" fill="currentColor"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.5 8.71 14 7.97V16.02C15.5 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12S16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12S18.01 4.14 14 3.23Z" fill="currentColor"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    
                    {/* Bottom Info */}
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalVideoGrid;
