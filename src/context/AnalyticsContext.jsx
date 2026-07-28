import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDateRange } from '../utils/dateUtils';
import { fetchAnalyticsData } from '../services/AnalyticsService';
import { useUser } from './UserContext';

const AnalyticsContext = createContext();

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider = ({ children }) => {
  const [filterType, setFilterType] = useState('Last 30 Days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const [analyticsData, setAnalyticsData] = useState({
    isEmpty: true,
    aggregates: {
      revenue: 0,
      activeClients: 0,
      completedProjects: 0,
      pendingTasks: 0,
      totalEarnings: 0,
      profit: 0,
      expenses: 0,
      completionRate: 0
    },
    chartData: [],
    pieData: [{ name: 'No Data', value: 1 }],
    clients: [],
    projects: [],
    tasks: []
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const token = localStorage.getItem('freelancepro_token');
      if (!token || !user || user.role === 'client') {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const mapFilterTypeToRange = (type) => {
          switch (type) {
            case 'Today': return 'today';
            case 'Yesterday': return 'yesterday';
            case 'Last 7 Days': return '7days';
            case 'Last 30 Days': return '30days';
            case 'Last 90 Days': return '90days';
            case 'Last 12 Months': return '12months';
            case 'Custom Date Range': return 'custom';
            default: return '30days';
          }
        };
        const range = mapFilterTypeToRange(filterType);
        const { startDate, endDate } = getDateRange(filterType, customStart, customEnd);
        const data = await fetchAnalyticsData(range, startDate, endDate);

        if (isMounted && data) {
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filterType, customStart, customEnd, user]);

  return (
    <AnalyticsContext.Provider value={{
      ...analyticsData,
      filterType,
      setFilterType,
      customStart,
      setCustomStart,
      customEnd,
      setCustomEnd,
      isLoading
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
