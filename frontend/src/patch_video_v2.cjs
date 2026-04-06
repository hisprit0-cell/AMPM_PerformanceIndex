const fs = require('fs');
let content = fs.readFileSync('d:/_PROJECT/AMPM_PerformanceIndex/frontend/src/App.vue', 'utf8');

const videoLogic = `
// Video Team State & Data Generator
const selectedVideoDomain = ref('전체')
const videoDomainsList = ref([
  '전체', '마케팅학교', '마케팅 아지트', '인스타그램'
])
const videoDataMap = ref({})

function generateVideoData() {
  const mapData = {}
  const aggConsults = Array(24).fill(0)
  const aggSubs = Array(24).fill(0)
  const aggViews = Array(24).fill(0)
  
  videoDomainsList.value.forEach(domain => {
    if (domain === '전체') return;
    mapData[domain] = { consults: [], subs: [], views: [] }
    let baseConsults = Math.floor(Math.random() * 500) + 100
    for(let m=0; m<24; m++){
      let consults = baseConsults + Math.floor(Math.random() * 50)
      let subs = Math.floor(consults * (Math.random() * 5 + 10)) 
      let views = Math.floor(subs * (Math.random() * 20 + 50)) 
      mapData[domain].consults.push(consults)
      mapData[domain].subs.push(subs)
      mapData[domain].views.push(views)
      aggConsults[m] += consults
      aggSubs[m] += subs
      aggViews[m] += views
    }
  })
  
  mapData['전체'] = { consults: aggConsults, subs: aggSubs, views: aggViews }
  videoDataMap.value = mapData
}

generateVideoData()

function selectVideoDomain(domain) {
  selectedVideoDomain.value = domain
}

const videoChartSeries = computed(() => {
  const data = videoDataMap.value[selectedVideoDomain.value]
  if (!data) return []
  return [
    { name: '월간 조회수', type: 'bar', data: data.views },
    { name: '신규구독자 수', type: 'line', data: data.subs }
  ]
})

const videoConsultSeries = computed(() => {
  const data = videoDataMap.value[selectedVideoDomain.value]
  if (!data) return []
  return [
    { name: '월간 상담신청 수', type: 'bar', data: data.consults }
  ]
})

const sumConsults = computed(() => {
  const data = videoDataMap.value[selectedVideoDomain.value]
  if (!data) return "0"
  return data.consults[data.consults.length - 1].toLocaleString()
})

const sumSubscribers = computed(() => {
  const data = videoDataMap.value[selectedVideoDomain.value]
  if (!data) return "0"
  return data.subs[data.subs.length - 1].toLocaleString()
})

const sumViews = computed(() => {
  const data = videoDataMap.value[selectedVideoDomain.value]
  if (!data) return "0"
  return data.views[data.views.length - 1].toLocaleString()
})

const videoConsultMetrics = computed(() => {
  const data = videoDataMap.value[selectedVideoDomain.value];
  if(!data) return { mom: '0.0', qoq: '0.0', hoh: '0.0', yoy: '0.0' }
  return { mom: calcGrowth(data.consults, 'mom'), qoq: calcGrowth(data.consults, 'qoq'), hoh: calcGrowth(data.consults, 'hoh'), yoy: calcGrowth(data.consults, 'yoy') }
})
const videoSubsMetrics = computed(() => {
  const data = videoDataMap.value[selectedVideoDomain.value];
  if(!data) return { mom: '0.0', qoq: '0.0', hoh: '0.0', yoy: '0.0' }
  return { mom: calcGrowth(data.subs, 'mom'), qoq: calcGrowth(data.subs, 'qoq'), hoh: calcGrowth(data.subs, 'hoh'), yoy: calcGrowth(data.subs, 'yoy') }
})
const videoViewsMetrics = computed(() => {
  const data = videoDataMap.value[selectedVideoDomain.value];
  if(!data) return { mom: '0.0', qoq: '0.0', hoh: '0.0', yoy: '0.0' }
  return { mom: calcGrowth(data.views, 'mom'), qoq: calcGrowth(data.views, 'qoq'), hoh: calcGrowth(data.views, 'hoh'), yoy: calcGrowth(data.views, 'yoy') }
})

const videoChartOptions = ref({
  ...commonChartOptions,
  stroke: { width: [0, 4] },
  colors: ['#3F51B5', '#E91E63'],
  xaxis: { 
    categories: ['22.07', '22.08', '22.09', '22.10', '22.11', '22.12', '23.01', '23.02', '23.03', '23.04', '23.05', '23.06', '23.07', '23.08', '23.09', '23.10', '23.11', '23.12', '24.01', '24.02', '24.03', '24.04', '24.05', '24.06'] 
  },
  yaxis: [
    { title: { text: '월간 조회수' }, min: 0 },
    { opposite: true, title: { text: '신규구독자 수' }, min: 0 }
  ]
})

const videoConsultChartOptions = ref({
  ...commonChartOptions,
  colors: ['#00E5FF'],
  xaxis: { 
    categories: ['22.07', '22.08', '22.09', '22.10', '22.11', '22.12', '23.01', '23.02', '23.03', '23.04', '23.05', '23.06', '23.07', '23.08', '23.09', '23.10', '23.11', '23.12', '24.01', '24.02', '24.03', '24.04', '24.05', '24.06'] 
  },
  yaxis: [
    { title: { text: '월간 상담신청 수' }, min: 0 }
  ]
})
`;

