import React, { useState, useRef, useEffect } from 'react';
import { ProtestData } from '../../utils/dataFetching';
import { getModifiedUrl } from '../../utils/dataFetching';

interface VideoItemProps {
  video: ProtestData;
}

const VideoItem = ({ video }: VideoItemProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const videoUrl = `https://fdd.box.com/shared/static/${getModifiedUrl(video.MediaURL)}.mp4`;
  const formattedDate = new Date(video.Date).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  const getLocation = () => {
    const parts = [video.City_Village, video.County, video.Province].filter(Boolean);
    return parts.join(', ');
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let hoverTimeout: NodeJS.Timeout;
    
    const handleMouseEnter = () => {
      clearTimeout(hoverTimeout);
      if (videoRef.current && !isPlaying) {
        videoRef.current.play().catch(() => console.log("Autoplay prevented"));
      }
    };
    
    const handleMouseLeave = () => {
      hoverTimeout = setTimeout(() => {
        if (videoRef.current && !isPlaying) {
          videoRef.current.pause();
        }
      }, 100);
    };
    
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('mouseenter', handleMouseEnter);
      wrapper.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (wrapper) {
        wrapper.removeEventListener('mouseenter', handleMouseEnter);
        wrapper.removeEventListener('mouseleave', handleMouseLeave);
      }
      clearTimeout(hoverTimeout);
    };
  }, [isPlaying]);

  const handleVideoLoaded = () => {
    setIsLoaded(true);
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => console.log("Playback prevented"));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video click handler
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      ref={wrapperRef} 
      className="relative flex flex-col gap-4 group morphic-floating"
      onClick={handleVideoClick}
    >
      {!isLoaded && <div className="w-full h-[500px] morphic-loading rounded-3xl"></div>}
      
      <div className="morphic-video-item">
        {isInView && (
          <video
            ref={videoRef}
            src={videoUrl}
            className={`
              w-full h-auto min-h-[400px] max-h-[600px] object-cover cursor-pointer rounded-[19px] bg-black transition-all duration-500
              ${!isLoaded ? 'opacity-0' : 'opacity-100'}
            `}
            style={{ transition: 'opacity 0.3s ease, transform 0.3s ease' }}
            controls={false}
            loop
            muted={isMuted}
            preload="metadata"
            onLoadedData={handleVideoLoaded}
          />
        )}
        
        {!isInView && (
          <div className="w-full h-[500px] bg-gray-800 rounded-3xl flex items-center justify-center">
            <div className="text-white/50 text-sm">Loading...</div>
          </div>
        )}
        
        {/* Audio Toggle Button */}
        {isLoaded && (
          <button
            onClick={handleAudioToggle}
            className="absolute top-4 right-4 morphic-audio-control text-white p-3 hover:scale-110 transition-all duration-200 z-10"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 12C16.5 10.23 15.5 8.71 14 7.97V10.18L16.45 12.63C16.48 12.43 16.5 12.22 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.63 14.91 21 13.5 21 12C21 7.72 18 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM4.27 3L3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.53C15.58 18.04 14.83 18.46 14 18.7V20.77C15.38 20.45 16.63 19.82 17.68 18.96L19.73 21L21 19.73L12 10.73L4.27 3ZM12 4L9.91 6.09L12 8.18V4Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.5 8.71 14 7.97V16.02C15.5 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12S16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12S18.01 4.14 14 3.23Z" fill="currentColor"/>
              </svg>
            )}
          </button>
        )}
        
        {isLoaded && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-md text-white p-6 font-sans opacity-0 transition-all duration-500 ease-in-out pointer-events-auto group-hover:opacity-100 flex flex-col justify-end rounded-b-[19px]">
            <div className="overflow-y-auto video-description-scroll morphic-scrollbar pr-2 max-h-32">
              <div className="mb-4">
                <p className="text-sm font-semibold text-blue-200 mb-2 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7Z"/>
                  </svg>
                  {formattedDate}
                </p>
                {getLocation() && (
                  <p className="text-xs text-gray-300 mb-3 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z"/>
                    </svg>
                    {getLocation()}
                  </p>
                )}
              </div>
              <p className="text-sm leading-relaxed mb-4 text-gray-100">{video.Description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <p className="text-xs opacity-90">
                  Source: <a href={video.Link} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 hover:underline transition-colors font-medium">{video.Source}</a>
                </p>
                {video.Estimated_Size && (
                  <div className="flex items-center gap-1 text-xs text-gray-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4ZM8 12C10.2 12 12 13.8 12 16C12 18.2 10.2 20 8 20C5.8 20 4 18.2 4 16C4 13.8 5.8 12 8 12ZM8 6C9.1 6 10 6.9 10 8C10 9.1 9.1 10 8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6Z"/>
                    </svg>
                    {video.Estimated_Size}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoItem;
