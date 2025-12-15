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
import { useAuthStore } from '../store/authStore';

const ENABLE_AUTH = import.meta.env.VITE_ENABLE_AUTH === 'true';

const RootRedirect = () => {
  if (!ENABLE_AUTH) {
    return <Navigate to="/map" replace />;
  }

  const { token } = useAuthStore();
  if (token) {
    return <Navigate to="/app/incidents" replace />;
  }
  return <Navigate to="/login" replace />;
};

const LoginRedirect = () => {
  if (!ENABLE_AUTH) {
    return <Navigate to="/map" replace />;
  }
  return <LoginPage />;
};

const AppRoutesWrapper = () => {
  if (!ENABLE_AUTH) {
    return <Navigate to="/map" replace />;
  }
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - siempre disponible */}
        <Route path="/map" element={<MapPage />} />

        {/* Auth routes - bloqueadas si ENABLE_AUTH=false */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginRedirect />} />
        </Route>

        {/* Protected app routes - bloqueadas si ENABLE_AUTH=false */}
        <Route element={<AppRoutesWrapper />}>
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
        <Route path="/" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

