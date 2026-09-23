// Los campos de cada interfaz son exactamente los alias de columna que
// devuelve cada consulta Athena en proyecto-cloud-ms5/api/app/queries.py.
// MS5 no declara response_model en FastAPI (las filas vienen tal cual de
// Athena), así que no hay un contrato Pydantic que copiar: esto es una
// transcripción literal del SELECT de cada consulta.

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

export interface IngresoPorRuta {
  ruta_nombre: string;
  mes: string;
  ingreso_total: number;
  total_pagos: number;
}
