// Centralized config prevents typos and makes it easy to mock in tests
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  paymobKey: import.meta.env.VITE_PAYMOB_KEY || '',
  isDev: import.meta.env.DEV, // Vite's built-in boolean for development mode
};