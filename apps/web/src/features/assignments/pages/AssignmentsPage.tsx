import { useQuery } from '@tanstack/react-query';
import { assignmentsApi } from '../../../api/assignmentsApi';
import { incidentsApi } from '../../../api/incidentsApi';
import { agentsApi } from '../../../api/agentsApi';
import { Badge } from '../../../components/ui/Badge';

const PAGE_SIZE = 100; // Máximo permitido por el backend

export const AssignmentsPage = () => {
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['assignments-list'],
    queryFn: () => assignmentsApi.getList({ pageSize: PAGE_SIZE }),
  });

  const { data: incidentsData } = useQuery({
    queryKey: ['incidents-list-for-assignments'],
    queryFn: () => incidentsApi.getList({ pageSize: PAGE_SIZE }),
  });

  const { data: agentsData } = useQuery({
    queryKey: ['agents-list-for-assignments'],
    queryFn: () => agentsApi.getList({ pageSize: PAGE_SIZE }),
  });

  const assignments = assignmentsData?.success ? assignmentsData.data.items : [];
  const incidents = incidentsData?.success ? incidentsData.data.items : [];
  const agents = agentsData?.success ? agentsData.data.items : [];

  // Crear mapas para búsqueda rápida
  const incidentsMap = new Map();
  incidents.forEach((incident: any) => {
    incidentsMap.set(incident.id, incident);
  });

  const agentsMap = new Map();
  agents.forEach((agent: any) => {
    agentsMap.set(agent.id, agent);
  });

  // Agrupar assignments por incidentId
  const assignmentsByIncident = new Map();
  assignments.forEach((assignment: any) => {
    if (!assignmentsByIncident.has(assignment.incidentId)) {
      assignmentsByIncident.set(assignment.incidentId, []);
    }
    assignmentsByIncident.get(assignment.incidentId).push(assignment);
  });

  const getIncidentStatusBadge = (status: string) => {
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

  // Obtener array de incidentes con sus assignments
  const incidentGroups = Array.from(assignmentsByIncident.entries())
    .map(([incidentId, assignments]: [number, any[]]) => {
      const incident = incidentsMap.get(incidentId);
      return {
        incident,
        assignments: assignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      };
    })
    .filter((group) => group.incident) // Solo mostrar incidentes que existen
    .sort((a, b) => new Date(b.incident.createdAt).getTime() - new Date(a.incident.createdAt).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Asignaciones</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoadingAssignments ? (
          <div className="p-6">
            <p className="text-gray-600">Cargando asignaciones...</p>
          </div>
        ) : assignmentsData && !assignmentsData.success ? (
          <div className="p-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {assignmentsData.error?.code === 'UNAUTHORIZED' ? (
                <>
                  <p className="mb-2">Sesión expirada. Por favor, volvé a iniciar sesión.</p>
                  <button
                    onClick={() => {
                      window.location.href = '/login';
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Ir al login
                  </button>
                </>
              ) : (
                'Error al cargar asignaciones. Por favor, intenta nuevamente.'
              )}
            </div>
          </div>
        ) : incidentGroups.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No hay asignaciones registradas.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {incidentGroups.map((group: any) => (
              <div key={group.incident.id} className="p-6">
                {/* Header del incidente */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Incidente #{group.incident.id} - {group.incident.typeIncident}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Estado del incidente:</span>
                        {getIncidentStatusBadge(group.incident.status)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(group.incident.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Lista de agentes asignados */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Agentes asignados ({group.assignments.length})</h4>
                  {group.assignments.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No hay agentes asignados</p>
                  ) : (
                    <div className="space-y-2">
                      {group.assignments.map((assignment: any) => {
                        const agent = agentsMap.get(assignment.agentId);
                        return (
                          <div
                            key={assignment.id}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {agent ? `Agente #${agent.id}` : `Agente #${assignment.agentId}`}
                                  </span>
                                  {getAssignmentStatusBadge(assignment.status)}
                                </div>
                                {agent && (
                                  <div className="text-sm text-gray-600">
                                    {agent.agentName && <span>Nombre: {agent.agentName}</span>}
                                    {agent.agentType && (
                                      <span className="ml-3">Tipo: {agent.agentType}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Asignado: {formatDate(assignment.createdAt)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
