import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_TYPES } from '../constants/userTypes';

 
export const useNotificationActions = (user, onMarkAsRead, onMarkAllAsRead, onToggle) => {
    const navigate = useNavigate();

    const handleNotificationClick = useCallback((notification, e) => {
        e.stopPropagation();

        
        if (!notification.read && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }

        
        if (notification.related_booking) {
            const path = user?.user_type === USER_TYPES.ADMIN
                ? `/admin/bookings?bookingId=${notification.related_booking}`
                : `/my-bookings?bookingId=${notification.related_booking}`;
            navigate(path);
            onToggle(false); 
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
