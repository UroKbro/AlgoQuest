import { NavLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="glass-panel status-card error-card">
      <p className="status-label">Route not found</p>
      <p className="status-copy">This realm does not exist yet.</p>
      <NavLink to="/" className="inline-link">
        Return to Nexus
      </NavLink>
    </section>
  )
}
