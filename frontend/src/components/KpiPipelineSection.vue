<template>
  <div class="section-container" style="margin-top: 32px;">
    <h2 class="section-title">Performance Pipeline (성과 지표 흐름도)</h2>

    <q-card class="glass-card q-pa-lg pipeline-wrapper">
      <div class="pipeline-scroll-area">
        <div class="pipeline-container">
          
          <!-- Node 1: 광고비 -->
          <PipelineNode title="광고비 (Ad Spend)" :value="formatMoney(adSpend)" color="grey-3" sub="예산 소진액" />

          <!-- Edge 1 -->
          <PipelineEdge />

          <!-- Node 2: 노출수 -->
          <PipelineNode title="노출수 (Impressions)" :value="formatNum(impressions)" color="teal" sub="총 노출 건수" />

          <!-- Edge 2: CTR -->
          <PipelineEdge :badge="'CTR ' + ctr.toFixed(2) + '%'" highlight />

          <!-- Node 3: 클릭수 -->
          <PipelineNode title="클릭수 (Clicks)" :value="formatNum(clicks)" color="blue" sub="총 클릭 건수" />

          <!-- Branch to Categories -->
          <div class="pipeline-branch">
            <div class="branch-lines-in">
              <div class="branch-line top"></div>
              <div class="branch-line mid"></div>
              <div class="branch-line bot"></div>
            </div>
            
            <div class="category-nodes">
              <div class="cat-node">A: {{ catA }}건</div>
              <div class="cat-node">B: {{ catB }}건</div>
              <div class="cat-node">C: {{ catC }}건</div>
            </div>

            <div class="branch-lines-out">
              <div class="branch-line top"></div>
              <div class="branch-line mid"></div>
              <div class="branch-line bot"></div>
            </div>
          </div>

          <!-- Node 4: 총 전환수 -->
          <PipelineNode title="총 전환수 (Conversions)" :value="formatNum(totalConversions)" color="neon" sub="승인된 총 전환" />

          <!-- Edge 4: CVR & CPA -->
          <PipelineEdge :badge="'CVR ' + cvr.toFixed(2) + '%'" highlight />

          <!-- Node 5: CPA -->
          <PipelineNode title="CPA (전환당 비용)" :value="formatMoney(cpa)" color="warning" sub="객단가 기준" />

          <!-- Edge 5 -->
          <PipelineEdge />

          <!-- Node 6: 신규 매출액 -->
          <PipelineNode title="신규 매출액 (Revenue)" :value="formatMoney(revenue)" color="positive" sub="발생한 총 매출" />

          <!-- Edge 6: ROAS -->
          <PipelineEdge :badge="'ROAS ' + roas.toFixed(1) + '%'" highlight glow />

          <!-- Node 7: ROAS (Final Focus Node) -->
          <div class="node-box node-final bounce-ani">
            <div class="node-title text-uppercase text-weight-bolder" style="color:#00f2ff; letter-spacing:2px; font-size:0.9rem;">Final ROAS</div>
            <div class="node-value text-white text-weight-bolder" style="font-size: 2.8rem; text-shadow: 0 0 15px rgba(0,242,255,0.8);">{{ roas.toFixed(0) }}%</div>
          </div>

        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PipelineNode from './KpiPipelineNode.vue'
import PipelineEdge from './KpiPipelineEdge.vue'

// Data Setup
const adSpend = ref(10000000)
const impressions = ref(500000)
const clicks = ref(16500)

const catA = ref(150)
const catB = ref(110)
const catC = ref(90)

const revenue = ref(45500000)

// Computed KPIs
const ctr = computed(() => (clicks.value / impressions.value) * 100)
const totalConversions = computed(() => catA.value + catB.value + catC.value)
const cvr = computed(() => (totalConversions.value / clicks.value) * 100)
const cpa = computed(() => adSpend.value / totalConversions.value)
const roas = computed(() => (revenue.value / adSpend.value) * 100)

// Formatting
const formatNum = (v) => v.toLocaleString()
const formatMoney = (v) => '₩' + Math.round(v).toLocaleString()

</script>

