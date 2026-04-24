import { reactive, computed } from 'vue'
import { supabase } from '../lib/supabase'

/**
 * 🔐 인증 스토어 (Supabase Auth 기반)
 * - signUp 시 profile 은 DB 트리거(handle_new_user)가 자동 생성
 * - 클라이언트는 auth 호출만 담당
 */
const state = reactive({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  session: null,
  ready: false
})

/**
 * 📌 profile 조회 후 사용자 객체 구성 (공통 헬퍼)
 */
const loadProfile = async (authUser) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('username, role, status')
    .eq('id', authUser.id)
    .maybeSingle()

  if (error) throw error
  return {
    id: authUser.id,
    email: authUser.email,
    username: profile?.username || authUser.email,
    role: profile?.role || 'user',
    status: profile?.status || 'pending'
  }
}

export const useAuth = () => {
  const isLoggedIn = computed(() => !!state.user)
  const isAdmin    = computed(() => state.user?.role === 'master')
  const user       = computed(() => state.user)
  const token      = computed(() => state.session?.access_token || null)

  /**
   * 🔑 로그인 — 이메일/비밀번호 인증 후 profile 상태 확인
   */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message || '아이디 또는 비밀번호가 올바르지 않습니다.')

    const userData = await loadProfile(data.user)

    if (userData.status === 'blocked') {
      await supabase.auth.signOut()
      throw new Error('차단된 계정입니다. 관리자에게 문의하세요.')
    }
    if (userData.status !== 'approved') {
      await supabase.auth.signOut()
      throw new Error('관리자의 승인을 기다려주세요.')
    }

    state.user = userData
    state.session = data.session
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }

  /**
   * 📝 회원가입 — username 을 메타데이터로 전달, profile 은 DB 트리거가 생성
   */
  const signup = async (username, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    })
    if (error) throw new Error(error.message || '회원가입에 실패했습니다.')

    // 이메일 확인이 꺼져 있으면 세션이 즉시 생성됨 → 자동 로그아웃해서 승인 대기 상태 유지
    if (data.session) await supabase.auth.signOut()

    return data
  }

  /**
   * 🚪 로그아웃
   */
  const logout = async () => {
    await supabase.auth.signOut()
    state.user = null
    state.session = null
    localStorage.removeItem('user')
  }

  /**
   * 🔄 세션 복원 — 앱 시작 시 1회 호출
   */
  const restoreSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const userData = await loadProfile(session.user)
      if (userData.status !== 'approved') {
        await supabase.auth.signOut()
        state.user = null
        localStorage.removeItem('user')
        return
      }
      state.session = session
      state.user = userData
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (e) {
      console.error('[auth] restoreSession 실패', e)
    } finally {
      state.ready = true
    }
  }

  return {
    isLoggedIn,
    isAdmin,
    user,
    token,
    login,
    signup,
    logout,
    restoreSession
  }
}
