const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * 🗄️ 데이터베이스 연결 풀 생성 (Create MariaDB connection pool)
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '1234',
  database: process.env.DB_NAME || 'ampm_performance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * 🛡️ 초기 테이블 생성 (Initialize database tables)
 * @description 사용자 관리 테이블이 없는 경우 자동으로 생성 (Auto-create users table if missing)
 */
async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MariaDB connected successfully.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role ENUM('master', 'user') DEFAULT 'user',
        status ENUM('pending', 'approved', 'blocked') DEFAULT 'pending',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS metrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team ENUM('sales', 'dev', 'video', 'hr', 'acc') NOT NULL,
        category VARCHAR(50) NOT NULL,
        value DECIMAL(15,2) NOT NULL,
        month VARCHAR(7) NOT NULL, -- Format: YYYY.MM
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_team_month (team, month)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    connection.release();
    console.log('📊 Database tables initialized.');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
  }
}

initDb();

module.exports = pool;
