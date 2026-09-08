import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const MAX_ATTEMPTS = 3

export async function POST(request: NextRequest) {
  try {
    const { userId, token } = await request.json()

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'userId e token são obrigatórios.' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // Buscar o token mais recente não usado para este usuário
    const { data: mfaRecord, error: fetchError } = await supabase
      .from('mfa_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !mfaRecord) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Solicite um novo código.' },
        { status: 401 }
      )
    }

    // Verificar expiração
    if (new Date(mfaRecord.expires_at) < new Date()) {
      await supabase
        .from('mfa_tokens')
        .update({ used: true })
        .eq('id', mfaRecord.id)

      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo código.', expired: true },
        { status: 401 }
      )
    }

    // Verificar número de tentativas
    if (mfaRecord.attempts >= MAX_ATTEMPTS) {
      await supabase
        .from('mfa_tokens')
        .update({ used: true })
        .eq('id', mfaRecord.id)

      return NextResponse.json(
        { error: 'Número máximo de tentativas atingido. Solicite um novo código.', maxAttempts: true },
        { status: 401 }
      )
    }

    // Verificar token
    if (mfaRecord.token !== token.trim()) {
      // Incrementar tentativas
      const newAttempts = mfaRecord.attempts + 1
      await supabase
        .from('mfa_tokens')
        .update({ attempts: newAttempts })
        .eq('id', mfaRecord.id)

      const remainingAttempts = MAX_ATTEMPTS - newAttempts
      return NextResponse.json(
        {
          error: `Código incorreto. ${remainingAttempts > 0 ? `${remainingAttempts} tentativa(s) restante(s).` : 'Solicite um novo código.'}`,
          remainingAttempts,
          maxAttempts: remainingAttempts === 0,
        },
        { status: 401 }
      )
    }

    // Token válido — marcar como usado
    await supabase
      .from('mfa_tokens')
      .update({ used: true })
      .eq('id', mfaRecord.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro inesperado em /api/mfa/verify:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
