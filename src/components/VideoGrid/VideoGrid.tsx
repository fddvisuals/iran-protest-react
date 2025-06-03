import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import VideoItem from './VideoItem';

const VideoGrid: React.FC = () => {
  const { filteredVideoData, loading } = useAppContext();
  const [visibleVideos, setVisibleVideos] = useState<typeof filteredVideoData>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && filteredVideoData.length > 0) {
      setVisibleVideos(filteredVideoData.slice(0, 15));
    }
  }, [loading, filteredVideoData]);

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex flex-row gap-6 p-6 min-w-max">
          {Array.from({ length: 15 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-80 h-[400px] rounded-lg animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto" ref={gridRef}>
      <div className="flex flex-row gap-6 p-6 min-w-max">
        {visibleVideos.map((video, index) => (
          <div key={index} className="flex-shrink-0 w-80">
            <VideoItem video={video} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
