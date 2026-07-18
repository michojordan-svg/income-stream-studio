'use strict';
const axios = require('axios');

/**
 * Refersion affiliate network API client.
 * Docs: https://developers.refersion.com/
 */
class RefersionService {
  constructor() {
    this.apiKey  = process.env.REFERSION_API_KEY;
    this.baseURL = 'https://api.refersion.com';
  }

  _ensureKey() {
    if (!this.apiKey) throw new Error('REFERSION_API_KEY not configured');
  }

  _headers() {
    this._ensureKey();
    return { 'X-Api-Key': this.apiKey, 'Content-Type': 'application/json' };
  }

  /** Fetch all conversions since a given date */
  async getConversions(since) {
    const { data } = await axios.get(`${this.baseURL}/v2/conversions`, {
      headers: this._headers(),
      params: { start_date: since || new Date(Date.now() - 86400000 * 30).toISOString().slice(0, 10) },
    });
    return data;
  }

  /** Fetch per-affiliate metrics for a tracking ID */
  async getMetrics(trackingId) {
    const { data } = await axios.get(`${this.baseURL}/v2/affiliates/${trackingId}/metrics`, {
      headers: this._headers(),
    });
    // Normalise to our internal shape
    return (data.affiliates || []).map((a) => ({
      tracking_id:  a.affiliate_id || trackingId,
      clicks:       a.clicks       || 0,
      conversions:  a.conversions  || 0,
      revenue:      a.commission   || 0,
    }));
  }

  async getAffiliate(affiliateId) {
    const { data } = await axios.get(`${this.baseURL}/v2/affiliates/${affiliateId}`, {
      headers: this._headers(),
    });
    return data;
  }
}

module.exports = new RefersionService();
