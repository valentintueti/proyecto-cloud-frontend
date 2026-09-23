export type ApiErrorKind = 'not_configured' | 'network' | 'http' | 'parse';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, kind: ApiErrorKind, status?: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export function describeError(err: unknown): string {
  if (isApiError(err)) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Ocurrió un error inesperado.';
}
