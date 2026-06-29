<template>
  <div class="section-container">
    <h2 class="section-title">Accounting Team (회계팀)</h2>
    <div class="row q-col-gutter-lg items-stretch">
      
      <!-- 1. 좌측 도표 (월간 매출 통합 추이) -->
      <div class="col-12 col-md-8 column">
        <q-card class="glass-card q-pa-md col-grow column">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-h6 text-weight-bold">월간 매출 통합 추이 (단위:만원)</div>
            <router-link to="/accountingteam" class="detail-link">상세보기<q-icon name="arrow_forward" size="15px" class="q-ml-xs" /></router-link>
          </div>
          <div style="flex:1; min-height: 480px;">
            <apexchart type="line" height="100%" :options="cOpts" :series="cSers" />
          </div>
        </q-card>
      </div>

      <!-- 2. 우측 지표 요약 섹션 -->
      <div class="col-12 col-md-4 column q-gutter-y-md">
        
        <!-- 상단 2x2 요약 박스 -->
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-card class="glass-card q-pa-sm text-center col-grow">
              <div class="text-caption text-grey-4 q-mb-xs">매출 총액</div>
              <div class="text-subtitle1 text-weight-bold text-primary">{{ formatNum(curRevenue) }}</div>
              <q-separator class="q-mt-xs" color="primary" style="height: 2px" />
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="glass-card q-pa-sm text-center col-grow">
              <div class="text-caption text-grey-4 q-mb-xs">매출 이익</div>
              <div class="text-subtitle1 text-weight-bold text-amber">{{ formatNum(curGrossProfit) }}</div>
              <q-separator class="q-mt-xs" color="amber" style="height: 2px" />
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="glass-card q-pa-sm text-center col-grow">
              <div class="text-caption text-grey-4 q-mb-xs">영업 손익</div>
              <div class="text-subtitle1 text-weight-bold text-positive">{{ formatNum(curOpProfit) }}</div>
              <q-separator class="q-mt-xs" color="positive" style="height: 2px" />
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="glass-card q-pa-sm text-center col-grow">
              <div class="text-caption text-grey-4 q-mb-xs">비영업 손익</div>
              <div class="text-subtitle1 text-weight-bold text-negative">{{ formatNum(curNonOpProfit) }}</div>
              <q-separator class="q-mt-xs" color="negative" style="height: 2px" />
            </q-card>
          </div>
        </div>

        <!-- 하단 세로 4줄 증감률 매트릭스 -->
        <q-card class="glass-card q-pa-sm col-grow column" style="min-height: 200px;">
          <div class="text-subtitle1 text-center q-mb-sm text-grey-2 text-weight-bold" style="letter-spacing:1px; margin-top:4px;">매출 및 손익 지표분석</div>
          
          <div class="column flex-grow-1 justify-around">
            <div class="row items-center q-px-md q-py-xs" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <div class="col-2 text-primary text-weight-bold">총액</div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">MoM</span><span :class="['text-weight-bold', parseFloat(mxRevenue.mom)>=0?'text-positive':'text-negative']">{{mxRevenue.mom}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">QoQ</span><span :class="['text-weight-bold', parseFloat(mxRevenue.qoq)>=0?'text-positive':'text-negative']">{{mxRevenue.qoq}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">HoH</span><span :class="['text-weight-bold', parseFloat(mxRevenue.hoh)>=0?'text-positive':'text-negative']">{{mxRevenue.hoh}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">YoY</span><span :class="['text-weight-bold', parseFloat(mxRevenue.yoy)>=0?'text-positive':'text-negative']">{{mxRevenue.yoy}}%</span></div>
            </div>
            
            <div class="row items-center q-px-md q-py-xs" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <div class="col-2 text-amber text-weight-bold">매출 이익</div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">MoM</span><span :class="['text-weight-bold', parseFloat(mxGrossProfit.mom)>=0?'text-positive':'text-negative']">{{mxGrossProfit.mom}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">QoQ</span><span :class="['text-weight-bold', parseFloat(mxGrossProfit.qoq)>=0?'text-positive':'text-negative']">{{mxGrossProfit.qoq}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">HoH</span><span :class="['text-weight-bold', parseFloat(mxGrossProfit.hoh)>=0?'text-positive':'text-negative']">{{mxGrossProfit.hoh}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">YoY</span><span :class="['text-weight-bold', parseFloat(mxGrossProfit.yoy)>=0?'text-positive':'text-negative']">{{mxGrossProfit.yoy}}%</span></div>
            </div>

            <div class="row items-center q-px-md q-py-xs" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <div class="col-2 text-positive text-weight-bold">영업 손익</div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">MoM</span><span :class="['text-weight-bold', parseFloat(mxOpProfit.mom)>=0?'text-positive':'text-negative']">{{mxOpProfit.mom}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">QoQ</span><span :class="['text-weight-bold', parseFloat(mxOpProfit.qoq)>=0?'text-positive':'text-negative']">{{mxOpProfit.qoq}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">HoH</span><span :class="['text-weight-bold', parseFloat(mxOpProfit.hoh)>=0?'text-positive':'text-negative']">{{mxOpProfit.hoh}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">YoY</span><span :class="['text-weight-bold', parseFloat(mxOpProfit.yoy)>=0?'text-positive':'text-negative']">{{mxOpProfit.yoy}}%</span></div>
            </div>

            <div class="row items-center q-px-md q-py-xs">
              <div class="col-2 text-negative text-weight-bold">비영업</div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">MoM</span><span :class="['text-weight-bold', parseFloat(mxNonOpProfit.mom)>=0?'text-positive':'text-negative']">{{mxNonOpProfit.mom}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">QoQ</span><span :class="['text-weight-bold', parseFloat(mxNonOpProfit.qoq)>=0?'text-positive':'text-negative']">{{mxNonOpProfit.qoq}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">HoH</span><span :class="['text-weight-bold', parseFloat(mxNonOpProfit.hoh)>=0?'text-positive':'text-negative']">{{mxNonOpProfit.hoh}}%</span></div>
              <div class="col text-center"><span class="text-grey-4 text-caption q-mr-xs">YoY</span><span :class="['text-weight-bold', parseFloat(mxNonOpProfit.yoy)>=0?'text-positive':'text-negative']">{{mxNonOpProfit.yoy}}%</span></div>
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

// ── Helpers ──────────────────────────────────────
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

const formatNum = (val) => {
  return Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 })
}

// ── Data Generation (Simulation) ────────────────────────────────
const arrRevenue = ref([])
const arrGrossProfit = ref([])
const arrOpProfit = ref([])
const arrNonOpProfit = ref([])

const initData = () => {
  const r = []
  const gp = []
  const op = []
  const nop = []

  let currentRev = 120000 

  for (let i = 0; i < 24; i++) {
    const changeFactor = 0.95 + (Math.random() * 0.13)
    currentRev = Math.round(currentRev * changeFactor)

    const gross = Math.round(currentRev * (0.15 + Math.random() * 0.05)) 
    const operating = Math.round(gross * (0.55 + Math.random() * 0.1))   
    const nonOperating = Math.round(gross * (0.35 + Math.random() * 0.1)) 
    
    r.push(currentRev)
    gp.push(gross)
    op.push(operating)
    nop.push(nonOperating)
  }
  
  arrRevenue.value = r
  arrGrossProfit.value = gp
  arrOpProfit.value = op
  arrNonOpProfit.value = nop
}

onMounted(() => {
  initData()
})

// ── KPI Values ───────────────────────────────────────────────
const curRevenue = computed(() => arrRevenue.value[23] || 0)
const curGrossProfit = computed(() => arrGrossProfit.value[23] || 0)
const curOpProfit = computed(() => arrOpProfit.value[23] || 0)
const curNonOpProfit = computed(() => arrNonOpProfit.value[23] || 0)

// ── Growth Matrices ────────────────────────────────────────────
const mxRevenue = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,k) => ({...a, [k]: getGR(arrRevenue.value, k)}), {}))
const mxGrossProfit = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,k) => ({...a, [k]: getGR(arrGrossProfit.value, k)}), {}))
const mxOpProfit = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,k) => ({...a, [k]: getGR(arrOpProfit.value, k)}), {}))
const mxNonOpProfit = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,k) => ({...a, [k]: getGR(arrNonOpProfit.value, k)}), {}))

