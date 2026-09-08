# 🛰️ Sputnik Dashboard

**SaaS B2B de Gestão e Performance de Funcionários** — Painel administrativo web para gestão comercial, acompanhamento de metas, análise de performance individual e gestão de comissões.

---

## ✨ Funcionalidades

- **Autenticação em duas camadas**: senha + MFA via WhatsApp (n8n webhook)
- **Conta demo read-only**: `gestor@sputnik.com` — bypass de MFA, somente leitura garantida por RLS
- **Dashboard analítico**: KPIs, gráfico de tendência (realizado vs. meta), gráfico de conversão por vendedor
- **Extrato individual**: progressão semanal por funcionário com gráfico e insights de comportamento
- **Modo offline**: funciona com dados mock quando Supabase não está configurado
- **Dark mode nativo**: design system completo com Inter + JetBrains Mono
- **Responsivo**: breakpoint em 900px para mobile/tablet

---

## 🚀 Setup Rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com seus valores:

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API > service_role |
| `N8N_MFA_WEBHOOK_URL` | URL do webhook no seu n8n |

### 3. Banco de dados (Supabase)

Execute no SQL Editor do Supabase, na ordem:

```
sql/01_schema.sql   <- tabelas, view, extensoes
sql/02_rls.sql      <- Row Level Security
sql/03_seed.sql     <- 6 funcionarios + performance
```

### 4. Conta demo

1. Supabase > Authentication > Users > Add user: `gestor@sputnik.com` / `SputnikDemo2026`
2. Copie o UUID gerado e execute:

```sql
insert into profiles (id, email, tipo_acesso) values
  ('<UUID>', 'gestor@sputnik.com', 'demo');
```

### 5. Rodar

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🔐 MFA via WhatsApp (n8n)

O sistema envia `POST` para `N8N_MFA_WEBHOOK_URL` com:

```json
{
  "phone": "+5511999990001",
  "token": "483920",
  "expires_at": "2026-10-01T14:35:00.000Z",
  "message": "Seu codigo Sputnik: *483920* - Valido por 5 min."
}
```

**Em desenvolvimento**: se a URL estiver vazia, o token aparece no console do servidor (`[DEV] Token MFA`).

---

## 🏢 Regras de Negócio

| Status | Criterio |
|---|---|
| Superada | realizado >= 110% da meta |
| Atingida | realizado entre 100% e 109,9% |
| Parcial | realizado < 100% |

**Comissao** = `faturamento_realizado * taxa_comissao`

---

## 🛡️ Segurança

- `SUPABASE_SERVICE_ROLE_KEY` usado apenas em Route Handlers (server-side)
- RLS em todas as tabelas — conta demo bloqueada de escrita pelo banco
- Tokens MFA: expiram em 5 min, maximo 3 tentativas
- FingerprintJS para detectar dispositivos novos
- Dispositivos confiaveis salvos apos MFA bem-sucedido

---

## 📝 Suposicoes Documentadas

1. Ciclo padrao hardcoded: `2026-10` — altere `CICLO_ATUAL` em `app/dashboard/page.tsx`
2. Grafico de linha global usa valores acumulados fixos do seed
3. Se FingerprintJS falhar, sistema exige MFA (postura segura)
4. Telefone do usuario armazenado em `profiles.telefone`
5. Conta demo sem Supabase configurado falhara com mensagem de instrucao
