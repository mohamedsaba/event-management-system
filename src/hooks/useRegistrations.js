import { useQuery } from '@tanstack/react-query';
import { registrationApi } from '@/utils/api/registrationApi';
import { useAuth } from './useAuth';

export const useRegistrations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['registrations', user?.id],
    queryFn: () => registrationApi.getUserRegistrations(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};