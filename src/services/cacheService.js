import { openDB } from 'idb';

const dbName = 'nepal-election-cache';

class CacheService {
    constructor() {
        this.memoryCache = new Map();
        this.initDB();
    }

    async initDB() {
        this.db = await openDB(dbName, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('api-cache')) {
                    db.createObjectStore('api-cache', { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains('sync-queue')) {
                    db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
                }
            },
        });
    }

    async get(key) {
        if (this.memoryCache.has(key)) {
            return this.memoryCache.get(key);
        }

        if (!this.db) await this.initDB();
        const data = await this.db.get('api-cache', key);

        if (data) {
            if (Date.now() - data.timestamp < data.ttl) {
                this.memoryCache.set(key, data.value);
                return data.value;
            } else {
                // Expired, but maybe return stale data if specified? 
                // For now, strict TTL or if offline we might ignore TTL in offlineService
                await this.db.delete('api-cache', key);
            }
        }
        return null;
    }

    // Get stale data even if expired (for offline mode)
    async getStale(key) {
        if (!this.db) await this.initDB();
        const data = await this.db.get('api-cache', key);
        return data ? data.value : null;
    }

    async set(key, value, ttl = 3600000) { // 1 hour default
        this.memoryCache.set(key, value);

        if (!this.db) await this.initDB();
        await this.db.put('api-cache', {
            key,
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    async clear() {
        this.memoryCache.clear();
        if (!this.db) await this.initDB();
        await this.db.clear('api-cache');
    }

    async addToSyncQueue(request) {
        if (!this.db) await this.initDB();
        await this.db.add('sync-queue', {
            ...request,
            timestamp: Date.now()
        });
    }

    async getSyncQueue() {
        if (!this.db) await this.initDB();
        return await this.db.getAll('sync-queue');
    }

    async clearSyncQueue(ids) {
        if (!this.db) await this.initDB();
        const tx = this.db.transaction('sync-queue', 'readwrite');
        for (const id of ids) {
            await tx.store.delete(id);
        }
        await tx.done;
    }
}

export const cacheService = new CacheService();
