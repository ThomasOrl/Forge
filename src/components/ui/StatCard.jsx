export default function StatCard({ label, value, unit, icon }) {
  return (
    <div className="card p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-secondary">{label}</span>
        {icon && <span className="text-secondary">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-primary">
        {value}
        {unit && <span className="text-base font-medium text-secondary ml-1">{unit}</span>}
      </div>
    </div>
  )
}
