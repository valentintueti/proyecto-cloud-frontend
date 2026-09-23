import { useState } from 'react';
import { pasajerosApi } from '../../api/ms1';
import { paraderosApi, serviciosApi } from '../../api/ms2';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';
import type { ViajeInput } from '../../types/ms3';

interface Props {
  pasajeroId: number;
  submitting: boolean;
  serverErrors?: Record<string, string>;
  onSubmit: (input: ViajeInput) => void;
  onCancel: () => void;
}

export function ViajeForm({ pasajeroId, submitting, serverErrors, onSubmit, onCancel }: Props) {
  const servicios = useAsync(() => serviciosApi.listar(), []);
  const paraderos = useAsync(() => paraderosApi.listar(), []);
  const tarjetas = useAsync(() => pasajerosApi.tarjetasDePasajero(pasajeroId), [pasajeroId]);

  const [servicioId, setServicioId] = useState('');
  const [tarjetaId, setTarjetaId] = useState('');
  const [paraderoOrigenId, setParaderoOrigenId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    const e: Record<string, string> = {};
    if (!servicioId) e.servicio_id = 'Selecciona un servicio.';
    if (!tarjetaId) e.tarjeta_id = 'Selecciona una tarjeta del pasajero.';
    if (!paraderoOrigenId) e.paradero_origen_id = 'Selecciona el paradero de origen.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit({ pasajero_id: pasajeroId, servicio_id: servicioId, tarjeta_id: Number(tarjetaId), paradero_origen_id: paraderoOrigenId });
  }

  const fieldError = (name: string) => errors[name] ?? serverErrors?.[name];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="stack">
        <Field label="Servicio programado" htmlFor="servicio-viaje" error={fieldError('servicio_id')}>
          {servicios.loading && <span className="hint">Cargando servicios…</span>}
          {Boolean(servicios.error) && <span className="field-error">{describeError(servicios.error)}</span>}
          {servicios.data && (
            <SearchableSelect
              id="servicio-viaje"
              items={servicios.data}
              value={servicioId}
              onChange={setServicioId}
              getId={(s) => s.id}
              getLabel={(s) => `${s.ruta_id} · ${s.fecha} ${s.hora_inicio}-${s.hora_fin} (${s.id})`}
              disabled={submitting}
            />
          )}
        </Field>

        <Field
          label="Tarjeta del pasajero"
          htmlFor="tarjeta-viaje"
          error={fieldError('tarjeta_id')}
          hint={tarjetas.data && tarjetas.data.length === 0 ? 'Este pasajero no tiene tarjetas registradas todavía.' : undefined}
        >
          {tarjetas.loading && <span className="hint">Cargando tarjetas…</span>}
          {Boolean(tarjetas.error) && <span className="field-error">{describeError(tarjetas.error)}</span>}
          {tarjetas.data && (
            <select id="tarjeta-viaje" value={tarjetaId} onChange={(e) => setTarjetaId(e.target.value)} disabled={submitting || tarjetas.data.length === 0}>
              <option value="">Selecciona una tarjeta…</option>
              {tarjetas.data.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} · {t.tipo} · S/ {t.saldo.toFixed(2)}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Paradero de origen" htmlFor="paradero-origen" error={fieldError('paradero_origen_id')}>
          {paraderos.loading && <span className="hint">Cargando paraderos…</span>}
          {Boolean(paraderos.error) && <span className="field-error">{describeError(paraderos.error)}</span>}
          {paraderos.data && (
            <SearchableSelect
              id="paradero-origen"
              items={paraderos.data}
              value={paraderoOrigenId}
              onChange={setParaderoOrigenId}
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
          Registrar viaje
        </Button>
      </div>
    </form>
  );
}
