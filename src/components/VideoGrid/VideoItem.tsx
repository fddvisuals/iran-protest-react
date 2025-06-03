import React, { useState, useRef, useEffect } from 'react';
import { ProtestData } from '../../utils/dataFetching';
import { getModifiedUrl } from '../../utils/dataFetching';

interface VideoItemProps {
  video: ProtestData;
}

const VideoItem = ({ video }: VideoItemProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
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

  useEffect(() => {
    let hoverTimeout: NodeJS.Timeout;
    
    const handleMouseEnter = () => {
      clearTimeout(hoverTimeout);
      setIsHovering(true);
      if (videoRef.current && !isPlaying) {
        videoRef.current.play().catch(() => console.log("Autoplay prevented"));
      }
    };
    
    const handleMouseLeave = () => {
      hoverTimeout = setTimeout(() => {
        setIsHovering(false);
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
      className="relative flex flex-col gap-2 group"
      onClick={handleVideoClick}
    >
      {!isLoaded && <div className="w-full h-[400px] rounded-3xl animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>}
      
      <video
        ref={videoRef}
        src={videoUrl}
        className={`
          w-full h-auto min-h-[400px] border-4 border-transparent object-cover cursor-pointer rounded-3xl
          ${isHovering && !isPlaying ? 'border-[#0c8a3a]' : ''}
          ${isPlaying ? 'border-[#e32d45]' : ''}
          ${!isLoaded ? 'opacity-0' : 'opacity-100'}
        `}
        style={{ transition: 'opacity 0.3s ease' }}
        controls={false}
        loop
        muted={isMuted}
        preload="auto"
        onLoadedData={handleVideoLoaded}
      />
      
      {/* Audio Toggle Button */}
      {isLoaded && (
        <button
          onClick={handleAudioToggle}
          className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-all duration-200 z-10"
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
        <div className="absolute bottom-1 left-1 right-1 bg-gradient-to-t from-black/60 via-black/40 to-transparent backdrop-blur-md text-white p-4 font-sans opacity-0 transition-opacity duration-300 ease-in-out pointer-events-auto group-hover:opacity-100 flex flex-col justify-end rounded-b-lg">
          <div className="overflow-y-auto video-description-scroll pr-2">
            <div className="mb-3">
              <p className="text-sm font-semibold text-blue-200 mb-1">{formattedDate}</p>
              {getLocation() && (
                <p className="text-xs text-gray-300 mb-2">📍 {getLocation()}</p>
              )}
            </div>
            <p className="text-sm leading-relaxed mb-3">{video.Description}</p>
            <p className="text-xs opacity-90">
              Source: <a href={video.Link} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 hover:underline transition-colors">{video.Source}</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoItem;
