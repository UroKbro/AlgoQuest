import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Lock,
  Loader2,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'

import { login, signup } from '../api'

const authBenefits = [
  'Structured lessons and guided hints',
  'Persistent progress across realms',
  'AI review tools with a calmer workspace',
]

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'

  const [mode, setMode] = useState(initialMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignup) {
        await signup(username, password)
      } else {
        await login(username, password)
      }

      window.location.href = '/'
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-shell">
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
          <Link to="/landing" className="landing-link-button landing-link-button-muted">
            Back to home
          </Link>
        </div>
      </header>

      <main className="auth-page">
        <motion.section
          className="auth-intro"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <div className="landing-pill">
            <Sparkles size={14} />
            {isSignup ? 'Create your learning identity' : 'Pick up exactly where you left off'}
          </div>

          <h1>
            {isSignup ? 'Enter a workspace built to make learning feel smooth.' : 'Welcome back to a cleaner way to practice algorithms.'}
          </h1>

          <p className="auth-intro-copy">
            {isSignup
              ? 'Create an account to save progress, move across realms, and use the full guided experience with a polished interface that stays focused.'
              : 'Sign in to return to your progress, projects, AI feedback, and the same calm, high-quality experience you saw on the landing page.'}
          </p>

          <div className="auth-benefit-list">
            {authBenefits.map((item) => (
              <div key={item} className="auth-benefit-item glass-panel">
                <ShieldCheck size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="auth-panel glass-panel"
          initial={{ opacity: 0, scale: 0.97, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: 'easeOut' }}
        >
          <div className="auth-panel-header">
            <div>
              <p className="eyebrow">Secure Access</p>
              <h2>{isSignup ? 'Create account' : 'Sign in'}</h2>
              <p>
                {isSignup
                  ? 'Start a new session with synced settings and saved progress.'
                  : 'Authenticate to continue your session and re-enter the app.'}
              </p>
            </div>

            <div className="auth-mode-chip">
              <span className={isSignup ? '' : 'is-active'}>Login</span>
              <span className={isSignup ? 'is-active' : ''}>Signup</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field">
              <span>Username</span>
              <div className="auth-input-shell">
                <User size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your alias"
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-shell">
                <Lock size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                />
              </div>
            </label>

            <AnimatePresence>
              {error ? (
                <motion.div
                  className="auth-error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <button type="submit" className="auth-submit-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="auth-spinner" />
                  Processing
                </>
              ) : (
                <>
                  {isSignup ? 'Create account' : 'Sign in'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-panel-footer">
            <p>
              {isSignup ? 'Already have an account?' : 'New to AlgoQuest?'}
            </p>
            <button
              type="button"
              className="auth-switch-button"
              onClick={() => setMode(isSignup ? 'login' : 'signup')}
            >
              {isSignup ? 'Sign in instead' : 'Create an account'}
            </button>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
