import React from 'react';
import { useAppContext } from '../context/AppContext';
import { getProtestCountByTimeFilter } from '../utils/dataFetching';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import HorizontalVideoGrid from '../components/VideoGrid/HorizontalVideoGrid';
import ProtestMap from '../components/Map/ProtestMap';
import ProtestList from '../components/ProtestList/ProtestList';
import TimeFilter from '../components/TimeFilter/TimeFilter';
import ProtestCharts from '../components/Charts/ProtestCharts';

const HomePage: React.FC = () => {
  const { mapData, loading } = useAppContext();
  
  // Calculate both weekly and last 30 days protest counts
  const weeklyProtestCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'last-week');
  const last30DaysCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'last-month');
  
  // Show last 30 days count if weekly count is less than 35, otherwise show weekly
  const shouldShowLast30Days = weeklyProtestCount < 35;
  const displayCount = shouldShowLast30Days ? last30DaysCount : weeklyProtestCount;
  const displayPeriod = shouldShowLast30Days ? 'in the last 30 days' : 'this week';

  return (
    <>
      <Header />
      
      <div className="mt-[152px]">
        <div className="flex flex-col items-center justify-center max-w-[800px] mx-auto gap-3">
          {/* Glass box container for main title */}
          <div className="morphic-main-title-box relative overflow-hidden">
            {/* Floating particles effect - subtle blinking dots only */}
            <div className="absolute inset-0">
              <div className="absolute top-4 left-8 w-1 h-1 bg-cyan-300/60 rounded-full animate-ping"></div>
              <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-blue-300/50 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-6 left-16 w-1 h-1 bg-cyan-400/70 rounded-full animate-ping delay-700"></div>
              <div className="absolute bottom-10 right-8 w-1 h-1 bg-blue-200/60 rounded-full animate-pulse delay-500"></div>
            </div>
            
            {/* Border glow effect */}
            <div className="absolute inset-0 rounded-2xl border border-cyan-300/50 shadow-[0_0_30px_rgba(34,211,238,0.3)]"></div>
            
            {/* Content */}
            <div className="relative px-8 py-6 lg:px-12 lg:py-8">
              <h1 className="text-center font-black leading-[50px] font-sans m-0 drop-shadow-lg">
                <span className="bg-gradient-to-r from-white via-cyan-50 to-white bg-clip-text text-transparent text-[35px] lg:text-[45px] block mb-2">
                  MAPPING PROTESTS
                </span>
                <span className="bg-gradient-to-r from-cyan-50 via-white to-cyan-50 bg-clip-text text-transparent text-[35px] lg:text-[45px] block">
                  IN IRAN
                </span>
              </h1>
              
              <div className="bg-gradient-to-r from-transparent via-white/90 to-transparent w-[120px] h-[3px] rounded-full shadow-lg mx-auto mt-4 mb-4"></div>
              
              <p className="text-center font-bold leading-[30px] font-sans drop-shadow-md">
                <span className="bg-gradient-to-r from-white to-cyan-50 bg-clip-text text-transparent text-[20px] lg:text-[25px]">
                  Mark Dubowitz
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="morphic-container flex flex-col items-center justify-center max-w-[1200px] mx-auto mt-8 p-[29px] gap-[34px]">
          <div className="text-center space-y-4">
            <div className="morphic-stats-card inline-flex items-center space-x-3 px-8 py-4">
              <div className="w-3 h-3 bg-gradient-to-r from-[#00558c] to-[#004778] rounded-full animate-pulse shadow-lg"></div>
              <h1 className="font-sans text-[28px] leading-[32px] font-bold text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200 font-black text-[32px]">
                  {displayCount}
                </span>
                {' '}protest{displayCount !== 1 ? 's' : ''} {displayPeriod}
              </h1>
            </div>
            
          </div>
          
          <p className="w-full max-w-[800px] mx-auto text-center font-sans text-[16px] leading-[24px] text-white/90 px-4">
            The Iranian regime continues to face widespread protests across the country. This interactive map shows the locations and details of recent protests, with video evidence where available.
          </p>
          
          <HorizontalVideoGrid />
          
          <TimeFilter />
          
          {/* Map and List Side by Side */}
          <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6">
            {/* Map Section - 60% width */}
            <div className="w-full lg:w-[60%]">
              <ProtestMap />
            </div>
            
            {/* Protest List Section - 40% width */}
            <div className="w-full lg:w-[40%]">
              <ProtestList />
            </div>
          </div>
        </div>
      </div>
      
      <ProtestCharts />
      
      <Footer />
    </>
  );
};

export default HomePage;
