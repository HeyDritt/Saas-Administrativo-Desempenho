'use client'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { formatBRL } from '@/lib/formatters'

ChartJS.register(ArcElement, Tooltip, Legend)

interface PieChartProps {
  labels: string[]
  values: number[]
  title?: string
}

// Paleta de cores premium para cada vendedor
const COLORS = [
  { border: '#6366F1', bg: 'rgba(99, 102, 241, 0.75)' },   // indigo
  { border: '#10B981', bg: 'rgba(16, 185, 129, 0.75)' },   // green
  { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.75)' },   // amber
  { border: '#EC4899', bg: 'rgba(236, 72, 153, 0.75)' },   // pink
  { border: '#06B6D4', bg: 'rgba(6, 182, 212, 0.75)' },    // cyan
  { border: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.75)' },   // violet
]

export default function PieChart({ labels, values, title }: PieChartProps) {
  const total = values.reduce((a, b) => a + b, 0)

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: COLORS.map((c) => c.bg),
        borderColor: COLORS.map((c) => c.border),
        borderWidth: 2,
        hoverOffset: 10,
        hoverBorderWidth: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          color: '#8B949E',
          font: { family: "'Inter', sans-serif", size: 11 },
          usePointStyle: true,
          pointStyleWidth: 10,
          padding: 14,
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets
            return chart.data.labels.map((label: string, i: number) => {
              const value = datasets[0].data[i]
              const pct = ((value / total) * 100).toFixed(1)
              return {
                text: `${label.split(' ')[0]}  ${pct}%`,
                fillStyle: datasets[0].backgroundColor[i],
                strokeStyle: datasets[0].borderColor[i],
                lineWidth: 2,
                pointStyle: 'circle',
                index: i,
              }
            })
          },
        },
      },
      tooltip: {
        backgroundColor: '#161B22',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#F0F6FC',
        bodyColor: '#8B949E',
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed
            const pct = ((val / total) * 100).toFixed(1)
            return `  ${formatBRL(val)}  (${pct}%)`
          },
        },
      },
    },
  }

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  )
}
