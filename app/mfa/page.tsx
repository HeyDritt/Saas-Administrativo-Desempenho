'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TOKEN_LENGTH = 6
const RESEND_COOLDOWN = 60 // segundos antes de permitir reenvio

export default function MfaPage() {
  const router = useRouter()
  const supabase = createClient()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [digits, setDigits] = useState<string[]>(Array(TOKEN_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN)
  const [canResend, setCanResend] = useState(false)
  const [maxAttempts, setMaxAttempts] = useState(false)

  // Dados da sessão MFA (vindos do login)
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem('mfa_user_id') || '' : ''
  const phone = typeof window !== 'undefined' ? sessionStorage.getItem('mfa_phone') || '' : ''
  const expiresAt = typeof window !== 'undefined' ? sessionStorage.getItem('mfa_expires_at') || '' : ''
  const fingerprint = typeof window !== 'undefined' ? sessionStorage.getItem('mfa_fingerprint') || '' : ''

  // Redirecionar se não houver sessão MFA pendente
  useEffect(() => {
    if (!userId) {
      router.replace('/login')
    }
  }, [userId, router])

  // Countdown de expiração
  useEffect(() => {
    if (!expiresAt) return

    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setTimeLeft(diff)
      if (diff === 0) setCanResend(true)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  // Countdown de reenvio
  useEffect(() => {
    if (resendCooldown <= 0) { setCanResend(true); return }
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { setCanResend(true); clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)
    setHasError(false)
    setError('')

    // Auto-focus próximo campo
    if (value && index < TOKEN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit quando todos preenchidos
    if (newDigits.every((d) => d !== '') && value) {
      handleVerify(newDigits.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, TOKEN_LENGTH)
    if (pasted.length === TOKEN_LENGTH) {
      const newDigits = pasted.split('')
      setDigits(newDigits)
      handleVerify(pasted)
    }
  }

  async function handleVerify(tokenOverride?: string) {
    const token = tokenOverride || digits.join('')
    if (token.length < TOKEN_LENGTH) return
    if (loading || maxAttempts) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // MFA válido — salvar dispositivo confiável se fingerprint disponível
        if (fingerprint) {
          await supabase.from('trusted_devices').upsert({
            user_id: userId,
            fingerprint,
            label: navigator.userAgent.slice(0, 80),
          }, { onConflict: 'user_id,fingerprint' })
        }

        // Limpar dados de sessão MFA
        sessionStorage.removeItem('mfa_user_id')
        sessionStorage.removeItem('mfa_phone')
        sessionStorage.removeItem('mfa_expires_at')
        sessionStorage.removeItem('mfa_fingerprint')

        setSuccess(true)
        setTimeout(() => router.push('/dashboard'), 800)
      } else {
        setHasError(true)
        setError(data.error || 'Código inválido.')
        setDigits(Array(TOKEN_LENGTH).fill(''))
        inputRefs.current[0]?.focus()

        if (data.maxAttempts) {
          setMaxAttempts(true)
          setCanResend(true)
        }
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!canResend) return
    setCanResend(false)
    setResendCooldown(RESEND_COOLDOWN)
    setError('')
    setMaxAttempts(false)
    setDigits(Array(TOKEN_LENGTH).fill(''))
    inputRefs.current[0]?.focus()

    try {
      const res = await fetch('/api/mfa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone }),
      })
      const data = await res.json()
      if (data.expiresAt) {
        sessionStorage.setItem('mfa_expires_at', data.expiresAt)
      }
    } catch {
      setError('Falha ao reenviar código. Tente novamente.')
    }
  }

  const maskedPhone = phone
    ? phone.replace(/(\+\d{2})(\d{2})(\d{4,5})(\d{4})/, '$1 ($2) $3-$4')
    : 'seu WhatsApp'

  return (
    <div className="auth-screen">
      <div className="auth-card animate-fade-in-up" style={{ maxWidth: '440px' }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🛰️</div>
          <div>
            <div className="auth-logo-text">Sputnik</div>
            <div className="auth-logo-sub">Verificação de Segurança</div>
          </div>
        </div>

        <h1 className="auth-title">Verificação em duas etapas</h1>
        <p className="auth-subtitle">
          Enviamos um código de 6 dígitos para{' '}
          <strong style={{ color: 'var(--text-main)' }}>{maskedPhone}</strong>.
          {' '}Digite-o abaixo para continuar.
        </p>

        {/* Inputs de 6 dígitos */}
        <div
          className="mfa-inputs"
          onPaste={handlePaste}
          style={{ margin: '28px 0 16px' }}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              id={`mfa-digit-${i}`}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`mfa-input ${digit ? 'filled' : ''} ${hasError ? 'error' : ''} ${success ? 'filled' : ''}`}
              disabled={loading || success || maxAttempts}
              aria-label={`Dígito ${i + 1} de ${TOKEN_LENGTH}`}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Timer */}
        {!success && (
          <div
            className={`mfa-timer ${timeLeft <= 60 && timeLeft > 0 ? 'expiring' : ''}`}
          >
            {timeLeft > 0
              ? `⏱ Código válido por ${formatTime(timeLeft)}`
              : '⚠️ Código expirado'}
          </div>
        )}

        {/* Erro */}
        {error && !success && (
          <div className="alert alert-error" style={{ marginTop: '12px' }} role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Sucesso */}
        {success && (
          <div className="alert alert-success" style={{ marginTop: '12px' }}>
            <span>✅</span>
            <span>Verificado! Redirecionando...</span>
          </div>
        )}

        {/* Botão de verificação manual */}
        {!success && (
          <button
            id="btn-mfa-verify"
            type="button"
            className="btn btn-primary w-full"
            style={{ marginTop: '20px' }}
            onClick={() => handleVerify()}
            disabled={loading || digits.some((d) => !d) || maxAttempts}
          >
            {loading ? (
              <>
                <span className="loading-spinner" />
                Verificando...
              </>
            ) : (
              'Confirmar código'
            )}
          </button>
        )}

        {/* Reenviar */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            id="btn-mfa-resend"
            type="button"
            onClick={handleResend}
            disabled={!canResend || loading || success}
            style={{
              background: 'none',
              border: 'none',
              color: canResend ? 'var(--accent-indigo)' : 'var(--text-subtle)',
              cursor: canResend ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              fontWeight: 500,
              textDecoration: canResend ? 'underline' : 'none',
              padding: '4px',
            }}
          >
            {canResend
              ? '↩ Reenviar código'
              : `Reenviar em ${resendCooldown}s`}
          </button>
        </div>

        {/* Voltar ao login */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <a
            href="/login"
            style={{
              color: 'var(--text-subtle)',
              fontSize: '0.8rem',
              textDecoration: 'none',
            }}
          >
            ← Voltar ao login
          </a>
        </div>
      </div>
    </div>
  )
}
