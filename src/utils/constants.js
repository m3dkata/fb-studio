export const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

export const SERVICE_CATEGORIES = {
    MAKEUP: 'makeup',
    LASHES: 'lashes',
    BROWS: 'brows',
};

export const NOTIFICATION_TYPES = {
    BOOKING_CONFIRMED: 'booking_confirmed',
    BOOKING_CANCELLED: 'booking_cancelled',
    BOOKING_COMPLETED: 'booking_completed',
    SYSTEM: 'system',
};

export const USER_TYPES = {
    USER: 'user',
    ADMIN: 'admin',
};

export const CATEGORY_LABELS = {
    [SERVICE_CATEGORIES.MAKEUP]: 'Makeup',
    [SERVICE_CATEGORIES.LASHES]: 'Lash Extensions',
    [SERVICE_CATEGORIES.BROWS]: 'Brow Treatments',
};

export const STATUS_LABELS = {
    [BOOKING_STATUS.PENDING]: 'Pending',
    [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
    [BOOKING_STATUS.COMPLETED]: 'Completed',
    [BOOKING_STATUS.CANCELLED]: 'Cancelled',
};

export const STATUS_COLORS = {
    [BOOKING_STATUS.PENDING]: 'warning',
    [BOOKING_STATUS.CONFIRMED]: 'info',
    [BOOKING_STATUS.COMPLETED]: 'success',
    [BOOKING_STATUS.CANCELLED]: 'error',
};
