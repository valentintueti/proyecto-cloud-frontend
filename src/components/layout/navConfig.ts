export interface NavItem {
  to: string;
  label: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: 'MS1 · Pasajeros y tarjetas',
    items: [{ to: '/pasajeros', label: 'Pasajeros' }],
  },
  {
    title: 'MS2 · Rutas y servicios',
    items: [
      { to: '/rutas', label: 'Rutas' },
      { to: '/paraderos', label: 'Paraderos' },
      { to: '/servicios', label: 'Servicios programados' },
    ],
  },
  {
    title: 'MS3 · Viajes',
    items: [
      { to: '/viajes', label: 'Viajes' },
      { to: '/conexiones', label: 'Conexiones' },
    ],
  },
  {
    title: 'MS4 · Historial',
    items: [{ to: '/historial', label: 'Historial de viajes' }],
  },
  {
    title: 'MS5 · Analítica',
    items: [{ to: '/analitica', label: 'Analítica' }],
  },
];
