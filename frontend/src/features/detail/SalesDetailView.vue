<template>
  <q-page class="q-pa-xl sales-detail-page">
    <!-- 🔙 Header Section with Back Button & Upload Modal Trigger -->
    <div class="row justify-between items-center q-mb-xl">
      <div class="row items-center">
        <q-btn flat round color="neon" icon="arrow_back" to="/" class="q-mr-md" />
        <div>
          <h1 class="text-h3 text-white text-weight-bolder q-ma-none" style="letter-spacing: -1.5px;">
            <span class="text-neon">Sales</span> Detail Analysis
          </h1>
          <p class="text-grey-5 q-ma-none text-subtitle1">영업팀 상세 통합 성과 분석</p>
        </div>
      </div>
      
      <!-- 기초데이터 입력 모달 트리거 -->
      <q-btn 
        outline 
        color="neon" 
        icon="cloud_upload" 
        label="기초데이터 연동" 
        class="text-weight-bold" 
        @click="isModalOpen = true" 
      />
    </div>

    <!-- 필터 및 핵심 모듈 렌더링 영역 (데이터가 있을 때) -->
    <div v-if="filteredTimelineData.months && filteredTimelineData.months.length > 0">
      
      <!-- 🎛️ Dynamic Filter Bar (SalesTeamSection과 동일 스타일) -->
      <SalesDetailFilter 
        :availableFilters="salesPills"
        :activeFilter="activeFilter"
        @update:activeFilter="val => activeFilter = val"
      />

      <!-- 📉 Main Content Area (Chart + Sidebar) -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <!-- 좌측: 메인 차트 -->
        <div class="col-12 col-lg-8">
          <SalesDetailChart 
            :timeline="filteredTimelineData" 
            :activeFilter="activeFilterLabel" 
          />
        </div>

        <!-- 우측: KPI Sidebar -->
        <div class="col-12 col-lg-4">
          <SalesKPISidebar
            :label="activeFilterLabel"
            :revenueArr="filteredTimelineData.revenueArr"
            :hcArr="filteredTimelineData.headcountArr"
            :revenue="filteredTimelineData.totalSumSales.toLocaleString()"
            :headcount="filteredTimelineData.latestHc"
            :rpp="filteredTimelineData.latestRPP"
          />
        </div>
      </div>

      <!-- 📊 Sequential Analysis Section (본부 선택 시 팀별, 팀 선택 시 팀원별) -->
      <div v-if="divisionTeamsData.length > 0 || teamMembersData.length > 0" class="q-mt-xl">
        <div class="row items-center q-mb-lg">
          <div class="text-h5 text-white text-weight-bolder">
            {{ teamMembersData.length > 0 ? 'Individual Employee Trends' : 'Team Performance Trends' }}
          </div>
          <q-badge outline color="primary" class="q-ml-md" :label="teamMembersData.length > 0 ? '팀원별 실적 추이' : '소속 팀별 실적 추이'" />
        </div>
        
        <div class="row q-col-gutter-lg">
          <div 
            v-for="item in (teamMembersData.length > 0 ? teamMembersData : divisionTeamsData)" 
            :key="item.name" 
            class="col-12 col-sm-6 col-md-4 col-xl-3"
          >
            <SalesMemberChart :member="item" :timeline="filteredTimelineData.months" />
          </div>
        </div>
      </div>

    </div>

    <!-- 데이터가 없을 때의 Empty State -->
    <div v-else class="empty-state flex flex-center flex-col q-py-xl column">
      <q-icon name="inbox" size="5rem" color="grey-6" class="q-mb-md" />
      <div class="text-h5 text-grey-4 text-weight-bold">현재 등록된 성능 데이터가 없습니다.</div>
      <div class="text-subtitle1 text-grey-6 q-mt-sm">우측 상단의 '기초데이터 연동' 버튼을 눌러 CSV 또는 XLSX를 업로드 해주세요.</div>
      <q-btn class="q-mt-lg" color="neon" text-color="black" label="기초데이터 템플릿 복사 및 업로드" @click="isModalOpen = true" />
    </div>

    <!-- 🌐 Modals -->
    <DataUploadModal 
      v-model="isModalOpen" 
      :csvTemplate="csvTemplate"
      @data-loaded="handleDataLoaded"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Components
import SalesDetailFilter from './components/SalesDetailFilter.vue'
import SalesDetailChart from './components/SalesDetailChart.vue'
import SalesKPISidebar from './components/SalesKPISidebar.vue'
import DataUploadModal from './components/DataUploadModal.vue'

// Composables
import { useSalesHarness } from './composables/useSalesHarness.js'

const { 
  rawData, activeFilter, activeFilterLabel, salesPills,
  filteredTimelineData, teamMembersData, divisionTeamsData, latestMonthLabel,
  parseCSV, parseParsedData, csvTemplate,
  fetchFromDB, uploadToDB 
} = useSalesHarness()

import SalesMemberChart from './components/SalesMemberChart.vue'

const isModalOpen = ref(false)

// 모달에서 파싱된 데이터 수신 → 글로벌 상태 + DB 동시 반영
const handleDataLoaded = async (parsedArray) => {
  parseParsedData(parsedArray)
  // 백엔드 DB에도 저장
  await uploadToDB(parsedArray)
}

onMounted(async () => {
  // DB에서 데이터 로드 시도
  if (rawData.value.length === 0) {
    const loaded = await fetchFromDB()
    // DB에 데이터가 없으면 더미 CSV 주입
    if (!loaded) {
      parseCSV(csvTemplate)
      // 더미 데이터도 DB에 저장
      await uploadToDB(rawData.value)
    }
  }
})
</script>

<style scoped>
.sales-detail-page {
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

.opacity-30 {
  opacity: 0.3;
}
</style>
