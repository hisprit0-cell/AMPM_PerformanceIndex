<template>
  <q-card class="glass-card q-pa-lg col-grow column">
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5 text-white text-weight-bold">
        <span class="text-neon">{{ activeFilter }}</span> 상세 추이 분석
      </div>
      <div class="text-grey-5 text-caption">동적 반영 차트 (Dynamic Flow)</div>
    </div>
    
    <div style="flex:1; min-height: 480px;">
      <!-- key 속성이나 동적 반응성을 통해 애니메이션이 발동되도록 구성 -->
      <apexchart 
        v-if="mounted"
        type="line" 
        height="100%" 
        :options="chartOptions" 
        :series="chartSeries" 
      />
    </div>
  </q-card>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const props = defineProps({
  timeline: { type: Object, required: true },
  activeFilter: { type: String, required: true }
})

const mounted = ref(false)
onMounted(() => { mounted.value = true })

// Chart Series
const chartSeries = computed(() => {
  return [
    { name: '매출액 (만원)', type: 'column', data: props.timeline.revenueArr },
    { name: '인원수', type: 'area', data: props.timeline.headcountArr },
    { name: '인원당 매출', type: 'line', data: props.timeline.rppArr }
  ]
})

// Chart Options
const chartOptions = computed(() => {
  return {
    chart: { 
      toolbar: { show: false }, 
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: { enabled: true, speed: 350 }
      }
    },
    theme: { mode: 'dark' },
    colors: ['#00f2ff', '#9C27B0', '#FFC107'], // Cyan, Purple, Amber
    stroke: { 
      width: [0, 4, 3], // Col = 0, Area = 4, Line = 3
      curve: 'smooth' 
    }, 
    fill: {
      type: ['solid', 'gradient', 'solid'],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    dataLabels: { enabled: false },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    plotOptions: { bar: { columnWidth: '40%', borderRadius: 4 } },
    xaxis: { 
      categories: props.timeline.months, 
      labels: { style: { fontSize: '11px', colors: '#94a3b8' } }, 
      axisBorder: { show: false }, 
      axisTicks: { show: false } 
    },
    yaxis: [
      {
        seriesName: '매출액 (만원)',
        opposite: false,
        labels: { formatter: v => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 }) }
      },
      {
        seriesName: '인원수',
        opposite: true,
        show: false
      },
      {
        seriesName: '인원당 매출',
        opposite: true,
        labels: { formatter: v => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 }) }
      }
    ],
    legend: { position: 'bottom', labels: { colors: '#94a3b8' }, fontSize: '13px' },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'dark',
      style: {
        fontSize: '30px' // 증가요청: 마우스 오버 시 2.5배 
      }
    }
  }
})
</script>

<style scoped>
.glass-card {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
.text-neon {
  color: #00f2ff;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
}
</style>
