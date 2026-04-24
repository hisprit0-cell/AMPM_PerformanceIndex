<template>
  <q-page class="q-pa-xl dashboard-page">
    <div class="row items-center justify-between q-mb-xl">
      <h2 class="section-title no-margin">Master Management (관리자 페이지)</h2>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- 👥 1. 사용자 계정 관리 (Supabase profiles + auth.users 연동) -->
      <div class="col-12 col-lg-8">
        <q-card class="glass-card q-pa-md">
          <q-card-section class="row items-center q-pb-md">
            <div class="text-h6 font-weight-bold text-neon">회원 승인 및 권한 관리</div>
            <q-space />
            <q-input v-model="userSearch" dense filled color="neon" label="이메일 검색" label-color="grey-5" dark>
              <template v-slot:append><q-icon name="search" /></template>
            </q-input>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-table
              flat
              class="glass-table bg-transparent"
              :rows="filteredUsers"
              :columns="userColumns"
              row-key="id"
              :loading="loading"
              :rows-per-page-options="[10, 20, 50]"
              dark
            >
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip :color="getStatusColor(props.value)" text-color="white" size="sm" class="text-weight-bold">
                    {{ getStatusText(props.value) }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-x-sm">
                  <q-btn
                    v-if="props.row.status === 'pending'"
                    flat round dense color="positive" icon="check_circle"
                    @click="updateStatus(props.row, 'approved')"
                  >
                    <q-tooltip>가입 승인</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.role !== 'master'"
                    flat round dense
                    :color="props.row.status === 'blocked' ? 'warning' : 'negative'"
                    icon="block"
                    @click="updateStatus(props.row, props.row.status === 'blocked' ? 'approved' : 'blocked')"
                  >
                    <q-tooltip>{{ props.row.status === 'blocked' ? '차단 해제' : '사용 차단' }}</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- 📉 2. 데이터 업로드 (엑셀 → Supabase) -->
      <div class="col-12 col-lg-4">
        <q-card class="glass-card q-pa-md h-100 column">
          <q-card-section>
            <div class="text-h6 font-weight-bold text-neon q-mb-md">성과 데이터 업로드</div>
            <div class="text-caption text-grey-4 q-mb-lg">엑셀(.xlsx) 파일을 업로드하여 데이터를 실시간 업데이트합니다.</div>
          </q-card-section>
          <q-card-section class="col-grow flex flex-center">
            <div class="upload-area full-width text-center q-pa-xl column items-center" @click="$refs.excelInput.click()">
              <q-icon name="cloud_upload" color="neon" size="64px" />
              <div class="text-subtitle1 q-mt-md">엑셀 업로드 (클릭)</div>
              <input type="file" ref="excelInput" style="display: none" accept=".xlsx,.xls" @change="handleExcelUpload" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'

const $q = useQuasar()
const loading = ref(false)
const userSearch = ref('')
const userList = ref([])

onMounted(() => fetchUsers())

/**
 * 📡 회원 목록 조회 (Supabase profiles + auth.admin 없이 가능한 수준)
 * - profiles 테이블과 auth.users 의 email 을 view/function 없이 얻기 위해
 *   Supabase JS 가 제공하는 RLS 경로만으로 처리
 */
const fetchUsers = async () => {
  loading.value = true
  try {
    // profiles 전체 (관리자 RLS 허용 범위)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, role, status, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error

    // auth.users 의 email 은 public API 에서 조회 불가 → 각 row 에 placeholder
    // (이메일은 해당 사용자가 직접 로그인 했을 때만 session.user.email 로 얻음)
    // 운영 편의를 위해 Supabase Dashboard > Authentication > Users 페이지에서도 확인 권장.
    userList.value = (profiles || []).map(p => ({
      id: p.id,
      role: p.role,
      status: p.status,
      created_at: p.created_at,
      email: p.id.slice(0, 8) + '… (Dashboard 확인)'
    }))
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: '사용자 목록을 불러오지 못했습니다.' })
  } finally {
    loading.value = false
  }
}

/**
 * 🛠️ 상태 변경 (승인/차단)
 */
const updateStatus = async (row, newStatus) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', row.id)
    if (error) throw error
    row.status = newStatus
    $q.notify({ color: 'positive', message: '상태가 변경되었습니다.', icon: 'check' })
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: '상태 변경에 실패했습니다.' })
  }
}

/**
 * 📁 엑셀 업로드 → sales_data upsert
 */
const handleExcelUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  $q.loading.show({ message: '데이터 분석 중...' })
  try {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    // 기대 컬럼: Month/Division/Team/Name?/Revenue/Headcount (대소문자 허용)
    const pick = (row, keys) => {
      for (const k of keys) if (row[k] !== undefined && row[k] !== '') return row[k]
      return null
    }
    const payload = rows.map(r => ({
      month:    String(pick(r, ['Month', 'month', '월']) || '').trim(),
      division: String(pick(r, ['Division', 'division', '본부']) || '').trim(),
      team:     String(pick(r, ['Team', 'team', '팀']) || '').trim(),
      name:     pick(r, ['Name', 'name', '이름']) ? String(pick(r, ['Name', 'name', '이름'])).trim() : null,
      revenue:  Number(pick(r, ['Revenue', 'revenue', '매출']) || 0),
      headcount:Number(pick(r, ['Headcount', 'headcount', '인원']) || 0)
    })).filter(r => r.month && r.division && r.team)

    if (payload.length === 0) throw new Error('유효한 행을 찾지 못했습니다.')

    const { error } = await supabase
      .from('sales_data')
      .upsert(payload, { onConflict: 'month,division,team,name' })
    if (error) throw error

    $q.notify({ color: 'positive', message: `업로드 완료: ${payload.length}개 레코드`, icon: 'cloud_done' })
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: err.message || '업로드 중 오류가 발생했습니다.', icon: 'error' })
  } finally {
    $q.loading.hide()
    e.target.value = ''
  }
}

const filteredUsers = computed(() =>
  userList.value.filter(u => u.email.toLowerCase().includes(userSearch.value.toLowerCase()))
)
const getStatusColor = (s) => s === 'approved' ? 'positive' : (s === 'pending' ? 'info' : 'negative')
const getStatusText  = (s) => s === 'approved' ? '정상 승인' : (s === 'pending' ? '승인 대기' : '사용 차단')

const userColumns = [
  { name: 'email',      label: '이메일/ID', field: 'email',   align: 'left',  sortable: true },
  { name: 'role',       label: '권한',      field: 'role',    align: 'center' },
  { name: 'status',     label: '상태',      field: 'status',  align: 'center' },
  { name: 'created_at', label: '가입일',    field: row => row.created_at ? row.created_at.split('T')[0] : '-', align: 'center' },
  { name: 'actions',    label: '관리',      field: 'id',      align: 'right' }
]
</script>

<style scoped>
.section-title { color: #ECEFF4; font-size: 1.8rem; font-weight: 900; border-left: 5px solid #00f2ff; padding-left: 15px; border-radius: 2px; }
.glass-card { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; }
.text-neon { color: #00f2ff; }
.upload-area { border: 2px dashed rgba(0, 242, 255, 0.3); background: rgba(0, 242, 255, 0.02); border-radius: 16px; cursor: pointer; }
.glass-table :deep(thead tr th) { font-weight: 800; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: #8892b0; }
</style>
