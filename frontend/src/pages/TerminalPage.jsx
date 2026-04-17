import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import { realmConfig } from '../appConfig'

function estimateStorageSize() {
  let total = 0
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key).length * 2 // UTF-16
      }
    }
  } catch {}
  return total
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function getStorageKeys() {
  const keys = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('algoquest') || key?.startsWith('algo')) {
        const val = localStorage.getItem(key)
        keys.push({ key, size: val ? val.length * 2 : 0 })
      }
    }
  } catch {}
  return keys
}

export default function TerminalPage({ appState, setAppState }) {
  const realm = realmConfig.terminal
  const [backupStatus, setBackupStatus] = useState('idle')
  const [activeTab, setActiveTab] = useState('personalization')
  const [uptime, setUptime] = useState(0)
  const [confirmClear, setConfirmClear] = useState(false)
  const [storageKeys, setStorageKeys] = useState([])

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => setUptime(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setStorageKeys(getStorageKeys())
  }, [backupStatus])

  const storageUsed = useMemo(() => estimateStorageSize(), [backupStatus])

  function formatUptime(s) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h > 0 ? h + 'h ' : ''}${m}m ${sec}s`
  }

  function updateSetting(key, value) {
    setAppState((current) => ({
      ...current,
      settings: { ...current.settings, [key]: value },
    }))
  }

  function handleResetDefaults() {
    setAppState((current) => ({
      ...current,
      settings: { neonIntensity: 72, motionBlur: 24, soundVolume: 60, reducedMotion: false }
    }))
  }

  function handleBackup() {
    setBackupStatus('exporting')
    setTimeout(() => {
      const data = JSON.stringify(appState, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `algoquest-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      setBackupStatus('done')
      setTimeout(() => setBackupStatus('idle'), 2000)
    }, 800)
  }

  function handleImport(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        setAppState((current) => ({
          ...current,
          ...imported,
          settings: { ...current.settings, ...imported.settings }
        }))
        alert("AOS State Synchronized.")
      } catch (err) {
        alert("Failed to parse backup manifest.")
      }
    }
    reader.readAsText(file)
  }

  function handleClearAllData() {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 5000)
      return
    }
    const keys = Object.keys(localStorage).filter(k => k.startsWith('algoquest') || k.startsWith('algo'))
    keys.forEach(k => localStorage.removeItem(k))
    setConfirmClear(false)
    setStorageKeys([])
    alert('All AlgoQuest data cleared.')
  }

  const tabs = [
    { id: 'personalization', label: 'Personalization', icon: '◉' },
    { id: 'persistence', label: 'Data & Backup', icon: '⬡' },
    { id: 'shortcuts', label: 'Shortcuts', icon: '⌘' },
    { id: 'about', label: 'About', icon: 'ℹ' },
  ]

  const shortcuts = [
    { keys: 'Space', action: 'Play / Pause visualization' },
    { keys: '← →', action: 'Step backward / forward' },
    { keys: 'R', action: 'Reset current view' },
    { keys: 'Ctrl+S', action: 'Save current work' },
    { keys: 'Ctrl+Enter', action: 'Run code in Dojo' },
    { keys: 'Esc', action: 'Close active panel' },
    { keys: 'Tab', action: 'Cycle through sections' },
    { keys: '1-8', action: 'Quick navigate to realm' },
  ]

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="Configure your Algorithm Operating System. Personalize the interface, manage persistence, and sync your mastery data."
        accent={realm.accent}
      />

      {/* System Status Dashboard */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}
      >
        {[
          { label: 'AOS Version', value: '2.4.1', color: 'var(--emerald)', icon: '◆' },
          { label: 'Runtime', value: 'Online', color: 'var(--emerald)', icon: '●' },
          { label: 'Session', value: appState.sessionMode ?? 'guest', color: 'var(--cyan)', icon: '◎' },
          { label: 'Uptime', value: formatUptime(uptime), color: 'var(--purple)', icon: '◷' },
          { label: 'Storage', value: formatBytes(storageUsed), color: 'var(--amber)', icon: '▤' },
          { label: 'AI Status', value: appState.aiRequestState?.status ?? 'idle', color: 'var(--cyan)', icon: '◈' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass-panel"
            style={{ padding: '14px 16px', borderRadius: '14px' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              <span style={{ marginRight: '6px' }}>{stat.icon}</span>{stat.label}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
          </motion.div>
        ))}
      </motion.section>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              background: activeTab === tab.id ? 'rgba(16,185,129,0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--emerald)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--emerald)' : 'var(--muted)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'all 0.2s ease',
              borderRadius: '8px 8px 0 0'
            }}
          >
            <span style={{ marginRight: '6px' }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'personalization' && (
          <motion.section
            key="personalization"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="terminal-layout content-grid"
          >
            <article className="glass-panel content-card accent-emerald">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-emerald">Visual Settings</p>
                  <h3>Interface Config</h3>
                </div>
                <button
                  type="button"
                  className="mini-pill"
                  onClick={handleResetDefaults}
                  style={{ cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                >
                  Reset Defaults
                </button>
              </div>

              <div className="settings-stack">
                <label className="setting-control">
                  <span className="setting-header">
                    <strong>Neon Intensity</strong>
                    <small style={{ color: 'var(--cyan)' }}>{appState.settings.neonIntensity}%</small>
                  </span>
                  <input type="range" min="0" max="100" value={appState.settings.neonIntensity} onChange={(e) => updateSetting('neonIntensity', Number(e.target.value))} />
                  <div style={{ height: '4px', borderRadius: '2px', marginTop: '4px', background: `linear-gradient(90deg, var(--cyan) ${appState.settings.neonIntensity}%, rgba(255,255,255,0.1) ${appState.settings.neonIntensity}%)` }} />
                </label>

                <label className="setting-control">
                  <span className="setting-header">
                    <strong>Motion Blur</strong>
                    <small style={{ color: 'var(--purple)' }}>{appState.settings.motionBlur}px</small>
                  </span>
                  <input type="range" min="0" max="80" value={appState.settings.motionBlur} onChange={(e) => updateSetting('motionBlur', Number(e.target.value))} />
                  <div style={{ height: '4px', borderRadius: '2px', marginTop: '4px', background: `linear-gradient(90deg, var(--purple) ${(appState.settings.motionBlur / 80) * 100}%, rgba(255,255,255,0.1) ${(appState.settings.motionBlur / 80) * 100}%)` }} />
                </label>

                <label className="setting-control">
                  <span className="setting-header">
                    <strong>Audio Volume</strong>
                    <small style={{ color: 'var(--amber)' }}>{appState.settings.soundVolume}%</small>
                  </span>
                  <input type="range" min="0" max="100" value={appState.settings.soundVolume} onChange={(e) => updateSetting('soundVolume', Number(e.target.value))} />
                  <div style={{ height: '4px', borderRadius: '2px', marginTop: '4px', background: `linear-gradient(90deg, var(--amber) ${appState.settings.soundVolume}%, rgba(255,255,255,0.1) ${appState.settings.soundVolume}%)` }} />
                </label>

                <label className="toggle-control">
                  <span>
                    <strong>Reduced Motion</strong>
                    <small>Disables complex animations and spring physics.</small>
                  </span>
                  <input type="checkbox" className="toggle-input" checked={appState.settings.reducedMotion} onChange={(e) => updateSetting('reducedMotion', e.target.checked)} />
                </label>
              </div>
            </article>

            <article className="glass-panel content-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-purple">Notification Settings</p>
                  <h3>Alert Config</h3>
                </div>
              </div>
              <div className="settings-stack">
                {[
                  { key: 'showSuccess', label: 'Success Notifications', desc: 'Show toast on successful code runs and saves.' },
                  { key: 'showErrors', label: 'Error Notifications', desc: 'Show toast on runtime errors and failures.' },
                  { key: 'soundEffects', label: 'Sound Effects', desc: 'Play audio feedback on interactions.' },
                  { key: 'aiSuggestions', label: 'AI Auto-Suggestions', desc: 'Show AI hints during coding sessions.' },
                ].map(item => (
                  <label key={item.key} className="toggle-control">
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.desc}</small>
                    </span>
                    <input
                      type="checkbox"
                      className="toggle-input"
                      checked={appState.settings[item.key] !== false}
                      onChange={(e) => updateSetting(item.key, e.target.checked)}
                    />
                  </label>
                ))}
              </div>
            </article>
          </motion.section>
        )}

        {activeTab === 'persistence' && (
          <motion.section
            key="persistence"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="terminal-layout content-grid"
          >
            <article className="glass-panel content-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-cyan">AOS Persistence</p>
                  <h3>Cloud & Backup</h3>
                </div>
              </div>
              <p className="status-copy">
                AlgoQuest is currently running in <strong>Guest Mode</strong>. All progress is saved locally to your device.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Storage Used</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--cyan)' }}>{formatBytes(storageUsed)}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Keys Tracked</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--purple)' }}>{storageKeys.length}</div>
                </div>
              </div>

              <div className="backup-actions transport-row">
                <button type="button" className="action-button action-button-primary" onClick={handleBackup} disabled={backupStatus === 'exporting'}>
                  {backupStatus === 'exporting' ? '⏳ Exporting...' : backupStatus === 'done' ? '✓ Success' : '↓ Export Guest Data'}
                </button>
                <button type="button" className="action-button" onClick={() => document.getElementById('import-input').click()}>
                  ↑ Import Backup
                </button>
                <input id="import-input" type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
              </div>

              <div className="terminal-sync-notice" style={{ marginTop: '20px' }}>
                <p className="group-label">Upcoming Features</p>
                <ul className="mini-list">
                  <li>End-to-end encrypted cloud sync</li>
                  <li>Mastery profile verification</li>
                  <li>Cross-device session handoff</li>
                </ul>
              </div>
            </article>

            <article className="glass-panel content-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-amber">Data Management</p>
                  <h3>Storage Inspector</h3>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                {storageKeys.length === 0 && <p className="status-copy">No AlgoQuest data found in localStorage.</p>}
                {storageKeys.map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.85rem' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '12px' }}>
                      <span style={{ color: 'var(--text)' }}>{item.key}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{formatBytes(item.size)}</span>
                      <button
                        onClick={() => { localStorage.removeItem(item.key); setStorageKeys(getStorageKeys()) }}
                        style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleClearAllData}
                style={{
                  marginTop: '16px', width: '100%', padding: '12px',
                  background: confirmClear ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {confirmClear ? 'Confirm: Clear All AlgoQuest Data' : 'Clear All Data'}
              </button>
            </article>
          </motion.section>
        )}

        {activeTab === 'shortcuts' && (
          <motion.section
            key="shortcuts"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <article className="glass-panel content-card" style={{ maxWidth: '600px' }}>
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-cyan">Keyboard Reference</p>
                  <h3>Shortcuts</h3>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                {shortcuts.map(s => (
                  <div key={s.keys} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--cyan)', background: 'rgba(0,242,255,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(0,242,255,0.15)' }}>{s.keys}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{s.action}</span>
                  </div>
                ))}
              </div>
            </article>
          </motion.section>
        )}

        {activeTab === 'about' && (
          <motion.section
            key="about"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="terminal-layout content-grid"
          >
            <article className="glass-panel content-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-emerald">System</p>
                  <h3>About AlgoQuest</h3>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
                {[
                  { label: 'Project', value: 'AlgoQuest - Algorithm Operating System' },
                  { label: 'Version', value: '2.4.1' },
                  { label: 'Build', value: 'Production' },
                  { label: 'Frontend', value: 'React + Vite + Framer Motion' },
                  { label: 'Backend', value: 'FastAPI + SQLite + Supabase' },
                  { label: 'Runtime', value: 'Pyodide (WebAssembly Python)' },
                  { label: 'Visualization', value: 'HTML5 Canvas + SVG + ReactFlow' },
                  { label: 'AI Engine', value: 'Gemini API (Critique Loop)' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{item.label}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-panel content-card">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-purple">Ecosystem</p>
                  <h3>The Eight Realms</h3>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                {[
                  { name: 'Nexus', desc: 'Central dashboard and quest continuity', color: 'var(--cyan)' },
                  { name: 'Dojo', desc: 'Foundational Python mastery', color: 'var(--amber)' },
                  { name: 'Laboratory', desc: 'Algorithm visualization engine', color: 'var(--cyan)' },
                  { name: 'Sandbox', desc: 'Experimental chaos and simulation', color: 'var(--purple)' },
                  { name: 'World', desc: 'Real-world project building', color: 'var(--emerald)' },
                  { name: 'Forge', desc: 'Creative output and challenges', color: 'var(--amber)' },
                  { name: 'Path', desc: 'Analytics and mastery tracking', color: 'var(--purple)' },
                  { name: 'Terminal', desc: 'System configuration', color: 'var(--emerald)' },
                ].map(r => (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: r.color }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
