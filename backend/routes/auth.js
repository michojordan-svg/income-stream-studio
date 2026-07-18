'use strict';
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/database');
const { verifyAuth } = require('../middleware/auth');
const { validate, signupSchema, loginSchema } = require('../middleware/validation');
const { ok, fail } = require('../utils/apiResponses');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', validate(signupSchema), async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return fail(res, 'User already exists', 409);

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, username)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, created_at`,
      [email, hash, username || email.split('@')[0]]
    );

    const token = jwt.sign({ userId: rows[0].id, email: rows[0].email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return ok(res, { user: rows[0], token }, 201);
  } catch (err) {
    console.error('signup error:', err.message);
    return fail(res, 'Signup failed', 500);
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length) return fail(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return fail(res, 'Invalid credentials', 401);

    const token = jwt.sign({ userId: rows[0].id, email: rows[0].email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return ok(res, {
      user: { id: rows[0].id, email: rows[0].email, username: rows[0].username },
      token,
    });
  } catch (err) {
    console.error('login error:', err.message);
    return fail(res, 'Login failed', 500);
  }
});

// POST /api/auth/logout  (stateless — client discards token)
router.post('/logout', (_req, res) => ok(res, { message: 'Logged out successfully' }));

// GET /api/auth/me
router.get('/me', verifyAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, username, preferences, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (!rows.length) return fail(res, 'User not found', 404);
    return ok(res, { user: rows[0] });
  } catch (err) {
    console.error('me error:', err.message);
    return fail(res, 'Failed to fetch user', 500);
  }
});

// PUT /api/auth/me
router.put('/me', verifyAuth, async (req, res) => {
  try {
    const { username, preferences } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET username = COALESCE($1, username),
                        preferences = COALESCE($2, preferences),
                        updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, username, preferences`,
      [username, preferences ? JSON.stringify(preferences) : null, req.userId]
    );
    return ok(res, { user: rows[0] });
  } catch (err) {
    console.error('update me error:', err.message);
    return fail(res, 'Failed to update profile', 500);
  }
});

// PUT /api/auth/change-password
router.put('/change-password', verifyAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 8)
      return fail(res, 'current_password and new_password (min 8 chars) required', 400);

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return fail(res, 'Current password is incorrect', 401);

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.userId]);
    return ok(res, { message: 'Password updated' });
  } catch (err) {
    console.error('change-password error:', err.message);
    return fail(res, 'Failed to change password', 500);
  }
});

module.exports = router;
