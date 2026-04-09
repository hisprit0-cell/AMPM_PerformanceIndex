<template>
  <div class="node-box" :class="customClass">
    <div class="node-title text-grey-4 text-weight-medium text-caption">{{ title }}</div>
    <div :class="['node-value text-weight-bold', `text-${color}`]" style="font-size: 1.65rem;">{{ value }}</div>
    <div v-if="sub" class="text-grey-6" style="font-size:0.75rem; margin-top:-4px;">{{ sub }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  color: { type: String, default: 'white' },
  sub: String,
  customClass: String
})
</script>

<style scoped>
.node-box {
  flex: 0 0 auto;
  min-width: 150px;
  background: rgba(20, 25, 40, 0.6);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: transform 0.2s, border-color 0.2s;
}
.node-box:hover {
  transform: translateY(-5px);
  border-color: rgba(255,255,255,0.4);
}
</style>
