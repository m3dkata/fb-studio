import { format, parseISO, isToday, isTomorrow, isPast, isFuture } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, formatStr);
    } catch (error) {
        return date;
    }
};

export const formatTime = (time) => {
    try {
        // Time is in HH:mm format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
        return time;
    }
};

export const formatDateTime = (date, time) => {
    return `${formatDate(date)} at ${formatTime(time)}`;
};

export const getRelativeDate = (date) => {
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;

        if (isToday(parsedDate)) {
            return 'Today';
        }

        if (isTomorrow(parsedDate)) {
            return 'Tomorrow';
        }

        return formatDate(parsedDate);
    } catch (error) {
        return formatDate(date);
    }
};

export const isBookingPast = (date, time) => {
    try {
        const bookingDateTime = parseISO(`${date}T${time}:00`);
        return isPast(bookingDateTime);
    } catch (error) {
        return false;
    }
};

export const isBookingFuture = (date, time) => {
    try {
        const bookingDateTime = parseISO(`${date}T${time}:00`);
        return isFuture(bookingDateTime);
    } catch (error) {
        return false;
    }
};

export const getTodayDate = () => {
    return format(new Date(), 'yyyy-MM-dd');
};

export const formatDateForInput = (date) => {
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, 'yyyy-MM-dd');
    } catch (error) {
        return getTodayDate();
    }
};

/**
 * Creates a Date object from booking date and time strings
 * @param {string} date - Date string (e.g., "2024-01-15" or "2024-01-15T00:00:00")
 * @param {string} time - Time string (e.g., "14:30")
 * @returns {Date} Combined date/time as Date object
 */
export const createBookingDateTime = (date, time) => {
    const dateStr = date.split('T')[0];
    return new Date(`${dateStr}T${time}`);
};

/**
 * Formats a booking object's date and time into a Date object
 * @param {Object} booking - Booking object with booking_date and booking_time
 * @returns {Date} Combined date/time as Date object
 */
export const formatBookingDate = (booking) => {
    return createBookingDateTime(booking.booking_date, booking.booking_time);
};

/**
 * Checks if a booking date/time is in the future
 * @param {Object} booking - Booking object with booking_date and booking_time
 * @returns {boolean} True if booking is in the future
 */
export const isBookingUpcoming = (booking) => {
    const bookingDate = formatBookingDate(booking);
    return bookingDate > new Date();
};
