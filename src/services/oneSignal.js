/**
 * OneSignal Service
 * Handles push notifications via OneSignal Web SDK
 * Note: OneSignal is initialized in index.html
 */

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || 'ff3875e9-9d42-4818-ac3f-3f6fc56f08a8';
const ONESIGNAL_API_KEY = import.meta.env.VITE_ONESIGNAL_API_KEY;

export const oneSignalService = {
    /**
     * Check if OneSignal is available
     */
    isAvailable() {
        return typeof window !== 'undefined' && window.OneSignal;
    },

    /**
     * Login user to OneSignal (associate with external ID)
     * @param {string} userId - The user's ID from PocketBase
     */
    async login(userId) {
        if (!this.isAvailable()) {
            console.warn('OneSignal: Not available');
            return;
        }

        try {
            await window.OneSignal.login(userId);
            console.log('OneSignal: User logged in', userId);
        } catch (error) {
            console.error('OneSignal login failed:', error);
        }
    },

    /**
     * Logout user from OneSignal
     */
    async logout() {
        if (!this.isAvailable()) {
            return;
        }

        try {
            await window.OneSignal.logout();
            console.log('OneSignal: User logged out');
        } catch (error) {
            console.error('OneSignal logout failed:', error);
        }
    },

    /**
     * Send a notification via OneSignal REST API
     * @param {Object} options - Notification options
     * @param {string} options.headings - Notification title
     * @param {string} options.contents - Notification body
     * @param {Array<string>} options.include_external_user_ids - Array of user IDs to send to
     * @param {Object} options.data - Additional data payload
     */
    async sendNotification({ headings, contents, include_external_user_ids, data = {} }) {
        if (!ONESIGNAL_API_KEY) {
            console.warn('OneSignal: API Key not configured');
            return null;
        }

        try {
            const response = await fetch('https://onesignal.com/api/v1/notifications', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
                },
                body: JSON.stringify({
                    app_id: ONESIGNAL_APP_ID,
                    include_external_user_ids: include_external_user_ids,
                    headings: { en: headings },
                    contents: { en: contents },
                    data: data,
                }),
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(JSON.stringify(result.errors));
            }

            console.log('OneSignal: Notification sent', result);
            return result;
        } catch (error) {
            console.error('OneSignal: Send notification failed:', error);
            return null;
        }
    },

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            const permission = await window.OneSignal.Notifications.requestPermission();
            return permission;
        } catch (error) {
            console.error('OneSignal: Permission request failed:', error);
            return false;
        }
    },

    /**
     * Check if user has granted notification permission
     */
    async hasPermission() {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            const permission = await window.OneSignal.Notifications.permission;
            return permission;
        } catch (error) {
            console.error('OneSignal: Permission check failed:', error);
            return false;
        }
    }
};

export default oneSignalService;
