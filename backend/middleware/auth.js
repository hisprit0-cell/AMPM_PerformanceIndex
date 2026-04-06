const jwt = require('jsonwebtoken');

/**
 * 🔒 인증 미들웨어 (Authentication Middleware)
 * @description JWT 토큰을 검증하여 유효한 사용자인지 확인 (Checking valid JWT token)
 */
const authMiddleware = async (ctx, next) => {
  const token = ctx.headers.authorization?.split(' ')[1];
  if (!token) {
    ctx.status = 401; ctx.body = { error: 'No token provided' }; return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    ctx.state.user = decoded;
    await next();
  } catch (err) {
    ctx.status = 401; ctx.body = { error: 'Invalid token' };
  }
};

/**
 * 👑 관리자 권한 확인 미들웨어 (Admin Authorization Middleware)
 * @description Master 계정인 경우에만 접근 허용 (Checking role: master)
 */
const adminMiddleware = async (ctx, next) => {
  if (ctx.state.user?.role !== 'master') {
    ctx.status = 403; ctx.body = { error: 'Admin only' }; return;
  }
  await next();
};

module.exports = { authMiddleware, adminMiddleware };
