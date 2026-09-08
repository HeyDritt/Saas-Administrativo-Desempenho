interface DemoBadgeProps {
  email?: string
}

export default function DemoBadge({ email = 'gestor@sputnik.com' }: DemoBadgeProps) {
  return (
    <div className="demo-badge">
      <span>🔒</span>
      <span>Conectado como: {email} (Read-Only)</span>
    </div>
  )
}
