<template>
  <div class="section-container">
    <h2 class="section-title">HR Team (인사팀)</h2>
    <div class="row q-col-gutter-lg items-stretch">
      
      <!-- 1. 좌측 도표 (월간 임직원 통합 지표 추이) -->
      <div class="col-12 col-md-7 column">
        <q-card class="glass-card q-pa-md col-grow column">
          <div class="text-h6 q-mb-md text-weight-bold">월간 임직원 통합 지표 추이</div>
          <div style="flex:1; min-height: 400px;">
            <apexchart type="line" height="100%" :options="cOpts" :series="cSers" />
          </div>
        </q-card>
      </div>

      <!-- 2. 우측 지표 요약 섹션 -->
      <div class="col-12 col-md-5 column q-gutter-y-md">
        
        <!-- 상단 3열 인원 요약 박스 (총인원, 입사, 퇴사) -->
        <div class="row q-col-gutter-x-sm">
          <!-- 총인원 -->
          <div class="col-4">
            <q-card class="glass-card q-pa-sm text-center col-grow">
              <div class="text-caption text-grey-4 q-mb-xs">총인원</div>
              <div class="text-h5 text-weight-bold text-cyan">{{ currentTotal }} <span class="text-body2 text-grey-5">명</span></div>
              <q-separator class="q-mt-sm" color="cyan" style="height: 2px" />
            </q-card>
          </div>
          <!-- 입사 -->
          <div class="col-4">
            <q-card class="glass-card q-pa-sm text-center col-grow">
              <div class="text-caption text-grey-4 q-mb-xs">입사</div>
              <div class="text-h5 text-weight-bold text-positive">{{ currentHires }} <span class="text-body2 text-grey-5">명</span></div>
              <q-separator class="q-mt-sm" color="positive" style="height: 2px" />
            </q-card>
          </div>
          <!-- 퇴사 -->
          <div class="col-4">
            <q-card class="glass-card q-pa-sm text-center col-grow">
              <div class="text-caption text-grey-4 q-mb-xs">퇴사</div>
              <div class="text-h5 text-weight-bold text-negative">{{ currentExits }} <span class="text-body2 text-grey-5">명</span></div>
              <q-separator class="q-mt-sm" color="negative" style="height: 2px" />
            </q-card>
          </div>
        </div>

        <!-- 하단 3열 증감률 매트릭스 -->
        <q-card class="glass-card q-pa-sm col-grow column" style="min-height: 280px;">
          <div class="text-subtitle1 text-center q-mb-sm text-grey-2 text-weight-bold" style="letter-spacing:1px; margin-top:4px;">HRM 지표분석</div>
          <div class="row q-mb-sm text-center">
            <div class="col-4 text-cyan text-weight-bold">총인원</div>
            <div class="col-4 text-positive text-weight-bold">입사</div>
            <div class="col-4 text-negative text-weight-bold">퇴사</div>
          </div>
          <q-separator color="grey-8" class="q-mb-md opacity-50" />
          
          <div class="row flex-grow-1">
            <div class="col-4" style="border-right: 1px solid rgba(255,255,255,0.1);">
              <GrowthItems :metrics="mxTotal" color="cyan" show-mom />
            </div>
            <div class="col-4" style="border-right: 1px solid rgba(255,255,255,0.1);">
              <GrowthItems :metrics="mxHires" color="positive" show-mom />
            </div>
            <div class="col-4">
              <GrowthItems :metrics="mxExits" color="negative" show-mom />
            </div>
          </div>
        </q-card>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import GrowthItems from './GrowthItems.vue'

// ── Global Helper ──────────────────────────────────────
const timeline = Array(24).fill(0).map((_, i) => {
  const m = ((i + 3) % 12) + 1
  const yr = i < 9 ? '24.' : i < 21 ? '25.' : '26.'
  return yr + String(m).padStart(2, '0')
})

const getGR = (arr, type) => {
  if (!arr || arr.length < 24) return '0.0'
  const c = arr[23] || 0
  const p = arr[type === 'mom' ? 22 : type === 'qoq' ? 20 : type === 'hoh' ? 17 : 11] || 1
  if (p === 0 && c === 0) return '0.0'
  if (p === 0) return '100.0'
  return (((c - p) / p) * 100).toFixed(1)
}