<style scoped>
.section-container { margin-bottom: 72px; animation: fadeIn 0.7s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
.section-title { color: #ECEFF4; font-size: 1.8rem; font-weight: 900; margin-bottom: 24px; border-left: 5px solid #a855f7; padding-left: 15px; }

.glass-card { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; }

.pipeline-scroll-area { 
  overflow-x: auto; 
  padding: 24px 10px 48px; /* space for overflow badges */
}

/* Custom Scrollbar */
.pipeline-scroll-area::-webkit-scrollbar { height: 8px; }
.pipeline-scroll-area::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
.pipeline-scroll-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }

.pipeline-container { 
  display: flex; 
  align-items: center; 
  min-width: 1400px; /* Force spread */
  gap: 8px;
}

/* Node Styles */
:deep(.node-box) {
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
:deep(.node-box:hover) {
  transform: translateY(-5px);
  border-color: rgba(255,255,255,0.4);
}
:deep(.node-final) {
  min-width: 200px;
  background: linear-gradient(135deg, rgba(0,242,255,0.15), rgba(168,85,247,0.15));
  border: 2px solid rgba(0,242,255,0.6);
}

.bounce-ani { animation: bounceGlow 3s infinite alternate ease-in-out; }
@keyframes bounceGlow {
  0% { box-shadow: 0 0 10px rgba(0,242,255,0.2); transform: scale(1); }
  100% { box-shadow: 0 0 30px rgba(0,242,255,0.6); transform: scale(1.03); }
}

/* Edge connecting lines */
:deep(.edge-container) {
  flex: 1 1 50px;
  min-width: 60px;
  height: 50px;
  position: relative;
  display: flex;
  align-items: center;
}
:deep(.edge-line) {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}
:deep(.edge-highlight) {
  background: rgba(0, 242, 255, 0.2);
}
:deep(.edge-glow) {
  background: rgba(168, 85, 247, 0.4);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
}
:deep(.edge-particle) {
  position: absolute;
  top: 0; left: 0;
  height: 100%; width: 30px;
  background: rgba(255,255,255,0.8);
  box-shadow: 0 0 10px #fff;
  animation: moveParticle 2.5s infinite linear;
}
@keyframes moveParticle {
  0% { transform: translateX(-30px); }
  100% { transform: translateX(300px); } /* arbitrary large enough */
}

/* Arrow head */
:deep(.edge-arrow) {
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

/* Badge (CTR, CVR) */
:deep(.edge-badge) {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30,41,59, 0.9);
  border: 1px solid rgba(0,242,255,0.3);
  color: #00f2ff;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 4px 6px rgba(0,0,0,0.5);
}
:deep(.badge-glow) {
  border-color: #a855f7;
  color: #c084f5;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
}

/* Branching logic for categories */
.pipeline-branch {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  position: relative;
}
.category-nodes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2;
}
.cat-node {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 6px 14px;
  border-radius: 8px;
  color: #cbd5e1;
  font-weight: 600;
  font-size: 0.85rem;
  text-align: center;
  min-width: 100px;
}

/* Branch connector SVG/CSS lines */
.branch-lines-in, .branch-lines-out {
  width: 40px;
  height: 100px;
  position: relative;
}
.branch-line {
  position: absolute;
  border: 2px solid rgba(255,255,255,0.15);
  width: 100%;
}
/* Inbound curved lines */
.branch-lines-in .top {
  top: 10px; height: 40px; left: 0;
  border-left: none; border-bottom: none;
  border-top-left-radius: 8px;
}
.branch-lines-in .mid {
  top: 50%; height: 2px; left: 0; border: none; background: rgba(255,255,255,0.15);
}
.branch-lines-in .bot {
  bottom: 8px; height: 40px; left: 0;
  border-left: none; border-top: none;
  border-bottom-left-radius: 8px;
}

/* Outbound curved lines */
.branch-lines-out .top {
  top: 10px; height: 40px; right: 0;
  border-right: none; border-bottom: none;
  border-top-right-radius: 8px;
}
.branch-lines-out .mid {
  top: 50%; height: 2px; right: 0; border: none; background: rgba(255,255,255,0.15);
}
.branch-lines-out .bot {
  bottom: 8px; height: 40px; right: 0;
  border-right: none; border-top: none;
  border-bottom-right-radius: 8px;
}

/* Text Colors */
.text-neon { color: #00f2ff; text-shadow: 0 0 10px rgba(0,242,255,0.5); }
.text-teal { color: #2dd4bf; }
.text-blue { color: #60a5fa; }
.text-warning { color: #F2C037; }
.text-positive { color: #4ade80; }
</style>
