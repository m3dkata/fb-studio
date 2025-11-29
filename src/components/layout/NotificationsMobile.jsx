import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationsMobile = ({ 
    isAuthenticated, 
    user, 
    notifications, 
    unreadCount, 
    onToggle, 
    onMarkAsRead, 
    onMarkAllAsRead, 
    onLoadNotifications,
    isOpen 
}) => {
    const notificationRef = useRef(null);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                onToggle(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, onToggle]);

    // Subscribe to real-time notifications
    useEffect(() => {
        if (isAuthenticated && user && onLoadNotifications) {
            import('../../services/notifications').then(({ default: notificationsService }) => {
                const unsubscribe = notificationsService.subscribe(user.id, (e) => {
                    if (e.action === 'create') {
                        // Refresh notifications on new event
                        onLoadNotifications();
                    }
                });

                return () => {
                    unsubscribe.then(unsub => unsub());
                };
            });
        }
    }, [isAuthenticated, user, onLoadNotifications]);

    if (!isAuthenticated) {
        return null;
    }

    const handleMarkAsReadWrapper = (id, e) => {
        e.stopPropagation();
        if (onMarkAsRead) {
            onMarkAsRead(id);
        }
    };

    return (
        <div className="relative" ref={notificationRef}>
            {/* Notifications Dropdown - Mobile only */}
            {isOpen && (
                <div className="fixed inset-x-0 z-50 w-full px-4 top-16">
                    <div className="overflow-hidden bg-white border border-gray-200 shadow-xl dark:bg-gray-900 rounded-xl dark:border-gray-700 animate-slide-down">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && onMarkAllAsRead && (
                                <button
                                    onClick={onMarkAllAsRead}
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
                                        className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
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

export default NotificationsMobile;