'use strict';
const axios = require('axios');

class PinterestService {
  constructor() {
    this.accessToken = process.env.PINTEREST_ACCESS_TOKEN;
    this.baseURL     = 'https://api.pinterest.com/v5';
  }

  _headers() {
    if (!this.accessToken) throw new Error('PINTEREST_ACCESS_TOKEN not configured');
    return { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' };
  }

  async createPin(boardId, imageUrl, description, link) {
    const { data } = await axios.post(`${this.baseURL}/pins`, {
      board_id: boardId,
      description,
      link,
      media_source: { source_type: 'image_url', url: imageUrl },
    }, { headers: this._headers() });
    return data;
  }

  async getBoards() {
    const { data } = await axios.get(`${this.baseURL}/boards`, { headers: this._headers() });
    return data;
  }

  async getPinAnalytics(pinId, startDate, endDate) {
    const { data } = await axios.get(
      `${this.baseURL}/pins/${pinId}/analytics`,
      { headers: this._headers(), params: { start_date: startDate, end_date: endDate, metric_types: 'IMPRESSION,OUTBOUND_CLICK,SAVE' } }
    );
    return data;
  }
}

module.exports = new PinterestService();
