-- ============================================
-- AMPM Performance Index - Supabase 테이블 생성
-- Supabase Dashboard > SQL Editor 에서 실행
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

-- 3. RLS (Row Level Security) 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;

-- 4. profiles 정책: 인증된 사용자가 자신의 프로필 읽기 가능
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- profiles 정책: 인증된 사용자가 프로필 삽입 가능
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- profiles 정책: 모든 인증된 사용자가 profiles 읽기 가능 (관리자 페이지용)
CREATE POLICY "Authenticated can read all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

-- 5. sales_data 정책: 인증된 사용자 읽기/쓰기 가능
CREATE POLICY "Authenticated can read sales_data" ON sales_data
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert sales_data" ON sales_data
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update sales_data" ON sales_data
  FOR UPDATE TO authenticated USING (true);

-- 6. 인덱스
CREATE INDEX IF NOT EXISTS idx_sales_month ON sales_data (month);
CREATE INDEX IF NOT EXISTS idx_sales_division ON sales_data (division);
