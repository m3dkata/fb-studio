import { useState, useEffect, useCallback } from 'react';
import presenceService from '../services/presence';
import { useAuth } from './useAuth';

export const usePresence = () => {
    const { user } = useAuth();
    const [onlineAdmins, setOnlineAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    
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

        const unsubscribe = presenceService.subscribeToPresence(() => {
            loadOnlineAdmins();
        });

        const handleVisibilityChange = () => {
            if (document.hidden) {
                presenceService.updatePresence('offline');
            } else {
                presenceService.updatePresence('online');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        const handleBeforeUnload = () => {
            presenceService.stopHeartbeat();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            presenceService.stopHeartbeat();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (unsubscribe) {
                presenceService.unsubscribe();
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
