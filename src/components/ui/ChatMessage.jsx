import React from 'react';
import { Check, CheckCheck, User } from 'lucide-react';
import { format } from 'date-fns';
import { getAvatarUrl } from '../../utils/avatarHelper';

const ChatMessage = ({ message, isOwnMessage, sender }) => {
    const formattedTime = format(new Date(message.created), 'HH:mm');

    // Get avatar URL from PocketBase
    const avatarUrl = getAvatarUrl(sender);

    return (
        <div className={`flex mb-3 gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className="flex-shrink-0">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={sender?.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOwnMessage
                        ? 'bg-blue-600 dark:bg-blue-700 text-white'
                        : 'bg-gray-400 dark:bg-gray-600 text-white'
                        }`}>
                        <User className="w-4 h-4" />
                    </div>
                )}
            </div>

            {/* Message bubble */}
            <div className="flex flex-col max-w-[70%]">
                <div
                    className={`rounded-2xl px-4 py-2 shadow-sm ${isOwnMessage
                        ? 'bg-blue-600 dark:bg-blue-700 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                >
                    <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage
                        ? 'text-blue-100 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-400'
                        }`}>
                        <span>{formattedTime}</span>
                        {isOwnMessage && (
                            <span className="ml-1">
                                {message.read ? (
                                    <CheckCheck className="w-3 h-3" />
                                ) : (
                                    <Check className="w-3 h-3" />
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
