import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';

const DatePicker = ({
    value,
    onChange,
    label,
    error,
    minDate,
    className = '',
    ...props
}) => {
    const [currentMonth, setCurrentMonth] = useState(value ? parseISO(value) : new Date());

    const selectedDate = value ? parseISO(value) : null;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    
    const startDayOfWeek = monthStart.getDay();
    const daysToShow = [];

    
    for (let i = 0; i < startDayOfWeek; i++) {
        daysToShow.push(null);
    }

    
    daysInMonth.forEach(day => daysToShow.push(day));

    const handleDateSelect = (date) => {
        if (date && !isDateDisabled(date)) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            onChange(formattedDate);
        }
    };

    const handlePrevMonth = () => {
        setCurrentMonth(prev => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => addMonths(prev, 1));
    };

    const isDateDisabled = (date) => {
        if (!date) return true;
        if (minDate) {
            const min = typeof minDate === 'string' ? parseISO(minDate) : minDate;
            return date < min;
        }
        return false;
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}

            { }
            <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 max-w-sm mx-auto">
                { }
                <div className="flex items-center justify-between mb-3">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {format(currentMonth, 'MMM yyyy')}
                    </h3>

                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                { }
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={`${day}-${idx}`} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-1">
                            {day}
                        </div>
                    ))}
                </div>

                { }
                <div className="grid grid-cols-7 gap-1">
                    {daysToShow.map((date, index) => {
                        if (!date) {
                            return <div key={`empty-${index}`} className="aspect-square" />;
                        }

                        const isSelected = selectedDate && isSameDay(date, selectedDate);
                        const isCurrentDay = isToday(date);
                        const isDisabled = isDateDisabled(date);
                        const isCurrentMonth = isSameMonth(date, currentMonth);

                        return (
                            <button
                                key={date.toISOString()}
                                type="button"
                                onClick={() => handleDateSelect(date)}
                                disabled={isDisabled}
                                className={`
                                    aspect-square rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-center
                                    ${isDisabled
                                        ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                                        : isSelected
                                            ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg scale-105'
                                            : isCurrentDay
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light ring-1 ring-primary'
                                                : isCurrentMonth
                                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    : 'text-gray-400 dark:text-gray-600'
                                    }
                                `}
                            >
                                {format(date, 'd')}
                            </button>
                        );
                    })}
                </div>

                { }
                {selectedDate && (
                    <div className="mt-3 p-2 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-center text-gray-900 dark:text-white">
                            {format(selectedDate, 'EEE, MMM dd, yyyy')}
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};

export default DatePicker;
