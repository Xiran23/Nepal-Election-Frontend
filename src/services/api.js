import axios from 'axios';
import { cacheService } from './cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Simplistic token storage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Custom get method with caching strategy
export const apiGet = async (url, params = {}, config = {}) => {
    const cacheKey = `${url}:${JSON.stringify(params)}`;
    const isOnline = navigator.onLine;

    // Local cached data (stale-while-revalidate strategy could be used here)
    // Detailed strategy:
    // 1. If online, try network. If success, update cache, return data.
    // 2. If network fails or offline, return cached data (even if stale).

    if (isOnline) {
        try {
            const response = await api.get(url, { ...config, params });
            // Cache the successful response
            await cacheService.set(cacheKey, response.data);
            return response.data;
        } catch (error) {
            console.warn('Network request failed, trying cache...', error);
            const cached = await cacheService.getStale(cacheKey);
            if (cached) return cached;
            throw error;
        }
    } else {
        const cached = await cacheService.getStale(cacheKey);
        if (cached) return cached;
        throw new Error('Offline and no cached data available');
    }
};

export const apiPost = async (url, data, config = {}) => {
    const isOnline = navigator.onLine;

    if (isOnline) {
        const response = await api.post(url, data, config);
        return response.data;
    } else {
        throw new Error('You are offline. Changes will be synced when back online.');
    }
};

export const apiPut = async (url, data, config = {}) => {
    const isOnline = navigator.onLine;
    if (isOnline) {
        const response = await api.put(url, data, config);
        return response.data;
    } else {
        throw new Error('You are offline.');
    }
};

export const apiDelete = async (url, config = {}) => {
    const isOnline = navigator.onLine;
    if (isOnline) {
        const response = await api.delete(url, config);
        return response.data;
    } else {
        throw new Error('You are offline.');
    }
};

export default api;
