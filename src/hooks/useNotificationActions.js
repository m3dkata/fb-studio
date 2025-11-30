import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_TYPES } from '../constants/userTypes';

/**
 * Custom hook for notification-related actions
 * Extracts shared logic from Notifications.jsx and NotificationsMobile.jsx
 * 
 * @param {Object} user - Current user object
 * @param {Function} onMarkAsRead - Callback to mark notification as read
 * @param {Function} onMarkAllAsRead - Callback to mark all notifications as read
 * @param {Function} onToggle - Callback to toggle notification dropdown
 * @returns {Object} Notification action handlers
 */
export const useNotificationActions = (user, onMarkAsRead, onMarkAllAsRead, onToggle) => {
    const navigate = useNavigate();

    const handleNotificationClick = useCallback((notification, e) => {
        e.stopPropagation();

        // Mark as read if unread
        if (!notification.read && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }

        // Navigate to booking if it exists
        if (notification.related_booking) {
            const path = user?.user_type === USER_TYPES.ADMIN
                ? `/admin/bookings?bookingId=${notification.related_booking}`
                : `/my-bookings?bookingId=${notification.related_booking}`;
            navigate(path);
            onToggle(false); // Close dropdown AFTER navigation
        }
    }, [user, onMarkAsRead, onToggle, navigate]);

    const handleMarkAsReadWrapper = useCallback((id, e) => {
        e.stopPropagation();
        if (onMarkAsRead) {
            onMarkAsRead(id);
        }
    }, [onMarkAsRead]);

    const handleMarkAllAsReadClick = useCallback((e) => {
        e.stopPropagation();
        if (onMarkAllAsRead) {
            onMarkAllAsRead();
        }
    }, [onMarkAllAsRead]);

    return {
        handleNotificationClick,
        handleMarkAsReadWrapper,
        handleMarkAllAsReadClick
    };
};

export default useNotificationActions;
