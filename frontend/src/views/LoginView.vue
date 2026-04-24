<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center glass-page-bg">
        <!-- 📄 로그인 카드 (이메일 전용) -->
        <q-card class="glass-form-card q-pa-lg" style="width: 400px; max-width: 90vw;">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-bolder text-neon q-mb-md">AMPM</div>
            <div class="text-subtitle1 text-grey-4">Enterprise Performance Login</div>
          </q-card-section>

          <!-- 🟦 Google 간편 로그인 -->
          <q-card-section class="q-pt-none">
            <q-btn
              class="full-width google-btn"
              :loading="googleLoading"
              unelevated
              rounded
              size="md"
              @click="handleGoogle"
            >
              <img src="https://www.google.com/favicon.ico" alt="google" class="q-mr-sm" style="width:18px;height:18px;" />
              Google 계정으로 로그인
            </q-btn>
          </q-card-section>

          <!-- 구분선 -->
          <div class="row items-center q-px-md q-my-sm">
            <div class="col divider-line"></div>
            <div class="col-auto q-mx-sm text-grey-5 text-caption">또는 이메일로</div>
            <div class="col divider-line"></div>
          </div>

          <!-- 📧 이메일/비밀번호 로그인 -->
          <q-card-section class="q-gutter-md q-pt-none">
            <q-input
              v-model="form.email"
              label="이메일 주소"
              type="email"
              filled
              color="neon"
              label-color="grey-5"
              dark
              autocomplete="email"
              @keyup.enter="handleLogin"
            >
              <template v-slot:prepend><q-icon name="email" /></template>
            </q-input>

            <q-input
              v-model="form.password"
              label="비밀번호"
              type="password"
              filled
              color="neon"
              label-color="grey-5"
              dark
              autocomplete="current-password"
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
              <q-btn flat dense label="비밀번호 찾기" color="grey-5" no-caps disable />
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
const { login, loginWithGoogle } = useAuth()

const loading = ref(false)
const googleLoading = ref(false)
const form = reactive({ email: '', password: '' })

/**
 * 📧 이메일/비밀번호 로그인
 */
const handleLogin = async () => {
  if (!form.email || !form.password) {
    return $q.notify({ color: 'warning', message: '이메일과 비밀번호를 입력해주세요.' })
  }
  loading.value = true
  try {
    await login(form.email.trim(), form.password)
    $q.notify({ color: 'positive', message: '로그인 성공! 환영합니다.', icon: 'check_circle' })
    router.push('/')
  } catch (err) {
    $q.notify({ color: 'negative', message: err.message || '로그인에 실패했습니다.', icon: 'error' })
  } finally {
    loading.value = false
  }
}

/**
 * 🟦 Google OAuth 로그인
 */
const handleGoogle = async () => {
  googleLoading.value = true
  try {
    await loginWithGoogle()
  } catch (err) {
    googleLoading.value = false
    $q.notify({ color: 'negative', message: err.message, icon: 'error' })
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
.google-btn {
  background: #fff;
  color: #1f2937;
  font-weight: 600;
}
.google-btn:hover { background: #f3f4f6; }
.divider-line {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
}
</style>
