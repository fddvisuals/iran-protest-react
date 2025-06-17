import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ProtestData } from '../../utils/dataFetching';
import { Eye } from 'lucide-react';

const INITIAL_DISPLAY_COUNT = 30;
const LOAD_MORE_COUNT = 30;

const ProtestList: React.FC<{
  onVideoClick?: (protest: ProtestData) => void;
  onProtestDetailsClick?: (protest: ProtestData) => void;
}> = ({ onVideoClick, onProtestDetailsClick }) => {
  const { viewportFilteredData, loading, setSelectedFeature, highlightedProtest } = useAppContext();
  const listRef = useRef<HTMLDivElement>(null);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  
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
  
  // Handle view details click
  const handleViewDetails = useCallback((protest: ProtestData, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onProtestDetailsClick?.(protest);
  }, [onProtestDetailsClick]);
  
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
        <div className="p-6 border-b border-white/10 bg-[#00558c] rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-[#E9ECEF] to-[#CED4DA] rounded-full shadow-lg"></div>
            <h2 className="text-xl font-bold text-white">RECENT PROTESTS</h2>
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
    <div className="w-full h-[600px] sm:h-[600px] morphic-container">
      <div className="p-3 sm:p-6 border-b border-white/10 bg-[#00558c] rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-[#E9ECEF] to-[#CED4DA] rounded-full shadow-lg"></div>
            <h2 className="text-lg sm:text-xl font-bold text-white">RECENT PROTESTS</h2>
          </div>
          <div className="text-xs sm:text-sm font-medium text-white">
            {displayedProtests.length} of {sortedProtests.length}
          </div>
        </div>
      </div>
      <div ref={listRef} className="p-3 sm:p-6 h-[calc(600px-76px)] sm:h-[calc(600px-88px)] overflow-y-auto morphic-scrollbar">
        {sortedProtests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.25 0-4.291.737-5.943 1.986M20 8.5a9 9 0 11-18 0 9 9 0 0118 0v.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No protests found</h3>
            <p className="text-text-primary/60 mb-4 max-w-md">
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
                  onVideoClick={onVideoClick}
                  onViewDetails={handleViewDetails}
                />
              );
            })}
            
            {/* Show More Button */}
            {displayCount < sortedProtests.length && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  className="bg-gradient-to-r from-[#E7AC51] to-[#D4A044] text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:from-[#D4A044] hover:to-[#C19139] shadow-md"
                >
                  Show More ({Math.min(LOAD_MORE_COUNT, sortedProtests.length - displayCount)} more)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Memoized protest item component for better performance
const ProtestItem = React.memo<{
  protest: ProtestData;
  isHighlighted: boolean;
  onClick: (protest: ProtestData) => void;
  onVideoClick?: (protest: ProtestData) => void;
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

  return (
    <div
      onClick={() => onClick(protest)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`morphic-protest-item w-full p-3 sm:p-4 text-left group relative overflow-hidden transition-all duration-300 cursor-pointer ${
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
          : '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Accent line */}
      <div className={`absolute left-0 top-0 w-1 h-full transition-all duration-300 ${
        isHighlighted ? 'bg-gradient-to-b from-yellow-400 to-yellow-500 opacity-100' : 'bg-gradient-to-b from-[#00558c] to-[#004778] opacity-0 group-hover:opacity-100'
      }`}></div>
      
      {/* Main content container */}
      <div className="w-full">
        {/* Top row: Location, date, and crowd size */}
        <div className="flex items-start justify-between mb-3 gap-2 sm:gap-3">
          {/* Left section: Location */}
          <div className="flex-1 min-w-0">
            <div className={`${isHighlighted ? "text-yellow-100" : "text-text-primary"}`}>
              <h3 className="text-sm sm:text-base font-bold mb-1 truncate">
                {protest.County}
              </h3>
              <p className="text-xs sm:text-sm text-text-primary/70 font-medium truncate">{protest.Province}</p>
            </div>
          </div>
          
          {/* Right section: Date and crowd size - Stack on mobile */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className={`flex items-center text-xs ${isHighlighted ? "text-yellow-200" : "text-text-primary/80"}`}>
              <div className={`p-1 rounded-lg mr-1 ${isHighlighted ? "bg-yellow-400/20" : "bg-white/10"}`}>
                <svg width="8" height="8" className="sm:w-[10px] sm:h-[10px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 3H21C21.2652 3 21.5196 3.10536 21.7071 3.29289C21.8946 3.48043 22 3.73478 22 4V20C22 20.2652 21.8946 20.5196 21.7071 20.7071C21.5196 20.8946 21.2652 21 21 21H3C2.73478 21 2.48043 20.8946 2.29289 20.7071C2.10536 20.5196 2 20.2652 2 20V4C2 3.73478 2.10536 3.48043 2.29289 3.29289C2.48043 3.10536 2.73478 3 3 3H7V1H9V3H15V1H17V3ZM4 9V19H20V9H4ZM6 11H8V13H6V11ZM11 11H13V13H11V11ZM16 11H18V13H16V11Z" fill="currentColor" />
                </svg>
              </div>
              <span className="font-medium text-xs truncate max-w-[80px] sm:max-w-none">{protest.Date}</span>
            </div>
            
            <div className={`flex items-center text-xs ${isHighlighted ? "text-yellow-200" : "text-text-primary/80"}`}>
              <div className={`p-1 rounded-lg mr-1 ${isHighlighted ? "bg-yellow-400/20" : "bg-white/10"}`}>
                <svg width="8" height="8" className="sm:w-[10px] sm:h-[10px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 21.9999C1 19.8782 1.84285 17.8434 3.34315 16.3431C4.84344 14.8428 6.87827 13.9999 9 13.9999C11.1217 13.9999 13.1566 14.8428 14.6569 16.3431C16.1571 17.8434 17 19.8782 17 21.9999H1ZM9 12.9999C5.685 12.9999 3 10.3149 3 6.99994C3 3.68494 5.685 0.999936 9 0.999936C12.315 0.999936 15 3.68494 15 6.99994C15 10.3149 12.315 12.9999 9 12.9999ZM18.246 3.18394C18.7454 4.39409 19.0016 5.69077 19 6.99994C19.0016 8.3091 18.7454 9.60578 18.246 10.8159L16.569 9.59593C16.8552 8.76037 17.0008 7.88314 17 6.99994C17.0011 6.11678 16.8558 5.23956 16.57 4.40394L18.246 3.18394V3.18394ZM21.548 0.783936C22.5062 2.71576 23.0032 4.84353 23 6.99994C23 9.23294 22.477 11.3439 21.548 13.2159L19.903 12.0199C20.6282 10.4459 21.0025 8.733 21 6.99994C21 5.20794 20.607 3.50694 19.903 1.97994L21.548 0.783936V3.18394Z" fill="currentColor" />
                </svg>
              </div>
              <span className="font-medium text-xs truncate max-w-[60px] sm:max-w-none">{protest.Estimated_Size}</span>
            </div>
          </div>
        </div>
        
        {/* Bottom row: Description - now full width */}
        <div className="w-full">
          <p 
            ref={textRef}
            className={`text-xs sm:text-sm leading-relaxed text-left w-full ${
              isExpanded ? '' : 'line-clamp-3'
            } ${isHighlighted ? "text-yellow-100" : "text-text-primary/90"} mb-2 sm:mb-3 break-words`}
          >
            {protest.Description}
          </p>
          
          {/* Bottom row with See More/Less and View Details buttons */}
          <div className="flex items-center justify-between">
            {/* See More/Less button */}
            <div>
              {showSeeMore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                  }}
                  className={`text-xs font-medium transition-colors relative z-50 pointer-events-auto ${
                    isHighlighted 
                      ? "text-yellow-300 hover:text-yellow-100" 
                      : "text-blue-300 hover:text-blue-100"
                  }`}
                  type="button"
                >
                  {isExpanded ? 'See less' : 'See more...'}
                </button>
              )}
            </div>
            
            {/* View Details button */}
            <button
              onClick={(e) => onViewDetails(protest, e)}
              className={`flex items-center space-x-1 text-xs cursor-pointer hover:opacity-80 transition-opacity relative z-50 pointer-events-auto ${
                isHighlighted ? "text-yellow-300" : "text-yellow-600 hover:text-yellow-500"
              }`}
              type="button"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProtestList;
