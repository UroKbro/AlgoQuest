import { motion } from 'framer-motion'
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

const algorithmFrames = [
  {
    label: 'Step 1',
    title: 'Choose the middle',
    note: 'Target is 42. Start with the whole sorted array.',
    activeIndex: 4,
    range: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    label: 'Step 2',
    title: 'Discard the left half',
    note: '18 is too small, so keep only the right side.',
    activeIndex: 6,
    range: [5, 6, 7, 8],
  },
  {
    label: 'Step 3',
    title: 'Lock onto the answer',
    note: '42 is found after narrowing to a tiny search window.',
    activeIndex: 7,
    range: [7],
    foundIndex: 7,
  },
]

const algorithmValues = [3, 7, 11, 14, 18, 24, 31, 42, 57]

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

const heroStats = [
  { label: 'Realms connected', value: '8' },
  { label: 'Core loop', value: 'learn -> inspect -> build' },
  { label: 'AI role', value: 'coach, not autopilot' },
]

export default function LandingPage() {
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
                <h2>Binary search, made visible</h2>
              </div>
              <div className="landing-signal">
                <span />
                O(log n) search flow
              </div>
            </div>

            <div className="landing-algorithm-panel">
              <div className="landing-algorithm-meta">
                <div className="landing-algorithm-chip">Sorted data</div>
                <div className="landing-algorithm-chip">Compare middle value</div>
                <div className="landing-algorithm-chip">Halve the search window</div>
              </div>

              <div className="landing-algorithm-frame-list">
                {algorithmFrames.map((frame, index) => (
                  <motion.article
                    key={frame.label}
                    className="landing-algorithm-frame"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.2 + index * 0.08 }}
                  >
                    <div className="landing-algorithm-frame-header">
                      <div>
                        <small>{frame.label}</small>
                        <strong>{frame.title}</strong>
                      </div>
                      <span>{frame.note}</span>
                    </div>

                    <div className="landing-algorithm-row">
                      {algorithmValues.map((value, valueIndex) => {
                        const inRange = frame.range.includes(valueIndex)
                        const isActive = frame.activeIndex === valueIndex
                        const isFound = frame.foundIndex === valueIndex

                        return (
                          <div
                            key={`${frame.label}-${value}`}
                            className={`landing-algorithm-cell${inRange ? ' is-in-range' : ''}${isActive ? ' is-active' : ''}${isFound ? ' is-found' : ''}`}
                          >
                            <span>{value}</span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.article>
                ))}
              </div>

              <div className="landing-algorithm-summary">
                <div className="landing-algorithm-insight glass-panel">
                  <small>Why it clicks here</small>
                  <strong>You can see the range shrink at every decision.</strong>
                  <p>
                    Instead of memorizing pseudocode, learners watch the active middle, the valid window, and the final match update in place.
                  </p>
                </div>

                <div className="landing-algorithm-insight glass-panel">
                  <small>What the site adds</small>
                  <strong>Lesson guidance, visual playback, and AI review in one flow.</strong>
                  <p>
                    Start with fundamentals, inspect the algorithm visually, then ask for a hint or a review when you begin writing code yourself.
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
