import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { SENTIDOS, TIPOS_SERVICIO_RUTA, type RutaInput, type Sentido, type TipoServicioRuta } from '../../types/ms2';

interface Props {
  initial?: RutaInput;
  submitting: boolean;
  serverErrors?: Record<string, string>;
  onSubmit: (input: RutaInput) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const empty: RutaInput = { nombre: '', tipo_servicio: 'metropolitano', sentido: 'IDA' };

export function RutaForm({ initial, submitting, serverErrors, onSubmit, onCancel, submitLabel = 'Guardar' }: Props) {
  const [values, setValues] = useState<RutaInput>(initial ?? empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    const e: Record<string, string> = {};
    if (!values.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit(values);
  }

  const fieldError = (name: string) => errors[name] ?? serverErrors?.[name];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <Field label="Nombre de la ruta" htmlFor="nombre-ruta" error={fieldError('nombre')} full>
          <input id="nombre-ruta" value={values.nombre} onChange={(e) => setValues({ ...values, nombre: e.target.value })} disabled={submitting} />
        </Field>
        <Field label="Tipo de servicio" htmlFor="tipo-servicio" error={fieldError('tipo_servicio')}>
          <select
            id="tipo-servicio"
            value={values.tipo_servicio}
            onChange={(e) => setValues({ ...values, tipo_servicio: e.target.value as TipoServicioRuta })}
            disabled={submitting}
          >
            {TIPOS_SERVICIO_RUTA.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sentido" htmlFor="sentido" error={fieldError('sentido')}>
          <select id="sentido" value={values.sentido} onChange={(e) => setValues({ ...values, sentido: e.target.value as Sentido })} disabled={submitting}>
            {SENTIDOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
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
