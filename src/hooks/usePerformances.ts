import { useQuery } from '@tanstack/react-query';

import { authAPI } from '@/lib/api';
import type { PerformancesResponse } from '@/lib/types/performance';

type PerformancesFilters = {
  play_id?: number;
  is_active?: boolean;
  page?: number;
  per_page?: number;
};

export const usePerformances = (filters?: PerformancesFilters) =>
  useQuery<PerformancesResponse>({
    queryKey: ['performances', filters ?? {}],
    queryFn: () => authAPI.getPerformances(filters),
  });
