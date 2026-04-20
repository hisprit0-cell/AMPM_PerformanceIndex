<template>
  <div class="filter-bar q-pa-lg glass-card q-mb-xl">
    <div v-for="(members, group) in groupedFilters" :key="group" class="filter-group q-mb-md">
      <div class="row items-center q-mb-sm">
        <div class="group-label text-weight-bolder text-uppercase">{{ group === 'Overall' ? 'Corporate' : group }}</div>
        <div class="group-line"></div>
      </div>
      <div class="team-filter-container team-filter-wrap">
        <div
          v-for="pill in members" :key="'df-'+pill.key"
          @click="updateFilter(pill.key)"
          :class="['team-pill', pill.pillClass, { 'active': activeFilter === pill.key }]"
        >
          {{ pill.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  availableFilters: { type: Array, required: true },
  activeFilter: { type: String, required: true }
})
const emit = defineEmits(['update:activeFilter'])

const groupedFilters = computed(() => {
  const groups = { 'Overall': [] }
  props.availableFilters.forEach(f => {
    if (f.key === '전체') {
      groups['Overall'].push(f)
    } else if (!f.key.includes('/')) {
      if (!groups[f.key]) groups[f.key] = []
      groups[f.key].push(f)
    } else {
      const [div] = f.key.split('/')
      if (!groups[div]) groups[div] = []
      groups[div].push(f)
    }
  })
  return groups
})

const updateFilter = (key) => {
  emit('update:activeFilter', key)
}
</script>

<style scoped>
.glass-card { background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; }
.filter-group { border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px; }
.filter-group:last-child { border-bottom: none; padding-bottom: 0; }
.group-label { color: #94a3b8; font-size: 11px; letter-spacing: 1.5px; margin-right: 12px; }
.group-line { flex: 1; height: 1px; background: linear-gradient(to right, rgba(255,255,255,0.1), transparent); }
.team-filter-container { display: flex; flex-wrap: nowrap; gap: 8px; padding: 4px; border-radius: 12px; overflow-x: auto; }
.team-filter-wrap { flex-wrap: wrap !important; overflow-x: visible; }
.team-pill { padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 700; color: #cbd5e1; white-space: nowrap; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid transparent; }
.team-pill:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
.pill-overall  { background: rgba(245,158,11,0.15); color: #fbbf24; }
.pill-overall.active  { background: #f59e0b; color: white; box-shadow: 0 4px 15px rgba(245,158,11,0.4); }
.pill-div1     { background: rgba(6,182,212,0.1); color: #22d3ee; }
.pill-div1.active     { background: #06b6d4; color: white; box-shadow: 0 4px 15px rgba(6,182,212,0.4); }
.pill-div2     { background: rgba(6,182,212,0.1); color: #22d3ee; }
.pill-div2.active     { background: #06b6d4; color: white; box-shadow: 0 4px 15px rgba(6,182,212,0.4); }
.pill-div3     { background: rgba(168,85,247,0.1); color: #c084fc; }
.pill-div3.active     { background: #a855f7; color: white; box-shadow: 0 4px 15px rgba(168,85,247,0.4); }
.pill-team     { background: rgba(255,255,255,0.05); color: #e2e8f0; }
.pill-team.active     { background: white; color: #1e293b; box-shadow: 0 4px 15px rgba(255,255,255,0.3); }
</style>
