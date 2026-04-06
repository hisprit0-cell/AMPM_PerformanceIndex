<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 🏢 상단 헤더: 회사 로고, 테마 토글, 유저 메뉴 포함 (Header with Logo, Theme Toggle, User Menu) -->
    <q-header elevated class="glass-card text-white">
      <q-toolbar class="q-py-md">
        <q-btn flat round dense icon="dashboard" class="q-mr-sm" color="neon" to="/" />
        <q-toolbar-title class="text-weight-bolder text-h5" style="letter-spacing: -0.5px;">
          <span class="text-neon">AMPM</span> <span class="text-grey-4">Performance Index</span>
        </q-toolbar-title>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <!-- 🌓 테마 토글 버튼 (Dark/Light Theme Toggle) -->
          <q-btn flat round dense 
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" 
            @click="toggleDarkMode"
          >
            <q-tooltip>{{ $q.dark.isActive ? '라이트 모드' : '다크 모드' }}</q-tooltip>
          </q-btn>

          <!-- 👤 로그인/사용자 섹션 (Auth/User Section) -->
          <template v-if="!isLoggedIn">
            <q-btn flat label="로그인" to="/login" class="text-grey-4" />
            <q-btn outline label="회원가입" to="/signup" color="neon" />
          </template>
          <template v-else>
            <q-btn flat round dense icon="account_circle">
              <q-menu flat class="glass-card">
                <q-list style="min-width: 150px">
                  <q-item-label header class="text-neon">안녕하세요, {{ user?.username }}님</q-item-label>
                  <q-separator dark />
                  <q-item clickable v-close-popup v-if="isAdmin" to="/admin">
                    <q-item-section avatar><q-icon name="admin_panel_settings" /></q-item-section>
                    <q-item-section>관리자 페이지</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="handleLogout">
                    <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
                    <q-item-section class="text-negative">로그아웃</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </template>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <!-- 🔄 라우터 뷰: 페이지별 콘텐츠가 표시됨 (Router view container) -->
      <router-view v-slot="{ Component }">
        <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- 🦶 푸터 영역 복구 (Footer Restored) -->
    <q-footer class="glass-footer text-grey-4 q-pa-md text-center">
      <div class="row justify-between items-center">
        <div class="text-caption">
          © {{ new Date().getFullYear() }} AMPM Enterprise Intelligence. All rights reserved.
        </div>
        <div class="text-caption row items-center">
          <q-icon name="check_circle" color="positive" class="q-mr-xs" /> System Operational
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuth } from '../store/auth'

const $q = useQuasar()
const router = useRouter()
const { isLoggedIn, isAdmin, user, logout } = useAuth()

/**
 * @description 다크모드 상태 토글 및 로컬 스토리지 저장 (Toggle dark mode and save preference)
 */
const toggleDarkMode = () => {
  $q.dark.toggle()
  localStorage.setItem('dark-mode', $q.dark.isActive)
}

/**
 * @description 로그아웃 처리 및 로그인 페이지로 이동 (Logout and redirect)
 */
const handleLogout = () => {
  logout()
  $q.notify({ color: 'info', message: '로그아웃 되었습니다.', icon: 'info' })
  router.push('/login')
}
</script>

<style scoped>
/* 🕶️ 헤더 글래스모피즘 효과 (Header Glassmorphism) */
.glass-card, .glass-footer {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.08); /* Footer top border */
}
.glass-card {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.body--light .glass-card, .body--light .glass-footer {
  background: rgba(255, 255, 255, 0.8);
  color: #1e293b;
}
.text-neon {
  color: #00f2ff;
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
}
</style>
