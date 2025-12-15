import pb from './pocketbase';

export const servicesService = {
    // Get all services
    async getAll(filter = {}) {
        try {
            const filterQuery = [];

            if (filter.category) {
                filterQuery.push(`category = "${filter.category}"`);
            }

            if (filter.active !== undefined) {
                filterQuery.push(`active = ${filter.active}`);
            } else {
                filterQuery.push('active = true'); // Default: only active services
            }

            const records = await pb.collection('services').getFullList({
                filter: filterQuery.join(' && '),
                sort: '-created',
            });

            return records;
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch services');
        }
    },

    // Get single service by ID
    async getById(id) {
        try {
            const record = await pb.collection('services').getOne(id);
            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch service');
        }
    },

    // Create new service (admin only)
    async create(data) {
        try {
            const formData = new FormData();

            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });

            const record = await pb.collection('services').create(formData);
            return record;
        } catch (error) {
            console.error('Service creation error:', error);
            if (error.data?.data) {
                const validationErrors = Object.entries(error.data.data)
                    .map(([field, err]) => `${field}: ${err.message}`)
                    .join(', ');
                throw new Error(`Validation failed: ${validationErrors}`);
            }
            throw new Error(error.message || 'Failed to create service');
        }
    },

    // Update service (admin only)
    async update(id, data) {
        try {
            const formData = new FormData();

            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });

            const record = await pb.collection('services').update(id, formData);
            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to update service');
        }
    },

    // Delete service (admin only)
    async delete(id) {
        try {
            await pb.collection('services').delete(id);
        } catch (error) {
            if (error.message && error.message.includes('required relation reference')) {
                throw new Error('Cannot delete service. It has existing bookings. Please cancel all bookings for this service first.');
            }
            throw new Error(error.message || 'Failed to delete service');
        }
    },

    // Get service image URL
    getImageUrl(service, filename) {
        if (!filename) return null;
        return pb.files.getURL(service, filename);
    },

    // Subscribe to services changes
    subscribe(callback) {
        return pb.collection('services').subscribe('*', (e) => {
            callback(e);
        });
    },

    // Unsubscribe from services changes
    async unsubscribe() {
        await pb.collection('services').unsubscribe();
    }
};

export default servicesService;
