import { request } from '../lib/http';
import type { DemandaPorHora, DemandaPorParadero, DemandaPorRuta, TrasbordoPorRutaDestino } from '../types/ms5';

export const analiticaApi = {
  demandaPorRuta: () => request<DemandaPorRuta[]>('ms5', '/analitica/demanda-por-ruta'),
  demandaPorParadero: () => request<DemandaPorParadero[]>('ms5', '/analitica/demanda-por-paradero'),
  demandaPorHora: () => request<DemandaPorHora[]>('ms5', '/analitica/demanda-por-hora'),
  trasbordosPorRutaDestino: () =>
    request<TrasbordoPorRutaDestino[]>('ms5', '/analitica/trasbordos-por-ruta-destino'),
};
