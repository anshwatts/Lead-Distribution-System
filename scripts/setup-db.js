require('dotenv').config({ path: '.env.local' });
const pool = require('../src/lib/db');

async function setup() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS providers (
        id INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        max_quota INTEGER DEFAULT 10,
        leads_received INTEGER DEFAULT 0,
        last_assigned_at TIMESTAMP DEFAULT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        service_type INTEGER REFERENCES services(id),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE leads DROP CONSTRAINT IF EXISTS unique_phone_service;
      ALTER TABLE leads ADD CONSTRAINT unique_phone_service UNIQUE (phone, service_type);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lead_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID REFERENCES leads(id),
        provider_id INTEGER REFERENCES providers(id),
        assigned_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS processed_webhooks (
        webhook_id VARCHAR(255) PRIMARY KEY,
        processed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      INSERT INTO services (id, name) VALUES 
        (1, 'Service 1'),
        (2, 'Service 2'),
        (3, 'Service 3')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO providers (id, name, max_quota, leads_received, last_assigned_at) VALUES 
        (1, 'Provider 1', 10, 0, NULL),
        (2, 'Provider 2', 10, 0, NULL),
        (3, 'Provider 3', 10, 0, NULL),
        (4, 'Provider 4', 10, 0, NULL),
        (5, 'Provider 5', 10, 0, NULL),
        (6, 'Provider 6', 10, 0, NULL),
        (7, 'Provider 7', 10, 0, NULL),
        (8, 'Provider 8', 10, 0, NULL)
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Database setup and seed completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error setting up database:', err);
  } finally {
    client.release();
    pool.end();
  }
}

setup();
