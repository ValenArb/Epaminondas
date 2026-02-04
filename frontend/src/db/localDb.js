import Dexie from 'dexie';

export const db = new Dexie('KioskERPLocalDB');

// Define database schema
db.version(1).stores({
  products: '++id, name, isbn, internal_code, category_id',
  sales: 'id, external_id, station_id, status, timestamp', // status: pending, synced, syncing
  customers: '++id, name, phone',
  categories: '++id, name',
  syncQueue: '++id, type, payload, timestamp', // For generic sync actions
  logs: '++id, timestamp, action'
});

export const initLocalDB = async () => {
  try {
    await db.open();
    console.log('IndexedDB initialized correctly');
  } catch (err) {
    console.error('Failed to open indexedDB:', err);
  }
};
