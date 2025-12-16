import pb from './pocketbase';
import { USER_TYPES } from '../constants/userTypes';
import presenceService from './presence';

export const authService = {
    async login(email, password) {
        try {
            const authData = await pb.collection('users').authWithPassword(email, password);
            return authData;
        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    },

    async register(data) {
        try {
            const user = await pb.collection('users').create({
                email: data.email,
                password: data.password,
                passwordConfirm: data.passwordConfirm,
                name: data.name,
                phone: data.phone,
                user_type: 'user',
            });

            await this.login(data.email, data.password);
            return user;
        } catch (error) {
            throw new Error(error.message || 'Registration failed');
        }
    },

    async logout() {
        try {
            presenceService.stopHeartbeat();
            await pb.realtime.unsubscribe();
        } catch (error) {
            console.error('Error during logout:', error);
        }
        pb.authStore.clear();
    },

    // Get current user
    getCurrentUser() {
        return pb.authStore.model;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return pb.authStore.isValid;
    },

    // Check if user is admin
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.user_type === USER_TYPES.ADMIN;
    },

    // Refresh authentication
    async refresh() {
        try {
            await pb.collection('users').authRefresh();
            return pb.authStore.model;
        } catch (error) {
            this.logout();
            throw error;
        }
    },

    // Update user profile
    async updateProfile(userId, data) {
        try {
            const user = await pb.collection('users').update(userId, data);
            return user;
        } catch (error) {
            throw new Error(error.message || 'Profile update failed');
        }
    },

    // Subscribe to auth state changes
    onAuthChange(callback) {
        return pb.authStore.onChange((token, model) => {
            callback(model);
        });
    }
};

export default authService;
