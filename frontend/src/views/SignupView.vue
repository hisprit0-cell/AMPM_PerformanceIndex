<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center glass-page-bg">
        <!-- 📄 회원가입 카드: 글래스모피즘 스타일 기반 (Signup form with Glassmorphism) -->
        <q-card class="glass-form-card q-pa-lg" style="width: 450px; max-width: 90vw;">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-bolder text-neon q-mb-xs">AMPM</div>
            <div class="text-subtitle2 text-grey-4">Enterprise Performance Membership</div>
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
            <!-- 📧 회원가입 정보 입력 (Signup Information) -->
            <q-input v-model="signupForm.username" label="아이디" filled color="neon" dark dense>
              <template v-slot:prepend><q-icon name="person_add" /></template>
            </q-input>
            <q-input v-model="signupForm.email" label="이메일 주소" type="email" filled color="neon" dark dense>
              <template v-slot:prepend><q-icon name="email" /></template>
            </q-input>
            <q-input v-model="signupForm.password" label="비밀번호" type="password" filled color="neon" dark dense>
              <template v-slot:prepend><q-icon name="vpn_key" /></template>
            </q-input>
            <q-input v-model="signupForm.confirmPassword" label="비밀번호 확인" type="password" filled color="neon" dark dense>
              <template v-slot:prepend><q-icon name="lock_reset" /></template>
            </q-input>
          </q-card-section>

          <!-- 💡 회원 승인 정책 안내 (Approval Policy Disclaimer) -->
          <q-banner dense class="bg-blue-grey-9 text-white q-mt-md rounded-borders opacity-8">
            <template v-slot:avatar><q-icon name="info" color="neon" /></template>
            <div class="text-caption">본 홈페이지는 폐쇄형 대시보드입니다. <br/> 가입 신청 후 관리자의 <b>승인</b> 후 로그인이 가능합니다.</div>
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
import api from '../api'

const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const signupForm = reactive({ username: '', email: '', password: '', confirmPassword: '' })

/**
 * @description 회원 가입 신청 처리 (Handle signup request via API)
 */
const handleSignup = async () => {
  if (!signupForm.username || !signupForm.password) return;
  if (signupForm.password !== signupForm.confirmPassword) {
    return $q.notify({ color: 'negative', message: '비밀번호가 일치하지 않습니다.', icon: 'warning' })
  }
  
  loading.value = true
  try {
    await api.post('/auth/register', signupForm);
    $q.notify({ color: 'info', message: '가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.', icon: 'info' })
    router.push('/login')
  } catch (err) {
    const msg = err.response?.data?.error || '회원가입에 실패했습니다.';
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
.opacity-8 {
  opacity: 0.8;
}
</style>
