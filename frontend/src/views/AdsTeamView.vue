<template>
  <TeamDetailLayout
    eyebrow="Ads"
    subtitle="광고성과 상세 통합 분석"
    coming-icon="campaign"
    coming-desc="세부적인 광고 캠페인 지표 데이터가 이곳에 표시될 예정입니다."
    :features="['캠페인별 ROAS', '매체별 전환 분석', '일자별 성과 추이', '전환 퍼널 상세']"
  >
    <AdPerformanceSection />
  </TeamDetailLayout>
</template>

<script setup>
import TeamDetailLayout from '../components/TeamDetailLayout.vue'
import AdPerformanceSection from '../components/AdPerformanceSection.vue'
</script>
