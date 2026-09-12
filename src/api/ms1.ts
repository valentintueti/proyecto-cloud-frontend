import { request } from '../lib/http';
import type { Pasajero, PasajeroInput, Tarjeta, TarjetaInput, TarjetaSaldoInput } from '../types/ms1';

export const pasajerosApi = {
  listar: () => request<Pasajero[]>('ms1', '/pasajeros'),
  obtener: (id: number) => request<Pasajero>('ms1', `/pasajeros/${id}`),
  crear: (input: PasajeroInput) => request<Pasajero>('ms1', '/pasajeros', { method: 'POST', body: input }),
  actualizar: (id: number, input: PasajeroInput) =>
    request<Pasajero>('ms1', `/pasajeros/${id}`, { method: 'PUT', body: input }),
  eliminar: (id: number) => request<void>('ms1', `/pasajeros/${id}`, { method: 'DELETE' }),
  tarjetasDePasajero: (id: number) => request<Tarjeta[]>('ms1', `/pasajeros/${id}/tarjetas`),
};

export const tarjetasApi = {
  obtener: (id: number) => request<Tarjeta>('ms1', `/tarjetas/${id}`),
  crear: (input: TarjetaInput) => request<Tarjeta>('ms1', '/tarjetas', { method: 'POST', body: input }),
  actualizarSaldo: (id: number, input: TarjetaSaldoInput) =>
    request<Tarjeta>('ms1', `/tarjetas/${id}`, { method: 'PUT', body: input }),
  eliminar: (id: number) => request<void>('ms1', `/tarjetas/${id}`, { method: 'DELETE' }),
};
