export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-secondary mb-1.5">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-btn bg-transparent border ${error ? 'border-red-500' : 'border-app'} text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  )
}
