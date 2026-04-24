<template>
  <q-layout view="hHh Lpr lFf">
    <!-- 🏢 상단 헤더: 회사 로고, 테마 토글, 유저 메뉴 포함 (Header with Logo, Theme Toggle, User Menu) -->
    <q-header elevated class="glass-header text-white">
      <q-toolbar class="q-py-sm">
        <q-toolbar-title class="text-weight-bolder text-h5" style="letter-spacing: -0.5px;">
          <router-link to="/" style="text-decoration: none;">
            <span class="text-neon">AMPM</span> <span class="text-grey-4">Performance Index</span>
          </router-link>
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
              <q-menu flat class="glass-header">
                <q-list style="min-width: 150px">
                  <q-item-label header class="text-neon">안녕하세요, {{ user?.email }}님</q-item-label>
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

      <!-- 📌 상단 수평 메뉴 (Horizontal Navigation Bar) -->
      <div class="top-nav-bar">
        <router-link 
          v-for="item in navItems" :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActiveRoute(item.path) }"
        >
          <q-icon :name="item.icon" size="18px" class="q-mr-xs" />
          {{ item.label }}
        </router-link>
      </div>
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
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../store/auth'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const { isLoggedIn, isAdmin, user, logout } = useAuth()

const navItems = [
  { path: '/', label: '전체', icon: 'dashboard' },
  { path: '/salesteam', label: '영업팀', icon: 'point_of_sale' },
  { path: '/adsteam', label: '광고성과', icon: 'campaign' },
  { path: '/devteam', label: '개발팀', icon: 'code' },
  { path: '/videoteam', label: '영상마케팅팀', icon: 'movie' },
  { path: '/hrteam', label: '인사팀', icon: 'people' },
  { path: '/accountingteam', label: '회계팀', icon: 'account_balance' },
]

const isActiveRoute = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

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
.glass-header, .glass-footer {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
}
.glass-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.glass-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.body--light .glass-header, .body--light .glass-footer {
  background: rgba(255, 255, 255, 0.8);
  color: #1e293b;
}
.text-neon {
  color: #00f2ff;
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
}

/* 📌 상단 수평 메뉴 스타일 */
.top-nav-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 16px 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.top-nav-bar::-webkit-scrollbar { display: none; }

.nav-item {
  display: flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
}
.nav-item:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.1);
}
.nav-item.active {
  color: #000;
  background: #00f2ff;
  box-shadow: 0 0 12px rgba(0, 242, 255, 0.4);
}
</style>
