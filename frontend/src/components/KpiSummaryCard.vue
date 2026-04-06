<template>
  <q-card class="glass-card q-pa-sm">
    <q-card-section class="q-py-xs">
      <!-- 📋 KPI Title -->
      <div class="text-overline text-grey-5">{{ title }}</div>
      
      <!-- 💰 Value & Unit -->
      <div :class="['text-h5 text-weight-bold q-mb-xs', 'text-' + color]">
        {{ value }} {{ unit }}
      </div>
      
      <!-- 📊 Progress Indicator -->
      <q-linear-progress :value="progress" :color="color" size="2px" class="q-mt-xs" />
    </q-card-section>
  </q-card>
</template>

<script setup>
/**
 * 🎫 KPI 요약 카드 (KPI Summary Card)
 * @description 단일 메트릭(매출, 인원 등)을 강조해서 보여주는 요약 카드 컴포넌트
 */
defineProps({
  title: { type: String, default: '' },
  value: { type: [String, Number], default: '0' },
  unit: { type: String, default: '' },
  color: { type: String, default: 'primary' },
  progress: { type: Number, default: 0.8 }
});
</script>

<style scoped>
.glass-card {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
.text-weight-bold { font-weight: 700 !important; }
</style>
