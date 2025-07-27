import { useQuery } from '@tanstack/react-query';

import { authAPI } from '@/lib/api';

export const usePerformances = () =>
  useQuery({
    queryKey: ['performances'],
    queryFn: authAPI.getPerformances,
  });
