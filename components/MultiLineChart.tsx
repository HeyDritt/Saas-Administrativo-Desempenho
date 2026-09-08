'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { formatBRL } from '@/lib/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface FuncionarioSemanal {
  nome: string
  valores: number[]
}

interface MultiLineChartProps {
  labels: string[]
  funcionarios: FuncionarioSemanal[]
  totalGlobal: number[]
}

// Paleta de cores por funcionário (mesma do PieChart para consistência)
const PALETTE = [
  { line: '#6366F1', fill: 'rgba(99, 102, 241, 0.06)' },
  { line: '#10B981', fill: 'rgba(16, 185, 129, 0.06)' },
  { line: '#F59E0B', fill: 'rgba(245, 158, 11, 0.06)' },
  { line: '#EC4899', fill: 'rgba(236, 72, 153, 0.06)' },
  { line: '#06B6D4', fill: 'rgba(6, 182, 212, 0.06)' },
  { line: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.06)' },
]

export default function MultiLineChart({ labels, funcionarios, totalGlobal }: MultiLineChartProps) {
  const datasets = [
    // Linha de faturamento total (destaque)
    {
      label: 'Faturamento Total',
      data: totalGlobal,
      borderColor: '#F0F6FC',
      backgroundColor: 'rgba(240, 246, 252, 0.06)',
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: '#F0F6FC',
      pointBorderColor: '#0D1117',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 8,
      order: 0,
    },
    // Linha de cada funcionário
    ...funcionarios.map((f, i) => ({
      label: f.nome.split(' ')[0],
      data: f.valores,
      borderColor: PALETTE[i % PALETTE.length].line,
      backgroundColor: PALETTE[i % PALETTE.length].fill,
      fill: false,
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: PALETTE[i % PALETTE.length].line,
      pointBorderColor: '#0D1117',
      pointBorderWidth: 1,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderDash: [],
      order: i + 1,
    })),
  ]

  const data = { labels, datasets }

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
          font: { family: "'Inter', sans-serif", size: 11 },
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 12,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#161B22',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#F0F6FC',
        bodyColor: '#8B949E',
        padding: 12,
        callbacks: {
          label: (ctx: any) => `  ${ctx.dataset.label}: ${formatBRL(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8B949E', font: { family: "'Inter', sans-serif", size: 11 } },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#8B949E',
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          callback: (v: any) => `R$ ${(v / 1000).toFixed(0)}k`,
        },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  }

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  )
}
