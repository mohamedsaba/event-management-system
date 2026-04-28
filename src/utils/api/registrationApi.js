import api from '@/lib/api';

const normalizeEvent = (event) => ({
  id: event.id || event.Id,
  title: event.title,
  description: event.description,
  location: event.location,
  date: event.date,
  price: event.price,
  maxAttendance: event.maxAttendance,
  paymentRequired: event.paymentRequired,
  eventStatus: event.eventStatus,
  organizerId: event.organizerId,
  organizerName: event.organizerName,
  categoryId: event.categoryId,
  categoryName: event.categoryName,
});

export const registrationApi = {
  // ATTENDEE — register for event
  registerForEvent: async (userId, eventId) => {
    const response = await api.post('/registrations/register', { userId, eventId });
    return response.data;
  },

  // ATTENDEE/ADMIN — get all registrations for a user
  getUserRegistrations: async (userId) => {
    const response = await api.get(`/registrations/${userId}`);
    // The API returns a list of Event objects
    return (response.data || []).map(normalizeEvent);
  },

  // ATTENDEE — cancel registration (sends userId and eventId in request body)
  cancelRegistration: async (userId, eventId) => {
    const response = await api.post('/registrations/cancel', { userId, eventId });
    return response.data;
  },

  // ADMIN — get total number of registrations
  getTotalRegistrations: async () => {
    const response = await api.get('/registrations/getNumberOfRegesters');
    return response.data; // Returns number
  },

  // ADMIN/ORGANIZER — get registration count for a specific event
  getEventRegistrationCount: async (eventId) => {
    const response = await api.get(`/registrations/getNumberOfRegestersForEvent/${eventId}`);
    return response.data; // Returns number
  },

  // ATTENDEE — get total spent by user
  getUserTotalSpending: async (userId) => {
    const response = await api.get(`/registrations/getTotalSpents/${userId}`);
    return response.data; // Returns BigDecimal/Number
  }
};
