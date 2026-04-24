-- ============================================
-- AMPM Performance Index - Supabase 스키마 (재실행 가능)
-- Supabase Dashboard > SQL Editor 에서 전체 복사 후 Run
-- ============================================

-- 1. profiles 테이블 (인증 사용자 확장 정보)
--    이메일은 auth.users 에 이미 있으므로 profiles 에는 저장하지 않음.
--    username 컬럼은 제거됨 (이메일을 식별자로 사용).
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('master', 'user')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1-1. 기존 배포 대응: username 컬럼이 남아있으면 제거
ALTER TABLE profiles DROP COLUMN IF EXISTS username;

-- 2. sales_data 테이블 (영업 실적)
CREATE TABLE IF NOT EXISTS sales_data (
  id SERIAL PRIMARY KEY,
  month VARCHAR(7) NOT NULL,
  division VARCHAR(50) NOT NULL,
  team VARCHAR(50) NOT NULL,
  name VARCHAR(30),
  revenue DECIMAL(15,2) DEFAULT 0,
  headcount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, division, team, name)
);

-- 3. RLS 활성화 (이미 켜져 있어도 안전)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;

-- 4. profiles 정책 (idempotent)
DROP POLICY IF EXISTS "Users can read own profile"          ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile"        ON profiles;
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"        ON profiles;
DROP POLICY IF EXISTS "Master can update any profile"       ON profiles;

CREATE POLICY "Authenticated can read all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 관리자(master) 는 모든 profile 을 UPDATE 할 수 있음 (승인/차단 처리용)
CREATE POLICY "Master can update any profile" ON profiles
  FOR UPDATE TO authenticated
  USING ( EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'master') );

-- 5. sales_data 정책 (idempotent)
DROP POLICY IF EXISTS "Authenticated can read sales_data"   ON sales_data;
DROP POLICY IF EXISTS "Authenticated can insert sales_data" ON sales_data;
DROP POLICY IF EXISTS "Authenticated can update sales_data" ON sales_data;

CREATE POLICY "Authenticated can read sales_data" ON sales_data
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert sales_data" ON sales_data
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update sales_data" ON sales_data
  FOR UPDATE TO authenticated USING (true);

-- 6. 인덱스
CREATE INDEX IF NOT EXISTS idx_sales_month    ON sales_data (month);
CREATE INDEX IF NOT EXISTS idx_sales_division ON sales_data (division);

-- ============================================
-- 7. 가입 시 profile 자동 생성 트리거
--    - 이메일/비밀번호 가입, Google OAuth 가입 모두 지원
--    - RLS 우회 (SECURITY DEFINER) 로 세션 없이도 동작
--    - 첫 가입자 → master/approved, 그 외 → user/pending
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count  INT;
  v_role   TEXT;
  v_status TEXT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.profiles;
  IF v_count = 0 THEN
    v_role := 'master'; v_status := 'approved';
  ELSE
    v_role := 'user';   v_status := 'pending';
  END IF;

  INSERT INTO public.profiles (id, role, status)
  VALUES (NEW.id, v_role, v_status)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. 이메일 자동 확인 트리거
--    사내 승인(pending/approved) 플로우로 충분하므로 이메일 확인 스킵.
--    Google OAuth 가입자는 이미 확인 상태라 영향 없음.
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
BEGIN
  -- confirmed_at 은 generated 컬럼(email/phone 중 먼저 확인된 시각)이라 직접 UPDATE 불가.
  -- email_confirmed_at 만 세팅하면 confirmed_at 은 자동 반영됨.
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_user();

-- (선택) 기존 미확인 유저 일괄 확인 — 이번 마이그레이션 시 1회 실행
-- confirmed_at 은 generated 컬럼이므로 email_confirmed_at 만 세팅.
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
