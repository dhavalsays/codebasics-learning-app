#!/usr/bin/env node

/**
 * Database Reset Script
 * WARNING: This will drop all tables and recreate the database schema
 */

require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'codebasics_assess',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const migrationsDir = path.join(__dirname, 'migrations');
const seedsDir = path.join(__dirname, 'seeds');

async function confirmReset() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot reset database in production environment!');
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will DROP ALL TABLES and data!\nType "RESET" to confirm: ',
      (answer) => {
        rl.close();
        resolve(answer === 'RESET');
      }
    );
  });
}

async function resetDatabase() {
  // Skip confirmation in CI/test environment
  if (process.env.CI !== 'true' && process.env.NODE_ENV !== 'test') {
    const confirmed = await confirmReset();
    if (!confirmed) {
      console.log('Reset cancelled.');
      process.exit(0);
    }
  }

  const client = await pool.connect();

  try {
    console.log('\n🗑️  Dropping all tables...');

    // Drop all tables in reverse dependency order
    await client.query(`
      DROP TABLE IF EXISTS user_activity_log CASCADE;
      DROP TABLE IF EXISTS leaderboard_weekly CASCADE;
      DROP TABLE IF EXISTS user_badges CASCADE;
      DROP TABLE IF EXISTS badges CASCADE;
      DROP TABLE IF EXISTS skill_test_attempts CASCADE;
      DROP TABLE IF EXISTS skill_questions CASCADE;
      DROP TABLE IF EXISTS skill_tests CASCADE;
      DROP TABLE IF EXISTS career_test_attempts CASCADE;
      DROP TABLE IF EXISTS career_role_weights CASCADE;
      DROP TABLE IF EXISTS career_question_options CASCADE;
      DROP TABLE IF EXISTS career_questions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS _migrations CASCADE;
      DROP TABLE IF EXISTS _seeds CASCADE;
    `);

    console.log('✅ All tables dropped.\n');

    // Run migrations
    console.log('📄 Running migrations...');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`   Running: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await client.query(sql);
    }
    console.log('✅ Migrations completed.\n');

    // Run seeds
    console.log('🌱 Running seeds...');
    const seedFiles = fs.readdirSync(seedsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of seedFiles) {
      console.log(`   Running: ${file}`);
      const sql = fs.readFileSync(path.join(seedsDir, file), 'utf-8');
      await client.query(sql);
    }
    console.log('✅ Seeds completed.\n');

    console.log('🎉 Database reset successfully!');
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
