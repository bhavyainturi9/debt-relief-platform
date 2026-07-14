export default function StatCard({ label, value, critical = false }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className={`value ${critical ? 'critical' : ''}`}>{value}</div>
    </div>
  )
}
