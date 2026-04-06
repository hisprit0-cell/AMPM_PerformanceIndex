import { reactive, computed } from 'vue'

const state = reactive({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null
})

/**
 * 🔐 인증 상태 관리 (Authentication Store)
 * @description 로그인 정보 및 토큰 관리 (Manage user info and token)
 */
export const useAuth = () => {
  const isLoggedIn = computed(() => !!state.token)
  const isAdmin = computed(() => state.user?.role === 'master')
  const user = computed(() => state.user)
  const token = computed(() => state.token)

  /**
   * 🔑 로그인 처리 (Set Login Info)
   */
  const setAuth = (userData, tokenData) => {
    state.user = userData;
    state.token = tokenData;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  }

  /**
   * 🚪 로그아웃 처리 (Logout and clear storage)
   */
  const logout = () => {
    state.user = null;
    state.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  return {
    isLoggedIn,
    isAdmin,
    user,
    token,
    setAuth,
    logout
  }
}
