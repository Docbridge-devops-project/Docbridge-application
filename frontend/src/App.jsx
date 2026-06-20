import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ConsultationsPage from './pages/ConsultationsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import LabReportsPage from './pages/LabReportsPage';
import SymptomsPage from './pages/SymptomsPage';
import RemindersPage from './pages/RemindersPage';
import FamilyPage from './pages/FamilyPage';
import AICompanionPage from './pages/AICompanionPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/consultations" element={<ConsultationsPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/labreports" element={<LabReportsPage />} />
            <Route path="/symptoms" element={<SymptomsPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/family" element={<FamilyPage />} />
            <Route path="/ai" element={<AICompanionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
