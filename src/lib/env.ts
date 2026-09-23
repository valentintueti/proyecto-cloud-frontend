export type MsKey = 'ms1' | 'ms2' | 'ms3' | 'ms4' | 'ms5';


interface MsConfig {
  key: MsKey;
  label: string;
  baseUrl: string;
}

function readBaseUrl(value: string | undefined): string {
  if (!value) return '';
  return value.trim().replace(/\/+$/, '');
}

export const msConfig: Record<MsKey, MsConfig> = {
  ms1: {
    key: 'ms1',
    label: 'MS1 (Pasajeros y Tarjetas)',
    baseUrl: readBaseUrl(import.meta.env.VITE_MS1_BASE_URL as string | undefined),
  },
  ms2: {
    key: 'ms2',
    label: 'MS2 (Rutas, Paraderos y Servicios)',
    baseUrl: readBaseUrl(import.meta.env.VITE_MS2_BASE_URL as string | undefined),
  },
  ms3: {
    key: 'ms3',
    label: 'MS3 (Viajes y Conexiones)',
    baseUrl: readBaseUrl(import.meta.env.VITE_MS3_BASE_URL as string | undefined),
  },
  ms4: {
    key: 'ms4',
    label: 'MS4 (Historial)',
    baseUrl: readBaseUrl(import.meta.env.VITE_MS4_BASE_URL as string | undefined),
  },
  ms5: {
    key: 'ms5',
    label: 'MS5 (Analítica)',
    baseUrl: readBaseUrl(import.meta.env.VITE_MS5_BASE_URL as string | undefined),
  },
};

export function isMsConfigured(key: MsKey): boolean {
  return msConfig[key].baseUrl.length > 0;
}

export function getMsBaseUrl(key: MsKey): string {
  return msConfig[key].baseUrl;
}

export function getMsLabel(key: MsKey): string {
  return msConfig[key].label;
}
