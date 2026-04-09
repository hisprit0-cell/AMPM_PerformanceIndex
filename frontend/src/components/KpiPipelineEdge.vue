<template>
  <div class="edge-container">
    <div :class="['edge-line', { 'edge-highlight': highlight, 'edge-glow': glow }]">
      <div class="edge-particle"></div>
    </div>
    <div v-if="badge" :class="['edge-badge', { 'badge-glow': glow }]">{{ badge }}</div>
    <div class="edge-arrow"></div>
  </div>
</template>

<script setup>
defineProps({
  badge: String,
  highlight: Boolean,
  glow: Boolean
})
</script>
