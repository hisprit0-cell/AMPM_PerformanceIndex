<template>
  <q-page class="q-pa-xl dashboard-page">
    <div class="row items-center justify-between q-mb-xl">
      <h2 class="section-title no-margin">Master Management (관리자 페이지)</h2>
      <q-btn color="neon" icon="file_download" label="데이터 엑셀 다운로드" outline rounded no-caps />
    </div>

    <div class="row q-col-gutter-lg">
      <!-- 👥 1. 사용자 계정 관리 (User Account Management) -->
      <div class="col-12 col-lg-8">
        <q-card class="glass-card q-pa-md">
          <q-card-section class="row items-center q-pb-md">
            <div class="text-h6 font-weight-bold text-neon">회원 승인 및 권한 관리</div>
            <q-space />
            <q-input v-model="userSearch" dense filled color="neon" label="사용자 검색" label-color="grey-5" dark>
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
                  <q-btn v-if="props.row.status === 'pending'" flat round dense color="positive" icon="check_circle" @click="updateUserStatus(props.row, 'approved')">
                    <q-tooltip>가입 승인</q-tooltip>
                  </q-btn>
                  <q-btn v-if="props.row.role !== 'master'" flat round dense :color="props.row.status === 'blocked' ? 'warning' : 'negative'" icon="block" @click="updateUserStatus(props.row, props.row.status === 'blocked' ? 'approved' : 'blocked')">
                    <q-tooltip>{{ props.row.status === 'blocked' ? '차단 해제' : '사용 차단' }}</q-tooltip>
                  </q-btn>
                  <q-btn v-if="props.row.role !== 'master'" flat round dense color="grey-6" icon="delete" @click="deleteUser(props.row)">
                    <q-tooltip>계정 삭제</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- 📉 2. 데이터 업로드 관리 (Data Sync / Excel Upload) -->
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
              <input type="file" ref="excelInput" style="display: none" accept=".xlsx" @change="handleExcelUpload" />
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
import api from '../api'

const $q = useQuasar()
const loading = ref(false)
const userSearch = ref('')
const userList = ref([])

onMounted(() => fetchUsers())

/**
 * 📡 사용자 목록 조회 (Fetch Users)
 */
const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/users')
    userList.value = res.data.users
  } catch (err) {
    $q.notify({ color: 'negative', message: '사용자 목록을 불러오지 못했습니다.' })
  } finally {
    loading.value = false
  }
}

/**
 * 🛠️ 사용자 상태 변경 (Approve/Block)
 */
const updateUserStatus = async (user, newStatus) => {
  try {
    await api.patch(`/admin/users/${user.id}`, { status: newStatus })
    user.status = newStatus
    $q.notify({ color: 'positive', message: '상태가 변경되었습니다.', icon: 'check' })
  } catch (err) {
    $q.notify({ color: 'negative', message: '상태 변경에 실패했습니다.' })
  }
}

/**
 * 🗑️ 사용자 삭제 (Delete User)
 */
const deleteUser = (user) => {
  $q.dialog({ title: '계정 삭제', message: `${user.username}님을 삭제하시겠습니까?`, cancel: true, dark: true }).onOk(async () => {
    try {
      await api.delete(`/admin/users/${user.id}`)
      userList.value = userList.value.filter(u => u.id !== user.id)
      $q.notify({ color: 'positive', message: '삭제되었습니다.' })
    } catch (err) {
      $q.notify({ color: 'negative', message: '삭제에 실패했습니다.' })
    }
  })
}

/**
 * 📁 엑셀 데이터 업로드 처리 (Handle real Excel file upload via multipart/form-data)
 */
const handleExcelUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  $q.loading.show({ message: '데이터 분석 중...' })
  try {
    const res = await api.post('/admin/data/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    $q.notify({ color: 'positive', message: `데이터 업데이트 완료: ${res.data.count}개의 레코드`, icon: 'cloud_done' })
  } catch (err) {
    const msg = err.response?.data?.error || '업로드 중 오류가 발생했습니다.';
    $q.notify({ color: 'negative', message: msg, icon: 'error' })
  } finally {
    $q.loading.hide()
    e.target.value = ''; // Reset input
  }
}

const filteredUsers = computed(() => userList.value.filter(u => u.username.toLowerCase().includes(userSearch.value.toLowerCase())))
const getStatusColor = (s) => s === 'approved' ? 'positive' : (s === 'pending' ? 'info' : 'negative')
const getStatusText = (s) => s === 'approved' ? '정상 승인' : (s === 'pending' ? '승인 대기' : '사용 차단')

const userColumns = [
  { name: 'username', label: '아이디', field: 'username', align: 'left', sortable: true },
  { name: 'email', label: '이메일', field: 'email', align: 'left' },
  { name: 'status', label: '상태', field: 'status', align: 'center' },
  { name: 'created_at', label: '가입일', field: (row) => row.created_at.split('T')[0], align: 'center' },
  { name: 'actions', label: '관리', field: 'id', align: 'right' }
]
</script>

<style scoped>
.section-title { color: #ECEFF4; font-size: 1.8rem; font-weight: 900; border-left: 5px solid #00f2ff; padding-left: 15px; border-radius: 2px; }
.glass-card { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; }
.text-neon { color: #00f2ff; }
.upload-area { border: 2px dashed rgba(0, 242, 255, 0.3); background: rgba(0, 242, 255, 0.02); border-radius: 16px; cursor: pointer; }
.glass-table :deep(thead tr th) { font-weight: 800; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: #8892b0; }
</style>
