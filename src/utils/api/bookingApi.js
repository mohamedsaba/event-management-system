import api from '@/lib/api';

export const bookingApi = {
  getRegistrations: async () => {
    // Replace with real endpoint later
    const response = await api.get('/bookings/my-registrations');
    return response.data;
  }
};