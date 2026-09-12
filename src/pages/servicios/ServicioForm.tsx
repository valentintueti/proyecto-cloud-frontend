import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { useAsync } from '../../lib/useAsync';
import { rutasApi, paraderosApi } from '../../api/ms2';
import { describeError } from '../../lib/errors';
import type { ParaderoOrden, ServicioInput } from '../../types/ms2';

interface Props {
  initial?: ServicioInput;
  submitting: boolean;
  serverErrors?: Record<string, string>;
  onSubmit: (input: ServicioInput) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function ServicioForm({ initial, submitting, serverErrors, onSubmit, onCancel, submitLabel = 'Guardar' }: Props) {
  const rutas = useAsync(() => rutasApi.listar(), []);
  const paraderos = useAsync(() => paraderosApi.listar(), []);

  const [rutaId, setRutaId] = useState(initial?.ruta_id ?? '');
  const [fecha, setFecha] = useState(initial?.fecha ?? '');
  const [horaInicio, setHoraInicio] = useState(initial?.hora_inicio ?? '');
  const [horaFin, setHoraFin] = useState(initial?.hora_fin ?? '');
  const [paraderosSel, setParaderosSel] = useState<ParaderoOrden[]>(initial?.paraderos ?? []);
  const [paraderoToAdd, setParaderoToAdd] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addParadero() {
    if (!paraderoToAdd) return;
    setParaderosSel((prev) => [...prev, { paradero_id: paraderoToAdd, orden: prev.length + 1 }]);
    setParaderoToAdd('');
  }

  function removeParadero(index: number) {
    setParaderosSel((prev) => prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, orden: i + 1 })));
  }

  function moveParadero(index: number, dir: -1 | 1) {
    setParaderosSel((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((p, i) => ({ ...p, orden: i + 1 }));
    });
  }

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    const e: Record<string, string> = {};
    if (!rutaId) e.ruta_id = 'Selecciona una ruta.';
    if (!fecha) e.fecha = 'La fecha es obligatoria.';
    if (!horaInicio) e.hora_inicio = 'La hora de inicio es obligatoria.';
    if (!horaFin) e.hora_fin = 'La hora de fin es obligatoria.';
    if (horaInicio && horaFin && horaInicio >= horaFin) e.hora_fin = 'Debe ser posterior a la hora de inicio.';
    if (paraderosSel.length === 0) e.paraderos = 'Agrega al menos un paradero.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit({ ruta_id: rutaId, fecha, hora_inicio: horaInicio, hora_fin: horaFin, paraderos: paraderosSel });
  }

  const fieldError = (name: string) => errors[name] ?? serverErrors?.[name];
  const paraderoNombre = (id: string) => paraderos.data?.find((p) => p.id === id)?.nombre ?? id;
  const disponibles = paraderos.data?.filter((p) => !paraderosSel.some((s) => s.paradero_id === p.id)) ?? [];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <Field label="Ruta" htmlFor="ruta-servicio" error={fieldError('ruta_id')}>
          {rutas.loading && <span className="hint">Cargando rutas…</span>}
          {Boolean(rutas.error) && <span className="field-error">{describeError(rutas.error)}</span>}
          {rutas.data && (
            <select id="ruta-servicio" value={rutaId} onChange={(e) => setRutaId(e.target.value)} disabled={submitting}>
              <option value="">Selecciona una ruta…</option>
              {rutas.data.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} ({r.id})
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Fecha" htmlFor="fecha-servicio" error={fieldError('fecha')}>
          <input id="fecha-servicio" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={submitting} />
        </Field>
        <Field label="Hora de inicio" htmlFor="hora-inicio" error={fieldError('hora_inicio')}>
          <input id="hora-inicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} disabled={submitting} />
        </Field>
        <Field label="Hora de fin" htmlFor="hora-fin" error={fieldError('hora_fin')}>
          <input id="hora-fin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} disabled={submitting} />
        </Field>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="section-title" style={{ fontSize: '0.86rem' }}>
          Paraderos del servicio, en orden
        </div>
        {errors.paraderos && <div className="field-error" style={{ marginBottom: 8 }}>{errors.paraderos}</div>}

        {paraderosSel.length > 0 && (
          <div className="table-wrap" style={{ marginBottom: 10 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Paradero</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paraderosSel.map((p, i) => (
                  <tr key={p.paradero_id}>
                    <td>{p.orden}</td>
                    <td>{paraderoNombre(p.paradero_id)}</td>
                    <td className="row-actions">
                      <Button type="button" size="sm" variant="ghost" onClick={() => moveParadero(i, -1)} disabled={i === 0}>
                        ↑
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => moveParadero(i, 1)} disabled={i === paraderosSel.length - 1}>
                        ↓
                      </Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => removeParadero(i)}>
                        Quitar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="inline-form">
          {paraderos.loading && <span className="hint">Cargando paraderos…</span>}
          {Boolean(paraderos.error) && <span className="field-error">{describeError(paraderos.error)}</span>}
          {paraderos.data && (
            <>
              <select value={paraderoToAdd} onChange={(e) => setParaderoToAdd(e.target.value)} disabled={submitting || disponibles.length === 0}>
                <option value="">{disponibles.length === 0 ? 'No hay más paraderos disponibles' : 'Selecciona un paradero…'}</option>
                {disponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.id})
                  </option>
                ))}
              </select>
              <Button type="button" variant="secondary" onClick={addParadero} disabled={!paraderoToAdd}>
                Agregar paradero
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