// ── Chart Options ──────────────────────────────────────────────
const cSers = computed(() => {
  if (arrRevenue.value.length === 0) return []
  return [
    { name: '매출 총액', type: 'column', data: arrRevenue.value },
    { name: '매출 이익', type: 'line', data: arrGrossProfit.value },
    { name: '영업 손익', type: 'line', data: arrOpProfit.value },
    { name: '비영업 손익', type: 'line', data: arrNonOpProfit.value }
  ]
})

const cOpts = computed(() => {
  return {
    chart: { toolbar: { show: false }, background: 'transparent' },
    theme: { mode: 'dark' },
    colors: ['#3F51B5', '#FFC107', '#4ade80', '#f87171'], 
    stroke: { width: [0, 3, 3, 3], curve: 'smooth' }, 
    dataLabels: { enabled: false },
    grid: { borderColor: 'rgba(255,255,255,0.1)' },
    plotOptions: { bar: { columnWidth: '35%', borderRadius: 3 } },
    xaxis: { categories: timeline, labels: { style: { fontSize: '10px', colors: '#94a3b8' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: [
      {
        opposite: true,
        seriesName: '매출 총액',
        min: 0,
        max: (max) => Math.ceil(max * 1.15),
        labels: { formatter: v => formatNum(v) }
      },
      {
        opposite: false,
        seriesName: '매출 이익',
        min: 0,
        max: (max) => Math.ceil(max * 1.5),
        labels: { formatter: v => formatNum(v) }
      },
      {
        opposite: false,
        seriesName: '영업 손익',
        show: false,
        min: 0,
        max: (max) => Math.ceil(max * 1.5),
        labels: { formatter: v => formatNum(v) }
      },
      {
        opposite: false,
        seriesName: '비영업 손익',
        show: false,
        min: 0,
        max: (max) => Math.ceil(max * 1.5),
        labels: { formatter: v => formatNum(v) }
      }
    ],
    legend: { position: 'bottom', labels: { colors: '#94a3b8' }, fontSize: '12px' },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: function (val) { return formatNum(val) } }
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
.glass-card:hover { border-color: rgba(36, 122, 235, 0.4); }

.opacity-50 { opacity: 0.5; }
.flex-grow-1 { flex-grow: 1; display: flex; flex-direction: column; justify-content: center;}

/* ── Section Title ── */
.section-title {
  color: #ECEFF4;
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 24px;
  border-left: 5px solid #3F51B5;
  padding-left: 15px;
}
.section-container {
  margin-bottom: 72px;
}
</style>
