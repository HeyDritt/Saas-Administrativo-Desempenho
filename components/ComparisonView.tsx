'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { CicloData, getTotalFaturamento, getTotalComissoes, getTopPerformer } from '@/lib/mockHistory'
import { formatBRL, formatPercent } from '@/lib/formatters'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler)
ChartJS.defaults.color = '#F0F6FC'
ChartJS.defaults.borderColor = 'rgba(255,255,255,0.08)'

interface ComparisonViewProps {
  cicloA: CicloData
  cicloB: CicloData
}

function Delta({ a, b, format = 'brl' }: { a: number; b: number; format?: 'brl' | 'pct' }) {
  const diff = b - a
  const pct = a !== 0 ? ((diff / a) * 100).toFixed(1) : '0'
  const isUp = diff > 0
  const isZero = diff === 0
  const color = isZero ? 'var(--text-muted)' : isUp ? 'var(--accent-green)' : 'var(--accent-red)'
  const arrow = isZero ? '→' : isUp ? '↑' : '↓'
  const absVal = Math.abs(diff)
  const label = format === 'brl' ? formatBRL(absVal) : `${Math.abs(Number(pct))}%`

  return (
    <span style={{ fontSize: '0.8rem', fontWeight: 600, color, display: 'flex', alignItems: 'center', gap: '3px' }}>
      {arrow} {label}
      {format === 'brl' && (
        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({isUp ? '+' : isZero ? '' : '-'}{pct}%)</span>
      )}
    </span>
  )
}

