export interface DemandaPorRuta {
  ruta_nombre: string;
  ruta_sentido: string;
  total_viajes: number;
}

export interface DemandaPorParadero {
  paradero_origen: string;
  total_viajes: number;
}

export interface DemandaPorHora {
  ruta_nombre: string;
  hora_del_dia: number;
  total_viajes: number;
}

export interface EvolucionMensual {
  mes: string;
  ruta_nombre: string;
  total_viajes: number;
}

export interface ParaderoPorPerfil {
  paradero_origen: string;
  distrito: string;
  rango_edad: string;
  total_visitas: number;
}

export interface ConcentracionPasajeros {
  pasajero_id: number;
  distrito: string;
  total_viajes: number;
  pct_pasajeros_acumulado: number;
  pct_viajes_acumulado: number;
}

export interface SaldoFlotante {
  tipo: string;
  distrito: string;
  total_tarjetas: number;
  saldo_flotante_total: number;
}

export interface ViajeFueraHorario {
  viaje_id: number;
  fecha_hora: string;
  ruta_nombre: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface TrasbordoPorRutaDestino {
  ruta_destino: string;
  total_conexiones: number;
}
