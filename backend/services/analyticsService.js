'use strict';
const pool = require('../config/database');

async function getDashboardSummary(userId, startDate) {
  const { rows } = await pool.query(
    `SELECT
       COALESCE(SUM(metric_value), 0)                                      AS total_revenue,
       COUNT(*) FILTER (WHERE event_type = 'link_clicked')                 AS total_clicks,
       COUNT(*) FILTER (WHERE event_type = 'conversion')                   AS total_conversions
     FROM analytics_events
     WHERE user_id = $1 AND created_at >= $2`,
    [userId, startDate]
  );
  return rows[0];
}

async function getDailyTrends(userId, startDate) {
  const { rows } = await pool.query(
    `SELECT DATE(created_at) AS date,
            COALESCE(SUM(metric_value), 0) AS revenue,
            COUNT(*) AS events
     FROM analytics_events
     WHERE user_id = $1 AND created_at >= $2
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [userId, startDate]
  );
  return rows;
}

async function recordEvent(userId, eventType, payload = {}) {
  const { content_id, affiliate_link_id, platform, metric_value, metadata } = payload;
  const { rows } = await pool.query(
    `INSERT INTO analytics_events
       (user_id, event_type, content_id, affiliate_link_id, platform, metric_value, metadata, event_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
     RETURNING id`,
    [userId, eventType, content_id || null, affiliate_link_id || null,
     platform || null, metric_value || 0, JSON.stringify(metadata || {})]
  );
  return rows[0];
}

module.exports = { getDashboardSummary, getDailyTrends, recordEvent };
