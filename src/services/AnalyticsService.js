import api from './api';

export const fetchAnalyticsData = async (range, startDate, endDate) => {
  const res = await api.get('/analytics', {
    params: {
      range,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined
    }
  });
  return res.data;
};
