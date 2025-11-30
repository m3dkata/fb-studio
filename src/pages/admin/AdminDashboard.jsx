import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Briefcase, Clock } from 'lucide-react';
import { useBookings } from '../../hooks/useBookings';
import { useServices } from '../../hooks/useServices';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import Badge from '../../components/ui/Badge';

const AdminDashboard = () => {
    const { data: bookings, isLoading: bookingsLoading } = useBookings();
    const { data: services, isLoading: servicesLoading } = useServices();

    if (bookingsLoading || servicesLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const stats = {
        totalBookings: bookings?.length || 0,
        pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
        todayBookings: bookings?.filter(b => {
            const today = new Date().toISOString().split('T')[0];
            return b.booking_date.startsWith(today);
        }).length || 0,
        totalServices: services?.length || 0,
    };

    const recentBookings = bookings?.slice(0, 5) || [];

    const statCards = [
        {
            title: 'Total Bookings',
            value: stats.totalBookings,
            icon: Calendar,
            lightColor: 'bg-blue-100 text-blue-600',
            darkColor: 'dark:bg-blue-900/30 dark:text-blue-400'
        },
        {
            title: 'Pending Requests',
            value: stats.pendingBookings,
            icon: Clock,
            lightColor: 'bg-yellow-100 text-yellow-600',
            darkColor: 'dark:bg-yellow-900/30 dark:text-yellow-400'
        },
        {
            title: "Today's Appointments",
            value: stats.todayBookings,
            icon: Users,
            lightColor: 'bg-green-100 text-green-600',
            darkColor: 'dark:bg-green-900/30 dark:text-green-400'
        },
        {
            title: 'Active Services',
            value: stats.totalServices,
            icon: Briefcase,
            lightColor: 'bg-green-100 text-green-600',
            darkColor: 'dark:bg-green-900/30 dark:text-green-400'
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your beauty studio</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-xl ${stat.lightColor} ${stat.darkColor}`}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <Card className="h-full">
                    <CardHeader className="flex flex-row justify-between items-center pb-4">
                        <CardTitle>Recent Bookings</CardTitle>
                        <Link
                            to="/admin/bookings"
                            className="text-sm font-semibold text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors"
                        >
                            View All →
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile View (Cards) */}
                        <div className="md:hidden space-y-4">
                            {recentBookings.map((booking) => (
                                <div key={booking.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {booking.expand?.user?.name || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {booking.expand?.service?.title || 'Unknown'}
                                            </p>
                                        </div>
                                        <Badge variant={STATUS_COLORS[booking.status]}>
                                            {STATUS_LABELS[booking.status]}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(booking.booking_date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {recentBookings.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
                                </div>
                            )}
                        </div>

                        {/* Desktop View (Table) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Service</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {booking.expand?.user?.name || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {booking.expand?.service?.title || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(booking.booking_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <Badge variant={STATUS_COLORS[booking.status]}>
                                                    {STATUS_LABELS[booking.status]}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentBookings.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-12 text-center">
                                                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No bookings yet</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Bookings will appear here</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link to="/admin/bookings" className="block group">
                            <div className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary dark:hover:border-primary hover:shadow-md transition-all duration-200 flex items-center bg-white dark:bg-gray-800/50">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Manage Bookings</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View, approve, or cancel appointments</p>
                                </div>
                            </div>
                        </Link>

                        <Link to="/admin/services" className="block group">
                            <div className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary dark:hover:border-primary hover:shadow-md transition-all duration-200 flex items-center bg-white dark:bg-gray-800/50">
                                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                                    <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Manage Services</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Add, edit, or remove beauty services</p>
                                </div>
                            </div>
                        </Link>

                        <Link to="/admin/slots" className="block group">
                            <div className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary dark:hover:border-primary hover:shadow-md transition-all duration-200 flex items-center bg-white dark:bg-gray-800/50">
                                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                                    <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Unavailable Slots</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Block dates for vacations or maintenance</p>
                                </div>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
