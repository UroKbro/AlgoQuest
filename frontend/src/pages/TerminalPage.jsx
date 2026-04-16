import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { realmConfig } from '../appConfig'

export default function TerminalPage({ appState, setAppState }) {
  const realm = realmConfig.terminal
  const [backupStatus, setBackupStatus] = useState('idle')

  function updateSetting(key, value) {
    setAppState((current) => ({
      ...current,
      settings: { ...current.settings, [key]: value },
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
          // ensure settings are applied
          settings: { ...current.settings, ...imported.settings }
        }))
        alert("AOS State Synchronized.")
      } catch (err) {
        alert("Failed to parse backup manifest.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="Configure your Algorithm Operating System. Personalize the interface, manage guest persistence, and sync your mastery data."
        accent={realm.accent}
      />

      <section className="terminal-layout content-grid">
        <article className="glass-panel content-card accent-emerald">
          <div className="panel-heading">
            <div>
              <p className="card-tag text-emerald">Personalization</p>
              <h3>Interface Config</h3>
            </div>
            <span className="mini-pill">Real-time Reactive</span>
          </div>

          <div className="settings-stack">
            <label className="setting-control">
              <span className="setting-header">
                <strong>Neon Intensity</strong>
                <small>{appState.settings.neonIntensity}%</small>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={appState.settings.neonIntensity}
                onChange={(e) => updateSetting('neonIntensity', Number(e.target.value))}
              />
            </label>

            <label className="setting-control">
              <span className="setting-header">
                <strong>Motion Blur</strong>
                <small>{appState.settings.motionBlur}px</small>
              </span>
              <input
                type="range"
                min="0"
                max="80"
                value={appState.settings.motionBlur}
                onChange={(e) => updateSetting('motionBlur', Number(e.target.value))}
              />
            </label>

            <label className="setting-control">
              <span className="setting-header">
                <strong>Audio Volume</strong>
                <small>{appState.settings.soundVolume}%</small>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={appState.settings.soundVolume}
                onChange={(e) => updateSetting('soundVolume', Number(e.target.value))}
              />
            </label>

            <label className="toggle-control">
              <span>
                <strong>Reduced Motion</strong>
                <small>Disables complex animations and spring physics.</small>
              </span>
              <input
                type="checkbox"
                className="toggle-input"
                checked={appState.settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
              />
            </label>
          </div>
        </article>

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

          <div className="backup-actions transport-row">
            <button
              type="button"
              className="action-button action-button-primary"
              onClick={handleBackup}
              disabled={backupStatus === 'exporting'}
            >
              {backupStatus === 'exporting' ? 'Exporting...' : backupStatus === 'done' ? 'Success' : 'Export Guest Data'}
            </button>
            <button 
                type="button" 
                className="action-button" 
                onClick={() => document.getElementById('import-input').click()}
            >
              Import Backup
            </button>
            <input 
                id="import-input" 
                type="file" 
                accept=".json" 
                style={{ display: 'none' }} 
                onChange={handleImport} 
            />
          </div>

          <div className="terminal-sync-notice">
            <p className="group-label">Upcoming Features</p>
            <ul className="mini-list">
              <li>End-to-end encrypted cloud sync</li>
              <li>Mastery profile verification</li>
              <li>Cross-device session handoff</li>
            </ul>
          </div>
        </article>
      </section>
    </>
  )
}
