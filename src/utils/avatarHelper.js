import pb from '../services/pocketbase';

// Helper function to get avatar URL from PocketBase
export const getAvatarUrl = (user) => {
    if (!user?.avatar) return null;
    return pb.files.getURL(user, user.avatar);
};

export default getAvatarUrl;
