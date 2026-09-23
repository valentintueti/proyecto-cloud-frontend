import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pasajerosApi, tarjetasApi } from '../../api/ms1';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { ApiError, describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';
import type { PasajeroInput, Tarjeta, TarjetaInput } from '../../types/ms1';
import { PasajeroForm } from './PasajeroForm';
import { TarjetaCreateForm } from '../tarjetas/TarjetaCreateForm';
import { TarjetaSaldoForm } from '../tarjetas/TarjetaSaldoForm';

export function PasajeroDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pasajeroId = Number(id);
  const navigate = useNavigate();

  const pasajero = useAsync(() => pasajerosApi.obtener(pasajeroId), [pasajeroId]);
  const tarjetas = useAsync(() => pasajerosApi.tarjetasDePasajero(pasajeroId), [pasajeroId]);

  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>();

  const [deletingPasajero, setDeletingPasajero] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [creatingTarjeta, setCreatingTarjeta] = useState(false);
  const [tarjetaSubmitting, setTarjetaSubmitting] = useState(false);
  const [tarjetaError, setTarjetaError] = useState<string | null>(null);
  const [tarjetaFieldErrors, setTarjetaFieldErrors] = useState<Record<string, string>>();

  const [editingTarjeta, setEditingTarjeta] = useState<Tarjeta | null>(null);
  const [saldoSubmitting, setSaldoSubmitting] = useState(false);
  const [saldoError, setSaldoError] = useState<string | null>(null);
  const [saldoFieldErrors, setSaldoFieldErrors] = useState<Record<string, string>>();

  const [deletingTarjeta, setDeletingTarjeta] = useState<Tarjeta | null>(null);
  const [deleteTarjetaSubmitting, setDeleteTarjetaSubmitting] = useState(false);
  const [deleteTarjetaError, setDeleteTarjetaError] = useState<string | null>(null);

  async function handleEdit(input: PasajeroInput) {
    setEditSubmitting(true);
    setEditError(null);
    setEditFieldErrors(undefined);
    try {
      await pasajerosApi.actualizar(pasajeroId, input);
      pasajero.reload();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setEditFieldErrors(err.fieldErrors);
      setEditError(describeError(err));
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDeletePasajero() {
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await pasajerosApi.eliminar(pasajeroId);
      navigate('/pasajeros');
    } catch (err) {
      setDeleteError(describeError(err));
    } finally {
      setDeleteSubmitting(false);
    }
  }

  async function handleCreateTarjeta(input: TarjetaInput) {
    setTarjetaSubmitting(true);
    setTarjetaError(null);
    setTarjetaFieldErrors(undefined);
    try {
      await tarjetasApi.crear(input);
      setCreatingTarjeta(false);
      tarjetas.reload();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setTarjetaFieldErrors(err.fieldErrors);
      setTarjetaError(describeError(err));
    } finally {
      setTarjetaSubmitting(false);
    }
  }

  async function handleUpdateSaldo(saldo: number) {
    if (!editingTarjeta) return;
    setSaldoSubmitting(true);
    setSaldoError(null);
    setSaldoFieldErrors(undefined);
    try {
      await tarjetasApi.actualizarSaldo(editingTarjeta.id, { saldo });
      setEditingTarjeta(null);
      tarjetas.reload();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setSaldoFieldErrors(err.fieldErrors);
      setSaldoError(describeError(err));
    } finally {
      setSaldoSubmitting(false);
    }
  }

  async function handleDeleteTarjeta() {
    if (!deletingTarjeta) return;
    setDeleteTarjetaSubmitting(true);
    setDeleteTarjetaError(null);
    try {
      await tarjetasApi.eliminar(deletingTarjeta.id);
      setDeletingTarjeta(null);
      tarjetas.reload();
    } catch (err) {
      setDeleteTarjetaError(describeError(err));
    } finally {
      setDeleteTarjetaSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={pasajero.data ? `Pasajero: ${pasajero.data.nombre}` : `Pasajero #${pasajeroId}`}
        description="Edita los datos del pasajero o gestiona sus tarjetas asociadas."
        actions={
          <Button variant="danger" onClick={() => setDeletingPasajero(true)} disabled={!pasajero.data}>
            Eliminar pasajero
          </Button>
        }
      />

      <div className="card">
        <div className="card-section">
          <AsyncBoundary loading={pasajero.loading} error={pasajero.error} onRetry={pasajero.reload}>
            {pasajero.data && (
              <>
                {editError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{editError}</div>}
                <PasajeroForm
                  initial={{
                    nombre: pasajero.data.nombre,
                    fechaNacimiento: pasajero.data.fechaNacimiento,
                    sexo: pasajero.data.sexo,
                    distrito: pasajero.data.distrito,
                  }}
                  submitting={editSubmitting}
                  serverErrors={editFieldErrors}
                  onSubmit={handleEdit}
                  submitLabel="Guardar cambios"
                />
              </>
            )}
          </AsyncBoundary>
        </div>
      </div>

      <div className="card">
        <div className="card-section">
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div>
              <h1 style={{ fontSize: '1.05rem' }}>Tarjetas del pasajero</h1>
              <p>Cada tarjeta tiene un saldo independiente.</p>
            </div>
            <div className="page-header-actions">
              <Button variant="primary" onClick={() => setCreatingTarjeta(true)}>
                + Nueva tarjeta
              </Button>
            </div>
          </div>

          <AsyncBoundary
            loading={tarjetas.loading}
            error={tarjetas.error}
            onRetry={tarjetas.reload}
            isEmpty={!!tarjetas.data && tarjetas.data.length === 0}
            emptyTitle="Este pasajero no tiene tarjetas"
            emptyDescription="Usa “Nueva tarjeta” para registrar la primera."
          >
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Saldo (S/)</th>
                    <th>Emisión</th>
                    <th>Vencimiento</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tarjetas.data?.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.tipo}</td>
                      <td>{t.saldo.toFixed(2)}</td>
                      <td>{t.fechaEmision}</td>
                      <td>{t.fechaVencimiento ?? '—'}</td>
                      <td className="row-actions">
                        <Button size="sm" variant="secondary" onClick={() => setEditingTarjeta(t)}>
                          Editar saldo
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeletingTarjeta(t)}>
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

      {creatingTarjeta && (
        <Modal title="Nueva tarjeta" onClose={() => setCreatingTarjeta(false)}>
          {tarjetaError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{tarjetaError}</div>}
          <TarjetaCreateForm
            pasajeroId={pasajeroId}
            submitting={tarjetaSubmitting}
            serverErrors={tarjetaFieldErrors}
            onSubmit={handleCreateTarjeta}
            onCancel={() => setCreatingTarjeta(false)}
          />
        </Modal>
      )}

      {editingTarjeta && (
        <Modal title={`Editar saldo · Tarjeta #${editingTarjeta.id}`} onClose={() => setEditingTarjeta(null)}>
          {saldoError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{saldoError}</div>}
          <TarjetaSaldoForm
            saldoActual={editingTarjeta.saldo}
            submitting={saldoSubmitting}
            serverErrors={saldoFieldErrors}
            onSubmit={handleUpdateSaldo}
            onCancel={() => setEditingTarjeta(null)}
          />
        </Modal>
      )}

      {deletingTarjeta && (
        <ConfirmDialog
          title="Eliminar tarjeta"
          message={`¿Eliminar la tarjeta #${deletingTarjeta.id} (${deletingTarjeta.tipo})? Esta acción no se puede deshacer.`}
          loading={deleteTarjetaSubmitting}
          error={deleteTarjetaError}
          onConfirm={handleDeleteTarjeta}
          onCancel={() => setDeletingTarjeta(null)}
        />
      )}

      {deletingPasajero && (
        <ConfirmDialog
          title="Eliminar pasajero"
          message="Esta acción eliminará al pasajero y, según el comportamiento del backend, también sus tarjetas asociadas. No se puede deshacer."
          loading={deleteSubmitting}
          error={deleteError}
          onConfirm={handleDeletePasajero}
          onCancel={() => setDeletingPasajero(false)}
        />
      )}
    </div>
  );
}
