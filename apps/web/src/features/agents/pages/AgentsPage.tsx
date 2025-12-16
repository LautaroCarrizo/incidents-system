import { useQuery } from '@tanstack/react-query';
import { agentsApi } from '../../../api/agentsApi';
import { Badge } from '../../../components/ui/Badge';
import { Table } from '../../../components/ui/Table';

const PAGE_SIZE = 50;

export const AgentsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['agents-list'],
    queryFn: () => agentsApi.getList({ pageSize: PAGE_SIZE }),
  });

  const agents = data?.success ? data.data.items : [];

  const getAgentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      ONLINE: 'success',
      OFFLINE: 'default',
      BUSY: 'warning',
      ON_CALL: 'info',
    };
    
    const statusLabels: Record<string, string> = {
      ONLINE: 'En línea',
      OFFLINE: 'Desconectado',
      BUSY: 'Ocupado',
      ON_CALL: 'En llamada',
    };
    
    return <Badge variant={variants[status] || 'default'}>{statusLabels[status] || status}</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agentes</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <p className="text-gray-600">Cargando agentes...</p>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Error al cargar agentes. Por favor, intenta nuevamente.
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No se encontraron agentes.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Mostrando {agents.length} agente{agents.length !== 1 ? 's' : ''}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header>ID</Table.Header>
                    <Table.Header>Nombre</Table.Header>
                    <Table.Header>Tipo</Table.Header>
                    <Table.Header>Estado</Table.Header>
                    <Table.Header>Capacidad</Table.Header>
                    <Table.Header>Asignaciones Activas</Table.Header>
                    <Table.Header>Jurisdicción</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {agents.map((agent: any) => (
                    <Table.Row key={agent.id} className="hover:bg-gray-50">
                      <Table.Cell>{agent.id}</Table.Cell>
                      <Table.Cell>
                        {agent.agentName || `Agente #${agent.id}`}
                      </Table.Cell>
                      <Table.Cell>
                        {agent.agentType || '-'}
                      </Table.Cell>
                      <Table.Cell>{getAgentStatusBadge(agent.status)}</Table.Cell>
                      <Table.Cell>{agent.capacity || '-'}</Table.Cell>
                      <Table.Cell>
                        {agent.activeAssignmentsCount !== undefined ? (
                          <span className="font-medium">
                            {agent.activeAssignmentsCount}
                          </span>
                        ) : (
                          '-'
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {agent.jurisdiction || (
                          <span className="text-gray-400 italic">Sin jurisdicción</span>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
