import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={open} onNavigate={() => setOpen(false)} />
      <div className={`sidebar-backdrop ${open ? 'open' : ''}`.trim()} onClick={() => setOpen(false)} />
      <div className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="menu-btn"
            aria-label="Abrir menú de navegación"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
          <span className="topbar-title">Gestión de Transporte</span>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
