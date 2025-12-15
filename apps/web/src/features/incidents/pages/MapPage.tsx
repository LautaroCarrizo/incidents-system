import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { incidentsApi } from '../../../api/incidentsApi';
import type { IncidentGeoFeature } from '../../../api/incidentsApi';

// Coordenadas de Córdoba, Argentina
const CORDOBA_LAT = -31.4201;
const CORDOBA_LNG = -64.1888;
const DEFAULT_RADIUS = 0.027; // ~3km en grados

// Calcular bbox alrededor de un punto
function calculateBbox(lat: number, lng: number, radius: number = DEFAULT_RADIUS): string {
  const minLat = lat - radius;
  const maxLat = lat + radius;
  const minLng = lng - radius;
  const maxLng = lng + radius;
  return `${minLng},${minLat},${maxLng},${maxLat}`;
}

// Iconos personalizados para los marcadores según el estado
const getMarkerIcon = (status: string) => {
  // Colores para cada estado (valores en inglés como vienen del backend)
  const colorMap: Record<string, string> = {
    PENDING: '#fbbf24',        // amarillo - Pendiente
    IN_PROGRESS: '#3b82f6',    // azul - En progreso
    SOLVED: '#10b981',         // verde - Resuelto
  };

  const color = colorMap[status] || '#ef4444'; // rojo por defecto

  // Crear un icono HTML personalizado con un círculo de color
  return divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export const MapPage = () => {
  const [center, setCenter] = useState<[number, number]>([CORDOBA_LAT, CORDOBA_LNG]);
  const [bbox, setBbox] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
          setBbox(calculateBbox(latitude, longitude));
          setLocationError(null);
        },
        (_error) => {
          // Usar ubicación por defecto (Córdoba)
          setBbox(calculateBbox(CORDOBA_LAT, CORDOBA_LNG));
          setLocationError('No se pudo obtener tu ubicación. Mostrando Córdoba, Argentina.');
        }
      );
    } else {
      setBbox(calculateBbox(CORDOBA_LAT, CORDOBA_LNG));
      setLocationError('Geolocalización no disponible. Mostrando Córdoba, Argentina.');
    }
  }, []);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['incidents-geo', bbox],
    queryFn: () => incidentsApi.getGeo({ bbox: bbox || undefined, limit: 200 }),
    enabled: !!bbox,
  });

  const incidents = data?.success ? data.data.features : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mapa</h1>
      
      {locationError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          {locationError}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      ) : queryError ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Error al cargar incidentes. Por favor, intenta nuevamente.
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="h-[600px] w-full relative">
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {incidents.map((feature: IncidentGeoFeature) => {
                const [lng, lat] = feature.geometry.coordinates;
                const { id, typeIncident, status, message, address } = feature.properties;
                return (
                  <Marker
                    key={id}
                    position={[lat, lng]}
                    icon={getMarkerIcon(status)}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm mb-1">Incidente #{id}</h3>
                        <p className="text-xs text-gray-600 mb-1">
                          <strong>Tipo:</strong> {typeIncident}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          <strong>Estado:</strong> {status}
                        </p>
                        {address && (
                          <p className="text-xs text-gray-600 mb-1">
                            <strong>Dirección:</strong> {address}
                          </p>
                        )}
                        <p className="text-xs text-gray-700 mt-2">{message}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
          {incidents.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                Mostrando <strong>{incidents.length}</strong> incidente{incidents.length !== 1 ? 's' : ''} en esta área
              </p>
            </div>
          )}
          {incidents.length === 0 && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600">No hay incidentes en esta área.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
