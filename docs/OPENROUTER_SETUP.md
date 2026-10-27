# OpenRouter Setup

## Key and configuration

Create an OpenRouter account and API key through its official dashboard. Store the key in a password manager during local development and in the Kubernetes Secret for the trial deployment. Never commit a real key, put it in a ConfigMap, or print it in logs. The Kubernetes overlay documents the human-run Secret creation process.

Configure these variables for the AI Companion:

| Variable | Required | Value |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | Secret value; never commit it |
| `OPENROUTER_MODEL` | Yes | Exact model identifier selected in OpenRouter |
| `OPENROUTER_BASE_URL` | No | Defaults to `https://openrouter.ai/api/v1` |
| `OPENROUTER_SITE_URL` | No | Optional application URL sent as `HTTP-Referer` |
| `OPENROUTER_APP_NAME` | No | Defaults to `DocBridge AI Companion` |
| `OPENROUTER_TIMEOUT_MS` | No | Defaults to `30000` |

Choose a model by checking current availability, context limits, privacy terms, and pricing in OpenRouter immediately before deployment. Availability and pricing can change; no model is assumed to remain free.

## Safe test and operations

Run `npm test` in this service for mocked checks. It does not call OpenRouter. For a manual smoke test, use only synthetic text such as `Reply with the word test`; do not submit real medical, patient, or identifying data. Review the result as untrusted output.

Rotate a key by creating a replacement in OpenRouter, updating the Kubernetes Secret using the Kubernetes repository's Secret script, restarting the AI Companion Deployment, verifying it, and revoking the old key. Do not include Secret output in evidence.

To disable AI safely, omit `OPENROUTER_API_KEY` from the runtime Secret or scale the AI Companion Deployment to zero; the adapter returns a generic unavailable response when credentials or model configuration are missing. Confirm the application experience before using either option.

AI responses are unverified and are not medical advice. A qualified human must verify any health-related output before it is acted upon. Never send real patient records, PII, credentials, or medical history to OpenRouter for this capstone.