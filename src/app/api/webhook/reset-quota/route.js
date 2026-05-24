import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { webhookId, providerId } = body;
    
    if (!webhookId || !providerId) {
      return NextResponse.json({ error: 'Missing webhookId or providerId' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      try {
        await client.query(
          `INSERT INTO processed_webhooks (webhook_id) VALUES ($1)`,
          [webhookId]
        );
      } catch (err) {
        if (err.code === '23505') {
          await client.query('ROLLBACK');
          return NextResponse.json({ status: 'Webhook already processed successfully' }, { status: 200 });
        }
        throw err;
      }

      await client.query(
        `UPDATE providers SET leads_received = 0 WHERE id = $1`,
        [providerId]
      );

      await client.query('COMMIT');
      return NextResponse.json({ status: 'Quota reset successfully' }, { status: 200 });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
