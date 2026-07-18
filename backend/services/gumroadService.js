'use strict';
const axios = require('axios');

class GumroadService {
  constructor() {
    this.accessToken = process.env.GUMROAD_ACCESS_TOKEN;
    this.baseURL     = 'https://api.gumroad.com/v2';
  }

  _ensureToken() {
    if (!this.accessToken) throw new Error('GUMROAD_ACCESS_TOKEN not configured');
  }

  async createProduct(name, description, priceInCents, fileUrl) {
    this._ensureToken();
    const { data } = await axios.post(`${this.baseURL}/products`, {
      name, description, price: priceInCents, product_type: 'digital', published: true,
    }, { headers: { Authorization: `Bearer ${this.accessToken}` } });
    return data;
  }

  async getProducts() {
    this._ensureToken();
    const { data } = await axios.get(`${this.baseURL}/products`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } });
    return data;
  }

  async getSales(productId) {
    this._ensureToken();
    const { data } = await axios.get(`${this.baseURL}/products/${productId}/sales`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } });
    return data;
  }
}

module.exports = new GumroadService();
