import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { divIcon, type Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { incidentsApi, type IncidentGeoFeature, type IncidentCreateInput, buildBBoxFromBounds } from '../../../api/incidentsApi';
import { CreateIncidentModal } from '../components/CreateIncidentModal';
import { Toast } from '../../../components/ui/Toast';

// Fix para iconos de Leaflet en React
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const colorMap: Record<string, string> = {
    PENDING: '#fbbf24',
    IN_PROGRESS: '#3b82f6',
    SOLVED: '#10b981',
  };

  const color = colorMap[status] || '#ef4444';

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

// Icono para la ubicación del usuario
const getUserLocationIcon = () => {
  return divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        background-color: #3b82f6;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Icono para la posición seleccionada (preview)
const getSelectedPositionIcon = () => {
  return divIcon({
    className: 'selected-position-marker',
    html: `
      <div style="
        background-color: #10b981;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          width: 14px;
          height: 14px;
          border-radius: 50%;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #10b981;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Componente para actualizar el centro del mapa
function MapController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  const prevCenter = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (prevCenter.current === null || 
        prevCenter.current[0] !== center[0] || 
        prevCenter.current[1] !== center[1]) {
      map.setView(center, zoom || map.getZoom(), {
        animate: true,
        duration: 0.5,
      });
      prevCenter.current = center;
    }
  }, [center, zoom, map]);

  return null;
}

// Componente para obtener referencia al mapa
function MapRefHandler({ mapRef }: { mapRef: React.MutableRefObject<Map | null> }) {
  const map = useMap();
  
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return null;
}

// Componente para manejar clicks en el mapa
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

export const MapPage = () => {
  const queryClient = useQueryClient();
  const [center, setCenter] = useState<[number, number]>([CORDOBA_LAT, CORDOBA_LNG]);
  const [bbox, setBbox] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const mapRef = useRef<Map | null>(null);

  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition({ lat: latitude, lng: longitude });
          setCenter([latitude, longitude]);
          setBbox(calculateBbox(latitude, longitude));
          setLocationError(null);
          // Centrar mapa con zoom 15
          setMapCenter([latitude, longitude]);
          setMapZoom(15);
        },
        (_error) => {
          if (!bbox) {
            setBbox(calculateBbox(CORDOBA_LAT, CORDOBA_LNG));
          }
          setLocationError('No se pudo obtener tu ubicación. Mostrando Córdoba, Argentina.');
        }
      );
    } else {
      if (!bbox) {
        setBbox(calculateBbox(CORDOBA_LAT, CORDOBA_LNG));
      }
      setLocationError('Geolocalización no disponible. Mostrando Córdoba, Argentina.');
    }
  };

  // Leer parámetros de URL para centrar el mapa desde la lista
  const [searchParams, setSearchParams] = useSearchParams();
  const hasProcessedUrlParams = useRef(false);
  
  // Efecto para leer parámetros de URL cuando cambian
  useEffect(() => {
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const zoomParam = searchParams.get('zoom');
    
    if (latParam && lngParam && !hasProcessedUrlParams.current) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      const zoom = zoomParam ? parseFloat(zoomParam) : 16;
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setMapZoom(zoom);
        setBbox(calculateBbox(lat, lng));
        hasProcessedUrlParams.current = true;
        // Limpiar parámetros de URL después de usarlos
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);
  
  // Efecto inicial para pedir ubicación solo si no hay parámetros de URL
  useEffect(() => {
    if (!searchParams.get('lat') && !searchParams.get('lng') && !bbox) {
      requestUserLocation();
    }
  }, []);

  // Cargar incidentes: siempre habilitado, bbox solo si es válido
  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['incidents-geo', bbox],
    queryFn: () => {
      // Validar bbox antes de enviarlo usando la función helper
      const validBbox = bbox ? (() => {
        const parts = bbox.split(',');
        if (parts.length !== 4) return undefined;
        const [minLng, minLat, maxLng, maxLat] = parts.map(Number);
        const validated = buildBBoxFromBounds({ minLng, minLat, maxLng, maxLat });
        return validated || undefined;
      })() : undefined;
      
      return incidentsApi.getGeo({ 
        bbox: validBbox, 
        limit: 200 
      });
    },
    enabled: true, // Siempre habilitado para cargar todos los incidentes al inicio
  });

  const createMutation = useMutation({
    mutationFn: (data: IncidentCreateInput) => incidentsApi.create(data),
    onSuccess: async (response) => {
      if (response.success && response.data) {
        const incident = response.data;
        // Cerrar modal y limpiar posición seleccionada
        setIsCreateModalOpen(false);
        
        // Si el incidente tiene coordenadas, centrar el mapa ahí
        if (incident.latitude && incident.longitude) {
          // Limpiar posición seleccionada después de crear exitosamente
          setSelectedPosition(null);
          const incidentLat = Number(incident.latitude);
          const incidentLng = Number(incident.longitude);
          
          // Guardar el bbox anterior para verificar si el incidente estaba fuera
          const previousBbox = bbox;
          let wasOutsideBbox = false;
          if (previousBbox) {
            const [minLng, minLat, maxLng, maxLat] = previousBbox.split(',').map(Number);
            wasOutsideBbox = incidentLng < minLng || incidentLng > maxLng || 
                             incidentLat < minLat || incidentLat > maxLat;
          }
          
          // Actualizar bbox para incluir el nuevo incidente
          setBbox(calculateBbox(incidentLat, incidentLng));
          
          // Centrar mapa en el incidente con zoom 16
          setMapCenter([incidentLat, incidentLng]);
          setMapZoom(16);
          
          // Mostrar mensaje apropiado
          if (wasOutsideBbox) {
            setToast({ 
              message: 'Incidente creado, puede no estar visible en la vista actual', 
              type: 'warning' 
            });
          } else {
            setToast({ message: 'Incidente reportado exitosamente', type: 'success' });
          }
        } else {
          setToast({ message: 'Incidente reportado exitosamente', type: 'success' });
        }
        
        // Refrescar los markers
        await queryClient.invalidateQueries({ queryKey: ['incidents-geo'] });
      }
    },
    onError: (error: any) => {
      const message = error?.error?.message || 'Error al crear el incidente';
      setToast({ message, type: 'error' });
    },
  });

  const incidents = data?.success ? data.data.features : [];

  const handleCreateIncident = async (data: IncidentCreateInput) => {
    // Usar selectedPosition como obligatorio
    if (!selectedPosition) {
      setToast({ 
        message: 'Seleccioná un punto en el mapa antes de crear un incidente', 
        type: 'error' 
      });
      return;
    }

    const incidentData: IncidentCreateInput = {
      ...data,
      latitude: Number(selectedPosition.lat),
      longitude: Number(selectedPosition.lng),
    };
    await createMutation.mutateAsync(incidentData);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
  };

  const handleCreateClick = () => {
    // Si no hay posición seleccionada, mostrar mensaje
    if (!selectedPosition) {
      setToast({ 
        message: 'Seleccioná un punto en el mapa antes de crear un incidente', 
        type: 'warning' 
      });
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleMyLocationClick = () => {
    requestUserLocation();
  };

  // Limpiar posición seleccionada cuando se cierra el modal o se crea exitosamente
  useEffect(() => {
    if (!isCreateModalOpen && selectedPosition) {
      // No limpiar inmediatamente, solo cuando se cierra después de crear
      // Esto permite que el usuario vea donde creó el incidente
    }
  }, [isCreateModalOpen, selectedPosition]);

  // Limpiar el mensaje de error de ubicación después de 2 segundos
  useEffect(() => {
    if (locationError) {
      const timer = setTimeout(() => {
        setLocationError(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [locationError]);

  return (
    <div className="h-screen flex flex-col relative">
      {/* Botón Mi Ubicación */}
      <button
        onClick={handleMyLocationClick}
        className="fixed top-20 right-6 z-[1000] bg-white hover:bg-gray-50 text-gray-700 rounded-full p-3 shadow-lg border border-gray-300 transition-colors"
        aria-label="Mi ubicación"
        title="Centrar en mi ubicación"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* FAB Button */}
      <button
        onClick={handleCreateClick}
        className="fixed bottom-6 right-6 z-[1000] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-colors"
        aria-label="Reportar incidente"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="font-medium">Reportar incidente</span>
      </button>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center bg-white">
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      ) : queryError ? (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Error al cargar incidentes. Por favor, intenta nuevamente.
          </div>
        </div>
      ) : (
        <div className="flex-1 relative">
          {locationError && (
            <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm p-3 shadow-lg max-w-md">
                {locationError}
              </div>
            </div>
          )}
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <MapRefHandler mapRef={mapRef} />
            <MapClickHandler onMapClick={handleMapClick} />
            {mapCenter && <MapController center={mapCenter} zoom={mapZoom} />}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Marker de ubicación del usuario */}
            {userPosition && (
              <Marker
                position={[userPosition.lat, userPosition.lng]}
                icon={getUserLocationIcon()}
              >
                <Popup>
                  <div className="p-2">
                    <p className="text-sm font-semibold">Tu ubicación</p>
                  </div>
                </Popup>
              </Marker>
            )}
            {/* Marker de posición seleccionada (preview) */}
            {selectedPosition && (
              <Marker
                position={[selectedPosition.lat, selectedPosition.lng]}
                icon={getSelectedPositionIcon()}
              >
                <Popup>
                  <div className="p-2">
                    <p className="text-sm font-semibold">Ubicación seleccionada</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
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

          {incidents.length > 0 && (
            <div className="absolute bottom-20 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[999]">
              <p className="text-sm text-gray-700">
                <strong>{incidents.length}</strong> incidente{incidents.length !== 1 ? 's' : ''} en esta área
              </p>
            </div>
          )}
        </div>
      )}

      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateIncident}
        selectedPosition={selectedPosition}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  );
};
