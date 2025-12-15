import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { MapPage } from '../features/incidents/pages/MapPage';
import { IncidentsPage } from '../features/incidents/pages/IncidentsPage';
import { AgentsPage } from '../features/agents/pages/AgentsPage';
import { AssignmentsPage } from '../features/assignments/pages/AssignmentsPage';
import { UsersPage } from '../features/users/pages/UsersPage';
import { AccountPage } from '../features/users/pages/AccountPage';
import { DashboardPage } from '../features/users/pages/DashboardPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/map" element={<MapPage />} />
        
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected app routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/incidents" element={<IncidentsPage />} />
          <Route path="/app/agents" element={<AgentsPage />} />
          <Route path="/app/assignments" element={<AssignmentsPage />} />
          <Route
            path="/app/users"
            element={
              <ProtectedRoute requireAdmin>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/app/account" element={<AccountPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/map" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

