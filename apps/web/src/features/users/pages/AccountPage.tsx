import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const AccountPage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar cambio de contraseña
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            required
          />
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            required
          />
          <Button type="submit">Change Password</Button>
        </form>
      </div>
    </div>
  );
};

