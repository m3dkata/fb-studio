import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import notificationsService from '../../services/notifications';
import Logo from './Logo';
import DesktopNavigation from './DesktopNavigation';
import ThemeToggle from './ThemeToggle';
import Notifications from './Notifications';
import NotificationsMobile from './NotificationsMobile';
import UserActions from './UserActions';
import MobileMenu from './MobileMenu';
import MobileNavigation from './MobileNavigation';

const Header = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Fetch notifications
    useEffect(() => {
        if (isAuthenticated && user) {
            loadNotifications();
        }
    }, [isAuthenticated, user]);

    const loadNotifications = async () => {
        if (!user) return;
        const data = await notificationsService.getAll(user.id);
        setNotifications(data);
        const count = await notificationsService.getUnreadCount(user.id);
        setUnreadCount(count);
    };

    const handleMarkAsRead = async (id) => {
        await notificationsService.markAsRead(id);
        loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        await notificationsService.markAllAsRead(user.id);
        loadNotifications();
    };

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
    ];

    if (isAuthenticated) {
        if (isAdmin()) {
            navLinks.push({ name: 'Dashboard', path: '/admin' });
        } else {
            navLinks.push({ name: 'Dashboard', path: '/dashboard' });
            navLinks.push({ name: 'My Bookings', path: '/my-bookings' });
        }
    }

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                ? 'glass py-2'
                : 'bg-transparent py-4'
                }`}
            style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
        >
            <div className="container px-4 mx-auto sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <Logo onClick={closeMenu} />

                    {/* Desktop Nav */}
                    <DesktopNavigation navLinks={navLinks} />

                    {/* Mobile Notifications Dropdown (hidden on desktop) */}
                    <div className="md:hidden">
                        <NotificationsMobile
                            isAuthenticated={isAuthenticated}
                            user={user}
                            notifications={notifications}
                            unreadCount={unreadCount}
                            onToggle={toggleNotifications}
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAllAsRead={handleMarkAllAsRead}
                            onLoadNotifications={loadNotifications}
                            isOpen={isNotificationsOpen}
                        />
                    </div>

                    <div className="items-center hidden space-x-4 md:flex">
                        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Notifications
                                    isAuthenticated={isAuthenticated}
                                    user={user}
                                    notifications={notifications}
                                    unreadCount={unreadCount}
                                    onToggle={toggleNotifications}
                                    onMarkAsRead={handleMarkAsRead}
                                    onMarkAllAsRead={handleMarkAllAsRead}
                                    onLoadNotifications={loadNotifications}
                                    isOpen={isNotificationsOpen}
                                />
                                <UserActions
                                    isAuthenticated={isAuthenticated}
                                    user={user}
                                    logout={logout}
                                />
                            </div>
                        ) : (
                            <UserActions
                                isAuthenticated={isAuthenticated}
                                user={user}
                                logout={logout}
                            />
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <MobileMenu
                        isMenuOpen={isMenuOpen}
                        onMenuToggle={toggleMenu}
                        isAuthenticated={isAuthenticated}
                        unreadCount={unreadCount}
                        onNotificationsToggle={toggleNotifications}
                    />
                </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNavigation
                isOpen={isMenuOpen}
                navLinks={navLinks}
                isDark={isDark}
                onThemeToggle={toggleTheme}
                isAuthenticated={isAuthenticated}
                user={user}
                logout={logout}
                onCloseMenu={closeMenu}
            />
        </header>
    );
};

export default Header;
