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
