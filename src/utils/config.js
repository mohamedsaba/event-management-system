// Centralized config prevents typos and makes it easy to mock in tests
export const config = {
  apiUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  paymobKey: import.meta.env.VITE_PAYMOB_KEY || '',
  isDev: import.meta.env.DEV, // Vite's built-in boolean for development mode
};