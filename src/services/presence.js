import pb from './pocketbase';

const HEARTBEAT_INTERVAL = 30000;

export const presenceService = {
    heartbeatInterval: null,
    currentPresenceId: null,

    
    async updatePresence(status = 'online') {
        const userId = pb.authStore.model?.id;
        if (!userId) {
            return null;
        }

        try {
            let recordId = this.currentPresenceId;

            
            if (!recordId) {
                const presenceRecords = await pb.collection('user_presence').getFullList({
                    filter: `user = "${userId}"`,
                    $autoCancel: false,
                });

                if (presenceRecords.length > 0) {
                    recordId = presenceRecords[0].id;
                    this.currentPresenceId = recordId;
                }
            }

            if (recordId) {
                
                try {
                    const updateData = {
                        status,
                        last_seen: new Date().toISOString(),
                    };
                    return await pb.collection('user_presence').update(recordId, updateData);
                } catch (updateError) {
                    
                    if (updateError.status === 400) {
                        console.warn('Update failed with last_seen, retrying with status only...', updateError.response);
                        return await pb.collection('user_presence').update(recordId, { status });
                    }
                    throw updateError;
                }
            } else {
                
                const createData = {
                    user: userId,
                    status,
                    last_seen: new Date().toISOString(),
                };
                const result = await pb.collection('user_presence').create(createData);
                this.currentPresenceId = result.id;
                return result;
            }
        } catch (error) {
            console.error('Failed to update presence:', error);
            console.error('Error details:', error.response?.data);
            if (error.status === 404) {
                this.currentPresenceId = null; 
            }
            return null;
        }
    },

    
    startHeartbeat() {
        this.stopHeartbeat();

        
        this.updatePresence('online');

        
        this.heartbeatInterval = setInterval(() => {
            this.updatePresence('online');
        }, HEARTBEAT_INTERVAL);
    },

    
    async stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }

        const userId = pb.authStore.model?.id;
        if (userId && this.currentPresenceId) {
            try {
                await pb.collection('user_presence').update(this.currentPresenceId, {
                    status: 'offline',
                    last_seen: new Date().toISOString(),
                });
            } catch (error) {
                console.error('Failed to set offline status:', error);
            }
        }
        this.currentPresenceId = null;
    },

    
    async getOnlineAdmins() {
        try {
            const presenceRecords = await pb.collection('user_presence').getFullList({
                expand: 'user',
            });

            const onlineAdmins = presenceRecords
                .filter(record => {
                    const user = record.expand?.user;
                    if (!user || user.user_type !== 'admin') return false;
                    return record.status === 'online';
                })
                .map(record => record.expand.user);

            return onlineAdmins;
        } catch (error) {
            console.error('Failed to get online admins:', error);
            return [];
        }
    },

    
    async getUserStatus(userId) {
        if (!userId) return 'offline';
        try {
            const records = await pb.collection('user_presence').getFullList({
                filter: `user = "${userId}"`,
                sort: '-created',
                $autoCancel: false,
            });

            if (records.length > 0) {
                return records[0].status || 'offline';
            }
            return 'offline';
        } catch (error) {
            console.error('Failed to get user status:', error);
            return 'offline';
        }
    },

    
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

    
    async unsubscribe() {
        try {
            await pb.collection('user_presence').unsubscribe();
        } catch (error) {
            console.error('Failed to unsubscribe from presence:', error);
        }
    },
};

export default presenceService;
