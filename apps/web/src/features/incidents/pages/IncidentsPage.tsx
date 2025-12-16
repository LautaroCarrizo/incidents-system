import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { incidentsApi } from '../../../api/incidentsApi';
import { assignmentsApi } from '../../../api/assignmentsApi';
import { agentsApi } from '../../../api/agentsApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Table } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';

const PAGE_SIZE = 20;

export const IncidentsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<number | null>(null);

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

  // Obtener assignments para el incidente seleccionado
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['assignments-list'],
    queryFn: () => assignmentsApi.getList({ pageSize: 100 }), // Máximo permitido por el backend
    enabled: selectedIncident !== null,
  });

  // Obtener agents
  const { data: agentsData } = useQuery({
    queryKey: ['agents-list'],
    queryFn: () => agentsApi.getList({ pageSize: 100 }), // Máximo permitido por el backend
    enabled: selectedIncident !== null,
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
    setSelectedIncident(incident.id);
  };

  const handleViewOnMap = (incident: any) => {
    if (incident.latitude !== null && incident.latitude !== undefined && 
        incident.longitude !== null && incident.longitude !== undefined) {
      const lat = Number(incident.latitude);
      const lng = Number(incident.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        navigate(`/app/map?lat=${lat}&lng=${lng}&zoom=16`);
        return;
      }
    }
    alert('Incidente sin ubicación');
  };

  const incidents = data?.success ? data.data.items : [];
  const meta = data?.success ? { page: data.data.page, pageSize: data.data.pageSize, total: data.data.total } : { page: 1, pageSize: PAGE_SIZE, total: 0 };
  const totalPages = Math.ceil(meta.total / meta.pageSize);

  // Obtener assignments del incidente seleccionado
  const incidentAssignments = selectedIncident
    ? (assignmentsData?.success ? assignmentsData.data.items.filter((a: any) => a.incidentId === selectedIncident) : [])
    : [];

  // Obtener agents mapeados por ID
  const agentsMap = new Map();
  if (agentsData?.success) {
    agentsData.data.items.forEach((agent: any) => {
      agentsMap.set(agent.id, agent);
    });
  }

  const selectedIncidentData = incidents.find((i: any) => i.id === selectedIncident);

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

  const getAssignmentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      PENDING: 'warning',
      ACCEPTED: 'info',
      IN_PROGRESS: 'info',
      RESOLVED: 'success',
      CLOSED: 'success',
      REJECTED: 'danger',
    };
    
    const statusLabels: Record<string, string> = {
      PENDING: 'Pendiente',
      ACCEPTED: 'Aceptado',
      IN_PROGRESS: 'En Progreso',
      RESOLVED: 'Resuelto',
      CLOSED: 'Cerrado',
      REJECTED: 'Rechazado',
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
                    <Table.Header>Acciones</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {incidents.map((incident: any) => (
                    <Table.Row 
                      key={incident.id}
                      className="hover:bg-gray-50"
                    >
                      <Table.Cell>{incident.id}</Table.Cell>
                      <Table.Cell>{incident.typeIncident}</Table.Cell>
                      <Table.Cell>{getStatusBadge(incident.status)}</Table.Cell>
                      <Table.Cell className="max-w-md truncate">
                        <span title={incident.message || ''}>
                          {incident.message || '-'}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{formatDate(incident.createdAt)}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleIncidentClick(incident)}
                          >
                            Ver detalles
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewOnMap(incident)}
                          >
                            Ver en mapa
                          </Button>
                        </div>
                      </Table.Cell>
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

      {/* Modal de detalles del incidente */}
      <Modal
        isOpen={selectedIncident !== null}
        onClose={() => setSelectedIncident(null)}
        title={`Detalles del Incidente #${selectedIncident}`}
      >
        {selectedIncidentData && (
          <div className="space-y-6">
            {/* Información del incidente */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Incidente</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <span className="text-gray-900">{selectedIncidentData.typeIncident}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Estado:</span>
                  {getStatusBadge(selectedIncidentData.status)}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Fecha:</span>
                  <span className="text-gray-900">{formatDate(selectedIncidentData.createdAt)}</span>
                </div>
                {selectedIncidentData.message && (
                  <div>
                    <span className="font-medium text-gray-700">Mensaje:</span>
                    <p className="text-gray-900 mt-1">{selectedIncidentData.message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Agentes asignados */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agentes Asignados</h3>
              {isLoadingAssignments ? (
                <p className="text-gray-600">Cargando asignaciones...</p>
              ) : incidentAssignments.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                  No hay agentes asignados a este incidente.
                </div>
              ) : (
                <div className="space-y-3">
                  {incidentAssignments.map((assignment: any) => {
                    const agent = agentsMap.get(assignment.agentId);
                    return (
                      <div key={assignment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {agent ? `Agente #${agent.id}` : `Agente #${assignment.agentId}`}
                              </span>
                              {getAssignmentStatusBadge(assignment.status)}
                            </div>
                            {agent && (
                              <div className="text-sm text-gray-600 space-y-1">
                                {agent.agentName && (
                                  <div>Nombre: {agent.agentName}</div>
                                )}
                                {agent.agentType && (
                                  <div>Tipo: {agent.agentType}</div>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                              Asignado: {formatDate(assignment.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
