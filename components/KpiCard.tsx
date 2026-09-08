'use client'

import { formatBRL, formatPercent } from '@/lib/formatters'

interface KpiCardProps {
  title: string
  value: string | number
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
  isMono?: boolean
  icon?: string
}

export default function KpiCard({
  title,
  value,
  trend,
  trendType = 'positive',
  isMono = true,
  icon,
}: KpiCardProps) {
  const trendColor =
    trendType === 'positive'
      ? 'var(--accent-green)'
      : trendType === 'negative'
      ? 'var(--accent-red)'
      : 'var(--text-muted)'

  return (
    <div className="card animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{title}</p>
        {icon && (
          <span style={{
            fontSize: '1.2rem',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {icon}
          </span>
        )}
      </div>
      <p style={{
        fontFamily: isMono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
        fontSize: '1.9rem',
        fontWeight: 700,
        color: 'var(--text-main)',
        lineHeight: 1.1,
      }}>
        {typeof value === 'number' ? formatBRL(value) : value}
      </p>
      {trend && (
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: trendColor }}>
          {trend}
        </p>
      )}
    </div>
  )
}
