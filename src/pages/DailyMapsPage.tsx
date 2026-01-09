import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl';
import { ProtestData, fetchMapData } from '../utils/dataFetching';
import { csvToGeoJSON, GeoJSONFeatureCollection } from '../utils/geoJsonUtils';
import { Button } from '../components/ui/button';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Reference date: December 28, 2025
const SINCE_DATE = new Date('2025-12-28');

// Map layers configuration
const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'protests',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#00558c',
      40,
      '#004778',
      250,
      '#003961',
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      18,
      100,
      28,
      750,
      38,
    ],
    'circle-opacity': 0.9,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-stroke-opacity': 0.8,
  }
};

const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'protests',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 13
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': 'rgba(0,0,0,0.1)',
    'text-halo-width': 1
  }
};

const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'protests',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#00558c',
    'circle-opacity': 0.8,
    'circle-radius': 10,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-stroke-opacity': 0.9,
  }
};

interface DownloadableMapProps {
  protests: ProtestData[];
  dateLabel: string;
  mapId: string;
  protestCount: number;
  variant?: 'default' | 'cumulative' | 'timelapse';
}

// Color schemes for different variants
const colorSchemes = {
  default: {
    background: '#0c344d',
    border: '#00558e',
    accent: '#79a5c8',
    title: '#ffffff',
    subtitle: '#78a3c7',
    badge: '#2c6e49',
    footer: '#799fc0',
  },
  cumulative: {
    background: '#0f2f4a',
    border: '#00558e',
    accent: '#79a5c8',
    title: '#ffffff',
    subtitle: '#ffffff',
    badge: '#2c6e49',
    footer: '#799fc0',
  },
  timelapse: {
    background: '#0c344d',
    border: '#00558e',
    accent: '#79a5c8',
    title: '#ffffff',
    subtitle: '#78a3c7',
    badge: '#2c6e49',
    footer: '#799fc0',
  }
};

