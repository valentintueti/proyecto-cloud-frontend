import { useState } from 'react';
import { paraderosApi } from '../../api/ms2';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';
import type { Viaje } from '../../types/ms3';
import type { ConexionInput } from '../../types/ms3';

interface Props {
  viajesDisponibles: Viaje[];
  submitting: boolean;
  serverErrors?: Record<string, string>;
  onSubmit: (input: ConexionInput) => void;
  onCancel: () => void;
}

export function ConexionForm({ viajesDisponibles, submitting, serverErrors, onSubmit, onCancel }: Props) {
  const paraderos = useAsync(() => paraderosApi.listar(), []);
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [paraderoId, setParaderoId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    const e: Record<string, string> = {};
    if (!origenId) e.viaje_origen_id = 'Selecciona el viaje de origen.';
    if (!destinoId) e.viaje_destino_id = 'Selecciona el viaje de destino.';
    if (origenId && destinoId && origenId === destinoId) e.viaje_destino_id = 'Debe ser distinto del viaje de origen.';
    if (!paraderoId) e.paradero_id = 'Selecciona el paradero de conexión.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit({ viaje_origen_id: Number(origenId), viaje_destino_id: Number(destinoId), paradero_id: paraderoId });
  }

  const fieldError = (name: string) => errors[name] ?? serverErrors?.[name];
  const viajeLabel = (v: Viaje) => `#${v.id} · ${v.servicio_id} · final: ${v.paradero_final_id ?? 'sin finalizar'}`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="hint" style={{ marginTop: 0 }}>
        Las opciones muestran los viajes ya cargados del pasajero seleccionado. El backend valida que el viaje de
        origen haya finalizado en el paradero elegido y que la ruta del servicio de destino pase por ese paradero.
      </p>
      <div className="stack">
        <Field label="Viaje de origen" htmlFor="viaje-origen" error={fieldError('viaje_origen_id')}>
          <SearchableSelect
            id="viaje-origen"
            items={viajesDisponibles}
            value={origenId}
            onChange={setOrigenId}
            getId={(v) => String(v.id)}
            getLabel={viajeLabel}
            disabled={submitting}
          />
        </Field>
        <Field label="Viaje de destino" htmlFor="viaje-destino" error={fieldError('viaje_destino_id')}>
          <SearchableSelect
            id="viaje-destino"
            items={viajesDisponibles}
            value={destinoId}
            onChange={setDestinoId}
            getId={(v) => String(v.id)}
            getLabel={viajeLabel}
            disabled={submitting}
          />
        </Field>
        <Field label="Paradero de conexión" htmlFor="paradero-conexion" error={fieldError('paradero_id')}>
          {paraderos.loading && <span className="hint">Cargando paraderos…</span>}
          {Boolean(paraderos.error) && <span className="field-error">{describeError(paraderos.error)}</span>}
          {paraderos.data && (
            <SearchableSelect
              id="paradero-conexion"
              items={paraderos.data}
              value={paraderoId}
              onChange={setParaderoId}
              getId={(p) => p.id}
              getLabel={(p) => `${p.nombre} (${p.id})`}
              disabled={submitting}
            />
          )}
        </Field>
      </div>
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Crear conexión
        </Button>
      </div>
    </form>
  );
}
