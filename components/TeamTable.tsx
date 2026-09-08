'use client'

import Link from 'next/link'
import { formatBRL } from '@/lib/formatters'
import StatusBadge from './StatusBadge'
import { getInitials, getAvatarClass } from '@/lib/formatters'

interface Funcionario {
  funcionario_id: string
  nome: string
  cargo: string
  meta_mensal: number
  faturamento_realizado: number
  percentual_atingimento: number
  status_meta: string
  comissao_projetada: number
}

interface TeamTableProps {
  funcionarios: Funcionario[]
  isDemo?: boolean
}

export default function TeamTable({ funcionarios, isDemo = false }: TeamTableProps) {
  return (
    <div className="card animate-fade-in-up">
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>
        Time Comercial e Desempenho Individual
      </h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendedor</th>
              <th>Cargo</th>
              <th>Meta</th>
              <th>Realizado</th>
              <th>Comissão</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((f) => {
              const isAbove = f.percentual_atingimento >= 100
              return (
                <tr key={f.funcionario_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        className={`avatar-circle ${getAvatarClass(f.cargo)}`}
                        style={{ width: '34px', height: '34px', fontSize: '0.75rem' }}
                      >
                        {getInitials(f.nome)}
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{f.nome}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {f.cargo}
                    </span>
                  </td>
                  <td className="col-num">{formatBRL(f.meta_mensal)}</td>
                  <td
                    className="col-num"
                    style={{ color: isAbove ? 'var(--accent-green)' : 'var(--text-main)' }}
                  >
                    {formatBRL(f.faturamento_realizado)}
                  </td>
                  <td className="col-num" style={{ color: 'var(--accent-indigo)' }}>
                    {formatBRL(f.comissao_projetada)}
                  </td>
                  <td>
                    <StatusBadge
                      status={f.status_meta}
                      percentual={f.percentual_atingimento}
                    />
                  </td>
                  <td>
                    {isDemo ? (
                      <button className="btn-action" disabled title="Indisponível no modo demo">
                        Ver Extrato
                      </button>
                    ) : (
                      <Link
                        href={`/dashboard/funcionario/${f.funcionario_id}`}
                        className="btn-action"
                        style={{ display: 'inline-block', textDecoration: 'none' }}
                      >
                        Ver Extrato
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
