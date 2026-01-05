import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl';
import { ProtestData, fetchMapData } from '../utils/dataFetching';
import { csvToGeoJSON, GeoJSONFeatureCollection } from '../utils/geoJsonUtils';
import { Button } from '../components/ui/button';
import { Download } from 'lucide-react';

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
  variant?: 'default' | 'cumulative';
}

// Color schemes for different variants
const colorSchemes = {
  default: {
    background: '#0c344d',
    border: '#00558e',
    accent: '#79a5c8',
    title: '#ffffff',
    subtitle: '#78a3c7',
    badge: '#d1202a',
    footer: '#799fc0',
  },
  cumulative: {
    background: '#1a1a2e',
    border: '#4a1942',
    accent: '#c84b6c',
    title: '#ffffff',
    subtitle: '#e8a0b5',
    badge: '#16213e',
    footer: '#b8a9c9',
  }
};

const DownloadableMap: React.FC<DownloadableMapProps> = ({ 
  protests, 
  dateLabel,
  mapId,
  protestCount,
  variant = 'default'
}) => {
  const mapRef = useRef<MapRef>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
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
    setMapLoaded(true);
    
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

  const handleDownload = useCallback(async () => {
    if (!mapRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // Wait for any ongoing map operations
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const map = mapRef.current.getMap();
      const mapCanvas = map.getCanvas();
      
      // Create the final export canvas with Figma design dimensions (1500x1500)
      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas size to match Figma design
      const canvasSize = 1500;
      exportCanvas.width = canvasSize;
      exportCanvas.height = canvasSize;
      
      // Draw dark background
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      // Draw border (22px)
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 44;
      ctx.strokeRect(22, 22, canvasSize - 44, canvasSize - 44);
      
      // Draw accent top bar (half width)
      ctx.fillStyle = colors.accent;
      ctx.fillRect(0, 0, 749, 22);
      
      // Title: "Mapping Protests in Iran"
      ctx.fillStyle = colors.title;
      ctx.font = 'bold 122px "freight-sans-pro", system-ui, sans-serif';
      ctx.fillText('Mapping Protests in Iran', 65, 150);
      
      // Subtitle with date label
      ctx.fillStyle = colors.subtitle;
      ctx.font = '600 72px "freight-sans-pro", system-ui, sans-serif';
      const dateText = `${dateLabel}:`;
      ctx.fillText(dateText, 65, 270);
      
      // Calculate text width for positioning the badge
      const dateLabelWidth = ctx.measureText(dateText).width;
      
      // Red badge with count
      const badgeX = 65 + dateLabelWidth + 20;
      const badgeY = 205;
      const badgeText = protestCount.toString();
      ctx.font = '600 72px "freight-sans-pro", system-ui, sans-serif';
      const badgeTextWidth = ctx.measureText(badgeText).width;
      const badgePadding = 28;
      const badgeWidth = badgeTextWidth + badgePadding * 2;
      const badgeHeight = 85;
      
      // Draw badge background with rounded corners
      ctx.fillStyle = colors.badge;
      ctx.beginPath();
      const radius = 12;
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, radius);
      ctx.fill();
      
      // Draw badge text
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 72px "freight-sans-pro", system-ui, sans-serif';
      ctx.fillText(badgeText, badgeX + badgePadding, badgeY + 62);
      
      // Draw map image in center
      const mapWidth = 1197;
      const mapHeight = 995;
      const mapX = (canvasSize - mapWidth) / 2;
      const mapY = 325;
      
      // Draw the map canvas scaled to fit
      ctx.drawImage(mapCanvas, mapX, mapY, mapWidth, mapHeight);
      
      // Footer text
      ctx.fillStyle = colors.footer;
      ctx.font = '400 45px "freight-sans-pro", system-ui, sans-serif';
      ctx.fillText('Explore the interactive map at fdd.org/iranprotests', 48, 1410);
      
      // Load and draw FDD Logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = import.meta.env.BASE_URL + 'images/FDD_LogoNoName_Web_Reverse 1.svg';
      
      await new Promise<void>((resolve) => {
        logoImg.onload = () => {
          // Draw logo at bottom right (193x76 as per Figma)
          ctx.drawImage(logoImg, canvasSize - 193 - 80, 1358, 193, 76);
          resolve();
        };
        logoImg.onerror = () => {
          // Fallback to text if logo fails
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 60px "freight-sans-pro", system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('FDD', canvasSize - 80, 1406);
          ctx.textAlign = 'left';
          resolve();
        };
      });
      
      // Create download link
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `iran-protests-${mapId}-${dateStr}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
      
    } catch (error) {
      console.error('Error downloading map:', error);
      alert('Failed to download map. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [dateLabel, mapId, protestCount]);

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
        <div className="relative h-full flex flex-col" style={{ padding: 'clamp(16px, 4vw, 32px)' }}>
          {/* Title */}
          <h2 
            className="text-white font-bold leading-tight"
            style={{ 
              fontSize: 'clamp(24px, 5.5vw, 61px)',
              fontFamily: '"freight-sans-pro", system-ui, sans-serif'
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
                fontFamily: '"freight-sans-pro", system-ui, sans-serif'
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
                padding: 'clamp(2px, 0.5vw, 6px) clamp(8px, 1.5vw, 16px)',
                fontFamily: '"freight-sans-pro", system-ui, sans-serif'
              }}
            >
              {protestCount}
            </span>
          </div>
          
          {/* Map container */}
          <div 
            className="flex-1 rounded-lg overflow-hidden"
            style={{ marginTop: 'clamp(8px, 2vw, 16px)', minHeight: '200px', background: 'transparent' }}
          >
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_TOKEN}
              mapStyle="mapbox://styles/fddvisuals/cmc27wmsr002o01qlcu8n7zy3"
              initialViewState={{
                longitude: 53.5,
                latitude: 32.5,
                zoom: 4.0,
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
          
          {/* Footer */}
          <div 
            className="flex items-center justify-between"
            style={{ marginTop: 'clamp(8px, 2vw, 16px)' }}
          >
            <span 
              className="font-normal"
              style={{ 
                color: colors.footer,
                fontSize: 'clamp(9px, 2vw, 18px)',
                fontFamily: '"freight-sans-pro", system-ui, sans-serif'
              }}
            >
              Explore the interactive map at fdd.org/iranprotests
            </span>
            <img 
              src={import.meta.env.BASE_URL + 'images/FDD_LogoNoName_Web_Reverse 1.svg'}
              alt="FDD"
              style={{ height: 'clamp(20px, 4vw, 32px)' }}
            />
          </div>
        </div>
      </div>
      
      {/* Download button */}
      <Button
        onClick={handleDownload}
        disabled={isDownloading || !mapLoaded}
        className="bg-[#00558c] hover:bg-[#004778] text-white self-start"
        size="lg"
      >
        <Download className="w-5 h-5 mr-2" />
        {isDownloading ? 'Generating Image...' : 'Download 1500×1500 Image'}
      </Button>
      
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

  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

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
          <p className="text-gray-400">Download promotional images for social media</p>
          <p className="text-sm text-gray-500">Generated on {todayLabel}</p>
        </div>

        {/* Map 1: Today's Protests */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#E7AC51]">📅 Today's Protests</h3>
          <DownloadableMap
            protests={todayProtests}
            dateLabel={todayLabel}
            mapId="today"
            protestCount={todayProtests.length}
          />
        </div>

        {/* Map 2: Since December 28, 2025 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#c84b6c]">📈 Since December 28, 2025</h3>
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
