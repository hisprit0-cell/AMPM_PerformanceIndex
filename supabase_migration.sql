-- ============================================
-- AMPM Performance Index - Supabase 스키마 (재실행 가능)
-- Supabase Dashboard > SQL Editor 에서 전체 복사 후 Run
-- ============================================

-- 1. 프로필 테이블 (인증 사용자 확장 정보)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('master', 'user')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 영업 데이터 테이블
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

-- 4. profiles 정책 — 기존 정책 제거 후 재생성 (idempotent)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Authenticated can read all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 5. sales_data 정책 — 재실행 가능
DROP POLICY IF EXISTS "Authenticated can read sales_data" ON sales_data;
DROP POLICY IF EXISTS "Authenticated can insert sales_data" ON sales_data;
DROP POLICY IF EXISTS "Authenticated can update sales_data" ON sales_data;

CREATE POLICY "Authenticated can read sales_data" ON sales_data
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert sales_data" ON sales_data
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update sales_data" ON sales_data
  FOR UPDATE TO authenticated USING (true);

-- 6. 인덱스
CREATE INDEX IF NOT EXISTS idx_sales_month ON sales_data (month);
CREATE INDEX IF NOT EXISTS idx_sales_division ON sales_data (division);

-- ============================================
-- 7. 가입 시 profile 자동 생성 트리거
--    - RLS 우회 (SECURITY DEFINER) 로 세션 없이도 동작
--    - 첫 가입자 → master/approved, 그 외 → user/pending
--    - username 은 signUp 시 options.data.username 으로 전달
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_count    INT;
  v_role     TEXT;
  v_status   TEXT;
BEGIN
  -- username 은 메타데이터에서, 없으면 이메일 로컬파트 사용
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  -- username 충돌 시 uid 접미사 부여 (회원가입 자체가 실패하지 않도록)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) THEN
    v_username := v_username || '_' || substr(NEW.id::text, 1, 8);
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.profiles;
  IF v_count = 0 THEN
    v_role := 'master'; v_status := 'approved';
  ELSE
    v_role := 'user';   v_status := 'pending';
  END IF;

  INSERT INTO public.profiles (id, username, role, status)
  VALUES (NEW.id, v_username, v_role, v_status);

  RETURN NEW;
END;
$$;

-- 트리거 재등록 (재실행 안전)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
