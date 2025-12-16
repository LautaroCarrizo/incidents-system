import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

import { useLocation } from 'react-router-dom';

export const AppLayout = () => {
  const location = useLocation();
  const isMapPage = location.pathname === '/app/map';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className={`flex-1 ${isMapPage ? 'p-0' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

