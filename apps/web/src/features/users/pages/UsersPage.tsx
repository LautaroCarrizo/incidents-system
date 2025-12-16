import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../../api/usersApi';
import { Badge } from '../../../components/ui/Badge';
import { Table } from '../../../components/ui/Table';

const PAGE_SIZE = 50;

export const UsersPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => usersApi.getList({ pageSize: PAGE_SIZE }),
  });

  const users = data?.success ? data.data.items : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <p className="text-gray-600">Cargando usuarios...</p>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error && typeof error === 'object' && 'error' in error && (error as any).error?.message === 'Unauthorized' ? (
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
              'Error al cargar usuarios. Por favor, intenta nuevamente.'
            )}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No se encontraron usuarios.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Mostrando {users.length} usuario{users.length !== 1 ? 's' : ''}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header>ID</Table.Header>
                    <Table.Header>Nombre</Table.Header>
                    <Table.Header>Email</Table.Header>
                    <Table.Header>Rol</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {users.map((user: any) => (
                    <Table.Row key={user.id} className="hover:bg-gray-50">
                      <Table.Cell>{user.id}</Table.Cell>
                      <Table.Cell className="font-medium">{user.name}</Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>
                        {user.isAdmin ? (
                          <Badge variant="info">Administrador</Badge>
                        ) : (
                          <Badge variant="default">Usuario</Badge>
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
