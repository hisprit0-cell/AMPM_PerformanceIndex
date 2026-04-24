<template>
  <q-page class="q-pa-xl team-detail-page">
    <div class="row justify-between items-center q-mb-xl">
      <div class="row items-center">
        <q-btn flat round color="neon" icon="arrow_back" to="/" class="q-mr-md" />
        <div>
          <h1 class="text-h3 text-white text-weight-bolder q-ma-none" style="letter-spacing: -1.5px;">
            <span class="text-neon">Video</span> Team Analysis
          </h1>
          <p class="text-grey-5 q-ma-none text-subtitle1">영상마케팅팀 상세 통합 분석</p>
        </div>
      </div>
      
      <q-btn outline color="neon" icon="cloud_upload" label="기초데이터 연동" class="text-weight-bold" />
    </div>

    <!-- 📊 상단 요약 영역 -->
    <VideoTeamSection />

    <!-- 📉 하단 상세 내역 영역 (Placeholder) -->
    <div class="q-mt-xl">
      <div class="row items-center q-mb-lg">
        <div class="text-h5 text-white text-weight-bolder">Detailed Breakdown</div>
        <q-badge outline color="primary" class="q-ml-md" label="상세 내역" />
      </div>
      
      <q-card class="glass-card flex flex-center" style="min-height: 300px;">
        <div class="text-center">
          <q-icon name="analytics" size="4rem" color="grey-6" class="q-mb-md" />
          <div class="text-h6 text-grey-4 text-weight-bold">상세 내역 준비 중</div>
          <div class="text-subtitle1 text-grey-6 q-mt-sm">세부적인 영상 컨텐츠 및 채널 지표 데이터가 이곳에 표시될 예정입니다.</div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import VideoTeamSection from '../components/VideoTeamSection.vue'
</script>

<style scoped>
.team-detail-page {
  background: radial-gradient(circle at top right, rgba(0, 242, 255, 0.05), transparent 400px),
              radial-gradient(circle at bottom left, rgba(156, 39, 176, 0.05), transparent 400px);
}
.glass-card {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
.text-neon {
  color: #00f2ff;
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
}
</style>
