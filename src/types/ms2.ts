export type TipoServicioRuta =
  | 'metropolitano'
  | 'corredor_rojo'
  | 'corredor_azul'
  | 'corredor_morado'
  | 'corredor_rosado';

export const TIPOS_SERVICIO_RUTA: TipoServicioRuta[] = [
  'metropolitano',
  'corredor_rojo',
  'corredor_azul',
  'corredor_morado',
  'corredor_rosado',
];

export type Sentido = 'IDA' | 'VUELTA';

export const SENTIDOS: Sentido[] = ['IDA', 'VUELTA'];

export interface Ruta {
  id: string;
  nombre: string;
  tipo_servicio: TipoServicioRuta;
  sentido: Sentido;
}

export interface RutaInput {
  nombre: string;
  tipo_servicio: TipoServicioRuta;
  sentido: Sentido;
}

export interface Ubicacion {
  lat: number;
  lng: number;
}

export interface RutaResumen {
  ruta_id: string;
  nombre: string;
  tipo_servicio: TipoServicioRuta;
}

export interface Paradero {
  id: string;
  nombre: string;
  ubicacion: Ubicacion;
  rutas: RutaResumen[];
}

export interface ParaderoInput {
  nombre: string;
  ubicacion: Ubicacion;
}

export interface ParaderoOrden {
  paradero_id: string;
  orden: number;
}

export interface Servicio {
  id: string;
  ruta_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  paraderos: ParaderoOrden[];
}

export interface ServicioInput {
  ruta_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  paraderos: ParaderoOrden[];
}
