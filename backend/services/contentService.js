'use strict';
const pool = require('../config/database');

async function listContent(userId, { niche, status, limit = 20, offset = 0 } = {}) {
  const params = [userId];
  let where = 'WHERE user_id = $1';
  if (niche)  { params.push(niche);  where += ` AND niche = $${params.length}`; }
  if (status) { params.push(status); where += ` AND status = $${params.length}`; }

  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT * FROM content_library ${where} ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM content_library ${where}`, params),
  ]);

  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count) };
}

async function createContent(userId, fields) {
  const { content_type, niche, title, description, image_url, video_url, affiliate_link, scheduled_dates, tags } = fields;
  const { rows } = await pool.query(
    `INSERT INTO content_library
       (user_id, content_type, niche, title, description, image_url, video_url, affiliate_link, status, scheduled_dates, tags)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft',$9,$10) RETURNING *`,
    [userId, content_type, niche, title, description, image_url, video_url,
     affiliate_link, scheduled_dates || [], tags || []]
  );
  return rows[0];
}

async function updatePerformanceMetrics(contentId, delta) {
  await pool.query(
    `UPDATE content_library
     SET performance_metrics = performance_metrics || $1::jsonb
     WHERE id = $2`,
    [JSON.stringify(delta), contentId]
  );
}

module.exports = { listContent, createContent, updatePerformanceMetrics };
