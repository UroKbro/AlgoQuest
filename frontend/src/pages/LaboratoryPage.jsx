import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchAlgorithms, aiSocraticAnchor } from '../api'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'

const graphNodes = {
  A: { x: 80, y: 70 },
  B: { x: 240, y: 40 },
  C: { x: 390, y: 90 },
  D: { x: 150, y: 220 },
  E: { x: 320, y: 240 },
  F: { x: 470, y: 200 },
}

const graphEdges = [
  ['A', 'B', 4],
  ['A', 'D', 2],
  ['B', 'C', 3],
  ['B', 'E', 6],
  ['D', 'E', 3],
  ['D', 'B', 1],
  ['E', 'C', 2],
  ['E', 'F', 4],
  ['C', 'F', 2],
]

const algorithmVisualizers = {
  'binary-search': {
    title: 'Binary Search',
    mode: 'array',
    codeLines: [
      'low, high = 0, len(values) - 1',
      'while low <= high:',
      '    mid = (low + high) // 2',
      '    if values[mid] == target: return mid',
      '    if values[mid] < target: low = mid + 1',
      '    else: high = mid - 1',
    ],
    complexity: { time: 'O(log N)', space: 'O(1)' },
    getStructureState(snapshot) {
      return {
        'Index Range': `${snapshot.low} → ${snapshot.high}`,
        'Midpoint': snapshot.mid !== null ? snapshot.mid : 'none',
        'Target': 36
      }
    },
    buildSnapshots() {
      const values = [3, 7, 12, 18, 21, 24, 31, 36, 42, 49, 56]
      const target = 36
      const snapshots = [
        {
          line: 1,
          message: `Search starts across ${values.length} sorted values looking for ${target}.`,
          anchorLabel: 'Start',
          values,
          low: 0,
          high: values.length - 1,
          mid: null,
          foundIndex: null,
        },
      ]

      let low = 0
      let high = values.length - 1

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)

        snapshots.push({
          line: 3,
          message: `Probe the midpoint at index ${mid}.`,
          anchorLabel: `mid ${mid}`,
          values,
          low,
          high,
          mid,
          foundIndex: null,
        })

        if (values[mid] === target) {
          snapshots.push({
            line: 4,
            message: `Target found at index ${mid}.`,
            anchorLabel: 'Found',
            values,
            low,
            high,
            mid,
            foundIndex: mid,
          })
          break
        }

        if (values[mid] < target) {
          low = mid + 1
          snapshots.push({
            line: 5,
            message: `Discard the lower half and move low to ${low}.`,
            values,
            low,
            high,
            mid,
            foundIndex: null,
          })
        } else {
          high = mid - 1
          snapshots.push({
            line: 6,
            message: `Discard the upper half and move high to ${high}.`,
            values,
            low,
            high,
            mid,
            foundIndex: null,
          })
        }
      }

      return snapshots
    },
  },
  'merge-sort': {
    title: 'Merge Sort',
    mode: 'bars',
    codeLines: [
      'def merge_sort(values):',
      '    if len(values) <= 1: return values',
      '    mid = len(values) // 2',
      '    left = merge_sort(values[:mid])',
      '    right = merge_sort(values[mid:])',
      '    return merge(left, right)',
    ],
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    getStructureState(snapshot) {
      return {
        'Active Range': snapshot.activeRange ? `${snapshot.activeRange[0]}–${snapshot.activeRange[1]}` : 'none',
        'Merged Status': snapshot.mergedIndices?.length > 0 ? 'Partial Merge' : 'Splitting'
      }
    },
    buildSnapshots() {
      const initial = [38, 27, 43, 3, 9, 82, 10]
      const working = initial.slice()
      const snapshots = [
        {
          line: 1,
          message: 'Start with an unsorted array and divide it recursively.',
          anchorLabel: 'Start',
          values: working.slice(),
          activeRange: [0, working.length - 1],
          mergedIndices: [],
        },
      ]

      function mergeSort(start, end) {
        if (start === end) {
          return [working[start]]
        }

        const mid = Math.floor((start + end) / 2)
        snapshots.push({
          line: 3,
          message: `Split the range ${start}-${end} at ${mid}.`,
          anchorLabel: end - start > 2 ? `split ${start}-${end}` : null,
          values: working.slice(),
          activeRange: [start, end],
          mergedIndices: [],
        })

        const left = mergeSort(start, mid)
        const right = mergeSort(mid + 1, end)
        const merged = []
        let leftIndex = 0
        let rightIndex = 0

        while (leftIndex < left.length && rightIndex < right.length) {
          if (left[leftIndex] <= right[rightIndex]) {
            merged.push(left[leftIndex])
            leftIndex += 1
          } else {
            merged.push(right[rightIndex])
            rightIndex += 1
          }
        }

        while (leftIndex < left.length) {
          merged.push(left[leftIndex])
          leftIndex += 1
        }

        while (rightIndex < right.length) {
          merged.push(right[rightIndex])
          rightIndex += 1
        }

        merged.forEach((value, offset) => {
          working[start + offset] = value
        })

        snapshots.push({
          line: 6,
          message: `Merge produces a sorted block for ${start}-${end}.`,
          anchorLabel: end - start > 1 ? `merge ${start}-${end}` : null,
          values: working.slice(),
          activeRange: [start, end],
          mergedIndices: Array.from({ length: end - start + 1 }, (_, index) => start + index),
        })

        return merged
      }

      mergeSort(0, working.length - 1)

      snapshots.push({
        line: 6,
        message: 'All partial merges are complete and the array is now sorted.',
        anchorLabel: 'Sorted',
        values: working.slice(),
        activeRange: [0, working.length - 1],
        mergedIndices: Array.from({ length: working.length }, (_, index) => index),
      })

      return snapshots
    },
  },
  dijkstra: {
    title: 'Dijkstra',
    mode: 'graph',
    codeLines: [
      'dist[start] = 0',
      'while unvisited nodes remain:',
      '    current = cheapest unvisited node',
      '    for each neighbor: relax edge',
      '    mark current as visited',
      'return distances',
    ],
    complexity: { time: 'O((V + E) log V)', space: 'O(V)' },
    getStructureState(snapshot) {
      return {
        'Current Node': snapshot.currentNode || 'none',
        'Visited': `${snapshot.visited.length} / 6`,
        'Frontier Size': snapshot.frontier.length
      }
    },
    buildSnapshots() {
      const distances = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity }
      const visited = new Set()
      const nodes = Object.keys(graphNodes)
      const snapshots = [
        {
          line: 1,
          message: 'Initialize the source node A with distance 0.',
          anchorLabel: 'Start',
          distances: { ...distances },
          currentNode: 'A',
          visited: [],
          frontier: ['A'],
          activeEdge: null,
        },
      ]

      while (visited.size < nodes.length) {
        const currentNode = nodes
          .filter((node) => !visited.has(node))
          .sort((left, right) => distances[left] - distances[right])[0]

        if (!currentNode || distances[currentNode] === Infinity) {
          break
        }

        snapshots.push({
          line: 3,
          message: `Choose ${currentNode} because it has the cheapest known distance.`,
          anchorLabel: `visit ${currentNode}`,
          distances: { ...distances },
          currentNode,
          visited: [...visited],
          frontier: nodes.filter((node) => !visited.has(node) && distances[node] < Infinity),
          activeEdge: null,
        })

        graphEdges
          .filter(([from]) => from === currentNode)
          .forEach(([from, to, weight]) => {
            const candidate = distances[from] + weight

            if (candidate < distances[to]) {
              distances[to] = candidate
              snapshots.push({
                line: 4,
                message: `Relax ${from} -> ${to} and improve ${to} to ${candidate}.`,
                anchorLabel: `${from}->${to}`,
                distances: { ...distances },
                currentNode,
                visited: [...visited],
                frontier: nodes.filter((node) => !visited.has(node) && distances[node] < Infinity),
                activeEdge: [from, to],
              })
            }
          })

        visited.add(currentNode)
        snapshots.push({
          line: 5,
          message: `Mark ${currentNode} as finalized and move on.`,
          distances: { ...distances },
          currentNode,
          visited: [...visited],
          frontier: nodes.filter((node) => !visited.has(node) && distances[node] < Infinity),
          activeEdge: null,
        })
      }

      snapshots.push({
        line: 6,
        message: 'Shortest paths from A are resolved across the graph.',
        anchorLabel: 'Done',
        distances: { ...distances },
        currentNode: null,
        visited: [...visited],
        frontier: [],
        activeEdge: null,
      })

      return snapshots
    },
  },
}

