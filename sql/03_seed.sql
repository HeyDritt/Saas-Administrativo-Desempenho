-- ============================================================
-- SPUTNIK DASHBOARD — SEED DATA
-- Rode este arquivo APÓS o 02_rls.sql
-- IMPORTANTE: Os UUIDs dos funcionários serão gerados automaticamente.
--             Ajuste o ciclo '2026-10' conforme necessário.
-- ============================================================

-- ─── Funcionários ─────────────────────────────────────────
insert into funcionarios (nome, email, telefone, cargo, meta_mensal, taxa_comissao) values
  ('Marcos Silva',   'marcos.silva@empresa.com',   '+5511999990001', 'Sênior', 150000, 0.06),
  ('Julia Costa',    'julia.costa@empresa.com',    '+5511999990002', 'Pleno',  100000, 0.05),
  ('Roberto Alves',  'roberto.alves@empresa.com',  '+5511999990003', 'Júnior',  80000, 0.04),
  ('Ana Lima',       'ana.lima@empresa.com',        '+5511999990004', 'Sênior', 150000, 0.06),
  ('Thiago Mendes',  'thiago.mendes@empresa.com',  '+5511999990005', 'Pleno',  100000, 0.05),
  ('Carla Souza',    'carla.souza@empresa.com',    '+5511999990006', 'Júnior',  80000, 0.04);

-- ─── Performance Mensal (ciclo 2026-10) ───────────────────
insert into performance_vendas (funcionario_id, faturamento_realizado, ciclo)
select f.id, dados.valor, '2026-10'
from (
  values
    ('Marcos Silva',  185000::numeric),
    ('Julia Costa',   105000::numeric),
    ('Roberto Alves',  45000::numeric),
    ('Ana Lima',      148000::numeric),
    ('Thiago Mendes', 112000::numeric),
    ('Carla Souza',    85000::numeric)
) as dados(nome, valor)
join funcionarios f on f.nome = dados.nome;

-- ─── Breakdown Semanal (ciclo 2026-10) ───────────────────
-- Comportamentos distintos por vendedor conforme especificado

-- Marcos Silva: pico alto na segunda semana
insert into performance_semanal (funcionario_id, semana, valor_acumulado, ciclo)
select f.id, s.semana, s.valor, '2026-10'
from funcionarios f
cross join (values (1, 35000::numeric), (2, 130000::numeric), (3, 165000::numeric), (4, 185000::numeric)) as s(semana, valor)
where f.nome = 'Marcos Silva';

-- Julia Costa: crescimento linear e constante
insert into performance_semanal (funcionario_id, semana, valor_acumulado, ciclo)
select f.id, s.semana, s.valor, '2026-10'
from funcionarios f
cross join (values (1, 26250::numeric), (2, 52500::numeric), (3, 78750::numeric), (4, 105000::numeric)) as s(semana, valor)
where f.nome = 'Julia Costa';

-- Roberto Alves: curva achatada, estagnado
insert into performance_semanal (funcionario_id, semana, valor_acumulado, ciclo)
select f.id, s.semana, s.valor, '2026-10'
from funcionarios f
cross join (values (1, 15000::numeric), (2, 22000::numeric), (3, 28000::numeric), (4, 45000::numeric)) as s(semana, valor)
where f.nome = 'Roberto Alves';

-- Ana Lima: arrancada forte nos últimos dias
insert into performance_semanal (funcionario_id, semana, valor_acumulado, ciclo)
select f.id, s.semana, s.valor, '2026-10'
from funcionarios f
cross join (values (1, 20000::numeric), (2, 45000::numeric), (3, 70000::numeric), (4, 148000::numeric)) as s(semana, valor)
where f.nome = 'Ana Lima';

-- Thiago Mendes: vendas fechadas em grandes lotes (saltos)
insert into performance_semanal (funcionario_id, semana, valor_acumulado, ciclo)
select f.id, s.semana, s.valor, '2026-10'
from funcionarios f
cross join (values (1, 15000::numeric), (2, 60000::numeric), (3, 65000::numeric), (4, 112000::numeric)) as s(semana, valor)
where f.nome = 'Thiago Mendes';

-- Carla Souza: bateu a meta cedo e estabilizou
insert into performance_semanal (funcionario_id, semana, valor_acumulado, ciclo)
select f.id, s.semana, s.valor, '2026-10'
from funcionarios f
cross join (values (1, 30000::numeric), (2, 65000::numeric), (3, 82000::numeric), (4, 85000::numeric)) as s(semana, valor)
where f.nome = 'Carla Souza';

-- ─── Conta de Demonstração (crie no Supabase Auth primeiro) ──
-- Após criar o usuário gestor@sputnik.com no Supabase Auth,
-- execute o INSERT abaixo substituindo <UUID_DO_USUARIO_DEMO> pelo UUID real:
--
-- insert into profiles (id, email, tipo_acesso) values
--   ('<UUID_DO_USUARIO_DEMO>', 'gestor@sputnik.com', 'demo');
--
-- Para criar via SQL sem UI:
-- select id from auth.users where email = 'gestor@sputnik.com';
-- (use o UUID retornado acima)
