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

    setAppState((current) => ({
      ...current,
      settings: storedSettings,
    }))
  }, [])

  useEffect(() => {
    localStorage.setItem(settingsStorageKey, JSON.stringify(appState.settings))
    applySettingsToDocument(appState.settings)
  }, [appState.settings])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout appState={appState} />}>
          <Route path="/" element={<NexusPage />} />
          <Route path="/dojo" element={<DojoPage />} />
          <Route path="/laboratory" element={<LaboratoryPage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
          <Route path="/world" element={<WorldPage />} />
          <Route path="/forge" element={<ForgePage />} />
          <Route path="/path" element={<PathPage />} />
          <Route path="/terminal" element={<TerminalPage appState={appState} setAppState={setAppState} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
