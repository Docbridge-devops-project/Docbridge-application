import api from './axios';

export const reminderApi = {
  getUpcoming: () => api.get('/reminders/upcoming'),
  listMedicine: (params) => api.get('/reminders/medicine', { params }),
  getMedicine: (id) => api.get(`/reminders/medicine/${id}`),
  createMedicine: (data) => api.post('/reminders/medicine', data),
  updateMedicine: (id, data) => api.put(`/reminders/medicine/${id}`, data),
  deleteMedicine: (id) => api.delete(`/reminders/medicine/${id}`),
  listFollowup: (params) => api.get('/reminders/followup', { params }),
  getFollowup: (id) => api.get(`/reminders/followup/${id}`),
  createFollowup: (data) => api.post('/reminders/followup', data),
  updateFollowup: (id, data) => api.put(`/reminders/followup/${id}`, data),
  deleteFollowup: (id) => api.delete(`/reminders/followup/${id}`),
  completeFollowup: (id) => api.put(`/reminders/followup/${id}/complete`),
};
