import { format, parse } from 'date-fns';

// Helper to create a proper Date object from booking date and time
const createBookingDateTime = (bookingDate, bookingTime) => {
    if (!bookingDate || !bookingTime) {
        throw new Error('Missing booking date or time');
    }

    try {
        // Handle if bookingDate is already a Date object
        let dateStr = '';
        if (bookingDate instanceof Date) {
            dateStr = bookingDate.toISOString().split('T')[0];
        } else {
            // Ensure string
            dateStr = String(bookingDate);
        }

        // Extract YYYY-MM-DD using regex to be safe against time parts
        // Matches 2024-01-01
        const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!dateMatch) {
            throw new Error(`Could not parse date from: ${bookingDate}`);
        }

        const [_, year, month, day] = dateMatch;

        // Extract HH:MM
        const timeMatch = String(bookingTime).match(/^(\d{2}):(\d{2})/);
        if (!timeMatch) {
            throw new Error(`Could not parse time from: ${bookingTime}`);
        }

        const [__, hours, minutes] = timeMatch;

        // Construct date explicitly (months are 0-indexed in JS Date)
        const date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes),
            0
        );

        if (isNaN(date.getTime())) {
            throw new Error('Resulting date is invalid');
        }

        return date;
    } catch (error) {
        console.error('Date parsing error:', error);
        throw new Error(`Invalid date created from ${bookingDate} and ${bookingTime}: ${error.message}`);
    }
};

// Format date for calendar URLs (YYYYMMDDTHHmmssZ)
const formatForCalendar = (date) => {
    if (!date || isNaN(date.getTime())) {
        throw new Error('Invalid date provided to formatForCalendar');
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Create Google Calendar URL
export const getGoogleCalendarUrl = (booking, service) => {
    if (!booking || !service) return null;

    const title = `${service.title || 'Service'} - FB Studio`;
    const description = service.description?.replace(/<[^>]*>/g, '') || 'Booking at FB Studio';
    const location = 'FB Studio';

    const startDate = createBookingDateTime(booking.booking_date, booking.booking_time);
    const duration = service.duration || 60;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const start = formatForCalendar(startDate);
    const end = formatForCalendar(endDate);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
};

// Download ICS file
export const downloadICS = (booking, service) => {
    try {
        if (!booking || !service) {
            throw new Error('Missing booking or service details');
        }

        const title = `${service.title || 'Service'} - FB Studio`;
        const description = service.description?.replace(/<[^>]*>/g, '') || 'Booking at FB Studio';
        const location = 'FB Studio';

        // Create proper date objects
        const startDate = createBookingDateTime(booking.booking_date, booking.booking_time);
        const duration = service.duration || 60;
        const endDate = new Date(startDate.getTime() + duration * 60000);

        // Format for ICS
        const start = formatForCalendar(startDate);
        const end = formatForCalendar(endDate);

        // Create ICS content
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FB Studio//Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${booking.id}@fbstudio.com
DTSTAMP:${formatForCalendar(new Date())}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

        // Create blob and download
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `fb-studio-${(service.title || 'booking').toLowerCase().replace(/\s+/g, '-')}-${booking.booking_date}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        setTimeout(() => window.URL.revokeObjectURL(link.href), 100);
        return true;
    } catch (error) {
        console.error('Failed to download ICS:', error);
        throw error;
    }
};

// Deprecated: kept for backward compatibility but warns
export const addToCalendar = (booking, service) => {
    console.warn('addToCalendar is deprecated. Use CalendarExportModal instead.');
    downloadICS(booking, service);
};

export default {
    getGoogleCalendarUrl,
    downloadICS,
    addToCalendar
};
