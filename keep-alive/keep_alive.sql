-- ============================================================
-- Supabase Keep-Alive 전용 테이블 (재실행 안전)
-- Supabase Dashboard > SQL Editor 에 붙여넣고 Run
-- 기존 테이블(profiles, sales_data 등)은 건드리지 않음
-- ============================================================

-- 1. 가벼운 keep-alive 테이블
create table if not exists public.keep_alive (
  id        bigint generated always as identity primary key,
  pinged_at timestamptz not null default now()
);

-- 2. RLS 활성화 (Supabase 기본 보안 정책 유지)
alter table public.keep_alive enable row level security;

-- 3. anon 키로 keep-alive 동작만 허용 (이 테이블에 한정 → 최소 권한)
--    => anon key 를 GitHub Secrets 에 써도 피해 범위가 keep_alive 한 곳뿐
drop policy if exists "keep_alive anon select" on public.keep_alive;
drop policy if exists "keep_alive anon insert" on public.keep_alive;
drop policy if exists "keep_alive anon delete" on public.keep_alive;

create policy "keep_alive anon select" on public.keep_alive
  for select to anon using (true);

create policy "keep_alive anon insert" on public.keep_alive
  for insert to anon with check (true);

create policy "keep_alive anon delete" on public.keep_alive
  for delete to anon using (true);

-- (확인용) select * from public.keep_alive order by pinged_at desc;
