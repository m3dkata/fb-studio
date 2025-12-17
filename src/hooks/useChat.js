import { useState, useEffect, useCallback } from 'react';
import chatService from '../services/chat';
import { useAuth } from './useAuth';

export const useChat = (recipientId) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load conversation
    const loadMessages = useCallback(async () => {
        if (!user || !recipientId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const msgs = await chatService.getConversation(user.id, recipientId);
            setMessages(msgs);
        } catch (err) {
            console.error('Failed to load messages:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user, recipientId]);

    // Load unread count
    const loadUnreadCount = useCallback(async () => {
        if (!user) return;

        try {
            const count = await chatService.getUnreadCount(user.id);
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to load unread count:', err);
        }
    }, [user]);

    // Send message
    const sendMessage = useCallback(async (content) => {
        if (!content?.trim() || !recipientId) return;

        try {
            await chatService.sendMessage(recipientId, content);
            // Don't add message here - real-time subscription will handle it
        } catch (err) {
            console.error('Failed to send message:', err);
            setError(err.message);
            throw err;
        }
    }, [recipientId]);

    // Mark message as read
    const markAsRead = useCallback(async (messageId) => {
        try {
            await chatService.markAsRead(messageId);
            // Update local state optimistically
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId ? { ...msg, read: true } : msg
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    }, []);


    useEffect(() => {
        if (!user) return;

        loadMessages();
        loadUnreadCount();

        let unsubscribeFunc;
        const setupSubscription = async () => {
            try {
                unsubscribeFunc = await chatService.subscribeToMessages(user.id, (e) => {
                    if (e.action === 'create') {
                        // Check if message is part of current conversation
                        const isFromRecipient = e.record.sender === recipientId && e.record.receiver === user.id;
                        const isToRecipient = e.record.sender === user.id && e.record.receiver === recipientId;

                        if (isFromRecipient || isToRecipient) {
                            setMessages(prev => {
                                // Prevent duplicates
                                if (prev.some(msg => msg.id === e.record.id)) return prev;
                                return [...prev, e.record];
                            });
                        }

                        // Update unread count
                        if (e.record.receiver === user.id && !e.record.read) {
                            setUnreadCount(prev => prev + 1);
                        }
                    } else if (e.action === 'update') {
                        setMessages(prev =>
                            prev.map(msg => msg.id === e.record.id ? e.record : msg)
                        );
                    }
                });
            } catch (err) {
                console.error('Failed to subscribe:', err);
            }
        };

        setupSubscription();

        return () => {
            if (unsubscribeFunc) {
                unsubscribeFunc();
            }
        };
    }, [user, recipientId, loadMessages, loadUnreadCount]);

    return {
        messages,
        unreadCount,
        loading,
        error,
        sendMessage,
        markAsRead,
        refreshMessages: loadMessages,
    };
};

export default useChat;
