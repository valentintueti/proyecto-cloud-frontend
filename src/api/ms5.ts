import { request } from '../lib/http';
import type {
  DemandaPorRuta,
  DemandaPorParadero,
  EvolucionMensual,
  IngresoPorRuta,
  ParaderoPorPerfil,
} from '../types/ms5';

export const analiticaApi = {
  demandaPorRuta: () => request<DemandaPorRuta[]>('ms5', '/analitica/demanda-por-ruta'),
  demandaPorParadero: () => request<DemandaPorParadero[]>('ms5', '/analitica/demanda-por-paradero'),
  evolucionMensual: () => request<EvolucionMensual[]>('ms5', '/analitica/evolucion-mensual'),
  paraderosPorPerfil: () => request<ParaderoPorPerfil[]>('ms5', '/analitica/paraderos-por-perfil'),
  ingresosPorRuta: () => request<IngresoPorRuta[]>('ms5', '/analitica/ingresos-por-ruta'),
};