const DownloadableMap: React.FC<DownloadableMapProps> = ({ 
  protests, 
  dateLabel,
  mapId: _mapId,
  protestCount,
  variant = 'default'
}) => {
  const mapRef = useRef<MapRef>(null);
  
  const colors = colorSchemes[variant];

  const geojsonData = useMemo((): GeoJSONFeatureCollection | null => {
    if (protests.length > 0) {
      return csvToGeoJSON(protests);
    }
    return null;
  }, [protests]);

  // Keep map at fixed Iran view - no auto-fitting to data

  // Handle map load and remove background layer for transparency
  const handleMapLoad = useCallback(() => {
    // Remove background layers to make map transparent
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      const style = map.getStyle();
      if (style && style.layers) {
        style.layers.forEach((layer: any) => {
          if (layer.type === 'background') {
            map.removeLayer(layer.id);
          }
        });
      }
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Preview Card matching Figma design */}
      <div 
        className="relative"
        style={{
          width: '100%',
          maxWidth: '750px',
          aspectRatio: '1 / 1',
          background: colors.background,
          border: `11px solid ${colors.border}`,
          overflow: 'visible',
        }}
      >
        {/* Accent top bar (half width) - overlaps top border */}
        <div 
          className="absolute"
          style={{ 
            top: '-11px',
            left: '-11px',
            width: '50%',
            height: '11px',
            background: colors.accent,
            zIndex: 20
          }}
        />
        
        {/* Content container */}
        <div className="relative h-full" style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
          {variant === 'timelapse' ? (
            /* Timelapse variant - only number */
            <div className="flex items-center justify-center" style={{ paddingTop: 'clamp(16px, 3vw, 24px)' }}>
              <span
                style={{
                  background: '#2c6e49',
                  color: '#ffffff',
                  fontSize: 'clamp(32px, 8vw, 60px)',
                  fontFamily: 'freight-sans-pro, system-ui, sans-serif',
                  fontWeight: 600,
                  borderRadius: '12px',
                  padding: 'clamp(8px, 1.5vw, 16px) clamp(12px, 2vw, 20px)',
                  lineHeight: 1,
                }}
              >
                {protestCount}
              </span>
            </div>
          ) : variant === 'cumulative' ? (
            <div className="flex flex-col" style={{ gap: 'clamp(2px, 0.5vw, 6px)' }}>
              {/* Line 1: Since December 28, 2025, there */}
              <p
                style={{
                  color: '#79a5c8',
                  fontSize: 'clamp(24px, 6.2vw, 46px)',
                  fontFamily: 'freight-sans-pro, system-ui, sans-serif',
                  fontWeight: 600,
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                }}
              >
                {dateLabel}, there
              </p>
              {/* Line 2: have been [badge] protests in Iran */}
              <div className="flex items-center" style={{ gap: 'clamp(5px, 1vw, 10px)' }}>
                <span
                  style={{
                    color: '#78a3c7',
                    fontSize: 'clamp(24px, 6.2vw, 46px)',
                    fontFamily: 'freight-sans-pro, system-ui, sans-serif',
                    fontWeight: 600,
                    lineHeight: 1.15,
                  }}
                >
                  have been
                </span>
                <span
                  style={{
                    background: '#2c6e49',
                    color: '#ffffff',
                    fontSize: 'clamp(24px, 6.2vw, 46px)',
                    fontFamily: 'freight-sans-pro, system-ui, sans-serif',
                    fontWeight: 600,
                    borderRadius: '8px',
                    padding: 'clamp(5px, 1vw, 10px) clamp(8px, 0.8vw, 10px)',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {protestCount}
                </span>
                <span
                  style={{
                    color: '#78a3c7',
                    fontSize: 'clamp(24px, 6.2vw, 46px)',
                    fontFamily: 'freight-sans-pro, system-ui, sans-serif',
                    fontWeight: 600,
                    lineHeight: 1.15,
                  }}
                >
                  protests in Iran
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Title */}
              <h2 
                className="text-white font-bold leading-tight"
                style={{ 
                  fontSize: 'clamp(24px, 5.5vw, 61px)',
                  fontFamily: 'freight-sans-pro, system-ui, sans-serif'
                }}
              >
                Mapping Protests in Iran
              </h2>
              
              {/* Subtitle with badge */}
              <div className="flex items-center gap-2" style={{ marginTop: 'clamp(4px, 1vw, 8px)' }}>
                <span 
                  className="font-semibold"
                  style={{ 
                    color: colors.subtitle,
                    fontSize: 'clamp(14px, 3.2vw, 36px)',
                    fontFamily: 'freight-sans-pro, system-ui, sans-serif'
                  }}
                >
                  {dateLabel}:
                </span>
                <span 
                  className="text-white font-semibold"
                  style={{ 
                    background: colors.badge,
                    fontSize: 'clamp(12px, 3vw, 32px)',
                    borderRadius: '8px',
                    padding: 'clamp(2px, 0.4vw, 5px) clamp(6px, 1.2vw, 12px)',
                    fontFamily: 'freight-sans-pro, system-ui, sans-serif'
                  }}
                >
                  {protestCount}
                </span>
              </div>
            </>
          )}
          
          {/* Map container - positioned to fill middle area */}
          <div 
            className="absolute rounded-lg overflow-hidden"
            style={{ 
              top: variant === 'timelapse' ? 'clamp(90px, 16vw, 120px)' : variant === 'cumulative' ? 'clamp(90px, 18vw, 140px)' : 'clamp(80px, 16vw, 120px)',
              left: 'clamp(16px, 3vw, 24px)',
              right: 'clamp(16px, 3vw, 24px)',
              bottom: variant === 'timelapse' ? 'clamp(16px, 3vw, 24px)' : 'clamp(50px, 10vw, 70px)',
              background: 'transparent'
            }}
          >
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_TOKEN}
              mapStyle="mapbox://styles/fddvisuals/cmc27wmsr002o01qlcu8n7zy3"
              initialViewState={{
                longitude: 53.5,
                latitude: 33,
                zoom: 4.2,
              }}
              style={{ width: '100%', height: '100%' }}
              onLoad={handleMapLoad}
              preserveDrawingBuffer={true}
              attributionControl={false}
            >
              {geojsonData && (
                <Source
                  id="protests"
                  type="geojson"
                  data={geojsonData}
                  cluster={true}
                  clusterMaxZoom={12}
                  clusterRadius={50}
                >
                  <Layer {...clusterLayer as any} />
                  <Layer {...clusterCountLayer as any} />
                  <Layer {...unclusteredPointLayer as any} />
                </Source>
              )}
            </Map>
          </div>
          
          {/* Footer - positioned at absolute bottom (hidden for timelapse) */}
          {variant !== 'timelapse' && (
            <div 
              className="absolute left-0 right-0 flex items-center justify-between"
              style={{ 
                bottom: 'clamp(12px, 3vw, 24px)',
                left: 'clamp(16px, 3.2vw, 24px)',
                right: 'clamp(16px, 3.2vw, 24px)',
              }}
            >
              <span 
                className="font-normal"
                style={{ 
                  color: '#799FC0',
                  fontSize: 'clamp(12px, 3vw, 22px)',
                  fontFamily: 'freight-sans-pro, system-ui, sans-serif'
                }}
              >
                Explore the interactive map at fdd.org/iranprotests
              </span>
              <img 
                src={import.meta.env.BASE_URL + 'images/FDD_LogoNoName_Web_Reverse 1.svg'}
                alt="FDD"
                style={{ height: 'clamp(24px, 5vw, 38px)' }}
              />
            </div>
          )}
        </div>
      </div>
      
      {protests.length === 0 && (
        <div className="p-4 bg-gray-700/50 rounded-lg text-center">
          <p className="text-gray-400">No protests documented for this period.</p>
          <p className="text-sm text-gray-500 mt-1">Data is updated throughout the day.</p>
        </div>
      )}
    </div>
  );
};

