import React, { useState } from 'react';
import { Check, X, Calendar } from 'lucide-react';
import { useBookings, useUpdateBookingStatus } from '../../hooks/useBookings';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { STATUS_COLORS, STATUS_LABELS, BOOKING_STATUS } from '../../utils/constants';
import { formatTime } from '../../utils/dateHelpers';
import CalendarExportModal from '../../components/ui/CalendarExportModal';

const ManageBookingsPage = () => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [calendarModalOpen, setCalendarModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const { data: bookings, isLoading } = useBookings({
        status: filterStatus !== 'all' ? filterStatus : undefined
    });
    const updateStatus = useUpdateBookingStatus();

    const handleStatusUpdate = async (id, status, userId) => {
        try {
            await updateStatus.mutateAsync({ id, status, userId });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleAddToCalendar = (booking) => {
        setSelectedBooking(booking);
        setCalendarModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <CalendarExportModal
                isOpen={calendarModalOpen}
                onClose={() => setCalendarModalOpen(false)}
                booking={selectedBooking}
                service={selectedBooking?.expand?.service}
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Bookings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all service bookings</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${filterStatus === 'all'
                            ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg shadow-teal-500/30'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        All
                    </button>
                    {Object.values(BOOKING_STATUS).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${filterStatus === status
                                ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg shadow-teal-500/30'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {STATUS_LABELS[status]}
                        </button>
                    ))}
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {bookings?.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.expand?.user?.name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{booking.expand?.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.expand?.service?.title}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{booking.expand?.service?.duration} mins</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                                <Calendar className="h-4 w-4 mr-1.5 text-primary" />
                                                <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 ml-5.5">{formatTime(booking.booking_time)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={STATUS_COLORS[booking.status]}>
                                                {STATUS_LABELS[booking.status]}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'confirmed', booking.user)}
                                                            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 p-2 rounded-lg transition-all duration-200"
                                                            title="Confirm"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'cancelled', booking.user)}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 p-2 rounded-lg transition-all duration-200"
                                                            title="Cancel"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleAddToCalendar(booking)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 p-2 rounded-lg transition-all duration-200"
                                                    title="Add to Calendar"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                </button>
                                                {booking.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'completed', booking.user)}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 p-2 rounded-lg transition-all duration-200"
                                                        title="Mark Completed"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {bookings?.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
                                                <p className="text-lg font-medium">No bookings found</p>
                                                <p className="text-sm mt-1">Bookings will appear here when customers make reservations</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageBookingsPage;
