import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import ReactMarkdown from 'react-markdown'
import { fetchLessons, aiReviewLogic } from '../api'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { getPyodide, runPythonCode } from '../runtime/pyodide'

const starterCodeByLesson = {
  'memory-boxes': 'score = 7\nscore = score + 3\nprint(score)',
  'loop-mastery': 'total = 0\nfor step in range(1, 5):\n    total += step\nprint(total)',
  'pointer-drones': 'items = ["amber", "cyan", "purple"]\nfocus = items\nfocus.append("emerald")\nprint(items)',
}

const dojoStorageKey = 'algoquest-dojo-state'

function groupLessonsByTier(items) {
  return items.reduce((groups, lesson) => {
    if (!groups[lesson.tier]) {
      groups[lesson.tier] = []
    }

    groups[lesson.tier].push(lesson)
    return groups
  }, {})
}

function buildStageModel(selectedLesson, code) {
  if (!selectedLesson) {
    return { primaryLabel: 'variable', primaryValue: 'pending', secondaryLabel: 'next visual', secondaryValue: 'pointer drone' }
  }

  if (selectedLesson.slug === 'memory-boxes') {
    const match = code.match(/score\s*=\s*score\s*\+\s*(\d+)/)
    const increment = match ? Number(match[1]) : 3
    return {
      primaryLabel: 'memory box',
      primaryValue: `score +${increment}`,
      secondaryLabel: 'resulting state',
      secondaryValue: 'updated integer',
    }
  }

  if (selectedLesson.slug === 'loop-mastery') {
    const stepsMatch = code.match(/range\((\d+),\s*(\d+)\)/)
    const stepCount = stepsMatch ? Number(stepsMatch[2]) - Number(stepsMatch[1]) : 4
    return {
      primaryLabel: 'loop track',
      primaryValue: `${stepCount} passes`,
      secondaryLabel: 'pointer drone',
      secondaryValue: 'counter advancing',
    }
  }

  return {
    primaryLabel: 'reference graph',
    primaryValue: 'shared list',
    secondaryLabel: 'pointer drone',
    secondaryValue: 'alias update',
  }
}

