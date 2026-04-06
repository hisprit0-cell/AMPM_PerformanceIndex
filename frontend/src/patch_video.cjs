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
  
  videoDomainsList.value.forEach(domain => {
    if (domain === '전체') return;
    mapData[domain] = { consults: [], subs: [] }
    let baseConsults = Math.floor(Math.random() * 500) + 100
    for(let m=0; m<24; m++){
      let consults = baseConsults + Math.floor(Math.random() * 50)
      let subs = Math.floor(consults * (Math.random() * 5 + 10)) // Subs are 10-15x consults
      mapData[domain].consults.push(consults)
      mapData[domain].subs.push(subs)
      aggConsults[m] += consults
      aggSubs[m] += subs
    }
  })
  
  mapData['전체'] = { consults: aggConsults, subs: aggSubs }
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
    { name: '상담신청 수', type: 'bar', data: data.consults },
    { name: '신규구독자 수', type: 'line', data: data.subs }
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

const videoChartOptions = ref({
  ...commonChartOptions,
  stroke: { width: [0, 4] },
  colors: ['#E91E63', '#9C27B0'],
  xaxis: { 
    categories: ['22.07', '22.08', '22.09', '22.10', '22.11', '22.12', '23.01', '23.02', '23.03', '23.04', '23.05', '23.06', '23.07', '23.08', '23.09', '23.10', '23.11', '23.12', '24.01', '24.02', '24.03', '24.04', '24.05', '24.06'] 
  },
  yaxis: [
    { title: { text: '상담신청 수' }, min: 0 },
    { opposite: true, title: { text: '신규구독자 수' }, min: 0 }
  ]
})
`;

// Helper for generating HTML block
function generateCol(titleClass, titleText, metricsObj, withHighlight = false, highlightClass = '') {
  const labels = ['전월 대비 (MoM)', '분기 대비 (QoQ)', '반기 대비 (HoH)', '연간 대비 (YoY)'];
  const keys = ['mom', 'qoq', 'hoh', 'yoy'];
  
  let html = `<div class="${titleClass} text-center q-mb-xs font-weight-bold">${titleText}</div>
                    <q-separator color="grey-8" class="q-mb-xs opacity-50" />\n`;
                    
  for(let i = 0; i < 4; i++) {
    const k = keys[i];
    const lbl = labels[i];
    let colClass = 'column items-center';
    let labelSpan = `<span class="text-subtitle2 text-grey-5">${lbl}</span>`;
    if (withHighlight && i === 0) {
      colClass += ' highlight-mom ' + highlightClass;
      labelSpan = `<span class="text-subtitle2 text-white font-weight-bold text-center">✨ ${lbl} ✨</span>`;
    } else if (i === 1 && withHighlight) {
      colClass += ' q-mt-sm'; 
    }
    
    html += `                    
                    <div class="${colClass}">
                      ${labelSpan}
                      <div :class="['${i===0&&withHighlight?'text-h5':'text-h6'} font-weight-bold', parseFloat(${metricsObj}.${k}) >= 0 ? 'text-positive' : 'text-negative']">
                        {{ parseFloat(${metricsObj}.${k}) > 0 ? '+' : '' }}{{ ${metricsObj}.${k} }}% 
                        <q-icon name="arrow_outward" size="sm" :style="parseFloat(${metricsObj}.${k}) < 0 ? 'transform: rotate(90deg)' : ''" />
                      </div>
                    </div>`;
  }
  return html;
}

const vidLeft = generateCol('text-h6 text-neon', '상담신청 수', 'videoConsultMetrics', true);
const vidRight = generateCol('text-h6 text-info', '신규구독자 수', 'videoSubsMetrics', true, 'outline-info');

const videoTemplateHtml = `        <!-- 3. Video Team Section -->
        <div class="q-mb-xl">
          <h2 class="section-title">Video Team (영상팀)</h2>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-8">
              <q-card class="glass-card q-pa-md h-100 column justify-between">
                <q-card-section>
                  <div class="row items-center justify-between q-mb-xs">
                    <div>
                      <div class="text-h6">월간 상담신청 수 및 구독자(팔로워) 수 추이 (22.07 ~ 24.06)</div>
                    </div>
                  </div>
                  <!-- Domain Filter Pills -->
                  <div class="team-filter-container q-pa-sm q-mb-md">
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
                <q-card-section class="col-grow">
                  <apexchart 
                    type="line" 
                    height="100%" 
                    :options="videoChartOptions" 
                    :series="videoChartSeries">
                  </apexchart>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-md-4 column">
              <q-card class="glass-card q-pa-sm q-mb-md">
                <q-card-section class="q-py-sm">
                  <div class="text-overline">{{ selectedVideoDomain === '전체' ? '총' : selectedVideoDomain }} 구독자수</div>
                  <div class="text-h4 text-neon font-weight-bold">{{ sumSubscribers }} 명</div>
                </q-card-section>
              </q-card>
              
              <q-card class="glass-card q-pa-sm q-mb-md">
                <q-card-section class="q-py-sm">
                  <div class="text-overline">{{ selectedVideoDomain === '전체' ? '총' : selectedVideoDomain }} 상담신청 수</div>
                  <div class="text-h4 text-info q-mb-xs">{{ sumConsults }} 건</div>
                  <q-linear-progress value="0.75" color="info" size="5px" />
                </q-card-section>
              </q-card>

              <q-card class="glass-card q-pa-sm flex-grow-1">
                <q-card-section class="q-pb-none text-center">
                  <div class="text-subtitle1 text-weight-bold text-grey-4">성장 지표 분석 (상담/구독)</div>
                </q-card-section>
                
                <q-card-section class="q-pt-xs q-px-sm row flex-grow-1">
                  <!-- Left: Consults -->
                  <div class="col-6 column justify-between q-pr-sm" style="border-right: 1px solid rgba(255,255,255,0.08)">
                    ${vidLeft}
                  </div>
                  
                  <!-- Right: Subscribers -->
                  <div class="col-6 column justify-between q-pl-sm">
                    ${vidRight}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>`;


const ptr = content.indexOf('// Video Team Chart');
if (ptr !== -1) {
  const endPtr = content.indexOf('])', ptr) + 2;
  content = content.substring(0, ptr) + videoLogic + content.substring(endPtr);
}

let videoHtmlStart = content.indexOf('<!-- 3. Video Team Section -->');
if (videoHtmlStart !== -1) {
    let videoHtmlEnd = content.indexOf('</q-page>', videoHtmlStart);
    let videoHtmlChunk = content.substring(videoHtmlStart, videoHtmlEnd);
    content = content.replace(videoHtmlChunk, '');
}

let supportPos = content.indexOf('<!-- 3. Support Team -->');
if (supportPos !== -1) {
  content = content.substring(0, supportPos) + videoTemplateHtml + '\n\n        <!-- 4. Support Team -->' + content.substring(supportPos + '<!-- 3. Support Team -->'.length);
}

fs.writeFileSync('d:/_PROJECT/AMPM_PerformanceIndex/frontend/src/App.vue', content);
console.log('Video Team Patch Applied!');
