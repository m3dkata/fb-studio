import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Clock, DollarSign } from 'lucide-react';
import { useService } from '../../hooks/useServices';
import { useCreateBooking, useAvailableSlots } from '../../hooks/useBookings';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DatePicker from '../../components/ui/DatePicker';
import { formatDateForInput } from '../../utils/dateHelpers';

const BookServicePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: service, isLoading: serviceLoading } = useService(id);
    const createBooking = useCreateBooking();

    const [selectedDate, setSelectedDate] = useState(''); // Start with no date selected
    const [selectedTime, setSelectedTime] = useState('');

    // Only fetch slots when a date is selected
    const { data: availableSlots, isLoading: slotsLoading } = useAvailableSlots(
        id,
        selectedDate,
        { enabled: !!selectedDate } // Only fetch if date is selected
    );

    const { register, handleSubmit, formState: { errors } } = useForm();

    // Reset time when date changes
    useEffect(() => {
        setSelectedTime('');
    }, [selectedDate]);

    const onSubmit = async (data) => {
        if (!selectedTime || !selectedDate) return;

        try {
            await createBooking.mutateAsync({
                user: user.id,
                service: id,
                booking_date: selectedDate,
                booking_time: selectedTime,
                notes: data.notes
            });

            navigate('/my-bookings');
        } catch (error) {
            console.error('Booking failed:', error);
        }
    };

    if (serviceLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="container px-4 py-20 mx-auto text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Not Found</h2>
            </div>
        );
    }

    return (
        <div className="container px-4 py-8 mx-auto">
            <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Book Appointment</h1>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Service Summary */}
                <div className="lg:col-span-1">
                    <Card>
                        <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-t-xl">
                            {service.image ? (
                                <img
                                    src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/services/${service.id}/${service.image}`}
                                    alt={service.title}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-400 dark:text-gray-500">No Image</div>
                            )}
                        </div>
                        <CardContent className="p-6">
                            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{service.title}</h3>
                            <div className="flex items-center justify-between mb-4 text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {service.duration} mins
                                </div>
                                <div className="flex items-center font-semibold text-primary">
                                    <DollarSign className="w-4 h-4" />
                                    {service.price}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3" dangerouslySetInnerHTML={{ __html: service.description }} />
                        </CardContent>
                    </Card>
                </div>

                {/* Booking Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Date & Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Date and Time Selection - Side by Side on Desktop */}
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Left: Date Selection */}
                                    <div>
                                        <DatePicker
                                            label="Select Date"
                                            value={selectedDate}
                                            onChange={setSelectedDate}
                                            minDate={formatDateForInput(new Date())}
                                        />
                                    </div>

                                    {/* Right: Time Slots */}
                                    <div>
                                        {selectedDate ? (
                                            <div>
                                                <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Available Time Slots
                                                </label>
                                                {slotsLoading ? (
                                                    <div className="flex justify-center py-8">
                                                        <LoadingSpinner />
                                                    </div>
                                                ) : availableSlots && availableSlots.length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                                                        {availableSlots.map((slot) => (
                                                            <button
                                                                key={slot.time}
                                                                type="button"
                                                                disabled={!slot.available}
                                                                onClick={() => setSelectedTime(slot.time)}
                                                                className={`
                                                                    py-2.5 px-3 text-sm font-semibold rounded-xl border-2 text-center transition-all duration-200
                                                                    ${!slot.available
                                                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-700'
                                                                        : selectedTime === slot.time
                                                                            ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white border-transparent shadow-lg scale-105'
                                                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary hover:scale-105'
                                                                    }
                                                                `}
                                                            >
                                                                {slot.time}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="p-4 text-sm text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                        No available slots for this date.
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl">
                                                <p className="text-sm text-center text-blue-700 dark:text-blue-300">
                                                    👈 Please select a date to see available time slots
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        className="block w-full p-3 text-gray-900 bg-white border-2 border-gray-300 shadow-sm rounded-xl dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/20 sm:text-sm"
                                        placeholder="Any special requests or allergies..."
                                        {...register('notes')}
                                    />
                                </div>

                                {/* Summary & Submit */}
                                {selectedDate && selectedTime && (
                                    <div className="p-5 border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-xl dark:border-teal-800">
                                        <h4 className="mb-3 font-bold text-gray-900 dark:text-white">Booking Summary</h4>
                                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="flex justify-between">
                                                <span>Service:</span>
                                                <span className="font-semibold">{service.title}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Date:</span>
                                                <span className="font-semibold">{format(new Date(selectedDate), 'MMMM d, yyyy')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Time:</span>
                                                <span className="font-semibold">{selectedTime}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 mt-2 border-t-2 border-teal-200 dark:border-teal-800">
                                                <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                                                <span className="text-lg font-bold text-primary">${service.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={!selectedTime || !selectedDate || createBooking.isPending}
                                    isLoading={createBooking.isPending}
                                >
                                    Confirm Booking
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BookServicePage;
