import { eventsApi } from './eventsApi';
import { registrationApi } from './registrationApi';

export const adminApi = {
  // Admin stats must be computed from multiple endpoints as the backend lacks a unified stats endpoint
  getDashboardStats: async () => {
    try {
      const [events, totalRegistrations] = await Promise.all([
        eventsApi.getEvents(),
        registrationApi.getTotalRegistrations()
      ]);

      return {
        totalEvents: events.length,
        totalRegistrations: totalRegistrations,
        totalRevenue: 0 // Backend gap: revenue calculation not directly supported
      };
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      throw error;
    }
  }
};
