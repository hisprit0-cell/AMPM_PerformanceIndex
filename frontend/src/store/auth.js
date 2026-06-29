import { reactive, computed } from 'vue'
import { supabase } from '../lib/supabase'

/**
 * 🔐 인증 스토어 (Supabase Auth 기반)
 * - 식별자는 '이메일' 한 가지로 통일 (별도 아이디 없음)
 * - 이메일/비밀번호 가입 또는 Google OAuth 로그인 지원
 * - profile row 는 DB 트리거(handle_new_user)가 자동 생성
 */
const state = reactive({
  user:    JSON.parse(localStorage.getItem('user') || 'null'),
  session: null,
  ready:   false,
  // OAuth 리다이렉트 복귀 시 승인 상태(pending/blocked) 등으로 거부되면
  // 여기에 메시지를 담아 로그인 화면이 사용자에게 안내하도록 함.
  authMessage: null
})

/**
 * profile 조회 후 사용자 객체 구성 (공통 헬퍼)
 * - 트리거 타이밍 이슈 대비: 없으면 잠깐 기다렸다 1회 재시도
 */
const loadProfile = async (authUser) => {
  const fetchOnce = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', authUser.id)
      .maybeSingle()
    if (error) throw error
    return data
  }

  let profile = await fetchOnce()
  if (!profile) {
    await new Promise(r => setTimeout(r, 400))
    profile = await fetchOnce()
  }

  return {
    id:     authUser.id,
    email:  authUser.email,
    role:   profile?.role   || 'user',
    status: profile?.status || 'pending'
  }
}

const persist = (userData) => {
  state.user = userData
  localStorage.setItem('user', JSON.stringify(userData))
}

const clearPersist = () => {
  state.user = null
  state.session = null
  localStorage.removeItem('user')
}

export const useAuth = () => {
  const isLoggedIn = computed(() => !!state.user)
  const isAdmin    = computed(() => state.user?.role === 'master')
  const user       = computed(() => state.user)
  const token      = computed(() => state.session?.access_token || null)

  /**
   * 🔑 로그인 (이메일/비밀번호)
   */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message || '이메일 또는 비밀번호가 올바르지 않습니다.')
    return finalizeSession(data.user, data.session)
  }

  /**
   * 📝 회원가입 (이메일/비밀번호)
   * - profile 은 DB 트리거가 생성 (username 없음)
   * - signUp 이 즉시 세션을 주면 승인 확인 위해 즉시 로그아웃
   */
  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message || '회원가입에 실패했습니다.')
    if (data.session) await supabase.auth.signOut()
    return data
  }

  /**
   * 🟦 Google OAuth 로그인
   * - 리다이렉트 기반: Supabase → Google → 앱으로 복귀
   * - 복귀 후 restoreSession() 이 profile 조회 및 상태 판정
   */
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    })
    if (error) throw new Error(error.message || 'Google 로그인에 실패했습니다.')
  }

  /**
   * 🚪 로그아웃
   */
  const logout = async () => {
    await supabase.auth.signOut()
    clearPersist()
  }

  /**
   * 🔄 세션 복원 (앱 시작 시 1회 호출)
   * - OAuth 리다이렉트 복귀 시에도 여기서 처리됨
   */
  const restoreSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await finalizeSession(session.user, session)
    } catch (e) {
      // 승인 대기/차단 등으로 거부된 경우 로그인 화면에 안내 메시지 전달.
      // (특히 Google OAuth 복귀 시 조용히 튕기는 문제 방지)
      console.error('[auth] restoreSession 실패', e)
      state.authMessage = e?.message || '로그인할 수 없습니다.'
      clearPersist()
    } finally {
      state.ready = true
    }
  }

  /**
   * 저장된 인증 안내 메시지를 1회 읽고 비움 (로그인 화면에서 사용)
   */
  const consumeAuthMessage = () => {
    const msg = state.authMessage
    state.authMessage = null
    return msg
  }

  /**
   * 공통: 세션 확보 후 승인 상태 판정 및 영속화
   */
  const finalizeSession = async (authUser, session) => {
    const userData = await loadProfile(authUser)

    if (userData.status === 'blocked') {
      await supabase.auth.signOut()
      clearPersist()
      throw new Error('차단된 계정입니다. 관리자에게 문의하세요.')
    }
    if (userData.status !== 'approved') {
      await supabase.auth.signOut()
      clearPersist()
      throw new Error('관리자의 승인을 기다려주세요.')
    }

    state.session = session
    persist(userData)
    return userData
  }

  return {
    isLoggedIn,
    isAdmin,
    user,
    token,
    login,
    signup,
    loginWithGoogle,
    logout,
    restoreSession,
    consumeAuthMessage
  }
}
