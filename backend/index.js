const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const { koaBody } = require('koa-body');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./lib/db');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const { SalesData } = require('./models');

const app = new Koa();
const router = new Router();

// Middleware (Enable multipart for file uploads)
app.use(cors());
app.use(koaBody({ multipart: true, formidable: { maxFileSize: 10 * 1024 * 1024 } })); // 10MB limit

/**
 * 📝 공통 유틸리티: 에러 처리 (Error handler)
 */
const throwError = (ctx, status, msg) => { ctx.status = status; ctx.body = { error: msg }; };

// --- 👤 인증 관련 라우트 (Authentication Routes) ---

/**
 * @route POST /api/auth/register
 * @description 회원 가입 신청 (Registration request, status defaults to 'pending')
 */
router.post('/api/auth/register', async (ctx) => {
  const { username, password, email } = ctx.request.body;
  if (!username || !password) return throwError(ctx, 400, 'Invalid fields');

  try {
    const hashed = await bcrypt.hash(password, 10);
    // 첫 등록 계정인 경우 Master 권한 부여 (First user becomes Master)
    const [counts] = await db.query('SELECT COUNT(*) as count FROM users');
    const role = counts[0].count === 0 ? 'master' : 'user';
    const status = counts[0].count === 0 ? 'approved' : 'pending';

    await db.query(
      'INSERT INTO users (username, password, email, role, status) VALUES (?, ?, ?, ?, ?)',
      [username, hashed, email, role, status]
    );
    ctx.body = { success: true, message: 'Registration submitted for approval' };
  } catch (err) {
    throwError(ctx, 400, 'Username already exists or DB error');
  }
});

/**
 * @route POST /api/auth/login
 * @description 로그인 처리 (Check credentials and approval status)
 */
router.post('/api/auth/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return throwError(ctx, 401, 'Invalid credentials');
  }
  if (user.status !== 'approved') {
    return throwError(ctx, 403, 'Account pending approval or blocked');
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  ctx.body = { success: true, token, user: { username: user.username, role: user.role } };
});

// --- 👑 관리자 관련 라우트 (Admin Management Routes) ---

/**
 * @route GET /api/admin/users
 * @description 모든 사용자 목록 조회 (Master only: Filter/List users)
 */
router.get('/api/admin/users', authMiddleware, adminMiddleware, async (ctx) => {
  const [rows] = await db.query('SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC');
  ctx.body = { users: rows };
});

/**
 * @route PATCH /api/admin/users/:id
 * @description 사용자 상태 변경 (Master only: Approve/Block/Promote)
 */
router.patch('/api/admin/users/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const { status, role } = ctx.request.body;
  
  const updateFields = []; const values = [];
  if (status) { updateFields.push('status = ?'); values.push(status); }
  if (role) { updateFields.push('role = ?'); values.push(role); }
  
  if (updateFields.length === 0) return throwError(ctx, 400, 'No fields to update');
  values.push(id);
  
  await db.query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, values);
  ctx.body = { success: true };
});

/**
 * @route DELETE /api/admin/users/:id
 * @description 사용자 삭제 (Master only)
 */
router.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params;
  await db.query('DELETE FROM users WHERE id = ? AND role != "master"', [id]);
  ctx.body = { success: true };
});

/**
 * @route POST /api/admin/data/upload
 * @description 엑셀 성과 데이터 업로드 및 파싱 (Master only: Parse Excel and update database)
 */
router.post('/api/admin/data/upload', authMiddleware, adminMiddleware, async (ctx) => {
  const file = ctx.request.files?.file;
  if (!file) return throwError(ctx, 400, 'No file uploaded');

  try {
    const reader = require('xlsx');
    const workbook = reader.readFile(file.filepath);
    const sheetName = workbook.SheetNames[0];
    const data = reader.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // 📥 데이터베이스 트랜잭션 처리 또는 일괄 삽입 로직 (Simple batch insert logic)
    for (const row of data) {
      const { team, category, value, month } = row;
      if (team && category && value && month) {
        await db.query(
          'INSERT INTO metrics (team, category, value, month) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
          [team, category, value, month]
        );
      }
    }
    ctx.body = { success: true, count: data.length };
  } catch (err) {
    throwError(ctx, 500, 'Excel parsing failed: ' + err.message);
  }
});
router.get('/api/metrics', async (ctx) => {
  ctx.body = { success: true, data: [] }; // Placeholder for actual data fetch
});

// --- 📊 영업팀 데이터 API (Sales Data Routes) ---

/**
 * @route POST /api/sales/upload
 * @description 영업팀 실적 데이터 일괄 업로드 (UPSERT: 동일 기간+본부+팀이면 덮어쓰기)
 */
router.post('/api/sales/upload', async (ctx) => {
  const { data } = ctx.request.body;
  if (!data || !Array.isArray(data) || data.length === 0) {
    return throwError(ctx, 400, 'data 배열이 필요합니다.');
  }

  try {
    let upsertCount = 0;
    for (const row of data) {
      const { month, division, team, name, revenue, headcount } = row;
      if (month && division && team) {
        await SalesData.upsert({
          month: String(month).trim(),
          division: String(division).trim(),
          team: String(team).trim(),
          name: name ? String(name).trim() : null,
          revenue: Number(revenue) || 0,
          headcount: Number(headcount) || 0
        });
        upsertCount++;
      }
    }
    ctx.body = { success: true, message: `${upsertCount}건 저장 완료`, count: upsertCount };
  } catch (err) {
    throwError(ctx, 500, 'DB 저장 실패: ' + err.message);
  }
});

/**
 * @route GET /api/sales/data
 * @description 최근 2년간 영업팀 실적 데이터 조회 (24개월 롤링 윈도우)
 */
router.get('/api/sales/data', async (ctx) => {
  try {
    // 최근 2년 = 24개월 전 월 계산
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), 1);
    const yy = String(twoYearsAgo.getFullYear()).slice(2);
    const mm = String(twoYearsAgo.getMonth() + 1).padStart(2, '0');
    const cutoff = `${yy}.${mm}`; // 예: "24.04"

    const rows = await SalesData.findAll({
      where: {
        month: { [require('sequelize').Op.gte]: cutoff }
      },
      order: [['month', 'ASC'], ['division', 'ASC'], ['team', 'ASC']],
      raw: true
    });

    ctx.body = {
      success: true,
      data: rows.map(r => ({
        month: r.month,
        division: r.division,
        team: r.team,
        name: r.name,
        revenue: Number(r.revenue),
        headcount: Number(r.headcount)
      }))
    };
  } catch (err) {
    throwError(ctx, 500, '데이터 조회 실패: ' + err.message);
  }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
