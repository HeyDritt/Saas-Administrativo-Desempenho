/**
 * Formata um número como moeda BRL.
 * ex: 150000 → "R$ 150.000,00"
 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/**
 * Formata um número como percentual.
 * ex: 123.4 → "123,4%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace('.', ',')}%`
}

/**
 * Retorna as iniciais do nome.
 * ex: "Marcos Silva" → "MS"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/**
 * Retorna o ciclo atual no formato 'YYYY-MM'.
 * ex: "2026-10"
 */
export function getCurrentCiclo(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Formata um ciclo 'YYYY-MM' para exibição.
 * ex: "2026-10" → "Outubro 2026"
 */
export function formatCiclo(ciclo: string): string {
  const [year, month] = ciclo.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase())
}

/**
 * Retorna o label de status da meta.
 */
export function getStatusMeta(percentual: number): 'Superada' | 'Atingida' | 'Parcial' {
  if (percentual >= 110) return 'Superada'
  if (percentual >= 100) return 'Atingida'
  return 'Parcial'
}

/**
 * Retorna a classe CSS do badge de status.
 */
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Superada': return 'badge-green'
    case 'Atingida': return 'badge-indigo'
    case 'Parcial':  return 'badge-red'
    default:         return 'badge-indigo'
  }
}

/**
 * Retorna a classe do avatar baseada no cargo.
 */
export function getAvatarClass(cargo: string): string {
  switch (cargo) {
    case 'Sênior': return 'avatar-senior'
    case 'Pleno':  return 'avatar-pleno'
    case 'Júnior': return 'avatar-junior'
    default:       return 'avatar-senior'
  }
}

/**
 * Gera um token numérico de 6 dígitos.
 */
export function generateMfaToken(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}
