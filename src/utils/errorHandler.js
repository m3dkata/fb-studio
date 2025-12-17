 
export class AppError extends Error {
    constructor(message, code = 'UNKNOWN', originalError = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.originalError = originalError;

        
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

 
export const ERROR_CODES = {
    
    AUTH_FAILED: 'AUTH_FAILED',
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',

    
    PERMISSION_DENIED: 'PERMISSION_DENIED',

    
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',

    
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',

    
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',

    
    SERVER_ERROR: 'SERVER_ERROR',

    
    UNKNOWN: 'UNKNOWN',
};

 
export function handleServiceError(error, defaultMessage = 'An error occurred') {
    
    if (error instanceof AppError) {
        throw error;
    }

    
    let message = defaultMessage;
    let code = ERROR_CODES.UNKNOWN;

    
    if (error.response?.data?.message) {
        message = error.response.data.message;
        code = getErrorCode(error.response.status);
    }
    
    else if (error.message) {
        message = error.message;
    }

    throw new AppError(message, code, error);
}

 
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

 
export function getUserFriendlyMessage(error) {
    if (error instanceof AppError) {
        return error.message;
    }

    
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

 
export function logError(error, context = '') {
    if (import.meta.env.DEV) {
        console.error(`[${context}]`, error);
        if (error instanceof AppError && error.originalError) {
            console.error('Original error:', error.originalError);
        }
    }
}
