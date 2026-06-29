<template>
  <TeamDetailLayout
    eyebrow="Dev"
    subtitle="개발팀 상세 통합 분석"
    coming-icon="code"
    coming-desc="세부적인 개발 성과 및 리소스 데이터가 이곳에 표시될 예정입니다."
    :features="['도메인별 트래픽 상세', '페이지 성능 지표', '배포/이슈 추이', '리소스 사용량']"
  >
    <DevTeamSection />
  </TeamDetailLayout>
</template>

<script setup>
import TeamDetailLayout from '../components/TeamDetailLayout.vue'
import DevTeamSection from '../components/DevTeamSection.vue'
</script>
