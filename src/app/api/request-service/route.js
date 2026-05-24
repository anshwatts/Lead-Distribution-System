import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, city, serviceType, description } = body;

    if (!/^\d+$/.test(phone)) {
      return NextResponse.json({ error: 'Phone number must contain only numeric digits.' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      let leadId;
      try {
        const leadResult = await client.query(
          `INSERT INTO leads (name, phone, city, service_type, description) 
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [name, phone, city, serviceType, description]
        );
        leadId = leadResult.rows[0].id;
      } catch (err) {
        if (err.code === '23505') {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: 'Duplicate lead for this service type already exists.' }, { status: 400 });
        }
        throw err;
      }

      let mandatoryProviders = [];
      let poolProviders = [];

      const serviceId = parseInt(serviceType, 10);

      if (serviceId === 1) {
        mandatoryProviders = [1];
        poolProviders = [2, 3, 4];
      } else if (serviceId === 2) {
        mandatoryProviders = [5];
        poolProviders = [6, 7, 8];
      } else if (serviceId === 3) {
        mandatoryProviders = [1, 4];
        poolProviders = [2, 3, 5, 6, 7, 8];
      }

      const allCandidateIds = [...mandatoryProviders, ...poolProviders];

      const providersResult = await client.query(
        `SELECT * FROM providers WHERE id = ANY($1) AND leads_received < max_quota ORDER BY id ASC FOR UPDATE`,
        [allCandidateIds]
      );

      const availableProviders = providersResult.rows;

      const selectedProviders = [];
      const availableMandatory = availableProviders.filter(p => mandatoryProviders.includes(p.id));
      selectedProviders.push(...availableMandatory);

      const availablePool = availableProviders.filter(p => poolProviders.includes(p.id));
      availablePool.sort((a, b) => {
        if (a.leads_received !== b.leads_received) {
          return a.leads_received - b.leads_received;
        }
        const timeA = a.last_assigned_at ? new Date(a.last_assigned_at).getTime() : 0;
        const timeB = b.last_assigned_at ? new Date(b.last_assigned_at).getTime() : 0;
        return timeA - timeB;
      });

      const neededFromPool = 3 - selectedProviders.length;
      if (neededFromPool > 0) {
        selectedProviders.push(...availablePool.slice(0, neededFromPool));
      }

      if (selectedProviders.length < 3) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Not enough available providers to take this lead (requires exactly 3).' }, { status: 400 });
      }

      for (const provider of selectedProviders) {
        await client.query(
          `UPDATE providers SET leads_received = leads_received + 1, last_assigned_at = NOW() WHERE id = $1`,
          [provider.id]
        );
        await client.query(
          `INSERT INTO lead_assignments (lead_id, provider_id) VALUES ($1, $2)`,
          [leadId, provider.id]
        );
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true, leadId, assignedTo: selectedProviders.map(p => p.id) });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error processing request-service:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
