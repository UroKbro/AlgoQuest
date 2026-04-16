import { useEffect, useState } from 'react'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { fetchPathAnalytics } from '../api'

const MasteryRadar = ({ data }) => {
  const categories = Object.keys(data)
  const values = Object.values(data)
  const size = 300
  const center = size / 2
  const radius = size * 0.4

  const points = categories.map((cat, i) => {
    const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2
    const val = (values[i] / 100) * radius
    return {
      x: center + val * Math.cos(angle),
      y: center + val * Math.sin(angle)
    }
  })

  const pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div className="radar-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(r => (
            <circle key={r} cx={center} cy={center} r={radius * r} fill="none" stroke="rgba(255,255,255,0.05)" />
        ))}
        {/* Axis lines */}
        {categories.map((cat, i) => {
            const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2
            const x2 = center + radius * Math.cos(angle)
            const y2 = center + radius * Math.sin(angle)
            return (
                <g key={cat}>
                    <line x1={center} y1={center} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" />
                    <text 
                        x={center + (radius + 20) * Math.cos(angle)} 
                        y={center + (radius + 20) * Math.sin(angle)} 
                        textAnchor="middle" 
                        fill="rgba(255,255,255,0.6)" 
                        fontSize="10"
                    >
                        {cat}
                    </text>
                </g>
            )
        })}
        {/* Radar path */}
        <path d={pathData} fill="rgba(168, 85, 247, 0.3)" stroke="#A855F7" strokeWidth="2" />
        {/* Data points */}
        {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#A855F7" />
        ))}
      </svg>
    </div>
  )
}

export default function PathPage() {
  const realm = realmConfig.path
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetchPathAnalytics()
      .then(res => {
        setData(res)
        setStatus('ready')
      })
      .catch(() => {
        // Fallback mock
        setData({
          mastery: {
            Complexity: 78,
            Sorting: 92,
            Recursion: 45,
            Graphs: 30,
            Strings: 85,
            Lists: 95
          },
          weeklyBreakdown: [
            { day: 'Mon', focus: 'Sorting', status: 'High' },
            { day: 'Tue', focus: 'Complexity', status: 'Med' },
            { day: 'Wed', focus: 'Graphs', status: 'Inc' },
            { day: 'Thu', focus: 'Recursion', status: 'Med' },
            { day: 'Fri', focus: 'Sorting', status: 'Med' }
          ],
          frictionPoints: [
            'Dijkstra priority queue management',
            'Recursion depth limits in DFS',
            'Big O of nested loop sets'
          ]
        })
        setStatus('ready')
      })
  }, [])

  if (status === 'loading') return <p>Calibrating Mastery Radar...</p>

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="Path analytics provides a deep-space readout of your logic mastery. Identify friction points and chart your next course."
        accent={realm.accent}
      />

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
                <MasteryRadar data={data.mastery} />
            </div>
        </article>

        <section className="path-telemetry-column">
            <article className="glass-panel content-card">
                <div className="panel-heading">
                    <div>
                        <p className="card-tag text-cyan">Weekly breakdown</p>
                        <h3>Logic Focus</h3>
                    </div>
                </div>
                <div className="telem-row-stack">
                    {data.weeklyBreakdown.map(item => (
                        <div key={item.day} className="telem-row">
                            <span className="day-label">{item.day}</span>
                            <div className="telem-focus">
                                <strong>{item.focus}</strong>
                                <small>Session Intensity: {item.status}</small>
                            </div>
                            <div className={`telem-dot is-${item.status.toLowerCase()}`} />
                        </div>
                    ))}
                </div>
            </article>

            <article className="glass-panel content-card muted-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-purple">Friction Drilldown</p>
                  <h3>Critical Logjams</h3>
                </div>
              </div>
              <ul className="mini-list friction-list">
                {data.frictionPoints.map(point => (
                    <li key={point}>
                        <div className="friction-icon" />
                        <span>{point}</span>
                    </li>
                ))}
              </ul>
            </article>
        </section>
      </section>
    </>
  )
}
