import { request } from '../lib/http';
import type { Historial, Resumen } from '../types/ms4';

export const historialApi = {
  obtener: (pasajeroId: number) => request<Historial>('ms4', `/historial/${pasajeroId}`),
  resumen: (pasajeroId: number) => request<Resumen>('ms4', `/historial/${pasajeroId}/resumen`),
};
