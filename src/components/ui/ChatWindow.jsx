import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader } from 'lucide-react';
import ChatMessage from './ChatMessage';
import OnlineIndicator from './OnlineIndicator';
import useChat from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { getAvatarUrl } from '../../utils/avatarHelper';

const ChatWindow = ({ admin, isOpen, onClose }) => {
    const { user } = useAuth();
    const { messages, sendMessage, markAsRead, loading, error } = useChat(admin?.id);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Get admin avatar URL
    const adminAvatarUrl = getAvatarUrl(admin);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current && messages.length > 0) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Mark unread messages as read when window is open
    useEffect(() => {
        if (isOpen && messages.length > 0 && user) {
            messages.forEach(msg => {
                if (msg.receiver === user.id && !msg.read) {
                    markAsRead(msg.id);
                }
            });
        }
    }, [isOpen, messages, user, markAsRead]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(inputValue);
            setInputValue('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-20 sm:bottom-24 right-4 w-full sm:w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-[9998] border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {adminAvatarUrl ? (
                            <img
                                src={adminAvatarUrl}
                                alt={admin?.name || 'User'}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                                {admin?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1">
                            <OnlineIndicator isOnline={true} size="sm" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold">{admin?.name || 'Admin'}</h3>
                        <p className="text-xs text-primary-100">Online</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Close chat"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-500 dark:text-red-400 text-sm">
                        <p className="font-medium">Failed to load messages</p>
                        <p className="text-xs mt-1">{error}</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                        Start a conversation with {admin?.name || 'admin'}
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => {
                            const isOwn = msg.sender === user?.id;
                            const sender = isOwn ? user : admin;
                            return (
                                <ChatMessage
                                    key={msg.id}
                                    message={msg}
                                    isOwnMessage={isOwn}
                                    sender={sender}
                                />
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                        disabled={isSending || loading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isSending || loading}
                        className="p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full transition-colors disabled:cursor-not-allowed flex items-center justify-center"
                        aria-label="Send message"
                    >
                        {isSending ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
