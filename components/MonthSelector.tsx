'use client'

import { CicloData, HISTORICO } from '@/lib/mockHistory'

interface MonthSelectorProps {
  selected: string[]          // ciclos selecionados (1 ou 2)
  compareMode: boolean
  onSelect: (ciclo: string) => void
  onToggleCompare: () => void
}

export default function MonthSelector({
  selected,
  compareMode,
  onSelect,
  onToggleCompare,
}: MonthSelectorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      {/* Label */}
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginRight: '4px' }}>
        Ciclo:
      </span>

      {/* Pills de mês */}
      {HISTORICO.map((h) => {
        const isSelected = selected.includes(h.ciclo)
        const isPrimary = selected[0] === h.ciclo
        const isSecondary = selected[1] === h.ciclo
        const isDisabled = compareMode && selected.length === 2 && !isSelected

        return (
          <button
            key={h.ciclo}
            id={`month-pill-${h.ciclo}`}
            onClick={() => !isDisabled && onSelect(h.ciclo)}
            disabled={isDisabled}
            title={compareMode && isSecondary ? 'Comparar com este mês' : h.label}
            style={{
              padding: '5px 12px',
              borderRadius: '99px',
              fontSize: '0.78rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              border: '1px solid',
              transition: 'all 0.2s ease',
              opacity: isDisabled ? 0.35 : 1,
              // Cores baseadas no estado
              ...(isPrimary
                ? {
                    background: 'var(--accent-indigo)',
                    borderColor: 'var(--accent-indigo)',
                    color: '#fff',
                    boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                  }
                : isSecondary
                ? {
                    background: 'rgba(16,185,129,0.15)',
                    borderColor: 'var(--accent-green)',
                    color: 'var(--accent-green)',
                    boxShadow: '0 0 12px rgba(16,185,129,0.25)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)',
                  }),
            }}
          >
            {h.label}
            {isPrimary && compareMode && (
              <span style={{ marginLeft: '4px', opacity: 0.8, fontSize: '0.7rem' }}>A</span>
            )}
            {isSecondary && (
              <span style={{ marginLeft: '4px', opacity: 0.8, fontSize: '0.7rem' }}>B</span>
            )}
          </button>
        )
      })}

      {/* Separador */}
      <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 4px' }} />

      {/* Botão comparar */}
      <button
        id="btn-compare-toggle"
        onClick={onToggleCompare}
        style={{
          padding: '5px 12px',
          borderRadius: '99px',
          fontSize: '0.78rem',
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
          border: '1px solid',
          transition: 'all 0.2s ease',
          ...(compareMode
            ? {
                background: 'rgba(245,158,11,0.15)',
                borderColor: 'var(--accent-yellow)',
                color: 'var(--accent-yellow)',
              }
            : {
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)',
              }),
        }}
      >
        {compareMode ? '✕ Sair da comparação' : '⇌ Comparar meses'}
      </button>
    </div>
  )
}
