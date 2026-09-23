import { NavLink } from 'react-router-dom';
import { navItems } from './navConfig';

interface Props {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: Props) {
  return (
    <nav className={`sidebar ${open ? 'open' : ''}`.trim()} aria-label="Navegación principal">
      <div className="sidebar-brand">Gestión de Transporte</div>
      <div className="sidebar-group">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
