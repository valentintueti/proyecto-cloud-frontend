import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { SEXOS, type PasajeroInput, type Sexo } from '../../types/ms1';

interface Props {
  initial?: PasajeroInput;
  submitting: boolean;
  serverErrors?: Record<string, string>;
  onSubmit: (input: PasajeroInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

function todayMinusOneDay(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const empty: PasajeroInput = { nombre: '', fechaNacimiento: '', sexo: 'MASCULINO', distrito: '' };

export function PasajeroForm({ initial, submitting, serverErrors, onSubmit, onCancel, submitLabel = 'Guardar' }: Props) {
  const [values, setValues] = useState<PasajeroInput>(initial ?? empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(v: PasajeroInput): Record<string, string> {
    const e: Record<string, string> = {};
    if (!v.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!v.fechaNacimiento) e.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
    else if (v.fechaNacimiento >= new Date().toISOString().slice(0, 10)) {
      e.fechaNacimiento = 'Debe ser una fecha anterior a hoy.';
    }
    if (!v.sexo) e.sexo = 'El sexo es obligatorio.';
    if (!v.distrito.trim()) e.distrito = 'El distrito es obligatorio.';
    return e;
  }

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    const localErrors = validate(values);
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;
    onSubmit(values);
  }

  const fieldError = (name: string) => errors[name] ?? serverErrors?.[name];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <Field label="Nombre completo" htmlFor="nombre" error={fieldError('nombre')} full>
          <input
            id="nombre"
            value={values.nombre}
            onChange={(e) => setValues({ ...values, nombre: e.target.value })}
            disabled={submitting}
            maxLength={150}
          />
        </Field>
        <Field label="Fecha de nacimiento" htmlFor="fechaNacimiento" error={fieldError('fechaNacimiento')} hint="Formato YYYY-MM-DD, debe ser anterior a hoy.">
          <input
            id="fechaNacimiento"
            type="date"
            value={values.fechaNacimiento}
            max={todayMinusOneDay()}
            onChange={(e) => setValues({ ...values, fechaNacimiento: e.target.value })}
            disabled={submitting}
          />
        </Field>
        <Field label="Sexo" htmlFor="sexo" error={fieldError('sexo')}>
          <select
            id="sexo"
            value={values.sexo}
            onChange={(e) => setValues({ ...values, sexo: e.target.value as Sexo })}
            disabled={submitting}
          >
            {SEXOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Distrito" htmlFor="distrito" error={fieldError('distrito')}>
          <input
            id="distrito"
            value={values.distrito}
            onChange={(e) => setValues({ ...values, distrito: e.target.value })}
            disabled={submitting}
            maxLength={100}
          />
        </Field>
      </div>
      <div className="form-actions">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
