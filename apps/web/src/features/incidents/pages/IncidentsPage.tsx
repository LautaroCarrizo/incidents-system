import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { incidentsApi } from '../../../api/incidentsApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table } from '../../../components/ui/Table';

const PAGE_SIZE = 20;

export const IncidentsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['incidents-list', page, statusFilter, typeFilter, searchQuery],
    queryFn: () =>
      incidentsApi.getList({
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter || undefined,
        typeIncident: typeFilter || undefined,
        search: searchQuery || undefined,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search
  };

  const handleFilterChange = () => {
    setPage(1); // Reset to first page on filter change
  };

  const incidents = data?.success ? data.data.items : [];
  const meta = data?.success ? { page: data.data.page, pageSize: data.data.pageSize, total: data.data.total } : { page: 1, pageSize: PAGE_SIZE, total: 0 };
  const totalPages = Math.ceil(meta.total / meta.pageSize);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      PENDIENTE: 'warning',
      EN_PROGRESO: 'info',
      RESUELTO: 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
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
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Buscar"
            placeholder="Buscar en mensajes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            label="Estado"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              handleFilterChange();
            }}
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROGRESO">En Progreso</option>
            <option value="RESUELTO">Resuelto</option>
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
            <option value="ACCIDENTE">Accidente</option>
            <option value="DELITO">Delito</option>
            <option value="INCENDIO">Incendio</option>
            <option value="NATURAL">Natural</option>
            <option value="OTRO">Otro</option>
          </Select>
          <div className="flex items-end">
            <Button type="submit" className="w-full">Buscar</Button>
          </div>
        </form>
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
          <p className="text-gray-600">No se encontraron incidentes.</p>
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
                    <Table.Header>Fecha de Creación</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {incidents.map((incident) => (
                    <Table.Row key={incident.id}>
                      <Table.Cell>{incident.id}</Table.Cell>
                      <Table.Cell>{incident.typeIncident}</Table.Cell>
                      <Table.Cell>{getStatusBadge(incident.status)}</Table.Cell>
                      <Table.Cell>{formatDate(incident.createdAt)}</Table.Cell>
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
