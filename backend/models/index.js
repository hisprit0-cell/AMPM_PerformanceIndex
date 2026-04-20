const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * 🗄️ Sequelize 인스턴스 생성 (MariaDB)
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'ampm_performance',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '1234',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
);

// 모델 등록
const SalesData = require('./SalesData')(sequelize);

/**
 * 🔄 DB 동기화 (테이블 자동 생성/갱신)
 */
async function syncModels() {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize: MariaDB 연결 성공');
    await sequelize.sync({ alter: true }); // 기존 테이블 구조 변경 자동 반영
    console.log('📊 Sequelize: 모델 동기화 완료 (sales_data 테이블)');
  } catch (err) {
    console.error('❌ Sequelize 동기화 실패:', err.message);
  }
}

syncModels();

module.exports = { sequelize, SalesData };
