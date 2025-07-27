import { useQuery } from '@tanstack/react-query';

import { authAPI } from '@/lib/api';

export const usePlays = () =>
  useQuery({
    queryKey: ['plays'],
    queryFn: authAPI.getPlays,
  });
