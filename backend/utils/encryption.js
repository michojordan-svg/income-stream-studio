'use strict';
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

const getKey = () => {
  const raw = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'fallback-dev-key-32-chars-padded!!';
  return Buffer.from(raw.padEnd(32).slice(0, 32));
};

const encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (ciphertext) => {
  const [ivHex, tagHex, encHex] = ciphertext.split(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]).toString('utf8');
};

module.exports = { encrypt, decrypt };
