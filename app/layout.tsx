import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sputnik | Painel de Performance e Gestão Comercial',
  description: 'Dashboard administrativo B2B para gestão comercial, acompanhamento de metas, análise de performance individual e gestão de comissões.',
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
