export type Sexo = 'MASCULINO' | 'FEMENINO' | 'OTRO';

export const SEXOS: Sexo[] = ['MASCULINO', 'FEMENINO', 'OTRO'];

export type TipoTarjeta = 'REGULAR' | 'ESTUDIANTE' | 'ESCOLAR' | 'PERSONA_CON_DISCAPACIDAD' | 'ESPECIAL';

export const TIPOS_TARJETA: TipoTarjeta[] = [
  'REGULAR',
  'ESTUDIANTE',
  'ESCOLAR',
  'PERSONA_CON_DISCAPACIDAD',
  'ESPECIAL',
];

export interface Pasajero {
  id: number;
  nombre: string;
  fechaNacimiento: string;
  sexo: Sexo;
  distrito: string;
}

export interface PasajeroInput {
  nombre: string;
  fechaNacimiento: string;
  sexo: Sexo;
  distrito: string;
}

export interface Tarjeta {
  id: number;
  pasajeroId: number;
  fechaEmision: string;
  fechaVencimiento: string | null;
  tipo: TipoTarjeta;
  saldo: number;
}

export interface TarjetaInput {
  pasajeroId: number;
  tipo: TipoTarjeta;
  saldo: number;
}

export interface TarjetaSaldoInput {
  saldo: number;
}
