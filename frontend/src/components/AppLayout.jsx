import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { realmConfig, realmOrder } from '../appConfig'

export default function AppLayout({ appState, onLogout }) {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const activeRealm = useMemo(() => {
    const activeSlug = realmOrder.find((slug) => (slug === 'nexus' ? '/' : `/${slug}`) === location.pathname)
    return realmConfig[activeSlug ?? 'nexus']
  }, [location.pathname])

  return (
    <div className="app-frame">
      <AnimatePresence>
        {isMenuOpen ? (
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            className="nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <aside className={`sidebar glass-panel${isMenuOpen ? ' is-open' : ''}`}>
        <div className="sidebar-header">
          <div>
            <p className="eyebrow">AlgoQuest</p>
            <h1 className="brand-mark">Algorithm OS</h1>
            <p className="sidebar-copy">A cleaner shell with fast access only when you need it.</p>
          </div>
          <button type="button" className="menu-close-button" onClick={() => setIsMenuOpen(false)}>
            Close
          </button>
        </div>

        <nav id="realm-navigation" className="nav-stack" aria-label="Realm navigation">
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
                <span className="nav-link-title">{realm.name}</span>
                <small>{realm.eyebrow}</small>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <main className="page-shell">
        <section className="glass-panel topbar">
          <div className="shell-header">
            <button
              type="button"
              className="menu-toggle-button"
              onClick={() => setIsMenuOpen(true)}
              aria-expanded={isMenuOpen}
              aria-controls="realm-navigation"
            >
              Menu
            </button>

            <div className="shell-brand">
              <strong>{activeRealm.name}</strong>
              <span>{activeRealm.description}</span>
            </div>
          </div>

          <div className="shell-status">
            <span className="topbar-pill">{appState.sessionMode}</span>
            <span className="topbar-pill">{appState.notifications.length} alerts</span>
            <span className="topbar-pill">AI {appState.aiRequestState.status}</span>
            {onLogout && (
              <button type="button" className="topbar-pill" onClick={onLogout} style={{ cursor: 'pointer', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                Logout
              </button>
            )}
          </div>
        </section>

        {appState.notifications.length > 0 ? (
          <div className="notification-toast-container">
            {appState.notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 50, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`notification-toast is-${notif.type}`}
              >
                <strong>{notif.title}</strong>
                <p>{notif.message}</p>
              </motion.div>
            ))}
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
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
