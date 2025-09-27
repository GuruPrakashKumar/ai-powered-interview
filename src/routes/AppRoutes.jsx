import { Routes, Route } from 'react-router-dom';
import Interview from '../pages/Interview';
import Dashboard from '../pages/Dashboard';
import ChatBox from '../features/chat/ChatBox';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatBox />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default AppRoutes;