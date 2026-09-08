'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    // Limpar sessão mock
    sessionStorage.removeItem('mock_user_email')
    sessionStorage.removeItem('mock_user_role')
    sessionStorage.removeItem('mock_user_name')

    // Tentar logout do Supabase se disponível
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        await supabase.auth.signOut()
      }
    } catch {
      // Ignorar erros de logout do Supabase
    }

    router.push('/login')
  }

  return (
    <button
      id="btn-logout"
      type="button"
      onClick={handleLogout}
      className="btn btn-ghost"
      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
    >
      Sair
    </button>
  )
}
