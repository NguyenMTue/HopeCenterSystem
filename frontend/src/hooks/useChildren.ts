import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { childrenService } from '../services/children.service';

export const useChildren = (params?: any) => {
  return useQuery({
    queryKey: ['children', params],
    queryFn: () => childrenService.getChildren(params),
  });
};

export const useChild = (id: string) => {
  return useQuery({
    queryKey: ['child', id],
    queryFn: () => childrenService.getChildById(id),
    enabled: !!id,
  });
};

export const useCreateChild = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: childrenService.createChild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
};
