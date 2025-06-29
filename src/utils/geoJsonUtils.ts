import { ProtestData } from './dataFetching';

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: ProtestData;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Convert CSV data to GeoJSON format
 * @param csvData Array of protest data objects
 * @returns GeoJSON FeatureCollection
 */
export const csvToGeoJSON = (csvData: ProtestData[]): GeoJSONFeatureCollection => {
  const features: GeoJSONFeature[] = csvData
    .filter(row => row.Longitude && row.Latitude) // Filter out rows without coordinates
    .map(row => {
      const longitude = parseFloat(row.Longitude);
      const latitude = parseFloat(row.Latitude);
      
      if (isNaN(longitude) || isNaN(latitude)) {
        return null;
      }
      
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        properties: row
      };
    })
    .filter(Boolean) as GeoJSONFeature[]; // Filter out null values
    
  return {
    type: 'FeatureCollection',
    features
  };
};

/**
 * Get the bounding box of a GeoJSON FeatureCollection
 * @param geojson GeoJSON FeatureCollection
 * @returns Bounding box as [minLng, minLat, maxLng, maxLat]
 */
export const getBoundingBox = (geojson: GeoJSONFeatureCollection): [number, number, number, number] => {
  if (!geojson.features.length) {
    return [44.0, 25.0, 63.0, 40.0]; // Default Iran bounds
  }
  
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  
  geojson.features.forEach(feature => {
    const [lng, lat] = feature.geometry.coordinates;
    
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  });
  
  // Handle edge case when all points are at the same location or very close
  const lngDiff = maxLng - minLng;
  const latDiff = maxLat - minLat;
  
  if (lngDiff < 0.01 && latDiff < 0.01) {
    // If points are very close together, add some padding
    const padding = 0.1; // Approximately 11km at the equator
    return [
      minLng - padding,
      minLat - padding,
      maxLng + padding,
      maxLat + padding
    ];
  }
  
  return [minLng, minLat, maxLng, maxLat];
};
