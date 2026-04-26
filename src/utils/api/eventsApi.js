import api from '@/lib/api';

export const eventsApi = {

  // PUBLIC — get all events
  getEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },

  // PUBLIC — get single event details
  getEventById: async (eventId) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  // USER — register for event
  registerForEvent: async (eventId, registrationData) => {
    const response = await api.post(
      `/events/${eventId}/register`,
      registrationData
    );
    return response.data;
  },

  // ADMIN — create event
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },


  // ADMIN — delete event
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  },

  // ADMIN — see who registered
  getEventRegistrations: async (eventId) => {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data;
  }

};