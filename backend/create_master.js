const bcrypt = require('bcryptjs');
const pool = require('./lib/db');

async function createMaster() {
  try {
    const username = 'hisprit0';
    const password = 'gn1dmpg';
    const email = 'hisprit0@gmail.com';
    const role = 'master';
    const status = 'approved';

    // Clear existing to avoid UNIQUE constraint error if it exists
    await pool.query('DELETE FROM users WHERE username = ?', [username]);

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password, email, role, status) VALUES (?, ?, ?, ?, ?)',
      [username, hashed, email, role, status]
    );
    
    console.log(`✅ Master account created successfully.`);
    console.log(`ID: ${username}`);
    console.log(`Password: ${password}`);
  } catch (err) {
    console.error('❌ Failed to create master account:', err.message);
  } finally {
    process.exit();
  }
}

// Give a short delay to let the db connection init (since lib/db.js initializes async)
setTimeout(createMaster, 1000);
