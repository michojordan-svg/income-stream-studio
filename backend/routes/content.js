'use strict';
const express = require('express');
const pool    = require('../config/database');
const { verifyAuth } = require('../middleware/auth');
const { ok, fail, paginate } = require('../utils/apiResponses');
const openaiService = require('../services/openaiService');
const pinterestService = require('../services/pinterestService');
const bufferService    = require('../services/bufferService');

const router = express.Router();
router.use(verifyAuth);

// POST /api/content/create
router.post('/create', async (req, res) => {
  try {
    const { content_type, niche, title, description, image_url, video_url, affiliate_link, scheduled_dates, tags } = req.body;
    if (!content_type || !niche || !title) return fail(res, 'content_type, niche and title are required');

    const { rows } = await pool.query(
      `INSERT INTO content_library
         (user_id, content_type, niche, title, description, image_url, video_url, affiliate_link, status, scheduled_dates, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft',$9,$10)
       RETURNING *`,
      [req.userId, content_type, niche, title, description, image_url, video_url, affiliate_link,
       scheduled_dates || [], tags || []]
    );
    return ok(res, { content: rows[0] }, 201);
  } catch (err) {
    console.error('create content:', err.message);
    return fail(res, 'Failed to create content', 500);
  }
});

// GET /api/content/list
router.get('/list', async (req, res) => {
  try {
    const { niche, status, limit = 20, offset = 0 } = req.query;
    const params = [req.userId];
    let where = 'WHERE user_id = $1';
    if (niche)  { params.push(niche);  where += ` AND niche = $${params.length}`; }
    if (status) { params.push(status); where += ` AND status = $${params.length}`; }

    const [dataRes, countRes] = await Promise.all([
      pool.query(`SELECT * FROM content_library ${where} ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
        [...params, limit, offset]),
      pool.query(`SELECT COUNT(*) FROM content_library ${where}`, params),
    ]);
    return paginate(res, dataRes.rows, parseInt(countRes.rows[0].count), limit, offset);
  } catch (err) {
    console.error('list content:', err.message);
    return fail(res, 'Failed to list content', 500);
  }
});

// GET /api/content/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM content_library WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!rows.length) return fail(res, 'Content not found', 404);
    return ok(res, { content: rows[0] });
  } catch (err) {
    return fail(res, 'Failed to get content', 500);
  }
});

// PUT /api/content/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description, image_url, video_url, affiliate_link, status, tags } = req.body;
    const { rows } = await pool.query(
      `UPDATE content_library
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           video_url = COALESCE($4, video_url),
           affiliate_link = COALESCE($5, affiliate_link),
           status = COALESCE($6, status),
           tags = COALESCE($7, tags)
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [title, description, image_url, video_url, affiliate_link, status, tags, req.params.id, req.userId]
    );
    if (!rows.length) return fail(res, 'Content not found', 404);
    return ok(res, { content: rows[0] });
  } catch (err) {
    return fail(res, 'Failed to update content', 500);
  }
});

// DELETE /api/content/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM content_library WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!rowCount) return fail(res, 'Content not found', 404);
    return ok(res, { message: 'Content deleted' });
  } catch (err) {
    return fail(res, 'Failed to delete content', 500);
  }
});

// POST /api/content/generate-copy
router.post('/generate-copy', async (req, res) => {
  try {
    const { product_name, niche, tone = 'casual', num_variations = 5 } = req.body;
    if (!product_name || !niche) return fail(res, 'product_name and niche are required');

    const prompt = `Write ${num_variations} unique Pinterest pin descriptions for a ${niche} product: "${product_name}".
Requirements:
- Tone: ${tone}
- Length: 30-50 words each
- Include action-oriented language
- Hook grabs attention in first 5 words
- Include relevant keywords for "${niche}"
- End with call-to-action
- Each description must be DIFFERENT and unique
Format: Return ONLY a JSON array of strings: ["description1", "description2", ...]`;

    const raw = await openaiService.generateText(prompt);
    let descriptions;
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      descriptions = JSON.parse(match ? match[0] : raw);
    } catch {
      descriptions = [raw];
    }
    return ok(res, { descriptions });
  } catch (err) {
    console.error('generate-copy:', err.message);
    return fail(res, 'Failed to generate copy', 500);
  }
});

// POST /api/content/schedule
router.post('/schedule', async (req, res) => {
  try {
    const { content_id, platforms, schedule } = req.body;
    if (!content_id || !platforms?.length || !schedule?.length)
      return fail(res, 'content_id, platforms[] and schedule[] are required');

    const { rows: contentRows } = await pool.query(
      'SELECT * FROM content_library WHERE id = $1 AND user_id = $2', [content_id, req.userId]);
    if (!contentRows.length) return fail(res, 'Content not found', 404);

    const scheduledPosts = [];
    for (const platform of platforms) {
      for (const { date, time } of schedule) {
        const scheduledTime = new Date(`${date}T${time}:00Z`);
        const { rows } = await pool.query(
          `INSERT INTO scheduled_posts (user_id, content_id, platform, scheduled_time, execution_status)
           VALUES ($1,$2,$3,$4,'pending') RETURNING *`,
          [req.userId, content_id, platform, scheduledTime]
        );
        scheduledPosts.push(rows[0]);
      }
    }

    await pool.query("UPDATE content_library SET status='scheduled' WHERE id=$1", [content_id]);
    return ok(res, { scheduledPosts }, 201);
  } catch (err) {
    console.error('schedule:', err.message);
    return fail(res, 'Failed to schedule content', 500);
  }
});

// POST /api/content/publish/:id  — immediately publish to a platform
router.post('/publish/:id', async (req, res) => {
  try {
    const { platform, board_id, profile_id } = req.body;
    const { rows } = await pool.query(
      'SELECT * FROM content_library WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!rows.length) return fail(res, 'Content not found', 404);
    const content = rows[0];

    let platformResult;
    if (platform === 'pinterest') {
      platformResult = await pinterestService.createPin(board_id || 'default', content.image_url, content.description, content.affiliate_link);
    } else if (platform === 'buffer') {
      platformResult = await bufferService.schedulePost(profile_id || 'default', content.description, content.image_url, content.affiliate_link, new Date());
    }

    await pool.query("UPDATE content_library SET status='published', published_at=NOW() WHERE id=$1", [req.params.id]);
    return ok(res, { message: 'Published', platformResult });
  } catch (err) {
    console.error('publish:', err.message);
    return fail(res, 'Failed to publish', 500);
  }
});

module.exports = router;
