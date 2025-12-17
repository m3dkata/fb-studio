import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Calendar, Download, Smartphone } from 'lucide-react';
import { getGoogleCalendarUrl, downloadICS } from '../../utils/calendar';

const CalendarExportModal = ({ isOpen, onClose, booking, service }) => {
    if (!booking || !service) return null;

    const handleGoogleCalendar = () => {
        const googleUrl = getGoogleCalendarUrl(booking, service);
        if (googleUrl) {
            window.open(googleUrl, '_blank');
            onClose();
        }
    };

    const handleDownloadICS = () => {
        try {
            downloadICS(booking, service);
            onClose();
        } catch (error) {
            
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add to Calendar" size="sm">
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                    Choose how you would like to add this booking to your calendar:
                </p>

                <div className="grid gap-3">
                    <button
                        onClick={handleDownloadICS}
                        className="flex items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group text-left"
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                            <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Default Calendar App</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Apple Calendar, Outlook, Android</p>
                        </div>
                    </button>

                    <button
                        onClick={handleGoogleCalendar}
                        className="flex items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group text-left"
                    >
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                            <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Google Calendar</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Open in browser</p>
                        </div>
                    </button>

                    <button
                        onClick={handleDownloadICS}
                        className="flex items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group text-left"
                    >
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                            <Download className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Download .ics File</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manual import for any calendar</p>
                        </div>
                    </button>
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </Modal>
    );
};

export default CalendarExportModal;
