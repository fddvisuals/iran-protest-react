import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ProtestData, TimeFilter, fetchMapData, fetchVideoData, filterProtestsByTimeRange } from '../utils/dataFetching';

// Statistics data interface
interface StatisticsData {
  minorsKilled: number;
  totalKilled: number;
  totalArrested: number;
  lastUpdated: string;
}

interface AppContextType {
  mapData: ProtestData[];
  videoData: ProtestData[];
  statisticsData: StatisticsData;
  loading: boolean;
  error: string | null;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  // Additional properties expected by components
  viewportFilteredData: ProtestData[];
  filteredMapData: ProtestData[];
  filteredVideoData: ProtestData[];
  selectedFeature: ProtestData | null;
  highlightedProtest: ProtestData | null;
  setSelectedFeature: (feature: ProtestData | null) => void;
  setHighlightedProtest: (protest: ProtestData | null) => void;
  setViewportFilteredData: (data: ProtestData[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [mapData, setMapData] = useState<ProtestData[]>([]);
  const [videoData, setVideoData] = useState<ProtestData[]>([]);
  const [statisticsData] = useState<StatisticsData>({
    minorsKilled: 0,
    totalKilled: 0,
    totalArrested: 0,
    lastUpdated: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time');
  
  // Additional state for component interactions
  const [viewportFilteredData, setViewportFilteredData] = useState<ProtestData[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<ProtestData | null>(null);
  const [highlightedProtest, setHighlightedProtest] = useState<ProtestData | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [mapDataResult, videoDataResult] = await Promise.all([
          fetchMapData(),
          fetchVideoData(),
        ]);
        
        setMapData(mapDataResult);
        setVideoData(videoDataResult);
        // Statistics data is initialized with default values
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Derived data based on timeFilter
  const filteredMapData = useMemo(() => {
    return filterProtestsByTimeRange(mapData, timeFilter);
  }, [mapData, timeFilter]);
  
  const filteredVideoData = useMemo(() => {
    return filterProtestsByTimeRange(videoData, timeFilter);
  }, [videoData, timeFilter]);

  const value: AppContextType = {
    mapData,
    videoData,
    statisticsData,
    loading,
    error,
    timeFilter,
    setTimeFilter,
    viewportFilteredData,
    filteredMapData,
    filteredVideoData,
    selectedFeature,
    highlightedProtest,
    setSelectedFeature,
    setHighlightedProtest,
    setViewportFilteredData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