const DailyMapsPage: React.FC = () => {
  const [allData, setAllData] = useState<ProtestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Time-lapse slider state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState(false);

  // Simple password - in production, use environment variables or proper auth
  const CORRECT_PASSWORD = 'iran2026';

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
      // Optionally store in sessionStorage so user doesn't need to re-enter on refresh
      sessionStorage.setItem('dailyMapsAuth', 'true');
    } else {
      setAuthError('Incorrect password');
    }
  };

  // Check sessionStorage on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('dailyMapsAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchMapData();
        setAllData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter protests for today
  const todayProtests = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return allData.filter(protest => {
      if (!protest.Date) return false;
      try {
        const protestDate = new Date(protest.Date);
        const protestDateStr = protestDate.toISOString().split('T')[0];
        return protestDateStr === todayStr;
      } catch {
        return false;
      }
    });
  }, [allData]);

  // Filter protests since December 28, 2025
  const sinceDecemberProtests = useMemo(() => {
    return allData.filter(protest => {
      if (!protest.Date) return false;
      try {
        const protestDate = new Date(protest.Date);
        return protestDate >= SINCE_DATE;
      } catch {
        return false;
      }
    });
  }, [allData]);

  // Filter protests for the selected date (time-lapse)
  const timelapseProtests = useMemo(() => {
    
    return allData.filter(protest => {
      if (!protest.Date) return false;
      try {
        const protestDate = new Date(protest.Date);
        // Include all protests from SINCE_DATE up to and including selected date
        return protestDate >= SINCE_DATE && protestDate <= selectedDate;
      } catch {
        return false;
      }
    });
  }, [allData, selectedDate]);

  // Auto-play functionality for time-lapse
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setSelectedDate(prevDate => {
        const nextDate = new Date(prevDate);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (nextDate > today) {
          setIsPlaying(false);
          return prevDate;
        }
        
        return nextDate;
      });
    }, 1000); // Change date every second
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Calculate total days for slider
  const getTotalDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today.getTime() - SINCE_DATE.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDayIndex = (date: Date) => {
    const diffTime = Math.abs(date.getTime() - SINCE_DATE.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDateFromIndex = (index: number) => {
    const date = new Date(SINCE_DATE);
    date.setDate(date.getDate() + index);
    return date;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    setSelectedDate(getDateFromIndex(index));
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setSelectedDate(SINCE_DATE);
    setIsPlaying(false);
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0c344d] flex items-center justify-center">
        <div className="bg-[#18334b] p-8 rounded-lg border border-[#00558e] max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Daily Promotion Maps</h1>
          <p className="text-gray-400 text-center mb-6">Enter password to access this page</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-[#0c344d] border border-[#00558e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#79a5c8]"
              autoFocus
            />
            {authError && (
              <p className="text-red-400 text-sm text-center">{authError}</p>
            )}
            <Button type="submit" className="w-full bg-[#00558c] hover:bg-[#004778]">
              Access Page
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c344d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#00558c] to-[#004778] rounded-full mx-auto animate-pulse"></div>
          <p className="text-white font-medium">Loading protest data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c344d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Daily Promotion Maps</h1>
        </div>

        {/* Time-lapse Slider Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#79a5c8]">Time-lapse View (Internal Use)</h3>
          <div className="bg-[#18334b] p-6 rounded-lg border border-[#00558e]">
            <div className="space-y-6">
              {/* Date Display */}
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {formatSelectedDate(selectedDate)}
                </div>
                <div className="text-sm text-gray-400">
                  Cumulative protests since Dec 28, 2025: {timelapseProtests.length}
                </div>
              </div>

              {/* Slider */}
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={getTotalDays()}
                  value={getDayIndex(selectedDate)}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#E7AC51]"
                  style={{
                    background: `linear-gradient(to right, #E7AC51 0%, #E7AC51 ${(getDayIndex(selectedDate) / getTotalDays()) * 100}%, #374151 ${(getDayIndex(selectedDate) / getTotalDays()) * 100}%, #374151 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>Dec 28, 2025</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleReset}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
                >
                  Reset
                </Button>
                <Button
                  onClick={handlePlayPause}
                  className="bg-[#E7AC51] hover:bg-[#D4A044] text-white px-6 py-2"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              </div>

              {/* Map for selected date */}
              <div className="mt-6">
                <DownloadableMap
                  protests={timelapseProtests}
                  dateLabel={`Since Dec 28 - ${formatSelectedDate(selectedDate)}`}
                  mapId="timelapse"
                  protestCount={timelapseProtests.length}
                  variant="timelapse"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Map 1: Today's Protests */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#E7AC51]">Today's Protests</h3>
          <DownloadableMap
            protests={todayProtests}
            dateLabel={todayLabel}
            mapId="today"
            protestCount={todayProtests.length}
          />
        </div>

        {/* Map 2: Since December 28, 2025 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#c84b6c]">Since December 28, 2025,</h3>
          <DownloadableMap
            protests={sinceDecemberProtests}
            dateLabel="Since December 28, 2025"
            mapId="since-dec-28"
            protestCount={sinceDecemberProtests.length}
            variant="cumulative"
          />
        </div>

        {/* Back to Home Link */}
        <div className="text-center pt-8">
          <a 
            href="/"
            className="text-[#79a5c8] hover:text-white transition-colors underline"
          >
            ← Back to Iran Protest Tracker
          </a>
        </div>
      </div>
    </div>
  );
};

export default DailyMapsPage;
