import { useEffect, useMemo, useState } from 'react'
import ReactFlow, { Background, Controls, Handle, Position, applyNodeChanges, applyEdgeChanges } from 'reactflow'
import 'reactflow/dist/style.css'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { fetchProjectBlueprints, fetchProjects, createProject, updateProject, exportProject, aiIdeaToSyntax, aiReviewLogic } from '../api'
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
  const [projects, setProjects] = useState([])
  const [selectedBlueprint, setSelectedBlueprint] = useState(null)
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('loading')
  const [description, setDescription] = useState('')
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [aiStatus, setAiStatus] = useState('idle')
  const [aiCritique, setAiCritique] = useState('')
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' })

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
    Promise.all([fetchProjectBlueprints(), fetchProjects()])
      .then(([blueprintsData, projectsData]) => {
        const blueprintItems = blueprintsData.items ?? []
        const projectItems = projectsData.items ?? []

        setBlueprints(blueprintItems)
        setProjects(projectItems)

        if (projectItems.length > 0) {
          const latestProject = projectItems[0]
          setActiveProjectId(latestProject.id)
          setCode(latestProject.files?.['main.py'] ?? '# Start implementation...')
          setNodes(latestProject.architecture?.nodes ?? [])
          setEdges(latestProject.architecture?.edges ?? [])
          setSelectedBlueprint(
            blueprintItems.find((item) => item.slug === latestProject.blueprintSlug) ?? blueprintItems[0] ?? null,
          )
        } else if (blueprintItems.length > 0) {
          setSelectedBlueprint(blueprintItems[0])
          setCode('# Start implementation...')
        }

        setStatus('ready')
      })
      .catch(() => {
        // Fallback mock
        const mock = [
            { slug: 'drone-swarm', name: 'Drone Swarm Pilot', difficulty: 'Intermediate', summary: 'Coordinate 500+ logic drones in a unified swarm.' },
            { slug: 'traffic-relay', name: 'Packet Relay Map', difficulty: 'Advanced', summary: 'Architect a high-throughput network packet router.' }
        ]
        setBlueprints(mock)
        setSelectedBlueprint(mock[0])
        setCode('# Start implementation...')
        setStatus('ready')
      })
  }, [])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  )

  function buildProjectPayload() {
    const title = selectedProject?.title ?? selectedBlueprint?.name ?? 'Untitled Project'

    return {
      title,
      blueprintSlug: selectedBlueprint?.slug ?? null,
      files: { 'main.py': code },
      architecture: { nodes, edges },
    }
  }

  async function handleSaveProject() {
    setSaveState({ status: 'saving', message: '' })

    try {
      const payload = buildProjectPayload()
      const savedProject = activeProjectId
        ? await updateProject(activeProjectId, payload)
        : await createProject(payload)

      setActiveProjectId(savedProject.id)
      setProjects((current) => {
        const next = current.filter((item) => item.id !== savedProject.id)
        return [savedProject, ...next]
      })
      setSaveState({ status: 'saved', message: 'Project saved to guest storage.' })
    } catch (error) {
      setSaveState({ status: 'error', message: error.message })
    }
  }

  async function handleExportProject() {
    if (!activeProjectId) {
      setSaveState({ status: 'error', message: 'Save the project before exporting a manifest.' })
      return
    }

    setSaveState({ status: 'saving', message: '' })

    try {
      const manifest = await exportProject(activeProjectId)
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${manifest.title.toLowerCase().replace(/\s+/g, '-')}-manifest.json`
      link.click()
      URL.revokeObjectURL(url)
      setSaveState({ status: 'saved', message: 'Manifest exported.' })
    } catch (error) {
      setSaveState({ status: 'error', message: error.message })
    }
  }

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
                            setActiveProjectId(null)
                            setCode(selectedProject?.blueprintSlug === bp.slug ? selectedProject.files?.['main.py'] ?? '# Start implementation...' : '# Start implementation...')
                        }}
                    >
                        <strong>{bp.name}</strong>
                        <span>{bp.summary}</span>
                    </button>
                ))}
            </div>

            <div className="panel-heading world-rail-heading">
              <div>
                <p className="card-tag text-cyan">Saved projects</p>
                <h3>Guest workspace</h3>
              </div>
            </div>
            <div className="lesson-stack">
              {projects.length === 0 ? <p className="status-copy">No saved projects yet.</p> : null}
              {projects.map((project) => (
                <button
                  key={project.id}
                  className={`lesson-item${activeProjectId === project.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setActiveProjectId(project.id)
                    setCode(project.files?.['main.py'] ?? '# Start implementation...')
                    setNodes(project.architecture?.nodes ?? [])
                    setEdges(project.architecture?.edges ?? [])
                    setSelectedBlueprint(
                      blueprints.find((item) => item.slug === project.blueprintSlug) ?? selectedBlueprint,
                    )
                  }}
                >
                  <strong>{project.title}</strong>
                  <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
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
                        <button type="button" className="action-button action-button-primary" onClick={handleSaveProject} disabled={saveState.status === 'saving'}>
                          {saveState.status === 'saving' ? 'Saving...' : activeProjectId ? 'Update Project' : 'Save Project'}
                        </button>
                        <button type="button" className="action-button" onClick={handleAIReview} disabled={aiStatus === 'reviewing'}>
                            {aiStatus === 'reviewing' ? 'Reviewing...' : 'Review Logic'}
                        </button>
                        <button type="button" className="action-button" onClick={handleExportProject}>Export Manifest</button>
                     </div>
                     {saveState.message ? <p className="status-copy">{saveState.message}</p> : null}
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

                    <div className="terminal-sync-notice">
                      <p className="group-label">Workspace metadata</p>
                      <ul className="mini-list">
                        <li>Blueprint: {selectedBlueprint?.name ?? 'Custom architecture'}</li>
                        <li>Difficulty: {selectedBlueprint?.difficulty ?? 'Open-ended'}</li>
                        <li>Saved project: {selectedProject?.title ?? 'Not saved yet'}</li>
                      </ul>
                    </div>
                </article>
            </div>
        </div>
      </section>
    </>
  )
}
