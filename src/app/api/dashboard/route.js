import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const providersResult = await pool.query(`SELECT * FROM providers ORDER BY id ASC`);
    const assignmentsResult = await pool.query(`
      SELECT la.provider_id, l.* 
      FROM lead_assignments la
      JOIN leads l ON la.lead_id = l.id
    `);

    const providers = providersResult.rows.map(p => {
      const assignedLeads = assignmentsResult.rows.filter(a => a.provider_id === p.id);
      return {
        ...p,
        remaining_quota: p.max_quota - p.leads_received,
        leads: assignedLeads
      };
    });

    return NextResponse.json(providers);
  } catch (err) {
    console.error('Error fetching dashboard:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
