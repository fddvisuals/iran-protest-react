import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ProtestData } from '../../utils/dataFetching';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

// Color palette for charts - Blue shades
const COLORS = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];

const ProtestCharts: React.FC = () => {
  const { mapData, loading } = useAppContext();
  const [dailyData, setDailyData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [provinceData, setProvinceData] = useState<ProvinceData[]>([]);

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
    const dailyArray = Object.entries(dailyCounts)
      .map(([date, count]) => ({ 
        date, 
        count,
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    const monthlyArray = Object.entries(monthlyCounts)
      .map(([month, count]) => ({ 
        date: month,
        count,
        formattedDate: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12); // Last 12 months

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
  }, [mapData]);

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
    <div className="w-full max-w-[1200px] mx-auto mt-16 p-8 morphic-container">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Protest Analytics</h2>
        <p className="text-white/80 max-w-2xl mx-auto mb-6">
          Interactive charts showing the frequency and trends of protests over time
        </p>
      </div>

      {/* Daily Protests Chart - Line Chart */}
      <div className="mb-16">
        <h3 className="text-2xl font-semibold text-white mb-6 text-center">
          Daily Protest Count (Last 30 Days)
        </h3>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#00558c" 
                strokeWidth={3}
                dot={{ fill: '#00558c', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#00558c', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total protests in last 30 days: <span className="font-semibold text-[#00558c]">{dailyData.reduce((sum, item) => sum + item.count, 0)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Protests Chart - Bar Chart */}
      <div className="mb-16">
        <h3 className="text-2xl font-semibold text-white mb-6 text-center">
          Monthly Protest Count (Last 12 Months)
        </h3>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg">
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
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#00558c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total protests in last 12 months: <span className="font-semibold text-[#00558c]">{monthlyData.reduce((sum, item) => sum + item.count, 0)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Province Distribution Chart - Blue Shades Only */}
      <div className="mb-16">
        <h3 className="text-2xl font-semibold text-white mb-6 text-center">
          Distribution by Province
        </h3>
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg w-full max-w-lg">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={provinceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={120}
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
      </div>

      {/* Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-gradient-to-r from-[#00558c] to-[#004778] rounded-xl p-6 text-white text-center">
          <h4 className="text-lg font-semibold mb-2">Peak Daily</h4>
          <p className="text-3xl font-bold">{Math.max(...dailyData.map(d => d.count))}</p>
        </div>
        <div className="bg-gradient-to-r from-[#004778] to-[#003961] rounded-xl p-6 text-white text-center">
          <h4 className="text-lg font-semibold mb-2">Average Daily</h4>
          <p className="text-3xl font-bold">
            {dailyData.length ? Math.round(dailyData.reduce((sum, item) => sum + item.count, 0) / dailyData.length) : 0}
          </p>
        </div>
        <div className="bg-gradient-to-r from-[#003961] to-[#002a4a] rounded-xl p-6 text-white text-center">
          <h4 className="text-lg font-semibold mb-2">Total Recorded</h4>
          <p className="text-3xl font-bold">{mapData.length}</p>
        </div>
        <div className="bg-gradient-to-r from-[#002a4a] to-[#001b33] rounded-xl p-6 text-white text-center">
          <h4 className="text-lg font-semibold mb-2">Active Provinces</h4>
          <p className="text-3xl font-bold">{provinceData.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ProtestCharts;
