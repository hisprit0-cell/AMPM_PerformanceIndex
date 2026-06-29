<template>
  <!-- 📦 재사용 Empty-State: 상세 내역 준비 중 안내 (가시성/안내 강화) -->
  <q-card class="glass-card coming-soon q-pa-xl flex flex-center">
    <div class="text-center" style="max-width: 520px;">
      <div class="cs-icon-ring q-mb-md">
        <q-icon :name="icon" size="2.4rem" />
      </div>

      <q-badge class="cs-badge q-mb-sm" :label="badge" />

      <div class="text-h6 text-weight-bolder q-mb-xs" style="color: var(--text-primary);">{{ title }}</div>
      <div class="text-body2 q-mb-lg" style="color: var(--text-muted); line-height: 1.6;">{{ description }}</div>

      <!-- 예정 기능 칩 -->
      <div v-if="features.length" class="cs-chips q-mb-lg">
        <span v-for="f in features" :key="f" class="cs-chip">
          <q-icon name="check_circle" size="14px" class="q-mr-xs" />{{ f }}
        </span>
      </div>

      <q-btn
        outline rounded no-caps
        color="neon"
        icon="cloud_upload"
        label="기초데이터 연동하기"
        class="text-weight-bold"
        @click="$emit('connect')"
      />
    </div>
  </q-card>
</template>

<script setup>
defineEmits(['connect'])
defineProps({
  icon:        { type: String, default: 'analytics' },
  badge:       { type: String, default: '상세 내역 준비 중' },
  title:       { type: String, default: '상세 데이터 준비 중' },
  description: { type: String, default: '세부 지표 데이터가 이곳에 표시될 예정입니다.' },
  features:    { type: Array,  default: () => [] }
})
</script>

<style scoped>
.coming-soon { min-height: 340px; }

.cs-icon-ring {
  width: 84px; height: 84px;
  margin: 0 auto;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  color: var(--neon);
  background: radial-gradient(circle, rgba(0,242,255,0.18), rgba(0,242,255,0.02) 70%);
  border: 1px solid rgba(0, 242, 255, 0.35);
  box-shadow: 0 0 24px rgba(0, 242, 255, 0.2);
  animation: ringPulse 3s ease-in-out infinite alternate;
}
@keyframes ringPulse {
  from { box-shadow: 0 0 14px rgba(0,242,255,0.15); }
  to   { box-shadow: 0 0 30px rgba(0,242,255,0.35); }
}

.cs-badge {
  background: rgba(0, 242, 255, 0.12);
  color: var(--neon);
  border: 1px solid rgba(0, 242, 255, 0.3);
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
}

.cs-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.cs-chip {
  display: inline-flex; align-items: center;
  font-size: 0.78rem; font-weight: 600;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 6px 12px;
  border-radius: 999px;
}
</style>
