import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { fetchPathAnalytics } from '../api'

/* ──────────────────────────── Animated Counter ──────────────────────────── */
const AnimatedCounter = ({ value, suffix = '', duration = 1.2 }) => {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const num = typeof value === 'number' ? value : 0
    let start = 0
    const step = num / (duration * 60)
    let raf
    const tick = () => {
      start += step
      if (start >= num) { setDisplay(num); return }
      setDisplay(Math.round(start))
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <span>{display}{suffix}</span>
}

/* ──────────────────────────── Enhanced Mastery Radar ──────────────────────── */
const MasteryRadar = ({ data }) => {
  const categories = Object.keys(data)
  const values = Object.values(data)
  const size = 340
  const center = size / 2
  const radius = size * 0.36
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const ringLevels = [0.2, 0.4, 0.6, 0.8, 1]

  const getPoint = (i, val = values[i]) => {
    const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2
    const r = (val / 100) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      angle,
    }
  }

  const points = categories.map((_, i) => getPoint(i))
  const pathData =
    `M ${points[0].x} ${points[0].y} ` +
    points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') +
    ' Z'

  return (
    <div className="radar-container" style={{ position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Concentric rings with labels */}
        {ringLevels.map((r) => (
          <g key={r}>
            <circle
              cx={center}
              cy={center}
              r={radius * r}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
            />
            <text
              x={center + 4}
              y={center - radius * r + 12}
              fill="rgba(255,255,255,0.25)"
              fontSize="8"
              fontFamily="monospace"
            >
              {Math.round(r * 100)}%
            </text>
          </g>
        ))}

        {/* Axis lines + Category labels */}
        {categories.map((cat, i) => {
          const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2
          const x2 = center + radius * Math.cos(angle)
          const y2 = center + radius * Math.sin(angle)
          const labelR = radius + 26
          const lx = center + labelR * Math.cos(angle)
          const ly = center + labelR * Math.sin(angle)
          const isHovered = hoveredIdx === i
          return (
            <g key={cat}>
              <line
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.08)"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isHovered ? '#A855F7' : 'rgba(255,255,255,0.55)'}
                fontSize="10"
                fontWeight={isHovered ? '700' : '500'}
                style={{
                  transition: 'all .2s',
                  filter: isHovered
                    ? 'drop-shadow(0 0 6px rgba(168,85,247,0.8))'
                    : 'none',
                }}
              >
                {cat}
              </text>
            </g>
          )
        })}

        {/* Animated radar fill path */}
        <motion.path
          d={pathData}
          fill="rgba(168,85,247,0.18)"
          stroke="#A855F7"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />

        {/* Data points with hover targets */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Invisible larger hit-area */}
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
            {/* Glow ring on hover */}
            {hoveredIdx === i && (
              <motion.circle
                cx={p.x}
                cy={p.y}
                r="8"
                fill="none"
                stroke="#A855F7"
                strokeWidth="1.5"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1 }}
              />
            )}
            {/* Data dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? 5 : 3.5}
              fill="#A855F7"
              style={{ transition: 'r .15s' }}
            />
            {/* Percentage label on point */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="8"
              fontFamily="monospace"
            >
              {values[i]}%
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip on hover */}
      <AnimatePresence>
        {hoveredIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15,15,15,0.92)',
              border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: 8,
              padding: '6px 14px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              fontSize: 13,
              color: '#e2e2e2',
              backdropFilter: 'blur(8px)',
            }}
          >
            <strong style={{ color: '#A855F7' }}>
              {categories[hoveredIdx]}
            </strong>
            {' — '}
            {values[hoveredIdx]}%
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ──────────────────────────── Skill Progress Bar ─────────────────────────── */
const SkillBar = ({ name, value, onClick }) => {
  const color =
    value > 75 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444'
  const trend =
    value > 75 ? '↑' : value >= 50 ? '→' : '↓'
  const trendColor =
    value > 75 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444'

  return (
    <motion.button
      onClick={onClick}
      className="skill-bar-row"
      whileHover={{ scale: 1.015 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: '10px 14px',
        cursor: 'pointer',
        textAlign: 'left',
        color: '#e2e2e2',
      }}
    >
      <span style={{ width: 80, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
        {name}
      </span>
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: 4,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>
        {value}%
      </span>
      <span style={{ fontSize: 16, color: trendColor }}>{trend}</span>
    </motion.button>
  )
}

/* ──────────────────────────── Badge Card ─────────────────────────────────── */
const badgeDefinitions = [
  { name: 'Python Novice', icon: '🐍', threshold: 30 },
  { name: 'Loop Master', icon: '🔁', threshold: 50 },
  { name: 'Recursion Warrior', icon: '⚔️', threshold: 60 },
  { name: 'Sort Sensei', icon: '🥋', threshold: 75 },
  { name: 'Graph Navigator', icon: '🧭', threshold: 85 },
]

const BadgeCard = ({ badge, unlocked }) => (
  <motion.div
    whileHover={unlocked ? { scale: 1.06, y: -3 } : {}}
    style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '18px 10px',
      borderRadius: 14,
      border: unlocked
        ? '1px solid rgba(168,85,247,0.4)'
        : '1px solid rgba(255,255,255,0.06)',
      background: unlocked
        ? 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(34,197,94,0.08))'
        : 'rgba(255,255,255,0.02)',
      opacity: unlocked ? 1 : 0.4,
      overflow: 'hidden',
      cursor: unlocked ? 'pointer' : 'default',
    }}
  >
    {/* Shimmer overlay for unlocked badges */}
    {unlocked && (
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'linear', repeatDelay: 3 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          pointerEvents: 'none',
        }}
      />
    )}
    <span style={{ fontSize: 28 }}>{unlocked ? badge.icon : '🔒'}</span>
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        textAlign: 'center',
        color: unlocked ? '#e2e2e2' : 'rgba(255,255,255,0.3)',
      }}
    >
      {badge.name}
    </span>
    {unlocked && (
      <span
        style={{
          fontSize: 9,
          padding: '2px 8px',
          borderRadius: 20,
          background: 'rgba(168,85,247,0.25)',
          color: '#c084fc',
          fontWeight: 700,
          letterSpacing: 0.5,
        }}
      >
        EARNED
      </span>
    )}
  </motion.div>
)

