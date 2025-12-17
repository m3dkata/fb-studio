import { useState, useEffect, useCallback } from 'react';
import chatService from '../services/chat';
import { useAuth } from './useAuth';

export const useAdminChat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [totalUnread, setTotalUnread] = useState(0);
    const [loading, setLoading] = useState(true);

    
    const loadConversations = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const allMessages = await chatService.getAllUserConversations(user.id);

            
            const userMap = new Map();
            let unreadCount = 0;

            allMessages.forEach(msg => {
                const otherUserId = msg.sender === user.id ? msg.receiver : msg.sender;
                const otherUser = msg.sender === user.id ? msg.expand?.receiver : msg.expand?.sender;

                if (!userMap.has(otherUserId)) {
                    userMap.set(otherUserId, {
                        userId: otherUserId,
                        userName: otherUser?.name || 'User',
                        userObject: otherUser, 
                        lastMessage: msg,
                        unreadCount: 0,
                    });
                }

                
                const existing = userMap.get(otherUserId);
                if (new Date(msg.created) > new Date(existing.lastMessage.created)) {
                    existing.lastMessage = msg;
                }

                
                if (msg.receiver === user.id && !msg.read) {
                    existing.unreadCount++;
                    unreadCount++;
                }
            });

            setConversations(Array.from(userMap.values()));
            setTotalUnread(unreadCount);
        } catch (error) {
            console.error('Failed to load conversations:', error);
            setConversations([]);
            setTotalUnread(0);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        loadConversations();

        
        const unsubscribe = chatService.subscribeToMessages(user.id, () => {
            loadConversations();
        });

        return () => {
            if (unsubscribe) {
                chatService.unsubscribe();
            }
        };
    }, [user, loadConversations]);

    return {
        conversations,
        totalUnread,
        loading,
        refresh: loadConversations,
    };
};

export default useAdminChat;
