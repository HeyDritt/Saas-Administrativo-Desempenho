import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateMfaToken } from '@/lib/formatters'

export async function POST(request: NextRequest) {
  try {
    const { userId, phone } = await request.json()

    if (!userId || !phone) {
      return NextResponse.json(
        { error: 'userId e phone são obrigatórios.' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // Invalidar tokens anteriores do usuário que ainda não foram usados
    await supabase
      .from('mfa_tokens')
      .update({ used: true })
      .eq('user_id', userId)
      .eq('used', false)

    // Gerar novo token de 6 dígitos
    const token = generateMfaToken()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min

    // Salvar token no banco
    const { error: insertError } = await supabase.from('mfa_tokens').insert({
      user_id: userId,
      token,
      expires_at: expiresAt,
    })

    if (insertError) {
      console.error('Erro ao salvar token MFA:', insertError)
      return NextResponse.json(
        { error: 'Falha ao gerar token MFA.' },
        { status: 500 }
      )
    }

    // Disparar webhook do n8n para envio via WhatsApp
    const webhookUrl = process.env.N8N_MFA_WEBHOOK_URL
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            token,
            expires_at: expiresAt,
            message: `Seu código de acesso Sputnik é: *${token}*\nVálido por 5 minutos. Não compartilhe este código.`,
          }),
        })
      } catch (webhookError) {
        // Não bloquear o fluxo se o webhook falhar — logar e continuar
        console.error('Erro ao chamar webhook n8n:', webhookError)
      }
    } else {
      // Em desenvolvimento: logar o token no console (NUNCA em produção)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Token MFA para ${phone}: ${token}`)
      }
    }

    return NextResponse.json({ success: true, expiresAt })
  } catch (error) {
    console.error('Erro inesperado em /api/mfa/send:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
