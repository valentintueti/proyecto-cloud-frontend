import { useState } from 'react';
import { analiticaApi } from '../../api/ms5';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Field } from '../../components/ui/Field';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAsync } from '../../lib/useAsync';

type Fila = Record<string, unknown>;

interface Columna {
  key: string;
  label: string;
  numeric?: boolean;
}

interface Consulta {
  key: string;
  label: string;
  columnas: Columna[];
  fetch: () => Promise<Fila[]>;
}

const CONSULTAS: Consulta[] = [
  {
    key: 'demanda-ruta',
    label: 'Demanda por ruta',
    columnas: [
      { key: 'ruta_nombre', label: 'Ruta' },
      { key: 'ruta_sentido', label: 'Sentido' },
      { key: 'total_viajes', label: 'Total de viajes', numeric: true },
    ],
    fetch: () => analiticaApi.demandaPorRuta() as unknown as Promise<Fila[]>,
  },
  {
    key: 'demanda-paradero',
    label: 'Demanda por paradero',
    columnas: [
      { key: 'paradero_origen', label: 'Paradero de origen' },
      { key: 'total_viajes', label: 'Total de viajes', numeric: true },
    ],
    fetch: () => analiticaApi.demandaPorParadero() as unknown as Promise<Fila[]>,
  },
  {
    key: 'demanda-hora',
    label: 'Demanda por hora del día',
    columnas: [
      { key: 'ruta_nombre', label: 'Ruta' },
      { key: 'hora_del_dia', label: 'Hora del día', numeric: true },
      { key: 'total_viajes', label: 'Total de viajes', numeric: true },
    ],
    fetch: () => analiticaApi.demandaPorHora() as unknown as Promise<Fila[]>,
  },
  {
    key: 'trasbordos-ruta-destino',
    label: 'Rutas que más reciben trasbordos',
    columnas: [
      { key: 'ruta_destino', label: 'Ruta de destino' },
      { key: 'total_conexiones', label: 'Total de trasbordos', numeric: true },
    ],
    fetch: () => analiticaApi.trasbordosPorRutaDestino() as unknown as Promise<Fila[]>,
  },
];

function formatearCelda(valor: unknown): string {
  if (valor === null || valor === undefined) return '—';
  if (typeof valor === 'number') {
    return Number.isInteger(valor) ? valor.toLocaleString('es-PE') : valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(valor);
}

export function AnaliticaPage() {
  const [consultaKey, setConsultaKey] = useState(CONSULTAS[0].key);
  const consulta = CONSULTAS.find((c) => c.key === consultaKey) ?? CONSULTAS[0];

  const { data, loading, error, reload } = useAsync(() => consulta.fetch(), [consultaKey]);

  return (
    <div>
      <PageHeader
        title="Análisis de datos" />

      <div className="card">
        <div className="card-section">
          <div className="inline-form">
            <Field label="Consulta" htmlFor="consulta-analitica">
              <select
                id="consulta-analitica"
                value={consultaKey}
                onChange={(e) => setConsultaKey(e.target.value)}
              >
                {CONSULTAS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
        <div className="card-section">
          <AsyncBoundary
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={!!data && data.length === 0}
            emptyTitle="Sin resultados"
            emptyDescription="No hay datos para esta consulta."
          >
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {consulta.columnas.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.map((fila, i) => (
                    <tr key={i}>
                      {consulta.columnas.map((col) => (
                        <td key={col.key}>{formatearCelda(fila[col.key])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AsyncBoundary>
        </div>
      </div>
    </div>
  );
}
