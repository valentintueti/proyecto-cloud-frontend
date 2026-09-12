import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';

interface Props {
  saldoActual: number;
  submitting: boolean;
  serverErrors?: Record<string, string>;
  onSubmit: (saldo: number) => void;
  onCancel: () => void;
}

export function TarjetaSaldoForm({ saldoActual, submitting, serverErrors, onSubmit, onCancel }: Props) {
  const [saldo, setSaldo] = useState(String(saldoActual));
  const [error, setError] = useState<string>();

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    const saldoNum = Number(saldo);
    if (saldo.trim() === '' || Number.isNaN(saldoNum)) {
      setError('Ingresa un saldo numérico.');
      return;
    }
    if (saldoNum < 0) {
      setError('El saldo no puede ser negativo.');
      return;
    }
    setError(undefined);
    onSubmit(saldoNum);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="hint" style={{ marginTop: 0 }}>
        Este es el nuevo saldo TOTAL de la tarjeta, no un monto a sumar ni un pago. El backend reemplaza el valor
        anterior por el que ingreses aquí.
      </p>
      <Field label="Nuevo saldo (S/)" htmlFor="saldo-edit" error={error ?? serverErrors?.saldo}>
        <input id="saldo-edit" type="number" step="0.01" min="0" value={saldo} onChange={(e) => setSaldo(e.target.value)} disabled={submitting} />
      </Field>
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Guardar saldo
        </Button>
      </div>
    </form>
  );
}
