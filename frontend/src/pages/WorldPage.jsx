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
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Constants ─── */

const DIFFICULTY_COLORS = {
  Easy: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#34d399' },
  Intermediate: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
  Advanced: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#c084fc' },
}

const DIFFICULTY_ICONS = {
  Easy: '◆',
  Intermediate: '◈',
  Advanced: '◇',
}

const NODE_TYPE_OPTIONS = [
  { label: 'Entry', defaultValue: 'API Gateway' },
  { label: 'Logic', defaultValue: 'Processing Unit' },
  { label: 'Data', defaultValue: 'Data Store' },
  { label: 'Output', defaultValue: 'Response Handler' },
]

const FILE_TABS = [
  { name: 'main.py', editable: true },
  { name: 'config.py', editable: false },
  { name: 'utils.py', editable: false },
]

const AI_TEMPLATE_PROMPTS = [
  'Add rate limiter',
  'Optimize queries',
  'Add caching layer',
  'Add authentication',
]

/* ─── ProjectNode (original) ─── */

const ProjectNode = ({ data }) => (
  <div className="glass-panel project-node-card">
    <Handle type="target" position={Position.Top} />
    <p className="card-tag">{data.label}</p>
    <strong>{data.value}</strong>
    <Handle type="source" position={Position.Bottom} />
  </div>
)

const nodeTypes = { projectNode: ProjectNode }

/* ─── Component ─── */

