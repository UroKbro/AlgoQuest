import { NavLink } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { fetchPathAnalytics, fetchProgressSummary, fetchRealms } from '../api'
import PageHeader from '../components/PageHeader'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [timeRange, setTimeRange] = useState('week')
  const [activeMetric, setActiveMetric] = useState('activeMinutes')

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
          // Robust Fallback Data for UI Prototype
          setState({
            status: 'ready',
            items: [
              { slug: 'dojo', name: 'The Dojo', eyebrow: 'Foundations', description: 'Master CS fundamentals and Python logic in a structured arena.', accent: 'amber' },
              { slug: 'laboratory', name: 'The Laboratory', eyebrow: 'Visualization', description: 'Deep-dive into algorithm mechanics with 60FPS visual traces.', accent: 'cyan' },
              { slug: 'sandbox', name: 'The Sandbox', eyebrow: 'Exploration', description: 'High-scale emergent complexity and chaotic logic testing.', accent: 'purple' },
              { slug: 'world', name: 'The World', eyebrow: 'Application', description: 'Build real-world projects and refine system architectures.', accent: 'emerald' },
            ],
            continuity: {
              title: 'Recursive Sorting Trace',
              realm: 'Laboratory',
              summary: 'You were halfway through a Merge Sort visualization. The AI noticed a logic bottleneck at Depth 3.',
              ctaLabel: 'Resume Logic Trace',
              href: '/laboratory',
              visual: { primaryLabel: 'Depth', primaryValue: '3', secondaryLabel: 'Nodes', secondaryValue: '128' }
            },
            weeklyStats: [
              { day: 'Mon', activeMinutes: 45, logicProblemsSolved: 4, efficiency: 78, focusScore: 82 },
              { day: 'Tue', activeMinutes: 30, logicProblemsSolved: 2, efficiency: 65, focusScore: 71 },
              { day: 'Wed', activeMinutes: 65, logicProblemsSolved: 7, efficiency: 88, focusScore: 89 },
              { day: 'Thu', activeMinutes: 20, logicProblemsSolved: 1, efficiency: 52, focusScore: 60 },
              { day: 'Fri', activeMinutes: 80, logicProblemsSolved: 9, efficiency: 92, focusScore: 94 },
              { day: 'Sat', activeMinutes: 10, logicProblemsSolved: 0, efficiency: 40, focusScore: 45 },
              { day: 'Sun', activeMinutes: 55, logicProblemsSolved: 5, efficiency: 85, focusScore: 87 },
            ],
            focus: {
              label: 'Recursive Depth Mastery',
              summary: 'Your recent sorting gate suggests a slight friction with recursion base cases. Practice in the Dojo is recommended.',
              recommendedRealm: 'dojo'
            },
            analytics: {
              strengths: ['Iterative Logic', 'Space Complexity', 'Pattern Recognition', 'Optimization'],
              frictionPoints: ['Recursion Depth', 'Dynamic Selection', 'Edge Cases', 'Time Complexity'],
              masteryRadar: {
                'Algorithms': 78,
                'Data Structures': 85,
                'Problem Solving': 72,
                'Code Quality': 80,
                'Performance': 68,
                'Adaptability': 75
              },
              weeklyGate: {
                score: 82,
                status: 'completed',
                puzzlesRequired: 10,
                codeSnippetsRequired: 5
              }
            },
            message: error.message,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const realmCards = state.items.filter((realm) =>
    ['dojo', 'laboratory', 'sandbox', 'world'].includes(realm.slug),
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="nexus-wrapper"
    >
      <PageHeader
        eyebrow="Central Hub"
        title="Nexus"
        description="Quest continuity, weekly pulse, and a diagnostics-led readout of your logic progression."
        accent="cyan"
      />

      {state.status === 'ready' ? (
        <div className="nexus-layout-stack" style={{ display: 'grid', gap: '24px' }}>
          <section className="nexus-top-grid">
            {/* Quest Continuity Hero */}
            <article className="glass-panel continuity-card high-impact-card accent-amber">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-amber">Quest Continuity</p>
                  <h3 style={{ fontSize: '1.5rem', margin: '4px 0' }}>{state.continuity?.title}</h3>
                </div>
                <span className="mini-pill">{state.continuity?.realm}</span>
              </div>
              <p className="status-copy">{state.continuity?.summary}</p>

              <div className="continuity-visual" aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
                <div className="memory-box" style={{ padding: '16px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.05)' }}>
                  <small style={{ display: 'block', color: 'var(--muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{state.continuity?.visual?.primaryLabel}</small>
                  <strong style={{ fontSize: '1.2rem' }}>{state.continuity?.visual?.primaryValue}</strong>
                </div>
                <div className="pointer-line" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, var(--amber), transparent)' }}>
                </div>
                <div className="memory-box ghost-box" style={{ padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)' }}>
                  <small style={{ display: 'block', color: 'var(--muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{state.continuity?.visual?.secondaryLabel}</small>
                  <strong style={{ fontSize: '1.2rem' }}>{state.continuity?.visual?.secondaryValue}</strong>
                </div>
              </div>

              <NavLink to={state.continuity?.href} className="action-link" style={{ padding: '10px 20px', borderRadius: '99px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'var(--amber)', fontWeight: '600' }}>
                {state.continuity?.ctaLabel}
              </NavLink>
            </article>

            {/* Mastery Pulse Chart */}
            <NavLink to="/path" className="glass-panel pulse-card high-impact-card accent-cyan">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-cyan">Mastery Pulse</p>
                  <h3 style={{ fontSize: '1.5rem', margin: '4px 0' }}>Weekly Performance</h3>
                </div>
                <span className="mini-pill">Path Insight</span>
              </div>

              <div className="pulse-chart-container" style={{ minHeight: '140px', display: 'flex', alignItems: 'flex-end', padding: '12px 0' }}>
                 <MasteryLineChart data={state.weeklyStats} />
              </div>

              <div className="pulse-legend" style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)' }} /> Minutes</span>
                <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--purple)' }} /> Problems</span>
              </div>
            </NavLink>
          </section>

          <section className="nexus-summary-grid content-grid">
            <article className="glass-panel content-card high-impact-card accent-purple">
               <div className="panel-heading">
                <div>
                  <p className="card-tag text-purple">Weekly Focus</p>
                  <h3 style={{ fontSize: '1.3rem' }}>{state.focus?.label}</h3>
                </div>
                <span className="mini-pill">Diagnostics</span>
              </div>
              <p style={{ color: 'var(--muted)', lineHeight: '1.5' }}>{state.focus?.summary}</p>
              <NavLink to={`/${state.focus?.recommendedRealm}`} className="inline-link text-purple" style={{ marginTop: '12px', display: 'inline-block', fontWeight: '600' }}>
                Correct logic inconsistency →
              </NavLink>
            </article>

            <article className="glass-panel content-card muted-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag">Training Readout</p>
                  <h3 style={{ fontSize: '1.3rem' }}>Logic Diagnostics</h3>
                </div>
              </div>

              <div className="training-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="training-group">
                  <p className="group-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '8px' }}>Strengths</p>
                  <ul className="mini-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {state.analytics?.strengths.map((item) => (
                      <li key={item} style={{ color: 'var(--emerald)', fontSize: '0.9rem', marginBottom: '4px' }}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="training-group">
                  <p className="group-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '8px' }}>Friction</p>
                  <ul className="mini-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {state.analytics?.frictionPoints.map((item) => (
                      <li key={item} style={{ color: 'var(--purple)', fontSize: '0.9rem', marginBottom: '4px' }}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </section>

          <section className="realm-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {realmCards.map((realm, index) => (
              <NavLink
                key={realm.slug}
                to={`/${realm.slug}`}
                className={`realm-card glass-panel high-impact-card accent-${realm.accent}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div>
                  <span className="card-tag">{realm.eyebrow}</span>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{realm.name}</h3>
                  <p className="realm-desc" style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{realm.description}</p>
                </div>
                <div className="realm-footer" style={{ marginTop: '24px' }}>
                  <span className="launch-indicator" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent)', opacity: 0.8 }}>Launch Protocol →</span>
                </div>
              </NavLink>
            ))}
          </section>
        </div>
      ) : (
        <div className="nexus-loading" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
          <p>Initializing AOS interface...</p>
        </div>
      )}
    </motion.div>
  )
}

function MasteryLineChart({ data }) {
  if (!data || !data.length) return null
  
  const maxMins = Math.max(...data.map(d => d.activeMinutes), 1)
  const maxSolved = Math.max(...data.map(d => d.logicProblemsSolved), 1)
  
  const width = 460
  const height = 120
  const step = width / (data.length - 1)
  
  const pointsMin = data.map((d, i) => `${i * step},${height - (d.activeMinutes / maxMins) * (height - 20) - 10}`).join(' ')
  const pointsSolved = data.map((d, i) => `${i * step},${height - (d.logicProblemsSolved / maxSolved) * (height - 20) - 10}`).join(' ')
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="grad-cyan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Problems Line (Purple) */}
      <motion.path 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        d={`M ${pointsSolved}`} fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      
      {/* Minutes Line (Cyan) */}
      <motion.path 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        d={`M ${pointsMin}`} fill="none" stroke="var(--cyan)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M 0,${height} L ${pointsMin} L ${width},${height} Z`} fill="url(#grad-cyan)" opacity="0.1" />
      
      {/* Data Points */}
      {data.map((d, i) => (
        <circle key={i} cx={i * step} cy={height - (d.activeMinutes / maxMins) * (height - 20) - 10} r="3" fill="var(--cyan)" />
      ))}
    </svg>
  )
}
