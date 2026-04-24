import { createClient } from '@supabase/supabase-js'

/**
 * 🌐 Supabase 클라이언트 초기화
 * @description Supabase Auth + Database를 프론트엔드에서 직접 사용
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
