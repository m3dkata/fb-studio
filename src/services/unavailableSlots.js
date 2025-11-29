import pb from './pocketbase';

export const unavailableSlotsService = {
    // Get all unavailable slots
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

    // Create unavailable slot (admin only)
    async create(data) {
        try {
            const record = await pb.collection('unavailable_slots').create(data);
            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to create unavailable slot');
        }
    },

    // Update unavailable slot (admin only)
    async update(id, data) {
        try {
            const record = await pb.collection('unavailable_slots').update(id, data);
            return record;
        } catch (error) {
            throw new Error(error.message || 'Failed to update unavailable slot');
        }
    },

    // Delete unavailable slot (admin only)
    async delete(id) {
        try {
            await pb.collection('unavailable_slots').delete(id);
        } catch (error) {
            throw new Error(error.message || 'Failed to delete unavailable slot');
        }
    }
};

export default unavailableSlotsService;
