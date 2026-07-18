'use strict';
const cron = require('node-cron');
const pool = require('../config/database');
const openaiService = require('../services/openaiService');

// Run once daily at 08:00 UTC
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ [recommendationEngineJob] started');
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  [recommendationEngineJob] skipped — OPENAI_API_KEY not set');
      return;
    }

    // Get users with active niches
    const { rows: niches } = await pool.query(
      "SELECT DISTINCT user_id, niche FROM content_library WHERE status='published' LIMIT 50"
    );

    for (const { user_id, niche } of niches) {
      try {
        const ideas = await openaiService.generateContentIdeas(niche, 5);
        // Store as draft content pieces for the user
        for (const idea of ideas.slice(0, 3)) {
          await pool.query(
            `INSERT INTO content_library (user_id, content_type, niche, title, description, status)
             VALUES ($1,'pin',$2,$3,$4,'draft')`,
            [user_id, niche, idea.title, idea.description]
          );
        }
        console.log(`✅ Generated ${ideas.length} ideas for niche "${niche}"`);
      } catch (err) {
        console.error(`❌ Recommendation failed for niche ${niche}:`, err.message);
      }
    }
    console.log('✅ [recommendationEngineJob] done');
  } catch (err) {
    console.error('❌ [recommendationEngineJob] fatal:', err.message);
  }
});
