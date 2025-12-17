import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import notificationsService from '../services/notifications';

export const useNotifications = (userId) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['notifications', userId],
        queryFn: () => notificationsService.getAll(userId),
        enabled: !!userId,
    });

    // Subscribe to real-time updates
    useEffect(() => {
        if (!userId) return;

        let unsubscribeFunc;
        const setupSubscription = async () => {
            try {
                unsubscribeFunc = await notificationsService.subscribe(userId, () => {
                    queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
                    queryClient.invalidateQueries({ queryKey: ['unread-count', userId] });
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
    }, [userId, queryClient]);

    return query;
};

export const useUnreadCount = (userId) => {
    return useQuery({
        queryKey: ['unread-count', userId],
        queryFn: () => notificationsService.getUnreadCount(userId),
        enabled: !!userId,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => notificationsService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId) => notificationsService.markAllAsRead(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => notificationsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        },
    });
};
