import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
import { fetchSettings, updateSettings } from './api'

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

    if (!raw) {
      return defaultSettings
    }

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
  const [appState, setAppState] = useState(() => ({
    sessionMode: 'guest',
    settings: defaultSettings,
    progress: { lessons: [] },
    notifications: [],
    aiRequestState: { status: 'idle' },
  }))

  useEffect(() => {
    const storedSettings = readStoredSettings()
    
    // Initial sync from local storage
    setAppState((current) => ({
      ...current,
      settings: storedSettings,
    }))

    // Try to fetch from backend
    fetchSettings('guest')
      .then(backendSettings => {
        setAppState(current => ({
          ...current,
          settings: { ...current.settings, ...backendSettings }
        }))
        triggerNotification('System Online', 'Mastery data synchronized with backend.', 'success')
      })
      .catch(err => {
          console.warn("Backend sync failed, using guest mode local storage.", err)
          triggerNotification('Guest Mode', 'Local persistence active. Cloud sync unavailable.', 'warning')
      })
  }, [])

  useEffect(() => {
    localStorage.setItem(settingsStorageKey, JSON.stringify(appState.settings))
    applySettingsToDocument(appState.settings)
    
    // Throttle / Debounce this in production, but for now just push
    updateSettings(appState.settings, 'guest').catch(() => {})
  }, [appState.settings])

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
        <Route element={<AppLayout appState={appState} />}>
          <Route path="/" element={<NexusPage />} />
          <Route path="/dojo" element={<DojoPage onNotify={triggerNotification} />} />
          <Route path="/laboratory" element={<LaboratoryPage onNotify={triggerNotification} />} />
          <Route path="/sandbox" element={<SandboxPage onNotify={triggerNotification} />} />
          <Route path="/world" element={<WorldPage onNotify={triggerNotification} />} />
          <Route path="/forge" element={<ForgePage onNotify={triggerNotification} />} />
          <Route path="/path" element={<PathPage onNotify={triggerNotification} />} />
          <Route path="/terminal" element={<TerminalPage appState={appState} setAppState={setAppState} onNotify={triggerNotification} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
