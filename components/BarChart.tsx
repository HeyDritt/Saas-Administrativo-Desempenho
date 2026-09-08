'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface BarChartProps {
  labels: string[]
  values: number[]
  title?: string
}

export default function BarChart({ labels, values, title }: BarChartProps) {
  const backgroundColors = values.map((v) =>
    v >= 100 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
  )
  const borderColors = values.map((v) =>
    v >= 100 ? '#10B981' : '#EF4444'
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Atingimento (%)',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161B22',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#F0F6FC',
        bodyColor: '#8B949E',
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.y.toFixed(1)}% da meta`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8B949E', font: { family: "'Inter', sans-serif", size: 11 } },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#8B949E',
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          callback: (v: any) => `${v}%`,
        },
        border: { color: 'rgba(255,255,255,0.08)' },
        min: 0,
      },
    },
  }

  return (
    <div className="card animate-fade-in-up">
      {title && (
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>{title}</h3>
      )}
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
