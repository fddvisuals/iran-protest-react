import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TimeFilter as TimeFilterType, getProtestCountByTimeFilter } from '../../utils/dataFetching';
import { Calendar } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

const TimeFilter: React.FC = () => {
  const { timeFilter, setTimeFilter, mapData, loading, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate } = useAppContext();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleFilterChange = (value: string) => {
    setTimeFilter(value as TimeFilterType);
    if (value !== 'custom-date') {
      setIsDatePickerOpen(false);
    }
  };

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setTimeFilter('custom-date');
  };

  // Get counts for each filter
  const lastWeekCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'last-week');
  const lastMonthCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'last-month');
  const allTimeCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'all-time');
  const customDateCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'custom-date', customStartDate, customEndDate);

  return (
    <div className="w-full max-w-[1200px] mx-auto mb-4 sm:mb-8 px-2 sm:px-4">
      <div className="grid w-full grid-cols-2 md:grid-cols-4 bg-transparent gap-2 sm:gap-4 h-auto">
        <button
          onClick={() => handleFilterChange('last-week')}
          className={`relative px-2 sm:px-3 py-3 sm:py-6 rounded-[16px] sm:rounded-[20px] text-sm sm:text-base font-semibold transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/20 hover:shadow-lg hover:border-white/40 min-h-0 h-[80px] sm:h-[122px] bg-white/15 shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-white/20 backdrop-blur-[10px] ${
            timeFilter === 'last-week'
              ? 'bg-gradient-to-r from-[#E7AC51] to-[#D4A044] text-white shadow-[0_8px_32px_rgba(0,0,0,0.1),_0_1px_0_1px_rgba(255,255,255,0.2)_inset] backdrop-blur-[10px] border-white/20'
              : 'text-text-primary'
          }`}
        >
          <div className="flex flex-col items-center space-y-1 sm:space-y-2">
            <span className="whitespace-nowrap text-sm sm:text-lg font-bold">Last Week</span>
            <span className={`text-xs sm:text-sm font-bold px-2 sm:px-4 py-1 sm:py-2 w-[70px] sm:w-[102px] h-6 sm:h-8 flex items-center justify-center rounded-full ${
              timeFilter === 'last-week'
                ? 'bg-white/30 text-black'
                : 'bg-gradient-to-r from-[#E3E8F0] to-[#CCD5E0] text-black'
            }`}>
              {lastWeekCount.toLocaleString()}
            </span>
          </div>
        </button>
        <button
          onClick={() => handleFilterChange('last-month')}
          className={`relative px-2 sm:px-3 py-3 sm:py-6 rounded-[16px] sm:rounded-[20px] text-sm sm:text-base font-semibold transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/20 hover:shadow-lg hover:border-white/40 min-h-0 h-[80px] sm:h-[122px] bg-white/15 shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-white/20 backdrop-blur-[10px] ${
            timeFilter === 'last-month'
              ? 'bg-gradient-to-r from-[#E7AC51] to-[#D4A044] text-white shadow-[0_8px_32px_rgba(0,0,0,0.1),_0_1px_0_1px_rgba(255,255,255,0.2)_inset] backdrop-blur-[10px] border-white/20'
              : 'text-text-primary'
          }`}
        >
          <div className="flex flex-col items-center space-y-1 sm:space-y-2">
            <span className="whitespace-nowrap text-sm sm:text-lg font-bold">Last Month</span>
            <span className={`text-xs sm:text-sm font-bold px-2 sm:px-4 py-1 sm:py-2 w-[70px] sm:w-[102px] h-6 sm:h-8 flex items-center justify-center rounded-full ${
              timeFilter === 'last-month'
                ? 'bg-white/30 text-black'
                : 'bg-gradient-to-r from-[#E3E8F0] to-[#CCD5E0] text-black'
            }`}>
              {lastMonthCount.toLocaleString()}
            </span>
          </div>
        </button>
        <button
          onClick={() => handleFilterChange('all-time')}
          className={`relative px-2 sm:px-3 py-3 sm:py-6 rounded-[16px] sm:rounded-[20px] text-sm sm:text-base font-semibold transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/20 hover:shadow-lg hover:border-white/40 min-h-0 h-[80px] sm:h-[122px] bg-white/15 shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-white/20 backdrop-blur-[10px] ${
            timeFilter === 'all-time'
              ? 'bg-gradient-to-r from-[#E7AC51] to-[#D4A044] text-white shadow-[0_8px_32px_rgba(0,0,0,0.1),_0_1px_0_1px_rgba(255,255,255,0.2)_inset] backdrop-blur-[10px] border-white/20'
              : 'text-text-primary'
          }`}
        >
          <div className="flex flex-col items-center space-y-1 sm:space-y-2">
            <span className="whitespace-nowrap text-sm sm:text-lg font-bold">Since Sept 2022</span>
            <span className={`text-xs sm:text-sm font-bold px-2 sm:px-4 py-1 sm:py-2 w-[70px] sm:w-[102px] h-6 sm:h-8 flex items-center justify-center rounded-full ${
              timeFilter === 'all-time'
                ? 'bg-white/30 text-black'
                : 'bg-gradient-to-r from-[#E3E8F0] to-[#CCD5E0] text-black'
            }`}>
              {allTimeCount.toLocaleString()}
            </span>
          </div>
        </button>
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={() => {
                setTimeFilter('custom-date');
                setIsDatePickerOpen(true);
              }}
              className={`relative px-2 sm:px-3 py-3 sm:py-6 rounded-[16px] sm:rounded-[20px] text-sm sm:text-base font-semibold transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/20 hover:shadow-lg hover:border-white/40 min-h-0 h-[80px] sm:h-[122px] bg-white/15 shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-white/20 backdrop-blur-[10px] ${
                timeFilter === 'custom-date'
                  ? 'bg-gradient-to-r from-[#E7AC51] to-[#D4A044] text-white shadow-[0_8px_32px_rgba(0,0,0,0.1),_0_1px_0_1px_rgba(255,255,255,0.2)_inset] backdrop-blur-[10px] border-white/20'
                  : 'text-text-primary'
              }`}
            >
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap text-sm sm:text-lg font-bold">Custom</span>
                </div>
                <span className={`text-xs sm:text-sm font-bold px-2 sm:px-4 py-1 sm:py-2 w-[70px] sm:w-[102px] h-6 sm:h-8 flex items-center justify-center rounded-full ${
                  timeFilter === 'custom-date'
                    ? 'bg-white/30 text-black'
                    : 'bg-gradient-to-r from-[#E3E8F0] to-[#CCD5E0] text-black'
                }`}>
                  {customDateCount.toLocaleString()}
                </span>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl" 
            align="center"
            sideOffset={8}
          >
            <DateRangePicker 
              startDate={customStartDate} 
              endDate={customEndDate}
              onRangeSelect={handleDateRangeSelect}
              onClose={() => setIsDatePickerOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

// Date range picker component with slider and manual inputs
interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onRangeSelect: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onRangeSelect, onClose }) => {
  // Define min and max dates for the slider
  const minDate = new Date('2022-09-01'); // Earliest protest date
  const maxDate = new Date(); // Today
  
  const [localStartDate, setLocalStartDate] = useState(startDate || new Date('2025-12-28'));
  const [localEndDate, setLocalEndDate] = useState(endDate || maxDate);
  
  // Convert dates to numeric values for slider (days since min date)
  const dateToValue = (date: Date): number => {
    return Math.floor((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  const valueToDate = (value: number): Date => {
    return new Date(minDate.getTime() + value * (1000 * 60 * 60 * 24));
  };
  
  const [sliderStart, setSliderStart] = useState(dateToValue(localStartDate));
  const [sliderEnd, setSliderEnd] = useState(dateToValue(localEndDate));
  
  const maxValue = dateToValue(maxDate);
  
  const handleSliderStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value <= sliderEnd) {
      setSliderStart(value);
      setLocalStartDate(valueToDate(value));
    }
  };
  
  const handleSliderEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= sliderStart) {
      setSliderEnd(value);
      setLocalEndDate(valueToDate(value));
    }
  };
  
  const handleStartDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (newDate >= minDate && newDate <= localEndDate) {
      setLocalStartDate(newDate);
      setSliderStart(dateToValue(newDate));
    }
  };
  
  const handleEndDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (newDate >= localStartDate && newDate <= maxDate) {
      setLocalEndDate(newDate);
      setSliderEnd(dateToValue(newDate));
    }
  };
  
  const handleApply = () => {
    onRangeSelect(localStartDate, localEndDate);
    onClose();
  };
  
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const getSliderPercentage = (value: number): number => {
    return ((value - 0) / (maxValue - 0)) * 100;
  };

  return (
    <div className="p-6 w-[420px]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date Range</h3>
        
        {/* Date inputs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Start Date</label>
            <input
              type="date"
              value={formatDateForInput(localStartDate)}
              onChange={handleStartDateInput}
              min={formatDateForInput(minDate)}
              max={formatDateForInput(localEndDate)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E7AC51] focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">{formatDisplayDate(localStartDate)}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">End Date</label>
            <input
              type="date"
              value={formatDateForInput(localEndDate)}
              onChange={handleEndDateInput}
              min={formatDateForInput(localStartDate)}
              max={formatDateForInput(maxDate)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E7AC51] focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">{formatDisplayDate(localEndDate)}</div>
          </div>
        </div>
        
        {/* Range slider */}
        <div className="relative pt-2 pb-8">
          <div className="relative h-2 bg-gray-200 rounded-full">
            {/* Active range */}
            <div 
              className="absolute h-2 bg-gradient-to-r from-[#E7AC51] to-[#D4A044] rounded-full"
              style={{
                left: `${getSliderPercentage(sliderStart)}%`,
                right: `${100 - getSliderPercentage(sliderEnd)}%`
              }}
            />
          </div>
          
          {/* Start slider */}
          <input
            type="range"
            min="0"
            max={maxValue}
            value={sliderStart}
            onChange={handleSliderStartChange}
            className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E7AC51] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:mt-[-6px] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#E7AC51] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
            style={{ zIndex: sliderStart > maxValue * 0.5 ? 5 : 3 }}
          />
          
          {/* End slider */}
          <input
            type="range"
            min="0"
            max={maxValue}
            value={sliderEnd}
            onChange={handleSliderEndChange}
            className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D4A044] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:mt-[-6px] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#D4A044] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
            style={{ zIndex: sliderEnd > maxValue * 0.5 ? 3 : 5 }}
          />
        </div>
        
        {/* Range info */}
        <div className="text-xs text-gray-600 text-center mb-6">
          {Math.ceil((localEndDate.getTime() - localStartDate.getTime()) / (1000 * 60 * 60 * 24))} days selected
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#E7AC51] to-[#D4A044] rounded-lg hover:shadow-lg transition-all"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default TimeFilter;
