'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { formatBRL } from '@/lib/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

interface IndividualChartProps {
  labels: string[]
  valores: number[]
  meta: number
  nome: string
}

export default function IndividualChart({ labels, valores, meta, nome }: IndividualChartProps) {
  // Gerar linha de meta progressiva (proporcional ao número de semanas)
  const metaProgressiva = labels.map((_, i) =>
    Math.round((meta / labels.length) * (i + 1))
  )

  const data = {
    labels,
    datasets: [
      {
        label: `Realizado — ${nome}`,
        data: valores,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#0D1117',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Meta Progressiva',
        data: metaProgressiva,
        borderColor: '#6366F1',
        borderDash: [6, 4],
        backgroundColor: 'transparent',
        tension: 0.4,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#0D1117',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#8B949E',
          font: { family: "'Inter', sans-serif", size: 12 },
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#161B22',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#F0F6FC',
        bodyColor: '#8B949E',
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${formatBRL(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8B949E', font: { family: "'Inter', sans-serif", size: 12 } },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#8B949E',
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          callback: (v: any) => `R$ ${(v / 1000).toFixed(0)}k`,
        },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  }

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  )
}
