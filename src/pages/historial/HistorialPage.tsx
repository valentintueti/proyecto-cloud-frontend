import { useState } from 'react';
import { historialApi } from '../../api/ms4';
import { PasajeroSelector } from '../../components/PasajeroSelector';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAsync } from '../../lib/useAsync';
import type { Historial, Resumen } from '../../types/ms4';

export function HistorialPage() {
  const [pasajeroId, setPasajeroId] = useState('');
  const numericId = pasajeroId ? Number(pasajeroId) : undefined;

  const { data, loading, error, reload } = useAsync(
    () => (numericId ? historialApi.obtener(numericId) : Promise.resolve<Historial | undefined>(undefined)),
    [numericId],
  );

  // Segundo endpoint real de MS4 (GET /historial/{id}/resumen): trae
  // estadísticas ya agregadas por el propio backend, no calculadas aquí.
  const resumen = useAsync(
    () => (numericId ? historialApi.resumen(numericId) : Promise.resolve<Resumen | undefined>(undefined)),
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

                  {/* Segundo endpoint real de MS4: GET /historial/{id}/resumen */}
                  {resumen.data && (
                    <dl className="detail-grid" style={{ marginBottom: 16 }}>
                      <div>
                        <dt>Total de viajes</dt>
                        <dd>{resumen.data.total_viajes}</dd>
                      </div>
                      <div>
                        <dt>Total de conexiones</dt>
                        <dd>{resumen.data.total_conexiones}</dd>
                      </div>
                      <div>
                        <dt>Tipo de servicio más usado</dt>
                        <dd>{resumen.data.tipo_servicio_mas_usado ?? '—'}</dd>
                      </div>
                      <div>
                        <dt>Último viaje</dt>
                        <dd>{resumen.data.ultimo_viaje ? new Date(resumen.data.ultimo_viaje).toLocaleString() : '—'}</dd>
                      </div>
                    </dl>
                  )}

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
                            <th>Tarjeta</th>
                            <th>Origen</th>
                            <th>Final</th>
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
                              <td>{v.tarjeta_tipo ?? '—'}</td>
                              <td>{v.paradero_origen_nombre ?? '—'}</td>
                              <td>{v.paradero_final_nombre ?? '—'}</td>
                              <td>{v.estado}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {data.conexiones.length > 0 && (
                    <div className="table-wrap" style={{ marginTop: 16 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID conexión</th>
                            <th>Viaje origen</th>
                            <th>Viaje destino</th>
                            <th>Paradero</th>
                            <th>Fecha/hora</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.conexiones.map((c) => (
                            <tr key={c.id}>
                              <td>{c.id}</td>
                              <td>{c.viaje_origen_id}</td>
                              <td>{c.viaje_destino_id}</td>
                              <td>{c.paradero_nombre ?? '—'}</td>
                              <td>{new Date(c.fecha_hora).toLocaleString()}</td>
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
