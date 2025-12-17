import pb from './pocketbase';

export const chatService = {
    
    async sendMessage(receiverId, content) {
        if (!receiverId || !content?.trim()) {
            throw new Error('Receiver ID and content are required');
        }

        try {
            const message = await pb.collection('messages').create({
                sender: pb.authStore.model?.id,
                receiver: receiverId,
                content: content.trim(),
                read: false,
            });
            return message;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw new Error(error.message || 'Failed to send message');
        }
    },

    
    async getConversation(userId1, userId2, limit = 50) {
        if (!userId1 || !userId2) {
            throw new Error('Both user IDs are required');
        }

        try {
            const messages = await pb.collection('messages').getList(1, limit, {
                filter: `(sender = "${userId1}" && receiver = "${userId2}") || (sender = "${userId2}" && receiver = "${userId1}")`,
                sort: 'created',
                expand: 'sender,receiver',
            });
            return messages.items;
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
            throw new Error(error.message || 'Failed to fetch conversation');
        }
    },

    
    async getAllUserConversations(userId, limit = 500) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            const messages = await pb.collection('messages').getList(1, limit, {
                filter: `sender = "${userId}" || receiver = "${userId}"`,
                sort: '-created',
                expand: 'sender,receiver',
            });
            return messages.items;
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            throw new Error(error.message || 'Failed to fetch conversations');
        }
    },

    
    async markAsRead(messageId) {
        if (!messageId) return;

        try {
            await pb.collection('messages').update(messageId, { read: true });
        } catch (error) {
            console.error('Failed to mark message as read:', error);
            
        }
    },

    
    async getUnreadCount(userId) {
        if (!userId) return 0;

        try {
            const result = await pb.collection('messages').getList(1, 1, {
                filter: `receiver = "${userId}" && read = false`,
            });
            return result.totalItems;
        } catch (error) {
            console.error('Failed to get unread count:', error);
            return 0;
        }
    },

    
    subscribeToMessages(userId, callback) {
        if (!userId || !callback) return null;

        try {
            return pb.collection('messages').subscribe('*', (e) => {
                
                if (e.record.sender === userId || e.record.receiver === userId) {
                    callback(e);
                }
            });
        } catch (error) {
            console.error('Failed to subscribe to messages:', error);
            return null;
        }
    },

    
    async unsubscribe() {
        try {
            await pb.collection('messages').unsubscribe();
        } catch (error) {
            console.error('Failed to unsubscribe from messages:', error);
        }
    },
};

export default chatService;
