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
    id: backendUser.id, // Fixed backendUser.Id to backendUser.id
    email: backendUser.email,
    role: roleMap[backendUser.role] || backendUser.role.toLowerCase().replace('role_', ''),
    username: backendUser.username || backendUser.email.split('@')[0] // Fallback if username missing
  };
};

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, refreshToken, ...userData } = response.data;
    return {
      user: normalizeUser(userData),
      token,
      refreshToken
    };
  },

  register: async (data) => {
    // API expects username, email, password
    const response = await api.post('/auth/register', data);
    const { token, refreshToken, ...userData } = response.data;
    return {
      user: normalizeUser(userData),
      token,
      refreshToken
    };
  },

  registerOrganizer: async (data) => {
    // Admin-only endpoint — do NOT extract/store token to avoid overwriting admin session
    const response = await api.post('/auth/register/organizer', data);
    return response.data;
  },

  // Refresh access token using stored refresh token
  refreshToken: async (refreshTokenValue) => {
    const response = await api.post('/auth/refresh-token', {
      refreshToken: refreshTokenValue
    });
    const { token, refreshToken: newRefreshToken, ...userData } = response.data;
    return {
      user: normalizeUser(userData),
      token,
      refreshToken: newRefreshToken
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