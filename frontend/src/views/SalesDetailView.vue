<template>
  <q-page class="q-pa-xl sales-detail-page">
    <!-- 🔙 Header Seciton with Back Button -->
    <div class="row items-center q-mb-xl">
      <q-btn flat round color="neon" icon="arrow_back" to="/" class="q-mr-md" />
      <div>
        <h1 class="text-h3 text-white text-weight-bolder q-ma-none" style="letter-spacing: -1.5px;">
          <span class="text-neon">Sales</span> Detail Analysis
        </h1>
        <p class="text-grey-5 q-ma-none text-subtitle1">영업본부 통합 성과 및 실적 상세 분석 데이터</p>
      </div>
    </div>

    <!-- 📊 Summary KPI Cards -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div v-for="card in kpiCards" :key="card.title" class="col-12 col-sm-6 col-md-3">
        <q-card class="glass-card q-pa-md">
          <q-card-section>
            <div class="text-overline text-grey-5">{{ card.title }}</div>
            <div :class="['text-h4 text-weight-bolder', 'text-' + card.color]">
              {{ card.value }} <span class="text-subtitle1 text-grey-4">{{ card.unit }}</span>
            </div>
            <div class="row items-center q-mt-sm">
              <q-icon :name="card.trend > 0 ? 'trending_up' : 'trending_down'" :color="card.trend > 0 ? 'positive' : 'negative'" />
              <span :class="['text-caption q-ml-xs', card.trend > 0 ? 'text-positive' : 'text-negative']">
                {{ Math.abs(card.trend) }}% {{ card.trend > 0 ? 'increase' : 'decrease' }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 📉 Main Detailed Chart -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12">
        <q-card class="glass-card q-pa-lg">
          <q-card-section class="row justify-between items-center">
            <div class="text-h5 text-white text-weight-bold">월간 매출 및 인원 상세 추이</div>
            <div class="text-grey-5 text-caption">Data Period: 2022.07 - 2024.06</div>
          </q-card-section>
          <q-card-section>
            <apexchart type="line" height="400" :options="chartOptions" :series="chartSeries" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 📋 Detailed Data Table -->
    <q-card class="glass-card">
      <q-card-section>
        <div class="text-h5 text-white text-weight-bold q-mb-md">성과 분석 데이터 테이블</div>
        <q-table
          :rows="tableRows"
          :columns="tableColumns"
          row-key="month"
          flat
          dark
          class="bg-transparent sales-table"
          :pagination="{ rowsPerPage: 12 }"
        >
          <template v-slot:body-cell-sales="props">
            <q-td :props="props" class="text-neon text-weight-bold">
              ₩ {{ props.value.toLocaleString() }}
            </q-td>
          </template>
          <template v-slot:body-cell-growth="props">
            <q-td :props="props">
              <q-chip
                dense
                :color="props.value >= 0 ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
              >
                {{ props.value > 0 ? '+' : '' }}{{ props.value }}%
              </q-chip>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// --- 📊 Dummy Data Generation (Matching Dashboard Logic) ---
const tableRows = ref([])
const chartSeries = ref([])
const kpiCards = ref([
  { title: '누적 매출액', value: '₩ 14.2억', unit: '', color: 'neon', trend: 12.5 },
  { title: '당월 매출액', value: '₩ 93,247', unit: '만원', color: 'info', trend: 5.4 },
  { title: '현재 인원수', value: '83', unit: '명', color: 'primary', trend: -2.1 },
  { title: '평균 1인당 매출', value: '₩ 1,123', unit: '만원', color: 'warning', trend: 8.7 }
])

const tableColumns = [
  { name: 'month', label: '기간 (Month)', field: 'month', align: 'left', sortable: true },
  { name: 'sales', label: '매출액 (만원)', field: 'sales', align: 'right', sortable: true },
  { name: 'headcount', label: '인원수', field: 'headcount', align: 'center', sortable: true },
  { name: 'growth', label: 'MoM 성장률', field: 'growth', align: 'center' },
  { name: 'efficiency', label: '인당 생산성', field: 'efficiency', align: 'right', sortable: true }
]

const chartOptions = {
  chart: { foreColor: '#94a3b8', toolbar: { show: true }, background: 'transparent' },
  stroke: { curve: 'smooth', width: [4, 2] },
  colors: ['#00f2ff', '#9C27B0'],
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] }
  },
  xaxis: {
    categories: Array(24).fill(0).map((_, i) => (i < 6 ? '22.' : i < 18 ? '23.' : '24.') + String((i % 12 + 7) % 12 || 12).padStart(2, '0'))
  },
  yaxis: [
    { title: { text: '매출액 (만원)' } },
    { opposite: true, title: { text: '인원수' } }
  ],
  grid: { borderColor: 'rgba(255,255,255,0.05)' },
  tooltip: { theme: 'dark' }
}

onMounted(() => {
  // Generate mock data consistent with Dashboard
  let hc = 70;
  let prevSales = 0;
  const salesArr = [];
  const hcArr = [];
  
  for (let i = 0; i < 24; i++) {
    const sales = 80000 + Math.floor(Math.random() * 20000);
    hc = Math.max(50, Math.min(100, hc + (Math.random() > 0.5 ? 1 : -1)));
    const growth = prevSales === 0 ? 0 : (((sales - prevSales) / prevSales) * 100).toFixed(1);
    
    tableRows.value.unshift({
      month: chartOptions.xaxis.categories[i],
      sales: sales,
      headcount: hc,
      growth: growth,
      efficiency: (sales / hc).toFixed(1)
    });
    
    salesArr.push(sales);
    hcArr.push(hc);
    prevSales = sales;
  }
  
  chartSeries.value = [
    { name: '매출액', type: 'area', data: salesArr },
    { name: '인원수', type: 'line', data: hcArr }
  ];
})
</script>

<style scoped>
.sales-detail-page {
  background: radial-gradient(circle at top right, rgba(0, 242, 255, 0.05), transparent 400px),
              radial-gradient(circle at bottom left, rgba(156, 39, 176, 0.05), transparent 400px);
}

.glass-card {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.text-neon {
  color: #00f2ff;
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
}

.sales-table :deep(.q-table__card) {
  background: transparent;
}

.sales-table :deep(thead tr) {
  background: rgba(255, 255, 255, 0.03);
}

.sales-table :deep(th) {
  font-weight: 700;
  color: #94a3b8;
  font-size: 0.85rem;
}

.sales-table :deep(td) {
  font-size: 0.95rem;
}
</style>
