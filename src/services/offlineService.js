import { cacheService } from './cacheService';
import api from './api';

class OfflineService {
    constructor() {
        this.isOnline = navigator.onLine;
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    handleOffline() {
        this.isOnline = false;
        console.log('App is offline');
        // Dispatch/Notify UI
    }

    async handleOnline() {
        this.isOnline = true;
        console.log('App is online');
        await this.syncData();
    }

    async queueMutation(method, url, data) {
        await cacheService.addToSyncQueue({ method, url, data });
        // Notify user that action is queued
    }

    async syncData() {
        const queue = await cacheService.getSyncQueue();
        if (queue.length === 0) return;

        const processedIds = [];

        for (const item of queue) {
            try {
                if (item.method === 'POST') await api.post(item.url, item.data);
                if (item.method === 'PUT') await api.put(item.url, item.data);
                if (item.method === 'DELETE') await api.delete(item.url);
                processedIds.push(item.id);
            } catch (error) {
                console.error('Failed to sync item', item, error);
                // Decide whether to keep in queue or discard after N retries
            }
        }

        if (processedIds.length > 0) {
            await cacheService.clearSyncQueue(processedIds);
        }
    }
}

export const offlineService = new OfflineService();
