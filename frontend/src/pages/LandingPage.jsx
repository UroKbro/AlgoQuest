import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ChartNoAxesColumn,
  Compass,
  GitBranch,
  Play,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'

const bubbleSortFrames = [
  {
    label: 'Step 1',
    title: 'Compare the first pair',
    note: 'Bubble sort starts locally. Compare adjacent values and swap if they are out of order.',
    values: [7, 3, 11, 4, 9, 2],
    compare: [0, 1],
    swapped: [0, 1],
    sorted: [],
  },
  {
    label: 'Step 2',
    title: 'Keep pushing the largest rightward',
    note: 'The current pass keeps moving larger numbers toward the end of the list.',
    values: [3, 7, 4, 9, 2, 11],
    compare: [1, 2],
    swapped: [1, 2],
    sorted: [5],
  },
  {
    label: 'Step 3',
    title: 'Shorten the next pass',
    note: 'Once the largest value lands, the algorithm ignores that sorted tail and repeats.',
    values: [3, 4, 7, 2, 9, 11],
    compare: [2, 3],
    swapped: [2, 3],
    sorted: [4, 5],
  },
  {
    label: 'Step 4',
    title: 'Finish with an ordered list',
    note: 'After a few passes, every value settles into place and the array is sorted.',
    values: [2, 3, 4, 7, 9, 11],
    compare: [],
    swapped: [],
    sorted: [0, 1, 2, 3, 4, 5],
  },
]

const featureCards = [
  {
    icon: BrainCircuit,
    title: 'Guided practice',
    copy: 'Learn the core idea first, then reinforce it through lessons, visual traces, and interactive drills.',
  },
  {
    icon: Bot,
    title: 'AI support that teaches',
    copy: 'Get logic reviews, Socratic hints, and blueprint generation without turning the app into an answer dump.',
  },
  {
    icon: ChartNoAxesColumn,
    title: 'Visible progress',
    copy: 'See weekly focus, mastery trends, and friction points so you know what to work on next.',
  },
]

const productSections = [
  {
    icon: Compass,
    title: 'Start in the Dojo',
    copy: 'Build intuition with structured fundamentals and low-friction practice.',
  },
  {
    icon: Workflow,
    title: 'Move into the Lab',
    copy: 'Watch algorithms unfold step by step instead of treating them like static textbook code.',
  },
  {
    icon: GitBranch,
    title: 'Ship in the World',
    copy: 'Turn ideas into project blueprints, save work, and export manifests from the same workspace.',
  },
  {
    icon: ShieldCheck,
    title: 'Track your Path',
    copy: 'Use analytics and weekly gates to keep your learning loop intentional instead of random.',
  },
]

const realmHighlights = [
  { name: 'Nexus', copy: 'Your central dashboard for continuity, pulse, and next actions.' },
  { name: 'Dojo', copy: 'Foundational lessons that make syntax and flow feel approachable.' },
  { name: 'Laboratory', copy: 'Algorithm playback, scrubbing, and state inspection in one place.' },
  { name: 'Forge + World', copy: 'Creative output, saved projects, and blueprint-driven building.' },
]

const feelingMoments = [
  {
    title: 'Warm onboarding',
    copy: 'The first screen shows where to begin, what to click next, and how progress will feel over time.',
    status: 'low pressure',
  },
  {
    title: 'Clear guidance',
    copy: 'Hints, visual state changes, and focused screens make each session feel intentional instead of chaotic.',
    status: 'always oriented',
  },
  {
    title: 'Momentum after the lesson',
    copy: 'What you learn turns into projects, saved work, and a visible path forward without context switching.',
    status: 'ready to build',
  },
]

const sessionSteps = [
  { label: '1', title: 'Open the Dojo', detail: 'Choose a lesson and get a calm orientation before touching code.' },
  { label: '2', title: 'Inspect the logic', detail: 'Watch state changes visually until the pattern starts to click.' },
  { label: '3', title: 'Ask for help', detail: 'Use hints and reviews when you need direction, not just answers.' },
  { label: '4', title: 'Carry progress forward', detail: 'Save projects, unlock the next focus, and keep your momentum visible.' },
]

const interfaceSignals = [
  { label: 'Focus mode', value: 'minimal noise' },
  { label: 'Feedback style', value: 'visual + actionable' },
  { label: 'Learning pace', value: 'guided but flexible' },
]

