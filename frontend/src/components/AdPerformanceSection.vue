<template>
  <div class="section-container" style="margin-top: 48px;">
    <h2 class="section-title">Advertisement Performance (광고 성과)</h2>

    <!-- 상단 KPI 요약 그리드 (반응형, 스크롤 없음) -->
    <q-card class="glass-card q-pa-lg q-mb-lg">
      <!-- Row 1: 핵심 퍼널 지표 -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-highlight-neon">
          <div class="kpi-label">광고비 (Ad Spend)</div>
          <div class="kpi-value text-neon">{{ formatMoney(sumAdSpend) }}</div>
          <div class="kpi-sub">예산 소진액</div>
        </div>
        <div class="kpi-arrow">→</div>
        <div class="kpi-card">
          <div class="kpi-label">노출수 (Impressions)</div>
          <div class="kpi-value text-teal">{{ formatNum(sumImpressions) }}</div>
          <div class="kpi-sub">총 노출 건수</div>
        </div>
        <div class="kpi-arrow">→</div>
        <div class="kpi-card">
          <div class="kpi-label">클릭수 (Clicks)</div>
          <div class="kpi-value text-blue">{{ formatNum(sumClicks) }}</div>
          <div class="kpi-sub">총 클릭 건수</div>
        </div>
        <div class="kpi-arrow">→</div>
        <div class="kpi-card">
          <div class="kpi-label">총 전환수 (Conversions)</div>
          <div class="kpi-value text-white">{{ formatNum(sumConversions) }}</div>
          <div class="kpi-sub">승인된 총 전환</div>
        </div>
        <div class="kpi-arrow">→</div>
        <div class="kpi-card">
          <div class="kpi-label">신규 매출액 (Revenue)</div>
          <div class="kpi-value text-positive">{{ formatMoney(sumRevenue) }}</div>
          <div class="kpi-sub">발생한 총 매출</div>
        </div>
      </div>

      <!-- Row 2: 효율 지표 배지 -->
      <div class="efficiency-row q-mt-lg">
        <div class="eff-badge eff-teal">
          <span class="eff-label">CTR</span>
          <span class="eff-value">{{ ctr.toFixed(2) }}%</span>
        </div>
        <div class="eff-badge eff-blue">
          <span class="eff-label">CPC</span>
          <span class="eff-value">₩{{ formatNum(cpc) }}</span>
        </div>
        <div class="eff-badge eff-warning">
          <span class="eff-label">CVR</span>
          <span class="eff-value">{{ cvr.toFixed(2) }}%</span>
        </div>
        <div class="eff-badge eff-warning">
          <span class="eff-label">CPA</span>
          <span class="eff-value">{{ formatMoney(cpa) }}</span>
        </div>
        <div class="eff-badge eff-roas">
          <span class="eff-label">ROAS</span>
          <span class="eff-value">{{ formatNum(roas.toFixed(0)) }}%</span>
        </div>
      </div>

      <!-- Row 3: 전환 카테고리 분류 -->
      <div class="category-grid q-mt-lg">
        <div class="cat-node">광고 상담: {{ formatNum(catA) }}건</div>
        <div class="cat-node">하단 상담: {{ formatNum(catB) }}건</div>
        <div class="cat-node">우측 상담: {{ formatNum(catC) }}건</div>
        <div class="cat-node">랜딩 상담: {{ formatNum(catD) }}건</div>
        <div class="cat-node">수기(4111): {{ formatNum(catE) }}건</div>
        <div class="cat-node">수기(4488): {{ formatNum(catF) }}건</div>
      </div>
    </q-card>

    <!-- 하단 차트 및 KPI 영역 -->
    <div class="row q-col-gutter-lg items-stretch">
      <!-- 좌측: 월별 광고성과 차트 -->
      <div class="col-12 col-md-8" style="display:flex; flex-direction:column;">
        <q-card class="glass-card q-pa-md" style="flex:1;">
          <div class="row justify-between items-center q-mb-sm">
            <div class="text-h6 text-weight-bold">월별 광고성과 추이</div>
          </div>
          <div class="team-filter-ext q-mb-md">
            <div
              v-for="tab in chartTabs" :key="'ct-'+tab"
              @click="curTab = tab"
              :class="['team-pill', tab === '전체' ? 'pill-overall' : 'pill-team', { 'active': curTab === tab }]"
            >
              {{ tab }}
            </div>
          </div>
          <div style="flex:1; min-height: 550px;">
            <apexchart type="line" height="100%" :options="cOpts" :series="cSers" :key="'cc-'+curTab" />
          </div>
        </q-card>
      </div>

      <!-- 우측: 요약 KPI 및 분석 -->
      <div class="col-12 col-md-4" style="display:flex; flex-direction:column; gap:12px;">
        
        <!-- 카드 1: 총전환수 및 CPA -->
        <q-card class="glass-card q-pa-md" style="flex:0 0 auto;">
          <div class="text-overline text-grey-5" style="font-size:11px; line-height:1.6;">총 전환수 & 전환당 비용</div>
          <div class="text-white text-weight-bold" style="font-size:2.2rem; line-height:1.2;">{{ formatNum(sumConversions) }} <span style="font-size:1rem;font-weight:normal;color:#94a3b8;">건</span></div>
          <div class="text-warning text-weight-bold q-mt-xs" style="font-size:1.2rem;">CPA: {{ formatMoney(cpa) }}</div>
        </q-card>

        <!-- 카드 2: 총클릭수 및 CPC -->
        <q-card class="glass-card q-pa-md" style="flex:0 0 auto;">
          <div class="text-overline text-grey-5" style="font-size:11px; line-height:1.6;">총 클릭수 & 클릭당 비용</div>
          <div class="text-blue text-weight-bold" style="font-size:2.2rem; line-height:1.2;">{{ formatNum(sumClicks) }} <span style="font-size:1rem;font-weight:normal;color:#94a3b8;">건</span></div>
          <div class="text-teal text-weight-bold q-mt-xs" style="font-size:1.2rem;">CPC: {{ formatMoney(cpc) }}</div>
        </q-card>

        <!-- 카드 3: 총광고비 및 신규매출액 -->
        <q-card class="glass-card q-pa-md" style="flex:0 0 auto;">
          <div class="text-overline text-grey-5" style="font-size:11px; line-height:1.6;">총 광고비 대비 신규매출액</div>
          <div class="text-neon text-weight-bold" style="font-size:2.2rem; line-height:1.2;">{{ formatMoney(sumRevenue) }}</div>
          <div class="text-grey-3 text-weight-bold q-mt-xs" style="font-size:1rem;">예산 소진액: {{ formatMoney(sumAdSpend) }}</div>
        </q-card>

        <!-- 카드 4: 기간별 지표 분석 -->
        <q-card class="glass-card q-pa-md" style="flex:1 1 auto; display:flex; flex-direction:column; min-height: 280px;">
          <div class="text-subtitle1 text-center q-mb-sm text-grey-2 text-weight-bold" style="letter-spacing:1px;">기간별 광고성과 증감률 분석</div>
          <!-- 컬럼 헤더 -->
          <div class="row q-mb-sm" style="gap:0;">
            <div class="col-4" style="padding-right:4px;">
              <div class="metric-col-header metric-warning">CPA</div>
            </div>
            <div class="col-4" style="padding:0 2px;">
              <div class="metric-col-header metric-teal">CPC</div>
            </div>
            <div class="col-4" style="padding-left:4px;">
              <div class="metric-col-header metric-neon" style="color:#00f2ff!important;">ROAS</div>
            </div>
          </div>
          <!-- 3열 데이터 -->
          <div class="row" style="flex:1 1 auto;">
            <div class="col-4" style="border-right: 1px solid rgba(255,255,255,0.1); padding-right:2px;">
              <GrowthItems :metrics="mxCPA" color="warning" show-mom />
            </div>
            <div class="col-4" style="border-right: 1px solid rgba(255,255,255,0.1); padding:0 3px;">
              <GrowthItems :metrics="mxCPC" color="info" show-mom />
            </div>
            <div class="col-4" style="padding-left:2px;">
              <GrowthItems :metrics="mxROAS" color="neon" show-mom />
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

