import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus, Calendar, Edit } from 'lucide-react';
import unavailableSlotsService from '../../services/unavailableSlots';
import { useServices } from '../../hooks/useServices';
import { useCrudModal } from '../../hooks/useCrudModal';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DatePicker from '../../components/ui/DatePicker';
import { formatDateForInput } from '../../utils/dateHelpers';

const ManageSlotsPage = () => {
    const queryClient = useQueryClient();
    const { data: services } = useServices();

    const { data: slots, isLoading } = useQuery({
        queryKey: ['unavailable-slots'],
        queryFn: () => unavailableSlotsService.getAll()
    });

    const createSlot = useMutation({
        mutationFn: (data) => unavailableSlotsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQuery({ queryKey: ['unavailable-slots'] });
            closeModal();
        }
    });

    const updateSlot = useMutation({
        mutationFn: ({ id, data }) => unavailableSlotsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unavailable-slots'] });
            closeModal();
        }
    });

    const deleteSlot = useMutation({
        mutationFn: (id) => unavailableSlotsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unavailable-slots'] });
        }
    });

    const { register, handleSubmit, reset, watch, control, setValue, formState: { errors } } = useForm({
        defaultValues: {
            date_start: formatDateForInput(new Date()),
            date_end: formatDateForInput(new Date()),
            service: []
        }
    });

    // Use CRUD modal hook
    const { isOpen: isModalOpen, editingItem: editingSlot, openCreate, openEdit, close: closeModal } = useCrudModal(reset, setValue);

    const openCreateModal = () => {
        openCreate({
            date_start: formatDateForInput(new Date()),
            date_end: formatDateForInput(new Date()),
            service: [],
            reason: ''
        });
    };

    const openEditModal = (slot) => {
        // Handle both single and multiple services
        const serviceIds = Array.isArray(slot.service) ? slot.service : [slot.service];

        openEdit(slot, {
            date_start: formatDateForInput(new Date(slot.date_start)),
            date_end: formatDateForInput(new Date(slot.date_end)),
            service: serviceIds,
            reason: slot.reason || ''
        });
    };

    const onSubmit = (data) => {
        if (editingSlot) {
            updateSlot.mutate({ id: editingSlot.id, data });
        } else {
            createSlot.mutate(data);
        }
    };

    const formatDateRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (startDate === endDate) {
            return start.toLocaleDateString();
        }
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    };

    const getServiceNames = (slot) => {
        if (!slot.expand?.service) return 'Unknown Service';

        // Handle both single and multiple services
        if (Array.isArray(slot.expand.service)) {
            return slot.expand.service.map(s => s.title).join(', ');
        }
        return slot.expand.service.title;
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unavailable Slots</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Block dates when services are unavailable</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="h-5 w-5 mr-2" />
                    Block Dates
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slots?.map((slot) => (
                    <Card key={slot.id} className="hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                        {getServiceNames(slot)}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                                        <span className="font-medium">
                                            {formatDateRange(slot.date_start, slot.date_end)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {slot.reason && (
                                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason:</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{slot.reason}</p>
                                </div>
                            )}
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm" onClick={() => openEditModal(slot)}>
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => deleteSlot.mutate(slot.id)}
                                    isLoading={deleteSlot.isPending}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {slots?.length === 0 && (
                    <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-lg font-medium">No unavailable dates configured</p>
                        <p className="text-sm mt-1">Click "Block Dates" to add unavailable periods</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingSlot ? 'Edit Unavailable Slot' : 'Block Dates'}
                size="md"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Services <span className="text-xs text-gray-500 dark:text-gray-400">(select one or more)</span>
                        </label>
                        <Controller
                            name="service"
                            control={control}
                            rules={{ required: 'Please select at least one service' }}
                            render={({ field }) => (
                                <div className="space-y-2 max-h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                                    {services?.map((service) => (
                                        <div key={service.id} className="transition-colors hover:bg-white dark:hover:bg-gray-700 rounded-lg">
                                            <label className="flex items-center p-2 cursor-pointer relative">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        value={service.id}
                                                        checked={field.value?.includes(service.id)}
                                                        onChange={(e) => {
                                                            const newValue = e.target.checked
                                                                ? [...(field.value || []), service.id]
                                                                : field.value?.filter(id => id !== service.id);
                                                            field.onChange(newValue);
                                                        }}
                                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all duration-200 checked:bg-gradient-to-r checked:from-teal-500 checked:to-green-500 checked:border-transparent focus:ring-4 focus:ring-primary/20 hover:border-primary"
                                                    />
                                                    <svg
                                                        className="absolute left-0.5 w-3.5 h-3.5 pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    {service.title}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        />
                        {errors.service && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.service.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller
                            name="date_start"
                            control={control}
                            rules={{ required: 'Start date is required' }}
                            render={({ field }) => (
                                <DatePicker
                                    label="Start Date"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    minDate={formatDateForInput(new Date())}
                                    error={errors.date_start?.message}
                                />
                            )}
                        />
                        <Controller
                            name="date_end"
                            control={control}
                            rules={{ required: 'End date is required' }}
                            render={({ field }) => (
                                <DatePicker
                                    label="End Date"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    minDate={watch('date_start') || formatDateForInput(new Date())}
                                    error={errors.date_end?.message}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reason <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            className="block w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-sm px-4 py-3 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                            rows={3}
                            placeholder="e.g., Vacation, Training, Maintenance..."
                            {...register('reason')}
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="flex">
                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800 dark:text-blue-300">
                                <p className="font-semibold mb-1">Note:</p>
                                <p>Selected services will be completely unavailable for the entire date range. No bookings will be accepted during this period.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="ghost" type="button" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" isLoading={createSlot.isPending || updateSlot.isPending}>
                            {editingSlot ? 'Update Slot' : 'Block Dates'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageSlotsPage;
