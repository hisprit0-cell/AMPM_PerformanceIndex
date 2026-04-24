<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center glass-page-bg">
        <!-- 📄 로그인 카드: 글래스모피즘 스타일 기반 (Login form with Glassmorphism) -->
        <q-card class="glass-form-card q-pa-lg" style="width: 400px; max-width: 90vw;">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-bolder text-neon q-mb-md">AMPM</div>
            <div class="text-subtitle1 text-grey-4">Enterprise Performance Login</div>
          </q-card-section>

          <q-card-section class="q-gutter-md">
            <!-- 📧 아이디 입력 (Username Input) -->
            <q-input 
              v-model="loginForm.username" 
              label="사용자 이름" 
              filled 
              color="neon" 
              label-color="grey-5"
              dark
              @keyup.enter="handleLogin"
            >
              <template v-slot:prepend><q-icon name="person" /></template>
            </q-input>

            <!-- 🔑 비밀번호 입력 (Password Input) -->
            <q-input 
              v-model="loginForm.password" 
              label="비밀번호" 
              type="password" 
              filled 
              color="neon"
              label-color="grey-5"
              dark
              @keyup.enter="handleLogin"
            >
              <template v-slot:prepend><q-icon name="lock" /></template>
            </q-input>
          </q-card-section>

          <q-card-actions class="column q-gutter-y-sm">
            <q-btn 
              label="로그인 하기" 
              color="neon" 
              class="full-width text-weight-bold" 
              rounded 
              unelevated 
              size="lg"
              :loading="loading"
              @click="handleLogin"
            />
            <div class="row full-width justify-between q-mt-md">
              <q-btn flat dense label="회원가입 신청" to="/signup" color="grey-5" no-caps />
              <q-btn flat dense label="비밀번호 찾기" color="grey-5" no-caps />
            </div>
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '../store/auth'

const router = useRouter()
const $q = useQuasar()
const { login } = useAuth()

const loading = ref(false)
const loginForm = reactive({ username: '', password: '' })

/**
 * @description 로그인 버튼 클릭 핸들러 (Handle user login via Supabase Auth)
 */
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) return;
  
  loading.value = true
  try {
    // username을 email로 사용 (username에 @가 없으면 @ampm.co.kr 자동 부여)
    const email = loginForm.username.includes('@') 
      ? loginForm.username 
      : `${loginForm.username}@ampm.co.kr`
    
    await login(email, loginForm.password)
    $q.notify({ color: 'positive', message: '로그인 성공! 환영합니다.', icon: 'check_circle' })
    router.push('/')
  } catch (err) {
    const msg = err.message || '로그인에 실패했습니다. 정보를 확인해주세요.';
    $q.notify({ color: 'negative', message: msg, icon: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.glass-page-bg {
  background: #050A15;
  background-image: radial-gradient(circle at 20% 20%, rgba(0, 242, 255, 0.05) 0%, transparent 40%),
                    radial-gradient(circle at 80% 80%, rgba(242, 108, 36, 0.05) 0%, transparent 40%);
}
.glass-form-card {
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}
.text-neon {
  color: #00f2ff;
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
}
</style>
