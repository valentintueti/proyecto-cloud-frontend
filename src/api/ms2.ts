import { request } from '../lib/http';
import type {
  Paradero,
  ParaderoInput,
  Ruta,
  RutaInput,
  Servicio,
  ServicioInput,
  ValidaConexionResponse,
} from '../types/ms2';

export const rutasApi = {
  listar: (tipoServicio?: string) => request<Ruta[]>('ms2', '/rutas/', { query: { tipo_servicio: tipoServicio } }),
  obtener: (id: string) => request<Ruta>('ms2', `/rutas/${id}`),
  batch: (ids: string[]) => request<Ruta[]>('ms2', '/rutas/batch', { query: { ids: ids.join(',') } }),
  crear: (input: RutaInput) => request<Ruta>('ms2', '/rutas/', { method: 'POST', body: input }),
  actualizar: (id: string, input: RutaInput) => request<Ruta>('ms2', `/rutas/${id}`, { method: 'PUT', body: input }),
  eliminar: (id: string) => request<void>('ms2', `/rutas/${id}`, { method: 'DELETE' }),
};

export const paraderosApi = {
  listar: () => request<Paradero[]>('ms2', '/paraderos/'),
  obtener: (id: string) => request<Paradero>('ms2', `/paraderos/${id}`),
  batch: (ids: string[]) => request<Paradero[]>('ms2', '/paraderos/batch', { query: { ids: ids.join(',') } }),
  crear: (input: ParaderoInput) => request<Paradero>('ms2', '/paraderos/', { method: 'POST', body: input }),
  validaConexion: (paraderoId: string, rutaId: string) =>
    request<ValidaConexionResponse>('ms2', `/paraderos/${paraderoId}/valida-conexion`, {
      query: { ruta_id: rutaId },
    }),
};

export const serviciosApi = {
  listar: (rutaId?: string, fecha?: string) =>
    request<Servicio[]>('ms2', '/servicios/', { query: { ruta_id: rutaId, fecha } }),
  obtener: (id: string) => request<Servicio>('ms2', `/servicios/${id}`),
  batch: (ids: string[]) => request<Servicio[]>('ms2', '/servicios/batch', { query: { ids: ids.join(',') } }),
  crear: (input: ServicioInput) => request<Servicio>('ms2', '/servicios/', { method: 'POST', body: input }),
  actualizar: (id: string, input: ServicioInput) =>
    request<Servicio>('ms2', `/servicios/${id}`, { method: 'PUT', body: input }),
  eliminar: (id: string) => request<void>('ms2', `/servicios/${id}`, { method: 'DELETE' }),
};
