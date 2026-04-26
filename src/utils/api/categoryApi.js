import api from '@/lib/api';

const normalizeCategory = (cat) => {
  if (!cat) return null;
  return {
    id: cat.id || cat.Id, // Handle both casing
    name: cat.name
  };
};

export const categoryApi = {
  // AUTHENTICATED — get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return (response.data || []).map(normalizeCategory);
  },

  // AUTHENTICATED — get single category
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return normalizeCategory(response.data);
  },

  // ADMIN — create category
  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return normalizeCategory(response.data);
  },

  // ADMIN — update category
  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return normalizeCategory(response.data);
  },

  // ADMIN — delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};
