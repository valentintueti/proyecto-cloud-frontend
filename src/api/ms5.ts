import { request } from '../lib/http';
import type {
  ConcentracionPasajeros,
  DemandaPorHora,
  DemandaPorParadero,
  DemandaPorRuta,
  EvolucionMensual,
  ParaderoPorPerfil,
  SaldoFlotante,
  TrasbordoPorRutaDestino,
  ViajeFueraHorario,
} from '../types/ms5';

export const analiticaApi = {
  demandaPorRuta: () => request<DemandaPorRuta[]>('ms5', '/analitica/demanda-por-ruta'),
  demandaPorParadero: () => request<DemandaPorParadero[]>('ms5', '/analitica/demanda-por-paradero'),
  demandaPorHora: () => request<DemandaPorHora[]>('ms5', '/analitica/demanda-por-hora'),
  evolucionMensual: () => request<EvolucionMensual[]>('ms5', '/analitica/evolucion-mensual'),
  paraderosPorPerfil: () => request<ParaderoPorPerfil[]>('ms5', '/analitica/paraderos-por-perfil'),
  concentracionPasajeros: () => request<ConcentracionPasajeros[]>('ms5', '/analitica/concentracion-pasajeros'),
  saldoFlotante: () => request<SaldoFlotante[]>('ms5', '/analitica/saldo-flotante'),
  viajesFueraHorario: () => request<ViajeFueraHorario[]>('ms5', '/analitica/viajes-fuera-horario'),
  trasbordosPorRutaDestino: () =>
    request<TrasbordoPorRutaDestino[]>('ms5', '/analitica/trasbordos-por-ruta-destino'),
};
