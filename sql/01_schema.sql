-- ============================================================
-- SPUTNIK DASHBOARD — SCHEMA SQL
-- Rode este arquivo no SQL Editor do Supabase (01_schema.sql)
-- ============================================================

-- Extensão para geração de UUID
create extension if not exists "uuid-ossp";

-- ─── Tabela de Funcionários ───────────────────────────────
create table if not exists funcionarios (
  id            uuid primary key default uuid_generate_v4(),
  nome          text not null,
  email         text unique,
  telefone      text,                          -- usado para envio de MFA WhatsApp
  cargo         text not null check (cargo in ('Júnior', 'Pleno', 'Sênior')),
  meta_mensal   numeric(12,2) not null,
  taxa_comissao numeric(4,3) not null default 0.05,
  created_at    timestamptz default now()
);

-- ─── Tabela de Performance de Vendas (por ciclo/mês) ──────
create table if not exists performance_vendas (
  id                    uuid primary key default uuid_generate_v4(),
  funcionario_id        uuid references funcionarios(id) on delete cascade,
  faturamento_realizado numeric(12,2) not null default 0,
  ciclo                 text not null,            -- ex: '2026-10'
  created_at            timestamptz default now(),
  unique (funcionario_id, ciclo)
);

-- ─── Breakdown Semanal por Funcionário ───────────────────
create table if not exists performance_semanal (
  id             uuid primary key default uuid_generate_v4(),
  funcionario_id uuid references funcionarios(id) on delete cascade,
  semana         int not null check (semana between 1 and 5),
  valor_acumulado numeric(12,2) not null,
  ciclo          text not null,
  created_at     timestamptz default now(),
  unique (funcionario_id, ciclo, semana)
);

-- ─── Perfis de Acesso ────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  tipo_acesso  text not null default 'gestor'
                 check (tipo_acesso in ('gestor', 'demo')),
  telefone     text,
  created_at   timestamptz default now()
);

-- ─── Tokens MFA (armazenamento temporário, server-side) ──
create table if not exists mfa_tokens (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  token       text not null,
  expires_at  timestamptz not null,
  used        boolean default false,
  attempts    int default 0,
  created_at  timestamptz default now()
);

-- ─── Dispositivos Confiáveis ──────────────────────────────
create table if not exists trusted_devices (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  fingerprint text not null,
  label       text,                              -- ex: "Chrome / Windows"
  created_at  timestamptz default now(),
  unique (user_id, fingerprint)
);

-- ─── View Consolidada para o Dashboard ───────────────────
create or replace view vw_performance_dashboard as
select
  f.id                                                            as funcionario_id,
  f.nome,
  f.cargo,
  f.meta_mensal,
  f.taxa_comissao,
  p.faturamento_realizado,
  p.ciclo,
  round((p.faturamento_realizado / f.meta_mensal) * 100, 1)      as percentual_atingimento,
  case
    when p.faturamento_realizado >= f.meta_mensal * 1.10 then 'Superada'
    when p.faturamento_realizado >= f.meta_mensal         then 'Atingida'
    else                                                       'Parcial'
  end                                                             as status_meta,
  round(p.faturamento_realizado * f.taxa_comissao, 2)            as comissao_projetada
from funcionarios f
join performance_vendas p on p.funcionario_id = f.id;
