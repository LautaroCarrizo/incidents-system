import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { IncidentCreateInput } from '../../../api/incidentsApi';

const createIncidentSchema = z.object({
  typeIncident: z.enum(['ROBBERY', 'FIRE', 'ACCIDENT', 'EMERGENCY']),
  message: z.string().min(5, 'El mensaje debe tener al menos 5 caracteres').max(500, 'El mensaje no puede exceder 500 caracteres'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().max(255).nullable().optional(),
});

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IncidentCreateInput) => Promise<void>;
  selectedPosition: { lat: number; lng: number } | null;
}

export const CreateIncidentModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedPosition,
}: CreateIncidentModalProps) => {
  const [typeIncident, setTypeIncident] = useState<IncidentCreateInput['typeIncident']>('ACCIDENT');
  const [message, setMessage] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTypeIncident('ACCIDENT');
      setMessage('');
      setAddress('');
      setErrors({});
    }
  }, [isOpen]);
  
  // Verificar que haya posición seleccionada
  const hasPosition = selectedPosition !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validar que haya posición seleccionada
    if (!selectedPosition) {
      setErrors({ general: 'Seleccioná un punto en el mapa antes de crear un incidente' });
      return;
    }

    const validation = createIncidentSchema.safeParse({
      typeIncident,
      message,
      latitude: selectedPosition.lat,
      longitude: selectedPosition.lng,
      address: address.trim() || null,
    });

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

    setIsSubmitting(true);
    try {
      await onSubmit({
        typeIncident,
        message,
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
        address: address.trim() || null,
      });
      onClose();
    } catch (error) {
      console.error('Error creating incident:', error);
      setErrors({ general: 'Error al crear el incidente. Por favor, intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reportar Incidente"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !hasPosition}>
            {isSubmitting ? 'Creando...' : 'Reportar'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        <Select
          label="Tipo de Incidente"
          value={typeIncident}
          onChange={(e) => setTypeIncident(e.target.value as IncidentCreateInput['typeIncident'])}
          error={errors.typeIncident}
          required
        >
          <option value="ACCIDENT">Accidente</option>
          <option value="ROBBERY">Robo</option>
          <option value="FIRE">Incendio</option>
          <option value="EMERGENCY">Emergencia</option>
        </Select>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe el incidente..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

        <Input
          label="Dirección (opcional)"
          type="text"
          placeholder="Dirección aproximada..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={errors.address}
        />

        {!hasPosition && (
          <div className="text-xs text-yellow-700 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            ⚠️ Seleccioná un punto en el mapa para continuar
          </div>
        )}
        {hasPosition && selectedPosition && (
          <div className="text-xs text-gray-600 p-2 bg-green-50 border border-green-200 rounded-lg">
            ✓ Ubicación seleccionada: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
          </div>
        )}
      </form>
    </Modal>
  );
};