function formatDistance(value) {
  return Number.isFinite(value) ? value : 'inf'
}

function buildVisualizer(slug) {
  const config = algorithmVisualizers[slug] ?? algorithmVisualizers['binary-search']
  const snapshots = config.buildSnapshots()

  return {
    ...config,
    snapshots,
    anchors: snapshots
      .map((snapshot, index) => ({ ...snapshot, index }))
      .filter((snapshot) => Boolean(snapshot.anchorLabel)),
  }
}

function ArraySnapshotView({ snapshot, mode }) {
  const maxValue = Math.max(...snapshot.values)

  return (
    <div className={mode === 'bars' ? 'bar-visualizer' : 'array-visualizer'}>
      {snapshot.values.map((value, index) => {
        const inRange =
          Array.isArray(snapshot.activeRange) &&
          index >= snapshot.activeRange[0] &&
          index <= snapshot.activeRange[1]
        const isMid = snapshot.mid === index
        const isFound = snapshot.foundIndex === index
        const isMerged = snapshot.mergedIndices?.includes(index)

        return (
          <div
            key={`${mode}-${index}-${value}`}
            className={`array-node${inRange ? ' is-in-range' : ''}${isMid ? ' is-mid' : ''}${isFound ? ' is-found' : ''}${isMerged ? ' is-merged' : ''}`}
            style={mode === 'bars' ? { height: `${Math.max(18, (value / maxValue) * 180)}px` } : undefined}
          >
            <span>{value}</span>
            <small>{index}</small>
          </div>
        )
      })}
    </div>
  )
}

