import pb from '../services/pocketbase';


export const getAvatarUrl = (user) => {
    if (!user?.avatar) return null;
    return pb.files.getURL(user, user.avatar);
};

export default getAvatarUrl;
