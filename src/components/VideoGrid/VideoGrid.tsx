import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import VideoItem from './VideoItem';

const VideoGrid: React.FC = () => {
  const { filteredVideoData, loading } = useAppContext();
  const [visibleVideos, setVisibleVideos] = useState<typeof filteredVideoData>([]);
  const [loadedCount, setLoadedCount] = useState(6); // Start with fewer videos
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && filteredVideoData.length > 0) {
      setVisibleVideos(filteredVideoData.slice(0, Math.min(loadedCount, filteredVideoData.length)));
    }
  }, [loading, filteredVideoData, loadedCount]);

  const loadMore = () => {
    setLoadedCount(prev => Math.min(prev + 6, filteredVideoData.length));
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex flex-row gap-8 p-8 min-w-max">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-80 h-[400px] morphic-loading rounded-3xl morphic-floating" style={{ animationDelay: `${index * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto morphic-scrollbar" ref={gridRef}>
        <div className="flex flex-row gap-8 p-8 min-w-max">
          {visibleVideos.map((video, index) => (
            <div key={index} className="flex-shrink-0 w-80" style={{ animationDelay: `${index * 0.05}s` }}>
              <VideoItem video={video} />
            </div>
          ))}
          {loadedCount < filteredVideoData.length && (
            <div className="flex-shrink-0 w-80 flex items-center justify-center">
              <button
                onClick={loadMore}
                className="morphic-button-primary px-6 py-3 text-sm font-medium rounded-xl"
              >
                Load More ({filteredVideoData.length - loadedCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGrid;
