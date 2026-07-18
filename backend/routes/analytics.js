'use strict';
const express = require('express');
const pool    = require('../config/database');
const { verifyAuth } = require('../middleware/auth');
const { ok, fail } = require('../utils/apiResponses');
const { parseDateRange } = require('../utils/helpers');

const router = express.Router();
router.use(verifyAuth);

// GET /api/analytics/dashboard?date_range=30days
router.get('/dashboard', async (req, res) => {
  try {
    const startDate = parseDateRange(req.query.date_range);

    const [revenueRes, nicheRes, platformRes, topRes, trendsRes] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(metric_value),0) as total_revenue,
                COUNT(*) FILTER (WHERE event_type='link_clicked') as total_clicks,
                COUNT(*) FILTER (WHERE event_type='conversion') as total_conversions
         FROM analytics_events WHERE user_id=$1 AND created_at>=$2`,
        [req.userId, startDate]
      ),
      pool.query(
        `SELECT cl.niche,
                COALESCE(SUM(ae.metric_value),0) as revenue,
                COUNT(*) FILTER (WHERE ae.event_type='link_clicked') as clicks,
                COUNT(*) FILTER (WHERE ae.event_type='conversion') as conversions
         FROM analytics_events ae
         LEFT JOIN content_library cl ON ae.content_id=cl.id
         WHERE ae.user_id=$1 AND ae.created_at>=$2
         GROUP BY cl.niche ORDER BY revenue DESC`,
        [req.userId, startDate]
      ),
      pool.query(
        `SELECT platform,
                COALESCE(SUM(metric_value),0) as revenue,
                COUNT(*) FILTER (WHERE event_type='link_clicked') as clicks,
                COUNT(*) FILTER (WHERE event_type='conversion') as conversions
         FROM analytics_events WHERE user_id=$1 AND created_at>=$2
         GROUP BY platform ORDER BY revenue DESC`,
        [req.userId, startDate]
      ),
      pool.query(
        `SELECT cl.id, cl.title, cl.content_type, cl.performance_metrics,
                COUNT(ae.id) as clicks,
                COUNT(ae.id) FILTER (WHERE ae.event_type='conversion') as conversions
         FROM content_library cl
         LEFT JOIN analytics_events ae ON cl.id=ae.content_id AND ae.created_at>=$2
         WHERE cl.user_id=$1
         GROUP BY cl.id ORDER BY clicks DESC LIMIT 5`,
        [req.userId, startDate]
      ),
      pool.query(
        `SELECT DATE(created_at) as date,
                COALESCE(SUM(metric_value),0) as revenue,
                COUNT(*) as events
         FROM analytics_events WHERE user_id=$1 AND created_at>=$2
         GROUP BY DATE(created_at) ORDER BY date ASC`,
        [req.userId, startDate]
      ),
    ]);

    const r = revenueRes.rows[0];
    return ok(res, {
      summary: {
        total_revenue:     parseFloat(r.total_revenue) || 0,
        total_clicks:      parseInt(r.total_clicks)    || 0,
        total_conversions: parseInt(r.total_conversions) || 0,
        conversion_rate:   r.total_clicks
          ? ((parseInt(r.total_conversions) / parseInt(r.total_clicks)) * 100).toFixed(2)
          : '0.00',
      },
      by_niche:      nicheRes.rows,
      by_platform:   platformRes.rows,
      top_performers: topRes.rows,
      trends:         trendsRes.rows,
    });
  } catch (err) {
    console.error('dashboard analytics:', err.message);
    return fail(res, 'Failed to get dashboard data', 500);
  }
});

// GET /api/analytics/niche/:niche
router.get('/niche/:niche', async (req, res) => {
  try {
    const { niche } = req.params;
    const startDate = parseDateRange(req.query.date_range);

    const [metricsRes, contentRes] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(ae.metric_value),0) as revenue,
                COUNT(*) FILTER (WHERE ae.event_type='link_clicked') as clicks,
                COUNT(*) FILTER (WHERE ae.event_type='conversion') as conversions
         FROM analytics_events ae
         LEFT JOIN content_library cl ON ae.content_id=cl.id
         WHERE ae.user_id=$1 AND cl.niche=$2 AND ae.created_at>=$3`,
        [req.userId, niche, startDate]
      ),
      pool.query(
        `SELECT cl.id, cl.title, cl.content_type, cl.created_at,
                (SELECT COUNT(*) FROM analytics_events WHERE content_id=cl.id) as views
         FROM content_library cl
         WHERE user_id=$1 AND niche=$2 ORDER BY created_at DESC`,
        [req.userId, niche]
      ),
    ]);

    return ok(res, { niche, metrics: metricsRes.rows[0], content: contentRes.rows });
  } catch (err) {
    console.error('niche analytics:', err.message);
    return fail(res, 'Failed to get niche analytics', 500);
  }
});

// POST /api/analytics/event  — track a custom event
router.post('/event', async (req, res) => {
  try {
    const { event_type, content_id, affiliate_link_id, platform, metric_value, metadata } = req.body;
    if (!event_type) return fail(res, 'event_type is required');

    const { rows } = await pool.query(
      `INSERT INTO analytics_events
         (user_id, event_type, content_id, affiliate_link_id, platform, metric_value, metadata, event_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_DATE) RETURNING *`,
      [req.userId, event_type, content_id || null, affiliate_link_id || null,
       platform || null, metric_value || 0, JSON.stringify(metadata || {})]
    );
    return ok(res, { event: rows[0] }, 201);
  } catch (err) {
    console.error('track event:', err.message);
    return fail(res, 'Failed to track event', 500);
  }
});

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const [affiliateRes, contentRes, productsRes] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(revenue),0) as affiliate_revenue,
                COALESCE(SUM(clicks),0) as affiliate_clicks,
                COALESCE(SUM(conversions),0) as affiliate_conversions
         FROM affiliate_links WHERE user_id=$1`, [req.userId]),
      pool.query(
        `SELECT COUNT(*) FILTER (WHERE status='published') as published,
                COUNT(*) FILTER (WHERE status='scheduled') as scheduled,
                COUNT(*) FILTER (WHERE status='draft') as draft
         FROM content_library WHERE user_id=$1`, [req.userId]),
      pool.query(
        `SELECT COALESCE(SUM(revenue),0) as product_revenue,
                COALESCE(SUM(sales_count),0) as product_sales
         FROM digital_products WHERE user_id=$1`, [req.userId]),
    ]);
    return ok(res, {
      affiliate: affiliateRes.rows[0],
      content:   contentRes.rows[0],
      products:  productsRes.rows[0],
    });
  } catch (err) {
    return fail(res, 'Failed to get summary', 500);
  }
});

module.exports = router;
