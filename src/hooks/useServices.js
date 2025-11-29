import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import servicesService from '../services/services';

export const useServices = (filter = {}) => {
    return useQuery({
        queryKey: ['services', filter],
        queryFn: () => servicesService.getAll(filter),
    });
};

export const useService = (id) => {
    return useQuery({
        queryKey: ['service', id],
        queryFn: () => servicesService.getById(id),
        enabled: !!id,
    });
};

export const useCreateService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => servicesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => servicesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useDeleteService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => servicesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};
