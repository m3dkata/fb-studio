import pb from './pocketbase';
import { format, parseISO } from 'date-fns';


export const bookingsService = {
    
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

    
    async create(data) {
        try {
            
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

            
            await this.notifyAdmin(record);

            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to create booking');
        }
    },

    
    async update(id, data) {
        try {
            const record = await pb.collection('bookings').update(id, data);
            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to update booking');
        }
    },

    
    async updateStatus(id, status, userId) {
        try {
            const record = await pb.collection('bookings').update(id, { status });

            
            await this.notifyUser(record, status, userId);

            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to update booking status');
        }
    },

    
    async delete(id) {
        try {
            await pb.collection('bookings').delete(id);
        } catch (error) {
            throw new Error(error.message || 'Failed to delete booking');
        }
    },

    
    async checkAvailability(serviceId, date, time) {
        try {
            
            const existingBookings = await pb.collection('bookings').getFullList({
                filter: `service = "${serviceId}" && booking_date = "${date}" && booking_time = "${time}" && status != "cancelled"`,
            });

            if (existingBookings.length > 0) {
                return false;
            }

            
            
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

    
    
    async getAvailableSlots(serviceId, date) {
        try {
            
            const timeToMinutes = (timeStr) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            };

            
            const slots = [];
            for (let hour = 5; hour < 18; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    slots.push(time);
                }
            }

            
            
            
            
            
            const [service, existingBookings, unavailableSlots] = await Promise.all([
                pb.collection('services').getOne(serviceId),
                
                
                pb.collection('bookings').getFullList({
                    filter: `booking_date >= "${date} 00:00:00" && booking_date <= "${date} 23:59:59" && status != "cancelled"`,
                    expand: 'service', 
                }),
                
                
                pb.collection('unavailable_slots').getFullList({
                    filter: `service ~ "${serviceId}" && date_start <= "${date} 23:59:59" && date_end >= "${date} 00:00:00"`,
                })
            ]);

            
            const isDateBlocked = unavailableSlots.length > 0;

            
            
            const occupiedSlots = new Set();


            for (const booking of existingBookings) {
                
                const serviceDuration = booking.expand?.service?.duration || service.duration;
                const startTimeMinutes = timeToMinutes(booking.booking_time);
                const endTimeMinutes = startTimeMinutes + serviceDuration;


                
                for (const slot of slots) {
                    const slotMinutes = timeToMinutes(slot);
                    
                    
                    if (slotMinutes < endTimeMinutes && startTimeMinutes < slotMinutes + 30) {
                        occupiedSlots.add(slot);

                    }
                }
            }


            
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

    
    async notifyAdmin(booking) {
        try {
            
            const admins = await pb.collection('users').getFullList({
                filter: 'user_type = "admin"',
            });

            
            const bookingDetails = await this.getById(booking.id);
            const userName = bookingDetails.expand?.user?.name || 'A user';
            const serviceName = bookingDetails.expand?.service?.title || 'a service';
            const dateStr = format(parseISO(booking.booking_date), 'MMM dd, yyyy');
            const timeStr = booking.booking_time;

            
            const adminIds = [];
            for (const admin of admins) {
                if (admin.id === booking.user) continue;
                adminIds.push(admin.id);

                await pb.collection('notifications').create({
                    user: admin.id,
                    title: 'New Booking',
                    message: `${userName} booked ${serviceName} on ${dateStr} at ${timeStr}`,
                    type: 'system',
                    related_booking: booking.id,
                    read: false,
                });
            }

        } catch (error) {
            console.error('Failed to notify admin:', error);
        }
    },

    
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
                
                await pb.collection('notifications').create({
                    user: userId,
                    title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                    message: messages[status],
                    type: types[status],
                    related_booking: booking.id,
                    read: false,
                });
            }
        } catch (error) {
            console.error('Failed to notify user:', error);
        }
    },

    
    subscribe(callback) {
        return pb.collection('bookings').subscribe('*', (e) => {
            callback(e);
        });
    },

    
    async unsubscribe() {
        await pb.collection('bookings').unsubscribe();
    }
};

export default bookingsService;
