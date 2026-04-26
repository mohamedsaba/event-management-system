import api from '@/lib/api'; // Your existing axios interceptor

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  // Placeholders for Dev A
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};