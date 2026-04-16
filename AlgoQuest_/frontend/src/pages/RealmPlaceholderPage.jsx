import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'

export default function RealmPlaceholderPage({ slug }) {
  const realm = realmConfig[slug]

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description={realm.description}
        accent={realm.accent}
      />
      <section className="content-grid">
        <article className="glass-panel content-card">
          <h3>Build Status</h3>
          <p>
            This realm now has a real route inside the shared shell. The next pass can replace this
            placeholder with the feature-specific interaction loop.
          </p>
        </article>
        <article className="glass-panel content-card muted-card">
          <h3>Next Hook</h3>
          <p>
            Shared layout, app config, and route-level loading states are in place so page delivery
            can happen incrementally.
          </p>
        </article>
      </section>
    </>
  )
}
