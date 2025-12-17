import { useState, useEffect, useCallback } from 'react';
import presenceService from '../services/presence';
import { useAuth } from './useAuth';

export const usePresence = () => {
    const { user } = useAuth();
    const [onlineAdmins, setOnlineAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load online admins
    const loadOnlineAdmins = useCallback(async () => {
        try {
            setLoading(true);
            const admins = await presenceService.getOnlineAdmins();
            setOnlineAdmins(admins);
        } catch (error) {
            console.error('Failed to load online admins:', error);
            setOnlineAdmins([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        presenceService.startHeartbeat();

        loadOnlineAdmins();

        let unsubscribeFunc;
        const setupSubscription = async () => {
            try {
                unsubscribeFunc = await presenceService.subscribeToPresence(() => {
                    loadOnlineAdmins();
                });
            } catch (error) {
                console.error('Failed to subscribe to presence:', error);
            }
        };

        setupSubscription();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                presenceService.updatePresence('away');
            } else {
                presenceService.updatePresence('online');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            presenceService.stopHeartbeat();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (unsubscribeFunc) {
                unsubscribeFunc();
            }
        };
    }, [user]);

    return {
        onlineAdmins,
        loading,
        hasOnlineAdmin: onlineAdmins.length > 0,
        firstOnlineAdmin: onlineAdmins[0] || null,
    };
};

export default usePresence;
