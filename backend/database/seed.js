#!/usr/bin/env node

/**
 * Database Seed Runner
 * Executes SQL seed files in order
 */

require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'codebasics_assess',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const seedsDir = path.join(__dirname, 'seeds');

async function runSeeds() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...\n');

    // Create seeds tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _seeds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Get list of already executed seeds
    const { rows: executed } = await client.query('SELECT name FROM _seeds ORDER BY id');
    const executedSeeds = new Set(executed.map((r) => r.name));

    // Get seed files
    const files = fs.readdirSync(seedsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No seed files found.');
      return;
    }

    let seedsRun = 0;

    for (const file of files) {
      if (executedSeeds.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🌱 Running seed: ${file}`);

      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');

      try {
        await client.query(sql);
        await client.query('INSERT INTO _seeds (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✅ Seed ${file} completed successfully\n`);
        seedsRun++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Seed ${file} failed:`, error.message);
        throw error;
      }
    }

    if (seedsRun === 0) {
      console.log('\n✨ Database already seeded. No new seeds to run.');
    } else {
      console.log(`\n✨ Successfully ran ${seedsRun} seed(s).`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runSeeds()
  .then(() => {
    console.log('\n🎉 Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding process failed:', error);
    process.exit(1);
  });
