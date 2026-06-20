import api from './axios';

export const prescriptionApi = {
  list: (params) => api.get('/prescriptions', { params }),
  getActive: () => api.get('/prescriptions/active'),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  delete: (id) => api.delete(`/prescriptions/${id}`),
  aiExplain: (id) => api.post(`/prescriptions/${id}/ai-explain`),
  getSideEffects: (id) => api.get(`/prescriptions/${id}/side-effects`),
  createSideEffect: (id, data) => api.post(`/prescriptions/${id}/side-effects`, data),
  updateSideEffect: (id, seId, data) => api.put(`/prescriptions/${id}/side-effects/${seId}`, data),
  deleteSideEffect: (id, seId) => api.delete(`/prescriptions/${id}/side-effects/${seId}`),
};
