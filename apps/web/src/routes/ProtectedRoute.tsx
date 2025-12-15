import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, token } = useAuthStore();

  // Por ahora solo renderiza children, sin validación real
  // TODO: Implementar validación de autenticación
  if (!token || !user) {
    // En el futuro, redirigir al login
    // return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user?.isAdmin) {
    // En el futuro, mostrar acceso denegado
    // return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

