-- ============================================================
-- SPUTNIK DASHBOARD — ROW LEVEL SECURITY
-- Rode este arquivo APÓS o 01_schema.sql
-- ============================================================

-- ─── Habilitar RLS em todas as tabelas ───────────────────
alter table funcionarios       enable row level security;
alter table performance_vendas enable row level security;
alter table performance_semanal enable row level security;
alter table profiles           enable row level security;
alter table mfa_tokens         enable row level security;
alter table trusted_devices    enable row level security;

-- ─── Leitura liberada para qualquer usuário autenticado ──
create policy "select_funcionarios"
  on funcionarios for select
  to authenticated
  using (true);

create policy "select_performance"
  on performance_vendas for select
  to authenticated
  using (true);

create policy "select_semanal"
  on performance_semanal for select
  to authenticated
  using (true);

-- Cada usuário vê apenas o próprio perfil
create policy "select_profiles"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

-- ─── Escrita somente para 'gestor' ───────────────────────
create policy "write_funcionarios"
  on funcionarios for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and tipo_acesso = 'gestor'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and tipo_acesso = 'gestor'
    )
  );

create policy "write_performance"
  on performance_vendas for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and tipo_acesso = 'gestor'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and tipo_acesso = 'gestor'
    )
  );

create policy "write_semanal"
  on performance_semanal for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and tipo_acesso = 'gestor'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and tipo_acesso = 'gestor'
    )
  );

-- ─── MFA Tokens (service role only via API Routes) ───────
-- Nenhum acesso direto do client via anon key

-- ─── Dispositivos confiáveis (somente o próprio usuário) ─
create policy "select_trusted_devices"
  on trusted_devices for select
  to authenticated
  using (auth.uid() = user_id);

create policy "insert_trusted_devices"
  on trusted_devices for insert
  to authenticated
  with check (auth.uid() = user_id);
