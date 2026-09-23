import { useState } from 'react';
import { conexionesApi, viajesApi } from '../../api/ms3';
import { PasajeroSelector } from '../../components/PasajeroSelector';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { ApiError, describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';
import type { Conexion, ConexionInput, Viaje, ViajeInput } from '../../types/ms3';
import { ConexionForm } from './ConexionForm';
import { FinalizarViajeForm } from './FinalizarViajeForm';
import { ViajeForm } from './ViajeForm';

export function ViajesListPage() {
  const [pasajeroId, setPasajeroId] = useState('');
  const numericId = pasajeroId ? Number(pasajeroId) : undefined;

  const { data, loading, error, reload } = useAsync(
    () => (numericId ? viajesApi.listarPorPasajero(numericId) : Promise.resolve<Viaje[]>([])),
    [numericId],
  );
  const conexiones = useAsync(
    () => (numericId ? conexionesApi.porPasajero(numericId) : Promise.resolve<Conexion[]>([])),
    [numericId],
  );

  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();

  const [finalizando, setFinalizando] = useState<Viaje | null>(null);
  const [finSubmitting, setFinSubmitting] = useState(false);
  const [finError, setFinError] = useState<string | null>(null);
  const [finFieldErrors, setFinFieldErrors] = useState<Record<string, string>>();

  const [conectando, setConectando] = useState<Viaje | null>(null);
  const [conSubmitting, setConSubmitting] = useState(false);
  const [conError, setConError] = useState<string | null>(null);
  const [conFieldErrors, setConFieldErrors] = useState<Record<string, string>>();

  async function handleCreate(input: ViajeInput) {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(undefined);
    try {
      await viajesApi.crear(input);
      setCreating(false);
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setFieldErrors(err.fieldErrors);
      setSubmitError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinalizar(paraderoFinalId: string) {
    if (!finalizando) return;
    setFinSubmitting(true);
    setFinError(null);
    setFinFieldErrors(undefined);
    try {
      await viajesApi.finalizar(finalizando.id, { paradero_final_id: paraderoFinalId });
      setFinalizando(null);
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setFinFieldErrors(err.fieldErrors);
      setFinError(describeError(err));
    } finally {
      setFinSubmitting(false);
    }
  }

  function abrirConexion(viaje: Viaje) {
    setConError(null);
    setConFieldErrors(undefined);
    setConectando(viaje);
  }

  async function handleConectar(input: ConexionInput) {
    setConSubmitting(true);
    setConError(null);
    setConFieldErrors(undefined);
    try {
      await conexionesApi.crear(input);
      setConectando(null);
      conexiones.reload();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setConFieldErrors(err.fieldErrors);
      setConError(describeError(err));
    } finally {
      setConSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Viajes"
        description="Selecciona un pasajero para ver y registrar sus viajes y conexiones."
        actions={
          numericId && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              + Nuevo viaje
            </Button>
          )
        }
      />

      <div className="card">
        <div className="card-section">
          <PasajeroSelector value={pasajeroId} onChange={setPasajeroId} />
        </div>
        <div className="card-section">
          {!numericId ? (
            <div className="state-box">
              <h3>Selecciona un pasajero</h3>
              <p>Elige un pasajero arriba para consultar sus viajes registrados.</p>
            </div>
          ) : (
            <AsyncBoundary
              loading={loading}
              error={error}
              onRetry={reload}
              isEmpty={!!data && data.length === 0}
              emptyTitle="Este pasajero no tiene viajes"
              emptyDescription="Registra uno nuevo con “Nuevo viaje”."
            >
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Servicio</th>
                      <th>Tarjeta</th>
                      <th>Fecha/hora</th>
                      <th>Origen</th>
                      <th>Final</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.map((v) => (
                      <tr key={v.id}>
                        <td>{v.id}</td>
                        <td>{v.servicio_id}</td>
                        <td>{v.tarjeta_id}</td>
                        <td>{new Date(v.fecha_hora).toLocaleString()}</td>
                        <td>{v.paradero_origen_id}</td>
                        <td>{v.paradero_final_id ?? '—'}</td>
                        <td>
                          <Badge tone={v.estado === 'finalizado' ? 'success' : 'accent'}>{v.estado}</Badge>
                        </td>
                        <td className="row-actions">
                          {v.estado === 'en_curso' ? (
                            <Button size="sm" variant="secondary" onClick={() => setFinalizando(v)}>
                              Finalizar
                            </Button>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => abrirConexion(v)}>
                              Conectar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AsyncBoundary>
          )}
        </div>
      </div>

      {numericId && (
        <div className="card">
          <div className="card-section">
            <div className="section-title">Conexiones del pasajero</div>
            <AsyncBoundary
              loading={conexiones.loading}
              error={conexiones.error}
              onRetry={conexiones.reload}
              isEmpty={!!conexiones.data && conexiones.data.length === 0}
              emptyTitle="Sin conexiones"
              emptyDescription="Usa “Conectar” en un viaje finalizado para registrar un transbordo."
            >
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Viaje origen</th>
                      <th>Viaje destino</th>
                      <th>Paradero</th>
                      <th>Fecha/hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conexiones.data?.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.viaje_origen_id}</td>
                        <td>{c.viaje_destino_id}</td>
                        <td>{c.paradero_id}</td>
                        <td>{new Date(c.fecha_hora).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AsyncBoundary>
          </div>
        </div>
      )}

      {creating && numericId && (
        <Modal title="Nuevo viaje" onClose={() => setCreating(false)}>
          {submitError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{submitError}</div>}
          <ViajeForm pasajeroId={numericId} submitting={submitting} serverErrors={fieldErrors} onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </Modal>
      )}

      {finalizando && (
        <Modal title={`Finalizar viaje #${finalizando.id}`} onClose={() => setFinalizando(null)}>
          {finError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{finError}</div>}
          <FinalizarViajeForm submitting={finSubmitting} serverErrors={finFieldErrors} onSubmit={handleFinalizar} onCancel={() => setFinalizando(null)} />
        </Modal>
      )}

      {conectando && (
        <Modal title={`Nueva conexión desde el viaje #${conectando.id}`} onClose={() => setConectando(null)}>
          {conError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{conError}</div>}
          <ConexionForm
            origen={conectando}
            viajesDisponibles={data ?? []}
            submitting={conSubmitting}
            serverErrors={conFieldErrors}
            onSubmit={handleConectar}
            onCancel={() => setConectando(null)}
          />
        </Modal>
      )}
    </div>
  );
}
