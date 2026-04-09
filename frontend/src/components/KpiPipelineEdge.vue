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

<style scoped>
.edge-container {
  flex: 1 1 50px;
  min-width: 60px;
  height: 50px;
  position: relative;
  display: flex;
  align-items: center;
}
.edge-line {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}
.edge-highlight {
  background: rgba(0, 242, 255, 0.2);
}
.edge-glow {
  background: rgba(168, 85, 247, 0.4);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
}
.edge-particle {
  position: absolute;
  top: 0; left: 0;
  height: 100%; width: 30px;
  background: rgba(255,255,255,0.8);
  box-shadow: 0 0 10px #fff;
  animation: moveParticle 2.5s infinite linear;
}
@keyframes moveParticle {
  0% { transform: translateX(-30px); }
  100% { transform: translateX(300px); }
}

.edge-arrow {
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 0; 
  height: 0; 
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid rgba(255,255,255,0.5);
  z-index: 10;
}

.edge-badge {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30,41,59, 1);
  border: 1px solid rgba(0,242,255,0.5);
  color: #00f2ff;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 4px 6px rgba(0,0,0,0.5);
  z-index: 20;
}
.badge-glow {
  border-color: #a855f7;
  color: #c084f5;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
}
</style>
