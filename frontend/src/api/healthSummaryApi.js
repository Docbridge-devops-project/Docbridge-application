import api from './axios';

export const healthSummaryApi = {
  getDashboard: () => api.get('/health-summary/dashboard'),
  getTimeline: (params) => api.get('/health-summary/timeline', { params }),
};
