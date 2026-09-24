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

export interface TrasbordoPorRutaDestino {
  ruta_destino: string;
  total_conexiones: number;
}
