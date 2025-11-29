import pb from './pocketbase';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const ONLINE_THRESHOLD = 120000; // 2 minutes

export const presenceService = {
    heartbeatInterval: null,

    // Update user presence
    async updatePresence(status = 'online') {
        const userId = pb.authStore.model?.id;
        if (!userId) {
            return null;
        }

        try {
            // Get existing presence record
            const presenceRecords = await pb.collection('user_presence').getFullList({
                filter: `user = "${userId}"`,
                $autoCancel: false,
            });

            const existingPresence = presenceRecords[0] || null;

            const data = {
                user: userId,
                status,
                last_seen: new Date().toISOString(),
            };

            if (existingPresence) {
                const result = await pb.collection('user_presence').update(existingPresence.id, data);
                return result;
            } else {
                const result = await pb.collection('user_presence').create(data);
                return result;
            }
        } catch (error) {
            console.error('❌ Failed to update presence:', error);
            return null;
        }
    },

    // Start heartbeat
    startHeartbeat() {
        this.stopHeartbeat();

        // Initial update
        this.updatePresence('online');

        // Set up interval
        this.heartbeatInterval = setInterval(() => {
            this.updatePresence('online');
        }, HEARTBEAT_INTERVAL);
    },

    // Stop heartbeat
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        // Don't set offline - let it expire naturally
    },

    // Get online admins
    async getOnlineAdmins() {
        try {
            const presenceRecords = await pb.collection('user_presence').getFullList({
                expand: 'user',
            });

            const now = new Date().getTime();

            const onlineAdmins = presenceRecords
                .filter(record => {
                    const user = record.expand?.user;

                    if (!user || user.user_type !== 'admin') return false;

                    const lastSeen = new Date(record.last_seen).getTime();
                    const isRecent = (now - lastSeen) < ONLINE_THRESHOLD;
                    const isOnline = record.status === 'online';

                    return isRecent && isOnline;
                })
                .map(record => record.expand.user);

            return onlineAdmins;
        } catch (error) {
            console.error('Failed to get online admins:', error);
            return [];
        }
    },

    // Subscribe to presence changes
    subscribeToPresence(callback) {
        if (!callback) return null;

        try {
            return pb.collection('user_presence').subscribe('*', (e) => {
                callback(e);
            });
        } catch (error) {
            console.error('Failed to subscribe to presence:', error);
            return null;
        }
    },

    // Unsubscribe from presence
    async unsubscribe() {
        try {
            await pb.collection('user_presence').unsubscribe();
        } catch (error) {
            console.error('Failed to unsubscribe from presence:', error);
        }
    },
};

export default presenceService;
