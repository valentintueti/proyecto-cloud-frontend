import { useState } from 'react';
import { Link } from 'react-router-dom';
import { pasajerosApi } from '../../api/ms1';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { ApiError, describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';
import type { PasajeroInput } from '../../types/ms1';
import { PasajeroForm } from './PasajeroForm';

export function PasajerosListPage() {
  const { data, loading, error, reload } = useAsync(() => pasajerosApi.listar(), []);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();

  async function handleCreate(input: PasajeroInput) {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(undefined);
    try {
      await pasajerosApi.crear(input);
      setCreating(false);
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setFieldErrors(err.fieldErrors);
      setSubmitError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Pasajeros"
        description="Alta y consulta de pasajeros registrados en MS1. Cada pasajero puede tener varias tarjetas asociadas."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            + Nuevo pasajero
          </Button>
        }
      />

      <div className="card">
        <div className="card-section">
          <AsyncBoundary
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={!!data && data.length === 0}
            emptyTitle="Todavía no hay pasajeros"
            emptyDescription="Registra el primero con el botón “Nuevo pasajero”."
          >
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Fecha de nacimiento</th>
                    <th>Sexo</th>
                    <th>Distrito</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nombre}</td>
                      <td>{p.fechaNacimiento}</td>
                      <td>{p.sexo}</td>
                      <td>{p.distrito}</td>
                      <td className="row-actions">
                        <Link to={`/pasajeros/${p.id}`} className="btn btn-secondary btn-sm">
                          Ver / editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AsyncBoundary>
        </div>
      </div>

      {creating && (
        <Modal title="Nuevo pasajero" onClose={() => setCreating(false)}>
          {submitError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{submitError}</div>}
          <PasajeroForm
            submitting={submitting}
            serverErrors={fieldErrors}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
            submitLabel="Crear pasajero"
          />
        </Modal>
      )}
    </div>
  );
}
