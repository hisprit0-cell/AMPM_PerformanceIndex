/**
 * Supabase Keep-Alive Ping
 * --------------------------------------------------------------
 * 무료 플랜 프로젝트가 7일 비활성으로 자동 일시중지되는 것을 막기 위해
 * keep_alive 테이블에 "실제 DB 쿼리"(insert + cleanup + select)를 발생시킨다.
 * (대시보드 방문이 아니라 DB 활동이 있어야 일시중지가 방지된다.)
 *
 * 환경변수: SUPABASE_URL, SUPABASE_KEY  (코드에 하드코딩 금지)
 * 실패 시 process.exit(1) 로 종료 → GitHub Actions 가 실패로 표시.
 */
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_KEY

if (!url || !key) {
  console.error('❌ 환경변수 SUPABASE_URL / SUPABASE_KEY 가 설정되지 않았습니다.')
  process.exit(1)
}

// 서버 환경: 세션 영속화 불필요.
// Node < 22 는 내장 WebSocket 이 없어 supabase-js 의 realtime 초기화가 실패하므로
// ws 패키지를 transport 로 주입해 어떤 Node 버전에서도 동작하도록 한다.
const supabase = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: ws }
})

async function main() {
  console.log(`▶ keep-alive 시작: ${new Date().toISOString()}`)

  // 1) 가벼운 insert — 실제 DB 쓰기 발생 (일시중지 방지의 핵심)
  const { data: inserted, error: insertError } = await supabase
    .from('keep_alive')
    .insert({})
    .select()
    .single()

  if (insertError) {
    console.error('❌ insert 실패:', insertError.message)
    process.exit(1)
  }
  console.log(`✅ insert 성공 (id=${inserted.id}, pinged_at=${inserted.pinged_at})`)

  // 2) 오래된 행 정리 — 30일 이전 행 삭제 (테이블 비대화 방지)
  //    정리 실패는 핑 자체의 성공과 무관하므로 종료코드에 반영하지 않음
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { error: cleanupError } = await supabase
    .from('keep_alive')
    .delete()
    .lt('pinged_at', cutoff)

  if (cleanupError) {
    console.warn('⚠️ 오래된 행 정리 실패(치명적 아님):', cleanupError.message)
  } else {
    console.log(`🧹 ${cutoff} 이전 행 정리 완료`)
  }

  // 3) 확인용 가벼운 select (count head)
  const { count, error: countError } = await supabase
    .from('keep_alive')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ select 실패:', countError.message)
    process.exit(1)
  }

  console.log(`📊 현재 keep_alive 총 행 수: ${count}`)
  console.log('🎉 keep-alive 완료')
}

main().catch((err) => {
  console.error('❌ 예기치 못한 오류:', err)
  process.exit(1)
})
