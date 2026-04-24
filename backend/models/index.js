const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * 🗄️ Sequelize 인스턴스 생성 (MariaDB)
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

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
