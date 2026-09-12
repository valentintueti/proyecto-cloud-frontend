import { ApiError } from './errors';
import { getMsBaseUrl, getMsLabel, isMsConfigured, type MsKey } from './env';

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

function buildUrl(base: string, path: string, query?: Record<string, QueryValue>): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${base}${cleanPath}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

/**
 * Interpreta el cuerpo de error devuelto por cualquiera de los 4 backends:
 * - MS1 (Spring): {detail} para NotFound/Validation propias, o un mapa plano
 *   {campo: mensaje} cuando falla Bean Validation (@Valid).
 * - MS2/MS4 (FastAPI): {detail: string} para excepciones propias, o
 *   {detail: [{loc, msg, type}, ...]} para errores 422 de Pydantic.
 * - MS3 (Express): {detail: string} tanto para Joi como para errores propios.
 */
function parseErrorBody(body: unknown, status: number): { message: string; fieldErrors?: Record<string, string> } {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;

    if (typeof record.detail === 'string') {
      return { message: record.detail };
    }

    if (Array.isArray(record.detail)) {
      const parts = record.detail
        .map((item) => {
          if (item && typeof item === 'object') {
            const d = item as { loc?: unknown[]; msg?: string };
            const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : undefined;
            return field ? `${field}: ${d.msg ?? 'inválido'}` : d.msg ?? 'inválido';
          }
          return String(item);
        })
        .join('; ');
      return { message: parts || 'Error de validación.' };
    }

    const values = Object.values(record);
    const isFlatFieldMap =
      values.length > 0 && values.every((v) => typeof v === 'string') && typeof record.detail === 'undefined';
    if (isFlatFieldMap) {
      const fieldErrors = record as Record<string, string>;
      return {
        message: Object.entries(fieldErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('; '),
        fieldErrors,
      };
    }
  }

  if (status === 404) return { message: 'El recurso solicitado no existe.' };
  if (status >= 500) return { message: 'El servicio respondió con un error interno.' };
  return { message: `El servicio respondió con un error (HTTP ${status}).` };
}

export async function request<T>(key: MsKey, path: string, options: RequestOptions = {}): Promise<T> {
  const label = getMsLabel(key);

  if (!isMsConfigured(key)) {
    throw new ApiError(
      `La URL de ${label} no está configurada (VITE_${key.toUpperCase()}_BASE_URL). Este módulo no puede consumirse hasta que el equipo la defina.`,
      'not_configured',
    );
  }

  const base = getMsBaseUrl(key);
  const url = buildUrl(base, path, options.query);
  const method = options.method ?? 'GET';

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal: options.signal,
      headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      `No se pudo conectar con ${label}. Verifica que el servicio esté disponible en la red y vuelve a intentar.`,
      'network',
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        throw new ApiError(`El servicio respondió con un error (HTTP ${response.status}).`, 'http', response.status);
      }
      const { message, fieldErrors } = parseErrorBody(body, response.status);
      throw new ApiError(message, 'http', response.status, fieldErrors);
    }
    throw new ApiError(
      `El servicio respondió con un error (HTTP ${response.status}) sin cuerpo JSON legible. Verifica la URL configurada.`,
      'http',
      response.status,
    );
  }

  if (!isJson) {
    throw new ApiError(
      `${label} devolvió una respuesta que no es JSON (posible URL o proxy mal configurado).`,
      'parse',
      response.status,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('No se pudo interpretar la respuesta del servidor.', 'parse', response.status);
  }
}
