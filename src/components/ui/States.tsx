import type { ReactNode } from 'react';
import { Button } from './Button';
import { Spinner } from './Spinner';

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="loading-row">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="state-box">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="alert-actions">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="alert alert-danger">
      <div>
        <strong>No se pudo completar la operación.</strong>
        <div>{message}</div>
        {onRetry && (
          <div className="alert-actions">
            <Button size="sm" variant="danger" onClick={onRetry}>
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function NotConfiguredState({ message }: { message: string }) {
  return (
    <div className="alert alert-warning">
      <div>
        <strong>Módulo no disponible todavía.</strong>
        <div>{message}</div>
      </div>
    </div>
  );
}
