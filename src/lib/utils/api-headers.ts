import { base } from '$app/paths';
import { config } from '$lib/stores/settings.svelte';
import { CORS_PROXY_HEADER_PREFIX, REDACTED_HEADERS, SETTINGS_KEYS } from '$lib/constants';
import { redactValue } from './redact';

const PROVIDER_DEFAULT_BASE_URLS: Record<string, string> = {
	openrouter: 'https://openrouter.ai/api/v1',
	groq: 'https://api.groq.com/openai/v1',
	huggingface: 'https://router.huggingface.co/v1',
	together: 'https://api.together.xyz/v1',
	gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/',
	openai: 'https://api.openai.com/v1',
	anthropic: 'https://api.anthropic.com/v1',
	mistral: 'https://api.mistral.ai/v1',
	google: 'https://generativelanguage.googleapis.com/v1beta/openai/v1',
	deepseek: 'https://api.deepseek.com/v1',
	qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
	cohere: 'https://api.cohere.com/v1',
	perplexity: 'https://api.perplexity.ai',
	azure: 'https://{resource-name}.services.ai.azure.com/models',
	bedrock: '',
	nvidia: 'https://integrate.api.nvidia.com/v1',
	llamacpp: 'http://localhost:8080/v1',
	lmstudio: 'http://localhost:1234/v1',
	ollama: 'http://localhost:11434/v1',
	vllm: 'http://localhost:8000/v1',
	custom: ''
};

/**
 * Get authorization headers for API requests
 * Includes provider-specific auth headers
 */
export function getAuthHeaders(): Record<string, string> {
	const currentConfig = config();
	const providerMode = currentConfig[SETTINGS_KEYS.PROVIDER_MODE]?.toString();
	const providerName = currentConfig[SETTINGS_KEYS.PROVIDER_NAME]?.toString() || 'openrouter';
	const providerApiKey = currentConfig[SETTINGS_KEYS.PROVIDER_API_KEY]?.toString().trim();

	if (providerMode === 'openai-compatible' && providerApiKey) {
		if (providerName === 'anthropic') {
			return {
				'x-api-key': providerApiKey,
				'anthropic-version': '2023-06-01',
				'Content-Type': 'application/json'
			};
		}
		if (providerName === 'azure') {
			return { Authorization: `Bearer ${providerApiKey}` };
		}
		return { Authorization: `Bearer ${providerApiKey}` };
	}

	const apiKey = currentConfig.apiKey?.toString().trim();
	return apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
}

export function getProviderConfig() {
	const currentConfig = config();
	const providerMode = currentConfig[SETTINGS_KEYS.PROVIDER_MODE]?.toString();
	if (providerMode !== 'openai-compatible') {
		return null;
	}

	const providerName = currentConfig[SETTINGS_KEYS.PROVIDER_NAME]?.toString() || 'openrouter';
	const baseUrl = currentConfig[SETTINGS_KEYS.PROVIDER_BASE_URL]?.toString().trim();
	const apiKey = currentConfig[SETTINGS_KEYS.PROVIDER_API_KEY]?.toString().trim();
	const model = currentConfig[SETTINGS_KEYS.PROVIDER_MODEL]?.toString().trim();

	return {
		providerName,
		baseUrl: baseUrl || PROVIDER_DEFAULT_BASE_URLS[providerName] || '',
		apiKey,
		model
	};
}

export function resolveApiUrl(path: string): string {
	const providerConfig = getProviderConfig();
	if (!providerConfig) {
		const normalizedPath = path.replace(/^\.\//, '').replace(/^\/+/, '/');
		const withLeadingSlash = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
		return normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')
			? normalizedPath
			: `${base}${withLeadingSlash}`;
	}

	const { baseUrl, providerName } = providerConfig;
	const providerBase = baseUrl.replace(/\/$/, '');
	const normalizedPath = path.replace(/^\.\//, '').replace(/^\/+/, '/');

	if (providerName === 'azure') {
		const relative = normalizedPath.replace(/^\/?v1\//, '/');
		return `${providerBase}${relative.startsWith('/') ? relative : `/${relative}`}`;
	}

	if (providerName === 'bedrock') {
		const p = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
		return `${providerBase}${p}`;
	}

	if (normalizedPath.startsWith('/v1/') || normalizedPath.startsWith('v1/')) {
		const relative = normalizedPath.replace(/^\/?v1\//, '/');
		return `${providerBase}${relative.startsWith('/') ? relative : `/${relative}`}`;
	}

	const p = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
	return `${providerBase}${p}`;
}

export function getProviderBaseUrl(providerName: string): string {
	return PROVIDER_DEFAULT_BASE_URLS[providerName] || '';
}

/**
 * Get standard JSON headers with optional authorization
 */
export function getJsonHeaders(): Record<string, string> {
	return {
		'Content-Type': 'application/json',
		...getAuthHeaders()
	};
}

/**
 * Sanitize HTTP headers by redacting sensitive values.
 * Known sensitive headers (from REDACTED_HEADERS) and any extra headers
 * specified by the caller are fully redacted. Headers listed in
 * `partialRedactHeaders` are partially redacted, showing only the
 * specified number of trailing characters.
 *
 * @param headers - Headers to sanitize
 * @param extraRedactedHeaders - Additional header names to fully redact
 * @param partialRedactHeaders - Map of header name -> number of trailing chars to keep visible
 * @returns Object with header names as keys and (possibly redacted) values
 */
export function sanitizeHeaders(
	headers?: HeadersInit,
	extraRedactedHeaders?: Iterable<string>,
	partialRedactHeaders?: Map<string, number>
): Record<string, string> {
	if (!headers) {
		return {};
	}

	const normalized = new Headers(headers);
	const sanitized: Record<string, string> = {};
	const redactedHeaders = new Set(
		Array.from(extraRedactedHeaders ?? [], (header) => header.toLowerCase())
	);

	for (const [key, value] of normalized.entries()) {
		const normalizedKey = key.toLowerCase();
		const unproxiedKey = normalizedKey.startsWith(CORS_PROXY_HEADER_PREFIX)
			? normalizedKey.slice(CORS_PROXY_HEADER_PREFIX.length)
			: normalizedKey;
		const partialChars =
			partialRedactHeaders?.get(normalizedKey) ?? partialRedactHeaders?.get(unproxiedKey);

		if (partialChars !== undefined) {
			sanitized[key] = redactValue(value, partialChars);
		} else if (
			REDACTED_HEADERS.has(normalizedKey) ||
			REDACTED_HEADERS.has(unproxiedKey) ||
			redactedHeaders.has(normalizedKey) ||
			redactedHeaders.has(unproxiedKey)
		) {
			sanitized[key] = redactValue(value);
		} else {
			sanitized[key] = value;
		}
	}

	return sanitized;
}
