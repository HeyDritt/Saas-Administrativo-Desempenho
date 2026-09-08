'use client'

import { useEffect, useRef } from 'react'
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

interface LineChartProps {
  labels: string[]
  realizado: number[]
  esperado: number[]
  title?: string
}

export default function LineChart({ labels, realizado, esperado, title }: LineChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Realizado (R$)',
        data: realizado,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#0D1117',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Meta Esperada',
        data: esperado,
        borderColor: '#6366F1',
        borderDash: [6, 4],
        backgroundColor: 'transparent',
        tension: 0.4,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#0D1117',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
          pointStyleWidth: 8,
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
    <div className="card animate-fade-in-up">
      {title && (
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>{title}</h3>
      )}
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