// Global Time Tools
const timeline = Array(24).fill(0).map((_, i) => {
  const m = ((i + 3) % 12) + 1
  const yr = i < 9 ? '24.' : i < 21 ? '25.' : '26.'
  return yr + String(m).padStart(2, '0')
})

const getGR = (arr, type) => {
  if (!arr || arr.length < 24) return '0.0'
  const c = arr[23], p = arr[type==='mom'?22:type==='qoq'?20:type==='hoh'?17:11] || 1
  if (p === 0) return '0.0'
  return (((c - p) / p) * 100).toFixed(1)
}

// Data Storage (24 months)
const dataStack = ref({
  adSpend: Array(24).fill(0),
  impressions: Array(24).fill(0),
  clicks: Array(24).fill(0),
  conversions: Array(24).fill(0),
  revenue: Array(24).fill(0)
})

const catData = ref({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 })

const initData = () => {
  const d = { adSpend: [], impressions: [], clicks: [], conversions: [], revenue: [] }
  let baseAd = 8000000
  let cats = [0,0,0,0,0,0]

  for (let i=0; i<24; i++) {
    baseAd += Math.floor((Math.random() - 0.4) * 1000000)
    if (baseAd < 5000000) baseAd = 5000000
    const imp = Math.floor(baseAd * 0.05 + Math.random() * 50000)
    const clk = Math.floor(imp * (0.02 + Math.random() * 0.02))
    const conv = Math.floor(clk * (0.01 + Math.random() * 0.02))
    const rev = Math.floor(conv * (100000 + Math.random() * 50000))

    d.adSpend.push(baseAd)
    d.impressions.push(imp)
    d.clicks.push(clk)
    d.conversions.push(conv)
    d.revenue.push(rev)

    if (i === 23) {
      cats[0] = Math.floor(conv * 0.3)
      cats[1] = Math.floor(conv * 0.2)
      cats[2] = Math.floor(conv * 0.15)
      cats[3] = Math.floor(conv * 0.15)
      cats[4] = Math.floor(conv * 0.1)
      cats[5] = conv - (cats[0]+cats[1]+cats[2]+cats[3]+cats[4])
    }
  }
  dataStack.value = d
  catData.value = { A: cats[0], B: cats[1], C: cats[2], D: cats[3], E: cats[4], F: cats[5] }
}

