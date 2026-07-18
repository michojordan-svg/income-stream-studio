'use strict';
const axios = require('axios');

class BufferService {
  constructor() {
    this.accessToken = process.env.BUFFER_ACCESS_TOKEN;
    this.baseURL     = 'https://api.bufferapp.com/1';
  }

  _ensureToken() {
    if (!this.accessToken) throw new Error('BUFFER_ACCESS_TOKEN not configured');
  }

  async getProfiles() {
    this._ensureToken();
    const { data } = await axios.get(`${this.baseURL}/profiles.json`,
      { params: { access_token: this.accessToken } });
    return data;
  }

  async schedulePost(profileId, text, imageUrl, link, scheduledAt) {
    this._ensureToken();
    const { data } = await axios.post(`${this.baseURL}/updates/create.json`, null, {
      params: {
        access_token: this.accessToken,
        profile_ids:  [profileId],
        text,
        'media[link]':  link,
        'media[picture]': imageUrl,
        scheduled_at: Math.floor(new Date(scheduledAt).getTime() / 1000),
      },
    });
    return data;
  }
}

module.exports = new BufferService();
