import api from '@/lib/api';

export const notificationApi = {
  // AUTHENTICATED — get all notifications for a user
  getUserNotifications: async (userId) => {
    const response = await api.get(`/notifications/${userId}`);
    return response.data; // Array of { notifId, message, date, userId, userName, read }
  },

  // AUTHENTICATED — mark a single notification as read
  markAsRead: async (notifId) => {
    const response = await api.put(`/notifications/mark-read/${notifId}`);
    return response.data; // Returns updated notification object
  }
};
