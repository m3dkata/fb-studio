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

 
export const createBookingDateTime = (date, time) => {
    const dateStr = date.split('T')[0];
    return new Date(`${dateStr}T${time}`);
};

 
export const formatBookingDate = (booking) => {
    return createBookingDateTime(booking.booking_date, booking.booking_time);
};

 
export const isBookingUpcoming = (booking) => {
    const bookingDate = formatBookingDate(booking);
    return bookingDate > new Date();
};
