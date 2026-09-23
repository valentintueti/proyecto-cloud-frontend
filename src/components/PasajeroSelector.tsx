import { pasajerosApi } from '../api/ms1';
import { describeError } from '../lib/errors';
import { useAsync } from '../lib/useAsync';
import { Field } from './ui/Field';
import { SearchableSelect } from './ui/SearchableSelect';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/**
 * Selector de pasajero reutilizado por Viajes, Conexiones e Historial: esos
 * módulos (MS3/MS4) exigen elegir un pasajero de MS1 antes de listar nada,
 * porque no existen endpoints de listado global en esos backends.
 */
export function PasajeroSelector({ value, onChange, label = 'Pasajero' }: Props) {
  const { data, loading, error, reload } = useAsync(() => pasajerosApi.listar(), []);

  return (
    <Field label={label} htmlFor="pasajero-selector">
      {loading && <span className="hint">Cargando pasajeros…</span>}
      {Boolean(error) && (
        <span className="field-error">
          {describeError(error)}{' '}
          <button type="button" className="btn btn-ghost btn-sm" onClick={reload}>
            Reintentar
          </button>
        </span>
      )}
      {data && (
        <SearchableSelect
          id="pasajero-selector"
          items={data}
          value={value}
          onChange={onChange}
          getId={(p) => String(p.id)}
          getLabel={(p) => `${p.nombre} (#${p.id})`}
          placeholder="Selecciona un pasajero…"
        />
      )}
    </Field>
  );
}
