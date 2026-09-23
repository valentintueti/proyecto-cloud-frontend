import { request } from '../lib/http';
import type {
  DemandaPorRuta,
  DemandaPorParadero,
  EvolucionMensual,
  ParaderoPorPerfil,
  TrasbordoPorRutaDestino,
} from '../types/ms5';

export const analiticaApi = {
  demandaPorRuta: () => request<DemandaPorRuta[]>('ms5', '/analitica/demanda-por-ruta'),
  demandaPorParadero: () => request<DemandaPorParadero[]>('ms5', '/analitica/demanda-por-paradero'),
  evolucionMensual: () => request<EvolucionMensual[]>('ms5', '/analitica/evolucion-mensual'),
  paraderosPorPerfil: () => request<ParaderoPorPerfil[]>('ms5', '/analitica/paraderos-por-perfil'),
  trasbordosPorRutaDestino: () =>
    request<TrasbordoPorRutaDestino[]>('ms5', '/analitica/trasbordos-por-ruta-destino'),
};