/* ──────────────────────────── Weekly Timeline Node ───────────────────────── */
const weeklyHistory = [
  { week: 'W1', focus: 'Loop Patterns', score: 64, status: 'completed' },
  { week: 'W2', focus: 'Array Scans', score: 71, status: 'completed' },
  { week: 'W3', focus: 'Recursion Intro', score: 73, status: 'completed' },
  { week: 'W4', focus: 'Recursive Depth', score: 78, status: 'active' },
]

/* ──────────────────────────── Main Page ──────────────────────────────────── */
export default function PathPage() {
  const realm = realmConfig.path
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [expandedSkill, setExpandedSkill] = useState(null)

  useEffect(() => {
    fetchPathAnalytics()
      .then((res) => {
        setData(res)
        setStatus('ready')
        setMessage('')
      })
      .catch((error) => {
        // Fallback mock
        setData({
          weeklyFocus: 'Recursive Depth',
          strengths: ['Loop consistency', 'Array scanning', 'State cleanup'],
          frictionPoints: [
            'Nested recursion',
            'Snapshot comparison',
            'Graph traversal setup',
          ],
          masteryRadar: {
            Logic: 78,
            Syntax: 72,
            Efficiency: 61,
            Projects: 44,
            Speed: 67,
          },
          weeklyGate: {
            score: 78,
            strengths: ['Loop consistency', 'Array scanning'],
            frictionPoints: ['Nested recursion', 'Snapshot comparison'],
          },
        })
        setStatus('ready')
        setMessage(error.message)
      })
  }, [])

  if (status === 'loading')
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: 40, textAlign: 'center', color: '#888' }}
      >
        Calibrating Mastery Radar...
      </motion.p>
    )

  const radarData = data?.masteryRadar ?? {}
  const radarValues = Object.values(radarData)
  const radarKeys = Object.keys(radarData)
  const gateScore = data?.weeklyGate?.score ?? 0
  const strengths = data?.strengths ?? []
  const frictionPoints = data?.frictionPoints ?? []
  const weeklyGateStrengths = data?.weeklyGate?.strengths ?? []
  const weeklyGateFriction = data?.weeklyGate?.frictionPoints ?? []

  const overallMastery =
    radarValues.length > 0
      ? Math.round(radarValues.reduce((a, b) => a + b, 0) / radarValues.length)
      : 0
  const strongestIdx = radarValues.indexOf(Math.max(...radarValues))
  const weakestIdx = radarValues.indexOf(Math.min(...radarValues))
  const strongestSkill = radarKeys[strongestIdx] ?? '—'
  const weakestSkill = radarKeys[weakestIdx] ?? '—'

  const avgMastery = overallMastery
  const unlockedBadges = badgeDefinitions.filter((b) => b.threshold <= avgMastery)

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="Path analytics provides a deep-space readout of your logic mastery. Identify friction points and chart your next course."
        accent={realm.accent}
      />

      {/* ─── Mastery Overview Stat Cards ─── */}
      <motion.section
        className="content-grid"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Overall Mastery */}
        <div
          className="glass-panel"
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Overall Mastery
          </span>
          <span style={{ fontSize: 32, fontWeight: 800, color: '#A855F7' }}>
            <AnimatedCounter value={overallMastery} suffix="%" />
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            Avg across {radarKeys.length} skills
          </span>
        </div>

        {/* Weekly Gate Score */}
        <div
          className="glass-panel"
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Weekly Gate
          </span>
          <span style={{ fontSize: 32, fontWeight: 800, color: '#06b6d4' }}>
            <AnimatedCounter value={gateScore} suffix="" />
          </span>
          {/* Visual meter */}
          <div
            style={{
              width: '100%',
              height: 6,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${gateScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
              }}
            />
          </div>
        </div>

        {/* Strongest Skill */}
        <div
          className="glass-panel"
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Strongest
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>
            {strongestSkill}
          </span>
          <span
            style={{
              display: 'inline-block',
              alignSelf: 'flex-start',
              fontSize: 10,
              padding: '2px 10px',
              borderRadius: 20,
              background: 'rgba(34,197,94,0.15)',
              color: '#22c55e',
              fontWeight: 700,
            }}
          >
            {radarValues[strongestIdx]}%
          </span>
        </div>

        {/* Weakest Skill */}
        <div
          className="glass-panel"
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Weakest
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>
            {weakestSkill}
          </span>
          <span
            style={{
              display: 'inline-block',
              alignSelf: 'flex-start',
              fontSize: 10,
              padding: '2px 10px',
              borderRadius: 20,
              background: 'rgba(245,158,11,0.15)',
              color: '#f59e0b',
              fontWeight: 700,
            }}
          >
            {radarValues[weakestIdx]}%
          </span>
        </div>
      </motion.section>

      {/* ─── Main Layout: Radar + Telemetry ─── */}
      <section className="path-layout content-grid">
        <article className="glass-panel content-card accent-purple">
          <div className="panel-heading">
            <div>
              <p className="card-tag text-purple">Mastery Radar</p>
              <h3>Category Signal</h3>
            </div>
            <span className="mini-pill">Calibrated</span>
          </div>
          <div className="radar-stage">
            <MasteryRadar data={radarData} />
          </div>

          <div className="path-insight-strip">
            <div className="mini-metric-card">
              <span className="group-label">Weekly focus</span>
              <strong>{data.weeklyFocus}</strong>
            </div>
            <div className="mini-metric-card">
              <span className="group-label">Gate score</span>
              <strong>{gateScore}</strong>
            </div>
          </div>
        </article>

        <section className="path-telemetry-column">
          {/* ─── Enhanced Weekly Focus ─── */}
          <article className="glass-panel content-card">
            <div className="panel-heading">
              <div>
                <p className="card-tag text-cyan">Current track</p>
                <h3>Weekly Focus</h3>
              </div>
            </div>

            {/* Focus History Timeline */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                marginBottom: 16,
                overflowX: 'auto',
                padding: '4px 0',
              }}
            >
              {weeklyHistory.map((w, i) => (
                <motion.div
                  key={w.week}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    flex: '0 0 auto',
                    padding: '6px 12px',
                    borderRadius: 8,
                    background:
                      w.status === 'active'
                        ? 'rgba(168,85,247,0.18)'
                        : 'rgba(255,255,255,0.03)',
                    border:
                      w.status === 'active'
                        ? '1px solid rgba(168,85,247,0.4)'
                        : '1px solid rgba(255,255,255,0.06)',
                    fontSize: 10,
                    color: w.status === 'active' ? '#c084fc' : 'rgba(255,255,255,0.4)',
                    fontWeight: 600,
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}
                >
                  <div>{w.week}</div>
                  <div style={{ fontSize: 9, opacity: 0.7 }}>{w.focus}</div>
                </motion.div>
              ))}
            </div>

            <div className="telem-row-stack">
              <div className="telem-row">
                <span className="day-label" style={{ color: '#A855F7', fontWeight: 700 }}>Now</span>
                <div className="telem-focus">
                  <strong>{data.weeklyFocus}</strong>
                  <small>Primary concept to reinforce this week</small>
                </div>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#A855F7',
                    boxShadow: '0 0 8px rgba(168,85,247,0.6)',
                  }}
                />
              </div>
              {weeklyGateStrengths.map((item) => (
                <div key={item} className="telem-row">
                  <span className="day-label" style={{ color: '#22c55e' }}>+</span>
                  <div className="telem-focus">
                    <strong>{item}</strong>
                    <small>Confirmed strength from latest gate</small>
                  </div>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#22c55e',
                    }}
                  />
                </div>
              ))}
              {weeklyGateFriction.map((item) => (
                <div key={item} className="telem-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="day-label" style={{ color: '#ef4444' }}>!</span>
                  <div className="telem-focus" style={{ flex: 1 }}>
                    <strong>{item}</strong>
                    <small>Needs more reps in guided practice</small>
                  </div>
                  <NavLink
                    to="/dojo"
                    style={{
                      fontSize: 10,
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'rgba(245,158,11,0.15)',
                      color: '#f59e0b',
                      textDecoration: 'none',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      border: '1px solid rgba(245,158,11,0.3)',
                    }}
                  >
                    Teleport to Dojo →
                  </NavLink>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#ef4444',
                    }}
                  />
                </div>
              ))}
            </div>
            {message ? (
              <p className="status-copy">
                Showing fallback analytics because the API request failed:{' '}
                {message}
              </p>
            ) : null}
          </article>

          {/* ─── Enhanced Strengths ─── */}
          <article className="glass-panel content-card">
            <div className="panel-heading">
              <div>
                <p className="card-tag text-cyan">Strength profile</p>
                <h3>Stable Signals</h3>
              </div>
            </div>
            <ul className="mini-list friction-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {strengths.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'rgba(34,197,94,0.15)',
                      color: '#22c55e',
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ flex: 1, fontSize: 13 }}>{point}</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'rgba(34,197,94,0.7)',
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(34,197,94,0.08)',
                      fontWeight: 600,
                    }}
                  >
                    {85 + i * 3}% conf.
                  </span>
                  <NavLink
                    to="/laboratory"
                    style={{
                      fontSize: 10,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(34,197,94,0.12)',
                      color: '#22c55e',
                      textDecoration: 'none',
                      fontWeight: 700,
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}
                  >
                    Practice Now
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </article>

          {/* ─── Enhanced Friction Drilldown ─── */}
          <article className="glass-panel content-card muted-card">
            <div className="panel-heading">
              <div>
                <p className="card-tag text-purple">Friction Drilldown</p>
                <h3>Critical Logjams</h3>
              </div>
            </div>
            <ul className="mini-list friction-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {frictionPoints.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'rgba(239,68,68,0.15)',
                      color: '#ef4444',
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    ⚠
                  </span>
                  <span style={{ flex: 1, fontSize: 13 }}>{point}</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'rgba(239,68,68,0.7)',
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(239,68,68,0.08)',
                      fontWeight: 600,
                    }}
                  >
                    {42 - i * 5}% conf.
                  </span>
                  <NavLink
                    to="/dojo"
                    style={{
                      fontSize: 10,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(239,68,68,0.12)',
                      color: '#ef4444',
                      textDecoration: 'none',
                      fontWeight: 700,
                      border: '1px solid rgba(239,68,68,0.2)',
                    }}
                  >
                    Practice Now
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </article>
        </section>
      </section>

      {/* ─── Skill Breakdown ─── */}
      <motion.section
        className="content-grid"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ marginTop: 24 }}
      >
        <article
          className="glass-panel content-card"
          style={{ gridColumn: '1 / -1' }}
        >
          <div className="panel-heading">
            <div>
              <p className="card-tag text-purple">Skill Breakdown</p>
              <h3>Per-Axis Detail</h3>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {radarKeys.map((key) => (
              <div key={key}>
                <SkillBar
                  name={key}
                  value={radarData[key]}
                  onClick={() =>
                    setExpandedSkill(expandedSkill === key ? null : key)
                  }
                />
                <AnimatePresence>
                  {expandedSkill === key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        overflow: 'hidden',
                        padding: '10px 14px',
                        marginTop: 4,
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 8,
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.55)',
                        lineHeight: 1.7,
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: '#e2e2e2' }}>{key}</strong> — Current
                        mastery at{' '}
                        <strong
                          style={{
                            color:
                              radarData[key] > 75
                                ? '#22c55e'
                                : radarData[key] >= 50
                                ? '#eab308'
                                : '#ef4444',
                          }}
                        >
                          {radarData[key]}%
                        </strong>
                        .{' '}
                        {radarData[key] > 75
                          ? 'Strong performance — keep pushing for mastery.'
                          : radarData[key] >= 50
                          ? 'Developing well — focus practice here to level up.'
                          : 'Below threshold — prioritize targeted drills in the Dojo.'}
                      </p>
                      <NavLink
                        to="/dojo"
                        style={{
                          display: 'inline-block',
                          marginTop: 8,
                          fontSize: 11,
                          padding: '4px 12px',
                          borderRadius: 6,
                          background: 'rgba(168,85,247,0.15)',
                          color: '#c084fc',
                          textDecoration: 'none',
                          fontWeight: 700,
                          border: '1px solid rgba(168,85,247,0.3)',
                        }}
                      >
                        Train {key} →
                      </NavLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </article>
      </motion.section>

      {/* ─── Badge Vault ─── */}
      <motion.section
        className="content-grid"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        style={{ marginTop: 24 }}
      >
        <article
          className="glass-panel content-card"
          style={{ gridColumn: '1 / -1' }}
        >
          <div className="panel-heading">
            <div>
              <p className="card-tag text-purple">Badge Vault</p>
              <h3>Belts &amp; Medals</h3>
            </div>
            <span className="mini-pill">
              {unlockedBadges.length}/{badgeDefinitions.length} Earned
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 12,
            }}
          >
            {badgeDefinitions.map((badge) => (
              <BadgeCard
                key={badge.name}
                badge={badge}
                unlocked={avgMastery >= badge.threshold}
              />
            ))}
          </div>
        </article>
      </motion.section>

      {/* ─── Weekly Progress Timeline ─── */}
      <motion.section
        className="content-grid"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{ marginTop: 24, marginBottom: 40 }}
      >
        <article
          className="glass-panel content-card"
          style={{ gridColumn: '1 / -1' }}
        >
          <div className="panel-heading">
            <div>
              <p className="card-tag text-cyan">Weekly Progress</p>
              <h3>4-Week Timeline</h3>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0,
              position: 'relative',
              padding: '20px 0',
              overflowX: 'auto',
            }}
          >
            {weeklyHistory.map((w, i) => {
              const isActive = w.status === 'active'
              const nodeColor = isActive ? '#A855F7' : '#06b6d4'
              return (
                <motion.div
                  key={w.week}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.1 }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    minWidth: 120,
                  }}
                >
                  {/* Connector line */}
                  {i < weeklyHistory.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: '50%',
                        width: '100%',
                        height: 2,
                        background:
                          'linear-gradient(90deg, rgba(6,182,212,0.3), rgba(168,85,247,0.3))',
                        zIndex: 0,
                      }}
                    />
                  )}
                  {/* Node */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isActive
                        ? 'rgba(168,85,247,0.25)'
                        : 'rgba(6,182,212,0.15)',
                      border: `2px solid ${nodeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      position: 'relative',
                      boxShadow: isActive
                        ? '0 0 12px rgba(168,85,247,0.4)'
                        : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: nodeColor,
                      }}
                    >
                      {w.week}
                    </span>
                  </div>
                  {/* Details */}
                  <div
                    style={{
                      marginTop: 10,
                      textAlign: 'center',
                      fontSize: 11,
                      lineHeight: 1.6,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#e2e2e2' }}>
                      {w.focus}
                    </div>
                    <div style={{ color: nodeColor, fontWeight: 700 }}>
                      Gate: {w.score}
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: 4,
                        fontSize: 9,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: isActive
                          ? 'rgba(168,85,247,0.2)'
                          : 'rgba(34,197,94,0.12)',
                        color: isActive ? '#c084fc' : '#22c55e',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {isActive ? 'Active' : 'Completed'}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </article>
      </motion.section>
    </>
  )
}
