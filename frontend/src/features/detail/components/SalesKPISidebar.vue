<template>
  <div class="sidebar-container" style="display:flex; flex-direction:column; gap:16px;">
    <!-- 카드 1: 통합 매출액 -->
    <q-card class="glass-card q-pa-lg">
      <div class="text-overline text-grey-5 q-mb-xs">{{ label }} 통합 매출액</div>
      <div class="text-neon text-weight-bolder" style="font-size: 2.8rem; line-height: 1.1;">₩ {{ revenue }} 만원</div>
    </q-card>

    <!-- 카드 2: 인원 & 생산성 -->
    <q-card class="glass-card q-pa-lg">
      <div class="row items-end justify-between no-wrap">
        <div style="flex: 1;">
          <div class="text-overline text-grey-5 q-mb-xs">{{ label }} 인원</div>
          <div class="text-white text-weight-bolder" style="font-size: 3.2rem; line-height: 1;">{{ headcount }} <span class="text-h4">명</span></div>
        </div>
        <div class="text-right" style="flex: 1.2;">
          <div class="text-overline text-grey-5 q-mb-xs">인원당 매출액</div>
          <div class="text-warning text-weight-bolder" style="font-size: 1.8rem;">₩ {{ rpp.toLocaleString() }} 만원</div>
        </div>
      </div>
    </q-card>

    <!-- 카드 3: 성장 지표 분석 -->
    <q-card class="glass-card q-pa-lg">
      <div class="text-subtitle1 text-center q-mb-md text-grey-2 text-weight-bolder" style="letter-spacing: 2px;">성장 지표 분석</div>
      
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-6">
          <div class="metric-header metric-neon">매출액</div>
        </div>
        <div class="col-6">
          <div class="metric-header metric-info">인원수</div>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-6" style="border-right: 1px solid rgba(255,255,255,0.1);">
          <GrowthItems :metrics="mxS" color="neon" show-mom />
        </div>
        <div class="col-6">
          <GrowthItems :metrics="mxHC" color="info" show-mom />
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GrowthItems from '@/components/GrowthItems.vue'
import { useSalesHarness } from '@/features/detail/composables/useSalesHarness.js'

const { getGR } = useSalesHarness()

const props = defineProps({
  label: { type: String, required: true },
  revenueArr: { type: Array, required: true },
  hcArr: { type: Array, required: true },
  revenue: { type: String, required: true },
  headcount: { type: [Number, String], required: true },
  rpp: { type: Number, required: true }
})

const mxS  = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(props.revenueArr, t)}), {}))
const mxHC = computed(() => ['mom','qoq','hoh','yoy'].reduce((a,t) => ({...a, [t]: getGR(props.hcArr, t)}), {}))
</script>

<style scoped>
.glass-card { background: rgba(30, 41, 59, 0.55); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; }
.text-neon { color: #00f2ff; text-shadow: 0 0 10px rgba(0,242,255,0.5); }
.metric-header { text-align: center; font-weight: 800; font-size: 0.9rem; padding: 7px 0; border-radius: 8px; letter-spacing: 0.5px; }
.metric-neon { color: #00f2ff; background: rgba(0, 242, 255, 0.08); border: 1px solid rgba(0, 242, 255, 0.25); text-shadow: 0 0 8px rgba(0,242,255,0.4); }
.metric-info { color: #60a5fa; background: rgba(96, 165, 250, 0.08); border: 1px solid rgba(96, 165, 250, 0.25); text-shadow: 0 0 8px rgba(96,165,250,0.3); }
</style>
