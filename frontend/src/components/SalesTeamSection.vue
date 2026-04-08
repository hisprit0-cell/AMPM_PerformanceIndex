<template>
  <div class="section-container">
    <h2 class="section-title">Sales Team (영업팀)</h2>

    <!-- items-stretch: 양쪽 col 높이를 서로 맞춤 -->
    <div class="row q-col-gutter-lg items-stretch">

      <!-- 좌측: 차트 카드 (display:flex + width:100% → col 높이에 맞춰 카드 늘어남) -->
      <div class="col-12 col-md-8" style="display:flex;">
        <q-card class="glass-card q-pa-md" style="width:100%; height:auto;">
          <div class="row justify-between items-center q-mb-sm">
            <div class="text-h6 text-weight-bold">월간 매출 및 인원 추이 (22.07 ~ 24.06)</div>
            <a href="#" class="detail-link">상세보기 ✏️</a>
          </div>
          <div class="team-filter-container team-filter-wrap q-mb-md">
            <div
              v-for="item in salesPills" :key="'sp-'+item.key"
              @click="selSales(item.key)"
              :class="['team-pill', item.pillClass, { 'active': curS === item.key }]"
            >
              {{ item.label }}
            </div>
          </div>
          <apexchart type="line" height="450" :options="sOpts" :series="sSers" :key="'cs-'+curS" />

        </q-card>
      </div>

      <!-- 우측: KPI 카드 3개 (flex column → 카드들이 좌측 높이에 맞게 배분) -->
      <div class="col-12 col-md-4" style="display:flex; flex-direction:column; gap:12px;">

        <!-- 카드 1: 통합 매출액 (고정 높이) -->
        <q-card class="glass-card q-pa-md" style="flex:0 0 auto; height:auto;">
          <div class="text-overline text-grey-5" style="font-size:11px; line-height:1.6;">{{ salesLabel }} 통합 매출액</div>
          <div class="text-neon text-weight-bold" style="font-size:2.2rem; line-height:1.2;">₩ {{ sumSales }} 만원</div>
        </q-card>

        <!-- 카드 2: 인원 수 + 인원당 매출 (고정 높이) -->
        <q-card class="glass-card q-pa-md" style="flex:0 0 auto; height:auto;">
          <div class="row items-end justify-between">
            <div>
              <div class="text-overline text-grey-5" style="font-size:11px;">{{ salesLabel }} 인원</div>
              <div class="text-white text-weight-bold" style="font-size:3rem; line-height:1;">{{ sumHC }} 명</div>
            </div>
            <div class="text-right">
              <div class="text-overline text-grey-5" style="font-size:11px;">인원당 매출액</div>
              <div class="text-warning text-weight-bold" style="font-size:1.4rem;">₩ {{ sumRPP }} 만원</div>
            </div>
          </div>
        </q-card>

        <!-- 카드 3: 성장 지표 분석 (flex:1 → 나머지 높이 전부 채움) -->
        <q-card class="glass-card q-pa-md" style="flex:1 1 0; min-height:0; height:auto; display:flex; flex-direction:column; overflow:hidden;">
          <div class="text-subtitle1 text-center q-mb-sm text-grey-2 text-weight-bold" style="letter-spacing:1px;">성장 지표 분석</div>
          <!-- 컨럼 헤더: 색상 배지 구분 -->
          <div class="row q-mb-sm" style="gap:0;">
            <div class="col-6" style="padding-right:8px;">
              <div class="metric-col-header metric-neon">매출액</div>
            </div>
            <div class="col-6" style="padding-left:8px;">
              <div class="metric-col-header metric-info">인원수</div>
            </div>
          </div>
          <!-- 데이터 -->
          <div class="row" style="flex:1 1 0; min-height:0; overflow:hidden;">
            <div class="col-6" style="border-right: 2px solid rgba(0,242,255,0.2); padding-right:4px;">
              <GrowthItems :metrics="mxS" color="neon" show-mom />
            </div>
            <div class="col-6" style="padding-left:4px;">
              <GrowthItems :metrics="mxHC" color="info" show-mom />
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

// ── Global Tools ────────────────────────────────
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

