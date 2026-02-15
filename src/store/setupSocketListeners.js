import { socketService } from '../services/socketService';
import { updateLocalResult, fetchLiveResults } from './electionSlice';
import { fetchCandidates } from './candidateSlice'; // Assuming this exists

export const setupSocketListeners = (dispatch) => {
    socketService.on('result_updated', (data) => {
        console.log('Socket: Result updated', data);
        dispatch(updateLocalResult({
            districtId: data.district._id || data.district,
            constituencyNo: data.constituency,
            data: data
        }));
    });

    socketService.on('result_created', (data) => {
        console.log('Socket: Result created', data);
        dispatch(updateLocalResult({
            districtId: data.district._id || data.district,
            constituencyNo: data.constituency,
            data: data
        }));
    });

    socketService.on('candidate_updated', (data) => {
        console.log('Socket: Candidate updated', data);
        // We could dispatch a specific updateCandidate action if it exists
        dispatch(fetchLiveResults()); // Refresh live results
    });

    socketService.on('candidate_created', () => {
        dispatch(fetchLiveResults());
    });

    socketService.on('candidate_deleted', () => {
        dispatch(fetchLiveResults());
    });
};
