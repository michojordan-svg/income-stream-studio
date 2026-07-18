'use strict';
const cron = require('node-cron');
const pool = require('../config/database');

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ [metricsSyncJob] started');
  try {
    // Aggregate affiliate link totals into analytics_events
    const { rows: links } = await pool.query(
      "SELECT * FROM affiliate_links WHERE status='active'"
    );

    for (const link of links) {
      // Record a synthetic analytics event capturing current totals
      // In production, this would call the affiliate network's reporting API
      await pool.query(
        `INSERT INTO analytics_events (user_id, event_type, affiliate_link_id, platform, metric_value, event_date)
         VALUES ($1, 'metrics_sync', $2, $3, $4, CURRENT_DATE)
         ON CONFLICT DO NOTHING`,
        [link.user_id, link.id, link.affiliate_network || 'unknown', link.revenue]
      ).catch(() => {}); // ignore duplicate-key errors
    }

    console.log(`✅ [metricsSyncJob] done — synced ${links.length} links`);
  } catch (err) {
    console.error('❌ [metricsSyncJob] fatal:', err.message);
  }
});
