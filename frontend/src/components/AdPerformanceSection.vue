<template>
  <div class="section-container" style="margin-top: 48px;">
    <h2 class="section-title">Advertisement Performance (광고 성과)</h2>

    <!-- 상단 파이프라인 (Flowchart) -->
    <q-card class="glass-card q-pa-lg pipeline-wrapper q-mb-lg" style="overflow:visible;">
      <div class="pipeline-scroll-area">
        <div class="pipeline-container">
          
          <!-- Node 1: 광고비 (Highlight) -->
          <KpiPipelineNode title="광고비 (Ad Spend)" :value="formatMoney(sumAdSpend)" color="neon" sub="예산 소진액" class="highlight-node" />

          <!-- Edge 1 -->
          <KpiPipelineEdge />

          <!-- Node 2: 노출수 -->
          <KpiPipelineNode title="노출수 (Impressions)" :value="formatNum(sumImpressions)" color="teal" sub="총 노출 건수" />

          <!-- Edge 2: CTR & CPC -->
          <KpiPipelineEdge :badge="`CTR ${ctr.toFixed(2)}% | CPC ₩${formatNum(cpc)}`" highlight />

          <!-- Node 3: 클릭수 -->
          <KpiPipelineNode title="클릭수 (Clicks)" :value="formatNum(sumClicks)" color="blue" sub="총 클릭 건수" />

          <!-- Branch to Categories (6 항목) -->
          <div class="pipeline-branch">
            <div class="branch-lines-in"></div>
            <div class="category-nodes">
              <div class="cat-node">광고 상담: {{ formatNum(catA) }}건</div>
              <div class="cat-node">하단 상담: {{ formatNum(catB) }}건</div>
              <div class="cat-node">우측 상담: {{ formatNum(catC) }}건</div>
              <div class="cat-node">랜딩 상담: {{ formatNum(catD) }}건</div>
              <div class="cat-node">수기(4111): {{ formatNum(catE) }}건</div>
              <div class="cat-node">수기(4488): {{ formatNum(catF) }}건</div>
            </div>
            <div class="branch-lines-out"></div>
          </div>

          <!-- Node 4: 총 전환수 -->
          <KpiPipelineNode title="총 전환수 (Conversions)" :value="formatNum(sumConversions)" color="white" sub="승인된 총 전환" />

          <!-- Edge 4: CVR -->
          <KpiPipelineEdge :badge="`CVR ${cvr.toFixed(2)}%`" highlight />

          <!-- Node 5: CPA (Highlight) -->
          <KpiPipelineNode title="CPA (전환당 비용)" :value="formatMoney(cpa)" color="warning" sub="객단가 기준" class="highlight-node highlight-warning" />

          <!-- Edge 5 -->
          <KpiPipelineEdge />

          <!-- Node 6: 신규 매출액 -->
          <KpiPipelineNode title="신규 매출액 (Revenue)" :value="formatMoney(sumRevenue)" color="positive" sub="발생한 총 매출" />

          <!-- Edge 6: ROAS -->
          <KpiPipelineEdge glow />

          <!-- Node 7: ROAS (Highlight Final) -->
          <div class="node-box node-final bounce-ani highlight-node highlight-roas">
            <div class="node-title text-uppercase text-weight-bolder" style="color:#00f2ff; letter-spacing:2px; font-size:0.9rem;">Final ROAS</div>
            <div class="node-value text-white text-weight-bolder" style="font-size: 2.8rem; text-shadow: 0 0 15px rgba(0,242,255,0.8);">{{ formatNum(roas.toFixed(0)) }}%</div>
          </div>

        </div>
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
          <div style="flex:1; min-height: 480px;">
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
        <q-card class="glass-card q-pa-md" style="flex:1 1 0; display:flex; flex-direction:column;">
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
import KpiPipelineNode from './KpiPipelineNode.vue'
import KpiPipelineEdge from './KpiPipelineEdge.vue'
import GrowthItems from './GrowthItems.vue'

// Global Time Tools
const timeline = Array(24).fill(0).map((_, i) => {
  const m = (i % 12 + 7) % 12 || 12
  const yr = i < 6 ? '22.' : i < 18 ? '23.' : '24.'
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
  tooltip: { shared: true, intersect: false }
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
      { opposite: true, show: false }, // Hide the second axis since they share the same scale concept (money)
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

/* ── Flowchart CSS ── */
.pipeline-scroll-area { 
  overflow-x: auto; 
  padding: 24px 10px 48px; /* space for overflow badges */
}
.pipeline-scroll-area::-webkit-scrollbar { height: 8px; }
.pipeline-scroll-area::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
.pipeline-scroll-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }

.pipeline-container { display: flex; align-items: center; justify-content: space-between; min-width: 1400px; gap: 8px; }

/* Highlight Node Override for generic PipelineNode */
:deep(.node-box) { transition: all 0.3s ease; }
:deep(.highlight-node) {
  border: 2px solid #00f2ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
  background: rgba(20, 25, 40, 0.8) !important;
  transform: scale(1.05);
}
:deep(.highlight-node .node-value) { color: #00f2ff !important; text-shadow: 0 0 10px rgba(0,242,255,0.8); }

:deep(.highlight-warning) {
  border: 2px solid #F2C037;
  box-shadow: 0 0 15px rgba(242, 192, 55, 0.4);
}
:deep(.highlight-warning .node-value) { color: #F2C037 !important; text-shadow: 0 0 10px rgba(242, 192, 55, 0.8); }

:deep(.node-final) {
  flex: 0 0 auto;
  min-width: 150px;
  background: rgba(20, 25, 40, 0.6);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  position: relative;
  z-index: 2;
}
:deep(.highlight-roas) {
  background: linear-gradient(135deg, rgba(0,242,255,0.15), rgba(168,85,247,0.15)) !important;
  border: 2px solid rgba(0,242,255,0.6);
  min-width: 200px;
}
.bounce-ani { animation: bounceGlow 3s infinite alternate ease-in-out; }
@keyframes bounceGlow {
  0% { box-shadow: 0 0 10px rgba(0,242,255,0.2); transform: scale(1); }
  100% { box-shadow: 0 0 30px rgba(0,242,255,0.6); transform: scale(1.08); }
}

/* Branching logic for categories */
.pipeline-branch { display: flex; align-items: center; flex: 0 0 auto; position: relative; gap: 12px; }
.category-nodes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; z-index: 2; }
.cat-node {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 12px; border-radius: 6px; color: #cbd5e1; font-weight: 600; font-size: 0.8rem;
  text-align: center; width: 140px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
}

.branch-lines-in, .branch-lines-out { width: 40px; height: 100px; position: relative; }
.branch-lines-in::before, .branch-lines-out::before {
  content: ''; position: absolute; top: 50%; width: 100%; height: 2px;
  background: rgba(255,255,255,0.15); transform: translateY(-50%);
}
</style>
