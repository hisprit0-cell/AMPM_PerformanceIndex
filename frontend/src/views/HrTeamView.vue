<template>
  <TeamDetailLayout
    eyebrow="HR"
    subtitle="인사팀 상세 통합 분석"
    coming-icon="people"
    coming-desc="세부적인 인사 및 채용 지표 데이터가 이곳에 표시될 예정입니다."
    :features="['부서별 인원 현황', '입·퇴사 상세', '근속/이직률', '채용 파이프라인']"
  >
    <HrTeamSection />
  </TeamDetailLayout>
</template>

<script setup>
import TeamDetailLayout from '../components/TeamDetailLayout.vue'
import HrTeamSection from '../components/HrTeamSection.vue'
</script>
