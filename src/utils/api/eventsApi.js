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

export const eventsApi = {
  // AUTHENTICATED — get all events
  getEvents: async () => {
    const response = await api.get('/events');
    return (response.data || []).map(normalizeEvent);
  },

  // AUTHENTICATED — get single event details
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return normalizeEvent(response.data);
  },

  // ORGANIZER/ADMIN — create event
  createEvent: async (data) => {
    const response = await api.post('/events', data);
    return response.data; // Returns event ID
  },

  // ORGANIZER/ADMIN — update event
  updateEvent: async (id, data) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data; // Returns true
  },

  // ADMIN only — delete event
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data; // Returns true
  }
};