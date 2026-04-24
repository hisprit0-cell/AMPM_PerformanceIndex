import { ref, computed } from 'vue'

// ── Global State (Singleton — 모든 컴포넌트가 동일 인스턴스 공유) ────────────
const rawData = ref([])
const activeFilter = ref('전체')

// 필터 버튼(Pill) 구조 — SalesTeamSection과 SalesDetailView 양쪽에서 동일하게 사용
const salesPills = [
  { key: '전체',                    label: '전체',        pillClass: 'pill-overall' },
  { key: '퍼포먼스1본부',            label: '퍼포먼스1본부', pillClass: 'pill-div1' },
  { key: '퍼포먼스1본부/영업 1팀',    label: '영업 1팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스1본부/영업 2팀',    label: '영업 2팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스1본부/영업 3팀',    label: '영업 3팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스2본부',            label: '퍼포먼스2본부', pillClass: 'pill-div2' },
  { key: '퍼포먼스2본부/영업 1팀',    label: '영업 1팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스2본부/영업 2팀',    label: '영업 2팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스2본부/영업 3팀',    label: '영업 3팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스3본부',            label: '퍼포먼스3본부', pillClass: 'pill-div3' },
  { key: '퍼포먼스3본부/영업 1팀',    label: '영업 1팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스3본부/영업 4팀',    label: '영업 4팀',    pillClass: 'pill-team' },
  { key: '퍼포먼스3본부/영업 5팀',    label: '영업 5팀',    pillClass: 'pill-team' }
]

// x축 기준 타임라인 (rawData 기반 동적 계산, 최소 24개월)
const timelineArr = computed(() => {
  if (rawData.value.length === 0) {
    // 기본값: 24.04 ~ 26.03
    return Array(24).fill(0).map((_, i) => {
      const m = ((i + 3) % 12) + 1
      const yr = i < 9 ? '24.' : i < 21 ? '25.' : '26.'
      return yr + String(m).padStart(2, '0')
    })
  }
  // rawData에서 고유 월 추출 후 정렬
  const months = [...new Set(rawData.value.map(r => r.month))].sort()
  return months
})

// 기간 표시 라벨 (예: "24.04 ~ 26.03")
const periodLabel = computed(() => {
  const t = timelineArr.value
  if (t.length === 0) return ''
  return `${t[0]} ~ ${t[t.length - 1]}`
})

// 최근월 라벨 (예: "3월")
const latestMonthLabel = computed(() => {
  const t = timelineArr.value
  if (t.length === 0) return ''
  const last = t[t.length - 1] // "26.03"
  const mm = parseInt(last.split('.')[1])
  return `${mm}월`
})

// Backend API base URL
const API_BASE = 'http://localhost:3001'

