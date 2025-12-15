import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { incidentsApi } from '../../../api/incidentsApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Table } from '../../../components/ui/Table';

const PAGE_SIZE = 20;

export const IncidentsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['incidents-list', page, statusFilter, typeFilter],
    queryFn: () =>
      incidentsApi.getList({
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter || undefined,
        typeIncident: typeFilter || undefined,
      }),
  });

  const handleFilterChange = () => {
    setPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
  };

  const handleIncidentClick = (incident: any) => {
    // Si el incidente tiene coordenadas, navegar al mapa y centrarlo
    if (incident.latitude !== null && incident.latitude !== undefined && 
        incident.longitude !== null && incident.longitude !== undefined) {
      const lat = Number(incident.latitude);
      const lng = Number(incident.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        navigate(`/app/map?lat=${lat}&lng=${lng}&zoom=16`);
        return;
      }
    }
    // Mostrar aviso si no tiene coordenadas
    alert('Incidente sin ubicación');
  };

  const incidents = data?.success ? data.data.items : [];
  const meta = data?.success ? { page: data.data.page, pageSize: data.data.pageSize, total: data.data.total } : { page: 1, pageSize: PAGE_SIZE, total: 0 };
  const totalPages = Math.ceil(meta.total / meta.pageSize);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      PENDING: 'warning',
      IN_PROGRESS: 'info',
      SOLVED: 'success',
    };
    
    const statusLabels: Record<string, string> = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Progreso',
      SOLVED: 'Resuelto',
    };
    
    return <Badge variant={variants[status] || 'default'}>{statusLabels[status] || status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Incidentes</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Estado"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="SOLVED">Resuelto</option>
            </Select>
            <Select
              label="Tipo"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">Todos</option>
              <option value="ACCIDENT">Accidente</option>
              <option value="ROBBERY">Robo</option>
              <option value="FIRE">Incendio</option>
              <option value="EMERGENCY">Emergencia</option>
            </Select>
            <div className="flex items-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={handleClearFilters}
                disabled={!statusFilter && !typeFilter}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </div>

      {/* Lista de incidentes */}
      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <p className="text-gray-600">Cargando incidentes...</p>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Error al cargar incidentes. Por favor, intenta nuevamente.
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No se encontraron incidentes.</p>
            {(statusFilter || typeFilter) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearFilters}
                className="mt-4"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Mostrando {incidents.length} de {meta.total} incidentes
            </div>
            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header>ID</Table.Header>
                    <Table.Header>Tipo</Table.Header>
                    <Table.Header>Estado</Table.Header>
                    <Table.Header>Mensaje</Table.Header>
                    <Table.Header>Fecha</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {incidents.map((incident) => (
                    <Table.Row 
                      key={incident.id}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <Table.Cell onClick={() => handleIncidentClick(incident)}>{incident.id}</Table.Cell>
                      <Table.Cell onClick={() => handleIncidentClick(incident)}>{incident.typeIncident}</Table.Cell>
                      <Table.Cell onClick={() => handleIncidentClick(incident)}>{getStatusBadge(incident.status)}</Table.Cell>
                      <Table.Cell className="max-w-md truncate" onClick={() => handleIncidentClick(incident)}>
                        <span title={incident.message || ''}>
                          {incident.message || '-'}
                        </span>
                      </Table.Cell>
                      <Table.Cell onClick={() => handleIncidentClick(incident)}>{formatDate(incident.createdAt)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Página {meta.page} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
