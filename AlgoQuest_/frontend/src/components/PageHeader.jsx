export default function PageHeader({ eyebrow, title, description, accent }) {
  return (
    <section className={`hero-card glass-panel accent-${accent}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="hero-copy">{description}</p>
    </section>
  )
}
