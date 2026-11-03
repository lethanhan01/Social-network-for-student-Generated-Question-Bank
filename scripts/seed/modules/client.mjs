/**
 * HTTP Client tiện ích cho Seeder Script kết nối Spring Boot Backend
 */

import { CONFIG } from '../config.mjs';

export class HttpClient {
  constructor(baseUrl = CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Device-Id': CONFIG.DEVICE_ID,
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    };

    const fetchConfig = {
      method: options.method || 'GET',
      headers,
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    };

    try {
      const response = await fetch(url, fetchConfig);
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      return {
        ok: response.ok,
        status: response.status,
        data: isJson ? data.data : data,
        raw: data
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        error: err.message,
        data: null
      };
    }
  }

  get(endpoint, token, options = {}) {
    return this.request(endpoint, { method: 'GET', token, ...options });
  }

  post(endpoint, body, token, options = {}) {
    return this.request(endpoint, { method: 'POST', body, token, ...options });
  }

  put(endpoint, body, token, options = {}) {
    return this.request(endpoint, { method: 'PUT', body, token, ...options });
  }

  patch(endpoint, body, token, options = {}) {
    return this.request(endpoint, { method: 'PATCH', body, token, ...options });
  }

  delete(endpoint, token, options = {}) {
    return this.request(endpoint, { method: 'DELETE', token, ...options });
  }
}

export const httpClient = new HttpClient();

