const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function fixCharset() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'gn1dmpg',
    database: process.env.DB_NAME || 'ampm_performance'
  });

  try {
    console.log('Changing charset for sales_data table...');
    await connection.query('ALTER TABLE sales_data CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    console.log('Charset update complete.');
  } catch (err) {
    console.error('Error fixing charset:', err.message);
  } finally {
    await connection.end();
  }
}

fixCharset();
