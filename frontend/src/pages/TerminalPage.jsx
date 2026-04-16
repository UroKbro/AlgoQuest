import PageHeader from '../components/PageHeader'

function SettingSlider({ label, value, min = 0, max = 100, onChange }) {
  return (
    <label className="setting-control">
      <span className="setting-header">
        <strong>{label}</strong>
        <small>{value}</small>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={onChange} />
    </label>
  )
}

export default function TerminalPage({ appState, setAppState }) {
  const settings = appState.settings

  function updateSettings(patch) {
    setAppState((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }))
  }

  return (
    <>
      <PageHeader
        eyebrow="Control Center"
        title="Terminal"
        description="Guest settings persist locally and update the shell in real time."
        accent="emerald"
      />

      <section className="content-grid">
        <article className="glass-panel content-card">
          <h3>Personalization</h3>
          <div className="settings-stack">
            <SettingSlider
              label="Neon Intensity"
              value={settings.neonIntensity}
              onChange={(event) => updateSettings({ neonIntensity: Number(event.target.value) })}
            />
            <SettingSlider
              label="Sound Volume"
              value={settings.soundVolume}
              onChange={(event) => updateSettings({ soundVolume: Number(event.target.value) })}
            />
            <SettingSlider
              label="Motion Blur"
              value={settings.motionBlur}
              max={36}
              onChange={(event) => updateSettings({ motionBlur: Number(event.target.value) })}
            />
            <label className="toggle-control">
              <span>
                <strong>Reduced Motion</strong>
                <small>Overrides animated transitions inside the shell.</small>
              </span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(event) => updateSettings({ reducedMotion: event.target.checked })}
              />
            </label>
          </div>
        </article>

        <article className="glass-panel content-card muted-card">
          <h3>Session Snapshot</h3>
          <p>Mode: {appState.sessionMode}</p>
          <p>Notifications queued: {appState.notifications.length}</p>
          <p>Tracked lesson progress entries: {appState.progress.lessons.length}</p>
          <p>AI request state: {appState.aiRequestState.status}</p>
        </article>
      </section>
    </>
  )
}
