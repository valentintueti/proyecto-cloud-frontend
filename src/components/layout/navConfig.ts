export interface NavItem {
  to: string;
  label: string;
}

export const navItems: NavItem[] = [
  { to: '/pasajeros', label: 'Pasajeros' },
  { to: '/rutas', label: 'Rutas' },
  { to: '/paraderos', label: 'Paraderos' },
  { to: '/servicios', label: 'Servicios programados' },
  { to: '/viajes', label: 'Viajes' },
  { to: '/historial', label: 'Historial de viajes' },
  { to: '/analitica', label: 'Análisis de datos' },
];
