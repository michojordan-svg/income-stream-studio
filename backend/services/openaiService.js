'use strict';
const axios = require('axios');

class OpenAIService {
  constructor() {
    this.apiKey  = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  _ensureKey() {
    if (!this.apiKey) throw new Error('OPENAI_API_KEY not configured');
  }

  async generateText(prompt, { model = 'gpt-4o-mini', maxTokens = 800, temperature = 0.7 } = {}) {
    this._ensureKey();
    const { data } = await axios.post(`${this.baseURL}/chat/completions`, {
      model,
      messages: [
        { role: 'system', content: 'You are an expert content creator specialising in affiliate marketing and passive income.' },
        { role: 'user',   content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }, { headers: { Authorization: `Bearer ${this.apiKey}` } });
    return data.choices[0].message.content;
  }

  async generateContentIdeas(niche, count = 10) {
    const prompt = `Generate ${count} viral Pinterest pin ideas for the "${niche}" niche. 
Each idea should include a hook title and one-line description.
Return as JSON array: [{"title":"...","description":"..."}, ...]`;
    const raw = await this.generateText(prompt);
    const match = raw.match(/\[[\s\S]*\]/);
    return JSON.parse(match ? match[0] : '[]');
  }
}

module.exports = new OpenAIService();
