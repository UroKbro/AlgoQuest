import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { fetchChallenges, fetchPosters } from '../api'

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
                            <img src={`https://placehold.co/400x240/050505/fff?text=${poster.title}`} alt={poster.title} />
                        </div>
                        <div className="poster-meta">
                            <strong>{poster.title}</strong>
                            <p>{poster.payload?.summary ?? 'No summary available.'}</p>
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
