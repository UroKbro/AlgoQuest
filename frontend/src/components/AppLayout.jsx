import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { realmConfig, realmOrder } from '../appConfig'

export default function AppLayout({ appState }) {
  const location = useLocation()

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
          <div className="topbar-left">
            <span className="topbar-pill">Session: {appState.sessionMode}</span>
            <span className="topbar-pill">Notifications: {appState.notifications.length}</span>
            <span className="topbar-pill">AI: {appState.aiRequestState.status}</span>
          </div>
          <div className="topbar-search">
            <input type="text" placeholder="Search AOS..." className="search-input" />
          </div>
        </section>

        <div className="notification-toast-container">
          {appState.notifications.map(notif => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`notification-toast is-${notif.type}`}
            >
               <strong>{notif.title}</strong>
               <p>{notif.message}</p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="page-content-wrapper"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <div className="global-overlay" aria-hidden="true" />
    </div>
  )
}
