import api from '@/lib/api';
import { authApi } from './authApi';

const normalizeOrganizer = (org) => {
  if (!org) return null;
  return {
    id: org.id || org.Id,
    username: org.name || org.username,
    email: org.email,
  };
};

export const organizerApi = {
  // ADMIN — get all organizers
  getOrganizers: async () => {
    const response = await api.get('/admin/organizers');
    const payload = response.data;
    const list = payload.data ?? payload;
    return (Array.isArray(list) ? list : []).map(normalizeOrganizer);
  },

  // ADMIN — get organizer by ID
  getOrganizerById: async (id) => {
    const response = await api.get(`/admin/organizers/${id}`);
    const payload = response.data;
    return normalizeOrganizer(payload.data ?? payload);
  },

  // ADMIN — create organizer account
  createOrganizer: async (data) => {
    return authApi.registerOrganizer(data);
  },

  // ADMIN — update organizer (name + email)
  updateOrganizer: async (id, { newName, newEmail }) => {
    const response = await api.put(`/admin/organizers/${id}`, { newName, newEmail });
    return response.data;
  },

  // ADMIN — delete organizer
  deleteOrganizer: async (id) => {
    const response = await api.delete(`/admin/organizers/${id}`);
    return response.data;
  },
};
