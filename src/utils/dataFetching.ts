import Papa from 'papaparse';

const GOOGLE_SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTT_uQv7JKEk8An8zPxdgcwxRPNTuypy7XAZcavbSAqnKyHlFD1nB5yJ1Zaa9HiFXVchC9tEy4OPQv/pub?gid=0&single=true&output=csv";

export const getModifiedUrl = (url: string): string => {
  if (!url) return "";
  const match = url.match(/\/s\/([a-zA-Z0-9]+)/);
  return match && match[1] ? match[1] : "";
};

export type TimeFilter = 'last-week' | 'last-month' | 'all-time';

export interface ProtestData {
  Date: string;
  City_Village: string;
  County: string;
  Province: string;
  Latitude: string;
  Longitude: string;
  Estimated_Size: string;
  Description: string;
  Injured: string;
  Arrested: string;
  Killed: string;
  Link: string;
  MediaURL: string;
  Source: string;
  [key: string]: string; // Allow for additional properties
}

// Statistics data interface
export interface StatisticsData {
  minorsKilled: number;
  totalKilled: number;
  totalArrested: number;
  lastUpdated: string;
}

// Google Sheets statistics URL - using gid=573718568 for the statistics sheet
const STATISTICS_SHEETS_URL = import.meta.env.VITE_STATISTICS_SHEETS_URL || "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTT_uQv7JKEk8An8zPxdgcwxRPNTuypy7XAZcavbSAqnKyHlFD1nB5yJ1Zaa9HiFXVchC9tEy4OPQv/pub?gid=573718568";

// Fetch data from a specific range in the statistics sheet
const fetchStatisticsRange = async (range: string): Promise<string> => {
  try {
    const response = await fetch(`${STATISTICS_SHEETS_URL}&range=${range}&single=true&output=csv`);
    const text = await response.text();
    return text.replace(/['"]+/g, "").trim();
  } catch (error) {
    console.error(`Error fetching statistics range ${range}:`, error);
    return "";
  }
};

// Fetch all statistics data
export const fetchStatisticsData = async (): Promise<StatisticsData> => {
  try {
    const [minorsKilled, totalKilled, totalArrested, lastUpdated] = await Promise.all([
      fetchStatisticsRange("a2"), // Minors killed
      fetchStatisticsRange("b2"), // Total killed
      fetchStatisticsRange("c2"), // Total arrested
      fetchStatisticsRange("e2")  // Last updated date
    ]);

    // Helper function to parse numbers that might contain commas
    const parseNumber = (value: string): number => {
      // Remove commas and other non-numeric characters except decimal points
      const cleanValue = value.replace(/[,\s]/g, '');
      const parsed = parseInt(cleanValue, 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      minorsKilled: parseNumber(minorsKilled),
      totalKilled: parseNumber(totalKilled),
      totalArrested: parseNumber(totalArrested),
      lastUpdated: lastUpdated || ""
    };
  } catch (error) {
    console.error('Error fetching statistics data:', error);
    return {
      minorsKilled: 0,
      totalKilled: 0,
      totalArrested: 0,
      lastUpdated: ""
    };
  }
}

export const fetchGoogleSheetsData = (): Promise<ProtestData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(GOOGLE_SHEETS_URL, {
      download: true,
      header: true,
      complete: (result: any) => {
        resolve(result.data as ProtestData[]);
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
};

export const fetchVideoData = async (): Promise<ProtestData[]> => {
  try {
    const data = await fetchGoogleSheetsData();
    console.log('Raw data from Google Sheets:', data.length, 'rows');
    const withMedia = data.filter(row => row.MediaURL);
    console.log('Data with MediaURL:', withMedia.length, 'rows');
    const sorted = withMedia.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
    // Temporarily increase to see more videos
    const sliced = sorted.slice(0, 50);
    console.log('After slice(0, 50):', sliced.length, 'rows');
    console.log('Size values in fetched video data:', [...new Set(sliced.map(v => v.Estimated_Size))]);
    console.log('First few videos with sizes:', sliced.slice(0, 10).map(v => ({ 
      date: v.Date, 
      size: v.Estimated_Size, 
      city: v.City_Village 
    })));
    return sliced;
  } catch (error) {
    console.error("Error fetching video data:", error);
    return [];
  }
};

export const fetchMapData = async (): Promise<ProtestData[]> => {
  try {
    return await fetchGoogleSheetsData();
  } catch (error) {
    console.error("Error fetching map data:", error);
    return [];
  }
};

// Utility function to count protests in the last 8 days (rolling 8-day period)
export const getProtestsThisWeek = (protests: ProtestData[]): number => {
  if (!protests || protests.length === 0) return 0;
  
  // Calculate exactly the last 8 days including today
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const eightDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);
  
  console.log('Counting protests from', eightDaysAgo.toDateString(), 'to', today.toDateString());
  
  const filteredProtests = protests.filter(protest => {
    if (!protest.Date || protest.Date.trim() === '') return false;
    
    try {
      const protestDate = new Date(protest.Date);
      if (isNaN(protestDate.getTime())) return false;
      
      return protestDate >= eightDaysAgo && protestDate <= today;
    } catch (error) {
      console.warn('Invalid date format:', protest.Date, error);
      return false;
    }
  });
  
  console.log('Found', filteredProtests.length, 'protests in the last 8 days');
  
  // Group by date for debugging
  const byDate = filteredProtests.reduce((acc, protest) => {
    acc[protest.Date] = (acc[protest.Date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Protests by date:', byDate);
  
  return filteredProtests.length;
};

// Utility function to filter protests by time range
export const filterProtestsByTimeRange = (protests: ProtestData[], timeFilter: TimeFilter): ProtestData[] => {
  if (!protests || protests.length === 0) return [];
  
  const now = new Date();
  let startDate: Date;
  
  switch (timeFilter) {
    case 'last-week':
      // Last 7 days including today
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      break;
    case 'last-month':
      // Last 30 days including today
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
      break;
    case 'all-time':
    default:
      return protests;
  }
  
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  return protests.filter(protest => {
    if (!protest.Date || protest.Date.trim() === '') return false;
    
    try {
      const protestDate = new Date(protest.Date);
      if (isNaN(protestDate.getTime())) return false;
      
      return protestDate >= startDate && protestDate <= endDate;
    } catch (error) {
      console.warn('Invalid date format:', protest.Date, error);
      return false;
    }
  });
};

// Utility function to count protests for a given time filter
export const getProtestCountByTimeFilter = (protests: ProtestData[], timeFilter: TimeFilter): number => {
  return filterProtestsByTimeRange(protests, timeFilter).length;
};
