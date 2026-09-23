import { useState } from 'react';
import { rutasApi } from '../../api/ms2';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { ApiError, describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';
import type { Ruta, RutaInput } from '../../types/ms2';
import { RutaForm } from './RutaForm';

export function RutasListPage() {
  const { data, loading, error, reload } = useAsync(() => rutasApi.listar(), []);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Ruta | null>(null);
  const [deleting, setDeleting] = useState<Ruta | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();

  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleCreate(input: RutaInput) {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(undefined);
    try {
      await rutasApi.crear(input);
      setCreating(false);
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setFieldErrors(err.fieldErrors);
      setSubmitError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(input: RutaInput) {
    if (!editing) return;
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(undefined);
    try {
      await rutasApi.actualizar(editing.id, input);
      setEditing(null);
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setFieldErrors(err.fieldErrors);
      setSubmitError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await rutasApi.eliminar(deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setDeleteError(describeError(err));
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Rutas"
        description="Rutas del sistema de transporte (metropolitano y corredores)."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            + Nueva ruta
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
            emptyTitle="Todavía no hay rutas"
            emptyDescription="Registra la primera con “Nueva ruta”."
          >
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Tipo de servicio</th>
                    <th>Sentido</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.nombre}</td>
                      <td>{r.tipo_servicio}</td>
                      <td>{r.sentido}</td>
                      <td className="row-actions">
                        <Button size="sm" variant="secondary" onClick={() => setEditing(r)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleting(r)}>
                          Eliminar
                        </Button>
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
        <Modal title="Nueva ruta" onClose={() => setCreating(false)}>
          {submitError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{submitError}</div>}
          <RutaForm submitting={submitting} serverErrors={fieldErrors} onSubmit={handleCreate} onCancel={() => setCreating(false)} submitLabel="Crear ruta" />
        </Modal>
      )}

      {editing && (
        <Modal title={`Editar ruta ${editing.id}`} onClose={() => setEditing(null)}>
          {submitError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{submitError}</div>}
          <RutaForm
            initial={{ nombre: editing.nombre, tipo_servicio: editing.tipo_servicio, sentido: editing.sentido }}
            submitting={submitting}
            serverErrors={fieldErrors}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Guardar cambios"
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Eliminar ruta"
          message={`¿Eliminar la ruta “${deleting.nombre}” (${deleting.id})? Los servicios programados que la referencien pueden quedar inconsistentes.`}
          loading={deleteSubmitting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
