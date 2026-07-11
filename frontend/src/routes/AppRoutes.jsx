import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import PrescriptionUpload from '../pages/PrescriptionUpload';
import OCRResult from '../pages/OCRResult';
import UploadHistory from '../pages/UploadHistory';
import MedicinesList from '../pages/MedicinesList';
import MedicineDetails from '../pages/MedicineDetails';
import AdminMedicines from '../pages/AdminMedicines';
import AddMedicine from '../pages/AddMedicine';
import EditMedicine from '../pages/EditMedicine';

import DiseaseAnalysis from '../pages/DiseaseAnalysis';
import DietRecommendation from '../pages/DietRecommendation';
import PrescriptionGenerics from '../pages/PrescriptionGenerics';

// Shopping Module Pages
import MedicineStore from '../pages/MedicineStore';
import GenericComparison from '../pages/GenericComparison';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import OrderHistory from '../pages/OrderHistory';
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
          
          <Route path="/medicines" element={<MedicinesList />} />
          <Route path="/medicines/:id" element={<MedicineDetails />} />
          
          <Route path="/disease-analysis/:prescriptionId" element={
            <ProtectedRoute>
              <DiseaseAnalysis />
            </ProtectedRoute>
          } />
          <Route path="/disease-analysis/:prescriptionId/diet" element={
            <ProtectedRoute>
              <DietRecommendation />
            </ProtectedRoute>
          } />
          <Route path="/disease-analysis/:prescriptionId/generics" element={
            <ProtectedRoute>
              <PrescriptionGenerics />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/medicines" element={
            <ProtectedRoute>
              <AdminMedicines />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/medicines/add" element={
            <ProtectedRoute>
              <AddMedicine />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/medicines/edit/:id" element={
            <ProtectedRoute>
              <EditMedicine />
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
