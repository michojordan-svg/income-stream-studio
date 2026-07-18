'use strict';
const cron = require('node-cron');
const pool = require('../config/database');
const pinterestService = require('../services/pinterestService');
const bufferService    = require('../services/bufferService');

// Run every day at 06:00 UTC
cron.schedule('0 6 * * *', async () => {
  console.log('⏰ [dailyPostingJob] started');
  try {
    const { rows: posts } = await pool.query(`
      SELECT sp.*, cl.title, cl.image_url, cl.description, cl.affiliate_link
      FROM scheduled_posts sp
      JOIN content_library cl ON sp.content_id = cl.id
      WHERE DATE(sp.scheduled_time) = CURRENT_DATE
        AND sp.execution_status = 'pending'
        AND sp.retry_count < 3
    `);

    for (const post of posts) {
      try {
        await pool.query(
          "UPDATE scheduled_posts SET execution_status='processing' WHERE id=$1", [post.id]);

        if (post.platform === 'pinterest') {
          await pinterestService.createPin('default', post.image_url, post.description, post.affiliate_link);
        } else if (post.platform === 'buffer') {
          await bufferService.schedulePost('default', post.description, post.image_url, post.affiliate_link, post.scheduled_time);
        }

        await pool.query(
          "UPDATE scheduled_posts SET execution_status='success', executed_at=NOW() WHERE id=$1", [post.id]);
        console.log(`✅ Posted: ${post.title} → ${post.platform}`);
      } catch (err) {
        console.error(`❌ Failed post ${post.id}:`, err.message);
        await pool.query(
          `UPDATE scheduled_posts SET execution_status='failed', error_message=$1,
           retry_count=retry_count+1 WHERE id=$2`,
          [err.message, post.id]
        );
      }
    }
    console.log(`✅ [dailyPostingJob] done — processed ${posts.length} posts`);
  } catch (err) {
    console.error('❌ [dailyPostingJob] fatal:', err.message);
  }
});
