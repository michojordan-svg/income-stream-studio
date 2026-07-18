'use strict';
const pool = require('../config/database');

async function recordClick(linkId, platform) {
  await Promise.all([
    pool.query('UPDATE affiliate_links SET clicks = clicks + 1, last_click_at = NOW() WHERE id = $1', [linkId]),
    pool.query(
      `INSERT INTO analytics_events (user_id, event_type, affiliate_link_id, platform, event_date)
       SELECT user_id, 'link_clicked', $1, $2, CURRENT_DATE FROM affiliate_links WHERE id = $1`,
      [linkId, platform || null]
    ),
  ]);
}

async function recordConversion(linkId, revenue) {
  await Promise.all([
    pool.query(
      'UPDATE affiliate_links SET conversions = conversions + 1, revenue = revenue + $1 WHERE id = $2',
      [revenue, linkId]
    ),
    pool.query(
      `INSERT INTO analytics_events (user_id, event_type, affiliate_link_id, platform, metric_value, event_date)
       SELECT user_id, 'conversion', $1, affiliate_network, $2, CURRENT_DATE FROM affiliate_links WHERE id = $1`,
      [linkId, revenue]
    ),
  ]);
}

async function getTopLinks(userId, limit = 5) {
  const { rows } = await pool.query(
    `SELECT * FROM affiliate_links WHERE user_id = $1 AND status = 'active'
     ORDER BY revenue DESC LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

module.exports = { recordClick, recordConversion, getTopLinks };