const interactiveModes = [
  {
    id: 'dojo',
    label: 'Dojo',
    title: 'A calm lesson flow with visible wins',
    copy: 'Lessons feel structured and encouraging. You always know the concept, the next action, and what progress means.',
    chips: ['guided lesson', 'live progress', 'gentle pacing'],
    metrics: [
      { label: 'Current focus', value: 'two pointers' },
      { label: 'Lesson confidence', value: 'rising' },
      { label: 'Session tone', value: 'clear + steady' },
    ],
  },
  {
    id: 'lab',
    label: 'Lab',
    title: 'Visual algorithm playback that makes decisions click',
    copy: 'The Lab feels responsive and inspectable. You can follow the active state, compare steps, and build intuition from motion.',
    chips: ['step playback', 'state inspection', 'logic tracing'],
    metrics: [
      { label: 'Playback mode', value: 'step-by-step' },
      { label: 'Active window', value: 'shrinking live' },
      { label: 'Learning effect', value: 'aha moments' },
    ],
  },
  {
    id: 'forge',
    label: 'Forge',
    title: 'From understanding to building without losing momentum',
    copy: 'The Forge side feels creative and productive. You can convert what you learned into blueprints, projects, and next steps fast.',
    chips: ['project blueprints', 'saved work', 'ship-ready flow'],
    metrics: [
      { label: 'Output type', value: 'starter blueprint' },
      { label: 'Creative state', value: 'high momentum' },
      { label: 'Next action', value: 'build + export' },
    ],
  },
]

const heroStats = [
  { label: 'Realms connected', value: '8' },
  { label: 'Core loop', value: 'learn -> inspect -> build' },
  { label: 'AI role', value: 'coach, not autopilot' },
]

