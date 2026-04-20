<template>
  <q-card class="member-glass-card q-pa-sm">
    <div class="row items-center justify-between q-mb-xs px-sm">
      <div class="text-subtitle2 text-weight-bold text-white flex items-center">
        <q-icon 
          :name="isTeam ? 'groups' : 'person'" 
          size="18px" 
          :color="isTeam ? 'neon' : 'primary'" 
          class="q-mr-xs" 
        />
        {{ member.name }}
        <span v-if="isTeam" class="text-caption text-grey-4 q-ml-xs">({{ latestHc }}명)</span>
      </div>
      <div :class="['text-caption text-weight-bolder', isTeam ? 'text-neon' : 'text-primary']">
        ₩ {{ sumRev.toLocaleString() }} 만원
      </div>
    </div>
    
    <div class="chart-container">
      <apexchart
        type="area"
        height="120"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  member: {
    type: Object,
    required: true
  },
  timeline: {
    type: Array,
    required: true
  }
})

const sumRev = computed(() => {
  return props.member.s.reduce((a, b) => a + b, 0)
})

const isTeam = computed(() => {
  // 팀급 데이터는 h(headcount) 배열을 가지고 있음
  return props.member.h && props.member.h.some(v => v > 1)
})

const latestHc = computed(() => {
  if (!isTeam.value) return 1
  return props.member.h[props.member.h.length - 1]
})

const series = computed(() => [
  {
    name: '매출',
    data: props.member.s
  }
])

const chartOptions = computed(() => ({
  chart: {
    id: `member-chart-${props.member.name}`,
    sparkline: { enabled: true },
    background: 'transparent',
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  colors: [isTeam.value ? '#00f2ff' : '#00f2ff'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100]
    }
  },
  stroke: { curve: 'smooth', width: 2 },
  tooltip: {
    theme: 'dark',
    fixed: { enabled: false },
    x: { show: true, formatter: (val, opts) => props.timeline[opts.dataPointIndex] },
    y: { title: { formatter: () => '' }, formatter: v => `₩ ${v.toLocaleString()} 만원` },
    marker: { show: false }
  }
}))
</script>

<style scoped>
.member-glass-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.member-glass-card:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(0, 242, 255, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
.chart-container {
  overflow: hidden;
  border-radius: 0 0 12px 12px;
}
.px-sm {
  padding-left: 8px;
  padding-right: 8px;
}
</style>
