import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchPathAnalytics, fetchProgressSummary, fetchRealms } from '../api'
import PageHeader from '../components/PageHeader'

export default function NexusPage() {
  const [state, setState] = useState({
    status: 'loading',
    items: [],
    continuity: null,
    weeklyStats: [],
    focus: null,
    analytics: null,
    message: '',
  })

  useEffect(() => {
    let cancelled = false

    Promise.all([fetchRealms(), fetchProgressSummary(), fetchPathAnalytics()])
      .then(([realmData, summaryData, analyticsData]) => {
        if (!cancelled) {
          setState({
            status: 'ready',
            items: realmData.items ?? [],
            continuity: summaryData.continuity,
            weeklyStats: summaryData.weeklyStats ?? [],
            focus: summaryData.focus,
            analytics: analyticsData,
            message: '',
          })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            status: 'error',
            items: [],
            continuity: null,
            weeklyStats: [],
            focus: null,
            analytics: null,
            message: error.message,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const maxMinutes = Math.max(...state.weeklyStats.map((item) => item.activeMinutes), 1)
  const maxSolved = Math.max(...state.weeklyStats.map((item) => item.logicProblemsSolved), 1)
  const realmCards = state.items.filter((realm) =>
    ['dojo', 'laboratory', 'sandbox', 'world'].includes(realm.slug),
  )

  return (
    <>
      <PageHeader
        eyebrow="Central Hub"
        title="Nexus"
        description="Quest continuity, weekly pulse, and a diagnostics-led readout of where your logic training should go next."
        accent="cyan"
      />

      {state.status === 'loading' ? (
        <section className="glass-panel status-card">
          <p className="status-label">Loading quest continuity...</p>
        </section>
      ) : null}

      {state.status === 'error' ? (
        <section className="glass-panel status-card error-card">
          <p className="status-label">Unable to load Nexus data.</p>
          <p className="status-copy">{state.message}</p>
        </section>
      ) : null}

      {state.status === 'ready' ? (
        <>
          <section className="nexus-top-grid">
            <article className="glass-panel continuity-card accent-amber">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-amber">Quest Continuity</p>
                  <h3>{state.continuity?.title ?? 'No active quest'}</h3>
                </div>
                <span className="mini-pill">{state.continuity?.realm ?? 'guest'}</span>
              </div>
              <p className="status-copy">{state.continuity?.summary}</p>

              <div className="continuity-visual" aria-hidden="true">
                <div className="memory-box">
                  <small>{state.continuity?.visual?.primaryLabel ?? 'state'}</small>
                  <strong>{state.continuity?.visual?.primaryValue ?? 'idle'}</strong>
                </div>
                <div className="pointer-line" />
                <div className="memory-box ghost-box">
                  <small>{state.continuity?.visual?.secondaryLabel ?? 'next visual'}</small>
                  <strong>{state.continuity?.visual?.secondaryValue ?? 'pending'}</strong>
                </div>
              </div>

              <NavLink to={state.continuity?.href ?? '/dojo'} className="action-link">
                {state.continuity?.ctaLabel ?? 'Resume Quest'}
              </NavLink>
            </article>

            <NavLink to="/path" className="glass-panel pulse-card accent-cyan">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-cyan">Mastery Pulse</p>
                  <h3>Weekly Stats</h3>
                </div>
                <span className="mini-pill">Path Link</span>
              </div>

              <div className="pulse-chart" aria-hidden="true">
                {state.weeklyStats.map((item) => (
                  <div key={item.day} className="pulse-column">
                    <div className="pulse-bars">
                      <span
                        className="pulse-bar pulse-bar-minutes"
                        style={{ height: `${(item.activeMinutes / maxMinutes) * 100}%` }}
                      />
                      <span
                        className="pulse-bar pulse-bar-solved"
                        style={{ height: `${(item.logicProblemsSolved / maxSolved) * 100}%` }}
                      />
                    </div>
                    <small>{item.day}</small>
                  </div>
                ))}
              </div>

              <div className="pulse-legend">
                <span>Active Minutes</span>
                <span>Logic Problems Solved</span>
              </div>
            </NavLink>
          </section>

          <section className="content-grid nexus-summary-grid">
            <article className="glass-panel content-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-purple">Weekly Focus</p>
                  <h3>{state.focus?.label ?? 'Focus pending'}</h3>
                </div>
                <span className="mini-pill">Diagnostics Engine</span>
              </div>
              <p>{state.focus?.summary}</p>
              <NavLink to={`/${state.focus?.recommendedRealm ?? 'path'}`} className="inline-link">
                Open deeper analytics
              </NavLink>
            </article>

            <article className="glass-panel content-card muted-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-purple">Training Readout</p>
                  <h3>Strengths and Friction</h3>
                </div>
                <span className="mini-pill">Live Summary</span>
              </div>

              <div className="training-columns">
                <div>
                  <p className="group-label">Strengths</p>
                  <ul className="mini-list">
                    {(state.analytics?.strengths ?? []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="group-label">Friction Points</p>
                  <ul className="mini-list">
                    {(state.analytics?.frictionPoints ?? []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </section>

          <section className="realm-grid" aria-label="Core realms">
            {realmCards.map((realm) => (
              <NavLink
                key={realm.slug}
                to={`/${realm.slug}`}
                className={`realm-card glass-panel accent-${realm.accent} nexus-realm-card`}
              >
                <span className="card-tag">{realm.eyebrow}</span>
                <h3>{realm.name}</h3>
                <p>{realm.description}</p>
              </NavLink>
            ))}
          </section>
        </>
      ) : null}
    </>
  )
}
