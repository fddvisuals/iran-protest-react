import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { getProtestCountByTimeFilter } from './utils/dataFetching';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import VideoGrid from './components/VideoGrid/VideoGrid';
import ProtestMap from './components/Map/ProtestMap';
import ProtestList from './components/ProtestList/ProtestList';
import TimeFilter from './components/TimeFilter/TimeFilter';

const AppContent: React.FC = () => {
  const { mapData, loading, timeFilter } = useAppContext();
  
  const protestCount = loading ? 0 : getProtestCountByTimeFilter(mapData, timeFilter);
  
  const getTimeRangeText = () => {
    switch (timeFilter) {
      case 'last-week':
        return 'in the last week';
      case 'last-month':
        return 'in the last month';
      case 'all-time':
        return 'in total';
      default:
        return 'in the last week';
    }
  };

  return (
    <>
      <Header />
      
      <div className="mt-[152px]">
        <div className="flex flex-col items-center justify-center max-w-[800px] mx-auto gap-3">
          <h1 className="text-main text-center text-[45px] font-black leading-[50px] font-sans m-0">
            MAPPING PROTESTS IN IRAN
          </h1>
          <div className="bg-main w-[100px] h-[4px]"></div>
          <p className="text-[#6b5b5b] text-center text-[25px] font-bold leading-[30px] font-sans">
            Mark Dubowitz
          </p>
        </div>
        
        <div className="bg-[#f8f8f8] flex flex-col items-center justify-center max-w-[1200px] mx-auto mt-8 p-[29px] gap-[34px]">
          <h1 className="font-sans text-[30px] leading-[35px] text-center">
            There {protestCount === 1 ? 'has' : 'have'} been {protestCount} protest{protestCount !== 1 ? 's' : ''} {getTimeRangeText()}...
          </h1>
          
          <TimeFilter />
          
          {/* Responsive container for map and protest list */}
          <div className="w-full flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <ProtestMap />
            </div>
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <ProtestList />
            </div>
          </div>
          
          <p className="w-full max-w-[800px] mx-auto mt-[22px] font-sans text-[18px] leading-[29px]">
            The Iranian regime continues to face widespread protests across the country. This interactive map shows the locations and details of recent protests, with video evidence where available.
          </p>
          
          <VideoGrid />
        </div>
      </div>
      
      <Footer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
