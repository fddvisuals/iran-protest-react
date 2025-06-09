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
    <div className="flex justify-center mb-8 px-4">
      <div className="morphic-container p-2 w-full max-w-[700px]">
        <Tabs value={timeFilter} onValueChange={handleFilterChange}>
          <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2 h-auto">
            <TabsTrigger 
              value="last-week" 
              className="relative px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out hover:bg-white/10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00558c] data-[state=active]:to-[#004778] data-[state=active]:text-white data-[state=active]:shadow-lg text-white/80 data-[state=active]:border-0 min-h-0 h-auto"
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="whitespace-nowrap">Last Week</span>
                <span className="text-xs bg-white/20 data-[state=active]:bg-white/30 px-2 py-0.5 rounded-full font-bold">
                  {lastWeekCount}
                </span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="last-month" 
              className="relative px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out hover:bg-white/10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00558c] data-[state=active]:to-[#004778] data-[state=active]:text-white data-[state=active]:shadow-lg text-white/80 data-[state=active]:border-0 min-h-0 h-auto"
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="whitespace-nowrap">Last Month</span>
                <span className="text-xs bg-white/20 data-[state=active]:bg-white/30 px-2 py-0.5 rounded-full font-bold">
                  {lastMonthCount}
                </span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="all-time" 
              className="relative px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out hover:bg-white/10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#004778] data-[state=active]:to-[#003961] data-[state=active]:text-white data-[state=active]:shadow-lg text-white/80 data-[state=active]:border-0 min-h-0 h-auto"
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="whitespace-nowrap">All Time</span>
                <span className="text-xs bg-white/20 data-[state=active]:bg-white/30 px-2 py-0.5 rounded-full font-bold">
                  {allTimeCount}
                </span>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default TimeFilter;
