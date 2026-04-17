import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { fetchChallenges, fetchPosters } from '../api'

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

export default function ForgePage() {
  const realm = realmConfig.forge
  const [posters, setPosters] = useState([])
  const [challenges, setChallenges] = useState([])
  const [status, setStatus] = useState('loading')

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
            { id: '1', title: 'Binary Tree Radial', payload: { summary: 'Visual capture of an optimized Red-Black tree.' }, createdAt: new Date().toISOString() },
            { id: '2', title: 'Pathfinder v1', payload: { summary: 'A* implementation across a 1000-node graph.' }, createdAt: new Date().toISOString() }
        ])
        setChallenges([
            { id: '1', title: 'Bubble Burst', targetRealm: 'dojo', parameters: { body: 'Optimize bubble sort to handle nearly-sorted data.', difficulty: 'Dojo', reward: 'Belt Fragment' } },
            { id: '2', title: 'The Graph Ghost', targetRealm: 'laboratory', parameters: { body: 'Identify a missing edge in a Dijkstra trace.', difficulty: 'Laboratory', reward: 'Cyan Badge' } }
        ])
        setStatus('ready')
      })
  }, [])

  function handleLaunchChallenge(challenge) {
    navigate(`/${challenge.targetRealm}`, { state: { challenge } })
  }

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="The Forge contains your creative logic output. Browser the poster gallery or launch a diagnostic challenge."
        accent={realm.accent}
      />

      <section className="forge-layout">
        <section className="glass-panel poster-gallery-panel">
            <div className="panel-heading">
                <div>
                    <p className="card-tag text-amber">Poster Gallery</p>
                    <h3>Logic Captures</h3>
                </div>
                <span className="mini-pill">{posters.length} Items</span>
            </div>
            <div className="poster-grid">
                {posters.map(poster => (
                    <article key={poster.id} className="poster-card glass-panel">
                        <div className="poster-thumb">
                            <img src={buildPosterPreview(poster.title)} alt={poster.title} />
                        </div>
                        <div className="poster-meta">
                            <strong>{poster.title}</strong>
                            <p>{poster.payload?.summary ?? 'No summary available.'}</p>
                            <div className="poster-detail-row">
                              <span className="mini-pill">{poster.sourceType ?? 'manual'}</span>
                              <span className="mini-pill">{poster.visibility ?? 'private'}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>

        <section className="glass-panel challenge-browser-panel">
            <div className="panel-heading">
                <div>
                    <p className="card-tag text-purple">Divergence Challenges</p>
                    <h3>Launchpad</h3>
                </div>
            </div>
            <div className="challenge-grid">
                {challenges.map(challenge => (
                    <article key={challenge.id} className="challenge-card glass-panel">
                        <div className="challenge-header">
                            <span className="mini-pill">{challenge.parameters?.difficulty ?? 'Diagnostic'}</span>
                            <span className="mini-pill text-amber">{challenge.parameters?.reward ?? 'Cyan Badge'}</span>
                        </div>
                         <h3>{challenge.title}</h3>
                         <p>{challenge.parameters?.body ?? 'Launch this diagnostic divergence challenge.'}</p>
                         <p className="status-copy">Target realm: {challenge.targetRealm}</p>
                         <button 
                            type="button" 
                            className="action-button action-button-primary"
                            onClick={() => handleLaunchChallenge(challenge)}
                        >
                            Launch Challenge
                        </button>
                    </article>
                ))}
            </div>
        </section>
      </section>
    </>
  )
}
