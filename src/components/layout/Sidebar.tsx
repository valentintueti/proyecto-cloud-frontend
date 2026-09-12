import { NavLink } from 'react-router-dom';
import { navGroups } from './navConfig';

interface Props {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: Props) {
  return (
    <nav className={`sidebar ${open ? 'open' : ''}`.trim()} aria-label="Navegación principal">
      <div className="sidebar-brand">
        Gestión de Transporte
        <small>Avance Cloud Computing</small>
      </div>
      {navGroups.map((group) => (
        <div className="sidebar-group" key={group.title}>
          <div className="sidebar-group-title">{group.title}</div>
          {group.items.map((item) => (
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
      ))}
    </nav>
  );
}
