'use strict';

/**
 * Build a parameterised WHERE clause from an object of optional filters.
 * Only includes keys where the value is not undefined/null.
 * Returns { clause, params, nextIdx }
 */
const buildWhereFilters = (baseParams, filters) => {
  const params = [...baseParams];
  const clauses = [];
  for (const [col, val] of Object.entries(filters)) {
    if (val !== undefined && val !== null) {
      params.push(val);
      clauses.push(`${col} = $${params.length}`);
    }
  }
  return { clause: clauses.length ? 'AND ' + clauses.join(' AND ') : '', params };
};

const daysAgoDate = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const parseDateRange = (range = '30days') => {
  const map = { '7days': 7, '30days': 30, '90days': 90 };
  return daysAgoDate(map[range] || 30);
};

module.exports = { buildWhereFilters, daysAgoDate, parseDateRange };
