export type EstadoViaje = 'en_curso' | 'finalizado';

export interface Viaje {
  id: number;
  pasajero_id: number;
  servicio_id: string;
  tarjeta_id: number;
  fecha_hora: string;
  paradero_origen_id: string;
  paradero_final_id: string | null;
  estado: EstadoViaje;
}

export interface ViajeInput {
  pasajero_id: number;
  servicio_id: string;
  tarjeta_id: number;
  paradero_origen_id: string;
}

export interface FinalizarViajeInput {
  paradero_final_id: string;
}

export interface Conexion {
  id: number;
  viaje_origen_id: number;
  viaje_destino_id: number;
  paradero_id: string;
  fecha_hora: string;
}

export interface ConexionInput {
  viaje_origen_id: number;
  viaje_destino_id: number;
  paradero_id: string;
}
