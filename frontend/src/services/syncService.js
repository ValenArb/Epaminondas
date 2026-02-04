import axios from 'axios';
import { db } from '../db/localDb';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const syncService = {
    async syncSales() {
        const pendingSales = await db.sales.where('status').equals('pending').toArray();

        if (pendingSales.length === 0) return;

        try {
            // Map to backend schema
            const salesPayload = pendingSales.map(s => ({
                id: s.id,
                external_id: s.external_id,
                station_id: 'default_station', // Should be configured
                branch_id: 1, // Store from settings
                user_id: 1, // Store from auth
                items: s.items.map(i => ({
                    product_id: i.id,
                    qty: i.qty,
                    unit_price: i.price
                })),
                total: s.total,
                payment_method: s.paymentMethod
            }));

            const response = await axios.post(`${API_BASE_URL}/sales/sync`, salesPayload);

            if (response.status === 200) {
                const syncedIds = response.data.map(s => s.id);
                await db.sales.where('id').anyOf(syncedIds).modify({ status: 'synced' });
                console.log(`Synced ${syncedIds.length} sales successfully.`);
            }
        } catch (error) {
            console.error('FastAPI Sync Failed:', error.message);
        }
    },

    async pullProducts() {
        try {
            const response = await axios.get(`${API_BASE_URL}/products/1`);
            if (response.data) {
                await db.products.bulkPut(response.data);
            }
        } catch (error) {
            console.error('Failed to pull products:', error);
        }
    }
};