// ── Data Generation (Simulation) ────────────────────────────────
const arrTotal = ref([])
const arrHires = ref([])
const arrExits = ref([])

const initData = () => {
  const t = []
  const h = []
  const e = []
  let c = 120 // 시작 인원

  for (let i = 0; i < 24; i++) {
    // 랜덤 입사 (4~10명)
    const hires = 4 + Math.floor(Math.random() * 7)
    // 랜덤 퇴사 (1~5명)
    const exits = 1 + Math.floor(Math.random() * 5)
    
    // 이탈/합류 반영: 전체 인원 변동 반영
    c += (hires - exits)
    
    // 특별히 마지막 달(최신 월) 수치를 위해 가상 보정 (현재 약 143명 세팅용)
    if (i === 23) {
      // 좀 더 드라마틱하게!
    }
    
    t.push(c)
    h.push(hires)
    e.push(exits)
  }
  
  arrTotal.value = t
  arrHires.value = h
  arrExits.value = e
}

onMounted(() => {
  initData()
})

// ── KPI Values ───────────────────────────────────────────────
const currentTotal = computed(() => arrTotal.value[23] || 0)
const currentHires = computed(() => arrHires.value[23] || 0)
const currentExits = computed(() => arrExits.value[23] || 0)

// ── Growth Matrices ────────────────────────────────────────────
const mxTotal = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,k) => ({...a, [k]: getGR(arrTotal.value, k)}), {}))
const mxHires = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,k) => ({...a, [k]: getGR(arrHires.value, k)}), {}))
const mxExits = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,k) => ({...a, [k]: getGR(arrExits.value, k)}), {}))

// ── Chart Options ──────────────────────────────────────────────
const cSers = computed(() => {
  if (arrTotal.value.length === 0) return []
  return [
    { name: '총인원', type: 'column', data: arrTotal.value },
    { name: '입사', type: 'line', data: arrHires.value },
    { name: '퇴사', type: 'line', data: arrExits.value }
  ]
})

const cOpts = computed(() => {
  return {
    chart: { toolbar: { show: false }, background: 'transparent' },
    theme: { mode: 'dark' },
    colors: ['#00f2ff', '#4ade80', '#f87171'], // 총인원(Cyan), 입사(Green), 퇴사(Red)
    stroke: { width: [0, 3, 3], curve: 'smooth' }, // 첫 번째(총인원)는 막대이므로 선 굵기 0, 나머지 꺾은선 3
    dataLabels: { enabled: false },
    grid: { borderColor: 'rgba(255,255,255,0.1)' },
    plotOptions: { bar: { columnWidth: '35%', borderRadius: 3 } },
    xaxis: { categories: timeline, labels: { style: { fontSize: '10px', colors: '#94a3b8' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: [
      {
        // 오른쪽 축: 총인원
        opposite: true,
        seriesName: '총인원',
        title: { text: '전체 임직원 수', style: { color: '#00f2ff' } },
        min: 0,
        // max 값을 넉넉하게 스케일링 설정
        max: (max) => Math.ceil(max * 1.2),
        labels: { formatter: v => Math.round(v) }
      },
      {
        // 왼쪽 축: 입사
        opposite: false,
        seriesName: '입사',
        title: { text: '입/퇴사자 수', style: { color: '#94a3b8' } },
        min: 0,
        max: 20, // 입사/퇴사는 스케일이 작으므로 고정 또는 별도 산출
        labels: { formatter: v => Math.round(v) }
      },
      {
        // 왼쪽 축 (공유): 퇴사
        opposite: false,
        seriesName: '퇴사',
        show: false, // 축 표시는 하나만
        min: 0,
        max: 20
      }
    ],
    legend: { position: 'bottom', labels: { colors: '#94a3b8' }, fontSize: '12px' },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: function (val) { return Math.round(val) + '명' } }
    }
  }
})

</script>

<style scoped>
/* ── Glass Card ── */
.glass-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: border-color 0.3s ease;
}
.glass-card:hover { border-color: rgba(0, 242, 255, 0.4); }

.opacity-50 { opacity: 0.5; }
.flex-grow-1 { flex-grow: 1; }

/* ── Section Title ── */
.section-title {
  color: #ECEFF4;
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 24px;
  border-left: 5px solid #00f2ff;
  padding-left: 15px;
}
.section-container {
  margin-bottom: 72px;
}
</style>
