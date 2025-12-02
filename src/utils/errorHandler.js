/**
 * Application-specific error class with error codes
 */
export class AppError extends Error {
    constructor(message, code = 'UNKNOWN', originalError = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.originalError = originalError;

        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

/**
 * Common error codes
 */
export const ERROR_CODES = {
    // Authentication errors
    AUTH_FAILED: 'AUTH_FAILED',
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',

    // Permission errors
    PERMISSION_DENIED: 'PERMISSION_DENIED',

    // Resource errors
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',

    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',

    // Network errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',

    // Server errors
    SERVER_ERROR: 'SERVER_ERROR',

    // Unknown
    UNKNOWN: 'UNKNOWN',
};

/**
 * Handle service errors consistently
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if none can be extracted
 * @returns {never} - Throws an AppError
 */
export function handleServiceError(error, defaultMessage = 'An error occurred') {
    // If it's already an AppError, just rethrow it
    if (error instanceof AppError) {
        throw error;
    }

    // Extract error details from different error formats
    let message = defaultMessage;
    let code = ERROR_CODES.UNKNOWN;

    // PocketBase error format
    if (error.response?.data?.message) {
        message = error.response.data.message;
        code = getErrorCode(error.response.status);
    }
    // Standard error with message
    else if (error.message) {
        message = error.message;
    }

    throw new AppError(message, code, error);
}

/**
 * Map HTTP status codes to error codes
 * @param {number} status - HTTP status code
 * @returns {string} - Error code
 */
function getErrorCode(status) {
    switch (status) {
        case 400:
            return ERROR_CODES.INVALID_INPUT;
        case 401:
            return ERROR_CODES.AUTH_FAILED;
        case 403:
            return ERROR_CODES.PERMISSION_DENIED;
        case 404:
            return ERROR_CODES.NOT_FOUND;
        case 409:
            return ERROR_CODES.ALREADY_EXISTS;
        case 422:
            return ERROR_CODES.VALIDATION_ERROR;
        case 408:
        case 504:
            return ERROR_CODES.TIMEOUT;
        case 500:
        case 502:
        case 503:
            return ERROR_CODES.SERVER_ERROR;
        default:
            return ERROR_CODES.UNKNOWN;
    }
}

/**
 * Get user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly message
 */
export function getUserFriendlyMessage(error) {
    if (error instanceof AppError) {
        return error.message;
    }

    // Default user-friendly messages
    const friendlyMessages = {
        [ERROR_CODES.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
        [ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again.',
        [ERROR_CODES.SERVER_ERROR]: 'Server error occurred. Please try again later.',
        [ERROR_CODES.AUTH_FAILED]: 'Authentication failed. Please check your credentials.',
        [ERROR_CODES.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
        [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
    };

    if (error.code && friendlyMessages[error.code]) {
        return friendlyMessages[error.code];
    }

    return error.message || 'An unexpected error occurred';
}

/**
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 */
export function logError(error, context = '') {
    if (import.meta.env.DEV) {
        console.error(`[${context}]`, error);
        if (error instanceof AppError && error.originalError) {
            console.error('Original error:', error.originalError);
        }
    }
}