// Helper for generating HTML block
function generateCol(titleClass, titleText, metricsObj, withHighlight = false, highlightClass = '') {
  const labels = ['전월 대비 (MoM)', '분기 대비 (QoQ)', '반기 대비 (HoH)', '연간 대비 (YoY)'];
  const keys = ['mom', 'qoq', 'hoh', 'yoy'];
  
  let html = `<div class="${titleClass} text-center q-mb-xs font-weight-bold" style="font-size: 0.95rem;">${titleText}</div>
                    <q-separator color="grey-8" class="q-mb-xs opacity-50" />\n`;
                    
  for(let i = 0; i < 4; i++) {
    const k = keys[i];
    const lbl = labels[i];
    let colClass = 'column items-center';
    let labelSpan = `<span class="text-subtitle2 text-grey-5" style="font-size: 0.8rem;">${lbl}</span>`;
    if (withHighlight && i === 0) {
      colClass += ' highlight-mom ' + highlightClass;
      labelSpan = `<span class="text-subtitle2 text-white font-weight-bold text-center" style="font-size: 0.8rem;">✨ ${lbl} ✨</span>`;
    } else if (i === 1 && withHighlight) {
      colClass += ' q-mt-sm'; 
    }
    
    html += `                    
                    <div class="${colClass}">
                      ${labelSpan}
                      <div :class="['${i===0&&withHighlight?'text-subtitle1':'text-subtitle1'} font-weight-bold', parseFloat(${metricsObj}.${k}) >= 0 ? 'text-positive' : 'text-negative']">
                        {{ parseFloat(${metricsObj}.${k}) > 0 ? '+' : '' }}{{ ${metricsObj}.${k} }}% 
                        <q-icon name="arrow_outward" size="xs" :style="parseFloat(${metricsObj}.${k}) < 0 ? 'transform: rotate(90deg)' : ''" />
                      </div>
                    </div>`;
  }
  return html;
}

const vidLeft = generateCol('text-neon', '상담 수', 'videoConsultMetrics', true);
const vidMid = generateCol('text-primary', '조회 수', 'videoViewsMetrics', true, 'outline-info');
const vidRight = generateCol('text-warning', '구독자', 'videoSubsMetrics', true, 'outline-info');

