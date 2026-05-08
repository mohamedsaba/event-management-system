import api from '@/lib/api';

const normalizeEvent = (event) => {
  if (!event) return null;
  return {
    id: event.id || event.Id,
    title: event.title || "",
    description: event.description || "",
    location: event.location || "",
    date: event.date,
    price: event.price || 0,
    maxAttendance: event.maxAttendance || 0,
    paymentRequired: !!event.paymentRequired,
    eventStatus: event.eventStatus || "SCHEDULED",
    organizerId: event.organizerId || event.organizer?.id || event.organizer?.Id,
    organizerName: event.organizerName || event.organizer?.username || event.organizer?.name || "Organizer",
    categoryId: event.categoryId || event.category?.id || event.category?.Id,
    categoryName: event.categoryName || event.category?.name || "General",
  };
};

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
