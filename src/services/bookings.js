import pb from './pocketbase';
import { format, parseISO } from 'date-fns';
import oneSignalService from './oneSignal';

export const bookingsService = {
    // Get all bookings (admin) or user's bookings
    async getAll(filter = {}) {
        try {
            const filterQuery = [];

            if (filter.userId) {
                filterQuery.push(`user = "${filter.userId}"`);
            }

            if (filter.status) {
                filterQuery.push(`status = "${filter.status}"`);
            }

            if (filter.date) {
                filterQuery.push(`booking_date = "${filter.date}"`);
            }

            const records = await pb.collection('bookings').getFullList({
                filter: filterQuery.length > 0 ? filterQuery.join(' && ') : '',
                sort: '-booking_date,-booking_time',
                expand: 'user,service',
            });

            return records;
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch bookings');
        }
    },

    // Get single booking by ID
    async getById(id) {
        try {
            const record = await pb.collection('bookings').getOne(id, {
                expand: 'user,service',
            });
            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch booking');
        }
    },

    // Create new booking
    async create(data) {
        try {
            // Check availability before creating
            const isAvailable = await this.checkAvailability(
                data.service,
                data.booking_date,
                data.booking_time
            );

            if (!isAvailable) {
                throw new Error('This time slot is not available');
            }

            const record = await pb.collection('bookings').create({
                user: data.user,
                service: data.service,
                booking_date: data.booking_date,
                booking_time: data.booking_time,
                status: 'pending',
                notes: data.notes || '',
            });

            // Create notification for admin
            await this.notifyAdmin(record);

            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to create booking');
        }
    },

    // Update booking
    async update(id, data) {
        try {
            const record = await pb.collection('bookings').update(id, data);
            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to update booking');
        }
    },

    // Update booking status (admin only)
    async updateStatus(id, status, userId) {
        try {
            const record = await pb.collection('bookings').update(id, { status });

            // Create notification for user
            await this.notifyUser(record, status, userId);

            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to update booking status');
        }
    },

    // Delete booking (admin only)
    async delete(id) {
        try {
            await pb.collection('bookings').delete(id);
        } catch (error) {
            throw new Error(error.message || 'Failed to delete booking');
        }
    },

    // Check if time slot is available
    async checkAvailability(serviceId, date, time) {
        try {
            // Check for existing bookings
            const existingBookings = await pb.collection('bookings').getFullList({
                filter: `service = "${serviceId}" && booking_date = "${date}" && booking_time = "${time}" && status != "cancelled"`,
            });

            if (existingBookings.length > 0) {
                return false;
            }

            // Check for unavailable slots - using date_start and date_end as DATE fields
            // We need to extract just the date part for comparison
            const unavailableSlots = await pb.collection('unavailable_slots').getFullList({
                filter: `service ~ "${serviceId}" && date_start <= "${date} 23:59:59" && date_end >= "${date} 00:00:00"`,
            });

            if (unavailableSlots.length > 0) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Availability check failed:', error);
            return false;
        }
    },

    // Get available time slots for a service on a specific date
    // OPTIMIZED: Makes only 3 API calls instead of 50+
    async getAvailableSlots(serviceId, date) {
        try {
            // Helper function to convert time string to minutes since midnight
            const timeToMinutes = (timeStr) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            };

            // Generate time slots (5 AM to 6 PM, every 30 minutes)
            const slots = [];
            for (let hour = 5; hour < 18; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    slots.push(time);
                }
            }

            // PERFORMANCE OPTIMIZATION: Fetch all data in parallel with just 3 API calls
            // Old way: 26 slots × 2 calls each = 52+ API calls (10-13 seconds)
            // New way: 3 API calls total (under 1 second)
            // FIX: PocketBase stores dates with timestamps (e.g., "2025-11-28 00:00:00.000Z")
            // We need to use date range comparison instead of exact match
            const [service, existingBookings, unavailableSlots] = await Promise.all([
                pb.collection('services').getOne(serviceId),
                // Fetch ALL bookings for the date (not just for this service)
                // This prevents double-bookings across different services
                pb.collection('bookings').getFullList({
                    filter: `booking_date >= "${date} 00:00:00" && booking_date <= "${date} 23:59:59" && status != "cancelled"`,
                    expand: 'service', // Need service info for duration
                }),
                // FIX: Add time component to handle datetime fields properly
                // Database stores '2025-12-24 00:00:00.000Z' so we need to compare with time
                pb.collection('unavailable_slots').getFullList({
                    filter: `service ~ "${serviceId}" && date_start <= "${date} 23:59:59" && date_end >= "${date} 00:00:00"`,
                })
            ]);

            // Check if entire date is blocked
            const isDateBlocked = unavailableSlots.length > 0;

            // DURATION-AWARE BOOKING CONFLICT DETECTION
            // Create a Set of all time slots that are occupied by bookings
            const occupiedSlots = new Set();


            for (const booking of existingBookings) {
                // Get the service duration for this booking
                const serviceDuration = booking.expand?.service?.duration || service.duration;
                const startTimeMinutes = timeToMinutes(booking.booking_time);
                const endTimeMinutes = startTimeMinutes + serviceDuration;


                // Mark all slots that overlap with this booking as occupied
                for (const slot of slots) {
                    const slotMinutes = timeToMinutes(slot);
                    // A slot is occupied if it starts before the booking ends
                    // and the booking starts before the slot ends (slot + 30 min)
                    if (slotMinutes < endTimeMinutes && startTimeMinutes < slotMinutes + 30) {
                        occupiedSlots.add(slot);

                    }
                }
            }


            // Map slots to availability (in-memory, super fast!)
            const availableSlots = slots.map(slot => ({
                time: slot,
                available: !isDateBlocked && !occupiedSlots.has(slot)
            }));

            return availableSlots;
        } catch (error) {
            console.error('Failed to fetch available slots:', error);
            throw new Error(error.message || 'Failed to fetch available slots');
        }
    },

    // Get booking statistics for user dashboard
    async getStats(userId) {
        try {
            const allBookings = await this.getAll({ userId });

            return {
                total: allBookings.length,
                pending: allBookings.filter(b => b.status === 'pending').length,
                confirmed: allBookings.filter(b => b.status === 'confirmed').length,
                completed: allBookings.filter(b => b.status === 'completed').length,
                cancelled: allBookings.filter(b => b.status === 'cancelled').length,
            };
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch booking stats');
        }
    },

    // Notify admin about new booking
    async notifyAdmin(booking) {
        try {
            // Get all admin users
            const admins = await pb.collection('users').getFullList({
                filter: 'user_type = "admin"',
            });

            // Get booking details
            const bookingDetails = await this.getById(booking.id);
            const userName = bookingDetails.expand?.user?.name || 'A user';
            const serviceName = bookingDetails.expand?.service?.title || 'a service';
            const dateStr = format(parseISO(booking.booking_date), 'MMM dd, yyyy');
            const timeStr = booking.booking_time;

            // 1. Internal App Notification (PocketBase)
            const adminIds = [];
            for (const admin of admins) {
                if (admin.id === booking.user) continue;
                adminIds.push(admin.id);

                await pb.collection('notifications').create({
                    user: admin.id,
                    title: 'New Booking',
                    message: `${userName} booked ${serviceName} on ${dateStr} at ${timeStr}`,
                    type: 'system',
                    booking: booking.id,
                    related_id: booking.id,
                    read: false,
                });
            }

            // 2. External Push Notification (OneSignal)
            if (adminIds.length > 0) {
                await oneSignalService.sendNotification({
                    headings: 'New Booking Request 📅',
                    contents: `${userName} wants to book ${serviceName}\n${dateStr} @ ${timeStr}`,
                    include_external_user_ids: adminIds,
                    data: { url: '/admin/bookings' }
                });
            }

        } catch (error) {
            console.error('Failed to notify admin:', error);
        }
    },

    // Notify user about booking status change
    async notifyUser(booking, status, userId) {
        try {
            const messages = {
                confirmed: 'Your booking has been confirmed!',
                cancelled: 'Your booking has been cancelled.',
                completed: 'Your booking has been completed. Thank you!',
            };

            const types = {
                confirmed: 'booking_confirmed',
                cancelled: 'booking_cancelled',
                completed: 'booking_completed',
            };

            if (messages[status]) {
                // 1. Internal App Notification
                await pb.collection('notifications').create({
                    user: userId,
                    title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                    message: messages[status],
                    type: types[status],
                    booking: booking.id,
                    related_id: booking.id,
                    read: false,
                });

                // 2. External Push Notification (OneSignal)
                await oneSignalService.sendNotification({
                    headings: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                    contents: messages[status],
                    include_external_user_ids: [userId],
                    data: { url: '/bookings' }
                });
            }
        } catch (error) {
            console.error('Failed to notify user:', error);
        }
    },

    // Subscribe to bookings changes
    subscribe(callback) {
        return pb.collection('bookings').subscribe('*', (e) => {
            callback(e);
        });
    },

    // Unsubscribe from bookings changes
    async unsubscribe() {
        await pb.collection('bookings').unsubscribe();
    }
};

export default bookingsService;
