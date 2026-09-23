import type { ReactNode } from 'react';
import { isApiError } from '../../lib/errors';
import { EmptyState, ErrorState, LoadingState, NotConfiguredState } from './States';

interface Props {
  loading: boolean;
  error: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}

export function AsyncBoundary({ loading, error, onRetry, isEmpty, emptyTitle, emptyDescription, emptyAction, children }: Props) {
  if (loading) return <LoadingState />;

  if (error) {
    if (isApiError(error) && error.kind === 'not_configured') {
      return <NotConfiguredState message={error.message} />;
    }
    return <ErrorState message={error instanceof Error ? error.message : 'Ocurrió un error inesperado.'} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return <EmptyState title={emptyTitle ?? 'Sin datos'} description={emptyDescription} action={emptyAction} />;
  }

  return <>{children}</>;
}
