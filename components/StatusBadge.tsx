import { getStatusBadgeClass } from '@/lib/formatters'

interface StatusBadgeProps {
  status: string
  percentual?: number
}

export default function StatusBadge({ status, percentual }: StatusBadgeProps) {
  const badgeClass = getStatusBadgeClass(status)

  const emoji =
    status === 'Superada' ? '🚀' :
    status === 'Atingida' ? '✅' : '⚠️'

  return (
    <span className={`badge ${badgeClass}`}>
      {emoji}{' '}
      {percentual !== undefined ? `${percentual.toFixed(0)}% — ` : ''}
      {status}
    </span>
  )
}
