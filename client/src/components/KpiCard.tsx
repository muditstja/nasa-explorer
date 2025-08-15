type KpiInterface = { title: string; value: string | number; sub?: string; error?: string; icon?: string };

export default function KpiCard({ title, value, sub, error, icon }: KpiInterface) {
  return (
    <div className="kpi-card">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {error && <div className="kpi-error">Error: {error}</div>}
      {icon && <div className="kpi-icon" aria-hidden="true">{icon}</div>}
    </div>
  )
}