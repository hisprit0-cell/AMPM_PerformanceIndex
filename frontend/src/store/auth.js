import { reactive, computed } from 'vue'
import { supabase } from '../lib/supabase'

const state = reactive({
  user: JSON.parse(localStorage.getItem('user')) || null,
  session: null
})

/**
 * 🔐 인증 상태 관리 (Authentication Store - Supabase)
 * @description Supabase Auth 기반 로그인/회원가입/세션 관리
 */
export const useAuth = () => {
  const isLoggedIn = computed(() => !!state.user)
  const isAdmin = computed(() => state.user?.role === 'master')
  const user = computed(() => state.user)
  const token = computed(() => state.session?.access_token || null)

  /**
   * 🔑 로그인 처리 (Supabase Auth)
   */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // profiles 테이블에서 역할 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role, status')
      .eq('id', data.user.id)
      .single()

    if (profile && profile.status !== 'approved') {
      await supabase.auth.signOut()
      throw new Error('관리자의 승인을 기다려주세요.')
    }

    const userData = {
      id: data.user.id,
      username: profile?.username || data.user.email,
      email: data.user.email,
      role: profile?.role || 'user'
    }

    state.user = userData
    state.session = data.session
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }

  /**
   * 📝 회원가입 처리 (Supabase Auth + profiles 테이블)
   */
  const signup = async (username, email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    // profiles 테이블에 사용자 정보 저장
    if (data.user) {
      // 첫 번째 사용자인지 확인
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const role = count === 0 ? 'master' : 'user'
      const status = count === 0 ? 'approved' : 'pending'

      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        role,
        status
      })
    }

    return data
  }

  /**
   * 🔑 기존 방식 호환용 setAuth (로컬 스토리지에 직접 저장)
   */
  const setAuth = (userData, tokenData) => {
    state.user = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  }

  /**
   * 🚪 로그아웃 처리 (Supabase Auth)
   */
  const logout = async () => {
    await supabase.auth.signOut()
    state.user = null
    state.session = null
    localStorage.removeItem('user')
  }

  /**
   * 🔄 세션 복원 (앱 시작 시 호출)
   */
  const restoreSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      state.session = session
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, role, status')
        .eq('id', session.user.id)
        .single()

      state.user = {
        id: session.user.id,
        username: profile?.username || session.user.email,
        email: session.user.email,
        role: profile?.role || 'user'
      }
      localStorage.setItem('user', JSON.stringify(state.user))
    }
  }

  return {
    isLoggedIn,
    isAdmin,
    user,
    token,
    login,
    signup,
    setAuth,
    logout,
    restoreSession
  }
}
