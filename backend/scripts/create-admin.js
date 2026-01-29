#!/usr/bin/env node
/**
 * Create Admin User Script
 * Usage: node scripts/create-admin.js <email> <password> <name>
 * Example: node scripts/create-admin.js admin@example.com MyPassword123 "John Admin"
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/database');

async function createAdmin(email, password, name) {
  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password> [name]');
    console.error('Example: node scripts/create-admin.js admin@example.com Admin@123 "Admin User"');
    process.exit(1);
  }

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert or update admin user
    const query = `
      INSERT INTO users (email, password_hash, name, role, is_active, total_xp, level)
      VALUES ($1, $2, $3, 'admin', true, 0, 1)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $2,
        name = COALESCE($3, users.name),
        role = 'admin',
        is_active = true
      RETURNING id, email, name, role;
    `;

    const result = await pool.query(query, [email, passwordHash, name || 'Admin User']);
    const user = result.rows[0];

    console.log('\n✅ Admin user created/updated successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  ID:       ${user.id}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Name:     ${user.name}`);
    console.log(`  Role:     ${user.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('You can now login to the admin panel with these credentials.\n');

  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Get arguments
const [,, email, password, name] = process.argv;
createAdmin(email, password, name);
