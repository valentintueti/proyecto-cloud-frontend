import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { TIPOS_TARJETA, type TarjetaInput, type TipoTarjeta } from '../../types/ms1';

interface Props {
  pasajeroId: number;
  submitting: boolean;
  serverErrors?: Record<string, string>;
  onSubmit: (input: TarjetaInput) => void;
  onCancel: () => void;
}

export function TarjetaCreateForm({ pasajeroId, submitting, serverErrors, onSubmit, onCancel }: Props) {
  const [tipo, setTipo] = useState<TipoTarjeta>('REGULAR');
  const [saldo, setSaldo] = useState('0');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    const saldoNum = Number(saldo);
    const e: Record<string, string> = {};
    if (saldo.trim() === '' || Number.isNaN(saldoNum)) e.saldo = 'Ingresa un saldo numérico.';
    else if (saldoNum < 0) e.saldo = 'El saldo no puede ser negativo.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit({ pasajeroId, tipo, saldo: saldoNum });
  }

  const fieldError = (name: string) => errors[name] ?? serverErrors?.[name];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <Field label="Tipo de tarjeta" htmlFor="tipo" error={fieldError('tipo')}>
          <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoTarjeta)} disabled={submitting}>
            {TIPOS_TARJETA.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Saldo inicial (S/)" htmlFor="saldo" error={fieldError('saldo')}>
          <input
            id="saldo"
            type="number"
            step="0.01"
            min="0"
            value={saldo}
            onChange={(e) => setSaldo(e.target.value)}
            disabled={submitting}
          />
        </Field>
      </div>
      <p className="hint">La fecha de emisión y vencimiento las calcula el backend automáticamente.</p>
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Crear tarjeta
        </Button>
      </div>
    </form>
  );
}
