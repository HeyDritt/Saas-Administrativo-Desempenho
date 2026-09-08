'use client'

import { useState, useCallback } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import MultiLineChart from './MultiLineChart'
import { formatBRL } from '@/lib/formatters'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
)

// Defaults globais do Chart.js para o tema escuro
ChartJS.defaults.color = '#F0F6FC'
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.08)'

/* ── Tipos ─────────────────────────────────────────────── */
interface FuncionarioData {
  nome: string
  faturamento_realizado: number
  semanal: number[]
}

interface ChartCarouselProps {
  lineLabels: string[]
  lineRealizado: number[]
  lineMeta: number[]
  funcionarios: FuncionarioData[]
}

/* ── Config dos slides ──────────────────────────────────── */
const SLIDES = [
  { id: 'tendencia',  icon: '📈', label: 'Tendência Global',        desc: 'Realizado vs Expectativa' },
  { id: 'pizza',      icon: '🥧', label: 'Participação por Vendedor', desc: 'Share do faturamento total' },
  { id: 'multiline',  icon: '📊', label: 'Progressão Individual',   desc: 'Todos os vendedores + total' },
]

/* ── Paleta de cores (consistente com PieChart) ─────────── */
const PALETTE = [
  { line: '#6366F1', fill: 'rgba(99,102,241,0.75)' },
  { line: '#10B981', fill: 'rgba(16,185,129,0.75)' },
  { line: '#F59E0B', fill: 'rgba(245,158,11,0.75)' },
  { line: '#EC4899', fill: 'rgba(236,72,153,0.75)' },
  { line: '#06B6D4', fill: 'rgba(6,182,212,0.75)' },
  { line: '#8B5CF6', fill: 'rgba(139,92,246,0.75)' },
]

