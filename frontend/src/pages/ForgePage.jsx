import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { fetchChallenges, fetchPosters } from '../api'

/* ── helpers ─────────────────────────────────────────────────── */

function buildPosterPreview(title) {
  const safeTitle = String(title ?? 'Poster').replace(/[<>&"]/g, '')
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="55%" stop-color="#111827" />
          <stop offset="100%" stop-color="#1f2937" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" rx="24" fill="url(#g)" />
      <circle cx="92" cy="72" r="44" fill="#f59e0b" fill-opacity="0.22" />
      <circle cx="318" cy="176" r="60" fill="#a855f7" fill-opacity="0.18" />
      <text x="32" y="172" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700">${safeTitle}</text>
      <text x="32" y="202" fill="#94a3b8" font-family="Inter, Arial, sans-serif" font-size="14">AlgoQuest Logic Capture</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function formatDate(iso) {
  if (!iso) return 'Unknown date'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(iso) {
  if (!iso) return ''
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const REALM_ACCENT_COLORS = {
  dojo: '#f59e0b',
  laboratory: '#06b6d4',
  sandbox: '#a855f7',
  world: '#10b981',
  forge: '#f59e0b',
  nexus: '#06b6d4',
  path: '#a855f7',
  terminal: '#10b981',
}

const DIFFICULTY_COLORS = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
}

const PROGRESS_STATES = ['not started', 'in progress', 'completed']

/* ── animation variants ──────────────────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

const tabContentVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
}

/* ── component ───────────────────────────────────────────────── */

export default function ForgePage() {
  const realm = realmConfig.forge
  const [posters, setPosters] = useState([])
  const [challenges, setChallenges] = useState([])
  const [status, setStatus] = useState('loading')

  /* new ui state */
  const [activeTab, setActiveTab] = useState('posters')
  const [posterView, setPosterView] = useState('grid') // grid | list
  const [posterSearch, setPosterSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [showNewPosterForm, setShowNewPosterForm] = useState(false)
  const [newPoster, setNewPoster] = useState({ title: '', description: '', sourceType: 'manual' })
  const [challengeProgress, setChallengeProgress] = useState({}) // id -> progress state

  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([fetchPosters(), fetchChallenges()])
      .then(([postersData, challengesData]) => {
        setPosters(postersData.items ?? [])
        setChallenges(challengesData.items ?? [])
        setStatus('ready')
      })
      .catch((err) => {
        console.error("API Fetch Error:", err)
        // Fallback mocks
        setPosters([
            { id: '1', title: 'Binary Tree Radial', payload: { summary: 'Visual capture of an optimized Red-Black tree.' }, createdAt: new Date(Date.now() - 86400000).toISOString(), sourceType: 'algorithm', visibility: 'public' },
            { id: '2', title: 'Pathfinder v1', payload: { summary: 'A* implementation across a 1000-node graph.' }, createdAt: new Date(Date.now() - 172800000).toISOString(), sourceType: 'graph', visibility: 'private' },
            { id: '3', title: 'Sort Spectrum', payload: { summary: 'Comparative visual of 6 sorting algorithms.' }, createdAt: new Date(Date.now() - 3600000).toISOString(), sourceType: 'manual', visibility: 'public' },
        ])
        setChallenges([
            { id: '1', title: 'Bubble Burst', targetRealm: 'dojo', parameters: { body: 'Optimize bubble sort to handle nearly-sorted data.', difficulty: 'Easy', reward: 'Belt Fragment', xp: 150, estimatedMinutes: 15 } },
            { id: '2', title: 'The Graph Ghost', targetRealm: 'laboratory', parameters: { body: 'Identify a missing edge in a Dijkstra trace.', difficulty: 'Hard', reward: 'Cyan Badge', xp: 400, estimatedMinutes: 45 } },
            { id: '3', title: 'Memory Lane', targetRealm: 'sandbox', parameters: { body: 'Debug a linked-list cycle detection failure.', difficulty: 'Medium', reward: 'Purple Shard', xp: 250, estimatedMinutes: 30 } },
            { id: '4', title: 'Recursive Depths', targetRealm: 'world', parameters: { body: 'Refactor a recursive tree traversal to iterative.', difficulty: 'Medium', reward: 'Green Core', xp: 200, estimatedMinutes: 25 } },
        ])
        setChallengeProgress({ '1': 'completed', '3': 'in progress' })
        setStatus('ready')
      })
  }, [])

  function handleLaunchChallenge(challenge) {
    navigate(`/${challenge.targetRealm}`, { state: { challenge } })
  }

  /* ── derived data ──────────────────────────────────────────── */

  const filteredPosters = posters.filter((p) => {
    if (!posterSearch.trim()) return true
    const q = posterSearch.toLowerCase()
    return (
      (p.title ?? '').toLowerCase().includes(q) ||
      (p.payload?.summary ?? '').toLowerCase().includes(q) ||
      (p.sourceType ?? '').toLowerCase().includes(q)
    )
  })

  const filteredChallenges = challenges.filter((c) => {
    if (difficultyFilter === 'all') return true
    return (c.parameters?.difficulty ?? '').toLowerCase() === difficultyFilter
  })

  const completedChallenges = Object.values(challengeProgress).filter((s) => s === 'completed').length
  const totalXP = challenges.reduce((sum, c) => {
    if (challengeProgress[c.id] === 'completed') return sum + (c.parameters?.xp ?? 0)
    return sum
  }, 0)

  /* ── recent activity feed ──────────────────────────────────── */

  const recentActivity = [
    ...posters.map((p) => ({
      type: 'poster',
      label: `Created poster "${p.title}"`,
      time: p.createdAt,
    })),
    ...challenges
      .filter((c) => challengeProgress[c.id] === 'completed')
      .map((c) => ({
        type: 'challenge',
        label: `Completed "${c.title}" (+${c.parameters?.xp ?? 0} XP)`,
        time: new Date(Date.now() - Math.random() * 200000000).toISOString(),
      })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time))

  /* ── new poster creation ───────────────────────────────────── */

  function handleCreatePoster(e) {
    e.preventDefault()
    if (!newPoster.title.trim()) return
    const created = {
      id: String(Date.now()),
      title: newPoster.title,
      payload: { summary: newPoster.description || 'No summary available.' },
      createdAt: new Date().toISOString(),
      sourceType: newPoster.sourceType,
      visibility: 'private',
    }
    setPosters((prev) => [created, ...prev])
    setNewPoster({ title: '', description: '', sourceType: 'manual' })
    setShowNewPosterForm(false)
  }

  /* ── render ────────────────────────────────────────────────── */

  if (status === 'loading') {
    return (
      <>
        <PageHeader
          eyebrow={realm.eyebrow}
          title={realm.name}
          description="The Forge contains your creative logic output. Browse the poster gallery or launch a diagnostic challenge."
          accent={realm.accent}
        />
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #334155', borderTop: '3px solid #f59e0b', borderRadius: '50%' }}
          />
          <p style={{ marginTop: '1rem' }}>Loading Forge data...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="The Forge contains your creative logic output. Browse the poster gallery or launch a diagnostic challenge."
        accent={realm.accent}
      />

      {/* ── statistics section ───────────────────────────────── */}
      <section className="forge-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '0 1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Posters Created', value: posters.length, icon: '🖼', color: '#f59e0b' },
          { label: 'Challenges Done', value: completedChallenges, icon: '✓', color: '#10b981' },
          { label: 'Total XP', value: totalXP.toLocaleString(), icon: '⚡', color: '#a855f7' },
          { label: 'Active Streak', value: '7 days', icon: '🔥', color: '#ef4444' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span style={{
              fontSize: '1.75rem',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              background: `${stat.color}18`,
              flexShrink: 0,
            }}>
              {stat.icon}
            </span>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── tab bar ──────────────────────────────────────────── */}
      <nav style={{ display: 'flex', gap: '0.25rem', padding: '0 1.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'posters', label: 'Poster Gallery', count: posters.length },
          { key: 'challenges', label: 'Challenge Browser', count: challenges.length },
          { key: 'activity', label: 'Recent Activity', count: recentActivity.length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              background: activeTab === tab.key ? 'rgba(248,250,252,0.08)' : 'transparent',
              color: activeTab === tab.key ? '#f8fafc' : '#64748b',
              borderBottom: activeTab === tab.key ? '2px solid #f59e0b' : '2px solid transparent',
            }}
          >
            {tab.label}
            <span style={{
              marginLeft: 8,
              fontSize: '0.7rem',
              padding: '2px 7px',
              borderRadius: 9999,
              background: activeTab === tab.key ? '#f59e0b22' : '#1e293b',
              color: activeTab === tab.key ? '#f59e0b' : '#64748b',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </nav>

      {/* ── tab content ──────────────────────────────────────── */}
      <section className="forge-layout" style={{ padding: '0 1.5rem' }}>
        <AnimatePresence mode="wait">

          {/* ═══ POSTER GALLERY TAB ═══ */}
          {activeTab === 'posters' && (
            <motion.section
              key="posters"
              variants={tabContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass-panel poster-gallery-panel"
            >
              {/* heading row */}
              <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p className="card-tag text-amber">Poster Gallery</p>
                  <h3>Logic Captures</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="mini-pill">{filteredPosters.length} of {posters.length} Items</span>

                  {/* view toggle */}
                  <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
                    {['grid', 'list'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setPosterView(v)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: posterView === v ? '#f59e0b' : '#0f172a',
                          color: posterView === v ? '#0f172a' : '#94a3b8',
                          transition: 'all 0.2s',
                        }}
                      >
                        {v === 'grid' ? '▦ Grid' : '☰ List'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNewPosterForm((p) => !p)}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      background: '#f59e0b',
                      color: '#0f172a',
                      transition: 'all 0.2s',
                    }}
                  >
                    + Create New Poster
                  </button>
                </div>
              </div>

              {/* search bar */}
              <div style={{ margin: '1rem 0' }}>
                <input
                  type="text"
                  placeholder="Search posters by title, summary, or source type..."
                  value={posterSearch}
                  onChange={(e) => setPosterSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
                  onBlur={(e) => (e.target.style.borderColor = '#334155')}
                />
              </div>

              {/* new poster form */}
              <AnimatePresence>
                {showNewPosterForm && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleCreatePoster}
                    style={{
                      overflow: 'hidden',
                      background: '#1e293b',
                      borderRadius: 12,
                      padding: '1.25rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <h4 style={{ color: '#f8fafc', margin: 0 }}>New Poster</h4>
                    <input
                      type="text"
                      placeholder="Poster title"
                      value={newPoster.title}
                      onChange={(e) => setNewPoster((p) => ({ ...p, title: e.target.value }))}
                      required
                      style={{
                        padding: '0.55rem 0.85rem',
                        borderRadius: 8,
                        border: '1px solid #334155',
                        background: '#0f172a',
                        color: '#f8fafc',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <textarea
                      placeholder="Description / summary"
                      value={newPoster.description}
                      onChange={(e) => setNewPoster((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                      style={{
                        padding: '0.55rem 0.85rem',
                        borderRadius: 8,
                        border: '1px solid #334155',
                        background: '#0f172a',
                        color: '#f8fafc',
                        fontSize: '0.85rem',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Source type:</label>
                      <select
                        value={newPoster.sourceType}
                        onChange={(e) => setNewPoster((p) => ({ ...p, sourceType: e.target.value }))}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: 8,
                          border: '1px solid #334155',
                          background: '#0f172a',
                          color: '#f8fafc',
                          fontSize: '0.8rem',
                          outline: 'none',
                        }}
                      >
                        <option value="manual">Manual</option>
                        <option value="algorithm">Algorithm</option>
                        <option value="graph">Graph</option>
                        <option value="trace">Trace</option>
                        <option value="snapshot">Snapshot</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        type="submit"
                        className="action-button action-button-primary"
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
                      >
                        Create Poster
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewPosterForm(false)}
                        style={{
                          padding: '0.5rem 1.25rem',
                          borderRadius: 8,
                          border: '1px solid #334155',
                          background: 'transparent',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* poster cards */}
              <div
                className={posterView === 'grid' ? 'poster-grid' : ''}
                style={posterView === 'list' ? { display: 'flex', flexDirection: 'column', gap: '0.75rem' } : undefined}
              >
                <AnimatePresence>
                  {filteredPosters.map((poster, i) => (
                    <motion.article
                      key={poster.id}
                      className={`poster-card glass-panel ${posterView === 'list' ? 'poster-card-list' : ''}`}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                      layout
                      style={posterView === 'list' ? { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.25rem' } : undefined}
                    >
                      <div className="poster-thumb" style={posterView === 'list' ? { width: 160, flexShrink: 0 } : undefined}>
                        <img src={buildPosterPreview(poster.title)} alt={poster.title} />
                      </div>
                      <div className="poster-meta" style={{ flex: 1 }}>
                        <strong>{poster.title}</strong>
                        <p>{poster.payload?.summary ?? 'No summary available.'}</p>
                        <div className="poster-detail-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                          <span className="mini-pill">{poster.sourceType ?? 'manual'}</span>
                          <span className="mini-pill">{poster.visibility ?? 'private'}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {formatDate(poster.createdAt)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button
                            type="button"
                            className="action-button action-button-primary"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            style={{
                              padding: '0.35rem 0.85rem',
                              fontSize: '0.75rem',
                              borderRadius: 8,
                              border: '1px solid #334155',
                              background: 'transparent',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.target.style.borderColor = '#f59e0b'; e.target.style.color = '#f59e0b' }}
                            onMouseLeave={(e) => { e.target.style.borderColor = '#334155'; e.target.style.color = '#94a3b8' }}
                          >
                            Share
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>

                {filteredPosters.length === 0 && (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
                    No posters match your search.
                  </p>
                )}
              </div>
            </motion.section>
          )}

          {/* ═══ CHALLENGE BROWSER TAB ═══ */}
          {activeTab === 'challenges' && (
            <motion.section
              key="challenges"
              variants={tabContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass-panel challenge-browser-panel"
            >
              <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p className="card-tag text-purple">Divergence Challenges</p>
                  <h3>Launchpad</h3>
                </div>
                <span className="mini-pill">{filteredChallenges.length} of {challenges.length} Challenges</span>
              </div>

              {/* difficulty filter buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', flexWrap: 'wrap' }}>
                {['all', 'easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficultyFilter(level)}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: 9999,
                      border: difficultyFilter === level ? 'none' : '1px solid #334155',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s',
                      background: difficultyFilter === level
                        ? (level === 'all' ? '#f59e0b' : (DIFFICULTY_COLORS[level] ?? '#f59e0b'))
                        : 'transparent',
                      color: difficultyFilter === level ? '#0f172a' : '#94a3b8',
                    }}
                  >
                    {level === 'all' ? 'All Difficulties' : level}
                  </button>
                ))}
              </div>

              {/* challenge cards */}
              <div className="challenge-grid">
                <AnimatePresence>
                  {filteredChallenges.map((challenge, i) => {
                    const isFeatured = i === 0
                    const progress = challengeProgress[challenge.id] ?? 'not started'
                    const realmColor = REALM_ACCENT_COLORS[challenge.targetRealm] ?? '#94a3b8'
                    const diffColor = DIFFICULTY_COLORS[(challenge.parameters?.difficulty ?? '').toLowerCase()] ?? '#94a3b8'

                    return (
                      <motion.article
                        key={challenge.id}
                        className="challenge-card glass-panel"
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
                        layout
                        style={{
                          position: 'relative',
                          borderLeft: isFeatured ? '3px solid #f59e0b' : undefined,
                        }}
                      >
                        {/* featured badge */}
                        {isFeatured && (
                          <div style={{
                            position: 'absolute',
                            top: -1,
                            right: 12,
                            background: '#f59e0b',
                            color: '#0f172a',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 10px 4px',
                            borderRadius: '0 0 6px 6px',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}>
                            Featured
                          </div>
                        )}

                        <div className="challenge-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                          {/* difficulty pill */}
                          <span
                            className="mini-pill"
                            style={{ background: `${diffColor}22`, color: diffColor, border: `1px solid ${diffColor}44` }}
                          >
                            {challenge.parameters?.difficulty ?? 'Diagnostic'}
                          </span>
                          {/* reward */}
                          <span className="mini-pill text-amber">{challenge.parameters?.reward ?? 'Cyan Badge'}</span>
                          {/* progress */}
                          <span
                            className="mini-pill"
                            style={{
                              background: progress === 'completed' ? '#10b98122' : progress === 'in progress' ? '#f59e0b22' : '#33415522',
                              color: progress === 'completed' ? '#10b981' : progress === 'in progress' ? '#f59e0b' : '#64748b',
                              border: `1px solid ${progress === 'completed' ? '#10b98144' : progress === 'in progress' ? '#f59e0b44' : '#33415566'}`,
                              textTransform: 'capitalize',
                            }}
                          >
                            {progress === 'completed' ? '✓ ' : progress === 'in progress' ? '◔ ' : '○ '}
                            {progress}
                          </span>
                        </div>

                        <h3 style={{ margin: '0.75rem 0 0.35rem' }}>{challenge.title}</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                          {challenge.parameters?.body ?? 'Launch this diagnostic divergence challenge.'}
                        </p>

                        {/* meta row: realm badge + time + xp */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', margin: '0.75rem 0' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '0.25rem 0.65rem',
                              borderRadius: 9999,
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: `${realmColor}18`,
                              color: realmColor,
                              border: `1px solid ${realmColor}33`,
                              textTransform: 'capitalize',
                            }}
                          >
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: realmColor, display: 'inline-block' }} />
                            {challenge.targetRealm}
                          </span>

                          {challenge.parameters?.estimatedMinutes && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              ~{challenge.parameters.estimatedMinutes} min
                            </span>
                          )}

                          {challenge.parameters?.xp && (
                            <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600 }}>
                              +{challenge.parameters.xp} XP
                            </span>
                          )}
                        </div>

                        {/* progress toggle */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="action-button action-button-primary"
                            onClick={() => handleLaunchChallenge(challenge)}
                          >
                            Launch Challenge
                          </button>
                          <select
                            value={progress}
                            onChange={(e) => setChallengeProgress((prev) => ({ ...prev, [challenge.id]: e.target.value }))}
                            style={{
                              padding: '0.35rem 0.5rem',
                              borderRadius: 8,
                              border: '1px solid #334155',
                              background: '#0f172a',
                              color: '#94a3b8',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              outline: 'none',
                            }}
                          >
                            {PROGRESS_STATES.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </motion.article>
                    )
                  })}
                </AnimatePresence>

                {filteredChallenges.length === 0 && (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
                    No challenges match this difficulty filter.
                  </p>
                )}
              </div>
            </motion.section>
          )}

          {/* ═══ RECENT ACTIVITY TAB ═══ */}
          {activeTab === 'activity' && (
            <motion.section
              key="activity"
              variants={tabContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass-panel"
              style={{ padding: '1.5rem' }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <p className="card-tag text-amber">Activity</p>
                <h3>Recent Activity</h3>
              </div>

              {recentActivity.length === 0 && (
                <p style={{ color: '#64748b' }}>No recent activity to show.</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={`${item.type}-${i}`}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 10,
                      background: i % 2 === 0 ? 'rgba(248,250,252,0.02)' : 'transparent',
                    }}
                  >
                    {/* icon */}
                    <span style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      flexShrink: 0,
                      background: item.type === 'poster' ? '#f59e0b18' : '#10b98118',
                      color: item.type === 'poster' ? '#f59e0b' : '#10b981',
                    }}>
                      {item.type === 'poster' ? '🖼' : '✓'}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#e2e8f0', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </div>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: '#475569', flexShrink: 0 }}>
                      {timeAgo(item.time)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

        </AnimatePresence>
      </section>
    </>
  )
}