// ── 1. Sales Team ────────────────────────────────
const curS = ref('전체')
const salesPills = [
  { key: '전체',                    label: '전체',        pillClass: 'pill-overall' },
  { key: '퍼포먼스1본부',            label: '퍼포먼스1본부', pillClass: 'pill-div1' },
  { key: '퍼포먼스1본부/영업1팀',    label: '영업 1팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스1본부/영업2팀',    label: '영업 2팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스1본부/영업3팀',    label: '영업 3팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스2본부',            label: '퍼포먼스2본부', pillClass: 'pill-div2' },
  { key: '퍼포먼스2본부/영업1팀',    label: '영업 1팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스2본부/영업2팀',    label: '영업 2팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스2본부/영업3팀',    label: '영업 3팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스3본부',            label: '퍼포먼스3본부', pillClass: 'pill-div3' },
  { key: '퍼포먼스3본부/영업1팀',    label: '영업 1팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스3본부/영업2팀',    label: '영업 4팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스3본부/영업3팀',    label: '영업 5팀',    pillClass: 'pill-team' },
]
const salesMData = ref({})
const salesLabel = computed(() => curS.value.includes('/') ? curS.value : curS.value)

const initSales = () => {
  const divs = ['퍼포먼스1본부', '퍼포먼스2본부', '퍼포먼스3본부']
  const teamKeys = salesPills.filter(p => p.key !== '전체' && !divs.includes(p.key)).map(p => p.key)
  const map = { '전체': { s: Array(24).fill(0), h: Array(24).fill(0) } }
  divs.forEach(d => { map[d] = { s: Array(24).fill(0), h: Array(24).fill(0) } })
  teamKeys.forEach(t => {
    map[t] = { s: [], h: [] }
    let hc = 2 + Math.floor(Math.random() * 5)
    for (let i = 0; i < 24; i++) {
      const roll = Math.random()
      if (roll < 0.35)       hc = Math.min(hc + 1, 12)
      else if (roll < 0.55)  hc = Math.max(hc - 1, 1)
      const v = 1000 + Math.floor(Math.random() * 8000)
      map[t].s.push(v)
      map[t].h.push(hc)
      map['전체'].s[i] += v
      map['전체'].h[i] += hc
      const div = divs.find(d => t.startsWith(d))
      if (div) { map[div].s[i] += v; map[div].h[i] += hc }
    }
  })
  salesMData.value = map
}

const sSers = computed(() => {
  const d = salesMData.value[curS.value] || { s: [], h: [] }
  const rpp = d.s.map((v, i) => d.h[i] ? Math.round(v / d.h[i]) : 0)
  return [
    { name: '매출',       type: 'column', data: d.s },
    { name: '인원',       type: 'line',   data: d.h },
    { name: '인원당 매출', type: 'line',   data: rpp }
  ]
})

const sOpts = computed(() => {
  const d = salesMData.value[curS.value] || { s: [], h: [] }
  const maxHC  = d.h.length  ? Math.max(...d.h)  + 2 : 10
  const rppArr = d.s.map((v, i) => d.h[i] ? Math.round(v / d.h[i]) : 0)
  const maxRPP = rppArr.length ? Math.ceil(Math.max(...rppArr) * 1.3 / 1000) * 1000 : 10000
  return {
    ...baseO,
    colors: ['#00f2ff', '#a855f7', '#F2C037'],
    stroke: { curve: 'smooth', width: [0, 3, 2] },
    fill:   { opacity: [0.85, 1, 1] },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
    xaxis: {
      categories: timeline,
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
    tooltip: { shared: true, intersect: false }
  }
})

const sumSales = computed(() => (salesMData.value[curS.value]?.s?.[23] || 0).toLocaleString())
const sumHC    = computed(() =>  salesMData.value[curS.value]?.h?.[23] || 0)
const sumRPP   = computed(() => Math.floor((salesMData.value[curS.value]?.s?.[23] || 0) / (sumHC.value || 1)).toLocaleString())
const mxS  = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(salesMData.value[curS.value]?.s, t)}), {}))
const mxHC = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(salesMData.value[curS.value]?.h, t)}), {}))

const selSales = t => curS.value = t

onMounted(() => {
  initSales()
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
.detail-link { color: #00f2ff; text-decoration: none; font-weight: 700; font-size: 14px; transition: opacity 0.2s; }
.detail-link:hover { opacity: 0.65; }
.metric-col-header { text-align: center; font-weight: 800; font-size: 0.9rem; padding: 5px 0; border-radius: 6px; letter-spacing: 0.5px; }
.metric-neon { color: #00f2ff; background: rgba(0, 242, 255, 0.12); border: 1px solid rgba(0, 242, 255, 0.35); text-shadow: 0 0 8px rgba(0,242,255,0.6); }
.metric-info { color: #60a5fa; background: rgba(96, 165, 250, 0.12); border: 1px solid rgba(96, 165, 250, 0.35); text-shadow: 0 0 8px rgba(96,165,250,0.4); }
</style>
