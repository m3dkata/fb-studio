import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '../../hooks/useServices';
import { useCrudModal } from '../../hooks/useCrudModal';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { SERVICE_CATEGORIES, CATEGORY_LABELS } from '../../utils/constants';

const ManageServicesPage = () => {
    const { data: services, isLoading } = useServices();
    const createService = useCreateService();
    const updateService = useUpdateService();
    const deleteService = useDeleteService();

    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    // Use CRUD modal hook
    const { isOpen: isModalOpen, editingItem: editingService, openCreate, openEdit, close: closeModal } = useCrudModal(reset, setValue);

    const openCreateModal = () => {
        openCreate({
            title: '',
            description: '',
            category: '',
            price: '',
            duration: '',
            active: true
        });
    };

    const openEditModal = (service) => {
        openEdit(service, {
            title: service.title,
            description: service.description,
            category: service.category,
            price: service.price,
            duration: service.duration,
            active: service.active
        });
    };

    const onSubmit = async (data) => {
        try {
            const serviceData = {
                ...data,
                price: parseFloat(data.price),
                duration: parseInt(data.duration),
            };

            // Handle image upload ONLY if a new image is selected
            if (data.image && data.image[0]) {
                serviceData.image = data.image[0];
            } else if (editingService) {
                // When editing, remove image field if no new image selected
                // This prevents overwriting the existing image
                delete serviceData.image;
            }

            if (editingService) {
                await updateService.mutateAsync({ id: editingService.id, data: serviceData });
            } else {
                await createService.mutateAsync(serviceData);
            }
            closeModal();
        } catch (error) {
            console.error('Failed to save service:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteService.mutateAsync(id);
            setDeleteConfirmId(null);
        } catch (error) {
            console.error('Failed to delete service:', error);
        }
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Services</h1>
                <Button onClick={openCreateModal}>
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Service
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services?.map((service) => (
                    <Card key={service.id} className="relative">
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                            {service.image ? (
                                <img
                                    src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/services/${service.id}/${service.image}`}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">No Image</div>
                            )}
                            {!service.active && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">Inactive</span>
                                </div>
                            )}
                        </div>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{service.title}</h3>
                                <span className="font-bold text-primary">${service.price}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{CATEGORY_LABELS[service.category]}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4" dangerouslySetInnerHTML={{ __html: service.description }} />

                            <div className="flex justify-end space-x-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => openEditModal(service)}>
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => setDeleteConfirmId(service.id)}>
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingService ? 'Edit Service' : 'Add New Service'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Service Title"
                        id="title"
                        {...register('title', { required: 'Title is required' })}
                        error={errors.title?.message}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                            className="block w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-sm px-4 py-3 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                            rows={4}
                            placeholder="Describe the service in detail..."
                            {...register('description', { required: 'Description is required' })}
                        />
                        {errors.description && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
                    </div>

                    <Select
                        label="Category"
                        id="category"
                        placeholder="Select a category"
                        options={Object.values(SERVICE_CATEGORIES).map(cat => ({ value: cat, label: CATEGORY_LABELS[cat] }))}
                        {...register('category', { required: 'Category is required' })}
                        error={errors.category?.message}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Price ($)"
                            id="price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('price', { required: 'Price is required', min: 0 })}
                            error={errors.price?.message}
                        />
                        <Input
                            label="Duration (mins)"
                            id="duration"
                            type="number"
                            placeholder="60"
                            {...register('duration', { required: 'Duration is required', min: 15 })}
                            error={errors.duration?.message}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Service Image {editingService && <span className="text-xs text-gray-500 dark:text-gray-400">(optional - current image will be kept if not changed)</span>}
                        </label>

                        {editingService && editingService.image && (
                            <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Current Image:</p>
                                <img
                                    src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/services/${editingService.id}/${editingService.image}`}
                                    alt="Current"
                                    className="h-32 w-32 object-cover rounded-lg border-2 border-white dark:border-gray-600 shadow-md"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm text-gray-600 dark:text-gray-400 
                                    file:mr-4 file:py-3 file:px-6 
                                    file:rounded-xl file:border-0 
                                    file:text-sm file:font-semibold 
                                    file:bg-gradient-to-r file:from-teal-500 file:to-green-500 
                                    file:text-white file:shadow-lg file:shadow-teal-500/30
                                    hover:file:shadow-xl hover:file:scale-105 
                                    file:transition-all file:duration-200 file:cursor-pointer
                                    cursor-pointer
                                    border-2 border-dashed border-gray-300 dark:border-gray-600 
                                    rounded-xl p-4 
                                    hover:border-primary dark:hover:border-primary
                                    bg-gray-50 dark:bg-gray-800/50
                                    transition-all duration-200"
                                {...register('image')}
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-start">
                            <svg className="w-4 h-4 mr-1 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {editingService ? 'Upload a new image only if you want to replace the current one' : 'Upload a high-quality image (JPG, PNG, or WebP)'}
                        </p>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                        <div className="relative flex items-center">
                            <input
                                id="active"
                                type="checkbox"
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all duration-200 checked:bg-gradient-to-r checked:from-teal-500 checked:to-green-500 checked:border-transparent focus:ring-4 focus:ring-primary/20 hover:border-primary"
                                {...register('active')}
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
                        <label htmlFor="active" className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
                            <span className="font-semibold">Active Service</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">Make this service visible to customers</span>
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="ghost" type="button" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" isLoading={createService.isPending || updateService.isPending}>
                            {editingService ? 'Update Service' : 'Create Service'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                title="Confirm Deletion"
                size="sm"
            >
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete this service? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                    <Button
                        variant="danger"
                        onClick={() => handleDelete(deleteConfirmId)}
                        isLoading={deleteService.isPending}
                    >
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ManageServicesPage;
