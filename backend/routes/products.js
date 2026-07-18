'use strict';
const express = require('express');
const pool    = require('../config/database');
const { verifyAuth } = require('../middleware/auth');
const { ok, fail, paginate } = require('../utils/apiResponses');
const gumroadService = require('../services/gumroadService');

const router = express.Router();
router.use(verifyAuth);

// POST /api/products/create
router.post('/create', async (req, res) => {
  try {
    const { name, description, price, niche, product_type, file_url, thumbnail_url, publish_to_gumroad } = req.body;
    if (!name || !price || !niche) return fail(res, 'name, price and niche are required');

    let gumroad_product_id = null, gumroad_url = null;
    if (publish_to_gumroad) {
      try {
        const gr = await gumroadService.createProduct(name, description, Math.round(price * 100), file_url);
        gumroad_product_id = gr.product?.id;
        gumroad_url        = gr.product?.short_url;
      } catch (e) {
        console.warn('Gumroad publish skipped:', e.message);
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO digital_products
         (user_id, name, description, price, niche, product_type,
          gumroad_product_id, gumroad_url, file_url, thumbnail_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'draft') RETURNING *`,
      [req.userId, name, description, price, niche, product_type,
       gumroad_product_id, gumroad_url, file_url, thumbnail_url]
    );
    return ok(res, { product: rows[0] }, 201);
  } catch (err) {
    console.error('create product:', err.message);
    return fail(res, 'Failed to create product', 500);
  }
});

// GET /api/products/list
router.get('/list', async (req, res) => {
  try {
    const { niche, status, limit = 20, offset = 0 } = req.query;
    const params = [req.userId];
    let where = 'WHERE user_id=$1';
    if (niche)  { params.push(niche);  where += ` AND niche=$${params.length}`; }
    if (status) { params.push(status); where += ` AND status=$${params.length}`; }

    const [dataRes, countRes] = await Promise.all([
      pool.query(`SELECT * FROM digital_products ${where} ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
        [...params, limit, offset]),
      pool.query(`SELECT COUNT(*) FROM digital_products ${where}`, params),
    ]);
    return paginate(res, dataRes.rows, parseInt(countRes.rows[0].count), limit, offset);
  } catch (err) {
    return fail(res, 'Failed to list products', 500);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM digital_products WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    if (!rows.length) return fail(res, 'Product not found', 404);
    return ok(res, { product: rows[0] });
  } catch (err) {
    return fail(res, 'Failed to get product', 500);
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, status, thumbnail_url } = req.body;
    const { rows } = await pool.query(
      `UPDATE digital_products
       SET name          = COALESCE($1, name),
           description   = COALESCE($2, description),
           price         = COALESCE($3, price),
           status        = COALESCE($4, status),
           thumbnail_url = COALESCE($5, thumbnail_url),
           updated_at    = NOW()
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [name, description, price, status, thumbnail_url, req.params.id, req.userId]
    );
    if (!rows.length) return fail(res, 'Product not found', 404);
    return ok(res, { product: rows[0] });
  } catch (err) {
    return fail(res, 'Failed to update product', 500);
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM digital_products WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    if (!rowCount) return fail(res, 'Product not found', 404);
    return ok(res, { message: 'Product deleted' });
  } catch (err) {
    return fail(res, 'Failed to delete product', 500);
  }
});

// GET /api/products/:id/sales — fetch from Gumroad
router.get('/:id/sales', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT gumroad_product_id FROM digital_products WHERE id=$1 AND user_id=$2',
      [req.params.id, req.userId]
    );
    if (!rows.length) return fail(res, 'Product not found', 404);
    if (!rows[0].gumroad_product_id) return fail(res, 'Product not on Gumroad', 400);

    const sales = await gumroadService.getSales(rows[0].gumroad_product_id);
    return ok(res, { sales });
  } catch (err) {
    console.error('product sales:', err.message);
    return fail(res, 'Failed to fetch sales', 500);
  }
});

module.exports = router;
