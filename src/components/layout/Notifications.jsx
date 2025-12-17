import React, { useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationActions } from '../../hooks/useNotificationActions';

const Notifications = ({
    isAuthenticated,
    user,
    notifications,
    unreadCount,
    onToggle,
    onMarkAsRead,
    onMarkAllAsRead,
    isOpen
}) => {
    const notificationRef = useRef(null);
    const dropdownRef = useRef(null);

    
    const {
        handleNotificationClick,
        handleMarkAsReadWrapper,
        handleMarkAllAsReadClick
    } = useNotificationActions(user, onMarkAsRead, onMarkAllAsRead, onToggle);

    
    useEffect(() => {
        if (isAuthenticated && user) {
            import('../../services/notifications').then(({ default: notificationsService }) => {
                const unsubscribe = notificationsService.subscribe(user.id, () => {
                    
                });

                return () => {
                    unsubscribe.then(unsub => unsub());
                };
            });
        }
    }, [isAuthenticated, user]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="relative" ref={notificationRef}>
            <button
                onClick={() => onToggle(!isOpen)}
                className="relative p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            { }
            {isOpen && (
                <div ref={dropdownRef} className="fixed inset-x-0 z-50 w-full px-4 top-16 md:absolute md:right-4 md:left-auto md:top-full md:mt-2 md:w-80 md:px-0">
                    <div className="overflow-hidden bg-white border border-gray-200 shadow-xl dark:bg-gray-900 rounded-xl dark:border-gray-700 animate-slide-down">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && onMarkAllAsRead && (
                                <button
                                    onClick={handleMarkAllAsReadClick}
                                    className="text-xs font-medium text-primary hover:text-primary-dark"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="overflow-y-auto max-h-96">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={(e) => handleNotificationClick(notification, e)}
                                        className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {formatDistanceToNow(new Date(notification.created), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <button
                                                    onClick={(e) => handleMarkAsReadWrapper(notification.id, e)}
                                                    className="text-gray-400 transition-colors hover:text-primary"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;