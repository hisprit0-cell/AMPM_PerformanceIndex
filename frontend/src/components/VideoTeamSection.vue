<template>
  <div class="section-container">
    <h2 class="section-title">Video Mkt Team (영상마케팅팀)</h2>

    <div class="row q-col-gutter-lg items-stretch">
      <!-- 좌측: 도표 영역 -->
      <div class="col-12 col-md-8" style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- 상단 도표: 월간 상담신청 수 추이 -->
        <q-card class="glass-card q-pa-md" style="flex:1;">
          <div class="row justify-between items-center q-mb-sm">
            <div class="text-h6 text-weight-bold">월간 상담신청 수 추이</div>
            <router-link to="/videoteam" class="detail-link">상세보기<q-icon name="arrow_forward" size="15px" class="q-ml-xs" /></router-link>
          </div>
          <div class="team-filter-ext q-mb-md">
            <div
              v-for="c in consultLabels" :key="'cl-'+c"
              @click="curConsult = c"
              :class="['team-pill', c === '전체' ? 'pill-overall' : 'pill-team', { 'active': curConsult === c }]"
            >
              {{ c }}
            </div>
          </div>
          <apexchart type="line" height="230" :options="cOpts" :series="cSers" :key="'cc-'+curConsult" />
        </q-card>

        <!-- 하단 도표: 월간 조회수 및 구독자 수 추이 -->
        <q-card class="glass-card q-pa-md" style="flex:1;">
          <div class="row justify-between items-center q-mb-sm">
            <div class="text-h6 text-weight-bold">월간 조회수 및 구독자 수 추이</div>
          </div>
          <div class="team-filter-ext q-mb-md">
            <div
              v-for="ch in channelLabels" :key="'chl-'+ch"
              @click="curChannel = ch"
              :class="['team-pill', ch === '전체' ? 'pill-overall' : 'pill-team', { 'active': curChannel === ch }]"
            >
              {{ ch }}
            </div>
          </div>
          <apexchart type="line" height="230" :options="vOpts" :series="vSers" :key="'vc-'+curChannel" />
        </q-card>
      </div>

      <!-- 우측: 요약 섹션 -->
      <div class="col-12 col-md-4" style="display:flex; flex-direction:column; gap:12px;">
        
        <!-- 카드 1: 총 상담신청 수 -->
        <q-card class="glass-card q-pa-md" style="flex:0 0 auto;">
          <div class="text-overline text-grey-5" style="font-size:11px; line-height:1.6;">전체 상담신청 수</div>
          <div class="text-neon text-weight-bold" style="font-size:2.2rem; line-height:1.2;">{{ sumTotalC }} 건</div>
          <div class="row q-mt-sm" style="border-top:1px solid rgba(255,255,255,0.1); padding-top:8px;">
            <div class="col-6">
              <div class="text-overline text-grey-5" style="font-size:10px; line-height:1.2;">온라인</div>
              <div class="text-weight-bold" style="color:#a855f7; font-size:1.1rem;">{{ sumOnlineC }} 건</div>
            </div>
            <div class="col-6 text-right">
              <div class="text-overline text-grey-5" style="font-size:10px; line-height:1.2;">내부입력</div>
              <div class="text-weight-bold" style="color:#F2C037; font-size:1.1rem;">{{ sumInternalC }} 건</div>
            </div>
          </div>
        </q-card>

        <!-- 카드 2: 총 조회수 -->
        <q-card class="glass-card q-pa-md" style="flex:0 0 auto;">
          <div class="text-overline text-grey-5" style="font-size:11px; line-height:1.6;">전체 월간 조회수</div>
          <div class="text-info text-weight-bold" style="font-size:2.2rem; line-height:1.2;">{{ sumTotalV }} 회</div>
        </q-card>

        <!-- 카드 3: 총 구독자 수 -->
        <q-card class="glass-card q-pa-md" style="flex:0 0 auto;">
          <div class="text-overline text-grey-5" style="font-size:11px; line-height:1.6;">전체 구독자/팔로워수</div>
          <div class="text-warning text-weight-bold" style="font-size:2.2rem; line-height:1.2;">{{ sumTotalS }} 명</div>
        </q-card>

        <!-- 카드 4: 지표 분석 -->
        <q-card class="glass-card q-pa-md" style="flex:1 1 0; display:flex; flex-direction:column; overflow:visible;">
          <div class="text-subtitle1 text-center q-mb-sm text-grey-2 text-weight-bold" style="letter-spacing:1px;">채널 성장 지표 분석</div>
          <!-- 컬럼 헤더 -->
          <div class="row q-mb-sm" style="gap:0;">
            <div class="col-4" style="padding-right:4px;">
              <div class="metric-col-header metric-neon">상담</div>
            </div>
            <div class="col-4" style="padding:0 2px;">
              <div class="metric-col-header metric-info">조회</div>
            </div>
            <div class="col-4" style="padding-left:4px;">
              <div class="metric-col-header metric-warning">구독</div>
            </div>
          </div>
          <!-- 3열 데이터 -->
          <div class="row" style="flex:1 1 auto;">
            <div class="col-4" style="border-right: 1px solid rgba(255,255,255,0.1); padding-right:2px;">
              <GrowthItems :metrics="mxTotalC" color="neon" show-mom />
            </div>
            <div class="col-4" style="border-right: 1px solid rgba(255,255,255,0.1); padding:0 3px;">
              <GrowthItems :metrics="mxTotalV" color="info" show-mom />
            </div>
            <div class="col-4" style="padding-left:2px;">
              <GrowthItems :metrics="mxTotalS" color="warning" show-mom />
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

