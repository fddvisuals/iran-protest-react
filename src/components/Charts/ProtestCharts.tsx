import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ProtestData, fetchStatisticsData, StatisticsData } from '../../utils/dataFetching';
import { Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartData {
  date: string;
  count: number;
  formattedDate?: string;
}

interface ProvinceData {
  name: string;
  count: number;
  percentage: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{`Date: ${label}`}</p>
        <p className="text-[#00558c]">
          {`Protests: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

// Custom label component for donut chart
const CustomLabel = ({ cx, cy, midAngle, outerRadius, name, percentage }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30; // Position labels outside the donut
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#374151" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontFamily="urw-din, system-ui, sans-serif"
      fontSize="12"
      fontWeight="bold"
      style={{
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
        textRendering: 'optimizeLegibility',
        letterSpacing: '-0.02em'
      }}
    >
      {`${name}: ${percentage}%`}
    </text>
  );
};

// Custom tooltip for province chart
const ProvinceTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
        <p className="text-[#00558c]">{`Protests: ${payload[0].value}`}</p>
        <p className="text-gray-600">{`${payload[0].payload.percentage}% of total`}</p>
      </div>
    );
  }
  return null;
};

// Color palette for charts - Blue shades based on #00558c from dark to light
const COLORS = [
  '#00558c', // Original dark blue
  '#1a6ba3', // Slightly lighter
  '#3381bb', // Medium-light
  '#4d97d2', // Lighter
  '#66adea', // Much lighter
  '#80c3ff', // Very light
  '#99d9ff', // Extra light
  '#b3efff'  // Lightest
];

const ProtestCharts: React.FC = () => {
  const { mapData, loading } = useAppContext();
  const [dailyData, setDailyData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [provinceData, setProvinceData] = useState<ProvinceData[]>([]);
  const [dailyTimeRange, setDailyTimeRange] = useState<'last30' | 'lastMonth' | 'allTime'>('last30');
  const [monthlyTimeRange, setMonthlyTimeRange] = useState<'last12' | 'lastYear' | 'allTime'>('last12');
  const [statistics, setStatistics] = useState<StatisticsData>({ 
    minorsKilled: 81, 
    totalKilled: 648, 
    totalArrested: 25830, 
    lastUpdated: '' 
  });
  
  // Refs for chart containers
  const dailyChartRef = useRef<HTMLDivElement>(null);
  const monthlyChartRef = useRef<HTMLDivElement>(null);

  // Fetch statistics data
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const data = await fetchStatisticsData();
        setStatistics(data);
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    };
    
    loadStatistics();
  }, []);

  // Download SVG function
  const downloadSVG = (chartRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!chartRef.current) return;
    
    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) return;
    
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Set proper dimensions and styling
    clonedSvg.setAttribute('width', '800');
    clonedSvg.setAttribute('height', '600');
    clonedSvg.style.backgroundColor = 'white';
    
    // Create a blob and download
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  // Process data for charts
  useEffect(() => {
    if (!mapData || mapData.length === 0) return;

    // Process daily data
    const dailyCounts: { [key: string]: number } = {};
    const monthlyCounts: { [key: string]: number } = {};
    const provinceCounts: { [key: string]: number } = {};

    mapData.forEach((protest: ProtestData) => {
      if (!protest.Date || protest.Date.trim() === '') return;
      
      try {
        const date = new Date(protest.Date);
        if (isNaN(date.getTime())) return;

        // Daily counts
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;

        // Monthly counts
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyCounts[monthStr] = (monthlyCounts[monthStr] || 0) + 1;

        // Province counts
        if (protest.Province && protest.Province.trim() !== '') {
          provinceCounts[protest.Province] = (provinceCounts[protest.Province] || 0) + 1;
        }
      } catch (error) {
        console.warn('Invalid date format:', protest.Date);
      }
    });

    // Convert to arrays and sort
    const allDailyData = Object.entries(dailyCounts)
      .map(([date, count]) => ({ 
        date, 
        count,
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const allMonthlyData = Object.entries(monthlyCounts)
      .map(([month, count]) => ({ 
        date: month,
        count,
        formattedDate: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Filter daily data based on selected time range
    let dailyArray: ChartData[] = [];
    const today = new Date();
    switch (dailyTimeRange) {
      case 'last30':
        dailyArray = allDailyData.slice(-30);
        break;
      case 'lastMonth':
        const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        dailyArray = allDailyData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= lastYear && itemDate <= today;
        });
        break;
      case 'allTime':
        dailyArray = allDailyData;
        break;
      default:
        dailyArray = allDailyData.slice(-30);
    }

    // Filter monthly data based on selected time range
    let monthlyArray: ChartData[] = [];
    switch (monthlyTimeRange) {
      case 'last12':
        // Generate last 12 months with correct labels
        const last12Months = Array.from({ length: 12 }, (_, i) => {
          const monthDate = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
          const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
          return {
            date: monthKey,
            count: monthlyCounts[monthKey] || 0,
            formattedDate: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          };
        });
        monthlyArray = last12Months;
        break;
      case 'lastYear':
        // Generate all 12 months of the previous calendar year
        const lastYear = today.getFullYear() - 1;
        const lastYearMonths = Array.from({ length: 12 }, (_, i) => {
          const monthDate = new Date(lastYear, i, 1);
          const monthKey = `${lastYear}-${String(i + 1).padStart(2, '0')}`;
          return {
            date: monthKey,
            count: monthlyCounts[monthKey] || 0,
            formattedDate: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          };
        });
        monthlyArray = lastYearMonths;
        break;
      case 'allTime':
      default:
        // All available months
        monthlyArray = allMonthlyData;
        break;
    }

    // Convert province data
    const totalProvinceCount = Object.values(provinceCounts).reduce((sum, count) => sum + count, 0);
    const provinceArray = Object.entries(provinceCounts)
      .map(([name, count]) => ({ 
        name, 
        count,
        percentage: Math.round((count / totalProvinceCount) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 provinces

    setDailyData(dailyArray);
    setMonthlyData(monthlyArray);
    setProvinceData(provinceArray);
  }, [mapData, dailyTimeRange, monthlyTimeRange]);

  if (loading || dailyData.length === 0) {
    return (
      <div className="w-full max-w-[1200px] mx-auto mt-16 p-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto mt-16 px-4">
      <div className="morphic-container">
        <div className="p-6 border-b border-white/10 bg-[#00558c] rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-[#E9ECEF] to-[#CED4DA] rounded-full shadow-lg"></div>
            <h2 className="text-xl font-bold text-white">PROTEST ANALYTICS</h2>
          </div>
          <div className="invisible px-6 py-3 rounded-xl text-sm font-medium">
            See All Videos
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Statistics Overview */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 justify-items-center max-w-4xl mx-auto">
            {/* Minors Killed */}
            <div className="flex flex-col items-center space-y-2 px-4 py-4 border border-[#CDCDCD] shadow-lg w-full"
                 style={{
                   borderRadius: '12px',
                   background: 'linear-gradient(157deg, rgba(183, 183, 183, 0.40) 0%, rgba(226, 232, 240, 0.40) 25%, rgba(203, 213, 225, 0.40) 50%, rgba(148, 163, 184, 0.40) 75%, rgba(100, 116, 139, 0.40) 100%)'
                 }}>
              <h4 className="font-sans text-[16px] font-bold text-text-primary text-center">
                Minors Killed
              </h4>
              <p className="text-gray-600 font-black text-[32px] leading-none">
                {statistics.minorsKilled.toLocaleString()}
              </p>
            </div>

            {/* Total Killed */}
            <div className="flex flex-col items-center space-y-2 px-4 py-4 border border-[#CDCDCD] shadow-lg w-full"
                 style={{
                   borderRadius: '12px',
                   background: 'linear-gradient(157deg, rgba(183, 183, 183, 0.40) 0%, rgba(226, 232, 240, 0.40) 25%, rgba(203, 213, 225, 0.40) 50%, rgba(148, 163, 184, 0.40) 75%, rgba(100, 116, 139, 0.40) 100%)'
                 }}>
              <h4 className="font-sans text-[16px] font-bold text-text-primary text-center">
                Killed
              </h4>
              <p className="text-gray-600 font-black text-[32px] leading-none">
                {statistics.totalKilled.toLocaleString()}
              </p>
            </div>

            {/* Total Arrested */}
            <div className="flex flex-col items-center space-y-2 px-4 py-4 border border-[#CDCDCD] shadow-lg w-full"
                 style={{
                   borderRadius: '12px',
                   background: 'linear-gradient(157deg, rgba(183, 183, 183, 0.40) 0%, rgba(226, 232, 240, 0.40) 25%, rgba(203, 213, 225, 0.40) 50%, rgba(148, 163, 184, 0.40) 75%, rgba(100, 116, 139, 0.40) 100%)'
                 }}>
              <h4 className="font-sans text-[16px] font-bold text-text-primary text-center">
                Arrested
              </h4>
              <p className="text-gray-600 font-black text-[32px] leading-none">
                {statistics.totalArrested.toLocaleString()}
              </p>
            </div>

            {/* Empty fourth column for spacing */}
            <div></div>
          </div>
        </div>

        {/* Daily Protests Chart - Line Chart */}
        <div className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-heading font-bold text-text-primary">
            Daily Protest Count
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => downloadSVG(dailyChartRef, `daily-protests-${dailyTimeRange}.svg`)}
              className="flex items-center space-x-2 bg-white text-[#00558c] px-3 py-2 rounded-full text-sm font-semibold border border-[#00558c] transition-all duration-200 hover:bg-[#00558c] hover:text-white"
            >
              <Download className="w-4 h-4" />
              <span>SVG</span>
            </button>
            <div className="w-auto max-w-[200px]">
              <select
                value={dailyTimeRange}
                onChange={(e) => setDailyTimeRange(e.target.value as 'last30' | 'lastMonth' | 'allTime')}
                className="bg-[#00558c] text-white px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-[#004778] w-full"
              >
                <option value="last30">Last 30 Days</option>
                <option value="lastMonth">Last Year</option>
                <option value="allTime">All Time</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg" ref={dailyChartRef}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                fontFamily="urw-din, system-ui, sans-serif"
                fontWeight="bold"
                style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
                  textRendering: 'optimizeLegibility',
                  letterSpacing: '-0.02em'
                }}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12} 
                fontFamily="urw-din, system-ui, sans-serif"
                fontWeight="bold"
                style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
                  textRendering: 'optimizeLegibility',
                  letterSpacing: '-0.02em'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#00558c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-lg text-gray-600">
              Total protests in {
                dailyTimeRange === 'last30' ? 'last 30 days' :
                dailyTimeRange === 'lastMonth' ? 'last year' : 'all time'
              }: <span className="font-bold text-[#00558c] text-2xl">{dailyData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Protests Chart - Bar Chart */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-heading font-bold text-text-primary">
            Monthly Protest Count
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => downloadSVG(monthlyChartRef, `monthly-protests-${monthlyTimeRange}.svg`)}
              className="flex items-center space-x-2 bg-white text-[#00558c] px-3 py-2 rounded-full text-sm font-semibold border border-[#00558c] transition-all duration-200 hover:bg-[#00558c] hover:text-white"
            >
              <Download className="w-4 h-4" />
              <span>SVG</span>
            </button>
            <div className="w-auto max-w-[200px]">
              <select
                value={monthlyTimeRange}
                onChange={(e) => setMonthlyTimeRange(e.target.value as 'last12' | 'lastYear' | 'allTime')}
                className="bg-[#00558c] text-white px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-[#004778] w-full"
              >
                <option value="last12">Last 12 Months</option>
                <option value="lastYear">Last Year</option>
                <option value="allTime">All Time</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg" ref={monthlyChartRef}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                fontFamily="urw-din, system-ui, sans-serif"
                fontWeight="bold"
                style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
                  textRendering: 'optimizeLegibility',
                  letterSpacing: '-0.02em'
                }}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12} 
                fontFamily="urw-din, system-ui, sans-serif"
                fontWeight="bold"
                style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
                  textRendering: 'optimizeLegibility',
                  letterSpacing: '-0.02em'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#00558c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-lg text-gray-600">
              Total protests in {
                monthlyTimeRange === 'last12' ? 'last 12 months' :
                monthlyTimeRange === 'lastYear' ? 'last year' : 'all time'
              }: <span className="font-bold text-[#00558c] text-2xl">{monthlyData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Province Distribution Chart - Blue Shades Only */}
      <div className="mb-16">
        <h3 className="text-2xl font-heading font-bold text-text-primary mb-6">
          Distribution by Province
        </h3>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={provinceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="count"
              >
                {provinceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ProvinceTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 justify-items-center max-w-4xl mx-auto">
        <div className="flex flex-col items-center space-y-2 px-4 py-4 border border-[#CDCDCD] shadow-lg w-full"
             style={{
               borderRadius: '12px',
               background: 'linear-gradient(157deg, rgba(183, 183, 183, 0.40) 0%, rgba(226, 232, 240, 0.40) 25%, rgba(203, 213, 225, 0.40) 50%, rgba(148, 163, 184, 0.40) 75%, rgba(100, 116, 139, 0.40) 100%)'
             }}>
          <h4 className="font-sans text-[16px] font-bold text-text-primary text-center">Peak Daily</h4>
          <p className="text-gray-600 font-black text-[32px] leading-none">{Math.max(...dailyData.map(d => d.count)).toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-center space-y-2 px-4 py-4 border border-[#CDCDCD] shadow-lg w-full"
             style={{
               borderRadius: '12px',
               background: 'linear-gradient(157deg, rgba(183, 183, 183, 0.40) 0%, rgba(226, 232, 240, 0.40) 25%, rgba(203, 213, 225, 0.40) 50%, rgba(148, 163, 184, 0.40) 75%, rgba(100, 116, 139, 0.40) 100%)'
             }}>
          <h4 className="font-sans text-[16px] font-bold text-text-primary text-center">Average Daily</h4>
          <p className="text-gray-600 font-black text-[32px] leading-none">
            {(dailyData.length ? Math.round(dailyData.reduce((sum, item) => sum + item.count, 0) / dailyData.length) : 0).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 px-4 py-4 border border-[#CDCDCD] shadow-lg w-full"
             style={{
               borderRadius: '12px',
               background: 'linear-gradient(157deg, rgba(183, 183, 183, 0.40) 0%, rgba(226, 232, 240, 0.40) 25%, rgba(203, 213, 225, 0.40) 50%, rgba(148, 163, 184, 0.40) 75%, rgba(100, 116, 139, 0.40) 100%)'
             }}>
          <h4 className="font-sans text-[16px] font-bold text-text-primary text-center">Total Recorded</h4>
          <p className="text-gray-600 font-black text-[32px] leading-none">{mapData.length.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-center space-y-2 px-4 py-4 border border-[#CDCDCD] shadow-lg w-full"
             style={{
               borderRadius: '12px',
               background: 'linear-gradient(157deg, rgba(183, 183, 183, 0.40) 0%, rgba(226, 232, 240, 0.40) 25%, rgba(203, 213, 225, 0.40) 50%, rgba(148, 163, 184, 0.40) 75%, rgba(100, 116, 139, 0.40) 100%)'
             }}>
          <h4 className="font-sans text-[16px] font-bold text-text-primary text-center">Active Provinces</h4>
          <p className="text-gray-600 font-black text-[32px] leading-none">{provinceData.length}</p>
        </div>
      </div>
      </div>
    </div>
    </div>
  );
};

export default ProtestCharts;
