'use strict';
const { z } = require('zod');

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure it responds 400 with the first validation error message.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const msg = result.error.errors[0]?.message || 'Validation failed';
    return res.status(400).json({ success: false, error: msg });
  }
  req.body = result.data;
  next();
};

// ─── Shared schemas ─────────────────────────────────────────────────────────
const signupSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
  username: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

const contentCreateSchema = z.object({
  content_type:    z.string(),
  niche:           z.string(),
  title:           z.string().min(1),
  description:     z.string().optional(),
  image_url:       z.string().url().optional().or(z.literal('')),
  video_url:       z.string().url().optional().or(z.literal('')),
  affiliate_link:  z.string().url().optional().or(z.literal('')),
  scheduled_dates: z.array(z.string()).optional(),
  tags:            z.array(z.string()).optional(),
});

const affiliateLinkSchema = z.object({
  original_url:      z.string().url(),
  affiliate_network: z.string(),
  product_name:      z.string().min(1),
  niche:             z.string(),
  commission_rate:   z.number().min(0).max(100),
  shortener:         z.string().optional(),
});

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  contentCreateSchema,
  affiliateLinkSchema,
};
