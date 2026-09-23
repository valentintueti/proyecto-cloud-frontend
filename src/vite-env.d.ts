/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MS1_BASE_URL?: string;
  readonly VITE_MS2_BASE_URL?: string;
  readonly VITE_MS3_BASE_URL?: string;
  readonly VITE_MS4_BASE_URL?: string;
  readonly VITE_MS5_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
