import api from './axios';

export const familyApi = {
  list: () => api.get('/family'),
  getById: (id) => api.get(`/family/${id}`),
  create: (data) => api.post('/family', data),
  update: (id, data) => api.put(`/family/${id}`, data),
  delete: (id) => api.delete(`/family/${id}`),
};