// ── Global Tools
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
const baseO = {
  chart: { toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  stroke: { curve: 'smooth', width: 2 },
  grid: { borderColor: 'rgba(255,255,255,0.1)' },
  xaxis: { categories: timeline, labels: { style: { fontSize: '10px', colors: '#94a3b8' } }, axisBorder: { show: false }, axisTicks: { show: false } },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' }, fontSize: '12px' },
  tooltip: { shared: true, intersect: false }
}

// ── Data Generation
const consultLabels = ['전체', '온라인', '내부입력']
const curConsult = ref('전체')
const consultData = ref({})

const channelLabels = ['전체', '마케팅학교', '마케팅 아지트', '인스타그램']
const curChannel = ref('전체')
const channelData = ref({})

const initData = () => {
  // Consultations (상단 도표)
  const cMap = { '전체': Array(24).fill(0), '온라인': [], '내부입력': [] }
  for (let i = 0; i < 24; i++) {
    const onl = 100 + Math.floor(Math.random() * 100)
    const int = 50 + Math.floor(Math.random() * 50)
    cMap['온라인'].push(onl)
    cMap['내부입력'].push(int)
    cMap['전체'][i] = onl + int
  }
  consultData.value = cMap

  // Views & Subs (하단 도표)
  const chMap = { '전체': { v: Array(24).fill(0), s: Array(24).fill(0) } }
  const subChannels = channelLabels.filter(c => c !== '전체')
  subChannels.forEach(ch => {
    chMap[ch] = { v: [], s: [] }
    let sAccum = 200 + Math.floor(Math.random() * 100)
    for (let i = 0; i < 24; i++) {
      sAccum += Math.floor(Math.random() * 30) // Subs growing
      const v = 20000 + Math.floor(Math.random() * 30000) // Views fluctuating
      chMap[ch].s.push(sAccum)
      chMap[ch].v.push(v)
      chMap['전체'].s[i] += sAccum
      chMap['전체'].v[i] += v
    }
  })
  channelData.value = chMap
}

// ── Computed: Consultations
const cSers = computed(() => {
  if (curConsult.value === '전체') {
    return [
      { name: '전체', type: 'column', data: consultData.value['전체'] },
      { name: '온라인', type: 'line', data: consultData.value['온라인'] },
      { name: '내부입력', type: 'line', data: consultData.value['내부입력'] }
    ]
  }
  return [{ name: curConsult.value, type: 'column', data: consultData.value[curConsult.value] || [] }]
})
const cOpts = computed(() => {
  const d = consultData.value['전체'] || []
  const maxC = d.length ? Math.ceil(Math.max(...d) * 1.2 / 50) * 50 : 500
  return {
    ...baseO,
    colors: ['#00E5FF', '#a855f7', '#F2C037'],
    stroke: { curve: 'smooth', width: [0, 3, 3] },
    plotOptions: { bar: { columnWidth: '50%', borderRadius: 2 } },
    yaxis: [{
      title: { text: curConsult.value + ' (건)', style: { color: '#00E5FF' } },
      min: 0, max: maxC,
      labels: { formatter: v => Math.round(v), style: { colors: '#00E5FF' } }
    }]
  }
})

// ── Computed: Views & Subs
const vSers = computed(() => {
  const d = channelData.value[curChannel.value] || { v: [], s: [] }
  const sName = curChannel.value === '인스타그램' ? '팔로워' : '구독자'
  return [
    { name: '조회수', type: 'column', data: d.v },
    { name: sName, type: 'line', data: d.s }
  ]
})
const vOpts = computed(() => {
  const d = channelData.value[curChannel.value] || { v: [], s: [] }
  const maxV = d.v.length ? Math.ceil(Math.max(...d.v) * 1.2 / 10000) * 10000 : 150000
  const maxS = d.s.length ? Math.ceil(Math.max(...d.s) * 1.2 / 100) * 100 : 5000
  const sTitle = curChannel.value === '인스타그램' ? '팔로워수' : '구독자수'
  return {
    ...baseO,
    colors: ['#3F51B5', '#E91E63'],
    stroke: { curve: 'smooth', width: [0, 3] },
    yaxis: [
      {
        opposite: true,
        title: { text: '조회수', style: { color: '#3F51B5' } },
        min: 0, max: maxV,
        labels: { formatter: v => (v || 0).toLocaleString(), style: { colors: '#3F51B5' } }
      },
      {
        opposite: false,
        title: { text: sTitle, style: { color: '#E91E63' } },
        min: 0, max: maxS,
        labels: { formatter: v => Math.round(v).toLocaleString(), style: { colors: '#E91E63' } }
      }
    ]
  }
})

// ── Right KPIs
const sumTotalC = computed(() => (consultData.value['전체']?.[23] || 0).toLocaleString())
const sumOnlineC = computed(() => (consultData.value['온라인']?.[23] || 0).toLocaleString())
const sumInternalC = computed(() => (consultData.value['내부입력']?.[23] || 0).toLocaleString())
const sumTotalV = computed(() => (channelData.value['전체']?.v?.[23] || 0).toLocaleString())
const sumTotalS = computed(() => (channelData.value['전체']?.s?.[23] || 0).toLocaleString())

const mxTotalC = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(consultData.value['전체'], t)}), {}))
const mxTotalV = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(channelData.value['전체']?.v, t)}), {}))
const mxTotalS = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(channelData.value['전체']?.s, t)}), {}))

