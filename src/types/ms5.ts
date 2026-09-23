export interface DemandaPorRuta {
  ruta_nombre: string;
  ruta_sentido: string;
  total_viajes: number;
}

export interface DemandaPorParadero {
  paradero_origen: string;
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

export interface TrasbordoPorRutaDestino {
  ruta_destino: string;
  total_conexiones: number;
}
