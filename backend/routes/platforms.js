'use strict';
const express = require('express');
const pool    = require('../config/database');
const { verifyAuth } = require('../middleware/auth');
const { ok, fail } = require('../utils/apiResponses');

const router = express.Router();
router.use(verifyAuth);

// GET /api/platforms/connections
router.get('/connections', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, platform_name, account_id, account_name, connection_status, connected_at, last_refreshed
       FROM platform_connections WHERE user_id=$1 ORDER BY platform_name`,
      [req.userId]
    );
    return ok(res, { connections: rows });
  } catch (err) {
    return fail(res, 'Failed to get connections', 500);
  }
});

// POST /api/platforms/connect
router.post('/connect', async (req, res) => {
  try {
    const { platform_name, access_token, refresh_token, account_id, account_name } = req.body;
    if (!platform_name || !access_token) return fail(res, 'platform_name and access_token required');

    // Upsert — one record per user+platform
    const { rows } = await pool.query(
      `INSERT INTO platform_connections
         (user_id, platform_name, access_token, refresh_token, account_id, account_name, connection_status)
       VALUES ($1,$2,$3,$4,$5,$6,'connected')
       ON CONFLICT (user_id, platform_name)
       DO UPDATE SET access_token=EXCLUDED.access_token,
                     refresh_token=EXCLUDED.refresh_token,
                     account_id=EXCLUDED.account_id,
                     account_name=EXCLUDED.account_name,
                     connection_status='connected',
                     last_refreshed=NOW()
       RETURNING id, platform_name, account_name, connection_status`,
      [req.userId, platform_name, access_token, refresh_token, account_id, account_name]
    );
    return ok(res, { connection: rows[0] }, 201);
  } catch (err) {
    console.error('connect platform:', err.message);
    return fail(res, 'Failed to connect platform', 500);
  }
});

// DELETE /api/platforms/connections/:platform
router.delete('/connections/:platform', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM platform_connections WHERE user_id=$1 AND platform_name=$2',
      [req.userId, req.params.platform]
    );
    if (!rowCount) return fail(res, 'Connection not found', 404);
    return ok(res, { message: 'Platform disconnected' });
  } catch (err) {
    return fail(res, 'Failed to disconnect platform', 500);
  }
});

// GET /api/platforms/scheduled-posts
router.get('/scheduled-posts', async (req, res) => {
  try {
    const { platform, status, limit = 20, offset = 0 } = req.query;
    const params = [req.userId];
    let where = 'WHERE sp.user_id=$1';
    if (platform) { params.push(platform); where += ` AND sp.platform=$${params.length}`; }
    if (status)   { params.push(status);   where += ` AND sp.execution_status=$${params.length}`; }

    const { rows } = await pool.query(
      `SELECT sp.*, cl.title, cl.content_type, cl.niche
       FROM scheduled_posts sp
       LEFT JOIN content_library cl ON sp.content_id=cl.id
       ${where} ORDER BY sp.scheduled_time ASC
       LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    );
    return ok(res, { posts: rows });
  } catch (err) {
    return fail(res, 'Failed to get scheduled posts', 500);
  }
});

module.exports = router;
