import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchVideoData, fetchMapData, ProtestData, TimeFilter, filterProtestsByTimeRange } from '../utils/dataFetching';

interface AppContextType {
  videoData: ProtestData[];
  mapData: ProtestData[];
  filteredMapData: ProtestData[];
  filteredVideoData: ProtestData[];
  viewportFilteredData: ProtestData[];
  loading: boolean;
  error: string | null;
  selectedFeature: ProtestData | null;
  highlightedProtest: ProtestData | null;
  timeFilter: TimeFilter;
  setSelectedFeature: (feature: ProtestData | null) => void;
  setHighlightedProtest: (protest: ProtestData | null) => void;
  setTimeFilter: (filter: TimeFilter) => void;
  setViewportFilteredData: (data: ProtestData[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [videoData, setVideoData] = useState<ProtestData[]>([]);
  const [mapData, setMapData] = useState<ProtestData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<ProtestData | null>(null);
  const [highlightedProtest, setHighlightedProtest] = useState<ProtestData | null>(null);
  const [viewportFilteredData, setViewportFilteredData] = useState<ProtestData[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time');

  // Compute filtered data based on current timeFilter
  const filteredMapData = filterProtestsByTimeRange(mapData, timeFilter);
  
  // Debug: Log available Estimated_Size values
  const timeFilteredVideos = filterProtestsByTimeRange(videoData, timeFilter);
  console.log('Current time filter:', timeFilter);
  console.log('Time filtered videos:', timeFilteredVideos.length);
  console.log('All video data:', videoData.length);
  const allSizeValues = [...new Set(videoData.map(v => v.Estimated_Size))];
  console.log('All available Estimated_Size values in videoData:', allSizeValues);
  const timeFilteredSizeValues = [...new Set(timeFilteredVideos.map(v => v.Estimated_Size))];
  console.log('Available Estimated_Size values after time filter:', timeFilteredSizeValues);
  
  // Log each video with its size for debugging
  if (videoData.length > 0) {
    console.log('First few videos with their sizes:');
    videoData.slice(0, 5).forEach((v, i) => {
      console.log(`Video ${i + 1}:`, { 
        date: v.Date, 
        size: v.Estimated_Size, 
        city: v.City_Village 
      });
    });
  }
  
  // Temporarily show all videos to debug - REMOVE SIZE FILTER
  const filteredVideoData = timeFilteredVideos;

  // Initialize viewportFilteredData with filteredMapData when data loads or time filter changes
  useEffect(() => {
    if (filteredMapData.length > 0 && viewportFilteredData.length === 0) {
      setViewportFilteredData(filteredMapData);
    }
  }, [filteredMapData, viewportFilteredData.length]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [videos, protests] = await Promise.all([
          fetchVideoData(),
          fetchMapData()
        ]);
        setVideoData(videos);
        setMapData(protests);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <AppContext.Provider value={{
      videoData,
      mapData,
      filteredMapData,
      filteredVideoData,
      viewportFilteredData,
      loading,
      error,
      selectedFeature,
      highlightedProtest,
      timeFilter,
      setSelectedFeature,
      setHighlightedProtest,
      setTimeFilter,
      setViewportFilteredData
    }}>
      {children}
    </AppContext.Provider>
  );
};
