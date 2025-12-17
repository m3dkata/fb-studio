import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import useAdminChat from '../../hooks/useAdminChat';
import usePresence from '../../hooks/usePresence';
import { useAuth } from '../../hooks/useAuth';
import { getAvatarUrl } from '../../utils/avatarHelper';

const AdminChatWidget = () => {
    const { user } = useAuth();
    const { conversations, totalUnread, loading } = useAdminChat();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    
    usePresence();

    if (!user) return null;

    return (
        <>
            { }
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-primary fixed bottom-4 right-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center z-[9999] group"
                aria-label="Open user messages"
            >
                <MessageSquare className="w-6 h-6" />

                { }
                {totalUnread > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </div>
                )}

                { }
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    User Messages {totalUnread > 0 && `(${totalUnread})`}
                </div>
            </button>

            { }
            {isOpen && (
                selectedUser ? (
                    <ChatWindow
                        admin={selectedUser}
                        isOpen={true}
                        onClose={() => {
                            setSelectedUser(null);
                            setIsOpen(false);
                        }}
                    />
                ) : (
                    <div className="fixed bottom-20 sm:bottom-24 right-4 w-full sm:w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-[9998] border border-gray-200 dark:border-gray-700">
                        { }
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl bg-primary text-white">
                            <h3 className="font-semibold">User Messages</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        { }
                        <div className="flex-1 overflow-y-auto p-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                                    <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                                    <p>No messages yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {conversations.map((conv) => {
                                        const avatarUrl = getAvatarUrl(conv.userObject);

                                        return (
                                            <button
                                                key={conv.userId}
                                                onClick={() => setSelectedUser(conv.userObject)}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                            >
                                                {avatarUrl ? (
                                                    <img
                                                        src={avatarUrl}
                                                        alt={conv.userName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-semibold text-primary-600">
                                                        {conv.userName[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {conv.userName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {conv.lastMessage.content}
                                                    </p>
                                                </div>
                                                {conv.unreadCount > 0 && (
                                                    <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                                        {conv.unreadCount}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )
            )}
        </>
    );
};

export default AdminChatWidget;
