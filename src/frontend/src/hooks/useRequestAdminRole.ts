import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useRequestAdminRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }

      await actor.requestAdminRole();
    },
    onSuccess: () => {
      // Invalidate admin status query to immediately reflect the change
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}
