import { request } from '../lib/http';
import type { Historial } from '../types/ms4';

export const historialApi = {
  obtener: (pasajeroId: number) => request<Historial>('ms4', `/historial/${pasajeroId}`),
};
