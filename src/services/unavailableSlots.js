import pb from './pocketbase';

export const unavailableSlotsService = {
    
    async getAll(filter = {}) {
        try {
            const filterQuery = [];

            if (filter.serviceId) {
                filterQuery.push(`service = "${filter.serviceId}"`);
            }

            if (filter.date) {
                filterQuery.push(`date_start = "${filter.date}"`);
            }

            const records = await pb.collection('unavailable_slots').getFullList({
                filter: filterQuery.length > 0 ? filterQuery.join(' && ') : '',
                sort: '-date_start',
                expand: 'service',
            });

            return records;
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch unavailable slots');
        }
    },

    
    async create(data) {
        try {
            const record = await pb.collection('unavailable_slots').create(data);
            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to create unavailable slot');
        }
    },

    
    async update(id, data) {
        try {
            const record = await pb.collection('unavailable_slots').update(id, data);
            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to update unavailable slot');
        }
    },

    
    async delete(id) {
        try {
            await pb.collection('unavailable_slots').delete(id);
        } catch (error) {
            throw new Error(error.message || 'Failed to delete unavailable slot');
        }
    }
};

export default unavailableSlotsService;
