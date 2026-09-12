import { useState } from 'react';
import { historialApi } from '../../api/ms4';
import { PasajeroSelector } from '../../components/PasajeroSelector';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAsync } from '../../lib/useAsync';
import type { Historial } from '../../types/ms4';

export function HistorialPage() {
  const [pasajeroId, setPasajeroId] = useState('');
  const numericId = pasajeroId ? Number(pasajeroId) : undefined;

  const { data, loading, error, reload } = useAsync(
    () => (numericId ? historialApi.obtener(numericId) : Promise.resolve<Historial | undefined>(undefined)),
    [numericId],
  );

  return (
    <div>
      <PageHeader
        title="Historial de viajes"
        description="MS4 agrega datos de MS1 (pasajero), MS2 (ruta/servicio) y MS3 (viajes). Si alguna de esas dependencias falla, esta pantalla muestra un error recuperable sin afectar al resto de la aplicación."
      />

      <div className="card">
        <div className="card-section">
          <PasajeroSelector value={pasajeroId} onChange={setPasajeroId} />
        </div>
        <div className="card-section">
          {!numericId ? (
            <div className="state-box">
              <h3>Selecciona un pasajero</h3>
              <p>Elige un pasajero para consultar su historial (GET /historial/{'{'}pasajero_id{'}'}).</p>
            </div>
          ) : (
            <AsyncBoundary loading={loading} error={error} onRetry={reload}>
              {data && (
                <>
                  <dl className="detail-grid" style={{ marginBottom: 16 }}>
                    <div>
                      <dt>Pasajero</dt>
                      <dd>{data.nombre}</dd>
                    </div>
                    <div>
                      <dt>ID</dt>
                      <dd>{data.pasajero_id}</dd>
                    </div>
                  </dl>

                  {data.viajes.length === 0 ? (
                    <div className="state-box">
                      <h3>Sin viajes registrados</h3>
                      <p>Este pasajero todavía no tiene viajes en el historial agregado por MS4.</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID viaje</th>
                            <th>Fecha/hora</th>
                            <th>Ruta</th>
                            <th>Tipo de servicio</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.viajes.map((v) => (
                            <tr key={v.id}>
                              <td>{v.id}</td>
                              <td>{new Date(v.fecha_hora).toLocaleString()}</td>
                              <td>{v.ruta_nombre ?? '—'}</td>
                              <td>{v.tipo_servicio ?? '—'}</td>
                              <td>{v.estado}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </AsyncBoundary>
          )}
        </div>
      </div>
    </div>
  );
}
