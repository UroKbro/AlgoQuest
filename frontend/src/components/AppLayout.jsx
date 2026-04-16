import { NavLink, Outlet } from 'react-router-dom'
import { realmConfig, realmOrder } from '../appConfig'

export default function AppLayout({ appState }) {
  return (
    <div className="app-frame">
      <aside className="sidebar glass-panel">
        <div>
          <p className="eyebrow">AlgoQuest</p>
          <h1 className="brand-mark">Algorithm Operating System</h1>
          <p className="sidebar-copy">Eight realms, one shared shell, and room for the runtime.</p>
        </div>

        <nav className="nav-stack" aria-label="Realm navigation">
          {realmOrder.map((slug) => {
            const realm = realmConfig[slug]

            return (
              <NavLink
                key={slug}
                to={slug === 'nexus' ? '/' : `/${slug}`}
                className={({ isActive }) =>
                  `nav-link accent-${realm.accent}${isActive ? ' is-active' : ''}`
                }
                end={slug === 'nexus'}
              >
                <span>{realm.name}</span>
                <small>{realm.eyebrow}</small>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <main className="page-shell">
        <section className="glass-panel topbar">
          <span className="topbar-pill">Session: {appState.sessionMode}</span>
          <span className="topbar-pill">Notifications: {appState.notifications.length}</span>
          <span className="topbar-pill">AI: {appState.aiRequestState.status}</span>
        </section>
        <Outlet />
      </main>
      <div className="global-overlay" aria-hidden="true" />
    </div>
  )
}
