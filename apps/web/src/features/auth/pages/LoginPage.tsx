import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { authApi } from '../../../api/authApi';
import { useAuthStore } from '../../../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    // Validación con zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      if (response.success) {
        setAuth({
          token: response.data.accessToken,
          user: response.data.user,
        });
        navigate('/app/map', { replace: true });
      } else {
        // Manejar errores del backend
        if (response.error.code === 'UNPROCESSABLE_ENTITY' && response.error.details) {
          if (typeof response.error.details === 'object') {
            const fieldErrors: Record<string, string> = {};
            Object.entries(response.error.details).forEach(([key, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                fieldErrors[key] = messages[0];
              }
            });
            setErrors(fieldErrors);
          }
        }
        setGeneralError(response.error.message);
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h1>
      <p className="text-gray-600 mb-8">Inicia sesión en tu cuenta</p>
      
      {generalError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {generalError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>
    </div>
  );
};

