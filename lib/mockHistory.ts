/**
 * Dados históricos mock para múltiplos ciclos.
 * Cada ciclo tem performance mensal e breakdown semanal por funcionário.
 */

export interface FuncionarioPerf {
  funcionario_id: string
  nome: string
  cargo: string
  meta_mensal: number
  taxa_comissao: number
  faturamento_realizado: number
  percentual_atingimento: number
  status_meta: 'Superada' | 'Atingida' | 'Parcial'
  comissao_projetada: number
  semanal: number[]
}

export interface CicloData {
  ciclo: string
  label: string
  funcionarios: FuncionarioPerf[]
}

function calcStatus(realizado: number, meta: number): 'Superada' | 'Atingida' | 'Parcial' {
  const pct = (realizado / meta) * 100
  if (pct >= 110) return 'Superada'
  if (pct >= 100) return 'Atingida'
  return 'Parcial'
}

function mkFuncionario(
  id: string, nome: string, cargo: string, meta: number, taxa: number,
  realizado: number, semanal: number[]
): FuncionarioPerf {
  const pct = (realizado / meta) * 100
  return {
    funcionario_id: id,
    nome, cargo,
    meta_mensal: meta,
    taxa_comissao: taxa,
    faturamento_realizado: realizado,
    percentual_atingimento: Math.round(pct * 10) / 10,
    status_meta: calcStatus(realizado, meta),
    comissao_projetada: Math.round(realizado * taxa),
    semanal,
  }
}

export const HISTORICO: CicloData[] = [
  // ── Junho 2026 ──────────────────────────────────────
  {
    ciclo: '2026-06',
    label: 'Jun 2026',
    funcionarios: [
      mkFuncionario('1', 'Marcos Silva',  'Sênior', 150000, 0.06, 142000, [28000, 72000, 118000, 142000]),
      mkFuncionario('2', 'Julia Costa',   'Pleno',  100000, 0.05,  91000, [22750, 45500, 68250, 91000]),
      mkFuncionario('3', 'Roberto Alves', 'Júnior',  80000, 0.04,  52000, [12000, 24000, 38000, 52000]),
      mkFuncionario('4', 'Ana Lima',      'Sênior', 150000, 0.06, 161000, [18000, 52000, 95000, 161000]),
      mkFuncionario('5', 'Thiago Mendes', 'Pleno',  100000, 0.05, 108000, [12000, 55000, 60000, 108000]),
      mkFuncionario('6', 'Carla Souza',   'Júnior',  80000, 0.04,  76000, [25000, 54000, 73000, 76000]),
    ],
  },
  // ── Julho 2026 ──────────────────────────────────────
  {
    ciclo: '2026-07',
    label: 'Jul 2026',
    funcionarios: [
      mkFuncionario('1', 'Marcos Silva',  'Sênior', 150000, 0.06, 167000, [40000, 112000, 148000, 167000]),
      mkFuncionario('2', 'Julia Costa',   'Pleno',  100000, 0.05,  98000, [24500, 49000, 73500, 98000]),
      mkFuncionario('3', 'Roberto Alves', 'Júnior',  80000, 0.04,  41000, [10000, 18000, 25000, 41000]),
      mkFuncionario('4', 'Ana Lima',      'Sênior', 150000, 0.06, 155000, [22000, 58000, 88000, 155000]),
      mkFuncionario('5', 'Thiago Mendes', 'Pleno',  100000, 0.05, 122000, [18000, 72000, 78000, 122000]),
      mkFuncionario('6', 'Carla Souza',   'Júnior',  80000, 0.04,  89000, [32000, 68000, 86000, 89000]),
    ],
  },
  // ── Agosto 2026 ─────────────────────────────────────
  {
    ciclo: '2026-08',
    label: 'Ago 2026',
    funcionarios: [
      mkFuncionario('1', 'Marcos Silva',  'Sênior', 150000, 0.06, 175000, [32000, 125000, 158000, 175000]),
      mkFuncionario('2', 'Julia Costa',   'Pleno',  100000, 0.05, 103000, [25750, 51500, 77250, 103000]),
      mkFuncionario('3', 'Roberto Alves', 'Júnior',  80000, 0.04,  38000, [ 9000, 16000, 22000, 38000]),
      mkFuncionario('4', 'Ana Lima',      'Sênior', 150000, 0.06, 138000, [15000, 40000, 62000, 138000]),
      mkFuncionario('5', 'Thiago Mendes', 'Pleno',  100000, 0.05,  95000, [14000, 52000, 56000, 95000]),
      mkFuncionario('6', 'Carla Souza',   'Júnior',  80000, 0.04,  82000, [28000, 62000, 80000, 82000]),
    ],
  },
  // ── Setembro 2026 ───────────────────────────────────
  {
    ciclo: '2026-09',
    label: 'Set 2026',
    funcionarios: [
      mkFuncionario('1', 'Marcos Silva',  'Sênior', 150000, 0.06, 196000, [42000, 138000, 174000, 196000]),
      mkFuncionario('2', 'Julia Costa',   'Pleno',  100000, 0.05, 110000, [27500, 55000, 82500, 110000]),
      mkFuncionario('3', 'Roberto Alves', 'Júnior',  80000, 0.04,  48000, [11000, 20000, 30000, 48000]),
      mkFuncionario('4', 'Ana Lima',      'Sênior', 150000, 0.06, 153000, [19000, 48000, 75000, 153000]),
      mkFuncionario('5', 'Thiago Mendes', 'Pleno',  100000, 0.05, 118000, [16000, 65000, 70000, 118000]),
      mkFuncionario('6', 'Carla Souza',   'Júnior',  80000, 0.04,  88000, [31000, 66000, 85000, 88000]),
    ],
  },
  // ── Outubro 2026 (atual) ─────────────────────────────
  {
    ciclo: '2026-10',
    label: 'Out 2026',
    funcionarios: [
      mkFuncionario('1', 'Marcos Silva',  'Sênior', 150000, 0.06, 185000, [35000, 130000, 165000, 185000]),
      mkFuncionario('2', 'Julia Costa',   'Pleno',  100000, 0.05, 105000, [26250, 52500, 78750, 105000]),
      mkFuncionario('3', 'Roberto Alves', 'Júnior',  80000, 0.04,  45000, [15000, 22000, 28000, 45000]),
      mkFuncionario('4', 'Ana Lima',      'Sênior', 150000, 0.06, 148000, [20000, 45000, 70000, 148000]),
      mkFuncionario('5', 'Thiago Mendes', 'Pleno',  100000, 0.05, 112000, [15000, 60000, 65000, 112000]),
      mkFuncionario('6', 'Carla Souza',   'Júnior',  80000, 0.04,  85000, [30000, 65000, 82000, 85000]),
    ],
  },
]

export const CICLO_ATUAL = '2026-10'

export function getCicloData(ciclo: string): CicloData | undefined {
  return HISTORICO.find(h => h.ciclo === ciclo)
}

export function getTotalFaturamento(data: CicloData): number {
  return data.funcionarios.reduce((acc, f) => acc + f.faturamento_realizado, 0)
}

export function getTotalComissoes(data: CicloData): number {
  return data.funcionarios.reduce((acc, f) => acc + f.comissao_projetada, 0)
}

export function getTopPerformer(data: CicloData): FuncionarioPerf {
  return data.funcionarios.reduce((a, b) =>
    a.percentual_atingimento > b.percentual_atingimento ? a : b
  )
}
