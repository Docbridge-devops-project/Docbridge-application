const axios = require('axios');
const logger = require('../config/logger');

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://127.0.0.1:3000/api/v1';

const internalApiClient = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 3000, 
});


internalApiClient.interceptors.request.use(config => {
  logger.debug(`Internal call: ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

class InternalApi {
  static async get(path, token) {
    try {
      const response = await internalApiClient.get(path, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      logger.error(`Internal API Error [${path}]: ${error.message}`);
      return null; 
    }
  }
}

module.exports = InternalApi;
