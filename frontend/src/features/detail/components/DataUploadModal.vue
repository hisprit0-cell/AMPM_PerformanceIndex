<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="glass-card q-pa-lg text-white" style="min-width: 550px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px);">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-neon text-weight-bold">기초데이터 연동 (Harness Input)</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <p class="text-grey-4">영업팀 월간 상세 실적 데이터를 <strong>CSV 또는 XLSX(엑셀)</strong> 형태로 업로드하면 즉시 대시보드 상태에 동기화됩니다. 기존 데이터는 <strong>덮어씌워집니다</strong>.</p>
        
        <div 
          class="drop-zone q-pa-xl text-center cursor-pointer"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="handleDrop"
          @click="$refs.fileInput.click()"
          :class="{ 'drop-zone-active': dragOver }"
        >
          <!-- 로딩 오버레이 -->
          <div v-if="isProcessing" class="processing-overlay column flex-center">
            <q-spinner-gears size="3rem" color="neon" class="q-mb-md" />
            <div class="text-h6 text-neon">{{ processingMessage }}</div>
          </div>
          
          <template v-else>
            <q-icon name="cloud_upload" size="4rem" color="neon" class="q-mb-sm" />
            <div class="text-h6">CSV / XLSX 파일 드래그 앤 드롭</div>
            <div class="text-caption text-grey-5 q-mt-xs">또는 클릭하여 파일 선택 (.csv, .xlsx 지원)</div>
          </template>
          
          <input 
            type="file" 
            ref="fileInput" 
            accept=".csv,.xlsx,.xls" 
            style="display: none" 
            @change="handleFileSelect"
          >
        </div>

        <div v-if="fileName" class="q-mt-md text-positive text-center text-weight-bold">
          <q-icon name="check_circle" class="q-mr-xs" /> {{ fileName }} 업로드 및 파싱 완료! ({{ rowCount }}건)
        </div>
      </q-card-section>

      <q-card-actions align="between" class="q-mt-md">
        <q-btn flat class="text-grey-4" label="CSV 템플릿 양식 복사하기" @click="copyTemplate" />
        <q-btn color="neon" class="text-black text-weight-bold" label="적용 완료" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  csvTemplate: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'data-loaded'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const $q = useQuasar()
const dragOver = ref(false)
const fileName = ref('')
const rowCount = ref(0)
const fileInput = ref(null)
const isProcessing = ref(false)
const processingMessage = ref('')

/**
 * Excel 시리얼 날짜 → YY.MM 변환
 */
const excelDateToYYMM = (serial) => {
  if (typeof serial === 'string') {
    // 이미 문자열이면 그대로 반환 (예: "24.04", "2024-04")
    const s = serial.trim()
    // "2024-04" → "24.04" 변환
    if (s.match(/^\d{4}-\d{2}/)) {
      return s.slice(2, 4) + '.' + s.slice(5, 7)
    }
    // "2024.04" → "24.04"
    if (s.match(/^\d{4}\.\d{2}/)) {
      return s.slice(2)
    }
    return s
  }
  // Excel 시리얼 넘버 → Date
  if (typeof serial === 'number') {
    const date = XLSX.SSF.parse_date_code(serial)
    if (date) {
      const yy = String(date.y).slice(2)
      const mm = String(date.m).padStart(2, '0')
      return `${yy}.${mm}`
    }
  }
  return String(serial)
}

/**
 * 파싱된 행 배열을 emit
 */
const emitParsedData = (rows) => {
  rowCount.value = rows.length
  emit('data-loaded', rows)
  $q.notify({ 
    type: 'positive', 
    message: `${rows.length}건의 데이터가 즉각 반영되었습니다.`, 
    color: 'neon', 
    textColor: 'black' 
  })
}

/**
 * CSV 텍스트를 파싱하여 JSON 배열로 변환
 */
const parseCSVText = (csvText) => {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  
  const parsed = []
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(col => col.trim())
    if (row.length >= 5 && row[0]) {
      parsed.push({
        month: excelDateToYYMM(row[0]),
        division: row[1],
        team: row[2],
        revenue: Number(row[3]) || 0,
        headcount: Number(row[4]) || 0
      })
    }
  }
  return parsed
}

/**
 * XLSX 바이너리를 파싱하여 JSON 배열로 변환
 */
const parseXLSXData = (arrayBuffer) => {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  
  const parsed = []
  for (const row of jsonRows) {
    // 헤더명 매칭 (대소문자/한글 유연하게)
    const month = row['Month'] || row['month'] || row['기간'] || row['월'] || ''
    const division = row['Division'] || row['division'] || row['본부'] || row['본부명'] || ''
    const team = row['Team'] || row['team'] || row['팀'] || row['팀명'] || ''
    const revenue = row['Revenue'] || row['revenue'] || row['매출'] || row['매출액'] || 0
    const headcount = row['Headcount'] || row['headcount'] || row['인원'] || row['인원수'] || 0
    
    if (month && division && team) {
      parsed.push({
        month: excelDateToYYMM(month),
        division: String(division).trim(),
        team: String(team).trim(),
        revenue: Number(revenue) || 0,
        headcount: Number(headcount) || 0
      })
    }
  }
  return parsed
}

/**
 * 파일 처리 메인 로직
 */
const processFile = (file) => {
  if (!file) return
  
  const ext = file.name.split('.').pop().toLowerCase()
  
  if (!['csv', 'xlsx', 'xls'].includes(ext)) {
    $q.notify({ type: 'negative', message: 'CSV 또는 XLSX 파일만 업로드할 수 있습니다.' })
    return
  }
  
  fileName.value = ''
  isProcessing.value = true
  
  if (ext === 'csv') {
    processingMessage.value = 'CSV 데이터 분석 중...'
    const reader = new FileReader()
    reader.onload = (e) => {
      const parsed = parseCSVText(e.target.result)
      fileName.value = file.name
      isProcessing.value = false
      emitParsedData(parsed)
    }
    reader.readAsText(file)
  } else {
    // XLSX / XLS
    processingMessage.value = '엑셀 데이터 분석 중...'
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = parseXLSXData(e.target.result)
        fileName.value = file.name
        isProcessing.value = false
        emitParsedData(parsed)
      } catch (err) {
        isProcessing.value = false
        $q.notify({ type: 'negative', message: '엑셀 파싱 실패: ' + err.message })
      }
    }
    reader.readAsArrayBuffer(file)
  }
}

const handleDrop = (e) => {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  processFile(file)
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  processFile(file)
}

const copyTemplate = () => {
  navigator.clipboard.writeText(props.csvTemplate)
  $q.notify({ type: 'info', message: '템플릿 양식이 클립보드에 복사되었습니다.' })
}
</script>

<style scoped>
.text-neon {
  color: #00f2ff;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
}

.drop-zone {
  border: 2px dashed rgba(0, 242, 255, 0.4);
  border-radius: 12px;
  background: rgba(0, 242, 255, 0.05);
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.drop-zone:hover, .drop-zone-active {
  background: rgba(0, 242, 255, 0.15);
  border-color: #00f2ff;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(0, 242, 255, 0.3);
}

.processing-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
