'use strict';
const axios = require('axios');

class BitlyService {
  constructor() {
    this.accessToken = process.env.BITLY_ACCESS_TOKEN;
    this.baseURL     = 'https://api-ssl.bitly.com/v4';
  }

  async shortenUrl(longUrl) {
    // If no token, return a passthrough "shortened" URL so the rest of the system works
    if (!this.accessToken) {
      console.warn('BITLY_ACCESS_TOKEN not set — returning original URL as shortened URL');
      return { shortUrl: longUrl, originalUrl: longUrl };
    }
    const { data } = await axios.post(`${this.baseURL}/shorten`,
      { long_url: longUrl },
      { headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' } }
    );
    return { shortUrl: data.link, originalUrl: longUrl, id: data.id };
  }

  async getLinkStats(bitlyId) {
    if (!this.accessToken) throw new Error('BITLY_ACCESS_TOKEN not configured');
    const { data } = await axios.get(`${this.baseURL}/bitlinks/${bitlyId}/clicks/summary`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } });
    return data;
  }
}

module.exports = new BitlyService();
