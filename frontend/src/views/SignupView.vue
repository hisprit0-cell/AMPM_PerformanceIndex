<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center glass-page-bg">
        <!-- 📄 회원가입 카드 (이메일 전용) -->
        <q-card class="glass-form-card q-pa-lg" style="width: 450px; max-width: 90vw;">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-bolder text-neon q-mb-xs">AMPM</div>
            <div class="text-subtitle2 text-grey-4">Enterprise Performance Membership</div>
          </q-card-section>

          <!-- 🟦 Google 간편 가입 -->
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
              Google 계정으로 계속하기
            </q-btn>
          </q-card-section>

          <!-- 구분선 -->
          <div class="row items-center q-px-md q-my-sm">
            <div class="col divider-line"></div>
            <div class="col-auto q-mx-sm text-grey-5 text-caption">또는 이메일로</div>
            <div class="col divider-line"></div>
          </div>

          <!-- 📧 이메일/비밀번호 가입 -->
          <q-card-section class="q-gutter-y-md q-pt-none">
            <q-input v-model="form.email" label="이메일 주소" type="email" filled color="neon" dark dense autocomplete="email">
              <template v-slot:prepend><q-icon name="email" /></template>
            </q-input>
            <q-input v-model="form.password" label="비밀번호 (6자 이상)" type="password" filled color="neon" dark dense autocomplete="new-password">
              <template v-slot:prepend><q-icon name="vpn_key" /></template>
            </q-input>
            <q-input v-model="form.confirm" label="비밀번호 확인" type="password" filled color="neon" dark dense autocomplete="new-password" @keyup.enter="handleSignup">
              <template v-slot:prepend><q-icon name="lock_reset" /></template>
            </q-input>
          </q-card-section>

          <!-- 💡 승인 정책 안내 -->
          <q-banner dense class="bg-blue-grey-9 text-white q-mt-md rounded-borders opacity-8">
            <template v-slot:avatar><q-icon name="info" color="neon" /></template>
            <div class="text-caption">본 홈페이지는 폐쇄형 대시보드입니다.<br/>가입 신청 후 관리자의 <b>승인</b>을 받아야 로그인 가능합니다.</div>
          </q-banner>

          <q-card-actions class="column q-gutter-y-sm q-mt-lg">
            <q-btn
              label="가입 신청하기"
              color="neon"
              class="full-width text-weight-bold"
              rounded
              unelevated
              size="lg"
              :loading="loading"
              @click="handleSignup"
            />
            <div class="row full-width justify-center q-mt-sm">
              <q-btn flat dense label="이미 회원이신가요? 로그인" to="/login" color="grey-5" no-caps />
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
const { signup, loginWithGoogle } = useAuth()

const loading = ref(false)
const googleLoading = ref(false)
const form = reactive({ email: '', password: '', confirm: '' })

/**
 * 📧 이메일 가입 처리
 */
const handleSignup = async () => {
  if (!form.email || !form.password) {
    return $q.notify({ color: 'warning', message: '이메일과 비밀번호를 입력해주세요.' })
  }
  if (form.password.length < 6) {
    return $q.notify({ color: 'warning', message: '비밀번호는 6자 이상이어야 합니다.' })
  }
  if (form.password !== form.confirm) {
    return $q.notify({ color: 'negative', message: '비밀번호가 일치하지 않습니다.', icon: 'warning' })
  }

  loading.value = true
  try {
    await signup(form.email.trim(), form.password)
    $q.notify({ color: 'info', message: '가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.', icon: 'info', timeout: 4000 })
    router.push('/login')
  } catch (err) {
    $q.notify({ color: 'negative', message: err.message || '회원가입에 실패했습니다.', icon: 'error' })
  } finally {
    loading.value = false
  }
}

/**
 * 🟦 Google OAuth 가입/로그인
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
.opacity-8 { opacity: 0.8; }

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
