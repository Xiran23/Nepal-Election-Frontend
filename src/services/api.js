import axios from 'axios';
import { cacheService } from './cacheService';
import { mockNationalSummary, mockCandidates, mockDistrictResults, mockConstituencyData } from '../data/mockData';

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

// Helper to get mock data based on URL
const getMockData = (url, params) => {
    // 1. National Summary
    if (url.includes('/results/national-summary') || url.includes('/results/live')) {
        return mockNationalSummary;
    }

    // 2. Candidates List
    if (url.includes('/candidates') && !url.match(/\/candidates\/[a-zA-Z0-9]+$/)) {
        return mockCandidates;
    }

    // 3. Single Candidate
    const candidateMatch = url.match(/\/candidates\/([a-zA-Z0-9]+)$/);
    if (candidateMatch) {
        const id = candidateMatch[1];
        return mockCandidates.find(c => c._id === id) || mockCandidates[0];
    }

    // 4. District Results
    const districtMatch = url.match(/\/districts\/([^\/]+)\/election-results/);
    if (districtMatch) {
        return mockDistrictResults(districtMatch[1]);
    }

    // 5. Constituency Results
    const constituencyMatch = url.match(/\/constituencies\/([^\/]+)\/([^\/]+)/);
    if (constituencyMatch) {
        return mockConstituencyData(constituencyMatch[1], constituencyMatch[2]);
    }

    // 6. Candidates by Constituency
    const candByConstMatch = url.match(/\/candidates\/constituency\/([^\/]+)\/([^\/]+)/);
    if (candByConstMatch) {
        return mockConstituencyData(candByConstMatch[1], candByConstMatch[2]).candidates;
    }

    // 7. Current Election Metadata
    if (url.includes('/elections/current')) {
        return {
            year: 2084,
            status: 'active',
            totalVotesCast: 12000000,
            voterTurnout: 68.5
        };
    }

    return null;
};

// Custom get method with caching strategy
export const apiGet = async (url, params = {}, config = {}) => {
    const cacheKey = `${url}:${JSON.stringify(params)}`;
    const isOnline = navigator.onLine;

    // Detailed strategy:
    // 1. If online, try network. If success, update cache, return data.
    // 2. If network fails or offline, return cached data (even if stale).
    // 3. If no cache, return MOCK data (to simulate backend up).

    if (isOnline) {
        try {
            const response = await api.get(url, { ...config, params });
            // Cache the successful response
            await cacheService.set(cacheKey, response.data);
            return response.data;
        } catch (error) {
            console.warn('Network request failed, trying cache or mock...', error);

            // Try cache first
            const cached = await cacheService.getStale(cacheKey);
            if (cached) return cached;

            // Try mock data
            const mock = getMockData(url, params);
            if (mock) {
                console.info('Serving mock data for:', url);
                return mock;
            }

            throw error;
        }
    } else {
        const cached = await cacheService.getStale(cacheKey);
        if (cached) return cached;

        // Try mock data if offline and no cache
        const mock = getMockData(url, params);
        if (mock) {
            console.info('Serving mock data (Offline) for:', url);
            return mock;
        }

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
