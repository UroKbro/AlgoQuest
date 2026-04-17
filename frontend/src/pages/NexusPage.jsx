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

  const computedStats = useMemo(() => {
    if (!state.weeklyStats.length) return null
    
    const totalMinutes = state.weeklyStats.reduce((sum, day) => sum + day.activeMinutes, 0)
    const totalProblems = state.weeklyStats.reduce((sum, day) => sum + day.logicProblemsSolved, 0)
    const avgEfficiency = state.weeklyStats.reduce((sum, day) => sum + (day.efficiency || 0), 0) / state.weeklyStats.length
    const avgFocusScore = state.weeklyStats.reduce((sum, day) => sum + (day.focusScore || 0), 0) / state.weeklyStats.length
    
    const bestDay = state.weeklyStats.reduce((best, day) => 
      day.activeMinutes > best.activeMinutes ? day : best, state.weeklyStats[0]
    )
    
    const streak = calculateStreak(state.weeklyStats)
    
    return {
      totalMinutes,
      totalProblems,
      avgEfficiency: Math.round(avgEfficiency),
      avgFocusScore: Math.round(avgFocusScore),
      bestDay,
      streak,
      dailyAverageMinutes: Math.round(totalMinutes / state.weeklyStats.length),
      completionRate: state.analytics?.weeklyGate?.score || 0
    }
  }, [state.weeklyStats, state.analytics])

  function calculateStreak(stats) {
    let streak = 0
    for (let i = stats.length - 1; i >= 0; i--) {
      if (stats[i].activeMinutes > 15) streak++
      else break
    }
    return streak
  }

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

<div className="pulse-chart-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
                 <div className="metric-toggles" style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                   {['activeMinutes', 'logicProblemsSolved', 'efficiency', 'focusScore'].map(metric => (
                     <button
                       key={metric}
                       onClick={() => setActiveMetric(metric)}
                       className={`metric-toggle ${activeMetric === metric ? 'active' : ''}`}
                       style={{
                         padding: '4px 10px',
                         borderRadius: '20px',
                         background: activeMetric === metric ? 'rgba(var(--cyan-rgb), 0.2)' : 'transparent',
                         border: `1px solid ${activeMetric === metric ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`,
                         color: activeMetric === metric ? 'var(--cyan)' : 'var(--muted)',
                         fontSize: '0.75rem',
                         cursor: 'pointer',
                         transition: 'all 0.2s ease'
                       }}
                     >
                       {metric === 'activeMinutes' ? 'Minutes' :
                        metric === 'logicProblemsSolved' ? 'Problems' :
                        metric === 'efficiency' ? 'Efficiency' : 'Focus'}
                     </button>
                   ))}
                 </div>
                 <div className="time-range-selector" style={{ display: 'flex', gap: '6px' }}>
                   {['week', 'month', 'quarter'].map(range => (
                     <button
                       key={range}
                       onClick={() => setTimeRange(range)}
                       className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                       style={{
                         padding: '4px 8px',
                         fontSize: '0.75rem',
                         background: timeRange === range ? 'rgba(var(--cyan-rgb), 0.15)' : 'transparent',
                         color: timeRange === range ? 'var(--cyan)' : 'var(--muted)',
                         border: 'none',
                         borderRadius: '6px',
                         cursor: 'pointer'
                       }}
                     >
                       {range.charAt(0).toUpperCase() + range.slice(1)}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="pulse-chart-container" style={{ minHeight: '140px', display: 'flex', alignItems: 'flex-end', padding: '12px 0' }}>
                  <MasteryLineChart data={state.weeklyStats} metric={activeMetric} />
               </div>

               <div className="pulse-legend" style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                 <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)' }} /> Minutes</span>
                 <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--purple)' }} /> Problems</span>
                 <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)' }} /> Efficiency</span>
               </div>
            </NavLink>
