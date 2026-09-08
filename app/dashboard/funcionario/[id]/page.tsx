'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  formatBRL,
  formatPercent,
  formatCiclo,
  getInitials,
  getAvatarClass,
} from '@/lib/formatters'
import IndividualChart from '@/components/IndividualChart'
import StatusBadge from '@/components/StatusBadge'

const CICLO_ATUAL = '2026-10'

const MOCK_FUNCIONARIOS: Record<string, any> = {
  '1': { funcionario_id: '1', nome: 'Marcos Silva',  cargo: 'Sênior', meta_mensal: 150000, taxa_comissao: 0.06, faturamento_realizado: 185000, percentual_atingimento: 123.3, status_meta: 'Superada', comissao_projetada: 11100 },
  '2': { funcionario_id: '2', nome: 'Julia Costa',   cargo: 'Pleno',  meta_mensal: 100000, taxa_comissao: 0.05, faturamento_realizado: 105000, percentual_atingimento: 105.0, status_meta: 'Atingida', comissao_projetada: 5250 },
  '3': { funcionario_id: '3', nome: 'Roberto Alves', cargo: 'Júnior', meta_mensal:  80000, taxa_comissao: 0.04, faturamento_realizado:  45000, percentual_atingimento:  56.3, status_meta: 'Parcial',  comissao_projetada: 1800 },
  '4': { funcionario_id: '4', nome: 'Ana Lima',      cargo: 'Sênior', meta_mensal: 150000, taxa_comissao: 0.06, faturamento_realizado: 148000, percentual_atingimento:  98.7, status_meta: 'Parcial',  comissao_projetada: 8880 },
  '5': { funcionario_id: '5', nome: 'Thiago Mendes', cargo: 'Pleno',  meta_mensal: 100000, taxa_comissao: 0.05, faturamento_realizado: 112000, percentual_atingimento: 112.0, status_meta: 'Superada', comissao_projetada: 5600 },
  '6': { funcionario_id: '6', nome: 'Carla Souza',   cargo: 'Júnior', meta_mensal:  80000, taxa_comissao: 0.04, faturamento_realizado:  85000, percentual_atingimento: 106.3, status_meta: 'Atingida', comissao_projetada: 3400 },
}

const MOCK_SEMANAL: Record<string, number[]> = {
  'Marcos Silva':  [35000, 130000, 165000, 185000],
  'Julia Costa':   [26250, 52500, 78750, 105000],
  'Roberto Alves': [15000, 22000, 28000, 45000],
  'Ana Lima':      [20000, 45000, 70000, 148000],
  'Thiago Mendes': [15000, 60000, 65000, 112000],
  'Carla Souza':   [30000, 65000, 82000, 85000],
}

const COMPORTAMENTO: Record<string, string> = {
  'Marcos Silva':  'Pico alto na segunda semana — aceleração forte no início do ciclo.',
  'Julia Costa':   'Crescimento linear e constante — ritmo disciplinado ao longo do mês.',
  'Roberto Alves': 'Curva achatada — dificuldade em manter volume de fechamentos.',
  'Ana Lima':      'Arrancada forte nos últimos dias — concentração de vendas no fim do ciclo.',
  'Thiago Mendes': 'Vendas fechadas em grandes lotes — oscilações por ciclos de negociação.',
  'Carla Souza':   'Bateu a meta cedo e estabilizou — excelente ritmo inicial.',
}

