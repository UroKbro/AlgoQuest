import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { fetchSimulations } from '../api'

/* ───────────────────────────── Presets ───────────────────────────── */

const PRESETS = [
  { label: 'Calm Swarm',   particleCount: 1000, stiffness: 15, friction: 12, particleSize: 2, repulsion: 5,  gravity: 'center', colorMode: 'solid',    sabotage: false },
  { label: 'Tornado',      particleCount: 5000, stiffness: 90, friction: 2,  particleSize: 2, repulsion: 12, gravity: 'center', colorMode: 'velocity',  sabotage: false },
  { label: 'Galaxy',       particleCount: 8000, stiffness: 50, friction: 1,  particleSize: 1, repulsion: 8,  gravity: 'center', colorMode: 'velocity',  sabotage: false },
  { label: 'Chaos Storm',  particleCount: Math.floor(Math.random() * 6000) + 2000, stiffness: Math.floor(Math.random() * 100), friction: Math.floor(Math.random() * 20), particleSize: Math.ceil(Math.random() * 4), repulsion: Math.floor(Math.random() * 20), gravity: ['center', 'bottom', 'none'][Math.floor(Math.random() * 3)], colorMode: 'random', sabotage: true },
]

/* ───────────────────────────── Helpers ───────────────────────────── */

function hslFromVelocity(speed, mode) {
  if (mode === 'solid')    return '#A855F7'
  if (mode === 'random')   return `hsl(${Math.random() * 360}, 80%, 60%)`
  if (mode === 'velocity') {
    // purple→cyan→yellow as speed increases
    const hue = Math.min(speed * 20, 200)
    return `hsl(${270 - hue}, 90%, ${55 + Math.min(speed * 3, 25)}%)`
  }
  // heat-map: blue→red
  const t = Math.min(speed / 10, 1)
  const hue = 240 - t * 240
  return `hsl(${hue}, 95%, ${50 + t * 20}%)`
}

/* ──────────────────────── Enhanced Particle ──────────────────────── */

class Particle {
  constructor(canvas) {
    this.canvas = canvas
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.vx = (Math.random() - 0.5) * 2
    this.vy = (Math.random() - 0.5) * 2
    this.color = '#A855F7'
    this.trail = []
    this.maxTrailLength = 6
  }

  get speed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy)
  }

  update(stiffness, friction, mouse, repulsion = 5, gravity = 'center') {
    // Friction
    this.vx *= (1 - friction / 100)
    this.vy *= (1 - friction / 100)

    // Mouse repulsion
    if (mouse.x !== null) {
      const dxm = this.x - mouse.x
      const dym = this.y - mouse.y
      const dist = Math.sqrt(dxm * dxm + dym * dym)
      if (dist < 100) {
        const force = (100 - dist) / 100
        this.vx += (dxm / dist) * force * repulsion * 2
        this.vy += (dym / dist) * force * repulsion * 2
      }
    }

    // Gravity / attraction
    if (gravity === 'center') {
      const dx = (this.canvas.width / 2) - this.x
      const dy = (this.canvas.height / 2) - this.y
      this.vx += dx * (stiffness / 10000)
      this.vy += dy * (stiffness / 10000)
    } else if (gravity === 'bottom') {
      this.vy += stiffness / 500
      const dx = (this.canvas.width / 2) - this.x
      this.vx += dx * (stiffness / 40000)
    }
    // 'none' → no gravity term

    this.x += this.vx
    this.y += this.vy

    // Bounce
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1
    this.x = Math.max(0, Math.min(this.canvas.width, this.x))
    this.y = Math.max(0, Math.min(this.canvas.height, this.y))
  }

  draw(ctx, size, colorMode = 'solid', showTrail = false) {
    // Update color based on mode
    this.color = hslFromVelocity(this.speed, colorMode)

    // Trail
    if (showTrail) {
      this.trail.push({ x: this.x, y: this.y })
      if (this.trail.length > this.maxTrailLength) this.trail.shift()
      for (let i = 0; i < this.trail.length; i++) {
        const alpha = (i / this.trail.length) * 0.3
        ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('hsl(', 'hsla(').replace('rgb(', 'rgba(')
        if (this.color.startsWith('#')) {
          ctx.globalAlpha = alpha
          ctx.fillStyle = this.color
        }
        const trailSize = size * (i / this.trail.length)
        ctx.beginPath()
        ctx.arc(this.trail[i].x, this.trail[i].y, Math.max(trailSize / 2, 0.5), 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    // Main particle
    ctx.fillStyle = this.color
    if (size > 2) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(this.x, this.y, size, size)
    }
  }
}

/* ────────────────────── Mini Sparkline Component ─────────────────── */

function Sparkline({ data, width = 120, height = 28, color = '#A855F7' }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ──────────────────── System Health Indicator ────────────────────── */

function HealthIndicator({ fps }) {
  let color = '#22c55e'
  let label = 'Healthy'
  if (fps < 40) { color = '#eab308'; label = 'Degraded' }
  if (fps < 20) { color = '#ef4444'; label = 'Critical' }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: color,
        boxShadow: `0 0 6px ${color}`, display: 'inline-block',
      }} />
      <span style={{ color, fontWeight: 600, fontSize: '0.82rem' }}>{label}</span>
    </span>
  )
}

