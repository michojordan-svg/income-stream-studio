'use strict';
const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey  = process.env.YOUTUBE_API_KEY;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
  }

  _ensureKey() {
    if (!this.apiKey) throw new Error('YOUTUBE_API_KEY not configured');
  }

  async getChannelStats(channelId) {
    this._ensureKey();
    const { data } = await axios.get(`${this.baseURL}/channels`, {
      params: { part: 'statistics,snippet', id: channelId, key: this.apiKey },
    });
    return data.items?.[0] || null;
  }

  async getVideoStats(videoId) {
    this._ensureKey();
    const { data } = await axios.get(`${this.baseURL}/videos`, {
      params: { part: 'statistics,snippet', id: videoId, key: this.apiKey },
    });
    return data.items?.[0] || null;
  }

  async searchVideos(query, maxResults = 10) {
    this._ensureKey();
    const { data } = await axios.get(`${this.baseURL}/search`, {
      params: { part: 'snippet', q: query, type: 'video', maxResults, key: this.apiKey },
    });
    return data.items || [];
  }
}

module.exports = new YouTubeService();
