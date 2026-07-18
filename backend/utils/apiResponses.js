'use strict';

const ok = (res, data, status = 200) => res.status(status).json({ success: true, ...data });

const fail = (res, message, status = 400) => res.status(status).json({ success: false, error: message });

const paginate = (res, rows, total, limit, offset) =>
  res.json({ success: true, data: rows, total, limit: parseInt(limit), offset: parseInt(offset) });

module.exports = { ok, fail, paginate };
