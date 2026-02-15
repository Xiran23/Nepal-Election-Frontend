import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setOnlineStatus } from './store/offlineSlice';
// Pages
import HomePage from './pages/HomePage';
import DistrictPage from './pages/DistrictPage';
import ElectionResultsPage from './pages/ElectionResultsPage';
import CandidatePage from './pages/CandidatePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import RegisterPage from './pages/RegisterPage';
import ConstituencyPage from './pages/ConstituencyPage';
// Services

import { socketService } from './services/socketService';
import { setupSocketListeners } from './store/setupSocketListeners';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Sync offline status with Redux
    const handleStatusChange = () => {
      dispatch(setOnlineStatus(navigator.onLine));
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Initialize WebSockets
    socketService.connect();
    setupSocketListeners(dispatch);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      socketService.disconnect();
    };
  }, [dispatch]);

  return (
    <Router>
      <div className="App font-sans text-gray-900">
        <Routes>

          <Route path="/" element={<HomePage />} />
          <Route path="/districts/:id" element={<DistrictPage />} />
          <Route path="/districts/:districtId/constituency/:constituencyNo" element={<ConstituencyPage />} />
          <Route path="/results" element={<ElectionResultsPage />} />
          <Route path="/candidates" element={<CandidatePage />} />
          <Route path="/candidates/:id" element={<CandidatePage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<RegisterPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* <Route path="/" element={<HomePage />} />
          <Route path="/districts/:id" element={<DistrictPage />} />
          <Route path="/results" element={<ElectionResultsPage />} />
          <Route path="/candidates" element={<CandidatePage />} />
          <Route path="/candidates/:id" element={<CandidatePage />} />
          <Route path="/admin" element={<AdminDashboard />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
