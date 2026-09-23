import { useState } from 'react';
import { serviciosApi, rutasApi } from '../../api/ms2';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Field } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { ApiError, describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';
import type { Servicio, ServicioInput } from '../../types/ms2';
import { ServicioForm } from './ServicioForm';

export function ServiciosListPage() {
  const [filterRuta, setFilterRuta] = useState('');
  const [filterFecha, setFilterFecha] = useState('');

  const rutas = useAsync(() => rutasApi.listar(), []);
  const { data, loading, error, reload } = useAsync(
    () => serviciosApi.listar(filterRuta || undefined, filterFecha || undefined),
    [filterRuta, filterFecha],
  );

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [deleting, setDeleting] = useState<Servicio | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();

  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleCreate(input: ServicioInput) {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(undefined);
    try {
      await serviciosApi.crear(input);
      setCreating(false);
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setFieldErrors(err.fieldErrors);
      setSubmitError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(input: ServicioInput) {
    if (!editing) return;
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(undefined);
    try {
      await serviciosApi.actualizar(editing.id, input);
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
      await serviciosApi.eliminar(deleting.id);
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
        title="Servicios programados"
        description="Cada servicio asocia una ruta con una fecha, un horario y el orden de paraderos que recorre."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            + Nuevo servicio
          </Button>
        }
      />

      <div className="card">
        <div className="card-section">
          <div className="inline-form">
            <Field label="Filtrar por ruta" htmlFor="filtro-ruta">
              <select id="filtro-ruta" value={filterRuta} onChange={(e) => setFilterRuta(e.target.value)}>
                <option value="">Todas las rutas</option>
                {rutas.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} ({r.id})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Filtrar por fecha" htmlFor="filtro-fecha">
              <input id="filtro-fecha" type="date" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} />
            </Field>
            {(filterRuta || filterFecha) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterRuta('');
                  setFilterFecha('');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
        <div className="card-section">
          <AsyncBoundary
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={!!data && data.length === 0}
            emptyTitle="No hay servicios para el filtro actual"
            emptyDescription="Ajusta los filtros o registra un nuevo servicio."
          >
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ruta</th>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Paraderos</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.ruta_id}</td>
                      <td>{s.fecha}</td>
                      <td>
                        {s.hora_inicio} – {s.hora_fin}
                      </td>
                      <td>{s.paraderos.length}</td>
                      <td className="row-actions">
                        <Button size="sm" variant="secondary" onClick={() => setEditing(s)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleting(s)}>
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
        <Modal title="Nuevo servicio programado" onClose={() => setCreating(false)}>
          {submitError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{submitError}</div>}
          <ServicioForm submitting={submitting} serverErrors={fieldErrors} onSubmit={handleCreate} onCancel={() => setCreating(false)} submitLabel="Crear servicio" />
        </Modal>
      )}

      {editing && (
        <Modal title={`Editar servicio ${editing.id}`} onClose={() => setEditing(null)}>
          {submitError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{submitError}</div>}
          <ServicioForm
            initial={{ ruta_id: editing.ruta_id, fecha: editing.fecha, hora_inicio: editing.hora_inicio, hora_fin: editing.hora_fin, paraderos: editing.paraderos }}
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
          title="Eliminar servicio"
          message={`¿Eliminar el servicio ${deleting.id} de la ruta ${deleting.ruta_id} programado para el ${deleting.fecha}?`}
          loading={deleteSubmitting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
