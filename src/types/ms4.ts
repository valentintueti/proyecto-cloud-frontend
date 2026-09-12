export interface ViajeEnriquecido {
  id: number;
  fecha_hora: string;
  ruta_nombre: string | null;
  tipo_servicio: string | null;
  estado: string;
}

export interface Historial {
  pasajero_id: number;
  nombre: string;
  viajes: ViajeEnriquecido[];
}
