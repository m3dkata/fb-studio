import pb from './pocketbase';

export const servicesService = {
    
    async getAll(filter = {}) {
        try {
            const filterQuery = [];

            if (filter.category) {
                filterQuery.push(`category = "${filter.category}"`);
            }

            if (filter.active !== undefined) {
                filterQuery.push(`active = ${filter.active}`);
            } else {
                filterQuery.push('active = true'); 
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

    
    async getById(id) {
        try {
            const record = await pb.collection('services').getOne(id);
            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch service');
        }
    },

    
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

    
    getImageUrl(service, filename) {
        if (!filename) return null;
        return pb.files.getURL(service, filename);
    },

    
    subscribe(callback) {
        return pb.collection('services').subscribe('*', (e) => {
            callback(e);
        });
    },

    
    async unsubscribe() {
        await pb.collection('services').unsubscribe();
    }
};

export default servicesService;
