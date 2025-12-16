import { Outlet, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Coordenadas de Córdoba, Argentina
const CORDOBA_LAT = -31.4201;
const CORDOBA_LNG = -64.1888;

export const AuthLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex">
        {/* Mapa - 60% */}
        <div className="w-[60%] relative">
          <MapContainer
            center={[CORDOBA_LAT, CORDOBA_LNG]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            scrollWheelZoom={false}
            dragging={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
        </div>
        
        {/* Formulario - 40% */}
        <div className="w-[40%] bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    );
  }

  // Para otras rutas de auth (ej: register), mantener el diseño centrado
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

