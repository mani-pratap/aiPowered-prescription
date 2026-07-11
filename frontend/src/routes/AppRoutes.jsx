import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import PrescriptionUpload from '../pages/PrescriptionUpload';
import OCRResult from '../pages/OCRResult';
import UploadHistory from '../pages/UploadHistory';
import Navbar from '../components/layout/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Component (redirects to profile if logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/profile" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              <PrescriptionUpload />
            </ProtectedRoute>
          } />

          <Route path="/prescription/:id" element={
            <ProtectedRoute>
              <OCRResult />
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute>
              <UploadHistory />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
              <h1 className="text-6xl font-bold text-indigo-500 mb-4">404</h1>
              <p className="text-xl text-slate-400">Page not found</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default AppRoutes;
