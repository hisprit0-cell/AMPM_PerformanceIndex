const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let dbPromise = open({
  filename: './database.sqlite',
  driver: sqlite3.Database
});

const pool = {
  query: async (sql, params) => {
    const db = await dbPromise;
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    if (isSelect) {
      const rows = await db.all(sql, params);
      return [rows];
    } else {
      const result = await db.run(sql, params);
      return [result];
    }
  }
};

async function initDb() {
  try {
    const db = await dbPromise;
    console.log('✅ SQLite connected successfully.');

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'pending',
        last_login DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        value DECIMAL(15,2) NOT NULL,
        month VARCHAR(7) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_team_month ON metrics (team, month);
    `);

    console.log('📊 Database tables initialized.');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
  }
}

initDb();

module.exports = pool;
