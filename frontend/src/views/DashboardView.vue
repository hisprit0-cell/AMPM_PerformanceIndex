<template>
  <q-page class="q-pa-xl dashboard-page">
    <!-- Loading -->
    <div v-if="!allReady" class="flex flex-center" style="min-height: 80vh">
      <q-spinner-dots color="primary" size="4em" />
    </div>

    <div v-else class="dashboard-content">

      <!-- ═══════════════════════════════════════
           1. 영업팀 (Sales Team) - Harness Engineering
           ═══════════════════════════════════════ -->
      <SalesTeamSection />

      <!-- ═══════════════════════════════════════
           2. 개발팀 (Dev Team) - Harness Engineering
           ═══════════════════════════════════════ -->
      <DevTeamSection />

      <!-- ═══════════════════════════════════════
           3. 영상마케팅팀 (Video Mkt Team) - Harness Engineering
           ═══════════════════════════════════════ -->
      <VideoTeamSection />

      <!-- ═══════════════════════════════════════
           4. 인사팀 (HR Team)
           ═══════════════════════════════════════ -->
      <div v-if="hrReady" class="section-container">
        <h2 class="section-title">HR & Recruitment (인사팀)</h2>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-8">
            <q-card class="glass-card q-pa-md">
              <div class="text-h6 q-mb-sm text-weight-bold">사내 임직원 현황</div>
              <apexchart type="line" height="350" :options="hOpts" :series="hSers" />
            </q-card>
          </div>
          <div class="col-12 col-md-4 column q-gutter-y-md">
            <KpiSummaryCard title="현재 인원" :value="hrK1" unit="명" color="cyan" :progress="0.85" />
            <KpiSummaryCard title="신규 채용" :value="hrK2" unit="명" color="positive" :progress="0.1" />
            <q-card class="glass-card q-pa-md col-grow">
              <GrowthItems title="HR 지표" :metrics="mxHR" color="neon" show-mom />
            </q-card>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════
           5. 회계팀 (Accounting Team)
           ═══════════════════════════════════════ -->
      <div v-if="accReady" class="section-container">
        <h2 class="section-title">Accounting & Finance (회계팀)</h2>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-8">
            <q-card class="glass-card q-pa-md">
              <div class="text-h6 q-mb-sm text-weight-bold">매출 및 영업이익 현황</div>
              <apexchart type="line" height="350" :options="aOpts" :series="aSers" />
            </q-card>
          </div>
          <div class="col-12 col-md-4 column q-gutter-y-md">
            <KpiSummaryCard title="총 매출액" :value="accK1" unit="만원" color="primary" :progress="0.95" />
            <KpiSummaryCard title="기대 수익" :value="accK2" unit="만원" color="warning" :progress="0.15" />
            <q-card class="glass-card q-pa-md col-grow">
              <GrowthItems title="재무 상태보드" :metrics="mxA" color="neon" show-mom />
            </q-card>
          </div>
        </div>
      </div>

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

// ── Global ──────────────────────────────────────
const allReady = ref(false)
const timeline = Array(24).fill(0).map((_, i) => {
  const m = (i % 12 + 7) % 12 || 12
  const yr = i < 6 ? '22.' : i < 18 ? '23.' : '24.'
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

// ── 4. HR Team ───────────────────────────────────
const hData = ref({ h: [], r: [] })
const hrReady = computed(() => hData.value.h.length > 0)
const initHr = () => { const h=[],r=[]; let c=120; for(let i=0;i<24;i++){ const hr=3+Math.floor(Math.random()*5); c+=hr-2; h.push(c); r.push(hr) }; hData.value={h,r} }
const hSers = computed(() => [{ name:'인원', data:hData.value.h }])
const hOpts = { ...baseO, colors:['#00BCD4'] }
const hrK1  = computed(() => hData.value.h?.[23] || 0)
const hrK2  = computed(() => hData.value.r?.[23] || 0)
const mxHR  = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(hData.value.h, t)}), {}))

// ── 5. Accounting ────────────────────────────────
const aData = ref({ r: [], p: [] })
const accReady = computed(() => aData.value.r.length > 0)
const initAcc = () => { const r=[],p=[]; for(let i=0;i<24;i++){ const rv=150000+Math.floor(Math.random()*50000); r.push(rv); p.push(rv*0.18) }; aData.value={r,p} }
const aSers = computed(() => [{ name:'Revenue', data:aData.value.r }, { name:'Net Profit', data:aData.value.p }])
const aOpts = { ...baseO, colors:['#3F51B5','#FFC107'] }
const accK1 = computed(() => aData.value.r?.[23] || 0)
const accK2 = computed(() => aData.value.p?.[23] || 0)
const mxA   = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(aData.value.r, t)}), {}))

onMounted(() => {
  initHr(); initAcc()
  setTimeout(() => { allReady.value = true }, 150)
})
</script>

<style scoped>
/* ── Base ── */
.dashboard-page { background: #0f172a; color: #f8fafc; }

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
