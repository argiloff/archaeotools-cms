import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './layout.css';
import { ProjectSelector } from './ProjectSelector';
import { useAuth } from '../providers/AuthProvider';
import { ImportDatasetModal } from '../../components/import/ImportDatasetModal';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showImport, setShowImport] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="brand-row">
            <div className="brand">archaeoTools ACC</div>
            <button className="gear-btn" onClick={() => setShowImport(true)} aria-label="Import / Einstellungen">
              ⚙️
            </button>
          </div>
          <ProjectSelector />
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Project Intelligence
          </NavLink>
          <NavLink to="/media" className={({ isActive }) => (isActive ? 'active' : '')}>
            Spatial Media Manager
          </NavLink>
          <NavLink
            to="/data-quality"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Data Quality
          </NavLink>
          <NavLink to="/osint" className={({ isActive }) => (isActive ? 'active' : '')}>
            OSINT Control
          </NavLink>
          <NavLink to="/cache" className={({ isActive }) => (isActive ? 'active' : '')}>
            System & Cache Studio
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-line">
            <span className="user-email">{user?.email ?? 'Angemeldet'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
      <ImportDatasetModal open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
