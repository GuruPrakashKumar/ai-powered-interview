import { Routes, Route } from 'react-router-dom';
import ChatBox from '../features/chat/ChatBox';
import InterviewerDashboard from '../features/candidates/InterviewerDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatBox />} />
      <Route path="/dashboard" element={<InterviewerDashboard />} />
    </Routes>
  );
};

export default AppRoutes;