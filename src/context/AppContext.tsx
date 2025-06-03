import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchVideoData, fetchMapData, ProtestData, TimeFilter, filterProtestsByTimeRange } from '../utils/dataFetching';

interface AppContextType {
  videoData: ProtestData[];
  mapData: ProtestData[];
  filteredMapData: ProtestData[];
  filteredVideoData: ProtestData[];
  loading: boolean;
  error: string | null;
  selectedFeature: ProtestData | null;
  timeFilter: TimeFilter;
  setSelectedFeature: (feature: ProtestData | null) => void;
  setTimeFilter: (filter: TimeFilter) => void;
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
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time');

  // Compute filtered data based on current timeFilter
  const filteredMapData = filterProtestsByTimeRange(mapData, timeFilter);
  const filteredVideoData = filterProtestsByTimeRange(videoData, timeFilter);

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
      loading,
      error,
      selectedFeature,
      timeFilter,
      setSelectedFeature,
      setTimeFilter
    }}>
      {children}
    </AppContext.Provider>
  );
};