function GraphSnapshotView({ snapshot }) {
  return (
    <div className="graph-visualizer">
      <svg viewBox="0 0 560 300" className="graph-surface" role="img" aria-label="Dijkstra graph">
        {graphEdges.map(([from, to, weight]) => {
          const fromNode = graphNodes[from]
          const toNode = graphNodes[to]
          const isActive =
            snapshot.activeEdge && snapshot.activeEdge[0] === from && snapshot.activeEdge[1] === to

          return (
            <g key={`${from}-${to}`}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                className={`graph-edge${isActive ? ' is-active' : ''}`}
              />
              <text x={(fromNode.x + toNode.x) / 2} y={(fromNode.y + toNode.y) / 2 - 8} className="graph-weight">
                {weight}
              </text>
            </g>
          )
        })}

        {Object.entries(graphNodes).map(([node, position]) => {
          const isCurrent = snapshot.currentNode === node
          const isVisited = snapshot.visited.includes(node)
          const isFrontier = snapshot.frontier.includes(node)

          return (
            <g key={node} transform={`translate(${position.x}, ${position.y})`}>
              <circle
                r="28"
                className={`graph-node${isCurrent ? ' is-current' : ''}${isVisited ? ' is-visited' : ''}${isFrontier ? ' is-frontier' : ''}`}
                onClick={() => handleGetHint(`node ${node}`)}
                style={{ cursor: 'help' }}
              />
              {isCurrent && (
                  <circle r="35" className="discovery-anchor-glow" />
              )}
              <text y="6" textAnchor="middle" className="graph-label">
                {node}
              </text>
              <text y="46" textAnchor="middle" className="graph-distance">
                {formatDistance(snapshot.distances[node])}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function SandboxPanel({ code, onCodeChange, activeLine, isModified }) {
  return (
    <div className={`sandbox-editor${isModified ? ' is-modified' : ''}`}>
      {isModified && (
        <div className="logic-delta-badge" title="User logic differs from canonical study material.">
          Logic Delta Detected
        </div>
      )}
      <Editor
        value={code}
        onValueChange={onCodeChange}
        highlight={(value) => Prism.highlight(value, Prism.languages.python, 'python')}
        padding={18}
        textareaClassName="code-editor-textarea"
        preClassName="code-editor-pre"
        className="code-editor"
      />
      <div className="editor-overlay-hints">
        {activeLine !== null && <div className="active-line-indicator" style={{ top: `${(activeLine - 1) * 1.7 + 1.1}rem` }} />}
      </div>
    </div>
  )
}

export default function LaboratoryPage() {
  const realm = realmConfig.laboratory
  const [state, setState] = useState({ status: 'loading', items: [], message: '' })
  const [selectedSlug, setSelectedSlug] = useState('binary-search')
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [customCodes, setCustomCodes] = useState({})
  const [aiHint, setAiHint] = useState({ status: 'idle', hint: '', anchor: null })
  const location = useLocation()

  useEffect(() => {
    if (location.state?.challenge?.algoSlug) {
      setSelectedSlug(location.state.challenge.algoSlug)
    }
  }, [location.state])

  async function handleGetHint(anchorName) {
    setAiHint({ status: 'requesting', hint: '', anchor: anchorName })
    try {
      const context = `Algorithm: ${activeSlug}, Visual Phase: ${currentSnapshot?.message ?? 'General'}`
      const res = await aiSocraticAnchor(activeCode, context, `Tell me about the ${anchorName} here.`)
      setAiHint({ status: 'ready', hint: res.hint, anchor: anchorName })
    } catch (error) {
      setAiHint({ status: 'error', hint: 'Sensei is silent. Try again.', anchor: anchorName })
    }
  }

  useEffect(() => {
    let cancelled = false

    fetchAlgorithms()
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'ready', items: data.items ?? [], message: '' })
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

  const supportedItems = useMemo(
    () => state.items.filter((item) => Boolean(algorithmVisualizers[item.slug])),
    [state.items],
  )

  const activeSlug = useMemo(() => {
    if (supportedItems.some((item) => item.slug === selectedSlug)) {
      return selectedSlug
    }

    return supportedItems[0]?.slug ?? 'binary-search'
  }, [selectedSlug, supportedItems])

  const visualizer = useMemo(() => buildVisualizer(activeSlug), [activeSlug])
  const currentSnapshot = visualizer.snapshots[Math.min(stepIndex, visualizer.snapshots.length - 1)]
  const selectedAlgorithm =
    supportedItems.find((item) => item.slug === activeSlug) ?? state.items.find((item) => item.slug === activeSlug)

  useEffect(() => {
    setStepIndex(0)
    setIsPlaying(false)
  }, [activeSlug])

  const canonicalCode = useMemo(() => visualizer.codeLines.join('\n'), [visualizer.codeLines])
  const activeCode = customCodes[activeSlug] ?? canonicalCode
  const isLogicModified = activeCode !== canonicalCode

  const structureState = useMemo(() => {
    return visualizer.getStructureState?.(currentSnapshot) ?? {}
  }, [visualizer, currentSnapshot])

  useEffect(() => {
    if (!isPlaying) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= visualizer.snapshots.length - 1) {
          window.clearInterval(intervalId)
          setIsPlaying(false)
          return current
        }

        return current + 1
      })
    }, 1100)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isPlaying, visualizer.snapshots.length])

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="The Lab now contains a real algorithm visualizer with playback, timeline scrubbing, discovery anchors, and step-linked pseudocode."
        accent={realm.accent}
      />

      {state.status === 'loading' ? (
        <section className="glass-panel status-card">
          <p className="status-label">Loading algorithms...</p>
        </section>
      ) : null}

      {state.status === 'error' ? (
        <section className="glass-panel status-card error-card">
          <p className="status-label">Unable to load algorithm metadata.</p>
          <p className="status-copy">{state.message}</p>
        </section>
      ) : null}

      {state.status === 'ready' ? (
        <>
          <section className="glass-panel lab-picker-panel">
            <div className="panel-heading">
              <div>
                <p className="card-tag text-cyan">Algorithm Set</p>
                <h3>Choose a study track</h3>
              </div>
              <span className="mini-pill">Telemetry Dock</span>
            </div>
            <div className="algorithm-picker">
              {supportedItems.map((algorithm) => (
                <button
                  key={algorithm.slug}
                  type="button"
                  className={`picker-button${algorithm.slug === activeSlug ? ' is-active' : ''}`}
                  onClick={() => setSelectedSlug(algorithm.slug)}
                >
                  <strong>{algorithm.name}</strong>
                  <span>{algorithm.summary}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="laboratory-layout">
            <article className="glass-panel visualizer-panel">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-cyan">Visual Canvas</p>
                  <h3>{selectedAlgorithm?.name ?? visualizer.title}</h3>
                </div>
                <span className="mini-pill">Step {stepIndex + 1} / {visualizer.snapshots.length}</span>
              </div>

              <p className="status-copy">{currentSnapshot.message}</p>

              <div className="visualizer-frame">
                {visualizer.mode === 'graph' ? (
                  <GraphSnapshotView snapshot={currentSnapshot} />
                ) : (
                  <ArraySnapshotView snapshot={currentSnapshot} mode={visualizer.mode} />
                )}
              </div>

              <div className="transport-row">
                <button type="button" className="action-button" onClick={() => setStepIndex(0)}>
                  Reset
                </button>
                <button
                  type="button"
                  className="action-button action-button-primary"
                  onClick={() => setIsPlaying((current) => !current)}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  className="action-button"
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="action-button"
                  onClick={() =>
                    setStepIndex((current) => Math.min(visualizer.snapshots.length - 1, current + 1))
                  }
                >
                  Forward
                </button>
              </div>

              <label className="scrubber-block">
                <span className="setting-header">
                  <strong>Time-Travel Scrubber</strong>
                  <small>{currentSnapshot.message}</small>
                </span>
                <input
                  type="range"
                  min="0"
                  max={visualizer.snapshots.length - 1}
                  value={stepIndex}
                  onChange={(event) => {
                    setIsPlaying(false)
                    setStepIndex(Number(event.target.value))
                  }}
                />
              </label>

              <div className="anchor-row" aria-label="Discovery anchors">
                {visualizer.anchors.map((anchor) => (
                  <button
                    key={`${activeSlug}-${anchor.index}`}
                    type="button"
                    className={`anchor-dot${anchor.index === stepIndex ? ' is-active' : ''}`}
                    onClick={() => {
                      setIsPlaying(false)
                      setStepIndex(anchor.index)
                    }}
                    title={anchor.anchorLabel}
                    aria-label={anchor.anchorLabel}
                  />
                ))}
              </div>
            </article>

            <aside className="lab-side-column">
              <article className="glass-panel content-card">
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-purple">Trace Feed</p>
                    <h3>Operational Log</h3>
                  </div>
                </div>
                <div className="trace-list">
                  {visualizer.snapshots.map((snap, i) => (
                    <div
                      key={i}
                      className={`trace-item${i === stepIndex ? ' is-active' : ''}`}
                      onClick={() => setStepIndex(i)}
                    >
                      <span className="trace-step">{String(i).padStart(2, '0')}</span>
                      <p>{snap.message}</p>
                    </div>
                  ))}
                </div>

                {aiHint.status !== 'idle' && (
                  <div className="glass-panel ai-hint-bubble accent-cyan" style={{ marginTop: '20px' }}>
                    <div className="panel-heading">
                      <p className="card-tag text-cyan">Sensei Hint: {aiHint.anchor}</p>
                    </div>
                    <p className="status-copy">
                      {aiHint.status === 'requesting' ? 'Whispering into the logic void...' : aiHint.hint}
                    </p>
                    {aiHint.status === 'ready' && (
                      <button className="inline-link" onClick={() => setAiHint({ status: 'idle', hint: '', anchor: null })}>Dismiss</button>
                    )}
                  </div>
                )}
              </article>

              <article className="glass-panel content-card">
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-cyan">Logic Snapshot</p>
                    <h3>Telemetry Dock</h3>
                  </div>
                </div>
                <dl className="telemetry-list">
                  <div>
                    <dt>Algorithm</dt>
                    <dd>{selectedAlgorithm?.name ?? visualizer.title}</dd>
                  </div>
                  <div>
                    <dt>Family</dt>
                    <dd>{selectedAlgorithm?.family ?? 'Study'}</dd>
                  </div>
                  <div>
                    <dt>Current Step</dt>
                    <dd>{stepIndex + 1}</dd>
                  </div>
                  <div>
                    <dt>Anchor Count</dt>
                    <dd>{visualizer.anchors.length}</dd>
                  </div>
                  {visualizer.complexity && (
                    <>
                      <div>
                        <dt>Time Complexity</dt>
                        <dd className="text-cyan">{visualizer.complexity.time}</dd>
                      </div>
                      <div>
                        <dt>Space Complexity</dt>
                        <dd className="text-cyan">{visualizer.complexity.space}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </article>

              <article className="glass-panel content-card">
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-purple">Structure State</p>
                    <h3>Active Variables</h3>
                  </div>
                </div>
                <dl className="telemetry-list">
                  {Object.entries(structureState).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>

              <article className="glass-panel content-card">
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-cyan">Live-Logic Sandbox</p>
                    <h3>Pseudocode Sync</h3>
                  </div>
                  <button
                    type="button"
                    className="mini-pill"
                    onClick={() => setCustomCodes((prev) => ({ ...prev, [activeSlug]: canonicalCode }))}
                    disabled={!isLogicModified}
                  >
                    Reset Logic
                  </button>
                </div>
                <SandboxPanel
                  code={activeCode}
                  onCodeChange={(newCode) => setCustomCodes((prev) => ({ ...prev, [activeSlug]: newCode }))}
                  activeLine={currentSnapshot.line}
                  isModified={isLogicModified}
                />
              </article>
            </aside>
          </section>
        </>
      ) : null}
    </>
  )
}
