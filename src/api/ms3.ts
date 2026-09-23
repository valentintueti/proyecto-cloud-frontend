import { request } from '../lib/http';
import type { Conexion, ConexionInput, FinalizarViajeInput, Viaje, ViajeInput } from '../types/ms3';

export const viajesApi = {
  listarPorPasajero: (pasajeroId: number) =>
    request<Viaje[]>('ms3', '/viajes', { query: { pasajero_id: pasajeroId } }),
  obtener: (id: number) => request<Viaje>('ms3', `/viajes/${id}`),
  crear: (input: ViajeInput) => request<Viaje>('ms3', '/viajes', { method: 'POST', body: input }),
  finalizar: (id: number, input: FinalizarViajeInput) =>
    request<Viaje>('ms3', `/viajes/${id}/finalizar`, { method: 'PATCH', body: input }),
};

export const conexionesApi = {
  crear: (input: ConexionInput) => request<Conexion>('ms3', '/conexiones', { method: 'POST', body: input }),
  porViaje: (viajeId: number) => request<Conexion[]>('ms3', `/conexiones/viaje/${viajeId}`),
  porPasajero: (pasajeroId: number) => request<Conexion[]>('ms3', `/conexiones/pasajero/${pasajeroId}`),
};
