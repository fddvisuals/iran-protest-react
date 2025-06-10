import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, Users, Eye } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ProtestData } from '../../utils/dataFetching';
import Map, { Source, Layer, NavigationControl, MapRef } from 'react-map-gl';

const INITIAL_DISPLAY_COUNT = 30;
const LOAD_MORE_COUNT = 30;
const MAPBOX_TOKEN = "pk.eyJ1IjoiZmRkdmlzdWFscyIsImEiOiJjbGZyODY1dncwMWNlM3pvdTNxNjF4dG1rIn0.wX4YYvWhm5W-5t8y5pp95w";

const ProtestList: React.FC = () => {
  const { viewportFilteredData, loading, setSelectedFeature, highlightedProtest } = useAppContext();
  const listRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [selectedProtest, setSelectedProtest] = useState<ProtestData | null>(null);
  const [showProtestModal, setShowProtestModal] = useState(false);
  
  // Memoize the sorted protests list (no filters, just sort by date)
  const sortedProtests = useMemo(() => {
    return [...viewportFilteredData]
      .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
  }, [viewportFilteredData]);

  // Get the protests to display based on current display count
  const displayedProtests = useMemo(() => {
    return sortedProtests.slice(0, displayCount);
  }, [sortedProtests, displayCount]);

  // Reset display count when viewport data changes
  useEffect(() => {
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  }, [viewportFilteredData]);

  // Memoize the click handler
  const handleProtestClick = useCallback((protest: ProtestData) => {
    setSelectedFeature(protest);
  }, [setSelectedFeature]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + LOAD_MORE_COUNT, sortedProtests.length));
  }, [sortedProtests.length]);
  
  // Handle protest details modal
  const handleViewDetails = useCallback((protest: ProtestData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProtest(protest);
    setShowProtestModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowProtestModal(false);
    setSelectedProtest(null);
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLocation = (protest: ProtestData) => {
    const parts = [protest.City_Village, protest.County, protest.Province].filter(Boolean);
    return parts.join(', ');
  };

  // Map layer styles for protest location
  const pointLayer = {
    id: 'protest-point',
    type: 'circle' as const,
    paint: {
      'circle-color': '#ef4444',
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.8
    }
  };

  const getMapData = (protest: ProtestData) => {
    if (!protest.Longitude || !protest.Latitude) return null;
    
    return {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [parseFloat(protest.Longitude), parseFloat(protest.Latitude)]
        },
        properties: {}
      }]
    };
  };
  
  // Scroll to highlighted protest
  useEffect(() => {
    if (highlightedProtest && listRef.current) {
      const protestIndex = displayedProtests.findIndex(protest => 
        protest.Longitude === highlightedProtest.Longitude && 
        protest.Latitude === highlightedProtest.Latitude &&
        protest.Date === highlightedProtest.Date
      );
      
      if (protestIndex !== -1) {
        const protestElement = listRef.current?.children[protestIndex] as HTMLElement;
        if (protestElement) {
          protestElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (highlightedProtest) {
        // If highlighted protest is not in displayed list, show more until we find it
        const fullIndex = sortedProtests.findIndex(protest => 
          protest.Longitude === highlightedProtest.Longitude && 
          protest.Latitude === highlightedProtest.Latitude &&
          protest.Date === highlightedProtest.Date
        );
        
        if (fullIndex !== -1 && fullIndex >= displayCount) {
          setDisplayCount(fullIndex + 1);
        }
      }
    }
  }, [highlightedProtest, displayedProtests, sortedProtests, displayCount]);
  
  if (loading) {
    return (
      <div className="w-full h-[600px] morphic-container">
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-[#00558c] to-[#004778] rounded-full shadow-lg"></div>
            <h2 className="text-xl font-bold text-white">Recent Protests</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="morphic-loading h-20 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-[600px] morphic-container">
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-[#00558c] to-[#004778] rounded-full shadow-lg"></div>
            <h2 className="text-xl font-bold text-white">Recent Protests</h2>
          </div>
          <div className="morphic-button-primary px-3 py-1 text-sm font-medium">
            {displayedProtests.length} of {sortedProtests.length}
          </div>
        </div>
      </div>
      <div ref={listRef} className="p-6 h-[calc(600px-88px)] overflow-y-auto morphic-scrollbar">
        {sortedProtests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.25 0-4.291.737-5.943 1.986M20 8.5a9 9 0 11-18 0 9 9 0 0118 0v.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No protests found</h3>
            <p className="text-white/60 mb-4 max-w-md">
              No protest data is currently available for this area.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedProtests.map((protest, index) => {
              const isHighlighted = !!(highlightedProtest && 
                protest.Longitude === highlightedProtest.Longitude && 
                protest.Latitude === highlightedProtest.Latitude &&
                protest.Date === highlightedProtest.Date);
              
              return (
                <ProtestItem 
                  key={`${protest.Longitude}-${protest.Latitude}-${protest.Date}-${index}`}
                  protest={protest}
                  isHighlighted={isHighlighted}
                  onClick={handleProtestClick}
                  onViewDetails={handleViewDetails}
                />
              );
            })}
            
            {/* Show More Button */}
            {displayCount < sortedProtests.length && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Show More ({Math.min(LOAD_MORE_COUNT, sortedProtests.length - displayCount)} more)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Protest Details Modal - Using React Portal for full-screen overlay */}
      {showProtestModal && selectedProtest && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
        >
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h3 className="text-2xl font-bold text-white">Protest Details</h3>
              <button
                onClick={closeModal}
                className="text-white/70 hover:text-white text-2xl transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Map (if coordinates available) */}
              {selectedProtest.Longitude && selectedProtest.Latitude && (
                <div className="lg:w-1/2 p-6 flex flex-col items-center">
                  <div className="w-full h-96 bg-black rounded-lg overflow-hidden">
                    <Map
                      ref={mapRef}
                      mapboxAccessToken={MAPBOX_TOKEN}
                      mapStyle="mapbox://styles/mapbox/dark-v11"
                      longitude={parseFloat(selectedProtest.Longitude)}
                      latitude={parseFloat(selectedProtest.Latitude)}
                      zoom={12}
                      interactive={true}
                    >
                      {getMapData(selectedProtest) && (
                        <Source
                          id="protest-location"
                          type="geojson"
                          data={getMapData(selectedProtest)!}
                        >
                          <Layer {...pointLayer as any} />
                        </Source>
                      )}
                      <NavigationControl position="bottom-right" showCompass={false} />
                    </Map>
                  </div>
                </div>
              )}
              
              {/* Right Side - Information */}
              <div className={`${selectedProtest.Longitude && selectedProtest.Latitude ? 'lg:w-1/2' : 'w-full'} p-6 overflow-y-auto max-h-[70vh]`}>
                <div className="space-y-6">
                  {/* Location Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-cyan-400" />
                      Location
                    </h4>
                    <p className="text-white/80 text-lg">{getLocation(selectedProtest)}</p>
                  </div>
                  
                  {/* Date */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
                      Date
                    </h4>
                    <p className="text-white/80 text-lg">{formatDate(selectedProtest.Date)}</p>
                  </div>
                  
                  {/* Crowd Size */}
                  {selectedProtest.Estimated_Size && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-cyan-400" />
                        Estimated Crowd Size
                      </h4>
                      <p className="text-white/80 text-lg">{selectedProtest.Estimated_Size} people</p>
                    </div>
                  )}
                  
                  {/* Description */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Description</h4>
                    <p className="text-white/80 leading-relaxed">{selectedProtest.Description}</p>
                  </div>
                  
                  {/* Casualties */}
                  {(selectedProtest.Injured || selectedProtest.Arrested || selectedProtest.Killed) && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Casualties</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedProtest.Injured && (
                          <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 rounded-lg text-center">
                            <div className="text-xs text-yellow-300 font-medium">Injured</div>
                            <div className="text-lg font-bold text-yellow-100">{selectedProtest.Injured}</div>
                          </div>
                        )}
                        {selectedProtest.Arrested && (
                          <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg text-center">
                            <div className="text-xs text-blue-300 font-medium">Arrested</div>
                            <div className="text-lg font-bold text-blue-100">{selectedProtest.Arrested}</div>
                          </div>
                        )}
                        {selectedProtest.Killed && (
                          <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg text-center">
                            <div className="text-xs text-red-300 font-medium">Killed</div>
                            <div className="text-lg font-bold text-red-100">{selectedProtest.Killed}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Source Link */}
                  {selectedProtest.Link && (
                    <div>
                      <a
                        href={selectedProtest.Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40"
                      >
                        <span>View Original Source</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 6V8H5V19H16V14H18V20C18 20.2652 17.8946 20.5196 17.7071 20.7071C17.5196 20.8946 17.2652 21 17 21H4C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V7C3 6.73478 3.10536 6.48043 3.29289 6.29289C3.48043 6.10536 3.73478 6 4 6H10ZM21 3V12L17.206 8.207L11.207 14.207L9.793 12.793L15.792 6.793L12 3H21Z" fill="currentColor" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Memoized protest item component for better performance
const ProtestItem = React.memo<{
  protest: ProtestData;
  isHighlighted: boolean;
  onClick: (protest: ProtestData) => void;
  onViewDetails: (protest: ProtestData, e: React.MouseEvent) => void;
}>(({ protest, isHighlighted, onClick, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showSeeMore, setShowSeeMore] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      const isOverflowing = element.scrollHeight > element.clientHeight;
      setShowSeeMore(isOverflowing);
    }
  }, [protest.Description]);

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      onClick={(e) => {
        // Only trigger if clicking the main area, not buttons
        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('button') === null) {
          onClick(protest);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`morphic-protest-item w-full p-4 text-left group relative overflow-hidden transition-all duration-300 cursor-pointer ${
        isHighlighted ? 'highlighted' : ''
      }`}
      style={{
        background: isHighlighted 
          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.15))' 
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(248, 250, 252, 0.05))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: isHighlighted 
          ? '1px solid rgba(255, 215, 0, 0.4)' 
          : '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        boxShadow: isHovered && !isHighlighted
          ? '0 8px 24px rgba(0, 85, 140, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          : isHighlighted
          ? '0 8px 24px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
          : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      {/* Accent line */}
      <div className={`absolute left-0 top-0 w-1 h-full transition-all duration-300 ${
        isHighlighted ? 'bg-gradient-to-b from-yellow-400 to-yellow-500 opacity-100' : 'bg-gradient-to-b from-[#00558c] to-[#004778] opacity-0 group-hover:opacity-100'
      }`}></div>
      
      {/* Main content container */}
      <div className="w-full">
        {/* Top row: Location, date, and crowd size */}
        <div className="flex items-center justify-between mb-3">
          {/* Left section: Location */}
          <div className="flex-shrink-0">
            <div className={`${isHighlighted ? "text-yellow-100" : "text-white"}`}>
              <h3 className="text-base font-bold mb-1">
                {protest.County}
              </h3>
              <p className="text-sm text-white/70 font-medium">{protest.Province}</p>
            </div>
          </div>
          
          {/* Right section: Date, crowd size, and View Details button */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className={`flex items-center text-sm ${isHighlighted ? "text-yellow-200" : "text-white/80"}`}>
              <div className={`p-1 rounded-lg mr-2 ${isHighlighted ? "bg-yellow-400/20" : "bg-white/10"}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 3H21C21.2652 3 21.5196 3.10536 21.7071 3.29289C21.8946 3.48043 22 3.73478 22 4V20C22 20.2652 21.8946 20.5196 21.7071 20.7071C21.5196 20.8946 21.2652 21 21 21H3C2.73478 21 2.48043 20.8946 2.29289 20.7071C2.10536 20.5196 2 20.2652 2 20V4C2 3.73478 2.10536 3.48043 2.29289 3.29289C2.48043 3.10536 2.73478 3 3 3H7V1H9V3H15V1H17V3ZM4 9V19H20V9H4ZM6 11H8V13H6V11ZM11 11H13V13H11V11ZM16 11H18V13H16V11Z" fill="currentColor" />
                </svg>
              </div>
              <span className="font-medium whitespace-nowrap">{protest.Date}</span>
            </div>
            
            <div className={`flex items-center text-sm ${isHighlighted ? "text-yellow-200" : "text-white/80"}`}>
              <div className={`p-1 rounded-lg mr-2 ${isHighlighted ? "bg-yellow-400/20" : "bg-white/10"}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 21.9999C1 19.8782 1.84285 17.8434 3.34315 16.3431C4.84344 14.8428 6.87827 13.9999 9 13.9999C11.1217 13.9999 13.1566 14.8428 14.6569 16.3431C16.1571 17.8434 17 19.8782 17 21.9999H1ZM9 12.9999C5.685 12.9999 3 10.3149 3 6.99994C3 3.68494 5.685 0.999936 9 0.999936C12.315 0.999936 15 3.68494 15 6.99994C15 10.3149 12.315 12.9999 9 12.9999ZM18.246 3.18394C18.7454 4.39409 19.0016 5.69077 19 6.99994C19.0016 8.3091 18.7454 9.60578 18.246 10.8159L16.569 9.59593C16.8552 8.76037 17.0008 7.88314 17 6.99994C17.0011 6.11678 16.8558 5.23956 16.57 4.40394L18.246 3.18394V3.18394ZM21.548 0.783936C22.5062 2.71576 23.0032 4.84353 23 6.99994C23 9.23294 22.477 11.3439 21.548 13.2159L19.903 12.0199C20.6282 10.4459 21.0025 8.733 21 6.99994C21 5.20794 20.607 3.50694 19.903 1.97994L21.548 0.783936V0.783936Z" fill="currentColor" />
                </svg>
              </div>
              <span className="font-medium whitespace-nowrap">{protest.Estimated_Size}</span>
            </div>

            {/* View Full Details Icon Button */}
            <button
              onClick={(e) => onViewDetails(protest, e)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md group/details relative z-10"
              title="View Full Details"
              style={{ pointerEvents: 'auto' }}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Bottom row: Description - now full width */}
        <div className="w-full">
          <p 
            ref={textRef}
            className={`text-sm leading-relaxed text-left w-full ${
              isExpanded ? '' : 'line-clamp-3'
            } ${isHighlighted ? "text-yellow-100" : "text-white/90"}`}
          >
            {protest.Description}
          </p>
          {showSeeMore && (
            <button
              onClick={handleExpandToggle}
              className={`text-xs font-medium transition-colors mt-1 block z-10 relative ${
                isHighlighted 
                  ? "text-yellow-300 hover:text-yellow-100" 
                  : "text-blue-300 hover:text-blue-100"
              }`}
              style={{ pointerEvents: 'auto' }}
            >
              {isExpanded ? 'See less' : 'See more...'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProtestList;
