import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export const Topbar = () => {
  const { user, clearAuth } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/map" className="text-xl font-semibold text-gray-900">
            Incidents System
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-sm text-gray-700">{user.email}</span>
              <Button variant="secondary" size="sm" onClick={clearAuth}>
                Cerrar sesión
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