export function useSalesHarness() {

  // CSV 대규모 랜덤 더미데이터 생성 (24.04 ~ 26.03) -> 초기 데이터 연동용
  const generateMockCSV = () => {
    let csv = "Month,Division,Team,Revenue,Headcount\n"
    
    const structure = {
      '퍼포먼스1본부': ['영업 1팀', '영업 2팀', '영업 3팀'],
      '퍼포먼스2본부': ['영업 1팀', '영업 2팀', '영업 3팀'],
      '퍼포먼스3본부': ['영업 1팀', '영업 4팀', '영업 5팀']
    }
    const divisions = Object.keys(structure)
    
    // 24.04 ~ 26.03
    const months = []
    let year = 24, month = 4
    for (let i = 0; i < 24; i++) {
      months.push(`${year}.${String(month).padStart(2, '0')}`)
      month++
      if (month > 12) { month = 1; year++ }
    }

    months.forEach(m => {
      // 1. Monthly Grand Total
      const monthlyTotalRevenue = 15000 + Math.floor(Math.random() * 10000)
      const monthlyTotalHC = 45 + Math.floor(Math.random() * 15)

      let remainingRev = monthlyTotalRevenue
      let remainingHC = monthlyTotalHC
      
      divisions.forEach((div, idx) => {
        let divRev, divHC
        if (idx === divisions.length - 1) {
          divRev = remainingRev
          divHC = remainingHC
        } else {
          const rRatio = 0.25 + (Math.random() * 0.15)
          const hRatio = 0.25 + (Math.random() * 0.15)
          divRev = Math.floor(monthlyTotalRevenue * rRatio)
          divHC = Math.floor(monthlyTotalHC * hRatio)
          remainingRev -= divRev
          remainingHC -= divHC
        }

        // 2. Distribute to Teams
        const teams = structure[div]
        let tRemainingRev = divRev
        let tRemainingHC = divHC

        teams.forEach((teamName, tIdx) => {
          let tRev, tHC
          if (tIdx === teams.length - 1) {
            tRev = tRemainingRev
            tHC = tRemainingHC
          } else {
            const trRatio = 0.25 + (Math.random() * 0.15)
            const thRatio = 0.25 + (Math.random() * 0.15)
            tRev = Math.floor(divRev * trRatio)
            tHC = Math.floor(divHC * thRatio)
            tRemainingRev -= tRev
            tRemainingHC -= tHC
          }
          csv += `${m},${div},${teamName},${tRev},${tHC}\n`
        })
      })
    })
    return csv
  }

  const csvTemplate = generateMockCSV()

  // rawData에 파싱된 배열을 적용 (덮어쓰기)
  const parseParsedData = (parsed) => {
    rawData.value = parsed.sort((a, b) => a.month.localeCompare(b.month))
  }

  // 1. CSV 파서 로직 (Vanilla JS)
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return

    const parsed = []
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(col => col.trim())
      if (row.length >= 5) {
        parsed.push({
          month: row[0],
          division: row[1],
          team: row[2],
          revenue: Number(row[3]) || 0,
          headcount: Number(row[4]) || 0
        })
      }
    }
    parseParsedData(parsed)
  }

  // 2. 통합 Map 리턴 (SalesTeamSection & SalesDetail 양쪽에서 사용)
  const salesMData = computed(() => {
    const timeline = timelineArr.value
    const len = timeline.length
    const map = {}
    salesPills.forEach(p => { map[p.key] = { s: Array(len).fill(0), h: Array(len).fill(0) } })
    
    if (rawData.value.length === 0) return map

    // 월별 인덱스
    const monthIndex = {}
    timeline.forEach((m, idx) => { monthIndex[m] = idx })

    rawData.value.forEach(row => {
      const idx = monthIndex[row.month]
      if (idx !== undefined) {
        const teamKey = `${row.division}/${row.team}`
        const divKey = row.division
        const rev = row.revenue
        const hc = row.headcount
        
        // 전체 적용
        map['전체'].s[idx] += rev
        map['전체'].h[idx] += hc
        // 본부 적용
        if (map[divKey]) {
          map[divKey].s[idx] += rev
          map[divKey].h[idx] += hc
        }
        // 팀 적용
        if (map[teamKey]) {
          map[teamKey].s[idx] += rev
          map[teamKey].h[idx] += hc
        }
      }
    })
    
    return map
  })

  // 3. 필터링된 데이터 (상세 화면용)
  const filteredTimelineData = computed(() => {
    const timeline = timelineArr.value
    const len = timeline.length
    const d = salesMData.value[activeFilter.value] || { s: Array(len).fill(0), h: Array(len).fill(0) }
    
    const revenueArr = d.s
    const headcountArr = d.h
    const rppArr = d.s.map((v, i) => d.h[i] ? Math.round(v / d.h[i]) : 0)

    const lastIdx = len - 1
    const latestMonthRevenue = lastIdx >= 0 ? d.s[lastIdx] || 0 : 0
    const latestHc = lastIdx >= 0 ? d.h[lastIdx] || 0 : 0
    // 인원당 매출 (Revenue / Headcount) - 중앙화된 최신월 수치
    const latestRPP = latestHc > 0 ? Math.round(latestMonthRevenue / latestHc) : 0

    return {
      months: timeline,
      revenueArr,
      headcountArr,
      rppArr,
      totalSumSales: latestMonthRevenue, // 최근월 매출액
      latestHc,
      latestRPP
    }
  })

  // 4. 특정 팀 선택 시 사원별 데이터 추출
  const teamMembersData = computed(() => {
    if (!activeFilter.value.includes('/')) return []
    const [div, team] = activeFilter.value.split('/')
    const timeline = timelineArr.value
    const len = timeline.length
    const membersMap = {}

    rawData.value.forEach(row => {
      if (row.division === div && row.team === team && row.name) {
        if (!membersMap[row.name]) {
          membersMap[row.name] = { name: row.name, s: Array(len).fill(0) }
        }
        const idx = timeline.indexOf(row.month)
        if (idx !== -1) membersMap[row.name].s[idx] = row.revenue
      }
    })
    return Object.values(membersMap)
  })

  // 5. 특정 본부 선택 시 소속 팀별 데이터 추출
  const divisionTeamsData = computed(() => {
    // 본부 레벨인 경우만 (activeFilter가 '/', 즉 팀 구분이 없는 경우)
    if (activeFilter.value === '전체' || activeFilter.value.includes('/')) return []
    
    const div = activeFilter.value
    const timeline = timelineArr.value
    const len = timeline.length
    const teamsInDiv = salesPills.filter(p => p.key.startsWith(div + '/'))
    
    return teamsInDiv.map(p => {
      const d = salesMData.value[p.key] || { s: Array(len).fill(0), h: Array(len).fill(0) }
      return {
        name: p.label,
        s: d.s,
        h: d.h
      }
    })
  })

  // 6. 성장률 계산 유틸리티
  const getGR = (arr, type) => {
    const len = arr ? arr.length : 0
    if (len < 2) return '0.0'
    const lastIdx = len - 1
    let prevIdx
    if (type === 'mom') prevIdx = lastIdx - 1
    else if (type === 'qoq') prevIdx = lastIdx - 3
    else if (type === 'hoh') prevIdx = lastIdx - 6
    else prevIdx = lastIdx - 12 // yoy
    
    if (prevIdx < 0) return '0.0'
    const c = arr[lastIdx], p = arr[prevIdx] || 1
    return (((c - p) / p) * 100).toFixed(1)
  }

  // 6. 표시 라벨 (예: "퍼포먼스1본부 > 영업 1팀")
  const activeFilterLabel = computed(() => {
    const pill = salesPills.find(p => p.key === activeFilter.value)
    if (!pill) return activeFilter.value
    if (pill.key.includes('/')) {
      return pill.key.replace('/', ' > ')
    }
    return pill.label
  })

  // 5. Backend API 연동 함수
  const fetchFromDB = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sales/data`)
      const json = await res.json()
      if (json.success && json.data && json.data.length > 0) {
        parseParsedData(json.data)
        return true
      }
      return false
    } catch (e) {
      console.warn('DB 조회 실패, 로컬 데이터 사용:', e.message)
      return false
    }
  }

  const uploadToDB = async (dataArray) => {
    try {
      const res = await fetch(`${API_BASE}/api/sales/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataArray })
      })
      const json = await res.json()
      return json
    } catch (e) {
      console.warn('DB 업로드 실패:', e.message)
      return { success: false }
    }
  }

  return {
    rawData,
    activeFilter,
    activeFilterLabel,
    salesPills,
    timelineArr,
    periodLabel,
    latestMonthLabel,
    salesMData,
    filteredTimelineData,
    teamMembersData,
    divisionTeamsData,
    getGR,
    parseCSV,
    parseParsedData,
    csvTemplate,
    fetchFromDB,
    uploadToDB
  }
}
