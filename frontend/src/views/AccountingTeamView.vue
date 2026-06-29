<template>
  <TeamDetailLayout
    eyebrow="Accounting"
    subtitle="회계팀 상세 통합 분석"
    coming-icon="account_balance"
    coming-desc="세부적인 재무 및 회계 지표 데이터가 이곳에 표시될 예정입니다."
    :features="['손익계산서 상세', '비용 항목 분석', '현금흐름 추이', '부서별 예산 집행']"
  >
    <AccountingTeamSection />
  </TeamDetailLayout>
</template>

<script setup>
import TeamDetailLayout from '../components/TeamDetailLayout.vue'
import AccountingTeamSection from '../components/AccountingTeamSection.vue'
</script>