export default function DojoPage() {
  const realm = realmConfig.dojo
  const [state, setState] = useState({ status: 'loading', items: [], message: '' })
  const [selectedLessonSlug, setSelectedLessonSlug] = useState('')
  const [codeByLesson, setCodeByLesson] = useState({})
  const [runtimeState, setRuntimeState] = useState({ status: 'idle', stdout: '', stderr: '', message: '' })
  const [progressState, setProgressState] = useState({ completedLessons: [], lastLessonSlug: '' })
  const [aiState, setAiState] = useState({ status: 'idle', critique: '', score: 0 })

  useEffect(() => {
    let cancelled = false

    fetchLessons()
      .then((data) => {
        if (cancelled) {
          return
        }

        const items = data.items ?? []
        setState({ status: 'ready', items, message: '' })

        if (items.length > 0) {
          setSelectedLessonSlug((current) => current || items[0].slug)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', items: [], message: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(dojoStorageKey)

      if (!raw) {
        return
      }

      const stored = JSON.parse(raw)
      setSelectedLessonSlug(stored.selectedLessonSlug ?? '')
      setCodeByLesson(stored.codeByLesson ?? {})
      setProgressState({
        completedLessons: stored.completedLessons ?? [],
        lastLessonSlug: stored.lastLessonSlug ?? '',
      })
    } catch {
      // Ignore corrupted local guest state and keep defaults.
    }
  }, [])

  const groupedLessons = useMemo(() => groupLessonsByTier(state.items), [state.items])
  const selectedLesson = state.items.find((lesson) => lesson.slug === selectedLessonSlug) ?? state.items[0]
  const starterCode = selectedLesson ? starterCodeByLesson[selectedLesson.slug] ?? '# Lesson code scaffold' : ''
  const activeCode = selectedLesson ? codeByLesson[selectedLesson.slug] ?? starterCode : ''
  const stageModel = useMemo(() => buildStageModel(selectedLesson, activeCode), [selectedLesson, activeCode])

  useEffect(() => {
    if (!selectedLesson) {
      return
    }

    setCodeByLesson((current) => {
      if (current[selectedLesson.slug]) {
        return current
      }

      return { ...current, [selectedLesson.slug]: starterCodeByLesson[selectedLesson.slug] ?? '# Lesson code scaffold' }
    })
  }, [selectedLesson])

  useEffect(() => {
    localStorage.setItem(
      dojoStorageKey,
      JSON.stringify({
        selectedLessonSlug,
        codeByLesson,
        completedLessons: progressState.completedLessons,
        lastLessonSlug: progressState.lastLessonSlug,
      }),
    )
  }, [selectedLessonSlug, codeByLesson, progressState])

  useEffect(() => {
    let cancelled = false

    setRuntimeState((current) =>
      current.status === 'ready' || current.status === 'running' ? current : { ...current, status: 'booting', message: '' },
    )

    getPyodide()
      .then(() => {
        if (!cancelled) {
          setRuntimeState((current) => ({ ...current, status: 'ready', message: '' }))
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setRuntimeState({ status: 'error', stdout: '', stderr: '', message: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleRunCode() {
    setRuntimeState((current) => ({ ...current, status: 'running', stdout: '', stderr: '', message: '' }))

    try {
      const result = await runPythonCode(activeCode)
      const isSuccess = result.status === 'ok' && !result.stderr

      if (selectedLesson && isSuccess) {
        setProgressState((current) => ({
          completedLessons: current.completedLessons.includes(selectedLesson.slug)
            ? current.completedLessons
            : [...current.completedLessons, selectedLesson.slug],
          lastLessonSlug: selectedLesson.slug,
        }))
      }

      setRuntimeState({
        status: result.status === 'ok' ? 'ready' : 'error',
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        message: '',
      })
    } catch (error) {
      setRuntimeState({ status: 'error', stdout: '', stderr: '', message: error.message })
    }
  }

  async function handleAIReview() {
    if (!selectedLesson) return
    setAiState({ status: 'requesting', critique: '', score: 0 })
    try {
      const res = await aiReviewLogic(activeCode, `Lesson: ${selectedLesson.title}`)
      setAiState({ status: 'ready', critique: res.critique, score: res.logicScore })
    } catch (error) {
      setAiState({ status: 'error', critique: `AI Review failed: ${error.message}`, score: 0 })
    }
  }

  function handleResetCode() {
    if (!selectedLesson) {
      return
    }

    setCodeByLesson((current) => ({
      ...current,
      [selectedLesson.slug]: starterCodeByLesson[selectedLesson.slug] ?? '# Lesson code scaffold',
    }))
    setRuntimeState((current) => ({ ...current, stdout: '', stderr: '', message: '' }))
  }

  const completedSet = new Set(progressState.completedLessons)

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="The Dojo now has a live lesson rail and a workspace shell ready for the editor, Pyodide runtime, and learning visuals."
        accent={realm.accent}
      />

      <section className="dojo-layout">
        <aside className="glass-panel lesson-rail">
          <div className="panel-heading">
            <div>
              <p className="card-tag">Path to Black Belt</p>
              <h3>Lesson Rail</h3>
            </div>
            <span className="mini-pill">Live API</span>
          </div>

          {state.status === 'loading' ? <p className="status-copy">Loading lessons...</p> : null}

          {state.status === 'error' ? (
            <div className="inline-error">
              <p className="status-label">Unable to load lessons.</p>
              <p className="status-copy">{state.message}</p>
            </div>
          ) : null}

            {state.status === 'ready'
              ? Object.entries(groupedLessons).map(([tier, lessons]) => (
                  <section key={tier} className="lesson-group">
                  <p className="group-label">{tier}</p>
                  <div className="lesson-stack">
                    {lessons.map((lesson) => {
                      const isActive = selectedLesson?.slug === lesson.slug
                      const isCompleted = completedSet.has(lesson.slug)

                      return (
                        <button
                          key={lesson.slug}
                          type="button"
                          className={`lesson-item${isActive ? ' is-active' : ''}`}
                          onClick={() => setSelectedLessonSlug(lesson.slug)}
                        >
                          <strong>
                            {lesson.title}
                            {isCompleted ? <span className="lesson-complete-pill">Done</span> : null}
                          </strong>
                          <span>{lesson.summary}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))
            : null}
        </aside>

        <div className="dojo-workspace">
          <section className="glass-panel dojo-stage">
            <div className="panel-heading">
              <div>
                <p className="card-tag text-amber">The Stage</p>
                <h3>{selectedLesson?.title ?? 'Choose a lesson'}</h3>
              </div>
              <span className="mini-pill">Memory Visuals</span>
            </div>
            <p className="status-copy">
              {selectedLesson?.summary ?? 'Pick a lesson from the rail to populate the stage.'}
            </p>

            <div className="stage-preview" aria-hidden="true">
              <div className="memory-box">
                <small>{stageModel.primaryLabel}</small>
                <strong>{stageModel.primaryValue}</strong>
              </div>
              <div className="pointer-line" />
              <div className="memory-box ghost-box">
                <small>{stageModel.secondaryLabel}</small>
                <strong>{stageModel.secondaryValue}</strong>
              </div>
            </div>

              <div className="dojo-stage-notes">
                <span className="mini-pill">{selectedLesson?.tier ?? 'Lesson'}</span>
                <span className="mini-pill">Visual-first metaphor</span>
                {progressState.lastLessonSlug ? <span className="mini-pill">Last run: {progressState.lastLessonSlug}</span> : null}
              </div>
            </section>

          <section className="content-grid dojo-support-grid">
            <article className="glass-panel content-card dojo-editor-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-amber">Integrated IDE</p>
                  <h3>Editor Workspace</h3>
                </div>
                <span className="mini-pill">{runtimeState.status}</span>
              </div>

              <div className="transport-row">
                <button
                  type="button"
                  className="action-button action-button-primary"
                  onClick={handleRunCode}
                  disabled={runtimeState.status === 'booting' || runtimeState.status === 'running' || !selectedLesson}
                >
                  {runtimeState.status === 'running' ? 'Running...' : 'Run Lesson'}
                </button>
                <button type="button" className="action-button" onClick={handleResetCode} disabled={!selectedLesson}>
                  Reset Snippet
                </button>
              </div>

              <div className="editor-surface">
                <Editor
                  value={activeCode}
                  onValueChange={(value) =>
                    selectedLesson &&
                    setCodeByLesson((current) => ({
                      ...current,
                      [selectedLesson.slug]: value,
                    }))
                  }
                  highlight={(value) => Prism.highlight(value, Prism.languages.python, 'python')}
                  padding={18}
                  textareaClassName="code-editor-textarea"
                  preClassName="code-editor-pre"
                  className="code-editor"
                />
              </div>

              <section className="runtime-card">
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-cyan">Logic Engine</p>
                    <h3>Runtime Output</h3>
                  </div>
                  <span className="mini-pill">Pyodide</span>
                </div>
                <p className="status-copy runtime-message">
                  {runtimeState.status === 'booting'
                    ? 'Installing Logic Engine in the browser...'
                    : runtimeState.message || 'Run the current lesson snippet to inspect output and trace errors.'}
                </p>
                <div className="runtime-grid">
                  <div>
                    <p className="group-label">stdout</p>
                    <pre className="code-surface runtime-surface"><code>{runtimeState.stdout || '# no output yet'}</code></pre>
                  </div>
                  <div>
                    <p className="group-label">stderr</p>
                    <pre className="code-surface runtime-surface runtime-error"><code>{runtimeState.stderr || '# no errors'}</code></pre>
                  </div>
                </div>
              </section>

              {aiState.status !== 'idle' && (
                <section className="glass-panel critique-panel accent-purple" style={{ marginTop: '24px' }}>
                  <div className="panel-heading">
                    <div>
                      <p className="card-tag text-purple">AI Logic Critique</p>
                      <h3>Sensei Response</h3>
                    </div>
                    {aiState.score > 0 && <span className="mini-pill">{aiState.score}/100</span>}
                  </div>
                  <div className="status-copy markdown-critique">
                    {aiState.status === 'requesting' ? (
                      <p>Sensei is analyzing your logic rituals...</p>
                    ) : (
                      <ReactMarkdown>{aiState.critique}</ReactMarkdown>
                    )}
                  </div>
                </section>
              )}
            </article>

            <article className="glass-panel content-card dojo-side-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-cyan">Sensei Assistance</p>
                  <h3>Dojo Critique</h3>
                </div>
              </div>
              <p className="status-copy">
                Request an instant logical critique of your current implementation.
              </p>
              <button 
                type="button" 
                className="action-button action-button-primary"
                onClick={handleAIReview}
                disabled={aiState.status === 'requesting' || !selectedLesson}
                style={{ width: '100%', marginBottom: '20px' }}
              >
                {aiState.status === 'requesting' ? 'Analyzing...' : 'Trigger Review Logic'}
              </button>

              <div className="panel-heading">
                <div>
                  <p className="card-tag text-cyan">Weekly Gate</p>
                  <h3>Assessment Hook</h3>
                </div>
                <span className="mini-pill">Upcoming</span>
              </div>
              <p>
                Reserve this card for the Sunday gate flow and adaptive lesson reprioritization.
              </p>
              {selectedLesson && completedSet.has(selectedLesson.slug) ? (
                <NavLink to="/laboratory" className="inline-link">
                  Transfer this lesson into the Laboratory
                </NavLink>
              ) : (
                <p className="status-copy">Complete the active lesson run to unlock the Laboratory handoff.</p>
              )}
            </article>
          </section>
        </div>
      </section>
    </>
  )
}
