# 📊 Project: Jack's Enterprise Intelligence Dashboard

> **"데이터를 넘어 경험으로, 100인의 열정을 시각화하다"**
> 본 프로젝트는 영업, 지원, 개발, 영상팀의 핵심 지표를 통합 관리하며, Quasar의 강력한 UI와 Matter.js의 물리 엔진을 결합한 인터랙티브 성과 보고 플랫폼입니다.

---

## 1. 프로젝트 핵심 아키텍처

* **FrontEnd**: Vue.js 2.0 (Options API) & Quasar Framework
* **BackEnd**: Node.js & Koa.js (RESTful API)
* **Database**: MariaDB (Relational Data Management)
* **Database ORM**: Sequelize
* **DevOps**: Docker, Nginx, Ubuntu 기반 컨테이너화 배포

---

## 2. 팀별 대시보드 상세 설계 (Dashboard Sections)

### 2.1 영업팀 (Sales Team) - *첨부 이미지 기반 최적화*
* **핵심 지표**: 전사 통합 매출액(₩196억), 총 인원(100명)
* **시각화 요소**: 
    * **메인 차트**: 월간 매출(Bar)과 팀별 인원 수(Line)가 결합된 Composed Chart.
    * **성장 분석**: 전월 대비(MoM), 분기 대비(QoQ), 반기 대비(HoH) 성장률 카드.
    * **필터링**: 본부 및 팀별(1~5팀) 멀티 셀렉트 필터 적용.
* **인터랙션**: 매출 목표 달성 시 `QNotify`와 함께 화면 위로 축하 풍선이 부양하는 안티그래비티 효과.

### 2.2 지원팀 (Support Team)
* **핵심 지표**: 월간 입사자 수 vs 퇴사자 수
* **시각화 요소**: 
    * **HR 트렌드**: 입/퇴사자 추이를 보여주는 Stacked Area Chart.
    * **조직 건강도**: 전체 인원 대비 퇴사율을 게이지(Gauge) 차트로 표현.
* **데이터 소스**: MariaDB `hr_records` 테이블.

### 2.3 개발팀 (Dev Team)
* **핵심 지표**: 월간 총 페이지뷰 (PV)
* **시각화 요소**: 
    * **트래픽 모니터링**: 실시간에 가까운 일별/월별 PV 선형 그래프(Line Chart).
    * **성능 지표**: 서버 업타임 및 API 응답 속도 요약 대시보드.
* **데이터 소스**: Koa.js 로그 수집 미들웨어 연동.

### 2.4 영상팀 (Video Team)
* **핵심 지표 (28일 일평균)**: 상담 신청 수, 구독 수, 사이트 유입수
* **시각화 요소**: 
    * **마케팅 퍼널**: 유입 → 구독 → 상담 신청으로 이어지는 Funnel Chart.
    * **평균 지표 카드**: Quasar `QCard`를 활용해 각 지표의 평균값을 네온 텍스트로 강조.
* **데이터 소스**: 외부 채널(YouTube API 등) 및 내부 랜딩페이지 DB 연동.

---

## 3. 개발 가이드 (Implementation)

### 3.1 MariaDB 테이블 구조 (예시)
```sql
-- 팀별 성과 통합 테이블
CREATE TABLE performance_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(50),      -- 영업, 지원, 개발, 영상
    metric_type VARCHAR(50),    -- revenue, pv, subscribers 등
    metric_value DECIMAL(15, 2),
    recorded_at DATE,
    member_count INT
);
```

### 3.2 Koa.js API 엔드포인트
```javascript
// routes/performance.js
router.get('/api/metrics', async (ctx) => {
  const data = await db('performance_metrics')
    .whereBetween('recorded_at', [startDate, endDate])
    .select('*');
  ctx.body = { success: true, data };
});
```

### 3.3 Quasar + Matter.js (Anti-Gravity) 연동
> 특정 지표를 클릭하면 해당 카드가 물리 세계의 영향을 받아 화면 내부를 자유롭게 떠다니도록 구현합니다.

```javascript
// Vue Component (Options API)
export default {
  data() { return { engine: null, render: null }; },
  mounted() {
    this.initPhysics();
  },
  methods: {
    initPhysics() {
      // Matter.js 엔진 초기화 및 DOM 요소 매핑
      // 중력값(gravity.y)을 -0.1로 설정하여 부양 효과 구현
    }
  }
}
```

---

## 4. 디자인 전략 (UI/UX)

* **배경**: Deep Dark Navy (#050A15)
* **카드 디자인**: Glassmorphism (배경 흐림 효과 + 반투명 테두리)
* **애니메이션**: 
    * 스크롤 시 각 팀별 섹션이 부드럽게 페이드인 (Framer Motion 스타일).
    * 차트 데이터 로딩 시 Skeleton 뷰 제공.

---

## 5. 배포 전략 (DevOps)

1.  **Dockerize**: 프론트(Nginx 서빙)와 백엔드(Koa)를 각각 컨테이너화.
2.  **Reverse Proxy**: Nginx를 사용하여 `/api` 요청은 Koa로, 그 외는 Quasar 빌드 파일로 라우팅.
3.  **Monitoring**: Ubuntu 서버 내에서 `pm2` 또는 Docker 로그를 통해 서비스 상태 감시.
