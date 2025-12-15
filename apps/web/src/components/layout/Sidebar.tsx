import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  label: string;
  path: string;
  adminOnly?: boolean;
}

const allNavItems: NavItem[] = [
  { label: 'Home', path: '/app/map' },
  { label: 'Incidentes', path: '/app/incidents' },
  { label: 'Assignments', path: '/app/assignments', adminOnly: true },
  { label: 'Agents', path: '/app/agents', adminOnly: true },
  { label: 'Users', path: '/app/users', adminOnly: true },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  // Filtrar items según el rol del usuario
  const navItems = allNavItems.filter(
    (item) => !item.adminOnly || user?.isAdmin
  );

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">Incidents System</h2>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

