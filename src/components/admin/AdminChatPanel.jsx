import React, { useState } from 'react';
import { MessageSquare, User } from 'lucide-react';
import ChatWindow from '../ui/ChatWindow';
import chatService from '../../services/chat';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';

const AdminChatPanel = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Load all conversations for admin
    useEffect(() => {
        if (!user) return;

        const loadConversations = async () => {
            try {
                // Get all messages where admin is sender or receiver
                const messages = await chatService.getConversation(user.id, user.id, 500);

                // Group by unique users
                const userMap = new Map();
                messages.forEach(msg => {
                    const otherUserId = msg.sender === user.id ? msg.receiver : msg.sender;
                    if (!userMap.has(otherUserId)) {
                        userMap.set(otherUserId, {
                            userId: otherUserId,
                            lastMessage: msg,
                            unreadCount: 0,
                        });
                    }

                    // Count unread messages
                    if (msg.receiver === user.id && !msg.read) {
                        userMap.get(otherUserId).unreadCount++;
                    }
                });

                setConversations(Array.from(userMap.values()));
            } catch (error) {
                console.error('Failed to load conversations:', error);
            }
        };

        loadConversations();

        // Subscribe to new messages
        const unsubscribe = chatService.subscribeToMessages(() => {
            loadConversations();
        });

        return () => {
            if (unsubscribe) {
                chatService.unsubscribeFromMessages();
            }
        };
    }, [user]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    User Messages
                </h2>
            </div>

            {conversations.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No messages yet
                </p>
            ) : (
                <div className="space-y-2">
                    {conversations.map((conv) => (
                        <button
                            key={conv.userId}
                            onClick={() => {
                                setSelectedUser({ id: conv.userId, name: 'User' });
                                setIsChatOpen(true);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    User {conv.userId.slice(0, 8)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {conv.lastMessage.content}
                                </p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                    {conv.unreadCount}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Chat Window */}
            {selectedUser && (
                <ChatWindow
                    admin={selectedUser}
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminChatPanel;