export default function LandingPage() {
  const [activeMode, setActiveMode] = useState(interactiveModes[0])
  const [activeBubbleStep, setActiveBubbleStep] = useState(0)
  const currentBubbleFrame = bubbleSortFrames[activeBubbleStep]

  return (
    <div className="landing-page-shell">
      <div className="landing-aurora landing-aurora-left" aria-hidden="true" />
      <div className="landing-aurora landing-aurora-right" aria-hidden="true" />
      <div className="landing-grid" aria-hidden="true" />

      <header className="landing-nav">
        <Link to="/landing" className="landing-brand">
          <span className="landing-brand-mark">A</span>
          <span>
            <strong>AlgoQuest</strong>
            <small>Algorithm OS</small>
          </span>
        </Link>

        <div className="landing-nav-actions">
          <Link to="/auth" className="landing-link-button landing-link-button-muted">
            Sign in
          </Link>
          <Link to="/auth?mode=signup" className="landing-link-button landing-link-button-primary">
            Get started
          </Link>
        </div>
      </header>

      <main className="landing-page">
        <section className="landing-hero">
          <motion.div
            className="landing-hero-copy"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="landing-pill">
              <Sparkles size={14} />
              Learn algorithms through guided visuals, practice, and projects
            </div>

            <h1>
              Algorithms are easier when you can
              <span> see them think.</span>
            </h1>

            <p className="landing-hero-lead">
              AlgoQuest is a learning workspace for algorithms and problem solving. Study the idea, watch the logic unfold,
              get AI coaching, and turn what you learned into projects without leaving the product.
            </p>

            <div className="landing-hero-actions">
              <Link to="/auth?mode=signup" className="landing-cta-primary">
                Start your journey
                <ArrowRight size={18} />
              </Link>

              <Link to="/auth" className="landing-cta-secondary">
                <Play size={16} />
                Continue learning
              </Link>
            </div>

            <div className="landing-stat-row">
              {heroStats.map((item) => (
                <div key={item.label} className="landing-stat-card glass-panel">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="landing-showcase glass-panel"
            initial={{ opacity: 0, scale: 0.98, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="landing-showcase-header">
              <div>
                <p className="eyebrow">Algorithm Showcase</p>
                <h2>Bubble sort, step by step</h2>
              </div>
              <div className="landing-showcase-controls">
                <div className="landing-signal">
                  <span />
                  O(n^2) sorting flow
                </div>
                <div className="landing-step-buttons">
                  <button
                    type="button"
                    className="landing-step-button"
                    onClick={() => setActiveBubbleStep((step) => Math.max(0, step - 1))}
                    disabled={activeBubbleStep === 0}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="landing-step-button"
                    onClick={() => setActiveBubbleStep((step) => Math.min(bubbleSortFrames.length - 1, step + 1))}
                    disabled={activeBubbleStep === bubbleSortFrames.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            <div className="landing-algorithm-panel">
              <div className="landing-algorithm-meta">
                <div className="landing-algorithm-chip">Compare neighbors</div>
                <div className="landing-algorithm-chip">Swap when needed</div>
                <div className="landing-algorithm-chip">Grow the sorted tail</div>
              </div>

              <AnimatePresence mode="wait">
                <motion.article
                  key={currentBubbleFrame.label}
                  className="landing-algorithm-frame"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <div className="landing-algorithm-frame-header">
                    <div>
                      <small>{currentBubbleFrame.label}</small>
                      <strong>{currentBubbleFrame.title}</strong>
                    </div>
                    <span>{currentBubbleFrame.note}</span>
                  </div>

                  <div className="landing-algorithm-row landing-algorithm-row-bubble">
                    {currentBubbleFrame.values.map((value, valueIndex) => {
                      const isComparing = currentBubbleFrame.compare.includes(valueIndex)
                      const isSwapped = currentBubbleFrame.swapped.includes(valueIndex)
                      const isSorted = currentBubbleFrame.sorted.includes(valueIndex)

                      return (
                        <div
                          key={`${currentBubbleFrame.label}-${valueIndex}-${value}`}
                          className={`landing-algorithm-cell${isComparing ? ' is-active' : ''}${isSwapped ? ' is-swapped' : ''}${isSorted ? ' is-found' : ''}`}
                        >
                          <span>{value}</span>
                        </div>
                      )
                    })}
                  </div>
                </motion.article>
              </AnimatePresence>

              <div className="landing-algorithm-summary">
                <div className="landing-algorithm-insight glass-panel">
                  <small>Why it clicks here</small>
                  <strong>You can watch each comparison and swap happen in order.</strong>
                  <p>
                    Instead of memorizing loops abstractly, learners can step through the array and see which pair is active, what swapped, and what is already sorted.
                  </p>
                </div>

                <div className="landing-algorithm-insight glass-panel">
                  <small>What the site adds</small>
                  <strong>Lesson guidance, visual playback, and AI coaching in one flow.</strong>
                  <p>
                    Start with the concept, step through the behavior visually, and then ask for a hint or review when you begin implementing it yourself.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="landing-feature-section">
          <div className="landing-section-heading">
            <div>
              <p className="eyebrow">What AlgoQuest Does</p>
              <h2>A learning system, not just a code playground.</h2>
            </div>
            <p>
              The product is built to help learners understand algorithmic thinking from multiple angles: explanation, visualization,
              feedback, repetition, and project application.
            </p>
          </div>

          <div className="landing-feature-grid">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.article
                  key={feature.title}
                  className="landing-feature-card glass-panel"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div className="landing-feature-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section className="landing-experience-strip glass-panel">
          {productSections.map((pillar, index) => {
            const Icon = pillar.icon

            return (
              <motion.div
                key={pillar.title}
                className="landing-experience-item"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <div className="landing-experience-icon">
                  <Icon size={20} />
                </div>
                <div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.copy}</p>
                </div>
              </motion.div>
            )
          })}
        </section>

        <section className="landing-realm-section">
          <div className="landing-section-heading">
            <div>
              <p className="eyebrow">Inside The Product</p>
              <h2>Each part of the site has a job.</h2>
            </div>
            <p>
              AlgoQuest is organized into focused spaces so learners can move from theory to feedback to execution without losing context.
            </p>
          </div>

          <div className="landing-realm-grid">
            {realmHighlights.map((realm, index) => (
              <motion.article
                key={realm.name}
                className="landing-realm-card glass-panel"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <strong>{realm.name}</strong>
                <p>{realm.copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="landing-feel-section">
          <div className="landing-section-heading">
            <div>
              <p className="eyebrow">How It Feels</p>
              <h2>The landing page should preview the experience, not just list features.</h2>
            </div>
            <p>
              These visual and interactive elements give users a feel for the actual product: guided, responsive, and built to keep learning in flow.
            </p>
          </div>

          <div className="landing-feel-grid">
            <motion.article
              className="landing-session-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <div className="landing-session-header">
                <div>
                  <small>Guided session preview</small>
                  <strong>Your first 10 minutes</strong>
                </div>
                <span className="landing-session-badge">interactive rhythm</span>
              </div>

              <div className="landing-session-steps">
                {sessionSteps.map((step) => (
                  <motion.div key={step.label} className="landing-session-step" whileHover={{ x: 6 }} transition={{ duration: 0.18 }}>
                    <span className="landing-session-step-index">{step.label}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.article>

            <motion.article
              className="landing-feedback-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <div className="landing-feedback-topbar">
                <div>
                  <small>Live interface signals</small>
                  <strong>A workspace that reacts with you</strong>
                </div>
              </div>

              <div className="landing-feedback-pills">
                {interfaceSignals.map((signal) => (
                  <div key={signal.label} className="landing-feedback-pill">
                    <span>{signal.label}</span>
                    <strong>{signal.value}</strong>
                  </div>
                ))}
              </div>

              <div className="landing-feedback-console">
                <div className="landing-console-line is-cyan">AI review: logic is stable, check the boundary case.</div>
                <div className="landing-console-line is-amber">Weekly focus updated: recursion depth needs repetition.</div>
                <div className="landing-console-line is-emerald">Project blueprint ready: binary-search visualizer.</div>
              </div>
            </motion.article>
          </div>

          <div className="landing-interactive-panel glass-panel">
            <div className="landing-section-heading">
              <div>
                <p className="eyebrow">Interactive Preview</p>
                <h2>Switch product modes and feel the interface change.</h2>
              </div>
              <p>
                This gives users a more direct sense of how different parts of AlgoQuest behave: calm instruction, visual reasoning, and creative building.
              </p>
            </div>

            <div className="landing-mode-tabs" role="tablist" aria-label="AlgoQuest preview modes">
              {interactiveModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={activeMode.id === mode.id}
                  className={`landing-mode-tab${activeMode.id === mode.id ? ' is-active' : ''}`}
                  onClick={() => setActiveMode(mode)}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeMode.id}
                className="landing-mode-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div className="landing-mode-copy">
                  <small>{activeMode.label} experience</small>
                  <h3>{activeMode.title}</h3>
                  <p>{activeMode.copy}</p>

                  <div className="landing-mode-chip-row">
                    {activeMode.chips.map((chip) => (
                      <span key={chip} className="landing-mode-chip">{chip}</span>
                    ))}
                  </div>
                </div>

                <div className="landing-mode-visual">
                  <div className="landing-mode-visual-top">
                    {activeMode.metrics.map((metric) => (
                      <div key={metric.label} className="landing-mode-metric">
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="landing-mode-visual-body">
                    <div className="landing-mode-glow" />
                    <div className="landing-mode-track">
                      <div className="landing-mode-track-fill" style={{ width: activeMode.id === 'dojo' ? '62%' : activeMode.id === 'lab' ? '78%' : '88%' }} />
                    </div>
                    <div className="landing-mode-cards">
                      <div className="landing-mode-card is-primary">
                        <strong>{activeMode.label}</strong>
                        <p>{activeMode.id === 'dojo' ? 'A lesson card with progress and next steps.' : activeMode.id === 'lab' ? 'A visual inspector showing active states and flow.' : 'A blueprint panel ready to turn learning into projects.'}</p>
                      </div>
                      <div className="landing-mode-card">
                        <strong>{activeMode.id === 'dojo' ? 'Hint ready' : activeMode.id === 'lab' ? 'Playback live' : 'Export ready'}</strong>
                        <p>{activeMode.id === 'dojo' ? 'Feedback appears when you need it.' : activeMode.id === 'lab' ? 'Motion helps each step feel understandable.' : 'The build path stays connected to what you learned.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="landing-feeling-row">
            {feelingMoments.map((moment, index) => (
              <motion.article
                key={moment.title}
                className="landing-feeling-card glass-panel"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <span>{moment.status}</span>
                <strong>{moment.title}</strong>
                <p>{moment.copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="landing-final-cta glass-panel">
          <div>
            <p className="eyebrow">Ready To Enter</p>
            <h2>Start with one algorithm, then keep going.</h2>
            <p>
              Use the platform to learn concepts clearly, practice with feedback, and build enough momentum to turn knowledge into real implementation.
            </p>
          </div>

          <div className="landing-final-actions">
            <Link to="/auth?mode=signup" className="landing-cta-primary">
              Create account
              <ArrowRight size={18} />
            </Link>
            <Link to="/auth" className="landing-link-button landing-link-button-muted">
              Sign in
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
