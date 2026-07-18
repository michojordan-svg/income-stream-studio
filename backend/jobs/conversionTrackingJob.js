'use strict';
const cron = require('node-cron');
const pool = require('../config/database');

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('⏰ [conversionTrackingJob] started');
  try {
    // Calculate conversion rates for all active affiliate links
    const { rows } = await pool.query(`
      SELECT id, user_id, clicks, conversions,
             CASE WHEN clicks > 0 THEN ROUND((conversions::numeric/clicks)*100, 2) ELSE 0 END as conv_rate
      FROM affiliate_links WHERE status='active' AND clicks > 0
    `);

    // Record any links with unusually high conversion rates as events for alerting
    for (const link of rows) {
      if (parseFloat(link.conv_rate) > 10) {
        await pool.query(
          `INSERT INTO analytics_events (user_id, event_type, affiliate_link_id, metric_value, event_date)
           VALUES ($1,'high_conversion',$2,$3,CURRENT_DATE)`,
          [link.user_id, link.id, link.conv_rate]
        ).catch(() => {});
      }
    }

    console.log(`✅ [conversionTrackingJob] done — checked ${rows.length} links`);
  } catch (err) {
    console.error('❌ [conversionTrackingJob] fatal:', err.message);
  }
});
