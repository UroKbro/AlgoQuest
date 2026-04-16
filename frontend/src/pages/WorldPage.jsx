import { useEffect, useMemo, useState } from 'react'
import ReactFlow, { Background, Controls, Handle, Position, applyNodeChanges, applyEdgeChanges } from 'reactflow'
import 'reactflow/dist/style.css'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { fetchProjectBlueprints, aiIdeaToSyntax, aiReviewLogic } from '../api'
import ReactMarkdown from 'react-markdown'

const ProjectNode = ({ data }) => (
  <div className="glass-panel project-node-card">
    <Handle type="target" position={Position.Top} />
    <p className="card-tag">{data.label}</p>
    <strong>{data.value}</strong>
    <Handle type="source" position={Position.Bottom} />
  </div>
)

const nodeTypes = { projectNode: ProjectNode }

export default function WorldPage() {
  const realm = realmConfig.world
  const [blueprints, setBlueprints] = useState([])
  const [selectedBlueprint, setSelectedBlueprint] = useState(null)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('loading')
  const [description, setDescription] = useState('')
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [aiStatus, setAiStatus] = useState('idle')
  const [aiCritique, setAiCritique] = useState('')

  const onNodesChange = (changes) => setNodes((nds) => applyNodeChanges(changes, nds))
  const onEdgesChange = (changes) => setEdges((eds) => applyEdgeChanges(changes, eds))

  useEffect(() => {
    setNodes([
        { id: '1', type: 'projectNode', position: { x: 250, y: 0 }, data: { label: 'Entry', value: 'API Gateway' } },
        { id: '2', type: 'projectNode', position: { x: 100, y: 150 }, data: { label: 'Logic', value: 'Validation Engine' } },
        { id: '3', type: 'projectNode', position: { x: 400, y: 150 }, data: { label: 'Data', value: 'PostgreSQL Bridge' } },
      ])
    setEdges([
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e1-3', source: '1', target: '3', animated: true },
    ])
  }, [])

  async function handleAIGenerate() {
    if (!description.trim()) return
    setAiStatus('requesting')
    setAiCritique('')
    try {
      const res = await aiIdeaToSyntax(description)
      setCode(res.starterCode)
      if (res.architecture?.nodes) {
          setNodes(res.architecture.nodes)
          setEdges(res.architecture.edges ?? [])
      }
      setAiStatus('ready')
    } catch (error) {
       console.error("AI Generation failed:", error)
       setAiStatus('error')
    }
  }

  async function handleAIReview() {
    setAiStatus('reviewing')
    try {
      const res = await aiReviewLogic(code, `Project: ${selectedBlueprint?.name ?? 'Custom Architecture'}`)
      setAiCritique(res.critique)
      setAiStatus('ready')
    } catch (error) {
       console.error("AI Review failed:", error)
       setAiStatus('error')
    }
  }

  useEffect(() => {
    fetchProjectBlueprints()
      .then(data => {
        setBlueprints(data.items ?? [])
        if (data.items?.length > 0) {
            setSelectedBlueprint(data.items[0])
            setCode(data.items[0].starterCode ?? '# Start implementation...')
        }
        setStatus('ready')
      })
      .catch(() => {
        // Fallback mock
        const mock = [
            { slug: 'drone-swarm', name: 'Drone Swarm Pilot', eyebrow: 'Autonomous Logic', summary: 'Coordinate 500+ logic drones in a unified swarm.', starterCode: 'class SwarmController:\n    def __init__(self):\n        self.nodes = []\n\n    def sync(self):\n        pass' },
            { slug: 'traffic-relay', name: 'Packet Relay Map', eyebrow: 'Network Flow', summary: 'Architect a high-throughput network packet router.', starterCode: 'def route_packet(packet, network):\n    # Logic here\n    return True' }
        ]
        setBlueprints(mock)
        setSelectedBlueprint(mock[0])
        setCode(mock[0].starterCode)
        setStatus('ready')
      })
  }, [])

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="Project implementation and architecture review. Use AI blueprints to architect real-world logic systems."
        accent={realm.accent}
      />

      <section className="world-layout">
        <aside className="glass-panel blueprint-rail">
            <div className="panel-heading">
                <div>
                    <p className="card-tag text-emerald">Blueprint Registry</p>
                    <h3>Project Scaffolds</h3>
                </div>
            </div>
            <div className="lesson-stack">
                {blueprints.map(bp => (
                    <button 
                        key={bp.slug} 
                        className={`lesson-item${selectedBlueprint?.slug === bp.slug ? ' is-active' : ''}`}
                        onClick={() => {
                            setSelectedBlueprint(bp)
                            setCode(bp.starterCode)
                        }}
                    >
                        <strong>{bp.name}</strong>
                        <span>{bp.eyebrow}</span>
                    </button>
                ))}
            </div>
        </aside>

        <div className="world-workspace">
            <article className="glass-panel world-map-panel">
                <div className="panel-heading">
                    <div>
                        <p className="card-tag text-emerald">Architecture Map</p>
                        <h3>System Relays</h3>
                    </div>
                </div>
                    <div style={{ height: '320px', width: '100%', background: 'rgba(5,5,5,0.4)', borderRadius: '18px' }}>
                    <ReactFlow 
                        nodes={nodes} 
                        edges={edges} 
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView 
                        style={{ background: 'transparent' }}
                    >
                        <Background color="#10B981" gap={20} size={1} />
                        <Controls />
                    </ReactFlow>
                </div>
            </article>

            <div className="content-grid dojo-support-grid">
                <article className="glass-panel content-card dojo-editor-card">
                    <div className="panel-heading">
                        <div>
                            <p className="card-tag text-emerald">Project IDE</p>
                            <h3>main.py</h3>
                        </div>
                        <span className="mini-pill">Browser Runtime</span>
                    </div>
                    <div className="editor-surface">
                        <Editor
                            value={code}
                            onValueChange={setCode}
                            highlight={(value) => Prism.highlight(value, Prism.languages.python, 'python')}
                            padding={18}
                            textareaClassName="code-editor-textarea"
                            preClassName="code-editor-pre"
                            className="code-editor"
                        />
                    </div>
                     <div className="transport-row">
                        <button type="button" className="action-button action-button-primary">Save Blueprint</button>
                        <button type="button" className="action-button" onClick={handleAIReview} disabled={aiStatus === 'reviewing'}>
                            {aiStatus === 'reviewing' ? 'Reviewing...' : 'Review Logic'}
                        </button>
                        <button type="button" className="action-button">Export Manifest</button>
                    </div>
                </article>

                <article className="glass-panel content-card">
                    <div className="panel-heading">
                        <div>
                            <p className="card-tag text-cyan">AI Logic Bridge</p>
                            <h3>Critique Panel</h3>
                        </div>
                    </div>
                    <p className="status-copy">
                        Describe your implementation goals below. The AI will provide architecture critiques and generate logic skeletons.
                    </p>
                    <textarea 
                        className="code-surface runtime-surface" 
                        placeholder="e.g. Add a rate-limiter to the API Gateway..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: '100%', background: 'rgba(5,5,5,0.6)', border: '1px solid rgba(255,255,255,0.1)', marginTop: '16px', color: 'white', padding: '12px' }}
                    />
                    <button 
                        type="button" 
                        className="action-button action-button-primary" 
                        onClick={handleAIGenerate}
                        disabled={aiStatus === 'requesting'}
                        style={{ marginTop: '12px', width: '100%' }}
                    >
                        {aiStatus === 'requesting' ? 'Synthesizing...' : 'Trigger Idea-to-Syntax'}
                    </button>

                    {aiCritique && (
                        <div className="glass-panel critique-panel accent-purple" style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                             <div className="panel-heading">
                                <p className="card-tag text-purple">Logic Analysis</p>
                            </div>
                            <div className="markdown-critique">
                                <ReactMarkdown>{aiCritique}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </article>
            </div>
        </div>
      </section>
    </>
  )
}