/* ── Estilos reutilizáveis para botões de seta ──────────── */
const arrowBtnStyle: React.CSSProperties = {
  width: '32px', height: '32px', borderRadius: '8px',
  border: '1px solid var(--border-color)',
  background: 'rgba(255,255,255,0.03)',
  color: 'var(--text-muted)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1rem', transition: 'all 0.2s ease', lineHeight: 1,
  fontFamily: 'inherit',
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════ */
export default function ChartCarousel({
  lineLabels,
  lineRealizado,
  lineMeta,
  funcionarios,
}: ChartCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  const goTo = useCallback((idx: number) => {
    setCurrent(idx)
    setAnimKey((k) => k + 1)
  }, [])

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length)
  const next = () => goTo((current + 1) % SLIDES.length)

  const slide = SLIDES[current]

  /* ── Dados derivados ─────────────────────────────────── */
  const pieTotal = funcionarios.reduce((a, f) => a + f.faturamento_realizado, 0)

  const numWeeks = funcionarios[0]?.semanal.length ?? 4
  const totalSemanal = Array.from({ length: numWeeks }, (_, i) =>
    funcionarios.reduce((acc, f) => acc + (f.semanal[i] ?? 0), 0)
  )

  return (
    <div className="card animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ─── Header ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '1.2rem', background: 'rgba(99,102,241,0.1)',
            borderRadius: '8px', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {slide.icon}
          </span>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.2 }}>{slide.label}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1px' }}>{slide.desc}</p>
          </div>
        </div>

        {/* Controles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Dots */}
          <div style={{ display: 'flex', gap: '5px', marginRight: '4px' }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === current ? '22px' : '8px',
                  height: '8px', borderRadius: '99px', border: 'none', padding: 0,
                  background: i === current ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  boxShadow: i === current ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Seta anterior */}
          <button
            id="chart-prev"
            onClick={prev}
            aria-label="Gráfico anterior"
            style={arrowBtnStyle}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, { borderColor: 'var(--accent-indigo)', color: 'var(--accent-indigo)', background: 'var(--accent-indigo-dim)' })
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, { borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)' })
            }}
          >
            ←
          </button>

          {/* Seta próxima */}
          <button
            id="chart-next"
            onClick={next}
            aria-label="Próximo gráfico"
            style={arrowBtnStyle}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, { borderColor: 'var(--accent-indigo)', color: 'var(--accent-indigo)', background: 'var(--accent-indigo-dim)' })
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, { borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)' })
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* ─── Conteúdo do slide (com animação) ──────────── */}
      <div
        key={animKey}
        className="chart-container"
        style={{ animation: 'carouselFadeIn 0.35s ease' }}
      >
        {current === 0 && <TendenciaChart labels={lineLabels} realizado={lineRealizado} esperado={lineMeta} />}
        {current === 1 && <PizzaChart labels={funcionarios.map(f => f.nome)} values={funcionarios.map(f => f.faturamento_realizado)} total={pieTotal} />}
        {current === 2 && (
          <MultiLineChart
            labels={lineLabels}
            funcionarios={funcionarios.map(f => ({ nome: f.nome, valores: f.semanal }))}
            totalGlobal={totalSemanal}
          />
        )}
      </div>

      {/* ─── Rodapé ────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginTop: '14px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', letterSpacing: '0.05em' }}>
          {current + 1} / {SLIDES.length}
        </span>
      </div>

      <style>{`
        @keyframes carouselFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 1 — Tendência (Linha Realizado vs Meta)
   ═══════════════════════════════════════════════════════════ */
function TendenciaChart({ labels, realizado, esperado }: { labels: string[]; realizado: number[]; esperado: number[] }) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Realizado (R$)',
        data: realizado,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#10B981', pointBorderColor: '#0D1117',
        pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7,
      },
      {
        label: 'Meta Esperada',
        data: esperado,
        borderColor: '#6366F1', borderDash: [6, 4],
        backgroundColor: 'transparent', tension: 0.4,
        pointBackgroundColor: '#6366F1', pointBorderColor: '#0D1117',
        pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
      },
    ],
  }
  return (
    <Line data={data} options={{
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#8B949E', font: { family: "'Inter', sans-serif", size: 12 }, usePointStyle: true, pointStyleWidth: 8, padding: 16 } },
        tooltip: { backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, titleColor: '#F0F6FC', bodyColor: '#8B949E', callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${formatBRL(ctx.parsed.y)}` } },
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8B949E' }, border: { color: 'rgba(255,255,255,0.08)' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8B949E', font: { family: "'JetBrains Mono', monospace", size: 11 }, callback: (v: any) => `R$ ${(v/1000).toFixed(0)}k` }, border: { color: 'rgba(255,255,255,0.08)' } },
      },
    }} />
  )
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 2 — Pizza (Doughnut de Participação)
   ═══════════════════════════════════════════════════════════ */
function PizzaChart({ labels, values, total }: { labels: string[]; values: number[]; total: number }) {
  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: PALETTE.map(c => c.fill),
      borderColor: PALETTE.map(c => c.line),
      borderWidth: 2, hoverOffset: 10, hoverBorderWidth: 3,
    }],
  }
  return (
    <Doughnut data={data} options={{
      responsive: true, maintainAspectRatio: false,
      cutout: '60%',
      layout: { padding: { right: 0, left: 16 } },
      plugins: {
        legend: {
          display: true, position: 'right',
          align: 'center',
          labels: {
            color: '#F0F6FC',
            font: { family: "'Inter', sans-serif", size: 11 },
            usePointStyle: true, pointStyleWidth: 10, padding: 12,
            generateLabels: (chart: any) =>
              chart.data.labels.map((label: string, i: number) => ({
                text: `${label.split(' ')[0]}  ${((values[i] / total) * 100).toFixed(1)}%`,
                fontColor: '#F0F6FC',
                fillStyle: PALETTE[i % PALETTE.length].fill,
                strokeStyle: PALETTE[i % PALETTE.length].line,
                lineWidth: 2, pointStyle: 'circle', index: i,
              })),
          },
        },
        tooltip: {
          backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
          titleColor: '#F0F6FC', bodyColor: '#8B949E',
          callbacks: { label: (ctx: any) => `  ${formatBRL(ctx.parsed)}  (${((ctx.parsed / total) * 100).toFixed(1)}%)` },
        },
      },
    }} />
  )
}
