<template>
  <div class="section-container">
    <h2 class="section-title">Sales Team (영업팀)</h2>

    <div class="row q-col-gutter-lg items-stretch">

      <!-- 좌측: 차트 카드 -->
      <div class="col-12 col-lg-8" style="display:flex;">
        <q-card class="glass-card q-pa-lg" style="width:100%; height:auto;">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-h6 text-weight-bolder text-white">월간 매출 및 인원 추이 ({{ periodLabel }})</div>
            <router-link to="/salesteam" class="detail-link">상세보기<q-icon name="arrow_forward" size="15px" class="q-ml-xs" /></router-link>
          </div>
          
          <div class="team-filter-container q-mb-lg">
            <div
              v-for="item in salesPills" :key="'sp-'+item.key"
              @click="selSales(item.key)"
              :class="['team-pill', item.pillClass, { 'active': curS === item.key }]"
            >
              {{ item.label }}
            </div>
          </div>

          <apexchart type="line" height="500" :options="sOpts" :series="sSers" :key="'cs-'+curS" />
        </q-card>
      </div>

      <!-- 우측: KPI Sidebar -->
      <div class="col-12 col-lg-4">
        <SalesKPISidebar
          :label="salesLabel"
          :revenueArr="filteredTimelineData.revenueArr"
          :hcArr="filteredTimelineData.headcountArr"
          :revenue="sumSales"
          :headcount="sumHC"
          :rpp="filteredTimelineData.latestRPP"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import SalesKPISidebar from '@/features/detail/components/SalesKPISidebar.vue'

// 글로벌 공유 훅스 임포트! (Global State)
import { useSalesHarness } from '@/features/detail/composables/useSalesHarness.js'

const { activeFilter, salesPills, timelineArr, periodLabel, salesMData, filteredTimelineData, rawData, parseCSV, csvTemplate, fetchFromDB, uploadToDB } = useSalesHarness()

// ── Shared Tools ────────────────────────────────
const getGR = (arr, type) => {
  const len = arr ? arr.length : 0
  if (len < 2) return '0.0'
  const lastIdx = len - 1
  let prevIdx
  if (type === 'mom') prevIdx = lastIdx - 1
  else if (type === 'qoq') prevIdx = lastIdx - 3
  else if (type === 'hoh') prevIdx = lastIdx - 6
  else prevIdx = lastIdx - 12 // yoy
  
  if (prevIdx < 0) return '0.0'
  const c = arr[lastIdx], p = arr[prevIdx] || 1
  return (((c - p) / p) * 100).toFixed(1)
}

