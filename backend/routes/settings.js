'use strict';
const express = require('express');
const pool    = require('../config/database');
const { verifyAuth } = require('../middleware/auth');
const { ok, fail } = require('../utils/apiResponses');

const router = express.Router();
router.use(verifyAuth);

// Env-var names the frontend cares about
const KNOWN_SERVICE_KEYS = [
  'OPENAI_API_KEY',
  'PINTEREST_ACCESS_TOKEN',
  'YOUTUBE_API_KEY',
  'BUFFER_ACCESS_TOKEN',
  'GUMROAD_ACCESS_TOKEN',
  'BITLY_ACCESS_TOKEN',
];

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT preferences FROM users WHERE id=$1', [req.userId]);
    if (!rows.length) return fail(res, 'User not found', 404);
    // Return which known env-var keys are actually present in the environment
    const connected_services = KNOWN_SERVICE_KEYS.filter(k => !!process.env[k]);
    return ok(res, { preferences: rows[0].preferences, connected_services });
  } catch (err) {
    return fail(res, 'Failed to get settings', 500);
  }
});

// PUT /api/settings/preferences
router.put('/preferences', async (req, res) => {
  try {
    const { preferences } = req.body;
    if (!preferences || typeof preferences !== 'object') return fail(res, 'preferences object required');
    const { rows } = await pool.query(
      `UPDATE users SET preferences = preferences || $1::jsonb, updated_at=NOW()
       WHERE id=$2 RETURNING preferences`,
      [JSON.stringify(preferences), req.userId]
    );
    return ok(res, { preferences: rows[0].preferences });
  } catch (err) {
    return fail(res, 'Failed to update preferences', 500);
  }
});

// GET /api/settings/niches
router.get('/niches', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM niche_configs WHERE user_id=$1 ORDER BY niche_name', [req.userId]);
    return ok(res, { niches: rows });
  } catch (err) {
    return fail(res, 'Failed to get niches', 500);
  }
});

// POST /api/settings/niches
router.post('/niches', async (req, res) => {
  try {
    const { niche_name, description, target_audience, keywords, posting_frequency } = req.body;
    if (!niche_name) return fail(res, 'niche_name required');
    const { rows } = await pool.query(
      `INSERT INTO niche_configs (user_id, niche_name, description, target_audience, keywords, posting_frequency)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.userId, niche_name, description, target_audience, keywords || [], posting_frequency || 5]
    );
    return ok(res, { niche: rows[0] }, 201);
  } catch (err) {
    return fail(res, 'Failed to create niche', 500);
  }
});

// PUT /api/settings/niches/:id
router.put('/niches/:id', async (req, res) => {
  try {
    const { description, target_audience, keywords, posting_frequency, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE niche_configs
       SET description      = COALESCE($1, description),
           target_audience  = COALESCE($2, target_audience),
           keywords         = COALESCE($3, keywords),
           posting_frequency= COALESCE($4, posting_frequency),
           status           = COALESCE($5, status),
           updated_at       = NOW()
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [description, target_audience, keywords, posting_frequency, status, req.params.id, req.userId]
    );
    if (!rows.length) return fail(res, 'Niche not found', 404);
    return ok(res, { niche: rows[0] });
  } catch (err) {
    return fail(res, 'Failed to update niche', 500);
  }
});

module.exports = router;
