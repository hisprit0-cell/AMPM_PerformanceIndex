const pool = require('./lib/db');

async function clearUsers() {
  try {
    await pool.query('DELETE FROM users');
    console.log('✅ Users table truncated. You can now sign up as master.');
  } catch (err) {
    console.error('❌ Failed to clear users table:', err.message);
  } finally {
    process.exit();
  }
}

clearUsers();
