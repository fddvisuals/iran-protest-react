import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { TimeFilter as TimeFilterType, getProtestCountByTimeFilter } from '../../utils/dataFetching';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const TimeFilter: React.FC = () => {
  const { timeFilter, setTimeFilter, mapData, loading } = useAppContext();

  const handleFilterChange = (value: string) => {
    setTimeFilter(value as TimeFilterType);
  };

  // Get counts for each filter
  const lastWeekCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'last-week');
  const lastMonthCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'last-month');
  const allTimeCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'all-time');

  return (
    <div className="w-full max-w-[1200px] mx-auto mb-4 sm:mb-8 px-2 sm:px-4">
      <Tabs value={timeFilter} onValueChange={handleFilterChange}>
        <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2 sm:gap-4 h-auto">
          <TabsTrigger
            value="last-week"
            className="relative px-2 sm:px-3 py-3 sm:py-6 rounded-[16px] sm:rounded-[20px] text-sm sm:text-base font-semibold transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/20 hover:shadow-lg hover:border-white/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E7AC51] data-[state=active]:to-[#D4A044] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_32px_rgba(0,0,0,0.1),_0_1px_0_1px_rgba(255,255,255,0.2)_inset] data-[state=active]:backdrop-blur-[10px] data-[state=active]:border-white/20 text-text-primary min-h-0 h-[80px] sm:h-[122px] bg-white/15 shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-white/20 backdrop-blur-[10px]"
          >
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <span className="whitespace-nowrap text-sm sm:text-lg font-bold">Last Week</span>
              <span className="text-xs sm:text-sm font-bold px-2 sm:px-4 py-1 sm:py-2 w-[70px] sm:w-[102px] h-6 sm:h-8 flex items-center justify-center bg-gradient-to-r from-[#E3E8F0] to-[#CCD5E0] data-[state=active]:bg-white/30 data-[state=active]:text-black text-black rounded-full">
                {lastWeekCount.toLocaleString()}
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="last-month"
            className="relative px-2 sm:px-3 py-3 sm:py-6 rounded-[16px] sm:rounded-[20px] text-sm sm:text-base font-semibold transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/20 hover:shadow-lg hover:border-white/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E7AC51] data-[state=active]:to-[#D4A044] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_32px_rgba(0,0,0,0.1),_0_1px_0_1px_rgba(255,255,255,0.2)_inset] data-[state=active]:backdrop-blur-[10px] data-[state=active]:border-white/20 text-text-primary min-h-0 h-[80px] sm:h-[122px] bg-white/15 shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-white/20 backdrop-blur-[10px]"
          >
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <span className="whitespace-nowrap text-sm sm:text-lg font-bold">Last Month</span>
              <span className="text-xs sm:text-sm font-bold px-2 sm:px-4 py-1 sm:py-2 w-[70px] sm:w-[102px] h-6 sm:h-8 flex items-center justify-center bg-gradient-to-r from-[#E3E8F0] to-[#CCD5E0] data-[state=active]:bg-white/30 data-[state=active]:text-black text-black rounded-full">
                {lastMonthCount.toLocaleString()}
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="all-time"
            className="relative px-2 sm:px-3 py-3 sm:py-6 rounded-[16px] sm:rounded-[20px] text-sm sm:text-base font-semibold transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/20 hover:shadow-lg hover:border-white/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E7AC51] data-[state=active]:to-[#D4A044] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_32px_rgba(0,0,0,0.1),_0_1px_0_1px_rgba(255,255,255,0.2)_inset] data-[state=active]:backdrop-blur-[10px] data-[state=active]:border-white/20 text-text-primary min-h-0 h-[80px] sm:h-[122px] bg-white/15 shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-white/20 backdrop-blur-[10px]"
          >
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <span className="whitespace-nowrap text-sm sm:text-lg font-bold">Since Sept 2022</span>
              <span className="text-xs sm:text-sm font-bold px-2 sm:px-4 py-1 sm:py-2 w-[70px] sm:w-[102px] h-6 sm:h-8 flex items-center justify-center bg-gradient-to-r from-[#E3E8F0] to-[#CCD5E0] data-[state=active]:bg-white/30 data-[state=active]:text-black text-black rounded-full">
                {allTimeCount.toLocaleString()}
              </span>
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TimeFilter;
