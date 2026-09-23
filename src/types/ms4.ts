export interface ViajeEnriquecido {
  id: number;
  fecha_hora: string;
  ruta_nombre: string | null;
  tipo_servicio: string | null;
  tarjeta_tipo: string | null;
  paradero_origen_nombre: string | null;
  paradero_final_nombre: string | null;
  estado: string;
}

export interface ConexionEnriquecida {
  id: number;
  viaje_origen_id: number;
  viaje_destino_id: number;
  paradero_nombre: string | null;
  fecha_hora: string;
}

export interface Historial {
  pasajero_id: number;
  nombre: string;
  viajes: ViajeEnriquecido[];
  conexiones: ConexionEnriquecida[];
}

export interface Resumen {
  pasajero_id: number;
  total_viajes: number;
  total_conexiones: number;
  tipo_servicio_mas_usado: string | null;
  ultimo_viaje: string | null;
}