function KpiCompareCard({
  title,
  valueA,
  valueB,
  labelA,
  labelB,
  format = 'brl',
  icon,
}: {
  title: string
  valueA: number | string
  valueB: number | string
  labelA: string
  labelB: string
  format?: 'brl' | 'pct' | 'text'
  icon: string
}) {
  const numA = typeof valueA === 'number' ? valueA : 0
  const numB = typeof valueB === 'number' ? valueB : 0

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: '8px',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </span>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{title}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Mês A */}
        <div style={{ padding: '10px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--accent-indigo)', fontWeight: 600, marginBottom: '4px' }}>
            {labelA} <span style={{ opacity: 0.7 }}>(A)</span>
          </p>
          <p style={{
            fontFamily: format !== 'text' ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)',
          }}>
            {format === 'brl' ? formatBRL(numA) : format === 'pct' ? formatPercent(numA) : valueA}
          </p>
        </div>

        {/* Mês B */}
        <div style={{ padding: '10px', background: 'rgba(16,185,129,0.06)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 600, marginBottom: '4px' }}>
            {labelB} <span style={{ opacity: 0.7 }}>(B)</span>
          </p>
          <p style={{
            fontFamily: format !== 'text' ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)',
          }}>
            {format === 'brl' ? formatBRL(numB) : format === 'pct' ? formatPercent(numB) : valueB}
          </p>
        </div>
      </div>

      {format !== 'text' && (
        <div style={{ paddingTop: '4px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Variação A→B: </span>
          <Delta a={numA} b={numB} format={format} />
        </div>
      )}
    </div>
  )
}

export default function ComparisonView({ cicloA, cicloB }: ComparisonViewProps) {
  const totalA = getTotalFaturamento(cicloA)
  const totalB = getTotalFaturamento(cicloB)
  const comissaoA = getTotalComissoes(cicloA)
  const comissaoB = getTotalComissoes(cicloB)
  const topA = getTopPerformer(cicloA)
  const topB = getTopPerformer(cicloB)
  const taxaA = (comissaoA / totalA) * 100
  const taxaB = (comissaoB / totalB) * 100

  const nomes = cicloA.funcionarios.map(f => f.nome.split(' ')[0])

  // Dados para o gráfico de barras comparativo
  const barData = {
    labels: nomes,
    datasets: [
      {
        label: cicloA.label,
        data: cicloA.funcionarios.map(f => f.faturamento_realizado),
        backgroundColor: 'rgba(99,102,241,0.7)',
        borderColor: '#6366F1',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: cicloB.label,
        data: cicloB.funcionarios.map(f => f.faturamento_realizado),
        backgroundColor: 'rgba(16,185,129,0.7)',
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#F0F6FC', font: { family: "'Inter', sans-serif", size: 12 },
          usePointStyle: true, pointStyleWidth: 8, padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
        titleColor: '#F0F6FC', bodyColor: '#8B949E',
        callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${formatBRL(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8B949E' }, border: { color: 'rgba(255,255,255,0.08)' } },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8B949E', font: { family: "'JetBrains Mono', monospace", size: 10 }, callback: (v: any) => `R$ ${(v/1000).toFixed(0)}k` },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  }

  // Dados para o gráfico de linha (total acumulado por semana — A vs B)
  const semLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  const totalSemanalA = semLabels.map((_, i) =>
    cicloA.funcionarios.reduce((acc, f) => acc + (f.semanal[i] ?? 0), 0)
  )
  const totalSemanalB = semLabels.map((_, i) =>
    cicloB.funcionarios.reduce((acc, f) => acc + (f.semanal[i] ?? 0), 0)
  )

  const lineData = {
    labels: semLabels,
    datasets: [
      {
        label: cicloA.label,
        data: totalSemanalA,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#6366F1', pointBorderColor: '#0D1117',
        pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7,
      },
      {
        label: cicloB.label,
        data: totalSemanalB,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.06)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#10B981', pointBorderColor: '#0D1117',
        pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#F0F6FC', font: { family: "'Inter', sans-serif", size: 12 },
          usePointStyle: true, pointStyleWidth: 8, padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
        titleColor: '#F0F6FC', bodyColor: '#8B949E',
        callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${formatBRL(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8B949E' }, border: { color: 'rgba(255,255,255,0.08)' } },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8B949E', font: { family: "'JetBrains Mono', monospace", size: 10 }, callback: (v: any) => `R$ ${(v/1000).toFixed(0)}k` },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeInUp 0.4s ease' }}>

      {/* Banner comparativo */}
      <div style={{
        padding: '14px 20px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.08))',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ fontSize: '1.1rem' }}>⇌</span>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
          Comparando{' '}
          <strong style={{ color: 'var(--accent-indigo)' }}>{cicloA.label} (A)</strong>
          {' '}com{' '}
          <strong style={{ color: 'var(--accent-green)' }}>{cicloB.label} (B)</strong>
        </p>
      </div>

      {/* KPIs comparativos */}
      <div className="kpi-grid">
        <KpiCompareCard
          title="Faturamento Total"
          valueA={totalA} valueB={totalB}
          labelA={cicloA.label} labelB={cicloB.label}
          icon="💰"
        />
        <KpiCompareCard
          title="Comissões Projetadas"
          valueA={comissaoA} valueB={comissaoB}
          labelA={cicloA.label} labelB={cicloB.label}
          icon="🏆"
        />
        <KpiCompareCard
          title="Taxa Média de Comissão"
          valueA={taxaA} valueB={taxaB}
          labelA={cicloA.label} labelB={cicloB.label}
          format="pct"
          icon="📊"
        />
      </div>

      {/* Gráficos lado a lado */}
      <div className="charts-grid">
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>
            Faturamento por Vendedor — {cicloA.label} vs {cicloB.label}
          </h3>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>
            Progressão Semanal — Total da Equipe
          </h3>
          <div className="chart-container">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* Tabela de atingimento lado a lado */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>
          Desempenho Individual — {cicloA.label} vs {cicloB.label}
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th style={{ color: 'var(--accent-indigo)' }}>{cicloA.label} (A)</th>
                <th style={{ color: 'var(--accent-green)' }}>{cicloB.label} (B)</th>
                <th>Variação</th>
                <th>Status A</th>
                <th>Status B</th>
              </tr>
            </thead>
            <tbody>
              {cicloA.funcionarios.map((fA, i) => {
                const fB = cicloB.funcionarios[i]
                const diff = fB.faturamento_realizado - fA.faturamento_realizado
                const isUp = diff > 0
                const pct = ((diff / fA.faturamento_realizado) * 100).toFixed(1)

                const statusColor = (s: string) =>
                  s === 'Superada' ? 'var(--accent-green)' :
                  s === 'Atingida' ? 'var(--accent-indigo)' : 'var(--accent-red)'

                const statusBg = (s: string) =>
                  s === 'Superada' ? 'rgba(16,185,129,0.12)' :
                  s === 'Atingida' ? 'rgba(99,102,241,0.12)' : 'rgba(239,68,68,0.12)'

                return (
                  <tr key={fA.funcionario_id}>
                    <td style={{ fontWeight: 500 }}>{fA.nome}</td>
                    <td className="col-num" style={{ color: 'var(--accent-indigo)' }}>
                      {formatBRL(fA.faturamento_realizado)}
                    </td>
                    <td className="col-num" style={{ color: 'var(--accent-green)' }}>
                      {formatBRL(fB.faturamento_realizado)}
                    </td>
                    <td className="col-num" style={{ color: isUp ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                      {isUp ? '↑' : '↓'} {formatBRL(Math.abs(diff))}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>
                        ({isUp ? '+' : ''}{pct}%)
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: statusBg(fA.status_meta), color: statusColor(fA.status_meta), border: 'none' }}>
                        {fA.percentual_atingimento.toFixed(0)}% — {fA.status_meta}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: statusBg(fB.status_meta), color: statusColor(fB.status_meta), border: 'none' }}>
                        {fB.percentual_atingimento.toFixed(0)}% — {fB.status_meta}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
