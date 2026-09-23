import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import type { ParaderoInput } from '../../types/ms2';

interface Props {
  submitting: boolean;
  serverErrors?: Record<string, string>;
  onSubmit: (input: ParaderoInput) => void;
  onCancel: () => void;
}

export function ParaderoForm({ submitting, serverErrors, onSubmit, onCancel }: Props) {
  const [nombre, setNombre] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (lat.trim() === '' || Number.isNaN(latNum)) e.lat = 'Ingresa una latitud numérica.';
    if (lng.trim() === '' || Number.isNaN(lngNum)) e.lng = 'Ingresa una longitud numérica.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit({ nombre, ubicacion: { lat: latNum, lng: lngNum } });
  }

  const fieldError = (name: string) => errors[name] ?? serverErrors?.[name];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <Field label="Nombre del paradero" htmlFor="nombre-paradero" error={fieldError('nombre')} full>
          <input id="nombre-paradero" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={submitting} />
        </Field>
        <Field label="Latitud" htmlFor="lat" error={fieldError('lat')}>
          <input id="lat" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} disabled={submitting} />
        </Field>
        <Field label="Longitud" htmlFor="lng" error={fieldError('lng')}>
          <input id="lng" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} disabled={submitting} />
        </Field>
      </div>
      <p className="hint">Los paraderos solo admiten alta y consulta.</p>
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Crear paradero
        </Button>
      </div>
    </form>
  );
}
