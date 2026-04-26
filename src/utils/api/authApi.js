import api from '@/lib/api';

const normalizeUser = (backendUser) => {
  if (!backendUser) return null;
  
  // Map ROLE_X to x
  const roleMap = {
    'ROLE_ADMIN': 'admin',
    'ROLE_ORGANIZER': 'organizer',
    'ROLE_ATTENDEE': 'attendee'
  };

  return {
    id: backendUser.Id, // Normalize capital Id to id
    email: backendUser.email,
    role: roleMap[backendUser.role] || backendUser.role.toLowerCase().replace('role_', ''),
    username: backendUser.username || backendUser.email.split('@')[0] // Fallback if username missing
  };
};

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, ...userData } = response.data;
    return {
      user: normalizeUser(userData),
      token
    };
  },

  register: async (data) => {
    // API expects username, email, password
    const response = await api.post('/auth/register', data);
    const { token, ...userData } = response.data;
    return {
      user: normalizeUser(userData),
      token
    };
  },

  registerOrganizer: async (data) => {
    // Admin-only endpoint
    const response = await api.post('/auth/register/organizer', data);
    const { token, ...userData } = response.data;
    return {
      user: normalizeUser(userData),
      token
    };
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return normalizeUser(response.data);
  },

  checkEmail: async (email) => {
    const response = await api.get(`/auth/check-email?email=${email}`);
    return response.data; // Returns boolean
  }
};