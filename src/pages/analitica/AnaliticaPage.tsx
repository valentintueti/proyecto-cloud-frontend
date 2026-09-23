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
  endpoint: string;
  columnas: Columna[];
  fetch: () => Promise<Fila[]>;
}

// Las 5 consultas se integran tal cual están definidas en
// proyecto-cloud-ms5/api/app/queries.py: cada `key` de columna es el alias
// exacto del SELECT de Athena, no un nombre inventado para la interfaz.
const CONSULTAS: Consulta[] = [
  {
    key: 'demanda-ruta',
    label: 'Demanda por ruta',
    endpoint: 'GET /analitica/demanda-por-ruta',
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
    endpoint: 'GET /analitica/demanda-por-paradero',
    columnas: [
      { key: 'paradero_origen', label: 'Paradero de origen' },
      { key: 'total_viajes', label: 'Total de viajes', numeric: true },
    ],
    fetch: () => analiticaApi.demandaPorParadero() as unknown as Promise<Fila[]>,
  },
  {
    key: 'evolucion-mensual',
    label: 'Evolución mensual',
    endpoint: 'GET /analitica/evolucion-mensual',
    columnas: [
      { key: 'mes', label: 'Mes' },
      { key: 'ruta_nombre', label: 'Ruta' },
      { key: 'total_viajes', label: 'Total de viajes', numeric: true },
    ],
    fetch: () => analiticaApi.evolucionMensual() as unknown as Promise<Fila[]>,
  },
  {
    key: 'paraderos-perfil',
    label: 'Paraderos por perfil de pasajero',
    endpoint: 'GET /analitica/paraderos-por-perfil',
    columnas: [
      { key: 'paradero_origen', label: 'Paradero de origen' },
      { key: 'distrito', label: 'Distrito' },
      { key: 'rango_edad', label: 'Rango de edad' },
      { key: 'total_visitas', label: 'Total de visitas', numeric: true },
    ],
    fetch: () => analiticaApi.paraderosPorPerfil() as unknown as Promise<Fila[]>,
  },
  {
    key: 'ingresos-ruta',
    label: 'Ingresos por ruta',
    endpoint: 'GET /analitica/ingresos-por-ruta',
    columnas: [
      { key: 'ruta_nombre', label: 'Ruta' },
      { key: 'mes', label: 'Mes' },
      { key: 'ingreso_total', label: 'Ingreso total (S/)', numeric: true },
      { key: 'total_pagos', label: 'Total de pagos', numeric: true },
    ],
    fetch: () => analiticaApi.ingresosPorRuta() as unknown as Promise<Fila[]>,
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
        title="Analítica"
        description="Consultas del API analítico de MS5 (proyecto-cloud-ms5), que ejecuta queries de solo lectura contra Athena sobre los datos ingeridos de MS1, MS2 y MS3. No tiene base de datos propia."
      />

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
          <p className="hint" style={{ marginTop: 8 }}>
            {consulta.endpoint}
          </p>
        </div>
        <div className="card-section">
          <AsyncBoundary
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={!!data && data.length === 0}
            emptyTitle="Sin resultados"
            emptyDescription="Athena no devolvió filas para esta consulta con los datos ingeridos actuales."
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
