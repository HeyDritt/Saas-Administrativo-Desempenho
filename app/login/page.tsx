'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_EMAIL = 'gestor@sputnik.com'
const DEMO_PASSWORD = 'SputnikDemo2026'
const ADMIN_EMAIL = 'admin@empresa.com'
const ADMIN_PASSWORD = 'Admin2026!'

// Usuários locais para modo mock (sem Supabase)
const MOCK_USERS: Record<string, { password: string; role: 'gestor' | 'demo'; name: string }> = {
  [DEMO_EMAIL]:  { password: DEMO_PASSWORD,  role: 'demo',   name: 'Demonstração' },
  [ADMIN_EMAIL]: { password: ADMIN_PASSWORD,  role: 'gestor', name: 'Administrador' },
}

const IS_MOCK_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const emailLower = email.trim().toLowerCase()

    try {
      if (IS_MOCK_MODE) {
        // ── Modo Mock: autenticação local ──────────────────
        await new Promise((r) => setTimeout(r, 600)) // simular latência

        const user = MOCK_USERS[emailLower]
        if (!user || user.password !== password) {
          setError('E-mail ou senha incorretos.')
          setLoading(false)
          return
        }

        // Salvar sessão mock no sessionStorage
        sessionStorage.setItem('mock_user_email', emailLower)
        sessionStorage.setItem('mock_user_role', user.role)
        sessionStorage.setItem('mock_user_name', user.name)
        router.push('/dashboard')
        return
      }

      // ── Modo Supabase ──────────────────────────────────
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password,
      })

      if (authError || !data.user) {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.')
        setLoading(false)
        return
      }

      const user = data.user

      // Conta demo: bypass MFA
      if (emailLower === DEMO_EMAIL) {
        router.push('/dashboard')
        return
      }

      // Verificar fingerprint para MFA
      try {
        const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default
        const fp = await FingerprintJS.load()
        const result = await fp.get()
        const fingerprint = result.visitorId

        const { data: trustedDevice } = await supabase
          .from('trusted_devices')
          .select('id')
          .eq('user_id', user.id)
          .eq('fingerprint', fingerprint)
          .single()

        if (trustedDevice) {
          router.push('/dashboard')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('telefone')
          .eq('id', user.id)
          .single()

        const phone = profile?.telefone || ''

        const mfaRes = await fetch('/api/mfa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, phone }),
        })

        const mfaData = await mfaRes.json()

        sessionStorage.setItem('mfa_user_id', user.id)
        sessionStorage.setItem('mfa_phone', phone)
        sessionStorage.setItem('mfa_expires_at', mfaData.expiresAt)
        sessionStorage.setItem('mfa_fingerprint', fingerprint)

        router.push('/mfa')
      } catch {
        // Fallback: exige MFA
        const mfaRes = await fetch('/api/mfa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, phone: '' }),
        })
        const mfaData = await mfaRes.json()

        sessionStorage.setItem('mfa_user_id', user.id)
        sessionStorage.setItem('mfa_phone', '')
        sessionStorage.setItem('mfa_expires_at', mfaData.expiresAt)
        sessionStorage.setItem('mfa_fingerprint', '')

        router.push('/mfa')
      }
    } catch {
      setError('Ocorreu um erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setLoading(true)
    setError('')

    try {
      await new Promise((r) => setTimeout(r, 500))

      if (IS_MOCK_MODE) {
        sessionStorage.setItem('mock_user_email', DEMO_EMAIL)
        sessionStorage.setItem('mock_user_role', 'demo')
        sessionStorage.setItem('mock_user_name', 'Demonstração')
        router.push('/dashboard')
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      if (authError) {
        setError('Conta demo não disponível. Configure-a no Supabase (ver README).')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Erro ao acessar conta demo.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card animate-fade-in-up">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🛰️</div>
          <div>
            <div className="auth-logo-text">Sputnik</div>
            <div className="auth-logo-sub">Gestão Comercial</div>
          </div>
        </div>

        <h1 className="auth-title">Bem-vindo de volta</h1>
        <p className="auth-subtitle">Acesse o painel de performance comercial</p>

        {IS_MOCK_MODE && (
          <div className="alert alert-info" style={{ marginBottom: '20px', fontSize: '0.8rem' }}>
            <span>ℹ️</span>
            <span>Modo demonstração — dados locais. Supabase não configurado.</span>
          </div>
        )}

        {/* Formulário */}
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input
              id="email"
              type="email"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                required
                autoComplete="current-password"
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '1rem', padding: '4px',
                }}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <button
            id="btn-login-submit"
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ marginTop: '4px' }}
          >
            {loading ? <><span className="loading-spinner" /> Autenticando...</> : 'Entrar'}
          </button>
        </form>

        <div className="auth-divider">ou</div>

        <button
          id="btn-demo-login"
          type="button"
          className="auth-demo-btn"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          🔍 Acessar como Demo (Read-Only)
        </button>

        {IS_MOCK_MODE && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
              Credenciais de teste:
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: "'JetBrains Mono', monospace" }}>
              Demo: gestor@sputnik.com / SputnikDemo2026<br />
              Admin: admin@empresa.com / Admin2026!
            </p>
          </div>
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textAlign: 'center', marginTop: '16px' }}>
          Ambiente de demonstração — dados simulados. Sem risco de alteração.
        </p>
      </div>
    </div>
  )
}
