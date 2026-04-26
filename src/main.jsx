import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <--- Ensure this path is correct!
import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Configure the client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      gcTime: 1000 * 60 * 30, // Note: in v5 'cacheTime' was renamed to 'gcTime'
      retry: 1, 
      refetchOnWindowFocus: false, 
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);