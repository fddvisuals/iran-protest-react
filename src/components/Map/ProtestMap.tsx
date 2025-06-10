import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, MapRef } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'mapbox-gl';
import { useAppContext } from '../../context/AppContext';
import { csvToGeoJSON, getBoundingBox, GeoJSONFeatureCollection } from '../../utils/geoJsonUtils';

const MAPBOX_TOKEN = "pk.eyJ1IjoiZmRkdmlzdWFscyIsImEiOiJjbGZyODY1dncwMWNlM3pvdTNxNjF4dG1rIn0.wX4YYvWhm5W-5t8y5pp95w";

const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'protests',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#00558c', // blue primary
      40,
      '#004778', // darker blue
      250,
      '#003961', // darkest blue
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
    'circle-color': '#00558c', // blue primary
    'circle-opacity': 0.8,
    'circle-radius': 10,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-stroke-opacity': 0.9,
  }
};

const ProtestMap: React.FC = () => {
  const { filteredMapData, selectedFeature, setHighlightedProtest, setViewportFilteredData } = useAppContext();
  const [viewState, setViewState] = useState({
    longitude: 54.42783,
    latitude: 32.28047,
    zoom: 4.1
  });
  const [geojsonData, setGeojsonData] = useState<GeoJSONFeatureCollection | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const mapRef = useRef<MapRef>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize geojson conversion to avoid unnecessary recalculations
  const memoizedGeojsonData = useMemo(() => {
    if (filteredMapData.length > 0) {
      return csvToGeoJSON(filteredMapData);
    }
    return null;
  }, [filteredMapData]);

  useEffect(() => {
    setGeojsonData(memoizedGeojsonData);
    
    // Only fit bounds on initial load, not when time filter changes
    if (mapRef.current && memoizedGeojsonData && memoizedGeojsonData.features.length > 0 && isInitialLoad) {
      const bounds = getBoundingBox(memoizedGeojsonData);
      mapRef.current.fitBounds(
        [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
        { padding: 50, duration: 1000 }
      );
      setIsInitialLoad(false);
    }
  }, [memoizedGeojsonData, isInitialLoad]);

  useEffect(() => {
    if (selectedFeature) {
      setViewState(prev => ({
        ...prev,
        longitude: parseFloat(selectedFeature.Longitude),
        latitude: parseFloat(selectedFeature.Latitude),
        zoom: 16
      }));
    }
  }, [selectedFeature]);

  // Debounced function to filter protests based on current viewport
  const updateViewportFilter = useCallback(() => {
    if (!mapRef.current || !filteredMapData.length) return;

    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce the update to improve performance
    updateTimeoutRef.current = setTimeout(() => {
      const bounds = mapRef.current?.getBounds();
      if (!bounds) return;

      const filteredData = filteredMapData.filter(protest => {
        const lng = parseFloat(protest.Longitude);
        const lat = parseFloat(protest.Latitude);
        return lng >= bounds.getWest() && 
               lng <= bounds.getEast() && 
               lat >= bounds.getSouth() && 
               lat <= bounds.getNorth();
      });
      
      setViewportFilteredData(filteredData);
    }, 300); // 300ms debounce
  }, [filteredMapData, setViewportFilteredData]);

  // Update viewport filter when map moves or data changes - with debouncing
  useEffect(() => {
    updateViewportFilter();
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateViewportFilter]);

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    
    if (!feature) return;

    if (feature.properties?.cluster_id) {
      const clusterId = feature.properties.cluster_id;
      const mapboxSource = mapRef.current?.getSource('protests');
      
      if (mapboxSource && 'getClusterExpansionZoom' in mapboxSource) {
        (mapboxSource as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          
          const coordinates = (feature.geometry as any).coordinates;
          
          setViewState(prev => ({
            ...prev,
            longitude: coordinates[0],
            latitude: coordinates[1],
            zoom: zoom
          }));
        });
      }
    } 
    else if (feature.properties) {
      // Find the matching protest data and highlight it in the list
      const coordinates = (feature.geometry as any).coordinates;
      const protestData = filteredMapData.find(protest => 
        Math.abs(parseFloat(protest.Longitude) - coordinates[0]) < 0.0001 &&
        Math.abs(parseFloat(protest.Latitude) - coordinates[1]) < 0.0001
      );
      
      if (protestData) {
        setHighlightedProtest(protestData);
        // Clear highlight after 3 seconds
        setTimeout(() => setHighlightedProtest(null), 3000);
      }
    }
  }, [filteredMapData, setHighlightedProtest]);

  // Function to reset map to show all data
  const resetMapView = useCallback(() => {
    if (mapRef.current && geojsonData && geojsonData.features.length > 0) {
      const bounds = getBoundingBox(geojsonData);
      mapRef.current.fitBounds(
        [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
        { padding: 50, duration: 1000 }
      );
    }
  }, [geojsonData]);

  if (!geojsonData) {
    return (
      <div className="w-full h-[600px] morphic-container flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#00558c] to-[#004778] rounded-full mx-auto animate-pulse shadow-lg"></div>
          <p className="text-white font-medium">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] morphic-container overflow-hidden relative">
      {/* Reset View Button Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={resetMapView}
          className="morphic-map-overlay px-3 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors duration-200 rounded flex items-center space-x-1"
          title="Reset map view to show all protests"
        >
          <svg 
            className="w-3 h-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          <span>Reset View</span>
        </button>
      </div>
      
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        longitude={viewState.longitude}
        latitude={viewState.latitude}
        zoom={viewState.zoom}
        onMove={(evt: any) => {
          setViewState(prev => ({
            ...prev,
            ...evt.viewState
          }));
          // Debounced viewport filter update
          updateViewportFilter();
        }}
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={onClick as any}
        // Performance optimizations
        maxTileCacheSize={50}
        transformRequest={(url: string) => {
          // Add tile compression for better performance
          if (url.includes('mapbox.com')) {
            return {
              url: url,
              headers: {
                'Accept-Encoding': 'gzip'
              }
            };
          }
          return { url };
        }}
      >
        <NavigationControl position="bottom-right" showCompass={true} />
        
        {geojsonData && (
          <Source
            id="protests"
            type="geojson"
            data={geojsonData}
            cluster={true}
            clusterMaxZoom={12}
            clusterRadius={50}
            clusterProperties={{
              // Add cluster properties for better performance
              'has_video': ['any', ['get', 'MediaURL']],
              'max_size': ['max', ['get', 'Estimated_Size']]
            }}
          >
            <Layer {...clusterLayer as any} />
            <Layer {...clusterCountLayer as any} />
            <Layer {...unclusteredPointLayer as any} />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default ProtestMap;
