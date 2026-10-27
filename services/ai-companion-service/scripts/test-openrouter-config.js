process.env.NODE_ENV = 'production';

const assert = require('node:assert/strict');
const env = require('../src/config/environment');
const logger = require('../src/config/logger');
const { callOpenRouter } = require('../src/config/openRouter');

async function main() {
  assert.equal(env.OPENROUTER_BASE_URL, process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1');
  assert.equal(env.OPENROUTER_APP_NAME, process.env.OPENROUTER_APP_NAME || 'DocBridge AI Companion');
  assert.equal(env.OPENROUTER_TIMEOUT_MS, Number.parseInt(process.env.OPENROUTER_TIMEOUT_MS, 10) || 30000);
  const sentinel = 'synthetic-secret-that-must-not-be-logged';
  const original = {
    apiKey: env.OPENROUTER_API_KEY,
    model: env.OPENROUTER_MODEL,
    baseUrl: env.OPENROUTER_BASE_URL,
    fetch: global.fetch,
    error: logger.error,
  };
  const capturedLogs = [];
  logger.error = (...args) => capturedLogs.push(JSON.stringify(args));

  try {
    env.OPENROUTER_API_KEY = '';
    env.OPENROUTER_MODEL = 'provider/model-name';
    let result = await callOpenRouter([{ role: 'user', content: 'synthetic test' }]);
    assert.equal(result.model, 'fallback');

    env.OPENROUTER_API_KEY = sentinel;
    env.OPENROUTER_BASE_URL = 'invalid-url';
    result = await callOpenRouter([]);
    assert.equal(result.model, 'error');

    env.OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
    global.fetch = async () => { throw new Error(sentinel); };
    result = await callOpenRouter([]);
    assert.equal(result.model, 'error');
    assert.equal(capturedLogs.join(' ').includes(sentinel), false);

    global.fetch = async (_url, request) => {
      const body = JSON.parse(request.body);
      assert.equal(body.model, env.OPENROUTER_MODEL);
      assert.deepEqual(body.messages, [{ role: 'user', content: 'synthetic test' }]);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          model: 'provider/model-name',
          choices: [{ message: { content: 'synthetic response' } }],
          usage: { total_tokens: 9 },
        }),
      };
    };
    result = await callOpenRouter([{ role: 'user', content: 'synthetic test' }]);
    assert.deepEqual(result, { content: 'synthetic response', tokensUsed: 9, model: 'provider/model-name' });
    assert.equal(process.env.OPENROUTER_API_KEY || '', original.apiKey || '');
    console.log('OpenRouter adapter checks passed; no provider request was made.');
  } finally {
    env.OPENROUTER_API_KEY = original.apiKey;
    env.OPENROUTER_MODEL = original.model;
    env.OPENROUTER_BASE_URL = original.baseUrl;
    global.fetch = original.fetch;
    logger.error = original.error;
  }
}

main().catch((error) => {
  console.error(`OpenRouter adapter check failed: ${error.message}`);
  process.exitCode = 1;
});