const fs = require('fs');
let content = fs.readFileSync('d:/_PROJECT/AMPM_PerformanceIndex/frontend/src/App.vue', 'utf8');

// 1. Remove anti gravity classes and bindings
content = content.replace(/ anti-gravity-item/g, '');
content = content.replace(/ @click="makeItFloat\(\$event\)"/g, '');
content = content.replace(/<div class="text-subtitle2 text-grey-4">Click to anti-gravity!<\/div>/g, '');

// 2. Remove Matter.js code block completely
const startIdx = content.indexOf('// --- Matter.js Anti-Gravity Integration ---');
if (startIdx !== -1) {
  const endIdx = content.indexOf('</script>', startIdx);
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

// 3. Add computed metrics to script section
const metricsLogic = `
function calcGrowth(array, compareType) {
  if (!array || array.length < 24) return '0.0';
  let current = 0; let previous = 0;
  if (compareType === 'mom') {
    current = array[23]; previous = array[22];
  } else if (compareType === 'qoq') {
    current = array[21] + array[22] + array[23]; previous = array[18] + array[19] + array[20];
  } else if (compareType === 'hoh') {
    current = array.slice(18, 24).reduce((a,b)=>a+b, 0); previous = array.slice(12, 18).reduce((a,b)=>a+b, 0);
  } else if (compareType === 'yoy') {
    current = array[23]; previous = array[11];
  }
  if (previous === 0) return '0.0';
  const change = ((current - previous) / previous) * 100;
  return change.toFixed(1);
}

const salesMetrics = computed(() => {
  const data = salesDataMap.value[selectedSalesTeam.value];
  if(!data) return { mom: '0.0', qoq: '0.0', hoh: '0.0', yoy: '0.0' }
  return { mom: calcGrowth(data.sales, 'mom'), qoq: calcGrowth(data.sales, 'qoq'), hoh: calcGrowth(data.sales, 'hoh'), yoy: calcGrowth(data.sales, 'yoy') }
})
const hcMetrics = computed(() => {
  const data = salesDataMap.value[selectedSalesTeam.value];
  if(!data) return { mom: '0.0', qoq: '0.0', hoh: '0.0', yoy: '0.0' }
  return { mom: calcGrowth(data.headcount, 'mom'), qoq: calcGrowth(data.headcount, 'qoq'), hoh: calcGrowth(data.headcount, 'hoh'), yoy: calcGrowth(data.headcount, 'yoy') }
})
const pvMetrics = computed(() => {
  const data = devDataMap.value[selectedDevDomain.value];
  if(!data) return { mom: '0.0', qoq: '0.0', hoh: '0.0', yoy: '0.0' }
  return { mom: calcGrowth(data.pvs, 'mom'), qoq: calcGrowth(data.pvs, 'qoq'), hoh: calcGrowth(data.pvs, 'hoh'), yoy: calcGrowth(data.pvs, 'yoy') }
})
const uvMetrics = computed(() => {
  const data = devDataMap.value[selectedDevDomain.value];
  if(!data) return { mom: '0.0', qoq: '0.0', hoh: '0.0', yoy: '0.0' }
  return { mom: calcGrowth(data.visitors, 'mom'), qoq: calcGrowth(data.visitors, 'qoq'), hoh: calcGrowth(data.visitors, 'hoh'), yoy: calcGrowth(data.visitors, 'yoy') }
})
`;
content = content.replace('function generateSalesData', metricsLogic + '\nfunction generateSalesData');

// 4. Update the template to use the computed metrics dynamically
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

const salesLeft = generateCol('text-h6 text-neon', '매출액', 'salesMetrics');
const salesRight = generateCol('text-h6 text-info', '인원수', 'hcMetrics');
const devLeft = generateCol('text-h6 text-neon', '페이지뷰', 'pvMetrics', true);
const devRight = generateCol('text-h6 text-info', '방문자수', 'uvMetrics', true, 'outline-info');

// Basic manual string slice to replace the metrics sections reliably
let newContent = content.substring(0, content.indexOf('<!-- Left: Sales -->'));
newContent += `<!-- Left: Sales -->
                  <div class="col-6 column justify-between q-pr-sm" style="border-right: 1px solid rgba(255,255,255,0.08)">
                    ${salesLeft}
                  </div>
                  
                  <!-- Right: Headcount -->
                  <div class="col-6 column justify-between q-pl-sm">
                    ${salesRight}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- 2. Dev Team Section -->`;

let ptr = content.indexOf('<!-- 2. Dev Team Section -->');
newContent += content.substring(ptr + '<!-- 2. Dev Team Section -->'.length, content.indexOf('<!-- Left: PV -->'));
newContent += `<!-- Left: PV -->
                  <div class="col-6 column justify-between q-pr-sm" style="border-right: 1px solid rgba(255,255,255,0.08)">
                    ${devLeft}
                  </div>
                  
                  <!-- Right: Visitors -->
                  <div class="col-6 column justify-between q-pl-sm">
                    ${devRight}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- 3. Support Team -->`;
ptr = content.indexOf('<!-- 3. Support Team -->');
newContent += content.substring(ptr + '<!-- 3. Support Team -->'.length);

fs.writeFileSync('d:/_PROJECT/AMPM_PerformanceIndex/frontend/src/App.vue', newContent);
