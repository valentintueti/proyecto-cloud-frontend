import { useState } from 'react';
import { paraderosApi, rutasApi } from '../../api/ms2';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { describeError } from '../../lib/errors';
import { useAsync } from '../../lib/useAsync';
import type { Paradero, ValidaConexionResponse } from '../../types/ms2';

export function ValidaConexionModal({ paradero, onClose }: { paradero: Paradero; onClose: () => void }) {
  const rutas = useAsync(() => rutasApi.listar(), []);
  const [rutaId, setRutaId] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ValidaConexionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    if (!rutaId) return;
    setChecking(true);
    setError(null);
    setResult(null);
    try {
      const res = await paraderosApi.validaConexion(paradero.id, rutaId);
      setResult(res);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setChecking(false);
    }
  }

  return (
    <Modal title={`Validar conexión · ${paradero.nombre}`} onClose={onClose}>
      <p className="hint" style={{ marginTop: 0 }}>
        Comprueba si una ruta pasa por este paradero (GET /paraderos/{'{'}id{'}'}/valida-conexion).
      </p>
      <Field label="Ruta a validar" htmlFor="ruta-valida">
        {rutas.loading && <span className="hint">Cargando rutas…</span>}
        {Boolean(rutas.error) && <span className="field-error">{describeError(rutas.error)}</span>}
        {rutas.data && (
          <select id="ruta-valida" value={rutaId} onChange={(e) => setRutaId(e.target.value)}>
            <option value="">Selecciona una ruta…</option>
            {rutas.data.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre} ({r.id})
              </option>
            ))}
          </select>
        )}
      </Field>
      <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {error && <span className="field-error">{error}</span>}
          {result && (
            <Badge tone={result.es_valida ? 'success' : 'default'}>
              {result.es_valida ? 'La ruta sí pasa por este paradero' : 'La ruta no pasa por este paradero'}
            </Badge>
          )}
        </div>
        <Button variant="primary" onClick={handleCheck} loading={checking} disabled={!rutaId}>
          Validar
        </Button>
      </div>
    </Modal>
  );
}