onMounted(() => {
  initData()
})
</script>

<style scoped>
.section-container { margin-bottom: 72px; animation: fadeIn 0.7s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
.section-title { color: #ECEFF4; font-size: 1.8rem; font-weight: 900; margin-bottom: 24px; border-left: 5px solid #00f2ff; padding-left: 15px; }
.glass-card { background: rgba(30, 41, 59, 0.55); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; transition: border-color 0.3s ease; }
.glass-card:hover { border-color: rgba(0, 242, 255, 0.4); }

.team-filter-ext { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 12px; }
.team-pill { padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 700; color: #cbd5e1; white-space: nowrap; transition: all 0.2s; }
.pill-overall  { background: rgba(245,158,11,0.15); color: #fbbf24; }
.pill-overall.active  { background: #f59e0b; color: white; }
.pill-team     { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.pill-team.active     { background: white; color: #1e293b; }

.text-neon { color: #00f2ff; text-shadow: 0 0 10px rgba(0,242,255,0.5); }
.text-info { color: #60a5fa; }
.text-warning { color: #F2C037; }

.metric-col-header { text-align: center; font-weight: 800; font-size: 0.85rem; padding: 4px 0; border-radius: 6px; letter-spacing: 0.5px; }
.metric-neon { color: #00f2ff; background: rgba(0, 242, 255, 0.12); border: 1px solid rgba(0, 242, 255, 0.35); text-shadow: 0 0 8px rgba(0,242,255,0.6); }
.metric-info { color: #60a5fa; background: rgba(96, 165, 250, 0.12); border: 1px solid rgba(96, 165, 250, 0.35); text-shadow: 0 0 8px rgba(96,165,250,0.4); }
.metric-warning { color: #F2C037; background: rgba(242, 192, 55, 0.12); border: 1px solid rgba(242, 192, 55, 0.35); text-shadow: 0 0 8px rgba(242, 192, 55, 0.4); }

/* Harness Override: Prevent GrowthItems text-h3 from overlapping in 3-column layout */
:deep(.text-h3) { font-size: 2rem !important; letter-spacing: -1px; }
:deep(.text-h6) { font-size: 1.1rem !important; }
</style>
