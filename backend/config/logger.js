'use strict';

const log = (level, message, meta) => {
  const entry = { level, timestamp: new Date().toISOString(), message, ...(meta || {}) };
  if (level === 'error') console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
};

module.exports = {
  info:  (msg, meta) => log('info',  msg, meta),
  warn:  (msg, meta) => log('warn',  msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => { if (process.env.LOG_LEVEL === 'debug') log('debug', msg, meta); },
};
