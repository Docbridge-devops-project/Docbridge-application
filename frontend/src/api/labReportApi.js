import api from './axios';

export const labReportApi = {
  list: (params) => api.get('/lab-reports', { params }),
  getById: (id) => api.get(`/lab-reports/${id}`),
  create: (data) => api.post('/lab-reports', data),
  update: (id, data) => api.put(`/lab-reports/${id}`, data),
  delete: (id) => api.delete(`/lab-reports/${id}`),
  getFlagged: () => api.get('/lab-reports/flagged'),
  aiExplain: (id) => api.post(`/lab-reports/${id}/ai-explain`),
  getTrends: (testName) => api.get(`/lab-reports/trends/${testName}`),
};
