import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import OnlineIndicator from './OnlineIndicator';
import usePresence from '../../hooks/usePresence';
import useChat from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { getAvatarUrl } from '../../utils/avatarHelper';

const ChatWidget = () => {
    const { user, isAdmin } = useAuth();
    const { firstOnlineAdmin, hasOnlineAdmin, loading: presenceLoading } = usePresence();
    const { unreadCount } = useChat(firstOnlineAdmin?.id);
    const [isOpen, setIsOpen] = useState(false);

    
    const adminAvatarUrl = getAvatarUrl(firstOnlineAdmin);

    
    if (!user) return null;

    
    if (isAdmin()) return null;

    
    if (!hasOnlineAdmin) return null;

    return (
        <>
            { }
            <div className="fixed bottom-4 right-4 z-[9999]">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="btn-primary relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center group overflow-hidden"
                    aria-label="Open chat with admin"
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        { }
                        {adminAvatarUrl ? (
                            <img
                                src={adminAvatarUrl}
                                alt={firstOnlineAdmin.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
                                {firstOnlineAdmin?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                        )}

                        { }
                        {unreadCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                        )}
                    </div>

                    { }
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Chat with {firstOnlineAdmin?.name || 'Admin'}
                    </div>
                </button>

                { }
                <div className="absolute bottom-0 right-0 rounded-full p-0.5">
                    <OnlineIndicator isOnline={true} size="sm" />
                </div>
            </div>

            { }
            <ChatWindow
                admin={firstOnlineAdmin}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};

export default ChatWidget;