onMounted(() => { initData() })

// Single Computed Metrics (for Month 24 - the latest)
const sumAdSpend = computed(() => dataStack.value.adSpend[23] || 0)
const sumImpressions = computed(() => dataStack.value.impressions[23] || 0)
const sumClicks = computed(() => dataStack.value.clicks[23] || 0)
const sumConversions = computed(() => dataStack.value.conversions[23] || 0)
const sumRevenue = computed(() => dataStack.value.revenue[23] || 0)

const ctr = computed(() => sumImpressions.value ? (sumClicks.value / sumImpressions.value) * 100 : 0)
const cvr = computed(() => sumClicks.value ? (sumConversions.value / sumClicks.value) * 100 : 0)
const cpc = computed(() => sumClicks.value ? sumAdSpend.value / sumClicks.value : 0)
const cpa = computed(() => sumConversions.value ? sumAdSpend.value / sumConversions.value : 0)
const roas = computed(() => sumAdSpend.value ? (sumRevenue.value / sumAdSpend.value) * 100 : 0)

const catA = computed(() => catData.value.A)
const catB = computed(() => catData.value.B)
const catC = computed(() => catData.value.C)
const catD = computed(() => catData.value.D)
const catE = computed(() => catData.value.E)
const catF = computed(() => catData.value.F)

// Monthly arrays for charting logic
const arrCPA = computed(() => dataStack.value.adSpend.map((a, i) => dataStack.value.conversions[i] ? Math.round(a / dataStack.value.conversions[i]) : 0))
const arrCPC = computed(() => dataStack.value.adSpend.map((a, i) => dataStack.value.clicks[i] ? Math.round(a / dataStack.value.clicks[i]) : 0))
const arrROAS = computed(() => dataStack.value.revenue.map((r, i) => dataStack.value.adSpend[i] ? parseFloat(((r / dataStack.value.adSpend[i]) * 100).toFixed(1)) : 0))

const mxCPA = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(arrCPA.value, t)}), {}))
const mxCPC = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(arrCPC.value, t)}), {}))
const mxROAS = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(arrROAS.value, t)}), {}))

