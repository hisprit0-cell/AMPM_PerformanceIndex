<template>
  <q-page class="q-pa-lg q-pa-md-xl team-detail-page">
    <!-- 🧭 브레드크럼 -->
    <div class="breadcrumb q-mb-md">
      <router-link to="/" class="bc-link">홈</router-link>
      <q-icon name="chevron_right" size="16px" />
      <span class="bc-current">{{ subtitle }}</span>
    </div>

    <!-- 🔝 헤더 -->
    <div class="row justify-between items-center q-mb-xl q-gutter-y-md">
      <div class="row items-center no-wrap">
        <q-btn flat round color="neon" icon="arrow_back" to="/" class="q-mr-md">
          <q-tooltip>대시보드로</q-tooltip>
        </q-btn>
        <div>
          <h1 class="page-title q-ma-none">
            <span class="text-neon">{{ eyebrow }}</span> Team Analysis
          </h1>
          <p class="q-ma-none text-subtitle1" style="color: var(--text-muted);">{{ subtitle }}</p>
        </div>
      </div>

      <q-btn
        outline rounded no-caps
        color="neon"
        icon="cloud_upload"
        label="기초데이터 연동"
        class="text-weight-bold"
        @click="onConnect"
      />
    </div>

    <!-- 📊 상단 요약 영역 (슬롯) -->
    <slot />

    <!-- 📉 하단 상세 내역 -->
    <div class="q-mt-xl">
      <div class="row items-center q-mb-lg">
        <div class="text-h5 text-weight-bolder" style="color: var(--text-primary);">상세 내역</div>
        <q-badge outline color="cyan" class="q-ml-md" label="Detailed Breakdown" />
      </div>

      <ComingSoon
        :icon="comingIcon"
        :description="comingDesc"
        :features="features"
        @connect="onConnect"
      />
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import ComingSoon from './ComingSoon.vue'

defineProps({
  eyebrow:    { type: String, required: true },
  subtitle:   { type: String, required: true },
  comingDesc: { type: String, default: '세부 지표 데이터가 이곳에 표시될 예정입니다.' },
  comingIcon: { type: String, default: 'analytics' },
  features:   { type: Array,  default: () => [] }
})

const $q = useQuasar()
const onConnect = () => {
  $q.notify({
    color: 'info',
    icon: 'cloud_upload',
    message: '기초데이터 연동 기능은 준비 중입니다. 곧 제공될 예정입니다.',
    timeout: 3000
  })
}
</script>

<style scoped>
.team-detail-page {
  background: radial-gradient(circle at top right, rgba(0, 242, 255, 0.06), transparent 420px),
              radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.06), transparent 420px);
}

.page-title {
  font-size: 2.1rem;
  font-weight: 900;
  letter-spacing: -1.2px;
  color: var(--text-primary);
}

/* 브레드크럼 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.bc-link { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
.bc-link:hover { color: var(--neon); }
.bc-current { color: var(--text-secondary); font-weight: 600; }

@media (max-width: 600px) {
  .page-title { font-size: 1.6rem; }
}
</style>
