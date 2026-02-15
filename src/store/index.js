import { configureStore } from '@reduxjs/toolkit';
import electionReducer from './electionSlice';
import districtReducer from './districtSlice';
import offlineReducer from './offlineSlice';
import candidateReducer from './candidateSlice';
import authReducer from './authSlice';
import partyReducer from './partySlice';

export const store = configureStore({
  reducer: {
    election: electionReducer,
    district: districtReducer,
    offline: offlineReducer,
    candidate: candidateReducer,
    auth: authReducer,
    party: partyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Export types for TypeScript support
export const RootState = store.getState;
export const AppDispatch = store.dispatch;


// import { configureStore } from '@reduxjs/toolkit';
// import electionReducer from './electionSlice';
// import districtReducer from './districtSlice';
// import offlineReducer from './offlineSlice';
// import candidateReducer from './candidateSlice';
// import authReducer from './authSlice';

// export const store = configureStore({
//   reducer: {
//     election: electionReducer,
//     district: districtReducer,
//     offline: offlineReducer,
//     candidate: candidateReducer,
//     auth: authReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         // Ignore these action types
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
//       },
//     }),
// });

// // Export types for TypeScript support
// export const RootState = store.getState;
// export const AppDispatch = store.dispatch;


// // src/store/index.js
// import { configureStore } from '@reduxjs/toolkit';
// import electionReducer from './electionSlice';
// import districtReducer from './districtSlice';
// import offlineReducer from './offlineSlice';

// export const store = configureStore({
//   reducer: {
//     election: electionReducer,
//     district: districtReducer,
//     offline: offlineReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }),
// });


// import { configureStore } from '@reduxjs/toolkit';
// import electionReducer from './electionSlice';
// import districtReducer from './districtSlice';
// import offlineReducer from './offlineSlice';

// export const store = configureStore({
//     reducer: {
//         election: electionReducer,
//         district: districtReducer,
//         offline: offlineReducer,
//     },
// });
