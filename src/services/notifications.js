import pb from './pocketbase';

export const notificationsService = {
    
    async getAll(userId) {
        try {
            const records = await pb.collection('notifications').getFullList({
                filter: `user = "${userId}"`,
                sort: '-created',
                expand: 'booking',
            });
            return records;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            return [];
        }
    },

    
    async getUnreadCount(userId) {
        try {
            const result = await pb.collection('notifications').getList(1, 1, {
                filter: `user = "${userId}" && read = false`,
            });
            return result.totalItems;
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
            return 0;
        }
    },

    
    async markAsRead(id) {
        try {
            await pb.collection('notifications').update(id, {
                read: true,
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw error;
        }
    },

    
    async markAllAsRead(userId) {
        try {
            const unreadNotifications = await pb.collection('notifications').getFullList({
                filter: `user = "${userId}" && read = false`,
            });

            
            await Promise.all(
                unreadNotifications.map(notification =>
                    pb.collection('notifications').update(notification.id, { read: true })
                )
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            throw error;
        }
    },

    
    subscribe(userId, callback) {
        return pb.collection('notifications').subscribe('*', (e) => {
            if (e.record.user === userId) {
                callback(e);
            }
        });
    },

    
    async unsubscribe() {
        await pb.collection('notifications').unsubscribe();
    }
};

export default notificationsService;
