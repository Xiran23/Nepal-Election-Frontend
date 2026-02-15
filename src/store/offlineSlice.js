// import { createSlice } from '@reduxjs/toolkit';

// const offlineSlice = createSlice({
//     name: 'offline',
//     initialState: {
//         isOnline: navigator.onLine,
//         syncQueueSize: 0,
//     },
//     reducers: {
//         setOnlineStatus: (state, action) => {
//             state.isOnline = action.payload;
//         },
//         updateSyncQueueSize: (state, action) => {
//             state.syncQueueSize = action.payload;
//         }
//     },
// });

// export const { setOnlineStatus, updateSyncQueueSize } = offlineSlice.actions;

// export default offlineSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOnline: navigator.onLine,
  syncQueue: [],
  syncStatus: 'idle', // 'idle', 'syncing', 'failed'
  pendingChanges: 0,
  lastSyncTime: null,
  cacheStats: {
    totalItems: 0,
    size: 0,
    lastCleared: null
  },
  offlineMode: !navigator.onLine,
  networkType: 'unknown', // 'wifi', '4g', '3g', 'offline'
  connectionSpeed: null
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
      state.offlineMode = !action.payload;
      
      // Detect network type
      if ('connection' in navigator) {
        const connection = navigator.connection || 
                          navigator.mozConnection || 
                          navigator.webkitConnection;
        if (connection) {
          state.networkType = connection.effectiveType;
          state.connectionSpeed = connection.downlink;
        }
      }
    },
    
    addToSyncQueue: (state, action) => {
      state.syncQueue.push({
        id: Date.now(),
        ...action.payload,
        retryCount: 0,
        timestamp: new Date().toISOString()
      });
      state.pendingChanges = state.syncQueue.length;
    },
    
    removeFromSyncQueue: (state, action) => {
      state.syncQueue = state.syncQueue.filter(item => item.id !== action.payload);
      state.pendingChanges = state.syncQueue.length;
    },
    
    updateSyncStatus: (state, action) => {
      state.syncStatus = action.payload;
    },
    
    incrementRetryCount: (state, action) => {
      const item = state.syncQueue.find(i => i.id === action.payload);
      if (item) {
        item.retryCount += 1;
      }
    },
    
    setLastSyncTime: (state) => {
      state.lastSyncTime = new Date().toISOString();
    },
    
    updateCacheStats: (state, action) => {
      state.cacheStats = { ...state.cacheStats, ...action.payload };
    },
    
    clearSyncQueue: (state) => {
      state.syncQueue = [];
      state.pendingChanges = 0;
      state.syncStatus = 'idle';
    },
    
    setNetworkInfo: (state, action) => {
      state.networkType = action.payload.type;
      state.connectionSpeed = action.payload.speed;
    },
    
    resetOfflineState: () => initialState
  }
});

export const {
  setOnlineStatus,
  addToSyncQueue,
  removeFromSyncQueue,
  updateSyncStatus,
  incrementRetryCount,
  setLastSyncTime,
  updateCacheStats,
  clearSyncQueue,
  setNetworkInfo,
  resetOfflineState
} = offlineSlice.actions;

// Selectors
export const selectIsOnline = (state) => state.offline.isOnline;
export const selectSyncQueueSize = (state) => state.offline.syncQueue.length;
export const selectOfflineMode = (state) => state.offline.offlineMode;
export const selectSyncStatus = (state) => state.offline.syncStatus;

export default offlineSlice.reducer;