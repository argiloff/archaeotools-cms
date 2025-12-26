import { NavLink, Outlet } from 'react-router-dom';
import './settings.css';

const navItems = [
  { label: 'Übersicht', to: '/settings', exact: true },
  { label: 'Places & Imports', to: '/settings/places' },
];

export function SettingsLayout() {
  return (
    <div className="settings-layout">
      <aside className="settings-sidebar">
        <div className="settings-sidebar__header">
          <p className="settings-sidebar__eyebrow">Control Center</p>
          <h2>Settings</h2>
          <p className="settings-sidebar__subtitle">
            Verwalte globale Ressourcen, Integrationen und Datenpipelines.
          </p>
        </div>
        <nav className="settings-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `settings-nav__link ${isActive ? 'settings-nav__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="settings-content">
        <Outlet />
      </section>
    </div>
  );
}
