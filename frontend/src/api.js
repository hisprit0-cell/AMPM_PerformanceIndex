import axios from 'axios';
import { useAuth } from './store/auth';

/**
 * 📡 API 호출 유틸리티 (API Helper)
 * @description 백엔드 서버와의 비동기 통신 및 토큰 자동 첨부 (Async communication with backend)
 */
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
});

/**
 * 🔒 요청 인터셉터 (Request Interceptor)
 * @description 모든 요청에 인증 토큰(JWT)을 자동으로 전송 (Attaching JWT to every request)
 */
api.interceptors.request.use((config) => {
  const { token } = useAuth();
  if (token.value) {
    config.headers.Authorization = `Bearer ${token.value}`;
  }
  return config;
}, (error) => Promise.reject(error));

/**
 * 🔓 응답 인터셉터 (Response Interceptor)
 * @description 인증 만료 시 로그아웃 처리 및 알림 (Log out on token expiration)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuth();
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
