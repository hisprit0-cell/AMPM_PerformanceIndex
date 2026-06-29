<template>
  <div class="section-container">
    <h2 class="section-title">Dev Team (개발팀)</h2>

    <!-- items-stretch: 양쪽 col 높이를 서로 맞춤 -->
    <div class="row q-col-gutter-lg items-stretch">

      <!-- 좌측: 차트 카드 (display:flex + flex-colum 으로 높이 늘어남) -->
      <div class="col-12 col-md-8" style="display:flex;">
        <q-card class="glass-card q-pa-md" style="width:100%; height:100%; display:flex; flex-direction:column;">
          <div class="row justify-between items-center q-mb-sm">
            <div class="text-h6 text-weight-bold">도메인별 트래픽 (PV/UV)</div>
            <router-link to="/devteam" class="detail-link">상세보기<q-icon name="arrow_forward" size="15px" class="q-ml-xs" /></router-link>
          </div>

          <!-- team-filter-ext 클래스를 추가해 무조건 줄바꿈 되도록 설정 -->
          <div class="team-filter-ext q-mb-md">
            <div
              v-for="d in dList" :key="'dl-'+d"
              @click="selDev(d)"
              :class="['team-pill', getPillStyle(d), { 'active': curD === d }]"
            >
              {{ d }}
            </div>
          </div>
          <apexchart type="line" height="350" :options="dOpts" :series="dSers" :key="'cd-'+curD" />

        </q-card>
      </div>

      <!-- 우측: KPI 카드 3개 (flex column → 카드들이 좌측 높이에 맞게 배분) -->
      <div class="col-12 col-md-4" style="display:flex; flex-direction:column; gap:12px;">

        <!-- 카드 1: UV -->
        <q-card class="glass-card q-pa-md" style="flex:0 0 auto; height:auto;">
          <div class="text-overline text-grey-5" style="font-size:11px; line-height:1.6;">Unique Visitors (UV)</div>
          <div class="text-neon text-weight-bold" style="font-size:2.2rem; line-height:1.2;">{{ sumUV }} UV</div>
        </q-card>

        <!-- 카드 2: PV -->
        <q-card class="glass-card q-pa-md" style="flex:0 0 auto; height:auto;">
          <div class="text-overline text-grey-5" style="font-size:11px; line-height:1.6;">Page Views (PV)</div>
          <div class="text-info text-weight-bold" style="font-size:2.2rem; line-height:1.2;">{{ sumPV }} PV</div>
        </q-card>

        <!-- 카드 3: 트래픽 분석 (flex:1 → 나머지 높이 전부 채움) -->
        <q-card class="glass-card q-pa-md" style="flex:1 1 0; min-height:0; height:auto; display:flex; flex-direction:column; overflow:hidden;">
          <div class="text-subtitle1 text-center q-mb-sm text-grey-2 text-weight-bold" style="letter-spacing:1px;">트래픽 분석</div>
          <!-- 컨럼 헤더 -->
          <div class="row q-mb-sm" style="gap:0;">
            <div class="col-6" style="padding-right:8px;">
              <div class="metric-col-header metric-neon">UV Growth</div>
            </div>
            <div class="col-6" style="padding-left:8px;">
              <div class="metric-col-header metric-info">PV Growth</div>
            </div>
          </div>
          <div class="row" style="flex:1 1 0; min-height:0; overflow:hidden;">
            <div class="col-6" style="border-right: 2px solid rgba(0,242,255,0.2); padding-right:4px;">
              <GrowthItems :metrics="mxUV" color="neon" show-mom />
            </div>
            <div class="col-6" style="padding-left:4px;">
              <GrowthItems :metrics="mxPV" color="info" show-mom />
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

// ── Global Tools (for Dev) ──────────────────────
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

// ── 2. Dev Team ──────────────────────────────────
const curD = ref('전체')
const dList = ['전체','www.ampm.co.kr','chat.ampm.co.kr','home.ampm.co.kr','inside.ampm.co.kr','video.ampm.co.kr','rfp.ampm.co.kr','keyword.ampm.co.kr','item.ampm.co.kr','portfolio.ampm.co.kr','www.ampmglobal.co.kr','erp.ampm.co.kr']
const devMData = ref({})

const initDev = () => {
  const map = { '전체': { p: Array(24).fill(0), v: Array(24).fill(0) } }
  dList.filter(d => d !== '전체').forEach(d => {
    map[d] = { p: [], v: [] }
    for (let i = 0; i < 24; i++) {
      // UV와 PV를 서로 독립적인 값으로 생성
      const uv = 3000 + Math.floor(Math.random() * 15000)
      const pv = 10000 + Math.floor(Math.random() * 90000) // PV 독립적 생성
      map[d].v.push(uv); map[d].p.push(pv)
      map['전체'].v[i] += uv; map['전체'].p[i] += pv
    }
  })
  devMData.value = map
}

