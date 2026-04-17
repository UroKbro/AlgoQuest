import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppLayout from './components/AppLayout'
import DojoPage from './pages/DojoPage'
import LaboratoryPage from './pages/LaboratoryPage'
import NexusPage from './pages/NexusPage'
import NotFoundPage from './pages/NotFoundPage'
import RealmPlaceholderPage from './pages/RealmPlaceholderPage'
import TerminalPage from './pages/TerminalPage'
import SandboxPage from './pages/SandboxPage'
import WorldPage from './pages/WorldPage'
import ForgePage from './pages/ForgePage'
import PathPage from './pages/PathPage'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import { fetchSettings, updateSettings, fetchNotifications } from './api'

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
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

    const profileId = isAuthenticated ? 'me' : 'guest'
    
    fetchSettings(profileId)
      .then(backendSettings => {
        setAppState(current => ({
          ...current,
          settings: { ...current.settings, ...backendSettings }
        }))
        if (isAuthenticated) {
          triggerNotification('Identity Verified', 'Neural link established. cloud sync active.', 'success')
        }
      })
      .catch(err => {
          console.warn("Backend sync failed.", err)
          if (isAuthenticated) {
            triggerNotification('Sync Interruption', 'Cloud storage unreachable. Reverting to local cache.', 'warning')
          }
      })
  }, [isAuthenticated])

  useEffect(() => {
    localStorage.setItem(settingsStorageKey, JSON.stringify(appState.settings))
    applySettingsToDocument(appState.settings)
    
    const profileId = isAuthenticated ? 'me' : 'guest'
    updateSettings(appState.settings, profileId).catch(() => {})
  }, [appState.settings, isAuthenticated])

  function triggerNotification(title, message, type = 'info') {
    const id = Date.now()
    setAppState(current => ({
      ...current,
      notifications: [...current.notifications, { id, title, message, type }]
    }))
    setTimeout(() => {
      setAppState(current => ({
        ...current,
        notifications: current.notifications.filter(n => n.id !== id)
      }))
    }, 5000)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/" />} />
        <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />} />

        {/* Protected Application Shell */}
        <Route element={isAuthenticated ? <AppLayout appState={appState} /> : <Navigate to="/landing" />}>
          <Route path="/" element={<NexusPage />} />
          <Route path="/dojo" element={<DojoPage onNotify={triggerNotification} />} />
          <Route path="/laboratory" element={<LaboratoryPage onNotify={triggerNotification} />} />
          <Route path="/sandbox" element={<SandboxPage onNotify={triggerNotification} />} />
          <Route path="/world" element={<WorldPage onNotify={triggerNotification} />} />
          <Route path="/forge" element={<ForgePage onNotify={triggerNotification} />} />
          <Route path="/path" element={<PathPage onNotify={triggerNotification} />} />
          <Route path="/terminal" element={<TerminalPage appState={appState} setAppState={setAppState} onNotify={triggerNotification} />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
