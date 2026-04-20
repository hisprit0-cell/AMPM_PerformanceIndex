<template>
  <div class="column items-center full-width">
    <!-- Title Section -->
    <div v-if="title" :class="'text-' + color + ' text-center q-mb-xs font-weight-bold'" style="font-size: 1.1rem;">
      {{ title }}
    </div>
    <q-separator color="grey-8" class="q-mb-md opacity-50 full-width" />

    <!-- MoM Highlight Section -->
    <div v-if="showMom" class="column items-center highlight-mom full-width q-mb-md q-py-sm">
      <span class="text-caption text-grey-3 text-weight-medium">✨ MoM GROWTH ✨</span>
      <div :class="['text-h3 font-weight-bold', parseFloat(metrics?.mom || '0.0') >= 0 ? 'text-positive' : 'text-negative']">
        {{ parseFloat(metrics?.mom || '0.0') > 0 ? '+' : '' }}{{ metrics?.mom || '0.0' }}%
      </div>
    </div>
    <div v-else class="column items-center q-mb-md">
      <span class="text-caption text-grey-4">MoM</span>
      <div :class="['text-h4 font-weight-bold', parseFloat(metrics?.mom || '0.0') >= 0 ? 'text-positive' : 'text-negative']">
        {{ metrics?.mom || '0.0' }}%
      </div>
    </div>

    <!-- Comparison Metrics Table -->
    <!-- Comparison Metrics Table -->
    <div class="column items-center full-width q-gutter-y-sm" style="padding-top: 8px;">
      <div class="row items-center justify-center" style="gap: 16px; width: 100%;">
        <span class="text-subtitle1 text-grey-5 text-weight-bold" style="width: 40px; text-align: left;">QoQ</span>
        <span :class="['text-h6 text-weight-bold', parseFloat(metrics?.qoq) >= 0 ? 'text-positive' : 'text-negative']" style="width: 70px; text-align: right;">{{ parseFloat(metrics?.qoq) > 0 ? '+' : '' }}{{ metrics?.qoq }}%</span>
      </div>
      <div class="row items-center justify-center" style="gap: 16px; width: 100%;">
        <span class="text-subtitle1 text-grey-5 text-weight-bold" style="width: 40px; text-align: left;">HoH</span>
        <span :class="['text-h6 text-weight-bold', parseFloat(metrics?.hoh) >= 0 ? 'text-positive' : 'text-negative']" style="width: 70px; text-align: right;">{{ parseFloat(metrics?.hoh) > 0 ? '+' : '' }}{{ metrics?.hoh }}%</span>
      </div>
      <div class="row items-center justify-center" style="gap: 16px; width: 100%;">
        <span class="text-subtitle1 text-grey-5 text-weight-bold" style="width: 40px; text-align: left;">YoY</span>
        <span :class="['text-h6 text-weight-bold', parseFloat(metrics?.yoy) >= 0 ? 'text-positive' : 'text-negative']" style="width: 70px; text-align: right;">{{ parseFloat(metrics?.yoy) > 0 ? '+' : '' }}{{ metrics?.yoy }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 📊 성장률 지표 컴포넌트 (Growth Metrics Component)
 * @description MoM, QoQ, HoH, YoY 성장 수치를 한눈에 보여주는 카드 내부 지표
 */
defineProps({
  metrics: { type: Object, default: () => ({ mom: '0.0', qoq: '0.0', hoh: '0.0', yoy: '0.0' }) },
  color: { type: String, default: 'primary' },
  showMom: { type: Boolean, default: false },
  title: { type: String, default: '' }
});
</script>

<style scoped>
.font-weight-bold { font-weight: 700; }
.full-width { width: 100%; }
.highlight-mom { 
  background: rgba(0, 242, 255, 0.05); 
  border: 1px solid rgba(0, 242, 255, 0.2); 
  border-radius: 8px; 
  padding: 4px; 
  animation: pulse-glow-neon 2s infinite ease-in-out;
}

@keyframes pulse-glow-neon {
  0% { box-shadow: 0 0 5px rgba(0, 242, 255, 0.1); }
  50% { box-shadow: 0 0 15px rgba(0, 242, 255, 0.3); border-color: rgba(0, 242, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(0, 242, 255, 0.1); }
}
</style>