export default function FuncionarioExtrato() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [funcionario, setFuncionario] = useState<any>(null)
  const [semanalValues, setSemanalValues] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      // Verificar auth
      const mockEmail = sessionStorage.getItem('mock_user_email')
      const mockRole  = sessionStorage.getItem('mock_user_role')

      if (!mockEmail) {
        // Tentar Supabase auth
        try {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) { router.replace('/login'); return }

          // Demo não acessa extrato
          const { data: profile } = await supabase
            .from('profiles').select('tipo_acesso').eq('id', user.id).single()
          if (profile?.tipo_acesso === 'demo') { router.replace('/dashboard'); return }

          // Buscar dados reais
          const { data: perfData } = await supabase
            .from('vw_performance_dashboard')
            .select('*').eq('funcionario_id', id).eq('ciclo', CICLO_ATUAL).single()

          const { data: semData } = await supabase
            .from('performance_semanal')
            .select('semana, valor_acumulado')
            .eq('funcionario_id', id).eq('ciclo', CICLO_ATUAL)
            .order('semana', { ascending: true })

          const f = perfData || MOCK_FUNCIONARIOS[id]
          const s = semData?.map((x: any) => Number(x.valor_acumulado))
            || MOCK_SEMANAL[f?.nome] || []

          setFuncionario(f)
          setSemanalValues(s)
        } catch {
          // Fallback mock
          const f = MOCK_FUNCIONARIOS[id]
          if (!f) { router.replace('/dashboard'); return }
          setFuncionario(f)
          setSemanalValues(MOCK_SEMANAL[f.nome] || [])
        }
      } else {
        // Mock mode
        if (mockRole === 'demo') { router.replace('/dashboard'); return }
        const f = MOCK_FUNCIONARIOS[id]
        if (!f) { router.replace('/dashboard'); return }
        setFuncionario(f)
        setSemanalValues(MOCK_SEMANAL[f.nome] || [])
      }

      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading || !funcionario) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
      </div>
    )
  }

  const semanasLabels = semanalValues.map((_, i) =>
    i < semanalValues.length - 1 ? `Semana ${i + 1}` : `Semana ${i + 1} (Atual)`
  )
  const pct = Number(funcionario.percentual_atingimento)
  const comportamento = COMPORTAMENTO[funcionario.nome] || 'Análise de comportamento de vendas.'

  return (
    <main>
      <div className="dashboard-container">
        {/* Breadcrumb */}
        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Dashboard
          </Link>
          <span style={{ color: 'var(--text-subtle)' }}>/</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Extrato Individual</span>
        </div>

        {/* Header do funcionário */}
        <div className="card animate-fade-in-up">
          <div className="extrato-header">
            <div className={`avatar-circle ${getAvatarClass(funcionario.cargo)}`}>
              {getInitials(funcionario.nome)}
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{funcionario.nome}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
                {funcionario.cargo} · Ciclo {formatCiclo(CICLO_ATUAL)}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <StatusBadge status={funcionario.status_meta} percentual={pct} />
            </div>
          </div>
          <div className="alert alert-info" style={{ marginTop: '16px' }}>
            <span>📊</span>
            <span><strong>Padrão identificado:</strong> {comportamento}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="card animate-fade-in-up">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>Meta do Ciclo</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.8rem', fontWeight: 700 }}>
              {formatBRL(funcionario.meta_mensal)}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Taxa de comissão: {(Number(funcionario.taxa_comissao) * 100).toFixed(0)}%
            </p>
          </div>

          <div className="card animate-fade-in-up">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>Faturamento Realizado</p>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '1.8rem', fontWeight: 700,
              color: pct >= 100 ? 'var(--accent-green)' : 'var(--text-main)',
            }}>
              {formatBRL(funcionario.faturamento_realizado)}
            </p>
            <div className="progress-bar" style={{ marginTop: '12px' }}>
              <div
                className={`progress-fill ${pct >= 110 ? 'green' : pct >= 100 ? 'indigo' : 'red'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {formatPercent(pct)} da meta
            </p>
          </div>

          <div className="card animate-fade-in-up">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>Comissão Projetada</p>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '1.8rem', fontWeight: 700,
              color: 'var(--accent-indigo)',
            }}>
              {formatBRL(funcionario.comissao_projetada)}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {formatBRL(funcionario.faturamento_realizado)} × {(Number(funcionario.taxa_comissao) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Gráfico individual */}
        <div className="card animate-fade-in-up">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>
            Progressão Semanal — {funcionario.nome}
          </h2>
          <IndividualChart
            labels={semanasLabels}
            valores={semanalValues}
            meta={Number(funcionario.meta_mensal)}
            nome={funcionario.nome}
          />
        </div>

        {/* Botão voltar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '8px' }}>
          <Link href="/dashboard" className="btn btn-ghost">
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
