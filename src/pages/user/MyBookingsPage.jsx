import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBookings } from '../../hooks/useBookings';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { STATUS_LABELS, STATUS_COLORS, BOOKING_STATUS } from '../../utils/constants';
import { formatDate, formatTime } from '../../utils/dateHelpers';
import { addToCalendar, downloadICS } from '../../utils/calendar';
import { Calendar, Clock, MapPin, Download, ExternalLink, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import CalendarExportModal from '../../components/ui/CalendarExportModal';

const MyBookingsPage = () => {
    const { user } = useAuth();
    const [filterStatus, setFilterStatus] = useState('all');
    const [calendarModalOpen, setCalendarModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const { data: bookings, isLoading } = useBookings({
        userId: user.id,
        status: filterStatus !== 'all' ? filterStatus : undefined
    });

    const handleAddToCalendar = (booking) => {
        setSelectedBooking(booking);
        setCalendarModalOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-8 relative">
            <CalendarExportModal
                isOpen={calendarModalOpen}
                onClose={() => setCalendarModalOpen(false)}
                booking={selectedBooking}
                service={selectedBooking?.expand?.service}
            />
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-[100px] animate-float" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">My <span className="text-gradient">Bookings</span></h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your upcoming and past appointments</p>
                </div>

                <div className="glass p-1.5 rounded-xl flex space-x-1 overflow-x-auto max-w-full">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${filterStatus === 'all'
                            ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        All
                    </button>
                    {Object.values(BOOKING_STATUS).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${filterStatus === status
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white font-bold'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            {STATUS_LABELS[status]}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : bookings?.length === 0 ? (
                <div className="text-center py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CalendarDays className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookings found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">You haven't made any bookings matching this filter yet. Start your beauty journey today!</p>
                    <Link to="/services">
                        <Button size="lg" className="shadow-xl shadow-primary/20">Book Your First Appointment</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <Card key={booking.id} className="overflow-visible hover:shadow-xl transition-shadow duration-300 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex items-start space-x-6">
                                        {/* Date Box */}
                                        <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-primary/30">
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-90">{format(new Date(booking.booking_date), 'MMM')}</span>
                                            <span className="text-3xl font-bold">{format(new Date(booking.booking_date), 'dd')}</span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-grow">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
                                                    {booking.expand?.service?.title}
                                                </h3>
                                                <Badge variant={STATUS_COLORS[booking.status]} className="text-xs px-2 py-0.5">
                                                    {STATUS_LABELS[booking.status]}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2 text-primary" />
                                                    <span className="font-medium">{formatTime(booking.booking_time)}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{booking.expand?.service?.duration} mins</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                                                    <span>FB Studio, Fashion District NY</span>
                                                </div>
                                            </div>

                                            {booking.notes && (
                                                <div className="mt-4 text-sm bg-gray-50/80 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 italic">
                                                    "{booking.notes}"
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-end items-start md:items-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                                        {booking.status === 'confirmed' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddToCalendar(booking)}
                                                className="w-full sm:w-auto justify-start"
                                            >
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Add to Calendar
                                            </Button>
                                        )}
                                        {booking.status === 'pending' && (
                                            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                                Awaiting Confirmation
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;
