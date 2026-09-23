import { useState } from 'react';
import { conexionesApi, viajesApi } from '../../api/ms3';
import { PasajeroSelector } from '../../components/PasajeroSelector';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { ApiError, describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';
import type { Conexion, ConexionInput, Viaje } from '../../types/ms3';
import { ConexionForm } from './ConexionForm';

function ConexionesTable({ conexiones }: { conexiones: Conexion[] }) {
  if (conexiones.length === 0) {
    return (
      <div className="state-box">
        <h3>Sin conexiones</h3>
        <p>No se encontraron conexiones para esta búsqueda.</p>
      </div>
    );
  }
  return (
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
          {conexiones.map((c) => (
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
  );
}

export function ConexionesListPage() {
  const [pasajeroId, setPasajeroId] = useState('');
  const numericId = pasajeroId ? Number(pasajeroId) : undefined;

  const porPasajero = useAsync(
    () => (numericId ? conexionesApi.porPasajero(numericId) : Promise.resolve<Conexion[]>([])),
    [numericId],
  );
  const viajesDelPasajero = useAsync(
    () => (numericId ? viajesApi.listarPorPasajero(numericId) : Promise.resolve<Viaje[]>([])),
    [numericId],
  );

  const [viajeIdBusqueda, setViajeIdBusqueda] = useState('');
  const [buscandoPorViaje, setBuscandoPorViaje] = useState(false);
  const [resultadoPorViaje, setResultadoPorViaje] = useState<Conexion[] | null>(null);
  const [errorPorViaje, setErrorPorViaje] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();

  async function handleBuscarPorViaje() {
    if (!viajeIdBusqueda) return;
    setBuscandoPorViaje(true);
    setErrorPorViaje(null);
    setResultadoPorViaje(null);
    try {
      const res = await conexionesApi.porViaje(Number(viajeIdBusqueda));
      setResultadoPorViaje(res);
    } catch (err) {
      setErrorPorViaje(describeError(err));
    } finally {
      setBuscandoPorViaje(false);
    }
  }

  async function handleCreate(input: ConexionInput) {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(undefined);
    try {
      await conexionesApi.crear(input);
      setCreating(false);
      porPasajero.reload();
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
        title="Conexiones"
        description="Enlaza dos viajes cuando un pasajero transborda de un servicio a otro en el mismo paradero."
        actions={
          numericId && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              + Nueva conexión
            </Button>
          )
        }
      />

      <div className="card">
        <div className="card-section">
          <PasajeroSelector value={pasajeroId} onChange={setPasajeroId} />
        </div>
        <div className="card-section">
          <div className="section-title">Conexiones del pasajero</div>
          {!numericId ? (
            <div className="state-box">
              <h3>Selecciona un pasajero</h3>
              <p>Elige un pasajero para ver sus conexiones (GET /conexiones/pasajero/{'{'}pasajeroId{'}'}).</p>
            </div>
          ) : (
            <AsyncBoundary loading={porPasajero.loading} error={porPasajero.error} onRetry={porPasajero.reload}>
              <ConexionesTable conexiones={porPasajero.data ?? []} />
            </AsyncBoundary>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-section">
          <div className="section-title">Buscar conexiones por viaje</div>
          <p className="hint" style={{ marginTop: -4 }}>
            Consulta directa a GET /conexiones/viaje/{'{'}viajeId{'}'}.
          </p>
          <div className="inline-form">
            <Field label="ID de viaje" htmlFor="viaje-id-busqueda">
              <input id="viaje-id-busqueda" type="number" min="1" value={viajeIdBusqueda} onChange={(e) => setViajeIdBusqueda(e.target.value)} />
            </Field>
            <Button variant="secondary" onClick={handleBuscarPorViaje} loading={buscandoPorViaje} disabled={!viajeIdBusqueda}>
              Buscar
            </Button>
          </div>
          {errorPorViaje && <div className="alert alert-danger" style={{ marginTop: 12 }}>{errorPorViaje}</div>}
          {resultadoPorViaje && (
            <div style={{ marginTop: 14 }}>
              <ConexionesTable conexiones={resultadoPorViaje} />
            </div>
          )}
        </div>
      </div>

      {creating && numericId && (
        <Modal title="Nueva conexión" onClose={() => setCreating(false)}>
          {submitError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{submitError}</div>}
          <ConexionForm
            viajesDisponibles={viajesDelPasajero.data ?? []}
            submitting={submitting}
            serverErrors={fieldErrors}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </Modal>
      )}
    </div>
  );
}
