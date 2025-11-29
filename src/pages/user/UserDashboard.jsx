import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Plus, User, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBookingStats, useBookings } from '../../hooks/useBookings';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';
import { formatTime } from '../../utils/dateHelpers';

const UserDashboard = () => {
    const { user } = useAuth();
    const { data: stats, isLoading: statsLoading } = useBookingStats(user.id);
    const { data: upcomingBookings, isLoading: bookingsLoading } = useBookings({
        userId: user.id,
        status: 'confirmed'
    });

    const upcoming = upcomingBookings?.filter(booking => {
        const bookingDate = new Date(`${booking.booking_date.split('T')[0]}T${booking.booking_time}`);
        return bookingDate > new Date();
    }).slice(0, 3) || [];

    if (statsLoading || bookingsLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const statCards = [
        { title: 'Total Bookings', value: stats?.total || 0, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-100' },
        { title: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
        { title: 'Confirmed', value: stats?.confirmed || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { title: 'Completed', value: stats?.completed || 0, icon: Star, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    return (
        <div className="container mx-auto px-4 py-8 relative">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-green-300/20 rounded-full blur-[80px] animate-float" />
                <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-teal-300/20 rounded-full blur-[80px] animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Hello, <span className="text-gradient">{user.name.split(' ')[0]}</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome to your personal beauty dashboard
                    </p>
                </div>
                <Link to="/services">
                    <Button className="shadow-lg shadow-primary/20">
                        <Plus className="h-5 w-5 mr-2" />
                        New Booking
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {statCards.map((stat, index) => (
                    <Card key={index} className="hover:scale-105 transition-transform duration-300">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Bookings */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <Link to="/my-bookings" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                                View All
                            </Link>
                        </CardHeader>
                        <CardContent className="p-6">
                            {upcoming.length > 0 ? (
                                <div className="space-y-4">
                                    {upcoming.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/30 dark:to-green-900/30 flex flex-col items-center justify-center text-primary shadow-sm">
                                                    <span className="text-xs font-bold uppercase">{new Date(booking.booking_date).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-xl font-bold">{new Date(booking.booking_date).getDate()}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary transition-colors">
                                                        {booking.expand?.service?.title || 'Unknown Service'}
                                                    </h4>
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        {formatTime(booking.booking_time)} • {booking.expand?.service?.duration} mins
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                                                <Badge variant={STATUS_COLORS[booking.status]}>
                                                    {STATUS_LABELS[booking.status]}
                                                </Badge>
                                                <Link to={`/my-bookings`}>
                                                    <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white hover:border-primary">
                                                        Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No upcoming appointments</h3>
                                    <p className="text-gray-500 mb-6">Ready to treat yourself?</p>
                                    <Link to="/services">
                                        <Button variant="outline" size="sm">Book Now</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div>
                    <Card className="h-full">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <Link to="/services" className="block group">
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 bg-white dark:bg-gray-800 flex items-center">
                                    <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full mr-4 group-hover:scale-110 transition-transform">
                                        <Plus className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Book Service</h3>
                                        <p className="text-xs text-gray-500">Browse and book new appointments</p>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/profile" className="block group">
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 bg-white dark:bg-gray-800 flex items-center">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4 group-hover:scale-110 transition-transform">
                                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">Update Profile</h3>
                                        <p className="text-xs text-gray-500">Manage your contact information</p>
                                    </div>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
