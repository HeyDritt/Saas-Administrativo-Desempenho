import { NextRequest, NextResponse } from 'next/server'

// Em modo mock (sem Supabase configurado), o middleware não bloqueia rotas.
// A verificação de autenticação é feita client-side via sessionStorage.
// Quando o Supabase estiver configurado, descomente o código abaixo.

const IS_MOCK_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Em modo mock: permitir tudo (auth verificada client-side)
  if (IS_MOCK_MODE) {
    return NextResponse.next()
  }

  // ── Com Supabase configurado: verificar sessão server-side ──
  const PUBLIC_ROUTES = ['/login', '/mfa', '/api/mfa', '/api/auth']
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    try {
      const { createServerClient } = await import('@supabase/ssr')
      let response = NextResponse.next({ request })

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet) => {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return response
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