/* ─────────────── Styled Range Slider with colored fill ──────────── */

function StyledSlider({ label, value, min, max, step = 1, unit = '', color = '#A855F7', onChange }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className="setting-control">
      <span className="setting-header">
        <strong>{label}</strong>
        <small>{value}{unit}</small>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
          accentColor: color,
        }}
      />
    </label>
  )
}

/* ════════════════════════ MAIN COMPONENT ═════════════════════════ */

export default function SandboxPage() {
  const realm = realmConfig.sandbox
  const canvasRef = useRef(null)

  const [simulationState, setSimulationState] = useState({ status: 'loading', items: [], message: '' })
  const [activeSimIndex, setActiveSimIndex] = useState(0)

  const [params, setParams] = useState({
    particleCount: 2000,
    stiffness: 42,
    friction: 4,
    particleSize: 2,
    repulsion: 5,
    gravity: 'center',
    colorMode: 'solid',
  })

  const [isSabotaged, setIsSabotaged] = useState(false)
  const [showConnections, setShowConnections] = useState(false)
  const [showTrails, setShowTrails] = useState(false)

  const particles = useRef([])
  const mouse = useRef({ x: null, y: null })

  // FPS tracking
  const fpsRef = useRef(0)
  const [displayFps, setDisplayFps] = useState(60)
  const fpsHistory = useRef([])
  const [fpsData, setFpsData] = useState([])

  // Telemetry
  const [avgVelocity, setAvgVelocity] = useState(0)
  const [systemEnergy, setSystemEnergy] = useState(0)

  /* ── Fetch simulations ── */
  useEffect(() => {
    let cancelled = false

    fetchSimulations()
      .then((data) => {
        if (!cancelled) {
          setSimulationState({ status: 'ready', items: data.items ?? [], message: '' })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setSimulationState({
            status: 'ready',
            items: [
              {
                slug: 'boids-swarm',
                name: 'Boids Swarm',
                scale: '100k-ready',
                summary: 'Emergent flocking under live cohesion and repulsion tuning.',
                description: 'A particle swarm simulation using boid-style rules. Particles exhibit emergent flocking behavior driven by cohesion, alignment, and separation forces that you can tune in real time.',
              },
              {
                slug: 'raft-failover',
                name: 'Raft Failover',
                scale: 'cluster',
                summary: 'Stress consensus timing with injected leader failures.',
                description: 'Simulates a Raft consensus cluster where you can inject leader failures and observe how the system re-elects a leader and reaches consensus under stress.',
              },
            ],
            message: error.message,
          })
        }
      })

    return () => { cancelled = true }
  }, [])

  const activeSimulation = simulationState.items[activeSimIndex] ?? simulationState.items[0]
  const chaosLevel = isSabotaged ? 'High' : params.friction > 10 ? 'Moderate' : 'Stable'

  /* ── Init particles when count changes ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    particles.current = Array.from({ length: params.particleCount }, () => new Particle(canvas))
  }, [params.particleCount])

  /* ── Main render loop ── */
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    let animationId
    let lastTime = performance.now()
    let frameCount = 0
    let fpsAccum = 0

    const render = (now) => {
      // FPS calculation
      frameCount++
      const delta = now - lastTime
      if (delta >= 500) {
        const currentFps = Math.round((frameCount / delta) * 1000)
        fpsRef.current = currentFps
        fpsAccum++
        // Push to history and update state periodically
        fpsHistory.current.push(currentFps)
        if (fpsHistory.current.length > 60) fpsHistory.current.shift()
        if (fpsAccum % 2 === 0) {
          setDisplayFps(currentFps)
          setFpsData([...fpsHistory.current])
        }
        frameCount = 0
        lastTime = now
      }

      // Clear / trail effect
      ctx.fillStyle = isSabotaged ? 'rgba(168, 85, 247, 0.05)' : 'rgba(5, 5, 5, 0.4)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      let totalSpeed = 0
      let totalEnergy = 0

      // Connection lines (only check subset for performance)
      if (showConnections) {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)'
        ctx.lineWidth = 0.5
        const connectionDist = 50
        const checkLimit = Math.min(particles.current.length, 800)
        for (let i = 0; i < checkLimit; i++) {
          const a = particles.current[i]
          for (let j = i + 1; j < checkLimit; j++) {
            const b = particles.current[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            const d2 = dx * dx + dy * dy
            if (d2 < connectionDist * connectionDist) {
              const alpha = 1 - Math.sqrt(d2) / connectionDist
              ctx.strokeStyle = `rgba(168, 85, 247, ${(alpha * 0.2).toFixed(3)})`
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }
          }
        }
      }

      // Update & draw particles
      particles.current.forEach(p => {
        p.update(params.stiffness, params.friction, mouse.current, params.repulsion, params.gravity)

        if (isSabotaged && Math.random() > 0.98) {
          // Visual glitch sabotage
          ctx.fillStyle = '#00F2FF'
          ctx.fillRect(p.x - 10, p.y - 2, 20, 1)
        }

        p.draw(ctx, params.particleSize, params.colorMode, showTrails)

        totalSpeed += p.speed
        totalEnergy += 0.5 * p.speed * p.speed
      })

      // Periodic telemetry state updates (avoid every frame)
      if (fpsAccum % 4 === 0 && particles.current.length > 0) {
        setAvgVelocity(+(totalSpeed / particles.current.length).toFixed(2))
        setSystemEnergy(+totalEnergy.toFixed(1))
      }

      animationId = requestAnimationFrame(render)
    }

    animationId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationId)
  }, [params, isSabotaged, showConnections, showTrails])

  /* ── Preset application ── */
  const applyPreset = (preset) => {
    // Chaos Storm re-randomizes every time
    const p = preset.label === 'Chaos Storm'
      ? {
          ...preset,
          particleCount: Math.floor(Math.random() * 6000) + 2000,
          stiffness: Math.floor(Math.random() * 100),
          friction: Math.floor(Math.random() * 20),
          particleSize: Math.ceil(Math.random() * 4),
          repulsion: Math.floor(Math.random() * 20),
          gravity: ['center', 'bottom', 'none'][Math.floor(Math.random() * 3)],
        }
      : preset

    setParams({
      particleCount: p.particleCount,
      stiffness: p.stiffness,
      friction: p.friction,
      particleSize: p.particleSize,
      repulsion: p.repulsion,
      gravity: p.gravity,
      colorMode: p.colorMode,
    })
    setIsSabotaged(p.sabotage)
  }

  /* ── Screenshot ── */
  const handleScreenshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `sandbox-capture-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  /* ════════════════════════ RENDER ═════════════════════════════════ */
  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="Experimental systems and large-scale simulation. Break the logic, stress-test the swarm, and observe emergent chaos."
        accent={realm.accent}
      />

      {/* ── Preset Buttons ── */}
      <section className="sandbox-presets" style={{ display: 'flex', gap: 10, padding: '0 1.5rem 1rem', flexWrap: 'wrap' }}>
        {PRESETS.map((preset) => (
          <motion.button
            key={preset.label}
            type="button"
            className="action-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyPreset(preset)}
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 1rem',
              borderRadius: 8,
              border: '1px solid rgba(168,85,247,0.3)',
              background: 'rgba(168,85,247,0.08)',
              color: '#d4b5ff',
              cursor: 'pointer',
            }}
          >
            {preset.label}
          </motion.button>
        ))}
      </section>

      <section className="sandbox-layout">
        {/* ─────────── Canvas Panel ─────────── */}
        <article className="glass-panel visualizer-panel sandbox-canvas-panel">
          <div className="panel-heading">
            <div>
              <p className="card-tag text-purple">Simulation Stage</p>
              <h3>Emergent Logic Swarm</h3>
            </div>
            <span className="mini-pill">{params.particleCount} Nodes Active</span>
          </div>

          {/* Canvas toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 0.6rem', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'monospace', fontSize: '0.78rem', color: displayFps >= 40 ? '#22c55e' : displayFps >= 20 ? '#eab308' : '#ef4444',
              background: 'rgba(0,0,0,0.4)', padding: '3px 8px', borderRadius: 4,
            }}>
              {displayFps} FPS
            </span>

            <button
              type="button"
              onClick={() => setShowConnections(c => !c)}
              style={{
                fontSize: '0.75rem', padding: '3px 10px', borderRadius: 4, cursor: 'pointer',
                border: showConnections ? '1px solid #A855F7' : '1px solid rgba(255,255,255,0.12)',
                background: showConnections ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                color: showConnections ? '#d4b5ff' : '#888',
              }}
            >
              Connections {showConnections ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() => setShowTrails(t => !t)}
              style={{
                fontSize: '0.75rem', padding: '3px 10px', borderRadius: 4, cursor: 'pointer',
                border: showTrails ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.12)',
                background: showTrails ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                color: showTrails ? '#67e8f9' : '#888',
              }}
            >
              Trails {showTrails ? 'ON' : 'OFF'}
            </button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleScreenshot}
              style={{
                fontSize: '0.75rem', padding: '3px 10px', borderRadius: 4, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: '#aaa', marginLeft: 'auto',
              }}
            >
              Screenshot
            </motion.button>
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className={`sandbox-canvas${isSabotaged ? ' is-glitched' : ''}`}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
            }}
            onMouseLeave={() => {
              mouse.current = { x: null, y: null }
            }}
          />
        </article>

        {/* ─────────── Side Column ─────────── */}
        <aside className="lab-side-column">

          {/* ── Enhanced Chaos Panel ── */}
          <article className="glass-panel content-card accent-purple">
            <div className="panel-heading">
              <div>
                <p className="card-tag text-purple">Chaos Panel</p>
                <h3>{activeSimulation?.name ?? 'System Parameters'}</h3>
              </div>
              {activeSimulation?.scale ? <span className="mini-pill">{activeSimulation.scale}</span> : null}
            </div>

            <p className="status-copy">{activeSimulation?.summary ?? 'Tune the active simulation and inspect how the swarm responds in real time.'}</p>

            <div className="settings-stack">
              <StyledSlider
                label="Swarm Density"
                value={params.particleCount}
                min={100} max={10000} step={100}
                color="#A855F7"
                onChange={(e) => setParams(p => ({ ...p, particleCount: Number(e.target.value) }))}
              />

              <StyledSlider
                label="Logical Stiffness"
                value={params.stiffness}
                min={0} max={100}
                color="#8B5CF6"
                onChange={(e) => setParams(p => ({ ...p, stiffness: Number(e.target.value) }))}
              />

              <StyledSlider
                label="System Friction"
                value={params.friction}
                min={0} max={20}
                unit="%"
                color="#6366F1"
                onChange={(e) => setParams(p => ({ ...p, friction: Number(e.target.value) }))}
              />

              <StyledSlider
                label="Particle Size"
                value={params.particleSize}
                min={1} max={8}
                unit="px"
                color="#EC4899"
                onChange={(e) => setParams(p => ({ ...p, particleSize: Number(e.target.value) }))}
              />

              <StyledSlider
                label="Repulsion Force"
                value={params.repulsion}
                min={0} max={20}
                color="#F59E0B"
                onChange={(e) => setParams(p => ({ ...p, repulsion: Number(e.target.value) }))}
              />

              {/* Gravity Direction */}
              <div className="setting-control">
                <span className="setting-header">
                  <strong>Gravity Direction</strong>
                  <small>{params.gravity}</small>
                </span>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {['center', 'bottom', 'none'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setParams(p => ({ ...p, gravity: g }))}
                      style={{
                        flex: 1, padding: '4px 0', fontSize: '0.72rem', borderRadius: 4, cursor: 'pointer',
                        textTransform: 'capitalize',
                        border: params.gravity === g ? '1px solid #A855F7' : '1px solid rgba(255,255,255,0.1)',
                        background: params.gravity === g ? 'rgba(168,85,247,0.2)' : 'transparent',
                        color: params.gravity === g ? '#d4b5ff' : '#888',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Mode */}
              <div className="setting-control">
                <span className="setting-header">
                  <strong>Color Mode</strong>
                  <small>{params.colorMode}</small>
                </span>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {['solid', 'velocity', 'random'].map(cm => (
                    <button
                      key={cm}
                      type="button"
                      onClick={() => setParams(p => ({ ...p, colorMode: cm }))}
                      style={{
                        flex: 1, padding: '4px 0', fontSize: '0.72rem', borderRadius: 4, cursor: 'pointer',
                        textTransform: 'capitalize',
                        border: params.colorMode === cm ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                        background: params.colorMode === cm ? 'rgba(6,182,212,0.15)' : 'transparent',
                        color: params.colorMode === cm ? '#67e8f9' : '#888',
                      }}
                    >
                      {cm}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sabotage-actions transport-row">
              <button
                type="button"
                className={`action-button ${isSabotaged ? 'action-button-primary' : ''}`}
                onClick={() => setIsSabotaged(!isSabotaged)}
              >
                {isSabotaged ? 'Restore Logic' : 'Structural Sabotage'}
              </button>
            </div>

            {simulationState.message ? <p className="status-copy">Using local simulation metadata because the API request failed: {simulationState.message}</p> : null}
          </article>

          {/* ── Enhanced Telemetry Panel ── */}
          <article className="glass-panel content-card">
            <div className="panel-heading">
              <div>
                <p className="card-tag text-cyan">Performance Telemetry</p>
                <h3>Canvas Diagnostics</h3>
              </div>
              <HealthIndicator fps={displayFps} />
            </div>
            <dl className="telemetry-list">
              <div>
                <dt>Active Simulation</dt>
                <dd>{activeSimulation?.name ?? 'Boids Swarm'}</dd>
              </div>
              <div>
                <dt>Render Engine</dt>
                <dd>HTML5 Canvas</dd>
              </div>
              <div>
                <dt>Real-time FPS</dt>
                <dd style={{ color: displayFps >= 40 ? '#22c55e' : displayFps >= 20 ? '#eab308' : '#ef4444', fontWeight: 600 }}>
                  {displayFps}
                </dd>
              </div>
              <div>
                <dt>Target FPS</dt>
                <dd>60</dd>
              </div>
              <div>
                <dt>Particle Count</dt>
                <dd>{params.particleCount.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Avg Velocity</dt>
                <dd>{avgVelocity}</dd>
              </div>
              <div>
                <dt>System Energy</dt>
                <dd>{systemEnergy.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Instability</dt>
                <dd>{chaosLevel}</dd>
              </div>
              <div>
                <dt>Scale Target</dt>
                <dd>{activeSimulation?.scale ?? '100k-ready'}</dd>
              </div>
            </dl>

            {/* FPS Sparkline */}
            {fpsData.length > 2 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: '0.72rem', color: '#888', marginBottom: 4 }}>FPS over time</p>
                <Sparkline data={fpsData} width={220} height={32} color={displayFps >= 40 ? '#22c55e' : displayFps >= 20 ? '#eab308' : '#ef4444'} />
              </div>
            )}
          </article>

          {/* ── Simulation Metadata Panel ── */}
          <AnimatePresence>
            {simulationState.items.length > 0 && (
              <motion.article
                className="glass-panel content-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-purple">Simulation Metadata</p>
                    <h3>Loaded Simulations</h3>
                  </div>
                  <span className="mini-pill">{simulationState.items.length} available</span>
                </div>

                {activeSimulation && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: '0.82rem', color: '#ccc', lineHeight: 1.5 }}>
                      {activeSimulation.description ?? activeSimulation.summary ?? 'No description available.'}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {simulationState.items.map((sim, idx) => (
                    <motion.button
                      key={sim.slug}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setActiveSimIndex(idx)}
                      style={{
                        fontSize: '0.78rem', padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                        border: activeSimIndex === idx ? '1px solid #A855F7' : '1px solid rgba(255,255,255,0.1)',
                        background: activeSimIndex === idx ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.03)',
                        color: activeSimIndex === idx ? '#d4b5ff' : '#999',
                      }}
                    >
                      {sim.name}
                    </motion.button>
                  ))}
                </div>
              </motion.article>
            )}
          </AnimatePresence>

        </aside>
      </section>
    </>
  )
}