export default function WorldPage() {
  const realm = realmConfig.world

  /* ── Original state ── */
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

  /* ── New state ── */
  const [activeFileTab, setActiveFileTab] = useState('main.py')
  const [codeUnsaved, setCodeUnsaved] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState(null)
  const [addNodeType, setAddNodeType] = useState('Entry')
  const [showNodeSelector, setShowNodeSelector] = useState(false)
  const [aiHistory, setAiHistory] = useState([]) // stores last 3 interactions
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  /* ── Derived values ── */
  const lineCount = code.split('\n').length
  const charCount = code.length
  const connectionCount = edges.length

  const saveStatusLabel = saveState.status === 'saving'
    ? 'Saving...'
    : codeUnsaved
      ? 'Unsaved changes'
      : lastSavedTime
        ? `Saved ${lastSavedTime}`
        : 'Ready'

  const saveStatusColor = saveState.status === 'saving'
    ? '#fbbf24'
    : codeUnsaved
      ? '#f87171'
      : '#34d399'

  /* ── Original handlers ── */
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
      // Store in history
      setAiHistory((prev) => {
        const entry = { prompt: description, response: res.starterCode ? 'Code generated successfully' : 'No code returned', timestamp: new Date().toLocaleTimeString() }
        return [entry, ...prev].slice(0, 3)
      })
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
      // Store in history
      setAiHistory((prev) => {
        const critiquePreview = res.critique ? `${res.critique.slice(0, 80)}...` : 'Review complete'
        const entry = { prompt: 'Logic Review', response: critiquePreview, timestamp: new Date().toLocaleTimeString() }
        return [entry, ...prev].slice(0, 3)
      })
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
      .catch((error) => {
        setStatus('error')
        setSaveState({ status: 'error', message: error.message })
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
      const now = new Date()
      setLastSavedTime(now.toLocaleTimeString())
      setCodeUnsaved(false)
      setSaveState({ status: 'saved', message: 'Project saved to guest storage.' })
      // Show save confirmation flash
      setShowSaveConfirm(true)
      setTimeout(() => setShowSaveConfirm(false), 2000)
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
      const now = new Date()
      setLastSavedTime(now.toLocaleTimeString())
      setSaveState({ status: 'saved', message: 'Manifest exported.' })
    } catch (error) {
      setSaveState({ status: 'error', message: error.message })
    }
  }

  /* ── New handlers ── */

  function handleCodeChange(value) {
    setCode(value)
    setCodeUnsaved(true)
  }

  function handleAddNode() {
    const opt = NODE_TYPE_OPTIONS.find((o) => o.label === addNodeType) ?? NODE_TYPE_OPTIONS[0]
    const newId = String(nodes.length + 1 + Date.now())
    const xPos = 100 + Math.random() * 300
    const yPos = 50 + Math.random() * 200
    setNodes((prev) => [
      ...prev,
      { id: newId, type: 'projectNode', position: { x: xPos, y: yPos }, data: { label: opt.label, value: opt.defaultValue } },
    ])
    setShowNodeSelector(false)
  }

  function handleResetLayout() {
    setNodes([
      { id: '1', type: 'projectNode', position: { x: 250, y: 0 }, data: { label: 'Entry', value: 'API Gateway' } },
      { id: '2', type: 'projectNode', position: { x: 100, y: 150 }, data: { label: 'Logic', value: 'Validation Engine' } },
      { id: '3', type: 'projectNode', position: { x: 400, y: 150 }, data: { label: 'Data', value: 'PostgreSQL Bridge' } },
    ])
    setEdges([
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e1-3', source: '1', target: '3', animated: true },
    ])
  }

  function handleCopyResponse() {
    if (aiCritique) {
      navigator.clipboard.writeText(aiCritique).catch(() => {})
    }
  }

  function handleFormatCode() {
    // Placeholder: just trim trailing whitespace per line
    setCode((prev) => prev.split('\n').map((line) => line.trimEnd()).join('\n'))
  }

  /* ── Render helpers ── */

  function renderDifficultyBadge(difficulty) {
    const colors = DIFFICULTY_COLORS[difficulty] ?? DIFFICULTY_COLORS.Easy
    const icon = DIFFICULTY_ICONS[difficulty] ?? '◆'
    return (
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
          background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text,
        }}
      >
        {icon} {difficulty}
      </span>
    )
  }

  /* ─────────────────── JSX ─────────────────── */

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="Project implementation and architecture review. Use AI blueprints to architect real-world logic systems."
        accent={realm.accent}
      />

      {/* ── Project Dashboard ── */}
      <motion.section
        className="glass-panel"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          margin: '0 auto 24px', maxWidth: '1400px', padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p className="card-tag text-emerald" style={{ margin: 0 }}>Active Project</p>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            {selectedProject?.title ?? selectedBlueprint?.name ?? 'No project selected'}
          </h3>
          <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
            Blueprint: {selectedBlueprint?.name ?? 'Custom'} &middot; {selectedBlueprint?.difficulty ?? 'Open-ended'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Stats */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#34d399' }}>1</span>
            <p style={{ fontSize: '0.65rem', opacity: 0.5, margin: 0 }}>Files</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#60a5fa' }}>{nodes.length}</span>
            <p style={{ fontSize: '0.65rem', opacity: 0.5, margin: 0 }}>Nodes</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fbbf24' }}>{lastSavedTime ?? '--:--'}</span>
            <p style={{ fontSize: '0.65rem', opacity: 0.5, margin: 0 }}>Last Saved</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{
              display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
              background: codeUnsaved ? '#f87171' : '#34d399', boxShadow: `0 0 6px ${codeUnsaved ? '#f87171' : '#34d399'}`,
            }} />
            <p style={{ fontSize: '0.65rem', opacity: 0.5, margin: 0 }}>Health</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="action-button action-button-primary" onClick={handleSaveProject} disabled={saveState.status === 'saving'} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
            Save
          </button>
          <button type="button" className="action-button" onClick={handleExportProject} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
            Export
          </button>
          <button type="button" className="action-button" onClick={handleAIReview} disabled={aiStatus === 'reviewing'} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
            AI Review
          </button>
          <button type="button" className="action-button" style={{ fontSize: '0.8rem', padding: '6px 14px', opacity: 0.5, cursor: 'not-allowed' }} disabled>
            Share
          </button>
        </div>
      </motion.section>

      {/* ── Save Confirmation Flash ── */}
      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
              background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.5)',
              borderRadius: '12px', padding: '12px 20px', color: '#34d399',
              fontWeight: 600, fontSize: '0.85rem', backdropFilter: 'blur(12px)',
            }}
          >
            Project saved successfully
          </motion.div>
        )}
      </AnimatePresence>

      <section className="world-layout">
        {/* ── Blueprint Rail (Enhanced) ── */}
        <aside className="glass-panel blueprint-rail">
          <div className="panel-heading">
            <div>
              <p className="card-tag text-emerald">Blueprint Registry</p>
              <h3>Project Scaffolds</h3>
              <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{blueprints.length} blueprint{blueprints.length !== 1 ? 's' : ''} available</span>
            </div>
          </div>

          {/* New Project Button */}
          <motion.button
            type="button"
            className="action-button action-button-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setActiveProjectId(null)
              setSelectedBlueprint(null)
              setCode('# New project...\n')
              setNodes([])
              setEdges([])
              setCodeUnsaved(false)
              setAiCritique('')
            }}
            style={{ width: '100%', marginBottom: '12px', fontSize: '0.8rem' }}
          >
            + New Project
          </motion.button>

          <div className="lesson-stack">
            {blueprints.map((bp) => (
              <motion.button
                key={bp.slug}
                className={`lesson-item${selectedBlueprint?.slug === bp.slug ? ' is-active' : ''}`}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.04)' }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  setSelectedBlueprint(bp)
                  setActiveProjectId(null)
                  setCode(selectedProject?.blueprintSlug === bp.slug ? selectedProject.files?.['main.py'] ?? '# Start implementation...' : '# Start implementation...')
                  setCodeUnsaved(false)
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1rem' }}>{DIFFICULTY_ICONS[bp.difficulty] ?? '◆'}</span>
                  <strong>{bp.name}</strong>
                </div>
                <span>{bp.summary}</span>
                <div style={{ marginTop: '6px' }}>
                  {renderDifficultyBadge(bp.difficulty ?? 'Easy')}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="panel-heading world-rail-heading">
            <div>
              <p className="card-tag text-cyan">Saved projects</p>
              <h3>Guest workspace</h3>
              <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="lesson-stack">
            {projects.length === 0 ? <p className="status-copy">No saved projects yet.</p> : null}
            {projects.map((project) => (
              <motion.button
                key={project.id}
                className={`lesson-item${activeProjectId === project.id ? ' is-active' : ''}`}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.04)' }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  setActiveProjectId(project.id)
                  setCode(project.files?.['main.py'] ?? '# Start implementation...')
                  setNodes(project.architecture?.nodes ?? [])
                  setEdges(project.architecture?.edges ?? [])
                  setSelectedBlueprint(
                    blueprints.find((item) => item.slug === project.blueprintSlug) ?? selectedBlueprint,
                  )
                  setCodeUnsaved(false)
                }}
              >
                <strong>{project.title}</strong>
                <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.35 }}>
                  {new Date(project.updatedAt).toLocaleTimeString()}
                </span>
              </motion.button>
            ))}
          </div>
        </aside>

        <div className="world-workspace">
          {/* ── Architecture Map (Enhanced) ── */}
          <article className="glass-panel world-map-panel">
            <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <p className="card-tag text-emerald">Architecture Map</p>
                <h3>System Relays <span style={{ fontSize: '0.75rem', opacity: 0.4, fontWeight: 400 }}>({connectionCount} connection{connectionCount !== 1 ? 's' : ''})</span></h3>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', opacity: 0.35 }}>Scroll to zoom &middot; Drag to pan</span>
                <button type="button" className="action-button" onClick={handleResetLayout} style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
                  Reset Layout
                </button>
                <button
                  type="button"
                  className="action-button action-button-primary"
                  onClick={() => setShowNodeSelector(!showNodeSelector)}
                  style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                >
                  + Add Node
                </button>
              </div>
            </div>

            {/* Node type selector dropdown */}
            <AnimatePresence>
              {showNodeSelector && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginBottom: '8px' }}
                >
                  <div style={{
                    display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 14px',
                    background: 'rgba(5,5,5,0.5)', borderRadius: '10px', flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Node type:</span>
                    {NODE_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setAddNodeType(opt.label)}
                        style={{
                          padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                          border: addNodeType === opt.label ? '1px solid rgba(16,185,129,0.6)' : '1px solid rgba(255,255,255,0.1)',
                          background: addNodeType === opt.label ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                          color: addNodeType === opt.label ? '#34d399' : 'rgba(255,255,255,0.6)',
                          cursor: 'pointer',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="action-button action-button-primary"
                      onClick={handleAddNode}
                      style={{ fontSize: '0.7rem', padding: '4px 14px' }}
                    >
                      Create
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ height: '400px', width: '100%', background: 'rgba(5,5,5,0.4)', borderRadius: '18px' }}>
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
            {/* ── Code Editor (Enhanced) ── */}
            <article className="glass-panel content-card dojo-editor-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-emerald">Project IDE</p>
                  <h3>Code Editor</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Save status indicator */}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem' }}>
                    <span style={{
                      display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%',
                      background: saveStatusColor, boxShadow: `0 0 4px ${saveStatusColor}`,
                    }} />
                    {saveStatusLabel}
                  </span>
                  <span className="mini-pill">Browser Runtime</span>
                </div>
              </div>

              {/* File tab bar */}
              <div style={{
                display: 'flex', gap: '0px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '0', background: 'rgba(5,5,5,0.3)', borderRadius: '10px 10px 0 0',
              }}>
                {FILE_TABS.map((tab) => (
                  <button
                    key={tab.name}
                    type="button"
                    onClick={() => setActiveFileTab(tab.name)}
                    style={{
                      padding: '8px 16px', fontSize: '0.75rem', fontWeight: 600,
                      border: 'none', cursor: tab.editable ? 'pointer' : 'default',
                      background: activeFileTab === tab.name ? 'rgba(16,185,129,0.1)' : 'transparent',
                      borderBottom: activeFileTab === tab.name ? '2px solid #34d399' : '2px solid transparent',
                      color: activeFileTab === tab.name ? '#34d399' : 'rgba(255,255,255,0.4)',
                      opacity: tab.editable ? 1 : 0.5,
                    }}
                  >
                    {tab.name}
                    {!tab.editable && <span style={{ fontSize: '0.6rem', marginLeft: '4px', opacity: 0.5 }}>(locked)</span>}
                  </button>
                ))}
              </div>

              {/* Editor */}
              <div className="editor-surface">
                {activeFileTab === 'main.py' ? (
                  <Editor
                    value={code}
                    onValueChange={handleCodeChange}
                    highlight={(value) => Prism.highlight(value, Prism.languages.python, 'python')}
                    padding={18}
                    textareaClassName="code-editor-textarea"
                    preClassName="code-editor-pre"
                    className="code-editor"
                  />
                ) : (
                  <div style={{ padding: '18px', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    {activeFileTab === 'config.py'
                      ? '# config.py - Configuration values (read-only placeholder)'
                      : '# utils.py - Utility functions (read-only placeholder)'}
                  </div>
                )}
              </div>

              {/* Editor footer stats */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 14px', borderTop: '1px solid rgba(255,255,255,0.04)',
                fontSize: '0.65rem', opacity: 0.4,
              }}>
                <span>{lineCount} line{lineCount !== 1 ? 's' : ''} &middot; {charCount} chars</span>
                <button
                  type="button"
                  onClick={handleFormatCode}
                  style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: '4px',
                    fontSize: '0.65rem', cursor: 'pointer',
                  }}
                >
                  Format Code
                </button>
              </div>

              {/* Action buttons */}
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
              {lastSavedTime && (
                <p style={{ fontSize: '0.65rem', opacity: 0.3, margin: '4px 0 0', padding: '0 4px' }}>
                  Last saved at {lastSavedTime}
                </p>
              )}
            </article>

            {/* ── AI Logic Bridge (Enhanced) ── */}
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

              {/* Template prompt chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' }}>
                {AI_TEMPLATE_PROMPTS.map((prompt) => (
                  <motion.button
                    key={prompt}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDescription(prompt)}
                    style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 500,
                      border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.08)',
                      color: '#93c5fd', cursor: 'pointer',
                    }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>

              <textarea
                className="code-surface runtime-surface"
                placeholder="e.g. Add a rate-limiter to the API Gateway..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', background: 'rgba(5,5,5,0.6)', border: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', color: 'white', padding: '12px', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }}
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

              {/* Loading animation */}
              <AnimatePresence>
                {(aiStatus === 'requesting' || aiStatus === 'reviewing') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '8px', padding: '16px 0',
                    }}
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        display: 'inline-block', width: '16px', height: '16px',
                        border: '2px solid rgba(96,165,250,0.3)', borderTop: '2px solid #60a5fa',
                        borderRadius: '50%',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#93c5fd' }}>
                      {aiStatus === 'requesting' ? 'Generating code...' : 'Reviewing logic...'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Response Card */}
              <AnimatePresence>
                {aiCritique && (
                  <motion.div
                    className="glass-panel critique-panel accent-purple"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}
                  >
                    <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="card-tag text-purple">Logic Analysis</p>
                      <button
                        type="button"
                        onClick={handleCopyResponse}
                        style={{
                          padding: '3px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600,
                          border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.1)',
                          color: '#c084fc', cursor: 'pointer',
                        }}
                      >
                        Copy Response
                      </button>
                    </div>
                    <div className="markdown-critique">
                      <ReactMarkdown>{aiCritique}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI History */}
              {aiHistory.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p className="group-label" style={{ marginBottom: '6px' }}>Recent AI Interactions</p>
                  {aiHistory.map((entry, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 10px', marginBottom: '4px',
                        background: 'rgba(255,255,255,0.02)', borderRadius: '6px',
                        borderLeft: '2px solid rgba(96,165,250,0.3)',
                        fontSize: '0.7rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ color: '#93c5fd', fontWeight: 600 }}>{entry.prompt}</span>
                        <span style={{ opacity: 0.3 }}>{entry.timestamp}</span>
                      </div>
                      <span style={{ opacity: 0.5 }}>{entry.response}</span>
                    </div>
                  ))}
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
