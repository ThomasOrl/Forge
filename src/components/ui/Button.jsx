export default function Button({
  children, variant = 'primary', size = 'md', className = '', icon, ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-btn transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  }
  const variants = {
    primary: 'bg-accent text-black hover:bg-accent-hover',
    secondary: 'bg-transparent border border-app text-primary hover:bg-dark-cardAlt',
    ghost: 'bg-transparent text-secondary hover:text-primary',
    danger: 'bg-transparent border border-red-900 text-red-400 hover:bg-red-950',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  )
}
