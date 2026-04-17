import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { realmConfig, realmOrder } from '../appConfig'

export default function AppLayout({ appState, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState(null)

  useEffect(() => {
    setIsMenuOpen(false)
    setActivePanel(null)
  }, [location.pathname])

  const activeRealm = useMemo(() => {
    const activeSlug = realmOrder.find((slug) => (slug === 'nexus' ? '/' : `/${slug}`) === location.pathname)
    return realmConfig[activeSlug ?? 'nexus']
  }, [location.pathname])

  const quickAlerts = appState.notifications.slice(-4).reverse()

  function togglePanel(panelName) {
    setActivePanel((current) => (current === panelName ? null : panelName))
  }

  function openRoute(path) {
    navigate(path)
    setActivePanel(null)
  }

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
            <button type="button" className="topbar-pill" onClick={() => togglePanel('account')} style={{ cursor: 'pointer' }}>
              {appState.sessionMode}
            </button>
            <button type="button" className="topbar-pill" onClick={() => togglePanel('alerts')} style={{ cursor: 'pointer' }}>
              {appState.notifications.length} alerts
            </button>
            <button type="button" className="topbar-pill" onClick={() => togglePanel('ai')} style={{ cursor: 'pointer' }}>
              AI {appState.aiRequestState.status}
            </button>
            {onLogout && (
              <button type="button" className="topbar-pill" onClick={onLogout} style={{ cursor: 'pointer', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                Logout
              </button>
            )}
          </div>
        </section>

        <AnimatePresence>
          {activePanel ? (
            <motion.section
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="glass-panel topbar-quick-panel"
            >
              {activePanel === 'account' ? (
                <>
                  <div className="panel-heading">
                    <div>
                      <p className="card-tag text-cyan">Account</p>
                      <h3>{appState.sessionMode === 'user' ? 'Session Controls' : 'Guest Session'}</h3>
                    </div>
                    <span className="mini-pill">Profile</span>
                  </div>
                  <p className="status-copy">Open your terminal settings, inspect session state, or jump back to the main dashboard.</p>
                  <div className="topbar-quick-actions">
                    <button type="button" className="action-button action-button-primary" onClick={() => openRoute('/terminal')}>Open Terminal</button>
                    <button type="button" className="action-button" onClick={() => openRoute('/')}>Go To Nexus</button>
                  </div>
                </>
              ) : null}

              {activePanel === 'alerts' ? (
                <>
                  <div className="panel-heading">
                    <div>
                      <p className="card-tag text-amber">Alerts</p>
                      <h3>Recent Notifications</h3>
                    </div>
                    <span className="mini-pill">{appState.notifications.length} active</span>
                  </div>
                  {quickAlerts.length > 0 ? (
                    <div className="topbar-quick-list">
                      {quickAlerts.map((notif) => (
                        <div key={notif.id} className={`topbar-quick-item is-${notif.type}`}>
                          <strong>{notif.title}</strong>
                          <p>{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="status-copy">No active alerts. You are clear.</p>
                  )}
                  <div className="topbar-quick-actions">
                    <button type="button" className="action-button action-button-primary" onClick={() => openRoute('/terminal')}>Open Terminal</button>
                    <button type="button" className="action-button" onClick={() => setActivePanel(null)}>Dismiss</button>
                  </div>
                </>
              ) : null}

              {activePanel === 'ai' ? (
                <>
                  <div className="panel-heading">
                    <div>
                      <p className="card-tag text-purple">AI Runtime</p>
                      <h3>Agent Status: {appState.aiRequestState.status}</h3>
                    </div>
                    <span className="mini-pill">Inference</span>
                  </div>
                  <p className="status-copy">
                    {appState.aiRequestState.status === 'idle'
                      ? 'The AI broker is idle. Jump into Dojo to review logic or Laboratory to inspect systems.'
                      : 'The AI broker is currently processing requests.'}
                  </p>
                  <div className="topbar-quick-actions">
                    <button type="button" className="action-button action-button-primary" onClick={() => openRoute('/dojo')}>Open Dojo</button>
                    <button type="button" className="action-button" onClick={() => openRoute('/laboratory')}>Open Laboratory</button>
                  </div>
                </>
              ) : null}
            </motion.section>
          ) : null}
        </AnimatePresence>

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
