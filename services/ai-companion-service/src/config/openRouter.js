const env = require('./environment');
const logger = require('./logger');

const FALLBACK_CONTENT = 'I apologize, but AI-powered responses are unavailable right now. Please try again later or contact your administrator.';
const ERROR_CONTENT = 'I am sorry, I encountered an issue connecting to the AI service. Please try again in a moment.';

async function callOpenRouter(messages, options = {}) {
  const apiKey = env.OPENROUTER_API_KEY;
  const model = env.OPENROUTER_MODEL;

  if (!apiKey || !model) {
    logger.warn('OpenRouter is not configured; returning fallback response.');
    return { content: FALLBACK_CONTENT, tokensUsed: 0, model: 'fallback' };
  }

  let url;
  try {
    const baseUrl = new URL(env.OPENROUTER_BASE_URL);
    if (!['http:', 'https:'].includes(baseUrl.protocol)) {
      throw new Error('Unsupported protocol');
    }
    url = new URL('chat/completions', `${baseUrl.toString().replace(/\/$/, '')}/`).toString();
  } catch {
    logger.error('OpenRouter request failed.', { status: 0, category: 'configuration', message: 'Invalid API base URL.' });
    return { content: ERROR_CONTENT, tokensUsed: 0, model: 'error' };
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (env.OPENROUTER_SITE_URL) headers['HTTP-Referer'] = env.OPENROUTER_SITE_URL;
  if (env.OPENROUTER_APP_NAME) headers['X-Title'] = env.OPENROUTER_APP_NAME;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.OPENROUTER_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens ?? 1000,
        temperature: options.temperature ?? 0.7,
        top_p: options.topP ?? 0.9,
        frequency_penalty: options.frequencyPenalty ?? 0,
        presence_penalty: options.presencePenalty ?? 0,
      }),
    });

    if (!response.ok) {
      logger.error('OpenRouter request failed.', {
        status: response.status,
        category: 'http',
        message: 'Provider returned a non-success status.',
      });
      return { content: ERROR_CONTENT, tokensUsed: 0, model: 'error' };
    }

    const data = await response.json();
    const choice = data.choices && data.choices[0];
    if (!choice || typeof choice.message?.content !== 'string') {
      logger.error('OpenRouter request failed.', { status: response.status, category: 'response', message: 'Provider response was incomplete.' });
      return { content: ERROR_CONTENT, tokensUsed: 0, model: 'error' };
    }

    return {
      content: choice.message.content,
      tokensUsed: data.usage?.total_tokens || 0,
      model: data.model || model,
    };
  } catch (error) {
    const timedOut = error.name === 'AbortError';
    logger.error('OpenRouter request failed.', {
      status: 0,
      category: timedOut ? 'timeout' : 'network',
      message: timedOut ? 'Request timed out.' : 'Unable to reach provider.',
    });
    return { content: ERROR_CONTENT, tokensUsed: 0, model: 'error' };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { callOpenRouter };