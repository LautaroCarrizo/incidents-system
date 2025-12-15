import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/app/incidents">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">Incidents</h2>
            <p className="text-gray-600 text-sm">Manage incidents</p>
          </div>
        </Link>
        <Link to="/app/agents">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">Agents</h2>
            <p className="text-gray-600 text-sm">Manage agents</p>
          </div>
        </Link>
        <Link to="/app/assignments">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">Assignments</h2>
            <p className="text-gray-600 text-sm">Manage assignments</p>
          </div>
        </Link>
        <Link to="/app/users">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">Users</h2>
            <p className="text-gray-600 text-sm">Manage users</p>
          </div>
        </Link>
        <Link to="/app/account">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">Account</h2>
            <p className="text-gray-600 text-sm">Account settings</p>
          </div>
        </Link>
        <Link to="/map">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">Map View</h2>
            <p className="text-gray-600 text-sm">View incidents on map</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

