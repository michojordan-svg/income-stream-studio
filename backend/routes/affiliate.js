'use strict';
const express = require('express');
const pool    = require('../config/database');
const { verifyAuth } = require('../middleware/auth');
const { ok, fail, paginate } = require('../utils/apiResponses');
const bitlyService = require('../services/bitlyService');

const router = express.Router();
router.use(verifyAuth);

// POST /api/affiliate/create-link
router.post('/create-link', async (req, res) => {
  try {
    const { original_url, affiliate_network, product_name, niche, commission_rate, shortener } = req.body;
    if (!original_url || !product_name || !niche) return fail(res, 'original_url, product_name and niche required');

    const shortened = await bitlyService.shortenUrl(original_url);

    const { rows } = await pool.query(
      `INSERT INTO affiliate_links
         (user_id, original_url, shortened_url, shortener_service, niche, product_name,
          affiliate_network, commission_rate, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active') RETURNING *`,
      [req.userId, original_url, shortened.shortUrl, shortener || 'bitly',
       niche, product_name, affiliate_network, commission_rate || 0]
    );
    return ok(res, { link: rows[0] }, 201);
  } catch (err) {
    console.error('create-link:', err.message);
    return fail(res, 'Failed to create affiliate link', 500);
  }
});

// GET /api/affiliate/links
router.get('/links', async (req, res) => {
  try {
    const { niche, limit = 20, offset = 0 } = req.query;
    const ALLOWED_SORT = ['created_at', 'clicks', 'revenue', 'conversions'];
    const sort_by = ALLOWED_SORT.includes(req.query.sort_by) ? req.query.sort_by : 'created_at';

    const params = [req.userId];
    let where = 'WHERE user_id = $1';
    if (niche) { params.push(niche); where += ` AND niche = $${params.length}`; }

    const [dataRes, summaryRes] = await Promise.all([
      pool.query(`SELECT * FROM affiliate_links ${where} ORDER BY ${sort_by} DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
        [...params, limit, offset]),
      pool.query(
        `SELECT COUNT(*) as total_links, COALESCE(SUM(clicks),0) as total_clicks,
                COALESCE(SUM(conversions),0) as total_conversions,
                COALESCE(SUM(revenue),0) as total_revenue
         FROM affiliate_links WHERE user_id=$1`, [req.userId]),
    ]);

    return ok(res, { links: dataRes.rows, summary: summaryRes.rows[0] });
  } catch (err) {
    console.error('list links:', err.message);
    return fail(res, 'Failed to list affiliate links', 500);
  }
});

// GET /api/affiliate/links/:linkId
router.get('/links/:linkId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM affiliate_links WHERE id=$1 AND user_id=$2', [req.params.linkId, req.userId]);
    if (!rows.length) return fail(res, 'Link not found', 404);
    return ok(res, { link: rows[0] });
  } catch (err) {
    return fail(res, 'Failed to get link', 500);
  }
});

// PUT /api/affiliate/links/:linkId
router.put('/links/:linkId', async (req, res) => {
  try {
    const { product_name, niche, commission_rate, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE affiliate_links
       SET product_name    = COALESCE($1, product_name),
           niche           = COALESCE($2, niche),
           commission_rate = COALESCE($3, commission_rate),
           status          = COALESCE($4, status)
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [product_name, niche, commission_rate, status, req.params.linkId, req.userId]
    );
    if (!rows.length) return fail(res, 'Link not found', 404);
    return ok(res, { link: rows[0] });
  } catch (err) {
    return fail(res, 'Failed to update link', 500);
  }
});

// DELETE /api/affiliate/links/:linkId
router.delete('/links/:linkId', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM affiliate_links WHERE id=$1 AND user_id=$2', [req.params.linkId, req.userId]);
    if (!rowCount) return fail(res, 'Link not found', 404);
    return ok(res, { message: 'Link deleted' });
  } catch (err) {
    return fail(res, 'Failed to delete link', 500);
  }
});

// POST /api/affiliate/links/:linkId/click  — record a click
router.post('/links/:linkId/click', async (req, res) => {
  try {
    await Promise.all([
      pool.query('UPDATE affiliate_links SET clicks=clicks+1, last_click_at=NOW() WHERE id=$1', [req.params.linkId]),
      pool.query(
        `INSERT INTO analytics_events (user_id, event_type, affiliate_link_id, platform, event_date)
         VALUES ($1,'link_clicked',$2,$3,CURRENT_DATE)`,
        [req.userId, req.params.linkId, req.body.platform || null]
      ),
    ]);
    return ok(res, { message: 'Click recorded' });
  } catch (err) {
    return fail(res, 'Failed to record click', 500);
  }
});

module.exports = router;
