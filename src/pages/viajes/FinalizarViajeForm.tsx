import { useState } from 'react';
import { paraderosApi } from '../../api/ms2';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';

interface Props {
  submitting: boolean;
  serverErrors?: Record<string, string>;
  onSubmit: (paraderoFinalId: string) => void;
  onCancel: () => void;
}

export function FinalizarViajeForm({ submitting, serverErrors, onSubmit, onCancel }: Props) {
  const paraderos = useAsync(() => paraderosApi.listar(), []);
  const [paraderoFinalId, setParaderoFinalId] = useState('');
  const [error, setError] = useState<string>();

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    if (!paraderoFinalId) {
      setError('Selecciona el paradero final.');
      return;
    }
    setError(undefined);
    onSubmit(paraderoFinalId);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field label="Paradero final" htmlFor="paradero-final" error={error ?? serverErrors?.paradero_final_id}>
        {paraderos.loading && <span className="hint">Cargando paraderos…</span>}
        {Boolean(paraderos.error) && <span className="field-error">{describeError(paraderos.error)}</span>}
        {paraderos.data && (
          <SearchableSelect
            id="paradero-final"
            items={paraderos.data}
            value={paraderoFinalId}
            onChange={setParaderoFinalId}
            getId={(p) => p.id}
            getLabel={(p) => `${p.nombre} (${p.id})`}
            disabled={submitting}
          />
        )}
      </Field>
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Finalizar viaje
        </Button>
      </div>
    </form>
  );
}
