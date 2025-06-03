import React, { useRef, useEffect, useState, useCallback } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, MapRef } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'mapbox-gl';
import { useAppContext } from '../../context/AppContext';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapPopup from './MapPopup';
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
      '#ffd000',
      40,
      '#ff8400',
      250,
      '#ff0000',
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,
      100,
      30,
      750,
      40,
    ],
    'circle-opacity': 0.9,
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
    'text-size': 12
  }
};

const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'protests',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#00558c',
    'circle-opacity': 0.5,
    'circle-radius': 8,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff',
  }
};

const ProtestMap: React.FC = () => {
  const { filteredMapData, selectedFeature } = useAppContext();
  const [viewState, setViewState] = useState({
    longitude: 54.42783,
    latitude: 32.28047,
    zoom: 4.1
  });
  const [geojsonData, setGeojsonData] = useState<GeoJSONFeatureCollection | null>(null);
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (filteredMapData.length > 0) {
      const geoJson = csvToGeoJSON(filteredMapData);
      setGeojsonData(geoJson);
      
      if (mapRef.current && geoJson.features.length > 0) {
        const bounds = getBoundingBox(geoJson);
        mapRef.current.fitBounds(
          [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
          { padding: 50 }
        );
      }
    }
  }, [filteredMapData]);

  useEffect(() => {
    if (selectedFeature) {
      setViewState({
        longitude: parseFloat(selectedFeature.Longitude),
        latitude: parseFloat(selectedFeature.Latitude),
        zoom: 16
      });
      setPopupInfo(selectedFeature);
    }
  }, [selectedFeature]);

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
          
          setViewState({
            longitude: coordinates[0],
            latitude: coordinates[1],
            zoom: zoom
          });
        });
      }
    } 
    else if (feature.properties) {
      setPopupInfo(feature.properties);
    }
  }, []);

  const onPopupClose = useCallback(() => setPopupInfo(null), []);

  if (!geojsonData) {
    return <div className="w-full h-[500px] rounded-2xl border border-gray-500 flex items-center justify-center bg-gray-100">Loading map data...</div>;
  }

  return (
    <div className="w-full h-[500px] rounded-2xl border border-gray-500 overflow-hidden">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={onClick as any}
      >
        <NavigationControl position="top-right" showCompass={true} />
        
        {geojsonData && (
          <Source
            id="protests"
            type="geojson"
            data={geojsonData}
            cluster={true}
            clusterMaxZoom={10}
            clusterRadius={30}
          >
            <Layer {...clusterLayer as any} />
            <Layer {...clusterCountLayer as any} />
            <Layer {...unclusteredPointLayer as any} />
          </Source>
        )}
        
        {popupInfo && (
          <Popup
            longitude={parseFloat(popupInfo.Longitude)}
            latitude={parseFloat(popupInfo.Latitude)}
            closeButton={true}
            closeOnClick={false}
            onClose={onPopupClose}
            maxWidth="400px"
          >
            <MapPopup data={popupInfo} />
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default ProtestMap;
