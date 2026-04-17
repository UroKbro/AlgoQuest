import { useEffect, useMemo, useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import ReactMarkdown from 'react-markdown'
import { fetchLessons, aiReviewLogic, fetchLessonProgressList, updateLessonProgress } from '../api'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import { getPyodide, runPythonCode } from '../runtime/pyodide'
import { motion, AnimatePresence } from 'framer-motion'

const starterCodeByLesson = {
  'memory-boxes': '# Create a score variable and assign it 7\nscore = 7\n\n# Add 3 to the current score\nscore = score + 3\n\n# Print the final score\nprint(score)',
  'loop-mastery': '# Initialize total to 0\ntotal = 0\n\n# Loop from 1 to 4\nfor step in range(1, 5):\n    # Add the current step to the total\n    total += step\n\n# Print the final total\nprint(total)',
  'pointer-drones': '# Create a list of items\nitems = ["amber", "cyan", "purple"]\n\n# Create a pointer to the items list\nfocus = items\n\n# Append a new item using the pointer\nfocus.append("emerald")\n\n# Print the original list\nprint(items)',
  'function-foundations': '# Define a function to calculate the area of a rectangle\ndef calculate_area(length, width):\n    return length * width\n\n# Call the function and print the result\narea = calculate_area(5, 3)\nprint(area)',
  'dictionary-dives': '# Create a dictionary of student grades\ngrades = {"Alice": 85, "Bob": 92, "Charlie": 78}\n\n# Print Bob grade\nprint(grades["Bob"])\n\n# Add a new student\ngrades["David"] = 95\nprint(grades)',
  'recursion-basics': '# Define a recursive function to calculate factorial\ndef factorial(n):\n    # Base case\n    if n == 0:\n        return 1\n    # Recursive step\n    else:\n        return n * factorial(n - 1)\n\n# Calculate the factorial of 5\nresult = factorial(5)\nprint(result)',
  'list-comprehensions': '# Create a list of squares for numbers 1 to 5\nsquares = [x * x for x in range(1, 6)]\nprint(squares)',
  'error-handling': '# Try to divide by zero\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")\n',
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

  if (selectedLesson.slug === 'pointer-drones') {
    return {
      primaryLabel: 'reference graph',
      primaryValue: 'shared list',
      secondaryLabel: 'pointer drone',
      secondaryValue: 'alias update',
    }
  }

  if (selectedLesson.slug === 'function-foundations') {
    return {
      primaryLabel: 'call stack',
      primaryValue: 'function scope',
      secondaryLabel: 'return value',
      secondaryValue: 'calculated result',
    }
  }

  if (selectedLesson.slug === 'dictionary-dives') {
    return {
      primaryLabel: 'hash map',
      primaryValue: 'O(1) lookup',
      secondaryLabel: 'key-value',
      secondaryValue: 'data pair',
    }
  }

  if (selectedLesson.slug === 'recursion-basics') {
    return {
      primaryLabel: 'call stack',
      primaryValue: 'nested calls',
      secondaryLabel: 'base case',
      secondaryValue: 'exit condition',
    }
  }

  if (selectedLesson.slug === 'list-comprehensions') {
    return {
      primaryLabel: 'inline loop',
      primaryValue: 'list generation',
      secondaryLabel: 'output',
      secondaryValue: 'new list',
    }
  }

  if (selectedLesson.slug === 'error-handling') {
    return {
      primaryLabel: 'try block',
      primaryValue: 'risky logic',
      secondaryLabel: 'except block',
      secondaryValue: 'fallback logic',
    }
  }

  return {
    primaryLabel: 'variable',
    primaryValue: 'pending',
    secondaryLabel: 'next visual',
    secondaryValue: 'pointer drone'
  }
}

export default function DojoPage({ onNotify }) {
  const realm = realmConfig.dojo
  const [state, setState] = useState({ status: 'loading', items: [], message: '' })
  const [selectedLessonSlug, setSelectedLessonSlug] = useState('')
  const [codeByLesson, setCodeByLesson] = useState({})
  const [runtimeState, setRuntimeState] = useState({ status: 'idle', stdout: '', stderr: '', message: '' })
  const [progressState, setProgressState] = useState({ completedLessons: [], lastLessonSlug: '' })
  const [aiState, setAiState] = useState({ status: 'idle', critique: '', score: 0 })
  const [quizState, setQuizState] = useState({ status: 'hidden', selectedAnswer: null, isCorrect: null })
  const [executionStats, setExecutionStats] = useState({ runs: 0, lastExecutionTime: 0, totalRuns: 0 })
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchLessons()
      .then((data) => {
        if (cancelled) return
        const items = data.items ?? []
        setState({ status: 'ready', items, message: '' })
        if (items.length > 0) {
          setSelectedLessonSlug((current) => current || items[0].slug)
        }
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', items: [], message: error.message })
      })

    // Fetch user progress
    fetchLessonProgressList('guest')
      .then(data => {
        if (cancelled) return
        const progressItems = data.items ?? []
        const completed = progressItems.filter(p => p.status === 'completed').map(p => p.lessonSlug)
        const snapshots = progressItems.reduce((acc, p) => {
          if (p.lastCodeSnapshot) acc[p.lessonSlug] = p.lastCodeSnapshot
          return acc
        }, {})

        setProgressState(current => ({
          ...current,
          completedLessons: completed
        }))
        setCodeByLesson(current => ({ ...current, ...snapshots }))
      })
      .catch(err => console.warn("Failed to fetch backend progress", err))

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

    setQuizState({ status: 'hidden', selectedAnswer: null, isCorrect: null })
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

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(activeCode).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    })
  }, [activeCode])

  async function handleRunCode() {
    setRuntimeState((current) => ({ ...current, status: 'running', stdout: '', stderr: '', message: '' }))
    const startTime = performance.now()

    try {
      const result = await runPythonCode(activeCode)
      const elapsed = Math.round(performance.now() - startTime)
      setExecutionStats(prev => ({ runs: prev.runs + 1, lastExecutionTime: elapsed, totalRuns: prev.totalRuns + 1 }))
      const isSuccess = result.status === 'ok' && !result.stderr

      if (selectedLesson && isSuccess) {
        const isNewCompletion = !progressState.completedLessons.includes(selectedLesson.slug)
        
        setProgressState((current) => ({
          completedLessons: isNewCompletion
            ? [...current.completedLessons, selectedLesson.slug]
            : current.completedLessons,
          lastLessonSlug: selectedLesson.slug,
        }))

        // Show quiz if lesson is successful and has a quiz
        if (selectedLesson.quiz) {
          setQuizState(prev => ({ ...prev, status: 'visible' }))
        }

        // Sync to backend
        updateLessonProgress(selectedLesson.slug, {
          status: 'completed',
          attempts: 1, // Simple increment or fixed 1 for now
          lastCodeSnapshot: activeCode
        }, 'guest').catch(err => console.error("Failed to sync progress to backend", err))
      }

      if (result.status === 'ok' && !result.stderr) {
         onNotify?.('Logic Success', 'Code executed and verified.', 'success')
      } else if (result.stderr) {
         onNotify?.('Logic Breach', 'Syntax error or runtime exception detected.', 'error')
      }

      setRuntimeState({
        status: result.status === 'ok' ? 'ready' : 'error',
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        message: '',
      })
    } catch (error) {
       onNotify?.('Engine Failure', error.message, 'error')
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

    setQuizState({ status: 'hidden', selectedAnswer: null, isCorrect: null })
    setCodeByLesson((current) => ({
      ...current,
      [selectedLesson.slug]: starterCodeByLesson[selectedLesson.slug] ?? '# Lesson code scaffold',
    }))
    setRuntimeState((current) => ({ ...current, stdout: '', stderr: '', message: '' }))
  }

  function handleQuizSubmit(answer) {
    if (!selectedLesson || !selectedLesson.quiz) return
    const correct = answer === selectedLesson.quiz.answer
    setQuizState({ status: 'visible', selectedAnswer: answer, isCorrect: correct })
    if (correct) {
      onNotify?.('Knowledge Verified', 'Quiz completed successfully.', 'success')
    } else {
      onNotify?.('Try Again', 'That is not the correct answer.', 'error')
    }
  }

  const completedSet = new Set(progressState.completedLessons)

  const totalLessons = state.items.length
  const completedCount = progressState.completedLessons.length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="Master CS fundamentals and Python logic in a structured arena. Practice, run, review, and level up."
        accent={realm.accent}
      />

      {/* Quick Stats Bar */}
      <motion.section 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="dojo-stats-bar"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}
      >
        <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📚</div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--amber)' }}>{completedCount}/{totalLessons}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,242,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>▶</div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code Runs</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--cyan)' }}>{executionStats.totalRuns}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚡</div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Run</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--purple)' }}>{executionStats.lastExecutionTime}ms</div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🎯</div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--emerald)' }}>{progressPercent}%</div>
          </div>
        </div>
      </motion.section>

      <section className="dojo-layout">
        <aside className="glass-panel lesson-rail">
          <div className="panel-heading">
            <div>
              <p className="card-tag text-amber">Path to Black Belt</p>
              <h3>Lesson Rail</h3>
            </div>
            <span className="mini-pill">{completedCount}/{totalLessons}</span>
          </div>

          {/* Progress Bar */}
          <div style={{ margin: '0 0 16px', padding: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '6px' }}>
              <span>Mastery Progress</span>
              <span style={{ color: 'var(--amber)', fontWeight: '600' }}>{progressPercent}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--amber), #f59e0b)', borderRadius: '3px' }}
              />
            </div>
          </div>

          {state.status === 'loading' ? <p className="status-copy">Loading lessons...</p> : null}

          {state.status === 'error' ? (
            <div className="inline-error">
              <p className="status-label">Unable to load lessons.</p>
              <p className="status-copy">{state.message}</p>
            </div>
          ) : null}

            {state.status === 'ready'
              ? Object.entries(groupedLessons).map(([tier, lessons]) => {
                  const tierCompleted = lessons.filter(l => completedSet.has(l.slug)).length
                  return (
                    <section key={tier} className="lesson-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="group-label">{tier}</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{tierCompleted}/{lessons.length}</span>
                    </div>
                    <div className="lesson-stack">
                      {lessons.map((lesson) => {
                        const isActive = selectedLesson?.slug === lesson.slug
                        const isCompleted = completedSet.has(lesson.slug)

                        return (
                          <motion.button
                            key={lesson.slug}
                            type="button"
                            className={`lesson-item${isActive ? ' is-active' : ''}`}
                            onClick={() => setSelectedLessonSlug(lesson.slug)}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ 
                                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                                background: isCompleted ? 'var(--emerald)' : isActive ? 'var(--amber)' : 'rgba(255,255,255,0.2)'
                              }} />
                              <strong style={{ flex: 1 }}>
                                {lesson.title}
                                {isCompleted ? <span className="lesson-complete-pill">Done</span> : null}
                              </strong>
                            </div>
                            <span>{lesson.summary}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </section>
                  )
                })
            : null}
        </aside>

        <div className="dojo-workspace">
          <motion.section 
            className="glass-panel dojo-stage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="panel-heading">
              <div>
                <p className="card-tag text-amber">The Stage</p>
                <h3>{selectedLesson?.title ?? 'Choose a lesson'}</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="mini-pill" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--amber)' }}>{selectedLesson?.tier ?? 'Lesson'}</span>
                <span className="mini-pill">Memory Visuals</span>
              </div>
            </div>
            <p className="status-copy">
              {selectedLesson?.summary ?? 'Pick a lesson from the rail to populate the stage.'}
            </p>

            <div className="stage-preview" aria-hidden="true" style={{ position: 'relative' }}>
              <motion.div 
                className="memory-box"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <small>{stageModel.primaryLabel}</small>
                <strong>{stageModel.primaryValue}</strong>
              </motion.div>
              <div className="pointer-line" />
              <motion.div 
                className="memory-box ghost-box"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <small>{stageModel.secondaryLabel}</small>
                <strong>{stageModel.secondaryValue}</strong>
              </motion.div>
            </div>

              <div className="dojo-stage-notes" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
                {selectedLesson && completedSet.has(selectedLesson.slug) && (
                  <span className="mini-pill" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--emerald)' }}>Completed</span>
                )}
                <span className="mini-pill">Visual-first metaphor</span>
                {progressState.lastLessonSlug ? <span className="mini-pill">Last run: {progressState.lastLessonSlug}</span> : null}
                {executionStats.lastExecutionTime > 0 && <span className="mini-pill">{executionStats.lastExecutionTime}ms</span>}
              </div>
            </motion.section>

          <section className="content-grid dojo-support-grid">
            {selectedLesson?.content && (
              <article className="glass-panel content-card dojo-explanation-card" style={{ gridColumn: '1 / -1' }}>
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-cyan">Concept</p>
                    <h3>Explanation</h3>
                  </div>
                </div>
                <p className="status-copy markdown-critique" style={{marginTop: '1rem'}}>
                  {selectedLesson.content}
                </p>
              </article>
            )}
            
            <article className="glass-panel content-card dojo-editor-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-amber">Integrated IDE</p>
                  <h3>Editor Workspace</h3>
                </div>
                <span className="mini-pill">{runtimeState.status}</span>
              </div>

              <div className="transport-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className="action-button action-button-primary"
                  onClick={handleRunCode}
                  disabled={runtimeState.status === 'booting' || runtimeState.status === 'running' || !selectedLesson}
                >
                  {runtimeState.status === 'running' ? '⏳ Running...' : '▶ Run Lesson'}
                </button>
                <button type="button" className="action-button" onClick={handleResetCode} disabled={!selectedLesson}>
                  ↺ Reset
                </button>
                <button type="button" className="action-button" onClick={handleCopyCode} disabled={!selectedLesson}>
                  {copiedCode ? '✓ Copied' : '⎘ Copy'}
                </button>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {activeCode.split('\n').length} lines · {activeCode.length} chars
                </span>
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
                  style={{ minHeight: '250px', backgroundColor: 'rgba(5, 5, 5, 0.56)', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                />
              </div>

              <section className="runtime-card">
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-cyan">Logic Engine</p>
                    <h3>Runtime Output</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {executionStats.lastExecutionTime > 0 && (
                      <span className="mini-pill" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--emerald)' }}>
                        {executionStats.lastExecutionTime}ms
                      </span>
                    )}
                    <span className="mini-pill" style={{ 
                      background: runtimeState.status === 'ready' ? 'rgba(16,185,129,0.15)' : 
                                  runtimeState.status === 'error' ? 'rgba(239,68,68,0.15)' :
                                  runtimeState.status === 'running' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                      color: runtimeState.status === 'ready' ? 'var(--emerald)' :
                             runtimeState.status === 'error' ? '#ef4444' :
                             runtimeState.status === 'running' ? 'var(--amber)' : 'var(--muted)'
                    }}>
                      {runtimeState.status === 'ready' ? '● Online' : 
                       runtimeState.status === 'booting' ? '◌ Booting' :
                       runtimeState.status === 'running' ? '◉ Running' :
                       runtimeState.status === 'error' ? '● Error' : '○ Idle'}
                    </span>
                  </div>
                </div>
                <p className="status-copy runtime-message">
                  {runtimeState.status === 'booting'
                    ? 'Installing Logic Engine in the browser...'
                    : runtimeState.message || 'Run the current lesson snippet to inspect output and trace errors.'}
                </p>
                <div className="runtime-grid">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="group-label">stdout</p>
                      {runtimeState.stdout && (
                        <button onClick={() => setRuntimeState(c => ({ ...c, stdout: '' }))} 
                          style={{ fontSize: '0.7rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Clear
                        </button>
                      )}
                    </div>
                    <pre className="code-surface runtime-surface"><code>{runtimeState.stdout || '# no output yet'}</code></pre>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="group-label">stderr</p>
                      {runtimeState.stderr && (
                        <button onClick={() => setRuntimeState(c => ({ ...c, stderr: '' }))} 
                          style={{ fontSize: '0.7rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Clear
                        </button>
                      )}
                    </div>
                    <pre className="code-surface runtime-surface runtime-error"><code>{runtimeState.stderr || '# no errors'}</code></pre>
                  </div>
                </div>
              </section>

              <AnimatePresence>
                {quizState.status === 'visible' && selectedLesson?.quiz && (
                  <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-panel critique-panel accent-emerald" 
                    style={{ marginTop: '24px' }}
                  >
                    <div className="panel-heading">
                      <div>
                        <p className="card-tag text-emerald">Knowledge Check</p>
                        <h3>Lesson Quiz</h3>
                      </div>
                      <AnimatePresence>
                        {quizState.isCorrect !== null && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mini-pill"
                            style={{ 
                              background: quizState.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                              color: quizState.isCorrect ? 'var(--emerald)' : '#ef4444'
                            }}
                          >
                            {quizState.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="status-copy" style={{ marginBottom: '16px' }}>
                      <strong>{selectedLesson.quiz.question}</strong>
                    </div>
                    <div className="transport-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedLesson.quiz.options.map((option, idx) => {
                        const isSelected = quizState.selectedAnswer === option
                        const isCorrectAnswer = option === selectedLesson.quiz.answer
                        let btnStyle = {}
                        if (quizState.selectedAnswer !== null) {
                          if (isCorrectAnswer) {
                            btnStyle = { background: 'rgba(16,185,129,0.2)', borderColor: 'var(--emerald)', color: 'var(--emerald)' }
                          } else if (isSelected && !quizState.isCorrect) {
                            btnStyle = { background: 'rgba(239,68,68,0.2)', borderColor: '#ef4444', color: '#ef4444' }
                          }
                        }
                        return (
                          <motion.button
                            key={idx}
                            type="button"
                            className="action-button"
                            onClick={() => handleQuizSubmit(option)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ margin: 0, flex: '1 1 calc(50% - 8px)', transition: 'all 0.2s ease', ...btnStyle }}
                            disabled={quizState.selectedAnswer !== null}
                          >
                            {option}
                          </motion.button>
                        )
                      })}
                    </div>
                    {quizState.isCorrect !== null && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ marginTop: '12px', fontSize: '0.85rem', color: quizState.isCorrect ? 'var(--emerald)' : 'var(--muted)' }}
                      >
                        {quizState.isCorrect 
                          ? 'Excellent! You\'ve demonstrated understanding of this concept.' 
                          : `The correct answer is: ${selectedLesson.quiz.answer}. Review the lesson content and try again.`}
                      </motion.p>
                    )}
                  </motion.section>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {aiState.status !== 'idle' && (
                  <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="glass-panel critique-panel accent-purple" 
                    style={{ marginTop: '24px' }}
                  >
                    <div className="panel-heading">
                      <div>
                        <p className="card-tag text-purple">AI Logic Critique</p>
                        <h3>Sensei Response</h3>
                      </div>
                      {aiState.score > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="40" height="40" viewBox="0 0 40 40">
                            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--purple)" strokeWidth="3" strokeLinecap="round"
                              strokeDasharray={`${(aiState.score / 100) * 100.5} 100.5`}
                              transform="rotate(-90 20 20)" />
                            <text x="20" y="20" textAnchor="middle" dy="0.35em" fill="var(--purple)" fontSize="10" fontWeight="bold">
                              {aiState.score}
                            </text>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="status-copy markdown-critique">
                      {aiState.status === 'requesting' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 0' }}>
                          <div style={{ width: '20px', height: '20px', border: '2px solid rgba(168,85,247,0.3)', borderTopColor: 'var(--purple)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          <p>Sensei is analyzing your logic rituals...</p>
                        </div>
                      ) : (
                        <ReactMarkdown>{aiState.critique}</ReactMarkdown>
                      )}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </article>

            <article className="glass-panel content-card dojo-side-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-purple">Sensei Assistance</p>
                  <h3>AI Critique</h3>
                </div>
              </div>
              <p className="status-copy">
                Request an instant logical critique of your current implementation.
              </p>
              <motion.button 
                type="button" 
                className="action-button action-button-primary"
                onClick={handleAIReview}
                disabled={aiState.status === 'requesting' || !selectedLesson}
                style={{ width: '100%', marginBottom: '20px' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {aiState.status === 'requesting' ? '⏳ Analyzing...' : '🧠 Trigger Review Logic'}
              </motion.button>

              {/* Lesson Completion Status */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '20px' }}>
                <div className="panel-heading" style={{ marginBottom: '12px' }}>
                  <div>
                    <p className="card-tag text-emerald">Lesson Status</p>
                    <h3 style={{ fontSize: '1.1rem' }}>Current Progress</h3>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Status</span>
                    <span style={{ color: selectedLesson && completedSet.has(selectedLesson?.slug) ? 'var(--emerald)' : 'var(--amber)' }}>
                      {selectedLesson && completedSet.has(selectedLesson?.slug) ? '✓ Completed' : '◌ In Progress'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Code Runs</span>
                    <span style={{ color: 'var(--cyan)' }}>{executionStats.runs}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Last Execution</span>
                    <span style={{ color: 'var(--purple)' }}>{executionStats.lastExecutionTime > 0 ? `${executionStats.lastExecutionTime}ms` : '--'}</span>
                  </div>
                </div>
              </div>

              <div className="panel-heading">
                <div>
                  <p className="card-tag text-cyan">Weekly Gate</p>
                  <h3>Assessment</h3>
                </div>
                <span className="mini-pill" style={{ background: 'rgba(0,242,255,0.1)', color: 'var(--cyan)' }}>Sunday</span>
              </div>
              <p className="status-copy" style={{ marginBottom: '12px' }}>
                3 logic puzzles + 2 code snippets. Failures auto-prioritize weak lessons.
              </p>
              {selectedLesson && completedSet.has(selectedLesson.slug) ? (
                <NavLink to="/laboratory" className="action-button" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.2)', color: 'var(--cyan)', borderRadius: '12px', padding: '10px' }}>
                  Transfer to Laboratory →
                </NavLink>
              ) : (
                <p className="status-copy" style={{ fontSize: '0.8rem' }}>Complete the active lesson to unlock Laboratory handoff.</p>
              )}
            </article>
          </section>
        </div>
      </section>
    </>
  )
}
