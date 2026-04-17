import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useEffect, useState, Suspense, lazy } from 'react'
import AppLayout from './components/AppLayout'
import { fetchSettings, updateSettings, logout } from './api'

const DojoPage = lazy(() => import('./pages/DojoPage'))
const LaboratoryPage = lazy(() => import('./pages/LaboratoryPage'))
const NexusPage = lazy(() => import('./pages/NexusPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TerminalPage = lazy(() => import('./pages/TerminalPage'))
const SandboxPage = lazy(() => import('./pages/SandboxPage'))
const WorldPage = lazy(() => import('./pages/WorldPage'))
const ForgePage = lazy(() => import('./pages/ForgePage'))
const PathPage = lazy(() => import('./pages/PathPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))

const settingsStorageKey = 'algoquest-settings'
const defaultSettings = {
  neonIntensity: 72,
  soundVolume: 40,
  motionBlur: 24,
  reducedMotion: false,
}

function readStoredSettings() {
  try {
    const raw = localStorage.getItem(settingsStorageKey)
    if (!raw) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return defaultSettings
  }
}

function applySettingsToDocument(settings) {
  const root = document.documentElement
  root.style.setProperty('--neon-intensity', `${settings.neonIntensity / 100}`)
  root.style.setProperty('--sound-volume', `${settings.soundVolume / 100}`)
  root.style.setProperty('--motion-blur', `${settings.motionBlur}px`)
  root.dataset.reducedMotion = settings.reducedMotion ? 'true' : 'false'
}

export default function App() {
  const [isAuthenticated] = useState(() => {
    return !!localStorage.getItem('algoquest-token')
  })

  const [appState, setAppState] = useState(() => ({
    sessionMode: isAuthenticated ? 'user' : 'guest',
    settings: defaultSettings,
    progress: { lessons: [] },
    notifications: [],
    aiRequestState: { status: 'idle' },
  }))

  useEffect(() => {
    const storedSettings = readStoredSettings()
    setAppState((current) => ({
      ...current,
      settings: storedSettings,
    }))

    fetchSettings()
      .then((backendSettings) => {
        setAppState((current) => ({
          ...current,
          settings: { ...current.settings, ...backendSettings },
        }))
        if (isAuthenticated) {
          triggerNotification('Identity Verified', 'Neural link established. cloud sync active.', 'success')
        }
      })
      .catch((err) => {
        console.warn('Backend sync failed.', err)
        if (isAuthenticated) {
          triggerNotification('Sync Interruption', 'Cloud storage unreachable. Reverting to local cache.', 'warning')
        }
      })
  }, [isAuthenticated])

  useEffect(() => {
    localStorage.setItem(settingsStorageKey, JSON.stringify(appState.settings))
    applySettingsToDocument(appState.settings)

    const { neonIntensity, soundVolume, motionBlur, reducedMotion } = appState.settings
    updateSettings({ neonIntensity, soundVolume, motionBlur, reducedMotion }).catch(() => {})
  }, [appState.settings, isAuthenticated])

  function triggerNotification(title, message, type = 'info') {
    const id = Date.now()
    setAppState((current) => ({
      ...current,
      notifications: [...current.notifications, { id, title, message, type }],
    }))
    setTimeout(() => {
      setAppState((current) => ({
        ...current,
        notifications: current.notifications.filter((notification) => notification.id !== id),
      }))
    }, 5000)
  }

  const routeFallback = (
    <div className="glass-panel status-card">
      <p className="status-label">Loading workspace...</p>
    </div>
  )

  return (
    <BrowserRouter>
      <Suspense fallback={routeFallback}>
        <Routes>
          <Route path="/landing" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/" />} />
          <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />} />

          <Route
            element={
              isAuthenticated ? (
                <AppLayout
                  appState={appState}
                  onLogout={() => {
                    logout()
                    window.location.href = '/landing'
                  }}
                />
              ) : (
                <Navigate to="/landing" />
              )
            }
          >
            <Route path="/" element={<NexusPage />} />
            <Route path="/dojo" element={<DojoPage onNotify={triggerNotification} />} />
            <Route path="/laboratory" element={<LaboratoryPage onNotify={triggerNotification} />} />
            <Route path="/sandbox" element={<SandboxPage onNotify={triggerNotification} />} />
            <Route path="/world" element={<WorldPage onNotify={triggerNotification} />} />
            <Route path="/forge" element={<ForgePage onNotify={triggerNotification} />} />
            <Route path="/path" element={<PathPage onNotify={triggerNotification} />} />
            <Route
              path="/terminal"
              element={<TerminalPage appState={appState} setAppState={setAppState} onNotify={triggerNotification} />}
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
