import api from './axios';

export const aiApi = {
  chat: (data) => api.post('/ai/chat', data),
  getHistory: (params) => api.get('/ai/chat/history', { params }),
  getSessionHistory: (sessionId) => api.get(`/ai/chat/history/${sessionId}`),
  deleteSession: (sessionId) => api.delete(`/ai/chat/history/${sessionId}`),
  explainMedicine: (data) => api.post('/ai/explain/medicine', data),
  explainLabReport: (data) => api.post('/ai/explain/lab-report', data),
  explainSymptom: (data) => api.post('/ai/explain/symptom', data),
  generateQuestions: () => api.post('/ai/questions'),
  getSuggestedQuestions: () => api.get('/ai/suggested-questions'),
};
