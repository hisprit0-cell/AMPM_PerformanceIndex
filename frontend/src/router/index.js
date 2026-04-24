import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../store/auth'
import MainLayout from '../layouts/MainLayout.vue'

/**
 * 🗺️ 라우팅 구성 (Route Configuration)
 * @description 대시보드, 로그인, 회원가입, 관리자 페이지 등의 경로 정의
 */
const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('../views/AdminView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'salesteam',
        name: 'SalesTeam',
        component: () => import('../features/detail/SalesDetailView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'adsteam',
        name: 'AdsTeam',
        component: () => import('../views/AdsTeamView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'devteam',
        name: 'DevTeam',
        component: () => import('../views/DevTeamView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'videoteam',
        name: 'VideoTeam',
        component: () => import('../views/VideoTeamView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'hrteam',
        name: 'HrTeam',
        component: () => import('../views/HrTeamView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'accountingteam',
        name: 'AccountingTeam',
        component: () => import('../views/AccountingTeamView.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/SignupView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 🔒 라우터 가드 (Navigation Guard)
 * @description 인증 및 권한 확인을 통해 비사용자의 접근 차단 (Checking authentication and role)
 */
router.beforeEach((to, from, next) => {
  const { isLoggedIn, isAdmin } = useAuth();
  
  // 인증이 필요한 페이지 접근 시 로그인 여부 확인
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return next('/login');
  }
  
  // 관리자 권한이 필요한 페이지 접근 시 권한 확인
  if (to.meta.requiresAdmin && !isAdmin.value) {
    return next('/');
  }

  next();
})

export default router