// Formatters
const formatNum = (v) => Math.round(v).toLocaleString()
const formatMoney = (v) => '₩' + Math.round(v).toLocaleString()

// Chart Options
const chartTabs = ['전체', 'CPC', 'CPA', 'ROAS']
const curTab = ref('전체')

const baseO = {
  chart: { toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  grid: { borderColor: 'rgba(255,255,255,0.1)' },
  xaxis: { categories: timeline, labels: { style: { fontSize: '10px', colors: '#94a3b8' } }, axisBorder: { show: false }, axisTicks: { show: false } },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' }, fontSize: '12px' },
  tooltip: { 
    shared: true, 
    intersect: false,
    y: { formatter: function (val) { return formatNum(val) } }
  }
}

const cSers = computed(() => {
  const d = dataStack.value
  if (curTab.value === '전체') {
    return [
      { name: '광고비', type: 'column', data: d.adSpend },
      { name: 'CPA', type: 'line', data: arrCPA.value },
      { name: 'ROAS', type: 'line', data: arrROAS.value }
    ]
  } else if (curTab.value === 'CPC') {
    return [
      { name: '총 클릭수', type: 'column', data: d.clicks },
      { name: 'CPC', type: 'line', data: arrCPC.value }
    ]
  } else if (curTab.value === 'CPA') {
    return [
      { name: '총 전환수', type: 'column', data: d.conversions },
      { name: 'CPA', type: 'line', data: arrCPA.value }
    ]
  } else if (curTab.value === 'ROAS') {
    return [
      { name: '광고비', type: 'column', data: d.adSpend },
      { name: '신규매출액', type: 'column', data: d.revenue },
      { name: 'ROAS', type: 'line', data: arrROAS.value }
    ]
  }
  return []
})

const cOpts = computed(() => {
  const opts = { ...baseO }
  if (curTab.value === '전체') {
    opts.colors = ['#4ade80', '#F2C037', '#00f2ff']
    opts.stroke = { curve: 'smooth', width: [0, 3, 3] }
    opts.yaxis = [
      { opposite: true, title: { text: '광고비', style: { color: '#4ade80' } }, labels: { formatter: v => formatNum(v) } },
      { opposite: false, title: { text: 'CPA', style: { color: '#F2C037' } }, labels: { formatter: v => formatNum(v) } },
      { opposite: false, title: { text: 'ROAS', style: { color: '#00f2ff' } }, labels: { formatter: v => formatNum(v) } }
    ]
  } else if (curTab.value === 'CPC') {
    opts.colors = ['#60a5fa', '#2dd4bf']
    opts.stroke = { curve: 'smooth', width: [0, 4] }
    opts.yaxis = [
      { opposite: true, title: { text: '총 클릭수', style: { color: '#60a5fa' } }, labels: { formatter: v => formatNum(v) } },
      { opposite: false, title: { text: 'CPC', style: { color: '#2dd4bf' } }, labels: { formatter: v => formatNum(v) } }
    ]
  } else if (curTab.value === 'CPA') {
    opts.colors = ['#a855f7', '#F2C037']
    opts.stroke = { curve: 'smooth', width: [0, 4] }
    opts.yaxis = [
      { opposite: true, title: { text: '총 전환수', style: { color: '#a855f7' } }, labels: { formatter: v => formatNum(v) } },
      { opposite: false, title: { text: 'CPA', style: { color: '#F2C037' } }, labels: { formatter: v => formatNum(v) } }
    ]
  } else if (curTab.value === 'ROAS') {
    opts.colors = ['#4ade80', '#e879f9', '#00f2ff']
    opts.stroke = { curve: 'smooth', width: [0, 0, 4] }
    opts.yaxis = [
      { opposite: true, title: { text: '광고비/매출액', style: { color: '#e879f9' } }, labels: { formatter: v => formatNum(v) } },
      { opposite: true, show: false, labels: { formatter: v => formatNum(v) } },
      { opposite: false, title: { text: 'ROAS', style: { color: '#00f2ff' } }, labels: { formatter: v => formatNum(v) } }
    ]
  }
  return opts
})

</script>

<style scoped>
.section-container { margin-bottom: 72px; animation: fadeIn 0.7s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
.section-title { color: #ECEFF4; font-size: 1.8rem; font-weight: 900; margin-bottom: 24px; border-left: 5px solid #00f2ff; padding-left: 15px; }

.glass-card { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; }

/* ── KPI 그리드 (반응형) ── */
.kpi-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.kpi-card {
  flex: 1 1 140px;
  min-width: 130px;
  max-width: 220px;
  background: rgba(20, 25, 40, 0.6);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  transition: transform 0.2s, border-color 0.2s;
}
.kpi-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255,255,255,0.3);
}
.kpi-highlight-neon {
  border-color: rgba(0,242,255,0.5);
  box-shadow: 0 0 12px rgba(0,242,255,0.25);
}
.kpi-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
.kpi-value { font-size: 1.4rem; font-weight: 800; line-height: 1.3; }
.kpi-sub { font-size: 0.7rem; color: #64748b; margin-top: 2px; }

.kpi-arrow {
  color: rgba(255,255,255,0.25);
  font-size: 1.4rem;
  font-weight: 900;
  flex: 0 0 auto;
}
@media (max-width: 768px) {
  .kpi-arrow { display: none; }
}

/* ── 효율 지표 배지 행 ── */
.efficiency-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}
.eff-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 24px;
  font-weight: 700;
  font-size: 0.85rem;
}
.eff-label {
  opacity: 0.7;
  font-size: 0.75rem;
  letter-spacing: 1px;
}
.eff-teal { background: rgba(45,212,191,0.12); border: 1px solid rgba(45,212,191,0.4); color: #2dd4bf; }
.eff-blue { background: rgba(96,165,250,0.12); border: 1px solid rgba(96,165,250,0.4); color: #60a5fa; }
.eff-warning { background: rgba(242,192,55,0.12); border: 1px solid rgba(242,192,55,0.4); color: #F2C037; }
.eff-roas {
  background: linear-gradient(135deg, rgba(0,242,255,0.15), rgba(168,85,247,0.15));
  border: 2px solid rgba(0,242,255,0.5);
  color: #00f2ff;
  font-size: 1rem;
  text-shadow: 0 0 10px rgba(0,242,255,0.6);
  animation: pulseRoas 3s infinite alternate ease-in-out;
}
@keyframes pulseRoas {
  0% { box-shadow: 0 0 6px rgba(0,242,255,0.2); }
  100% { box-shadow: 0 0 20px rgba(0,242,255,0.5); }
}

/* ── 카테고리 그리드 ── */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
}
.cat-node {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15);
  padding: 8px 12px;
  border-radius: 8px;
  color: #cbd5e1;
  font-weight: 600;
  font-size: 0.8rem;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* Filter Tabs */
.team-filter-ext { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 12px; }
.team-pill { padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 700; color: #cbd5e1; white-space: nowrap; transition: all 0.2s; }
.pill-overall  { background: rgba(0,242,255,0.15); color: #00f2ff; }
.pill-overall.active  { background: #00f2ff; color: #000; }
.pill-team     { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.pill-team.active     { background: white; color: #1e293b; }

/* Text Colors */
.text-neon { color: #00f2ff; text-shadow: 0 0 10px rgba(0,242,255,0.5); }
.text-teal { color: #2dd4bf; }
.text-blue { color: #60a5fa; }
.text-warning { color: #F2C037; }
.text-positive { color: #4ade80; }

.metric-col-header { text-align: center; font-weight: 800; font-size: 0.85rem; padding: 4px 0; border-radius: 6px; letter-spacing: 0.5px; }
.metric-warning { color: #F2C037; background: rgba(242, 192, 55, 0.12); border: 1px solid rgba(242, 192, 55, 0.35); text-shadow: 0 0 8px rgba(242, 192, 55, 0.4); }
.metric-teal { color: #2dd4bf; background: rgba(45, 212, 191, 0.12); border: 1px solid rgba(45, 212, 191, 0.35); text-shadow: 0 0 8px rgba(45, 212, 191, 0.4); }
.metric-neon { color: #00f2ff; background: rgba(0, 242, 255, 0.12); border: 1px solid rgba(0, 242, 255, 0.35); text-shadow: 0 0 8px rgba(0,242,255,0.4); }

:deep(.text-h3) { font-size: 2rem !important; letter-spacing: -1px; }
</style>
