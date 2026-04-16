import { useEffect, useRef, useState } from 'react'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'

class Particle {
  constructor(canvas) {
    this.canvas = canvas
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.vx = (Math.random() - 0.5) * 2
    this.vy = (Math.random() - 0.5) * 2
    this.color = '#A855F7'
  }

  update(stiffness, friction) {
    // Add logic friction
    this.vx *= (1 - friction / 100)
    this.vy *= (1 - friction / 100)

    // Add some "swarm" stiffness towards center
    const dx = (this.canvas.width / 2) - this.x
    const dy = (this.canvas.height / 2) - this.y
    this.vx += dx * (stiffness / 10000)
    this.vy += dy * (stiffness / 10000)

    this.x += this.vx
    this.y += this.vy

    // Bounce
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1
  }

  draw(ctx, size) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, size, size)
  }
}

export default function SandboxPage() {
  const realm = realmConfig.sandbox
  const canvasRef = useRef(null)
  const [params, setParams] = useState({
    particleCount: 2000,
    stiffness: 42,
    friction: 4,
    particleSize: 2
  })
  const [isSabotaged, setIsSabotaged] = useState(false)
  const particles = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Init particles
    particles.current = Array.from({ length: params.particleCount }, () => new Particle(canvas))
  }, [params.particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    let animationId
    const render = () => {
      ctx.fillStyle = isSabotaged ? 'rgba(168, 85, 247, 0.05)' : 'rgba(5, 5, 5, 0.4)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach(p => {
        p.update(params.stiffness, params.friction)
        
        if (isSabotaged && Math.random() > 0.98) {
             // Visual glitch sabotage
             ctx.fillStyle = '#00F2FF'
             ctx.fillRect(p.x - 10, p.y - 2, 20, 1)
        }
        
        p.draw(ctx, params.particleSize)
      })

      animationId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationId)
  }, [params, isSabotaged])

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="Experimental systems and large-scale simulation. Break the logic, stress-test the swarm, and observe emergent chaos."
        accent={realm.accent}
      />

      <section className="sandbox-layout">
        <article className="glass-panel visualizer-panel sandbox-canvas-panel">
          <div className="panel-heading">
            <div>
              <p className="card-tag text-purple">Simulation Stage</p>
              <h3>Emergent Logic Swarm</h3>
            </div>
            <span className="mini-pill">{params.particleCount} Nodes Active</span>
          </div>

          <canvas 
            ref={canvasRef} 
            width={800} 
            height={500} 
            className={`sandbox-canvas${isSabotaged ? ' is-glitched' : ''}`}
          />
        </article>

        <aside className="lab-side-column">
          <article className="glass-panel content-card accent-purple">
            <div className="panel-heading">
              <div>
                <p className="card-tag text-purple">Chaos Panel</p>
                <h3>System Parameters</h3>
              </div>
            </div>

            <div className="settings-stack">
              <label className="setting-control">
                <span className="setting-header">
                  <strong>Swarm Density</strong>
                  <small>{params.particleCount}</small>
                </span>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={params.particleCount}
                  onChange={(e) => setParams(p => ({ ...p, particleCount: Number(e.target.value) }))}
                />
              </label>

              <label className="setting-control">
                <span className="setting-header">
                  <strong>Logical Stiffness</strong>
                  <small>{params.stiffness}</small>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.stiffness}
                  onChange={(e) => setParams(p => ({ ...p, stiffness: Number(e.target.value) }))}
                />
              </label>

              <label className="setting-control">
                <span className="setting-header">
                  <strong>System Friction</strong>
                  <small>{params.friction}%</small>
                </span>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={params.friction}
                  onChange={(e) => setParams(p => ({ ...p, friction: Number(e.target.value) }))}
                />
              </label>
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
          </article>

          <article className="glass-panel content-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-cyan">Performance Telemetry</p>
                  <h3>Canvas Diagnostics</h3>
                </div>
              </div>
              <dl className="telemetry-list">
                <div>
                  <dt>Render Engine</dt>
                  <dd>HTML5 Canvas</dd>
                </div>
                <div>
                  <dt>Target FPS</dt>
                  <dd>60</dd>
                </div>
                <div>
                  <dt>Scale Target</dt>
                  <dd>100k nodes (Future)</dd>
                </div>
              </dl>
          </article>
        </aside>
      </section>
    </>
  )
}
