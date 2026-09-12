import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PasajerosListPage } from './pages/pasajeros/PasajerosListPage';
import { PasajeroDetailPage } from './pages/pasajeros/PasajeroDetailPage';
import { RutasListPage } from './pages/rutas/RutasListPage';
import { ParaderosListPage } from './pages/paraderos/ParaderosListPage';
import { ServiciosListPage } from './pages/servicios/ServiciosListPage';
import { ViajesListPage } from './pages/viajes/ViajesListPage';
import { ConexionesListPage } from './pages/conexiones/ConexionesListPage';
import { HistorialPage } from './pages/historial/HistorialPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/pasajeros" replace /> },
      { path: 'pasajeros', element: <PasajerosListPage /> },
      { path: 'pasajeros/:id', element: <PasajeroDetailPage /> },
      { path: 'rutas', element: <RutasListPage /> },
      { path: 'paraderos', element: <ParaderosListPage /> },
      { path: 'servicios', element: <ServiciosListPage /> },
      { path: 'viajes', element: <ViajesListPage /> },
      { path: 'conexiones', element: <ConexionesListPage /> },
      { path: 'historial', element: <HistorialPage /> },
      { path: '*', element: <Navigate to="/pasajeros" replace /> },
    ],
  },
]);
