import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import bookingsService from '../services/bookings';

export const useBookings = (filter = {}) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['bookings', filter],
        queryFn: () => bookingsService.getAll(filter),
    });

    // Subscribe to real-time updates
    useEffect(() => {
        let unsubscribeFunc;
        const setupSubscription = async () => {
            try {
                unsubscribeFunc = await bookingsService.subscribe(() => {
                    queryClient.invalidateQueries({ queryKey: ['bookings'] });
                });
            } catch (error) {
                console.error('Failed to subscribe:', error);
            }
        };

        setupSubscription();

        return () => {
            if (unsubscribeFunc) {
                unsubscribeFunc();
            }
        };
    }, [queryClient]);

    return query;
};

export const useBooking = (id) => {
    return useQuery({
        queryKey: ['booking', id],
        queryFn: () => bookingsService.getById(id),
        enabled: !!id,
    });
};

export const useCreateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => bookingsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useUpdateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => bookingsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
};

export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status, userId }) => bookingsService.updateStatus(id, status, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useDeleteBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => bookingsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
};

export const useBookingStats = (userId) => {
    return useQuery({
        queryKey: ['booking-stats', userId],
        queryFn: () => bookingsService.getStats(userId),
        enabled: !!userId,
    });
};

export const useAvailableSlots = (serviceId, date) => {
    return useQuery({
        queryKey: ['available-slots', serviceId, date],
        queryFn: () => bookingsService.getAvailableSlots(serviceId, date),
        enabled: !!serviceId && !!date,
    });
};
