import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useAdminRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) {
        return false;
      }

      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.warn('[Admin] Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    isAdmin: query.data || false,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