const baseO = computed(() => ({
  chart: { toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  stroke: { curve: 'smooth', width: 2 },
  grid: { borderColor: 'rgba(255,255,255,0.1)' },
  xaxis: { categories: timelineArr.value }
}))

// ── 1. Sales Team ────────────────────────────────
const curS = activeFilter // Global 필터 상태를 그대로 사용
const salesLabel = computed(() => {
  const pill = salesPills.find(p => p.key === curS.value)
  return pill && pill.key.includes('/') ? pill.label : (pill ? pill.key : curS.value)
})

const sSers = computed(() => {
  return [
    { name: '매출',       type: 'column', data: filteredTimelineData.value.revenueArr },
    { name: '인원',       type: 'line',   data: filteredTimelineData.value.headcountArr },
    { name: '인원당 매출', type: 'line',   data: filteredTimelineData.value.rppArr }
  ]
})

const sOpts = computed(() => {
  const d = filteredTimelineData.value
  const maxHC  = d.headcountArr.length  ? Math.max(...d.headcountArr)  + 2 : 10
  const maxRPP = d.rppArr.length ? Math.ceil(Math.max(...d.rppArr) * 1.3 / 1000) * 1000 : 10000
  return {
    ...baseO.value,
    colors: ['#00f2ff', '#a855f7', '#F2C037'],
    stroke: { curve: 'smooth', width: [0, 3, 2] },
    fill:   { opacity: [0.85, 1, 1] },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
    xaxis: {
      categories: timelineArr.value,
      labels: {
        style: { fontSize: '11px', colors: '#94a3b8', fontWeight: 600 }
      },
      axisBorder: { show: false },
      axisTicks:  { show: false }
    },
    yaxis: [
      {
        seriesName: '매출',
        title: { text: '매출(만원)', style: { color: '#00f2ff', fontSize: '14px', fontWeight: 800 } },
        labels: { formatter: v => (v || 0).toLocaleString(), style: { colors: '#00f2ff', fontSize: '14px', fontWeight: 600 } }
      },
      {
        seriesName: '인원',
        opposite: true,
        min: 0, max: maxHC,
        tickAmount: 5,
        decimalsInFloat: 0,
        title: { text: '인원(명)', style: { color: '#a855f7', fontSize: '14px', fontWeight: 800 } },
        labels: { formatter: v => Math.round(v), style: { colors: '#a855f7', fontSize: '14px', fontWeight: 600 } }
      },
      {
        seriesName: '인원당 매출',
        opposite: true,
        min: 0, max: maxRPP,
        forceNiceScale: true,
        title: { text: '인당매출(만원)', style: { color: '#F2C037', fontSize: '14px', fontWeight: 800 } },
        labels: { formatter: v => (v || 0).toLocaleString(), style: { colors: '#F2C037', fontSize: '14px', fontWeight: 600 } }
      }
    ],
    legend:  { position: 'bottom', labels: { colors: '#94a3b8' }, fontSize: '13px', itemMargin: { horizontal: 16 } },
    tooltip: { 
      shared: true, 
      intersect: false,
      style: {
        fontSize: '20px'
      }
    }
  }
})

const sumSales = computed(() => filteredTimelineData.value.totalSumSales.toLocaleString())
const sumHC = computed(() => filteredTimelineData.value.latestHc)

const selSales = t => curS.value = t

onMounted(async () => {
  // DB에서 데이터 로드 (상세 페이지에서 이미 로드했으면 rawData가 있으므로 스킵)
  if (rawData.value.length === 0) {
    const loaded = await fetchFromDB()
    if (!loaded) {
      parseCSV(csvTemplate)
      await uploadToDB(rawData.value)
    }
  }
})
</script>

<style scoped>
.section-container { margin-bottom: 72px; animation: fadeIn 0.7s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
.section-title { color: #ECEFF4; font-size: 1.8rem; font-weight: 900; margin-bottom: 24px; border-left: 5px solid #00f2ff; padding-left: 15px; }
.glass-card { background: rgba(30, 41, 59, 0.55); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; transition: border-color 0.3s ease; }
.glass-card:hover { border-color: rgba(0, 242, 255, 0.4); }
.team-filter-container { display: flex; flex-wrap: nowrap; gap: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 12px; overflow-x: auto; }
.team-filter-wrap { flex-wrap: wrap !important; overflow-x: visible; }
.scroll-x { scrollbar-width: thin; scrollbar-color: #00f2ff transparent; }
.team-pill { padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 700; color: #cbd5e1; white-space: nowrap; transition: all 0.2s; }
.pill-overall  { background: rgba(245,158,11,0.15); color: #fbbf24; }
.pill-overall.active  { background: #f59e0b; color: white; }
.pill-division { background: rgba(6,182,212,0.15);  color: #22d3ee; }
.pill-division.active { background: #06b6d4; color: white; }
.pill-div1     { background: rgba(6,182,212,0.15);  color: #22d3ee; }
.pill-div1.active     { background: #06b6d4; color: white; }
.pill-div2     { background: rgba(6,182,212,0.15);  color: #22d3ee; }
.pill-div2.active     { background: #06b6d4; color: white; }
.pill-div3     { background: rgba(168,85,247,0.15); color: #c084fc; }
.pill-div3.active     { background: #a855f7; color: white; }
.pill-team     { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.pill-team.active     { background: white; color: #1e293b; }
.border-r  { border-right: 1px solid rgba(255,255,255,0.1); }
.text-neon { color: #00f2ff; text-shadow: 0 0 10px rgba(0,242,255,0.5); }
/* .detail-link 는 전역 style.css 의 통일 스타일 사용 */
</style>
