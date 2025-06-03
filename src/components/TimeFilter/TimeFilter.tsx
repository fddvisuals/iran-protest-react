import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { TimeFilter as TimeFilterType } from '../../utils/dataFetching';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const TimeFilter: React.FC = () => {
  const { timeFilter, setTimeFilter } = useAppContext();

  const handleFilterChange = (value: string) => {
    setTimeFilter(value as TimeFilterType);
  };

  return (
    <div className="flex justify-center mb-6">
      <Tabs value={timeFilter} onValueChange={handleFilterChange}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger 
            value="last-week" 
            className="text-sm font-medium data-[state=active]:bg-main data-[state=active]:text-white"
          >
            Last Week
          </TabsTrigger>
          <TabsTrigger 
            value="last-month" 
            className="text-sm font-medium data-[state=active]:bg-main data-[state=active]:text-white"
          >
            Last Month
          </TabsTrigger>
          <TabsTrigger 
            value="all-time" 
            className="text-sm font-medium data-[state=active]:bg-main data-[state=active]:text-white"
          >
            All Time
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TimeFilter;
