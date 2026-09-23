import { useState } from 'react';
import { paraderosApi } from '../../api/ms2';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { ApiError, describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';
import type { ParaderoInput } from '../../types/ms2';
import { ParaderoForm } from './ParaderoForm';

export function ParaderosListPage() {
  const { data, loading, error, reload } = useAsync(() => paraderosApi.listar(), []);

  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();

  async function handleCreate(input: ParaderoInput) {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(undefined);
    try {
      await paraderosApi.crear(input);
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
        title="Paraderos"
        description="Paraderos registrados. Solo admiten alta y consulta."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            + Nuevo paradero
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
            emptyTitle="Todavía no hay paraderos"
            emptyDescription="Registra el primero con “Nuevo paradero”."
          >
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Ubicación (lat, lng)</th>
                    <th>Rutas asociadas</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nombre}</td>
                      <td>
                        {p.ubicacion.lat}, {p.ubicacion.lng}
                      </td>
                      <td>{p.rutas.length > 0 ? p.rutas.map((r) => r.nombre).join(', ') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AsyncBoundary>
        </div>
      </div>

      {creating && (
        <Modal title="Nuevo paradero" onClose={() => setCreating(false)}>
          {submitError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{submitError}</div>}
          <ParaderoForm submitting={submitting} serverErrors={fieldErrors} onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </Modal>
      )}
    </div>
  );
}
