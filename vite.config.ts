import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Documentacion oficial:
// - Variables de entorno: https://vite.dev/guide/env-and-mode
// - Proxy de desarrollo: https://vite.dev/config/server-options
//
// `server.proxy` es SOLO una opcion del servidor de desarrollo (`npm run dev`).
// No se incluye en `npm run build` ni en el build estatico que se publica en
// Amplify: en produccion el navegador llama directamente a las URLs publicas
// de API Gateway configuradas en VITE_MS*_BASE_URL, y el CORS lo debe habilitar
// quien administre el backend/API Gateway para el origen de Amplify.
//
// Si el equipo necesita evitar problemas de CORS mientras desarrolla en local,
// puede descomentar y completar los `target` reales (nunca inventados) y
// apuntar VITE_MS*_BASE_URL a las rutas relativas correspondientes, por ejemplo
// VITE_MS1_BASE_URL=/api/ms1
//
// Activo temporalmente para la prueba de integracion local del avance
// (MS1 en Docker en localhost:8081, MS2 en localhost:8001, MS3 en
<<<<<<< HEAD
// localhost:3000, MS4 en localhost:8002, MS5 en localhost:8003; MS1-MS4 sin
// CORS configurado en el backend, MS5 si tiene CORS abierto).
=======
// localhost:3000, MS4 en localhost:8002, sin CORS configurado en ninguno
// de los cuatro backends).
>>>>>>> f217a99b47549db3517912396cfc7a423b1fca18
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ms1': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ms1/, ''),
      },
      '/api/ms2': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ms2/, ''),
      },
      '/api/ms3': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ms3/, ''),
      },
      '/api/ms4': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ms4/, ''),
      },
<<<<<<< HEAD
      '/api/ms5': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ms5/, ''),
      },
=======
>>>>>>> f217a99b47549db3517912396cfc7a423b1fca18
    },
  },
  build: {
    outDir: 'dist',
  },
});
