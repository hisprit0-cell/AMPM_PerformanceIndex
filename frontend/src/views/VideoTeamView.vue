<template>
  <TeamDetailLayout
    eyebrow="Video"
    subtitle="영상마케팅팀 상세 통합 분석"
    coming-icon="movie"
    coming-desc="세부적인 영상 컨텐츠 및 채널 지표 데이터가 이곳에 표시될 예정입니다."
    :features="['채널별 조회수 상세', '구독자 증감 분석', '컨텐츠별 성과', '상담 전환율']"
  >
    <VideoTeamSection />
  </TeamDetailLayout>
</template>

<script setup>
import TeamDetailLayout from '../components/TeamDetailLayout.vue'
import VideoTeamSection from '../components/VideoTeamSection.vue'
</script>
