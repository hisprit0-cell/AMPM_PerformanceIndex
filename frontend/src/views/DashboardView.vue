<template>
  <q-page class="q-pa-xl dashboard-page">
    <!-- Loading -->
    <div v-if="!allReady" class="flex flex-center column" style="min-height: 80vh">
      <q-spinner-dots color="cyan" size="4em" />
      <div class="q-mt-md text-grey-5">대시보드를 불러오는 중...</div>
    </div>

    <div v-else class="dashboard-content">

      <!-- 🏠 대시보드 히어로 헤더 -->
      <div class="dash-hero q-mb-xl">
        <div>
          <div class="dash-eyebrow">ENTERPRISE PERFORMANCE</div>
          <h1 class="dash-title q-ma-none">전체 통합 대시보드</h1>
          <p class="dash-sub q-ma-none">전 부서의 핵심 성과 지표를 한눈에. 각 섹션의 <span class="text-neon">상세보기</span>로 팀별 분석에 진입하세요.</p>
        </div>
        <div class="dash-status">
          <q-icon name="bolt" color="cyan" size="18px" class="q-mr-xs" />
          <span>최근 24개월 기준</span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════
           1. 영업팀 (Sales Team) - Harness Engineering
           ═══════════════════════════════════════ -->
      <SalesTeamSection />

      <!-- ═══════════════════════════════════════
           1.5. Advertisement Performance (광고 성과) - Harness Engineering
           ═══════════════════════════════════════ -->
      <AdPerformanceSection />

      <!-- ═══════════════════════════════════════
           2. 개발팀 (Dev Team) - Harness Engineering
           ═══════════════════════════════════════ -->
      <DevTeamSection />

      <!-- ═══════════════════════════════════════
           3. 영상마케팅팀 (Video Mkt Team) - Harness Engineering
           ═══════════════════════════════════════ -->
      <VideoTeamSection />

      <!-- ═══════════════════════════════════════
           4. 인사팀 (HR Team) - Harness Engineering
           ═══════════════════════════════════════ -->
      <HrTeamSection />

      <!-- ═══════════════════════════════════════
           5. 회계팀 (Accounting Team) - Harness Engineering
           ═══════════════════════════════════════ -->
      <AccountingTeamSection />

      <!-- ═══════════════════════════════════════
           (AdPerformanceSection was moved up)
           ═══════════════════════════════════════ -->

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import GrowthItems from '../components/GrowthItems.vue'
import KpiSummaryCard from '../components/KpiSummaryCard.vue'

// 신규 분리된 컴포넌트 임포트
import SalesTeamSection from '../components/SalesTeamSection.vue'
import DevTeamSection from '../components/DevTeamSection.vue'
import VideoTeamSection from '../components/VideoTeamSection.vue'
import HrTeamSection from '../components/HrTeamSection.vue'
import AccountingTeamSection from '../components/AccountingTeamSection.vue'
import AdPerformanceSection from '../components/AdPerformanceSection.vue'

// ── Global ──────────────────────────────────────
const allReady = ref(false)
const timeline = Array(24).fill(0).map((_, i) => {
  const m = ((i + 3) % 12) + 1
  const yr = i < 9 ? '24.' : i < 21 ? '25.' : '26.'
  return yr + String(m).padStart(2, '0')
})
const getGR = (arr, type) => {
  if (!arr || arr.length < 24) return '0.0'
  const c = arr[23], p = arr[type==='mom'?22:type==='qoq'?20:type==='hoh'?17:11] || 1
  return (((c - p) / p) * 100).toFixed(1)
}
const baseO = {
  chart: { toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  stroke: { curve: 'smooth', width: 2 },
  grid: { borderColor: 'rgba(255,255,255,0.1)' },
  xaxis: { categories: timeline }
}

// ── HR Team 이주 완료 ───────────────────────────────────
// (Harness Engineering 적용으로 컴포넌트 내부로 로직 위임)

// ── Accounting Team 이주 완료 ───────────────────────────────────
// (Harness Engineering 적용으로 컴포넌트 내부로 로직 위임)

onMounted(() => {
  setTimeout(() => { allReady.value = true }, 150)
})
</script>

<style scoped>
/* ── Base ── */
.dashboard-page { background: #0b1220; color: #f8fafc; }

/* ── Hero Header ── */
.dash-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.dash-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 3px;
  color: #00f2ff;
  margin-bottom: 6px;
}
.dash-title {
  font-size: 2.3rem;
  font-weight: 900;
  letter-spacing: -1.2px;
  color: #f1f5f9;
  line-height: 1.1;
}
.dash-sub { color: #94a3b8; margin-top: 8px; font-size: 0.95rem; }
.dash-status {
  display: flex; align-items: center;
  font-size: 0.8rem; font-weight: 600;
  color: #cbd5e1;
  background: rgba(0, 242, 255, 0.08);
  border: 1px solid rgba(0, 242, 255, 0.25);
  padding: 8px 14px;
  border-radius: 999px;
}
@media (max-width: 600px) {
  .dash-title { font-size: 1.7rem; }
}

.section-container { margin-bottom: 72px; animation: fadeIn 0.7s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

/* ── Section Title ── */
.section-title {
  color: #ECEFF4; font-size: 1.8rem; font-weight: 900;
  margin-bottom: 24px;
  border-left: 5px solid #00f2ff; padding-left: 15px;
}

/* ── Glass Card ── */
.glass-card {
  background: rgba(30, 41, 59, 0.55);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: border-color 0.3s ease;
}
.glass-card:hover { border-color: rgba(0, 242, 255, 0.4); }

.col-grow { flex-grow: 1; }
</style>
