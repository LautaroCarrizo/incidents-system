import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export const ForbiddenPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Forbidden</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this resource.
        </p>
        <Link to="/app/map">
          <Button>Volver al mapa</Button>
        </Link>
      </div>
    </div>
  );
};