const videoTemplateHtml = `        <!-- 3. Video Team Section -->
        <div class="q-mb-xl">
          <h2 class="section-title">Video Team (영상팀)</h2>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-xl-7 col-lg-7">
              <q-card class="glass-card q-pa-md h-100 column justify-between">
                <q-card-section class="q-pb-none">
                  <div class="row items-center justify-between q-mb-xs">
                    <div>
                      <div class="text-h6">월간 조회수 및 구독자 수 추이 (22.07 ~ 24.06)</div>
                    </div>
                  </div>
                  <!-- Domain Filter Pills -->
                  <div class="team-filter-container q-pa-sm q-mb-xs">
                    <div 
                      v-for="domain in videoDomainsList" 
                      :key="domain"
                      @click.stop="selectVideoDomain(domain)"
                      :class="['team-pill', getPillClass(domain), { 'active': selectedVideoDomain === domain }]"
                    >
                      {{ domain }}
                    </div>
                  </div>
                </q-card-section>
                <q-card-section class="col-grow q-py-none">
                  <apexchart 
                    type="line" 
                    height="280" 
                    :options="videoChartOptions" 
                    :series="videoChartSeries">
                  </apexchart>
                </q-card-section>

                <q-card-section class="q-pt-sm">
                  <q-separator color="grey-8" class="q-mb-sm opacity-50" />
                  <div class="text-subtitle1 text-weight-bold text-grey-4 q-mb-xs">월간 상담신청 수 추이</div>
                  <apexchart 
                    type="bar" 
                    height="180" 
                    :options="videoConsultChartOptions" 
                    :series="videoConsultSeries">
                  </apexchart>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-xl-5 col-lg-5 column">
              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-12">
                  <q-card class="glass-card q-pa-sm">
                    <q-card-section class="q-py-xs">
                      <div class="text-overline">{{ selectedVideoDomain === '전체' ? '총' : selectedVideoDomain }} 월간 조회수</div>
                      <div class="text-h5 text-primary font-weight-bold">{{ sumViews }} 회</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12">
                  <q-card class="glass-card q-pa-sm">
                    <q-card-section class="q-py-xs">
                      <div class="text-overline">{{ selectedVideoDomain === '전체' ? '총' : selectedVideoDomain }} 구독자수(팔로워 포함)</div>
                      <div class="text-h5 text-warning font-weight-bold">{{ sumSubscribers }} 명</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12">
                  <q-card class="glass-card q-pa-sm">
                    <q-card-section class="q-py-xs">
                      <div class="text-overline">{{ selectedVideoDomain === '전체' ? '총' : selectedVideoDomain }} 상담신청 수</div>
                      <div class="text-h5 text-neon q-mb-xs">{{ sumConsults }} 건</div>
                      <q-linear-progress value="0.75" color="cyan" size="2px" />
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <q-card class="glass-card q-pa-sm flex-grow-1">
                <q-card-section class="q-pb-none text-center">
                  <div class="text-subtitle1 text-weight-bold text-grey-4">성장 지표 분석</div>
                </q-card-section>
                
                <q-card-section class="q-pt-xs q-px-xs row flex-grow-1">
                  <!-- Col 1: Consults -->
                  <div class="col-4 column justify-between q-pr-xs" style="border-right: 1px solid rgba(255,255,255,0.08)">
                    ${vidLeft}
                  </div>
                  
                  <!-- Col 2: Views -->
                  <div class="col-4 column justify-between q-px-xs" style="border-right: 1px solid rgba(255,255,255,0.08)">
                    ${vidMid}
                  </div>
                  
                  <!-- Col 3: Subscribers -->
                  <div class="col-4 column justify-between q-pl-xs">
                    ${vidRight}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>`;


const ptr = content.indexOf('// Video Team State & Data Generator');
if (ptr !== -1) {
  const endPtr = content.indexOf('})', content.indexOf('const videoChartOptions')) + 2;
  content = content.substring(0, ptr) + videoLogic + content.substring(endPtr);
}

let videoHtmlStart = content.indexOf('<!-- 3. Video Team Section -->');
if (videoHtmlStart !== -1) {
    let videoHtmlEnd = content.indexOf('<!-- 4. Support Team -->', videoHtmlStart);
    let videoHtmlChunk = content.substring(videoHtmlStart, videoHtmlEnd);
    content = content.replace(videoHtmlChunk, videoTemplateHtml + '\n\n        ');
} else {
  console.log("Could not find HTML!"); 
}

fs.writeFileSync('d:/_PROJECT/AMPM_PerformanceIndex/frontend/src/App.vue', content);
console.log('Video Team V2 Patch Applied!');
