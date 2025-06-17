import React, { useState, useEffect } from 'react';
import { fetchStatisticsData } from '../../utils/dataFetching';

const Header: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showTitle, setShowTitle] = useState<boolean>(false);
  
  useEffect(() => {
    const loadLastUpdated = async () => {
      try {
        const data = await fetchStatisticsData();
        setLastUpdated(data.lastUpdated || 'Jan 3, 2023');
      } catch (error) {
        console.error('Error loading last updated date:', error);
        setLastUpdated('Jan 3, 2023');
      }
    };
    
    loadLastUpdated();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Show title when scrolled past the main title section (approximately 400px)
      const scrollPosition = window.scrollY;
      setShowTitle(scrollPosition > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 morphic-header border-b border-white/20 h-[75px]">
      <div className="flex justify-between items-center h-full px-4">
        {/* Logo Section */}
        <a 
          href="https://www.fdd.org/category/analysis/visuals/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-[300px] h-full"
        >
          <img 
            src={`${import.meta.env.BASE_URL}images/Visuals_Logo_Temporary_v01.svg`}
            alt="FDD Visuals Logo" 
            className="h-16 w-auto text-white/90 hover:opacity-80 transition-opacity duration-300"
          />
        </a>
        
        {/* Center Title - Shows when scrolled */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
          showTitle 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <h2 className="text-white font-bold text-lg whitespace-nowrap">
            Mapping Protests in Iran
          </h2>
        </div>
        
        {/* Last Updated Section */}
        <div className="flex items-center morphic-header-info rounded-xl px-4 py-2.5 border border-white/20 backdrop-blur-sm bg-white/5">
          <div className="flex items-center space-x-2">
            {/* Animated indicator */}
            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse shadow-sm"></div>
            
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-xs font-medium uppercase tracking-wide">
                Last Updated
              </span>
              <span className="text-cyan-300 text-sm font-bold">
                {lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </header>
  );
};

export default Header;
