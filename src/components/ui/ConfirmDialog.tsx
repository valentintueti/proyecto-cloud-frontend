import { Button } from './Button';
import { Modal } from './Modal';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = 'Eliminar', loading, error, onConfirm, onCancel }: Props) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ marginTop: 0 }}>{message}</p>
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 14 }}>
          {error}
        </div>
      )}
      <div className="form-actions" style={{ borderTop: 'none', paddingTop: 0, marginTop: 4 }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="danger-solid" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
