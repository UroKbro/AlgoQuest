import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { fetchChallenges, fetchProjects } from '../api'

export default function ForgePage() {
  const realm = realmConfig.forge
  const [posters, setPosters] = useState([])
  const [challenges, setChallenges] = useState([])
  const [status, setStatus] = useState('loading')

  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([fetchProjects(), fetchChallenges()])
      .then(([projectsData, challengesData]) => {
        setPosters(projectsData.items ?? [])
        setChallenges(challengesData.items ?? [])
        setStatus('ready')
      })
      .catch(() => {
        // Fallback mocks
        setPosters([
            { id: '1', name: 'Binary Tree Radial', description: 'Visual capture of an optimized Red-Black tree.', thumbnail: 'https://placehold.co/400x240/050505/fff?text=Tree+Radial' },
            { id: '2', name: 'Pathfinder v1', description: 'A* implementation across a 1000-node graph.', thumbnail: 'https://placehold.co/400x240/050505/fff?text=Pathfinder' }
        ])
        setChallenges([
            { slug: 'bubble-burst', name: 'Bubble Burst', difficulty: 'Dojo', reward: 'Belt Fragment', body: 'Optimize bubble sort to handle nearly-sorted data.', target: '/dojo' },
            { slug: 'graph-ghost', name: 'The Graph Ghost', difficulty: 'Laboratory', reward: 'Cyan Badge', body: 'Identify a missing edge in a Dijkstra trace.', target: '/laboratory', algoSlug: 'dijkstra' }
        ])
        setStatus('ready')
      })
  }, [])

  function handleLaunchChallenge(challenge) {
    navigate(challenge.target, { state: { challenge } })
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
                            <img src={poster.thumbnail} alt={poster.name} />
                        </div>
                        <div className="poster-meta">
                            <strong>{poster.name}</strong>
                            <p>{poster.description}</p>
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
                    <article key={challenge.slug} className="challenge-card glass-panel">
                        <div className="challenge-header">
                            <span className="mini-pill">{challenge.difficulty}</span>
                            <span className="mini-pill text-amber">{challenge.reward}</span>
                        </div>
                        <h3>{challenge.name}</h3>
                        <p>{challenge.body}</p>
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