</section>

           {/* Statistics Dashboard */}
           <section className="stats-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '8px', marginBottom: '16px' }}>
             {computedStats && (
               <>
                 <div className="glass-panel stat-card" style={{ padding: '20px', borderRadius: '16px', position: 'relative' }}>
                   <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                     <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Focus</span>
                     <span className="stat-trend" style={{ fontSize: '0.75rem', color: 'var(--emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>+12%</span>
                   </div>
                   <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--cyan)', marginBottom: '4px' }}>
                     {computedStats.totalMinutes}<span style={{ fontSize: '1rem', color: 'var(--muted)', marginLeft: '4px' }}>min</span>
                   </div>
                   <div className="stat-subtitle" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                     {computedStats.dailyAverageMinutes} min daily average
                   </div>
                   <div className="stat-progress" style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                     <div style={{ width: '75%', height: '100%', background: 'var(--cyan)', borderRadius: '2px' }}></div>
                   </div>
                 </div>

                 <div className="glass-panel stat-card" style={{ padding: '20px', borderRadius: '16px', position: 'relative' }}>
                   <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                     <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Problems Solved</span>
                     <span className="stat-trend" style={{ fontSize: '0.75rem', color: 'var(--purple)', background: 'rgba(168, 85, 247, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>+8</span>
                   </div>
                   <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--purple)', marginBottom: '4px' }}>
                     {computedStats.totalProblems}
                   </div>
                   <div className="stat-subtitle" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                     {Math.round(computedStats.totalProblems / 7)} per day
                   </div>
                   <div className="stat-progress" style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                     <div style={{ width: '68%', height: '100%', background: 'var(--purple)', borderRadius: '2px' }}></div>
                   </div>
                 </div>

                 <div className="glass-panel stat-card" style={{ padding: '20px', borderRadius: '16px', position: 'relative' }}>
                   <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                     <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Efficiency</span>
                     <span className="stat-trend" style={{ fontSize: '0.75rem', color: 'var(--emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>+5%</span>
                   </div>
                   <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--emerald)', marginBottom: '4px' }}>
                     {computedStats.avgEfficiency}<span style={{ fontSize: '1rem', color: 'var(--muted)', marginLeft: '4px' }}>%</span>
                   </div>
                   <div className="stat-subtitle" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                     Problem solving accuracy
                   </div>
                   <CircularProgress value={computedStats.avgEfficiency} color="var(--emerald)" size={60} style={{ position: 'absolute', right: '16px', top: '20px', opacity: 0.7 }} />
                 </div>

                 <div className="glass-panel stat-card" style={{ padding: '20px', borderRadius: '16px', position: 'relative' }}>
                   <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                     <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Streak</span>
                     <span className="stat-trend" style={{ fontSize: '0.75rem', color: 'var(--amber)', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>🔥 {computedStats.streak} days</span>
                   </div>
                   <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--amber)', marginBottom: '4px' }}>
                     {computedStats.streak}<span style={{ fontSize: '1rem', color: 'var(--muted)', marginLeft: '4px' }}>days</span>
                   </div>
                   <div className="stat-subtitle" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                     Best: {computedStats.bestDay.day} ({computedStats.bestDay.activeMinutes} min)
                   </div>
                   <div className="streak-visual" style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                     {Array.from({ length: 7 }).map((_, i) => (
                       <div 
                         key={i} 
                         style={{ 
                           flex: 1, 
                           height: '6px', 
                           background: i < computedStats.streak ? 'var(--amber)' : 'rgba(255,255,255,0.1)',
                           borderRadius: '3px',
                           transition: 'background 0.3s ease'
                         }}
                       />
                     ))}
                   </div>
                 </div>
               </>
             )}
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

            <article className="glass-panel content-card high-impact-card accent-emerald">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-emerald">Logic Analytics</p>
                  <h3 style={{ fontSize: '1.3rem' }}>Skill Heatmap</h3>
                </div>
                <span className="mini-pill">Mastery Radar</span>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div className="heatmap-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {state.analytics?.masteryRadar && Object.entries(state.analytics.masteryRadar).map(([skill, score]) => (
                    <div key={skill} className="skill-cell" style={{ 
                      padding: '12px',
                      borderRadius: '12px',
                      background: `rgba(var(--emerald-rgb), ${score / 200})`,
                      border: `1px solid rgba(var(--emerald-rgb), ${score / 150})`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', color: score > 70 ? 'var(--emerald)' : 'var(--muted)' }}>
                        {skill}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text)' }}>
                        {score}<span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '2px' }}>%</span>
                      </div>
                      <div style={{ 
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        height: `${score}%`,
                        background: `linear-gradient(to top, rgba(var(--emerald-rgb), 0.3), rgba(var(--emerald-rgb), 0.1))`,
                        opacity: 0.6,
                        zIndex: 0
                      }} />
                    </div>
                  ))}
                </div>

                <div className="training-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="training-group">
                    <p className="group-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '8px' }}>Strengths</p>
                    <ul className="mini-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {state.analytics?.strengths.slice(0, 3).map((item) => (
                        <li key={item} style={{ color: 'var(--emerald)', fontSize: '0.9rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)' }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="training-group">
                    <p className="group-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '8px' }}>Improve</p>
                    <ul className="mini-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {state.analytics?.frictionPoints.slice(0, 3).map((item) => (
                        <li key={item} style={{ color: 'var(--purple)', fontSize: '0.9rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--purple)' }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {state.analytics?.weeklyGate && (
                  <div className="weekly-gate-summary" style={{ marginTop: '16px', padding: '12px', background: 'rgba(var(--cyan-rgb), 0.05)', borderRadius: '12px', border: '1px solid rgba(var(--cyan-rgb), 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: '600' }}>Weekly Gate</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Score: <strong style={{ color: 'var(--cyan)' }}>{state.analytics.weeklyGate.score}/100</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                      <span>Puzzles: {state.analytics.weeklyGate.puzzlesRequired || 0}</span>
                      <span>Snippets: {state.analytics.weeklyGate.codeSnippetsRequired || 0}</span>
                      <span style={{ color: state.analytics.weeklyGate.status === 'completed' ? 'var(--emerald)' : 'var(--amber)' }}>
                        {state.analytics.weeklyGate.status || 'pending'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </section>

<section className="realm-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
             {realmCards.map((realm, index) => {
               const realmProgress = {
                 dojo: { completed: 12, total: 25, lastActivity: '2 days ago', streak: 3 },
                 laboratory: { completed: 8, total: 18, lastActivity: 'Yesterday', streak: 5 },
                 sandbox: { completed: 15, total: 30, lastActivity: '3 hours ago', streak: 7 },
                 world: { completed: 6, total: 15, lastActivity: '1 week ago', streak: 1 }
               }
               
               const progress = realmProgress[realm.slug] || { completed: 0, total: 1, lastActivity: 'No activity', streak: 0 }
               const progressPercent = Math.round((progress.completed / progress.total) * 100)
               
               return (
              <NavLink
                key={realm.slug}
                to={`/${realm.slug}`}
                className={`realm-card glass-panel high-impact-card accent-${realm.accent}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
<div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                     <span className="card-tag">{realm.eyebrow}</span>
                     <div className="realm-progress-badge" style={{ fontSize: '0.75rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: progress.streak > 0 ? 'var(--emerald)' : 'var(--muted)' }}></span>
                       {progress.streak} day streak
                     </div>
                   </div>
                   <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{realm.name}</h3>
                   <p className="realm-desc" style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '16px' }}>{realm.description}</p>
                   
                   {/* Progress Bar */}
                   <div className="realm-progress" style={{ marginBottom: '12px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                       <span style={{ color: 'var(--muted)' }}>Progress</span>
                       <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{progressPercent}%</span>
                     </div>
                     <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progressPercent}%` }}
                         transition={{ duration: 1, delay: index * 0.1 }}
                         style={{ height: '100%', background: `var(--${realm.accent})`, borderRadius: '3px' }}
                       />
                     </div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                       {progress.completed}/{progress.total} challenges • Last: {progress.lastActivity}
                     </div>
                   </div>
                 </div>
                 <div className="realm-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div className="quick-actions" style={{ display: 'flex', gap: '8px' }}>
                     <button className="quick-action-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)', border: '1px solid rgba(var(--accent-rgb), 0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => e.target.style.background = 'rgba(var(--accent-rgb), 0.2)'} onMouseLeave={e => e.target.style.background = 'rgba(var(--accent-rgb), 0.1)'}>
                       Quick Start
                     </button>
                     <button className="quick-action-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'transparent', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => e.target.style.borderColor = 'rgba(var(--accent-rgb), 0.3)'} onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                       Stats
                     </button>
                   </div>
                   <span className="launch-indicator" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent)', opacity: 0.8, transition: 'opacity 0.2s ease' }} onMouseEnter={e => e.target.style.opacity = '1'} onMouseLeave={e => e.target.style.opacity = '0.8'}>Launch →</span>
                 </div>
</NavLink>
               )
             })}
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

function MasteryLineChart({ data, metric = 'activeMinutes' }) {
  if (!data || !data.length) return null
  
  const metricConfig = {
    activeMinutes: { color: 'var(--cyan)', label: 'Minutes', gradientId: 'grad-cyan' },
    logicProblemsSolved: { color: 'var(--purple)', label: 'Problems', gradientId: 'grad-purple' },
    efficiency: { color: 'var(--emerald)', label: 'Efficiency', gradientId: 'grad-emerald' },
    focusScore: { color: 'var(--amber)', label: 'Focus', gradientId: 'grad-amber' }
  }
  
  const config = metricConfig[metric] || metricConfig.activeMinutes
  const values = data.map(d => d[metric] || 0)
  const maxValue = Math.max(...values, 1)
  
  const width = 460
  const height = 120
  const step = width / (data.length - 1)
  
  const points = data.map((d, i) => `${i * step},${height - ((d[metric] || 0) / maxValue) * (height - 20) - 10}`).join(' ')
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={config.color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={config.color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="grad-purple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--purple)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--purple)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="grad-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="grad-amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Grid Lines */}
      {[0.25, 0.5, 0.75].map((ratio, i) => (
        <line
          key={i}
          x1="0"
          y1={height - ratio * (height - 20) - 10}
          x2={width}
          y2={height - ratio * (height - 20) - 10}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}
      
      {/* Main Line */}
      <motion.path 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        d={`M ${points}`}
        fill="none"
        stroke={config.color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Area Gradient */}
      <path d={`M 0,${height} L ${points} L ${width},${height} Z`} fill={`url(#${config.gradientId})`} opacity="0.1" />
      
      {/* Data Points with Hover Effect */}
      {data.map((d, i) => {
        const y = height - ((d[metric] || 0) / maxValue) * (height - 20) - 10
        return (
          <g key={i}>
            <circle 
              cx={i * step} 
              cy={y} 
              r="4" 
              fill={config.color}
              style={{ transition: 'r 0.2s ease' }}
              onMouseEnter={(e) => e.target.setAttribute('r', '6')}
              onMouseLeave={(e) => e.target.setAttribute('r', '4')}
            />
            <text
              x={i * step}
              y={y - 12}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize="10"
              style={{ pointerEvents: 'none' }}
            >
              {d[metric] || 0}
            </text>
          </g>
        )
      })}
      
      {/* Day Labels */}
      {data.map((d, i) => (
        <text
          key={`label-${i}`}
          x={i * step}
          y={height - 2}
          textAnchor="middle"
          fill="var(--muted)"
          fontSize="10"
          style={{ pointerEvents: 'none' }}
        >
          {d.day.substring(0, 1)}
        </text>
))}
     </svg>
   )
}

function CircularProgress({ value, color, size = 60, style }) {
  const radius = size / 2 - 4
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  
  return (
    <svg width={size} height={size} style={style}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="4"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      >
        <motion.animate
          attributeName="stroke-dashoffset"
          from={circumference}
          to={offset}
          dur="1.5s"
          fill="freeze"
        />
      </circle>
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dy="0.3em"
        fill={color}
        fontSize="12"
        fontWeight="bold"
      >
        {value}%
      </text>
    </svg>
  )
}
