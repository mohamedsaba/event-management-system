import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '@/utils/api/bookingApi';

export const useRegistrations = () => {
  return useQuery({
    queryKey: ['registrations'],
    queryFn: bookingApi.getRegistrations,
    // Provide fallback mock data until Dev A finishes the backend
    initialData: [
      { id: 1, ref: "REF-847291", title: "Tech Summit 2025", date: "Oct 24, 2025", tickets: 2, amount: 525, status: "Confirmed" }
    ]
  });
};