'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL, formatCiclo, formatPercent } from '@/lib/formatters'
import {
  HISTORICO,
  CICLO_ATUAL,
  getCicloData,
  getTotalFaturamento,
  getTotalComissoes,
  getTopPerformer,
} from '@/lib/mockHistory'
import KpiCard from '@/components/KpiCard'
import ChartCarousel from '@/components/ChartCarousel'
import BarChart from '@/components/BarChart'
import TeamTable from '@/components/TeamTable'
import DemoBadge from '@/components/DemoBadge'
import LogoutButton from '@/components/LogoutButton'
import MonthSelector from '@/components/MonthSelector'
import ComparisonView from '@/components/ComparisonView'

export default function DashboardPage() {
  const router = useRouter()
  const [isDemo, setIsDemo] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  // ─── Estado de seleção de ciclo ──────────────────────────
  const [selectedCiclos, setSelectedCiclos] = useState<string[]>([CICLO_ATUAL])
  const [compareMode, setCompareMode] = useState(false)

  // ─── Auth check ──────────────────────────────────────────
  useEffect(() => {
    const mockEmail = sessionStorage.getItem('mock_user_email')
    const mockRole  = sessionStorage.getItem('mock_user_role')

    if (mockEmail) {
      setUserEmail(mockEmail)
      setIsDemo(mockRole === 'demo')
      setLoading(false)
      return
    }

    async function checkSupabase() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace('/login'); return }
        setUserEmail(user.email || '')
        const { data: profile } = await supabase
          .from('profiles').select('tipo_acesso').eq('id', user.id).single()
        setIsDemo(profile?.tipo_acesso === 'demo')
      } catch {
        const email = sessionStorage.getItem('mock_user_email')
        if (!email) router.replace('/login')
      } finally {
        setLoading(false)
      }
    }
    checkSupabase()
  }, [router])

  // ─── Handlers de seleção de mês ──────────────────────────
  const handleSelectCiclo = useCallback((ciclo: string) => {
    if (!compareMode) {
      setSelectedCiclos([ciclo])
      return
    }
    setSelectedCiclos(prev => {
      if (prev.includes(ciclo)) {
        // Deselecionar — manter pelo menos 1
        const next = prev.filter(c => c !== ciclo)
        return next.length > 0 ? next : prev
      }
      if (prev.length >= 2) {
        // Substituir o segundo
        return [prev[0], ciclo]
      }
      return [...prev, ciclo]
    })
  }, [compareMode])

  const handleToggleCompare = useCallback(() => {
    setCompareMode(prev => {
      if (prev) {
        // Saindo da comparação: manter apenas o primeiro selecionado
        setSelectedCiclos(c => [c[0]])
      }
      return !prev
    })
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  // ─── Dados do ciclo principal (primeiro selecionado) ──────
  const cicloAtual = getCicloData(selectedCiclos[0]) ?? getCicloData(CICLO_ATUAL)!
  const cicloComparacao = selectedCiclos[1] ? getCicloData(selectedCiclos[1]) : null
  const funcionarios = cicloAtual.funcionarios

  const faturamentoTotal = getTotalFaturamento(cicloAtual)
  const comissoesTotal   = getTotalComissoes(cicloAtual)
  const topPerformer     = getTopPerformer(cicloAtual)
  const taxaMedia        = ((comissoesTotal / faturamentoTotal) * 100).toFixed(1)

  // Dados dos gráficos
  const lineLabels    = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4 (Atual)']
  const lineRealizado = lineLabels.map((_, i) =>
    funcionarios.reduce((acc, f) => acc + (f.semanal[i] ?? 0), 0)
  )
  const lineMeta      = lineLabels.map((_, i) =>
    Math.round((faturamentoTotal / 4) * (i + 1) * 0.94)
  )
  const barLabels     = funcionarios.map(f => f.nome.split(' ')[0])
  const barValues     = funcionarios.map(f => f.percentual_atingimento)

  const carouselFuncionarios = funcionarios.map(f => ({
    nome: f.nome,
    faturamento_realizado: f.faturamento_realizado,
    semanal: f.semanal,
  }))

  const modoComparacao = compareMode && cicloComparacao !== null && selectedCiclos.length === 2

  return (
    <main>
      <div className="dashboard-container">

        {/* ─── Header ──────────────────────────────────────── */}
        <header className="top-header animate-fade-in">
          <div className="header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
              <span style={{ fontSize: '1.4rem' }}>🛰️</span>
              <h1>Performance &amp; Comissões</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {modoComparacao
                ? `Comparando ${cicloAtual.label} × ${cicloComparacao!.label}`
                : `Ciclo: ${formatCiclo(cicloAtual.ciclo)}`}
            </p>
          </div>
          <div className="header-right">
            {isDemo ? (
              <DemoBadge email={userEmail} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{userEmail}</span>
                <LogoutButton />
              </div>
            )}
          </div>
        </header>

        {/* ─── Seletor de mês ──────────────────────────────── */}
        <div
          className="card animate-fade-in"
          style={{ padding: '14px 20px' }}
        >
          <MonthSelector
            selected={selectedCiclos}
            compareMode={compareMode}
            onSelect={handleSelectCiclo}
            onToggleCompare={handleToggleCompare}
          />
        </div>

        {/* ─── Vista normal ────────────────────────────────── */}
        {!modoComparacao && (
          <>
            {/* KPIs */}
            <div className="kpi-grid">
              <KpiCard
                title="Faturamento Global Realizado"
                value={faturamentoTotal}
                trend={`Ciclo ${cicloAtual.label}`}
                trendType="positive"
                icon="💰"
              />
              <KpiCard
                title="Projeção de Comissões (A Pagar)"
                value={comissoesTotal}
                trend={`Taxa média: ${taxaMedia}%`}
                trendType="positive"
                icon="🏆"
              />
              <KpiCard
                title="Top Performer"
                value={topPerformer.nome}
                trend={`Atingimento: ${formatPercent(topPerformer.percentual_atingimento)} da meta`}
                trendType="positive"
                isMono={false}
                icon="⭐"
              />
            </div>

            {/* Gráficos */}
            <div className="charts-grid">
              <ChartCarousel
                lineLabels={lineLabels}
                lineRealizado={lineRealizado}
                lineMeta={lineMeta}
                funcionarios={carouselFuncionarios}
              />
              <BarChart
                labels={barLabels}
                values={barValues}
                title="Conversão por Vendedor"
              />
            </div>

            {/* Tabela */}
            <TeamTable funcionarios={funcionarios as any} isDemo={isDemo} />
          </>
        )}

        {/* ─── Vista de comparação ─────────────────────────── */}
        {modoComparacao && (
          <ComparisonView
            cicloA={cicloAtual}
            cicloB={cicloComparacao!}
          />
        )}

        {/* Dica de comparação quando modo ativo mas 2º mês não escolhido */}
        {compareMode && !modoComparacao && (
          <div className="alert alert-info animate-fade-in">
            <span>💡</span>
            <span>
              <strong>{cicloAtual.label}</strong> selecionado como mês A.
              Clique em outro mês para comparar.
            </span>
          </div>
        )}

      </div>
    </main>
  )
}
