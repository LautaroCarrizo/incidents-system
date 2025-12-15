import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ENABLE_AUTH = import.meta.env.VITE_ENABLE_AUTH === 'true';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, token } = useAuthStore();

  // Si auth está deshabilitado, siempre permitir acceso
  if (!ENABLE_AUTH) {
    return <>{children}</>;
  }

  // Si auth está habilitado, validar token
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Validar admin si es requerido
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/app/incidents" replace />;
  }

  return <>{children}</>;
};