const dSers = computed(() => { 
  const d = devMData.value[curD.value] || {p:[],v:[]}; 
  return [
    { name:'UV', type:'column', data:d.v }, 
    { name:'PV', type:'line', data:d.p }
  ] 
})

const dOpts = computed(() => {
  const d = devMData.value[curD.value] || {p:[],v:[]};
  const maxUV = d.v.length ? Math.ceil(Math.max(...d.v) * 1.2 / 1000) * 1000 : 200000;
  const maxPV = d.p.length ? Math.ceil(Math.max(...d.p) * 1.2 / 10000) * 10000 : 1000000;
  return {
    ...baseO, 
    colors: ['#F2C037','#00E5FF'], 
    stroke: { curve: 'smooth', width: [0, 3] },
    fill:   { opacity: [0.85, 1] },
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
        title: { text:'UV', style: { color: '#F2C037', fontSize: '14px', fontWeight: 800 } }, 
        min:0, max: maxUV,
        labels: { formatter: v => (v || 0).toLocaleString(), style: { colors: '#F2C037', fontSize: '14px', fontWeight: 600 } }
      }, 
      { 
        opposite:true, 
        title: { text:'PV', style: { color: '#00E5FF', fontSize: '14px', fontWeight: 800 } }, 
        min:0, max: maxPV,
        labels: { formatter: v => (v || 0).toLocaleString(), style: { colors: '#00E5FF', fontSize: '14px', fontWeight: 600 } }
      }
    ],
    legend: { position: 'bottom', labels: { colors: '#94a3b8' }, fontSize: '13px' },
    tooltip: { shared: true, intersect: false }
  }
})

const sumUV = computed(() => (devMData.value[curD.value]?.v?.[23] || 0).toLocaleString())
const sumPV = computed(() => (devMData.value[curD.value]?.p?.[23] || 0).toLocaleString())
const mxUV = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(devMData.value[curD.value]?.v, t)}), {}))
const mxPV = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(devMData.value[curD.value]?.p, t)}), {}))

const selDev = d => curD.value = d
const getPillStyle = n => n === '전체' ? 'pill-overall' : n.includes('본부') ? 'pill-division' : 'pill-team'

onMounted(() => {
  initDev()
})
</script>

<style scoped>
.section-container { margin-bottom: 72px; animation: fadeIn 0.7s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
.section-title { color: #ECEFF4; font-size: 1.8rem; font-weight: 900; margin-bottom: 24px; border-left: 5px solid #00f2ff; padding-left: 15px; }
.glass-card { background: rgba(30, 41, 59, 0.55); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; transition: border-color 0.3s ease; }
.glass-card:hover { border-color: rgba(0, 242, 255, 0.4); }
.team-filter-ext { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 12px; }
.scroll-x { scrollbar-width: thin; scrollbar-color: #00f2ff transparent; }
.team-pill { padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 700; color: #cbd5e1; white-space: nowrap; transition: all 0.2s; }
.pill-overall  { background: rgba(245,158,11,0.15); color: #fbbf24; }
.pill-overall.active  { background: #f59e0b; color: white; }
.pill-division { background: rgba(6,182,212,0.15);  color: #22d3ee; }
.pill-division.active { background: #06b6d4; color: white; }
.pill-team     { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.pill-team.active     { background: white; color: #1e293b; }
.border-r  { border-right: 1px solid rgba(255,255,255,0.1); }
.text-neon { color: #00f2ff; text-shadow: 0 0 10px rgba(0,242,255,0.5); }
.text-info { color: #00E5FF; }
/* .detail-link 는 전역 style.css 의 통일 스타일 사용 */
.metric-col-header { text-align: center; font-weight: 800; font-size: 0.9rem; padding: 5px 0; border-radius: 6px; letter-spacing: 0.5px; }
.metric-neon { color: #00f2ff; background: rgba(0, 242, 255, 0.12); border: 1px solid rgba(0, 242, 255, 0.35); text-shadow: 0 0 8px rgba(0,242,255,0.6); }
.metric-info { color: #60a5fa; background: rgba(96, 165, 250, 0.12); border: 1px solid rgba(96, 165, 250, 0.35); text-shadow: 0 0 8px rgba(96,165,250,0.4); }
</style>
